import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const todaySales = db.prepare(`
      SELECT COALESCE(SUM(total),0) as total
      FROM invoices
      WHERE date = date('now')
    `).get();

    const monthlyRevenue = db.prepare(`
      SELECT COALESCE(SUM(total),0) as total
      FROM invoices
      WHERE strftime('%Y-%m', date)=strftime('%Y-%m','now')
    `).get();

    const totalInvoices = db.prepare(`
      SELECT COUNT(*) as total
      FROM invoices
    `).get();

    const totalCustomers = db.prepare(`
      SELECT COUNT(*) as total
      FROM customers
    `).get();

    const totalProducts = db.prepare(`
      SELECT COUNT(*) as total
      FROM products
    `).get();

    const lowStock = db.prepare(`
      SELECT COUNT(*) as total
      FROM products
      WHERE current_stock <= low_stock_threshold
    `).get();

    const recentInvoices = db.prepare(`
      SELECT
        invoices.id,
        invoices.invoice_number,
        invoices.total,
        invoices.status,
        customers.name AS customer_name
      FROM invoices
      LEFT JOIN customers
      ON invoices.customer_id = customers.id
      ORDER BY invoices.id DESC
      LIMIT 5
    `).all();

    return NextResponse.json({
      todaySales: todaySales.total,
      monthlyRevenue: monthlyRevenue.total,
      totalInvoices: totalInvoices.total,
      totalCustomers: totalCustomers.total,
      totalProducts: totalProducts.total,
      lowStock: lowStock.total,
      recentInvoices,
    });

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}