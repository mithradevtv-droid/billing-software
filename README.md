# BillMate Pro

A modern GST Billing, Inventory Management, Customer Management, Purchase Tracking, and Business Reporting System built with Next.js, Supabase, TypeScript, and Tailwind CSS.

BillMate Pro is designed for small and medium-sized businesses that require a fast, professional, and easy-to-use billing platform with GST support, inventory tracking, customer management, supplier management, purchase management, payment tracking, and business analytics.

---

## Features

### GST Billing & Invoicing

- GST-compliant invoice generation
- Professional invoice templates
- PDF invoice export
- Invoice printing
- Invoice sharing
- Auto invoice numbering
- Partial payment support
- Paid, Partial, and Unpaid invoice tracking
- Real-time tax calculations
- Outstanding balance tracking

### Inventory Management

- Product management
- Product image upload
- SKU management
- Stock quantity tracking
- Low stock alerts
- Purchase price tracking
- Selling price management
- GST rate configuration
- Inventory reports

### Customer Management

- Customer database
- Customer contact management
- GSTIN support
- Customer purchase history
- Customer invoice history
- Outstanding payment tracking

### Supplier Management

- Supplier database
- Supplier contact details
- Supplier purchase tracking
- Purchase history management

### Purchase Management

- Purchase order creation
- Purchase editing
- Purchase deletion
- Stock auto-update on purchase
- Supplier-wise purchases
- Purchase reports

### Payment Management

- Invoice payment recording
- Partial payment tracking
- Full payment tracking
- Payment history
- Outstanding balance calculations
- Multiple payment methods

### Reports & Analytics

- Sales Reports
- Purchase Reports
- Inventory Reports
- Customer Reports
- Supplier Reports
- GST Summary Reports
- HSN Summary Reports
- Revenue Insights

### Business Settings

- Business profile management
- GSTIN configuration
- State selection
- Logo upload
- Invoice prefix customization
- Tax configuration

### Authentication & Security

- Secure authentication with Supabase
- Protected routes
- Role-based access policies
- Secure session handling
- Account management

---

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Lucide React

### Backend

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Storage

### Development Tools

- ESLint
- Turbopack
- Git
- GitHub

---

## Screenshots

## Screenshots

| Dashboard | Billing |
|-----------|----------|
| ![](screenshots/dashboard.png) | ![](screenshots/billing.png) |

| Inventory | Reports |
|-----------|---------|
| ![](screenshots/inventory.png) | ![](screenshots/reports.png) |

---

## Project Structure

```text
app/
├── (auth)/
├── (dashboard)/
│   ├── billing/
│   ├── invoices/
│   ├── customers/
│   ├── products/
│   ├── suppliers/
│   ├── purchases/
│   ├── payments/
│   ├── reports/
│   └── settings/
│
components/
├── billing/
├── customers/
├── invoices/
├── layout/
├── payments/
├── products/
├── purchases/
├── reports/
├── settings/
└── suppliers/
│
lib/
├── supabase/
├── db.ts
├── db-client.ts
└── utils.ts
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/mithradevtv-droid/billing-software.git
cd billing-software
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

### Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Database

BillMate Pro uses Supabase PostgreSQL for:

- Shops
- Customers
- Suppliers
- Products
- Invoices
- Invoice Items
- Purchase Orders
- Purchase Items
- Payments
- Stock Ledger

---

## Core Modules

### Dashboard

Provides a complete overview of:

- Revenue
- Sales
- Inventory
- Customers
- Purchases
- Payments
- Recent Activities

### Billing Terminal

Fast POS-style billing system with:

- Product search
- Product images
- Cart management
- GST calculation
- Payment handling
- Invoice generation

### Inventory

Manage:

- Products
- Stock levels
- Pricing
- GST rates
- Product images

### Payments

Track:

- Paid invoices
- Partial payments
- Outstanding invoices
- Payment history

### Reports

Generate:

- Sales Reports
- Purchase Reports
- Inventory Reports
- GST Reports
- HSN Reports

---

## Deployment

### Vercel

```bash
npm run build
```

Deploy to:

- Vercel
- Netlify
- Railway

Recommended:

- Frontend: Vercel
- Backend: Supabase

---

## Future Improvements

- Barcode Scanner Integration
- Thermal Printer Support
- WhatsApp Invoice Sharing
- Email Invoice Delivery
- Multi-user Roles
- Multi-store Support
- Mobile Application
- Advanced Analytics
- GST Filing Assistance

---

## Known Limitations

- Single business per account
- No offline mode
- No barcode support yet
- No thermal printer integration yet
- Mobile experience can be improved

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Add feature"
```

4. Push branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Author

### Mithradev

B.Tech Computer Science & Engineering (Artificial Intelligence)

College of Engineering Trikaripur

GitHub: https://github.com/mithradevtv-droid

---

## Support

If you find this project useful:

⭐ Star the repository

🍴 Fork the repository

🚀 Share your feedback

---

Built with Next.js, Supabase, TypeScript, React, and Tailwind CSS.