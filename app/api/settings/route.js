import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const settings = {};
    const rows = db.prepare('SELECT key, value FROM settings').all();
    
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    // Default shop settings if none exist
    if (Object.keys(settings).length === 0) {
      return NextResponse.json({
        shop_state: 'kerala',
        shop_name: 'Billing System',
        shop_gstin: '',
        shop_address: ''
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Update or insert settings
    const upsertSetting = db.prepare(`
      INSERT INTO settings (key, value) 
      VALUES (?, ?) 
      ON CONFLICT(key) DO UPDATE SET value=excluded.value
    `);
    
    Object.entries(data).forEach(([key, value]) => {
      upsertSetting.run(key, String(value));
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
