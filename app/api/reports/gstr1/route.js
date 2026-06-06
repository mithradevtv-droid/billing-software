// app/api/reports/gstr1/route.js
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // 1. Get B2B Sales (Transactions with customers who have a GSTIN)
    const b2bInvoices = db.prepare(`
      SELECT 
        i.invoice_number, 
        i.date, 
        c.name as customer_name, 
        c.gstin as customer_gstin, 
        i.billing_state as place_of_supply,
        i.subtotal as taxable_value,
        i.cgst, 
        i.sgst, 
        i.igst, 
        i.total as invoice_value
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE c.gstin IS NOT NULL AND c.gstin != ''
    `).all();

    // 2. Get B2C Sales (Transactions with customers without a GSTIN)
    const b2cInvoices = db.prepare(`
      SELECT 
        i.invoice_number, 
        i.date, 
        COALESCE(c.name, 'Walk-in Customer') as customer_name,
        i.billing_state as place_of_supply,
        i.subtotal as taxable_value,
        i.cgst, 
        i.sgst, 
        i.igst, 
        i.total as invoice_value
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE c.gstin IS NULL OR c.gstin = ''
    `).all();

    // 3. Sum up tax collections
    const totals = db.prepare(`
      SELECT 
        SUM(subtotal) as total_taxable_value,
        SUM(cgst) as total_cgst,
        SUM(sgst) as total_sgst,
        SUM(igst) as total_igst,
        SUM(total) as total_sales_value
      FROM invoices
    `).get();

    return NextResponse.json({
      success: true,
      b2b: b2bInvoices,
      b2c: b2cInvoices,
      summary: totals
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}