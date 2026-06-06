// app/billing/page.js
'use client';
import { useState, useEffect, useRef } from 'react';
import { calculateLineItem, calculateInvoiceTotals } from '@/lib/gstCalculator';
import { Search, User, CreditCard, ShieldCheck, Printer, Trash, Settings, Package, BarChart3 } from 'lucide-react';

export default function BillingTerminal() {
  const [activeTab, setActiveTab] = useState('billing');
  const [shopSettings, setShopSettings] = useState({ shop_state: 'Kerala', shop_name: '', shop_gstin: '' });
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  // Selected billing targets
  const [selectedCustomer, setSelectedCustomer] = useState({ id: '', name: 'Walk-in Customer', state: 'Kerala', gstin: '' });
  const [cart, setCart] = useState([]);
  
  // Invoice Metadata
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Paid');

  // Input bindings
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [custResults, setCustResults] = useState([]);

  const qtyInputRef = useRef({});

  // Listen for hash changes to switch tabs
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'billing';
      setActiveTab(hash);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Set initial tab
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Keyboard Event Handlers for Quick Checkouts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        document.getElementById('product-search-input')?.focus();
      }
      if (e.key === 'F8') {
        e.preventDefault();
        submitInvoice();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, selectedCustomer]);

  // Load Initial Settings & Products
  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => setShopSettings(data));
    fetch('/api/products').then(res => res.json()).then(data => setProducts(data));
    fetch('/api/customers').then(res => res.json()).then(data => setCustomers(data));
    setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
  }, []);

  // Search Products Handler
  const handleProductSearch = (query) => {
    setProductSearch(query);
    if (!query) {
      setSearchResults([]);
      return;
    }
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.sku.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  // Add Item to Bill Cart
  const addToCart = (product) => {
    const existingIndex = cart.findIndex(item => item.product_id === product.id);
    
    if (product.current_stock <= 0) {
      alert("Warning: Out of Stock!");
    }

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      recalculateCart(updated);
    } else {
      const newItem = {
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        hsn_code: product.hsn_code,
        price: product.selling_price,
        quantity: 1,
        discountPct: 0,
        gstRate: product.gst_rate
      };
      recalculateCart([...cart, newItem]);
    }
    setProductSearch('');
    setSearchResults([]);
  };

  const updateCartQuantity = (index, qty) => {
    const updated = [...cart];
    updated[index].quantity = parseFloat(qty) || 0;
    recalculateCart(updated);
  };

  const updateCartDiscount = (index, discount) => {
    const updated = [...cart];
    updated[index].discountPct = parseFloat(discount) || 0;
    recalculateCart(updated);
  };

  const removeFromCart = (index) => {
    const updated = cart.filter((_, i) => i !== index);
    recalculateCart(updated);
  };

  const recalculateCart = (updatedCart) => {
    const calculated = updatedCart.map(item => {
      const calculations = calculateLineItem(
        item,
        selectedCustomer.state,
        shopSettings.shop_state
      );
      return calculations;
    });
    setCart(calculated);
  };

  const totals = calculateInvoiceTotals(cart, selectedCustomer.state, shopSettings.shop_state);

  // Submit Invoice API Call
  const submitInvoice = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    const payload = {
      invoiceNumber,
      customerId: selectedCustomer.id || null,
      customerName: selectedCustomer.name,
      customerState: selectedCustomer.state,
      customerGstin: selectedCustomer.gstin,
      date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: totals.subtotal,
      discount: totals.discount,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      total: totals.total,
      status: paymentStatus,
      notes,
      items: cart
    };

    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert("Invoice Generated Successfully!");
      window.print(); // Triggers the custom A4 printer layout
      setCart([]);
      setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
    } else {
      alert("Failed to submit transaction.");
    }
  };

  return (
    <>
      {/* TAB NAVIGATION */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #d7dee8', padding: '1rem', marginBottom: '1rem', flexWrap: 'wrap', backgroundColor: '#ffffff' }}>
        {['billing', 'reports', 'inventory', 'customers', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => window.location.hash = tab === 'billing' ? '' : tab}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === tab ? '#2563eb' : '#f5f7fa',
              color: activeTab === tab ? '#ffffff' : '#172033',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* BILLING TAB */}
      {activeTab === 'billing' && (
    <div className="pos-grid">
      {/* LEFT PORT: Items Cart & Search */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} size={18} />
            <input
              id="product-search-input"
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search product name or scan SKU... [F2]"
              value={productSearch}
              onChange={(e) => handleProductSearch(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute', left: 0, right: 0, top: '100%', 
                background: 'var(--bg-deep)', border: '1px solid var(--border-glow)',
                borderRadius: 8, zIndex: 10, maxHeight: 200, overflowY: 'auto'
              }}>
                {searchResults.map(p => (
                  <div 
                    key={p.id} 
                    style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }}
                    onClick={() => addToCart(p)}
                  >
                    <strong>{p.name}</strong> - SKU: {p.sku} | Price: ₹{p.selling_price} | Stock: {p.current_stock}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Billing Cart Table */}
        <table className="custom-table">
          <thead>
            <tr>
              <th>Item Details</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Disc%</th>
              <th>GST%</th>
              <th>Total Tax</th>
              <th>Final (₹)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, index) => (
              <tr key={index}>
                <td>
                  <strong>{item.name}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    SKU: {item.sku} | HSN: {item.hsn_code}
                  </div>
                </td>
                <td>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: 60, padding: '0.4rem' }}
                    value={item.quantity}
                    onChange={(e) => updateCartQuantity(index, e.target.value)}
                  />
                </td>
                <td>₹{item.price}</td>
                <td>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: 50, padding: '0.4rem' }}
                    value={item.discountPct}
                    onChange={(e) => updateCartDiscount(index, e.target.value)}
                  />
                </td>
                <td>{item.gstRate}%</td>
                <td>₹{((item.cgst || 0) + (item.sgst || 0) + (item.igst || 0)).toFixed(2)}</td>
                <td>₹{(item.total || 0).toFixed(2)}</td>
                <td>
                  <button onClick={() => removeFromCart(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)' }}>
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RIGHT PORT: Billing Registry & Payments Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Customer State Checker */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <User size={18} color="var(--accent-cyan)" /> Customer Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Customer Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={selectedCustomer.name}
                onChange={(e) => {
                  const updated = { ...selectedCustomer, name: e.target.value };
                  setSelectedCustomer(updated);
                  recalculateCart(cart);
                }} 
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Billing State</label>
                <select 
                  className="form-input"
                  value={selectedCustomer.state}
                  onChange={(e) => {
                    const updated = { ...selectedCustomer, state: e.target.value };
                    setSelectedCustomer(updated);
                    // Recalculates CGST/SGST vs IGST automatically on State Change
                    const updatedCart = cart.map(item => {
                      const calculations = calculateLineItem(
                        item,
                        e.target.value,
                        shopSettings.shop_state
                      );
                      return calculations;
                    });
                    setCart(updatedCart);
                  }}
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  {/* Add all other states */}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>GSTIN (Optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={selectedCustomer.gstin}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, gstin: e.target.value })}
                  placeholder="27..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* GST & Totals Summary Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <CreditCard size={18} color="var(--accent-purple)" /> Payment Summary
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Taxable Subtotal</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-red)' }}>
              <span>Discount</span>
              <span>-₹{totals.discount.toFixed(2)}</span>
            </div>
            {totals.cgst > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>CGST (Central Tax)</span>
                  <span>₹{totals.cgst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>SGST (State Tax)</span>
                  <span>₹{totals.sgst.toFixed(2)}</span>
                </div>
              </>
            )}
            {totals.igst > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>IGST (Integrated Tax)</span>
                <span>₹{totals.igst.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            <span>Grand Total</span>
            <span style={{ color: 'var(--accent-cyan)' }}>₹{totals.total}</span>
          </div>

          <button className="btn-glow" style={{ width: '100%' }} onClick={submitInvoice}>
            <Printer size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Complete & Print Invoice [F8]
          </button>
        </div>
      </div>
    </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>GSTR1 Reports</h2>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <p style={{ marginBottom: '1rem' }}>Period: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</p>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>GSTIN</th>
                  <th>Taxable Value</th>
                  <th>CGST</th>
                  <th>SGST</th>
                  <th>IGST</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No invoices in this period</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Inventory Management</h2>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                placeholder="Search products..." 
                className="form-input"
                style={{ marginBottom: '1rem' }}
              />
            </div>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>HSN Code</th>
                  <th>Current Stock</th>
                  <th>Selling Price</th>
                  <th>GST Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No products found</td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id}>
                      <td>{product.sku}</td>
                      <td>{product.name}</td>
                      <td>{product.hsn_code}</td>
                      <td>{product.current_stock}</td>
                      <td>₹{product.selling_price}</td>
                      <td>{product.gst_rate}%</td>
                      <td>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)' }}>Edit</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Customers</h2>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                placeholder="Search customers..." 
                className="form-input"
                style={{ marginBottom: '1rem' }}
              />
            </div>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>GSTIN</th>
                  <th>State</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No customers found</td>
                  </tr>
                ) : (
                  customers.map(customer => (
                    <tr key={customer.id}>
                      <td>{customer.name}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.email}</td>
                      <td>{customer.gstin}</td>
                      <td>{customer.state}</td>
                      <td>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)' }}>Edit</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div style={{ padding: '2rem', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Shop Settings</h2>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Shop Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={shopSettings.shop_name || ''}
                  onChange={(e) => setShopSettings({ ...shopSettings, shop_name: e.target.value })}
                  placeholder="Enter shop name"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>GSTIN</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={shopSettings.shop_gstin || ''}
                  onChange={(e) => setShopSettings({ ...shopSettings, shop_gstin: e.target.value })}
                  placeholder="27AAAAA1111A1Z1"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Shop State</label>
                <select 
                  className="form-input"
                  value={shopSettings.shop_state || 'kerala'}
                  onChange={(e) => setShopSettings({ ...shopSettings, shop_state: e.target.value })}
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Kerala">Kerala</option>
                </select>
              </div>
              <button className="btn-glow" style={{ width: '100%', marginTop: '1rem' }}>
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}