// app/api/invoices/route.js
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const invoice = db.prepare(`
        SELECT
          invoices.*,
          customers.name as customer_name,
          customers.phone,
          customers.gstin,
          customers.state
        FROM invoices
        LEFT JOIN customers
        ON invoices.customer_id = customers.id
        WHERE invoices.id = ?
      `).get(id);

      const items = db.prepare(`
       SELECT *
         FROM invoice_items
        WHERE invoice_id = ?
      `).all(id);

      return NextResponse.json({
        ...invoice,
          items,
      });
    }

    const invoices = db.prepare(`
      SELECT
        invoices.*,
        customers.name as customer_name
      FROM invoices
      LEFT JOIN customers
      ON invoices.customer_id = customers.id
      ORDER BY invoices.id DESC
    `).all();

    return NextResponse.json(invoices);

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const data = await request.json();
  const { 
    invoiceNumber, customerId, customerName, customerState, customerGstin,
    date, due_date, subtotal, discount, cgst, sgst, igst, total, status, notes, items 
  } = data;

  // Prepare SQLite transaction wrapper
  const transaction = db.transaction(() => {
    // 1. Check & Auto-insert or Update Customer details
    let actualCustomerId = customerId;
    if (!actualCustomerId && customerName !== 'Walk-in Customer') {
      const insertCustomer = db.prepare(`
        INSERT INTO customers (name, phone, email, gstin, state) 
        VALUES (?, '0000000000', '', ?, ?)
      `);
      const info = insertCustomer.run(customerName, customerGstin || null, customerState);
      actualCustomerId = info.lastInsertRowid;
    }

    // 2. Insert Invoice Row
    const insertInvoice = db.prepare(`
      INSERT INTO invoices (invoice_number, customer_id, date, due_date, billing_state, subtotal, discount, cgst, sgst, igst, total, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const invInfo = insertInvoice.run(
      invoiceNumber, actualCustomerId, date, due_date, customerState, 
      subtotal, discount, cgst, sgst, igst, total, status, notes
    );
    const invoiceId = invInfo.lastInsertRowid;

    // 3. Process each line item: stock changes & audit ledger writes
    const insertItem = db.prepare(`
      INSERT INTO invoice_items (invoice_id, product_id, product_name, sku, hsn_code, quantity, unit_price, discount_pct, gst_rate, cgst, sgst, igst, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const updateStock = db.prepare(`
      UPDATE products 
      SET current_stock = current_stock - ? 
      WHERE id = ?
    `);
    const insertLedger = db.prepare(`
      INSERT INTO stock_ledger (product_id, change_type, quantity, reference_id, notes) 
      VALUES (?, 'SALE', ?, ?, ?)
    `);

    for (const item of items) {
      // Get current product state (validate stock availability)
      const product = db.prepare("SELECT current_stock, name FROM products WHERE id = ?").get(item.product_id);
      
      if (!product) throw new Error(`Product ID ${item.product_id} not found.`);
      if (product.current_stock < item.quantity) {
        throw new Error(`Insufficient stock for item: ${product.name}. Required: ${item.quantity}, Available: ${product.current_stock}`);
      }

      // Execute insert item lines
      insertItem.run(
        invoiceId, item.product_id, item.name, item.sku, item.hsn_code, 
        item.quantity, item.price, item.discountPct, item.gstRate, 
        item.cgst, item.sgst, item.igst, item.total
      );

      // Decrement Inventory levels
      updateStock.run(item.quantity, item.product_id);

      // Audit Ledger tracking
      insertLedger.run(item.product_id, -item.quantity, invoiceId, `Sale Invoice #${invoiceNumber}`);
    }

    return invoiceId;
  });

  try {
    const invoiceId = transaction();
    return NextResponse.json({ success: true, invoiceId });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}