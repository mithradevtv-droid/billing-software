import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const id = searchParams.get('id');
    
    let query = 'SELECT * FROM customers';
    let params = [];
    
    if (id) {
      query += ' WHERE id = ?';
      params = [id];
      const customer = db.prepare(query).get(...params);
      return NextResponse.json(customer || {});
    }
    
    if (search) {
      query += ' WHERE name ILIKE ? OR gstin ILIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }
    
    query += ' ORDER BY name ASC';
    const customers = db.prepare(query).all(...params);
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Customers GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, phone, email, gstin, address, state } = data;
    
    const insert = db.prepare(`
      INSERT INTO customers (name, phone, email, gstin, address, state)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const info = insert.run(name, phone || '', email || '', gstin || null, address || '', state);
    return NextResponse.json({ id: info.lastInsertRowid, success: true }, { status: 201 });
  } catch (error) {
    console.error('Customers POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }
    
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    const update = db.prepare(`UPDATE customers SET ${setClause} WHERE id = ?`);
    update.run(...values, id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Customers PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");

    db.prepare(
      "DELETE FROM customers WHERE id=?"
    ).run(id);

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );

  }
}