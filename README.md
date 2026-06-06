# LedgerOne - GST Billing System

A comprehensive GST-compliant invoicing, inventory, and customer management system built with Next.js 16, React 19, and SQLite.

## 📋 Features

### ✅ Core Modules

- **Billing Terminal** - Create and process invoices with real-time GST calculations
- **GST Compliance** - Automatic CGST/SGST vs IGST calculation based on customer state
- **Inventory Management** - Track stock levels and product details with HSN codes
- **Customer Database** - Manage customer information with state-wise tracking
- **GSTR1 Reports** - Generate GST return documents for compliance
- **Shop Settings** - Configure business details and tax parameters

### 🎯 Key Capabilities

- **Real-time GST Calculation** - Handles intra-state (CGST/SGST) and inter-state (IGST) transactions
- **Stock Management** - Automatic stock deduction on invoice generation with audit trail
- **Multi-state Support** - Support for all Indian states with proper tax calculation
- **Invoice Printing** - Built-in A4 thermal printer layout for receipts
- **Keyboard Shortcuts** - F2 to search products, F8 to submit invoice
- **Database Persistence** - SQLite for reliable local data storage

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Better-SQLite3 (included in dependencies)

### Installation

```bash
# Clone the repository
cd billing-system

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
billing-system/
├── app/
│   ├── page.tsx              # Home dashboard
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── billing/
│   │   └── page.js           # Billing terminal (5 tabs)
│   └── api/
│       ├── settings/         # Shop settings API
│       ├── products/         # Inventory API
│       ├── customers/        # Customer data API
│       └── invoices/         # Invoice processing API
├── lib/
│   ├── db.js                 # SQLite database setup
│   └── gstCalculator.js      # GST calculation logic
├── comp/
│   └── printableinvoice.js   # Invoice print template
├── public/                   # Static assets
└── billing.db                # SQLite database file
```

## 🗂️ Billing Page Tabs

### 1. **Billing** (Default)
   - Add products to cart with quantity and discount
   - Select customers or create walk-in transactions
   - Real-time GST breakdown (CGST/SGST or IGST)
   - Payment status tracking
   - Print invoice with F8 or button

### 2. **Reports**
   - GSTR1 tax return documents
   - Monthly GST summary by customer
   - B2B and B2C taxable value breakdown
   - Tax collection analysis

### 3. **Inventory**
   - View all products with stock levels
   - HSN codes and tax rates
   - Product search and filtering
   - Edit product details

### 4. **Customers**
   - Customer master data
   - GSTIN and state information
   - Contact details
   - Edit customer records

### 5. **Settings**
   - Shop name and GSTIN configuration
   - Default shop state
   - Tax settings

## 🗄️ Database Schema

### Tables

- **products** - Inventory items with pricing and tax rates
- **customers** - Customer master records
- **invoices** - Invoice headers and metadata
- **invoice_items** - Line items for each invoice
- **stock_ledger** - Stock movement audit trail
- **settings** - Configuration parameters
- **suppliers** - Supplier management (optional)

## 🔌 API Endpoints

### Settings
- `GET /api/settings` - Fetch shop settings
- `POST /api/settings` - Update shop settings

### Products
- `GET /api/products` - List all products
- `GET /api/products?id=<id>` - Get single product
- `GET /api/products?search=<query>` - Search products
- `POST /api/products` - Create product
- `PUT /api/products` - Update product

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers?id=<id>` - Get single customer
- `GET /api/customers?search=<query>` - Search customers
- `POST /api/customers` - Create customer
- `PUT /api/customers` - Update customer

### Invoices
- `POST /api/invoices` - Generate new invoice with items and stock management

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F2` | Focus product search input |
| `F8` | Submit invoice and print |

## 🎨 Technology Stack

- **Frontend**: React 19, Next.js 16, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **Icons**: Lucide React
- **Styling**: CSS Grid, Flexbox, CSS Variables

## 📊 Sample Data

The database comes pre-populated with:
- 6 products with various tax rates
- 3 sample customers
- Shop configured for Maharashtra

## 🛠️ Configuration

### Environment Variables

Create a `.env.local` file if needed:

```bash
# Default values are set in code
# Customize as needed
```

### Database Location

SQLite database is stored at: `<project-root>/billing.db`

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Database Locked
```bash
# Remove and recreate database
rm billing.db
npm run dev
```

### Products Not Loading
- Verify `/api/products` returns data
- Check database file exists at `billing.db`
- Ensure better-sqlite3 is installed correctly

## 📝 License

This project is provided as-is for GST-compliant billing operations.

## 🤝 Contributing

For bug reports or feature requests, please contact the development team.

---

**Last Updated**: June 2026  
**Version**: 1.0.0
