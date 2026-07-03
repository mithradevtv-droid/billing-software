// ============================================
// GST CALCULATOR
// ============================================

export interface InvoiceItemCalc {
  quantity: number
  unit_price: number
  discount_pct?: number
  gst_rate: number
  cgst: number
  sgst: number
  igst: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  taxableAmount: number
  total: number
}

export function calculateItemTax(
  quantity: number,
  unitPrice: number,
  gstRate: number,
  shopState: string,
  customerState: string,
  discountPct: number = 0
): InvoiceItemCalc {
  const grossAmount = quantity * unitPrice
  const taxableAmount = grossAmount - (grossAmount * discountPct) / 100
  const isInterState = shopState.toLowerCase().trim() !== customerState.toLowerCase().trim()

  let cgst = 0, sgst = 0, igst = 0
  let cgstAmount = 0, sgstAmount = 0, igstAmount = 0

  if (isInterState) {
    igst = gstRate
    igstAmount = (taxableAmount * gstRate) / 100
  } else {
    cgst = gstRate / 2
    sgst = gstRate / 2
    cgstAmount = (taxableAmount * cgst) / 100
    sgstAmount = (taxableAmount * sgst) / 100
  }

  const totalTax = cgstAmount + sgstAmount + igstAmount

  return {
  quantity,
  unit_price: unitPrice,
  discount_pct: discountPct,
  gst_rate: gstRate,
  cgst: Number(cgst.toFixed(2)),
  sgst: Number(sgst.toFixed(2)),
  igst: Number(igst.toFixed(2)),
  cgstAmount: Number(cgstAmount.toFixed(2)),
  sgstAmount: Number(sgstAmount.toFixed(2)),
  igstAmount: Number(igstAmount.toFixed(2)),
  taxableAmount: Number(taxableAmount.toFixed(2)),
  total: Number((taxableAmount + totalTax).toFixed(2)),
  }
}

export function calculateInvoice(items: InvoiceItemCalc[]) {
  const subtotal = items.reduce((s, i) => s + i.taxableAmount, 0)
  const cgstTotal = items.reduce((s, i) => s + i.cgstAmount, 0)
  const sgstTotal = items.reduce((s, i) => s + i.sgstAmount, 0)
  const igstTotal = items.reduce((s, i) => s + i.igstAmount, 0)
  const totalTax = cgstTotal + sgstTotal + igstTotal

  return {
    subtotal: Number(subtotal.toFixed(2)),
    cgstTotal: Number(cgstTotal.toFixed(2)),
    sgstTotal: Number(sgstTotal.toFixed(2)),
    igstTotal: Number(igstTotal.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    total: Number((subtotal + totalTax).toFixed(2)),
  }
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
]
