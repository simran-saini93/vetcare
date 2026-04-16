'use client'

import { Plus, CheckCircle, X } from 'lucide-react'
import { useVetCareStore } from '@/store'
import { Card, Badge, Button } from '@/components/ui'
import { appointmentsApi } from '@/lib/api'

export default function AppointmentsView() {
  const { appointments, setAppointments, openModal } = useVetCareStore()

  const updateStatus = async (id, status) => {
    try {
      await appointmentsApi.update(id, { status })
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a))
    } catch (err) {
      console.error('Failed to update appointment:', err.message)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
        <Button onClick={() => openModal('appointment')}>
          <Plus size={18} /> New Schedule
        </Button>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Patient</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Notes</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
              {appointments.map(apt => (
                <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <div className="flex flex-col">
                      <span>{new Date(apt.date).toLocaleDateString()}</span>
                      <span className="text-xs text-gray-400 dark:text-zinc-500">
                        {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{apt.patientName}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">{apt.type}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-zinc-400 max-w-xs truncate">{apt.notes}</td>
                  <td className="px-6 py-4">
                    <Badge color={
                      apt.status === 'Completed' ? 'green'
                      : apt.status === 'Cancelled' ? 'red'
                      : apt.status === 'No-show'  ? 'yellow'
                      : 'blue'
                    }>
                      {apt.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {apt.status === 'Scheduled' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => updateStatus(apt.id, 'Completed')}
                          className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 p-1 rounded"
                          title="Mark completed"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => updateStatus(apt.id, 'Cancelled')}
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-gray-400 dark:text-zinc-500 text-sm">
                    No appointments scheduled yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
