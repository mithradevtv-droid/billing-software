'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, BarChart3, FileText } from 'lucide-react'

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" size="sm" className="shadow-sm">
        <Link href="/reports">
          <BarChart3 className="mr-1.5 h-4 w-4" /> GSTR1
        </Link>
      </Button>
      <Button asChild size="sm" className="shadow-md">
        <Link href="/billing">
          <Plus className="mr-1.5 h-4 w-4" /> New Invoice
        </Link>
      </Button>
    </div>
  )
}
