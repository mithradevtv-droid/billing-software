// components/PrintableInvoice.js
import React from 'react';

export default function PrintableInvoice({ shopSettings, invoice, items }) {
  const isIntraState = shopSettings.shop_state.toLowerCase() === invoice.billing_state.toLowerCase();

  return (
    <div className="print-invoice-page">
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{shopSettings.shop_name}</h2>
          <p>{shopSettings.shop_address}</p>
          <p>Phone: {shopSettings.shop_phone}</p>
          <p><strong>GSTIN: {shopSettings.shop_gstin}</strong></p>
          <p>State: {shopSettings.shop_state}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ fontSize: '24px', color: '#333' }}>TAX INVOICE</h1>
          <p>Invoice No: <strong>{invoice.invoice_number}</strong></p>
          <p>Date: {invoice.date}</p>
          <p>Payment Mode: Cash / Cards</p>
        </div>
      </div>

      {/* Bill To Customer Information */}
      <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '20px' }}>
        <h4 style={{ borderBottom: '1px solid #000', paddingBottom: '5px', marginBottom: '5px' }}>Billed To:</h4>
        <p>Customer Name: <strong>{invoice.customerName || 'Walk-in Customer'}</strong></p>
        <p>Billing State: {invoice.customerState}</p>
        {invoice.customerGstin && <p>Customer GSTIN: <strong>{invoice.customerGstin}</strong></p>}
      </div>

      {/* Line Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }} border="1" cellPadding="5">
        <thead>
          <tr style={{ background: '#f2f2f2' }}>
            <th>#</th>
            <th>Description</th>
            <th>HSN</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Disc%</th>
            <th>Taxable Val</th>
            {isIntraState ? (
              <>
                <th>CGST (Rate/Amt)</th>
                <th>SGST (Rate/Amt)</th>
              </>
            ) : (
              <th>IGST (Rate/Amt)</th>
            )}
            <th>Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.name}</td>
              <td>{item.hsn_code}</td>
              <td>{item.quantity}</td>
              <td>₹{item.price}</td>
              <td>{item.discountPct}%</td>
              <td>₹{item.taxableValue}</td>
              {isIntraState ? (
                <>
                  <td>{(item.gstRate / 2)}%<br/>₹{item.cgst}</td>
                  <td>{(item.gstRate / 2)}%<br/>₹{item.sgst}</td>
                </>
              ) : (
                <td>{item.gstRate}%<br/>₹{item.igst}</td>
              )}
              <td>₹{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <p><strong>Terms & Conditions:</strong></p>
          <p style={{ fontSize: '10px' }}>1. Goods once sold will not be taken back.</p>
          <p style={{ fontSize: '10px' }}>2. Subject to local state jurisdiction rules.</p>
        </div>
        <div style={{ width: '250px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }} border="0" cellPadding="4">
            <tbody>
              <tr>
                <td>Subtotal</td>
                <td style={{ textAlign: 'right' }}>₹{invoice.subtotal}</td>
              </tr>
              {invoice.discount > 0 && (
                <tr style={{ color: 'red' }}>
                  <td>Discount</td>
                  <td style={{ textAlign: 'right' }}>-₹{invoice.discount}</td>
                </tr>
              )}
              {invoice.cgst > 0 && (
                <>
                  <tr>
                    <td>Total CGST</td>
                    <td style={{ textAlign: 'right' }}>₹{invoice.cgst}</td>
                  </tr>
                  <tr>
                    <td>Total SGST</td>
                    <td style={{ textAlign: 'right' }}>₹{invoice.sgst}</td>
                  </tr>
                </>
              )}
              {invoice.igst > 0 && (
                <tr>
                  <td>Total IGST</td>
                  <td style={{ textAlign: 'right' }}>₹{invoice.igst}</td>
                </tr>
              )}
              <tr style={{ borderTop: '2px double #000', fontSize: '16px', fontWeight: 'bold' }}>
                <td>Grand Total</td>
                <td style={{ textAlign: 'right' }}>₹{invoice.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Signatures */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px' }}>
        <div>
          <p>Customer Signature</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p>For <strong>{shopSettings.shop_name}</strong></p>
          <br/><br/>
          <p>Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}