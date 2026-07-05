'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createPayment, deletePayment, updateInvoicePaymentStatus } from '@/lib/db'

// ============================================
// RECORD PAYMENT ACTION
// ============================================
export async function recordPaymentAction(formData: FormData) {
  try {
    const shop_id = formData.get('shop_id') as string
    const invoice_id = formData.get('invoice_id') as string
    const amount = parseFloat(formData.get('amount') as string)
    const payment_method = formData.get('payment_method') as string
    const payment_date = formData.get('payment_date') as string
    const reference_number = (formData.get('reference_number') as string) || ''
    const notes = (formData.get('notes') as string) || ''

    // Validation
    if (!shop_id || !invoice_id) {
      return { success: false, error: 'Missing shop or invoice ID' }
    }

    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Invalid payment amount' }
    }

    if (!payment_date) {
      return { success: false, error: 'Payment date is required' }
    }

    // Create payment using the lib/db function
    const result = await createPayment({
      shop_id,
      invoice_id,
      amount,
      payment_method: payment_method || 'cash',
      payment_date,
      reference_number: reference_number || undefined,
      notes: notes || undefined
    })

    if (!result) {
      return { success: false, error: 'Failed to create payment in database' }
    }

    // Revalidate pages that show payment data
    revalidatePath('/payments')
    revalidatePath('/invoices')
    revalidatePath(`/invoices/${invoice_id}`)
    revalidatePath('/')
    revalidatePath('/billing')

    return { success: true, data: result }
  } catch (error: any) {
    console.error('recordPaymentAction error:', error)
    return { success: false, error: error.message || 'Failed to record payment' }
  }
}

// ============================================
// DELETE PAYMENT ACTION
// ============================================
export async function deletePaymentAction(paymentId: string, shopId: string) {
  try {
    if (!paymentId || !shopId) {
      return { success: false, error: 'Missing payment ID or shop ID' }
    }

    const success = await deletePayment(paymentId, shopId)

    if (!success) {
      return { success: false, error: 'Failed to delete payment' }
    }

    // Revalidate pages
    revalidatePath('/payments')
    revalidatePath('/invoices')
    revalidatePath('/')

    return { success: true }
  } catch (error: any) {
    console.error('deletePaymentAction error:', error)
    return { success: false, error: error.message || 'Failed to delete payment' }
  }
}

// ============================================
// UPDATE PAYMENT ACTION
// ============================================
export async function updatePaymentAction(paymentId: string, formData: FormData) {
  try {
    const supabase = await createClient()
    
    const amount = parseFloat(formData.get('amount') as string)
    const payment_method = formData.get('payment_method') as string
    const payment_date = formData.get('payment_date') as string
    const reference_number = (formData.get('reference_number') as string) || ''
    const notes = (formData.get('notes') as string) || ''

    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Invalid payment amount' }
    }

    const { data, error } = await supabase
      .from('payments')
      .update({
        amount,
        payment_method,
        payment_date,
        reference_number: reference_number || null,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select()
      .single()

    if (error) {
      console.error('updatePayment error:', error)
      return { success: false, error: error.message }
    }

    // Get invoice_id to update status
    const { data: payment } = await supabase
      .from('payments')
      .select('invoice_id, shop_id')
      .eq('id', paymentId)
      .single()

    if (payment?.invoice_id && payment?.shop_id) {
      await updateInvoicePaymentStatus(payment.invoice_id, payment.shop_id)
    }

    revalidatePath('/payments')
    revalidatePath('/invoices')

    return { success: true, data }
  } catch (error: any) {
    console.error('updatePaymentAction error:', error)
    return { success: false, error: error.message || 'Failed to update payment' }
  }
}

// ============================================
// MARK INVOICE AS PAID ACTION
// ============================================
export async function markInvoiceAsPaidAction(invoiceId: string, shopId: string) {
  try {
    const supabase = await createClient()

    // Get invoice details
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('total, paid_amount, status')
      .eq('id', invoiceId)
      .single()

    if (invError || !invoice) {
      return { success: false, error: 'Invoice not found' }
    }

    const remaining = Number(invoice.total) - Number(invoice.paid_amount || 0)

    if (remaining <= 0) {
      return { success: false, error: 'Invoice is already fully paid' }
    }

    // Create payment for remaining amount
    const result = await createPayment({
      shop_id: shopId,
      invoice_id: invoiceId,
      amount: remaining,
      payment_method: 'cash',
      payment_date: new Date().toISOString().split('T')[0],
      notes: 'Marked as paid - full remaining amount'
    })

    if (!result) {
      return { success: false, error: 'Failed to record payment' }
    }

    revalidatePath('/payments')
    revalidatePath('/invoices')
    revalidatePath(`/invoices/${invoiceId}`)

    return { success: true, data: result }
  } catch (error: any) {
    console.error('markInvoiceAsPaidAction error:', error)
    return { success: false, error: error.message || 'Failed to mark as paid' }
  }
}

// ============================================
// BULK DELETE PAYMENTS ACTION
// ============================================
export async function bulkDeletePaymentsAction(paymentIds: string[], shopId: string) {
  try {
    if (!paymentIds || paymentIds.length === 0) {
      return { success: false, error: 'No payments selected' }
    }

    const supabase = await createClient()

    // Get invoice_ids before deleting
    const { data: payments } = await supabase
      .from('payments')
      .select('id, invoice_id')
      .in('id', paymentIds)
      .eq('shop_id', shopId)

    if (!payments) {
      return { success: false, error: 'No payments found' }
    }

    // Delete payments
    const { error } = await supabase
      .from('payments')
      .delete()
      .in('id', paymentIds)
      .eq('shop_id', shopId)

    if (error) {
      console.error('bulkDelete error:', error)
      return { success: false, error: error.message }
    }

    // Update invoice statuses
    const uniqueInvoiceIds = [...new Set(payments.map(p => p.invoice_id).filter(Boolean))]
    for (const invoiceId of uniqueInvoiceIds) {
      await updateInvoicePaymentStatus(invoiceId, shopId)
    }

    revalidatePath('/payments')
    revalidatePath('/invoices')

    return { success: true, deleted: paymentIds.length }
  } catch (error: any) {
    console.error('bulkDeletePaymentsAction error:', error)
    return { success: false, error: error.message || 'Failed to delete payments' }
  }
}

// ============================================
// EXPORT PAYMENTS TO CSV ACTION
// ============================================
export async function exportPaymentsAction(shopId: string, filters?: {
  startDate?: string
  endDate?: string
  method?: string
}) {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices(
          invoice_number,
          customer:customers(name, phone)
        )
      `)
      .eq('shop_id', shopId)
      .order('payment_date', { ascending: false })

    if (filters?.startDate) {
      query = query.gte('payment_date', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('payment_date', filters.endDate)
    }
    if (filters?.method && filters.method !== 'all') {
      query = query.eq('payment_method', filters.method)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    // Convert to CSV
    const headers = ['Payment #', 'Date', 'Invoice', 'Customer', 'Method', 'Amount', 'Reference', 'Notes']
    const rows = (data || []).map(p => [
      p.payment_number,
      p.payment_date,
      p.invoice?.invoice_number || '',
      p.invoice?.customer?.name || '',
      p.payment_method,
      p.amount,
      p.reference_number || '',
      p.notes || ''
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return { success: true, csv, count: rows.length }
  } catch (error: any) {
    console.error('exportPaymentsAction error:', error)
    return { success: false, error: error.message || 'Failed to export' }
  }
}
