'use client'

import { Plus, DollarSign } from 'lucide-react'
import { useVetCareStore } from '@/store'
import { Card, Badge, Button } from '@/components/ui'
import { invoicesApi } from '@/lib/api'

export default function BillingView() {
  const { invoices, setInvoices, openModal } = useVetCareStore()

  const markPaid = async (id) => {
    try {
      await invoicesApi.update(id, { status: 'Paid' })
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'Paid' } : inv))
    } catch (err) {
      console.error(err.message)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices & Payments</h1>
        <Button onClick={() => openModal('invoice')}><Plus size={18} /> Create Invoice</Button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {invoices.map(inv => (
          <Card key={inv.id} className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${inv.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                <DollarSign size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Invoice #{inv.id.slice(0, 6).toUpperCase()}</h4>
                <p className="text-sm text-gray-500">To: {inv.patientName} · {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="block text-2xl font-bold text-gray-900 dark:text-white">${Number(inv.amount).toFixed(2)}</span>
                <span className="text-xs text-gray-400">{inv.description}</span>
              </div>
              <div className="flex items-center gap-2">
                {inv.status === 'Pending' && <Button size="sm" onClick={() => markPaid(inv.id)}>Mark Paid</Button>}
                <Badge color={inv.status === 'Paid' ? 'green' : 'yellow'}>{inv.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
        {invoices.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <DollarSign size={48} className="mx-auto mb-3 opacity-30" />
            <p>No invoices created yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
