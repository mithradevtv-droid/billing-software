'use server'

import { 
  getSalesReport, getPurchaseReport, getStockReport,
  getCustomerReport, getSupplierReport, getGSTSummaryReport, getHSNSummaryReport
} from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function loadReportAction(
  reportType: string,
  shopId: string,
  startDate: string,
  endDate: string
) {
  try {
    let data: any = null

    switch (reportType) {
      case 'sales':
        data = await getSalesReport(shopId, startDate, endDate)
        break
      case 'purchase':
        data = await getPurchaseReport(shopId, startDate, endDate)
        break
      case 'stock':
        data = await getStockReport(shopId)
        break
      case 'customer':
        data = await getCustomerReport(shopId)
        break
      case 'supplier':
        data = await getSupplierReport(shopId)
        break
      case 'gst':
        data = await getGSTSummaryReport(shopId, startDate, endDate)
        break
      case 'hsn':
        data = await getHSNSummaryReport(shopId, startDate, endDate)
        break
      default:
        return { error: 'Invalid report type' }
    }

    return data
  } catch (error: any) {
    console.error('loadReportAction error:', error)
    return { error: error.message || 'Failed to load report' }
  }
}
