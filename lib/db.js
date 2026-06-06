// lib/db.js
import Database from 'better-sqlite3';
import path from 'path';

// Use persistent disk path in production (Render), local path in development
const dbPath = process.env.NODE_ENV === 'production' && process.env.RENDER
  ? '/opt/render/project/src/billing.db'
  : path.resolve(process.cwd(), 'billing.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize DB Tables
db.exec(`
  -- Shop Settings Table
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  -- Products (Inventory) Table
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    hsn_code TEXT NOT NULL,
    category TEXT,
    purchase_price REAL DEFAULT 0.0,
    selling_price REAL DEFAULT 0.0,
    gst_rate REAL DEFAULT 18.0, -- percentage (e.g. 5, 12, 18, 28)
    current_stock REAL DEFAULT 0.0,
    low_stock_threshold REAL DEFAULT 5.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Customers Table
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    gstin TEXT, -- GST Identification Number
    address TEXT,
    state TEXT NOT NULL, -- critical for CGST/SGST vs IGST calculation
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Suppliers Table
  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    gstin TEXT,
    address TEXT,
    state TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Invoices (Sales Bills) Table
  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER,
    date DATE NOT NULL,
    due_date DATE,
    billing_state TEXT NOT NULL, -- Shop state vs Customer state determines tax
    subtotal REAL NOT NULL,
    discount REAL DEFAULT 0.0,
    cgst REAL DEFAULT 0.0,
    sgst REAL DEFAULT 0.0,
    igst REAL DEFAULT 0.0,
    total REAL NOT NULL,
    status TEXT CHECK(status IN ('Paid', 'Unpaid', 'Partially Paid')) DEFAULT 'Unpaid',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES customers(id)
  );

  -- Invoice Items Table (Line Items)
  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    sku TEXT,
    hsn_code TEXT,
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    discount_pct REAL DEFAULT 0.0,
    gst_rate REAL NOT NULL,
    cgst REAL DEFAULT 0.0,
    sgst REAL DEFAULT 0.0,
    igst REAL DEFAULT 0.0,
    total REAL NOT NULL,
    FOREIGN KEY(invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  -- Stock Ledger (Audit Trail)
  CREATE TABLE IF NOT EXISTS stock_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    change_type TEXT CHECK(change_type IN ('SALE', 'PURCHASE', 'ADJUSTMENT')) NOT NULL,
    quantity REAL NOT NULL, -- negative for sales, positive for purchases/adjustments
    reference_id INTEGER, -- invoice_id or purchase_id
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

// Insert default settings if not exists
const checkSettings = db.prepare("SELECT COUNT(*) as count FROM settings").get();
if (checkSettings.count === 0) {
  const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
  insertSetting.run("shop_name", "probes");
  insertSetting.run("shop_gstin", "27AAAAA1111A1Z1"); // Maharashtra Mock GSTIN
  insertSetting.run("shop_state", "kerala");
  insertSetting.run("shop_address", "college of engineering,trikaripur,kasaragod,kerala");
  insertSetting.run("shop_phone", "+91 96333 89027 ");
}

const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get();
if (productCount.count === 0) {
  const insertProduct = db.prepare(`
    INSERT INTO products (
      sku, name, hsn_code, category, purchase_price, selling_price, gst_rate, current_stock, low_stock_threshold
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  [
    ["QE-POS-001", "POS billing terminal", "8471", "Billing Hardware", 18400, 24500, 18, 12, 3],
    ["QE-SCN-014", "USB barcode scanner", "8471", "Billing Hardware", 1650, 2350, 18, 18, 5],
    ["QE-PRN-020", "Thermal receipt printer", "8443", "Printing", 5200, 7400, 18, 9, 3],
    ["QE-ROLL-080", "Thermal printer roll pack", "4811", "Consumables", 210, 360, 12, 42, 12],
    ["QE-CASH-005", "POS cash drawer", "8303", "Billing Hardware", 2650, 3900, 18, 6, 2],
    ["QE-SVC-001", "Billing setup service", "9983", "Service", 0, 2500, 18, 999, 0],
  ].forEach((product) => insertProduct.run(...product));
}

const customerCount = db.prepare("SELECT COUNT(*) as count FROM customers").get();
if (customerCount.count === 0) {
  const insertCustomer = db.prepare(`
    INSERT INTO customers (name, phone, email, gstin, address, state)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  [
    [
      "Urban Retail Co.",
      "9876500011",
      "accounts@urbanretail.example",
      "27AAACU1234A1Z6",
      "Andheri East, Mumbai",
      "Maharashtra",
    ],
    [
      "Mira Devices",
      "9876500022",
      "billing@miradevices.example",
      "29AAECM5678B1Z2",
      "Indiranagar, Bengaluru",
      "Karnataka",
    ],
    [
      "R K Traders",
      "9876500033",
      "",
      "",
      "Surat Textile Market",
      "Gujarat",
    ],
  ].forEach((customer) => insertCustomer.run(...customer));
}

export default db;
