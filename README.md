# BillMate

A modern GST Billing, Inventory Management, and Business Operations platform built for Indian businesses.

BillMate helps small and medium-sized businesses manage products, inventory, customers, suppliers, invoices, taxation, and stock movement through a clean and efficient web-based system.

---

## Overview

BillMate is a full-stack business management application designed to streamline day-to-day operations including:

- GST-compliant invoicing
- Inventory and stock management
- Product catalog management
- Customer and supplier management
- Stock movement tracking
- Business analytics and reporting

The platform is built using modern web technologies with a focus on performance, scalability, and user experience.

---

## Key Features

### Authentication & Security

- Secure authentication using Supabase Auth
- Protected application routes
- Password reset functionality
- Row-Level Security (RLS)

### Dashboard

- Sales overview
- Revenue tracking
- Low stock monitoring
- Inventory insights
- Recent invoice activity

### Product Management

- Product catalog
- SKU management
- Barcode support
- HSN code support
- Product categorization
- Product image uploads
- Product search and filtering

### Inventory Management

- Real-time stock tracking
- Stock adjustment system
- Stock movement ledger
- Low stock alerts
- Inventory monitoring dashboard

### Customer Management

- Customer database
- GSTIN support
- State-wise GST handling
- Contact management

### Supplier Management

- Supplier database
- GST information tracking
- Contact and address management

### GST Billing System

- GST-compliant invoices
- CGST, SGST, and IGST calculations
- Interstate and intrastate billing
- Invoice status management
- Payment tracking

### Invoice Management

- Create invoices
- View invoice details
- Track payment status
- Invoice history
- Itemized billing

---

## Technology Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Radix UI
- Lucide Icons

### Backend

- Supabase
- PostgreSQL
- Supabase Storage
- Supabase Authentication

### Infrastructure

- Row-Level Security (RLS)
- Cloud Storage
- Real-Time Database

---

## System Architecture

```text
BillMate
│
├── Authentication
├── Dashboard
├── Products
├── Inventory
├── Customers
├── Suppliers
├── Invoices
├── Stock Ledger
└── Reporting
```

---

## Database Schema

### Core Entities

```text
shops
customers
suppliers
products
invoices
invoice_items
stock_ledger
```

### Inventory Flow

```text
Product Creation
       │
       ▼
Stock Added
       │
       ▼
Invoice Generated
       │
       ▼
Stock Deducted
       │
       ▼
Ledger Updated
```

---

## Product Images

BillMate supports product image management using Supabase Storage.

Features include:

- Product thumbnails
- Cloud image storage
- Public image delivery
- Inventory visualization

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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Development Server

```bash
npm run dev
```

Application will be available at:

```text
http://localhost:3000
```

---

## Project Structure

```text
app/
components/
lib/
public/

├── Authentication
├── Dashboard
├── Products
├── Customers
├── Suppliers
├── Billing
├── Inventory
└── Reports
```

---

## Current Development Status

### Completed

- Authentication System
- Dashboard
- GST Billing Engine
- Product Management
- Inventory Tracking
- Stock Adjustment Module
- Product Image Uploads
- Customer Management
- Invoice Management
- Stock Ledger

### In Progress

- Supplier Management Module
- Purchase Entry System
- Purchase History Tracking

### Planned

- Customer Ledger
- Supplier Ledger
- Expense Management
- Profit & Loss Reports
- Barcode Scanner Integration
- WhatsApp Invoice Sharing
- Advanced Business Analytics
- Multi-Shop Support

---

## Version

```text
Current Version: v0.4.0
Development Stage: Active
```

---

## Author

**Mithradev**

B.Tech CSE (Artificial Intelligence)  
College of Engineering Trikaripur

GitHub:
https://github.com/mithradevtv-droid

---

## License

This project is developed for educational, learning, and business management purposes.

All rights reserved.