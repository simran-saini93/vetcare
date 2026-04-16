'use client'

import { useMemo } from 'react'
import { Calendar, Users, DollarSign, AlertCircle, TrendingUp, CheckCircle, Plus } from 'lucide-react'
import { useVetCareStore } from '@/store'
import { Card, Badge, Button } from '@/components/ui'

function StatCard({ title, value, trend, icon, color }) {
  const bg = {
    blue:   'bg-blue-50 dark:bg-blue-900/20',
    green:  'bg-green-50 dark:bg-green-900/20',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20',
    red:    'bg-red-50 dark:bg-red-900/20',
  }
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${bg[color]}`}>{icon}</div>
      </div>
      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
        {trend.includes('+') && <TrendingUp size={12} />} {trend}
      </p>
    </Card>
  )
}

export default function DashboardView() {
  const { patients, appointments, invoices, inventory, openModal, setView } = useVetCareStore()

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayRevenue = invoices
      .filter(i => i.status === 'Paid' && i.createdAt?.split('T')[0] === today)
      .reduce((acc, curr) => acc + Number(curr.amount), 0)
    return {
      revenue:           todayRevenue,
      appointmentsToday: appointments.filter(a => a.date?.startsWith(today)).length,
      patients:          patients.length,
      lowStock:          inventory.filter(i => Number(i.stock) < (i.lowStockThreshold ?? 10)).length,
    }
  }, [patients, appointments, invoices, inventory])

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">Here&apos;s what&apos;s happening in your clinic today.</p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => openModal('appointment')}><Calendar size={18} /> Schedule Appointment</Button>
        <Button variant="secondary" onClick={() => openModal('patient')}><Plus size={18} /> New Patient</Button>
        <Button variant="secondary" onClick={() => openModal('invoice')}><DollarSign size={18} /> Create Invoice</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Revenue"  value={`$${stats.revenue.toFixed(2)}`} trend="+12% from yesterday" icon={<DollarSign size={24} className="text-green-600" />}  color="green" />
        <StatCard title="Appointments"     value={stats.appointmentsToday}         trend="scheduled today"     icon={<Calendar size={24} className="text-blue-600" />}     color="blue" />
        <StatCard title="Total Patients"   value={stats.patients}                   trend="+2 this week"        icon={<Users size={24} className="text-indigo-600" />}      color="indigo" />
        <StatCard title="Low Stock Items"  value={stats.lowStock}                   trend="Requires attention"  icon={<AlertCircle size={24} className="text-red-600" />}   color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Today&apos;s Schedule</h3>
              <button onClick={() => setView('appointments')} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Time</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {appointments.slice(0, 5).map(apt => (
                    <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{apt.patientName}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-zinc-400">{apt.type}</td>
                      <td className="px-4 py-3">
                        <Badge color={apt.status === 'Completed' ? 'green' : apt.status === 'Cancelled' ? 'red' : 'blue'}>
                          {apt.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr><td colSpan={4} className="p-4 text-center text-gray-500">No appointments yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Recent Invoices</h3>
              <button onClick={() => setView('billing')} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {invoices.slice(0, 3).map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg"><DollarSign size={16} /></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{inv.patientName}</p>
                      <p className="text-xs text-gray-500">{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">${Number(inv.amount).toFixed(2)}</p>
                    <span className={`text-xs ${inv.status === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>{inv.status}</span>
                  </div>
                </div>
              ))}
              {invoices.length === 0 && <p className="text-gray-500 text-center py-4">No recent invoices.</p>}
            </div>
          </Card>
        </div>

        {/* Right col */}
        <div className="space-y-8">
          <Card className="border-l-4 border-l-red-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertCircle size={18} className="text-red-500" /> Low Stock
              </h3>
              <button onClick={() => setView('inventory')} className="text-xs text-red-600 hover:underline">Manage</button>
            </div>
            <div className="space-y-2">
              {inventory.filter(i => Number(i.stock) < (i.lowStockThreshold ?? 10)).slice(0, 4).map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-zinc-300">{item.name}</span>
                  <span className="font-bold text-red-500">{item.stock} {item.unit} left</span>
                </div>
              ))}
              {stats.lowStock === 0 && (
                <p className="text-sm text-green-600 flex items-center gap-2"><CheckCircle size={14} /> Inventory looks good!</p>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Newest Patients</h3>
            <div className="space-y-4">
              {patients.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 text-xs font-bold">
                    {p.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.species}{p.breed ? ` · ${p.breed}` : ''}</p>
                  </div>
                </div>
              ))}
              {patients.length === 0 && <p className="text-sm text-gray-500">No patients yet.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
