import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const id = searchParams.get('id');
    
    let query = 'SELECT * FROM products';
    let params = [];
    
    if (id) {
      query += ' WHERE id = ?';
      params = [id];
      const product = db.prepare(query).get(...params);
      return NextResponse.json(product || {});
    }
    
    if (search) {
      query += ' WHERE name ILIKE ? OR sku ILIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }
    
    query += ' ORDER BY name ASC';
    const products = db.prepare(query).all(...params);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const {
      sku, name, hsn_code, category, purchase_price,
      selling_price, gst_rate, current_stock, low_stock_threshold
    } = data;
    
    const insert = db.prepare(`
      INSERT INTO products (sku, name, hsn_code, category, purchase_price, selling_price, gst_rate, current_stock, low_stock_threshold)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = insert.run(
      sku, name, hsn_code, category || null,
      purchase_price || 0, selling_price || 0,
      gst_rate || 18, current_stock || 0,
      low_stock_threshold || 5
    );
    
    return NextResponse.json({ id: info.lastInsertRowid, success: true }, { status: 201 });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }
    
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    const update = db.prepare(`UPDATE products SET ${setClause} WHERE id = ?`);
    update.run(...values, id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Products PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
