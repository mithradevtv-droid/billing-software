export function roundMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function isIntraState(customerState, shopState) {
  return String(customerState || "")
    .trim()
    .toLowerCase() === String(shopState || "").trim().toLowerCase();
}

export function calculateLineItem(item, customerState, shopState) {
  const quantity = Math.max(Number(item.quantity) || 0, 0);
  const unitPrice = Math.max(Number(item.unit_price ?? item.price) || 0, 0);
  const discountPct = Math.min(Math.max(Number(item.discountPct ?? item.discount_pct) || 0, 0), 100);
  const gstRate = Math.max(Number(item.gstRate ?? item.gst_rate) || 0, 0);
  const grossValue = roundMoney(quantity * unitPrice);
  const discountAmount = roundMoney((grossValue * discountPct) / 100);
  const taxableValue = roundMoney(grossValue - discountAmount);
  const gstAmount = roundMoney((taxableValue * gstRate) / 100);
  const localSale = isIntraState(customerState, shopState);
  const cgst = localSale ? roundMoney(gstAmount / 2) : 0;
  const sgst = localSale ? roundMoney(gstAmount / 2) : 0;
  const igst = localSale ? 0 : gstAmount;

  return {
    ...item,
    quantity,
    unit_price: unitPrice,
    price: unitPrice,
    discountPct,
    discount_pct: discountPct,
    gstRate,
    gst_rate: gstRate,
    grossValue,
    discountAmount,
    taxableValue,
    cgst,
    sgst,
    igst,
    total: roundMoney(taxableValue + cgst + sgst + igst),
  };
}

export function calculateInvoiceTotals(items, customerState, shopState) {
  const lineItems = items.map((item) => calculateLineItem(item, customerState, shopState));
  const subtotal = roundMoney(lineItems.reduce((sum, item) => sum + item.taxableValue, 0));
  const discount = roundMoney(lineItems.reduce((sum, item) => sum + item.discountAmount, 0));
  const cgst = roundMoney(lineItems.reduce((sum, item) => sum + item.cgst, 0));
  const sgst = roundMoney(lineItems.reduce((sum, item) => sum + item.sgst, 0));
  const igst = roundMoney(lineItems.reduce((sum, item) => sum + item.igst, 0));
  const total = roundMoney(subtotal + cgst + sgst + igst);

  return {
    lineItems,
    subtotal,
    discount,
    cgst,
    sgst,
    igst,
    total,
    taxMode: isIntraState(customerState, shopState) ? "CGST/SGST" : "IGST",
  };
}

export function formatCurrency(value) {
  return `INR ${roundMoney(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function createInvoiceNumber(date = new Date()) {
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = String(date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()).padStart(5, "0");
  return `INV-${stamp}-${suffix}`;
}
