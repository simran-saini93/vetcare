'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Calendar, Users, AlertCircle, TrendingUp, Plus, PawPrint } from 'lucide-react'
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

export default function DashboardPage() {
  const { patients, appointments, openModal } = useVetCareStore()

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return {
      appointmentsToday: appointments.filter(a => a.scheduledAt?.startsWith(today)).length,
      patients:          patients.length,
      scheduled:         appointments.filter(a => a.status === 'scheduled').length,
      completed:         appointments.filter(a => a.status === 'completed').length,
    }
  }, [patients, appointments])

  const todayAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return appointments
      .filter(a => a.scheduledAt?.startsWith(today))
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
  }, [appointments])

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
  <div>
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
    <p className="text-gray-500 dark:text-zinc-400 mt-1 text-sm">
      Here&apos;s what&apos;s happening today.
    </p>
  </div>

  <div className="flex flex-wrap gap-3 shrink-0">
    <Link href="/patients/new">
      <Button>
        <Plus size={18} /> New Patient
      </Button>
    </Link>
    <Button variant="secondary" onClick={() => openModal('appointment')}>
      <Calendar size={18} /> Book Appointment
    </Button>
  </div>
</div>


      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={stats.patients}
          trend="+2 this week"
          icon={<Users size={24} className="text-indigo-600" />}
          color="indigo"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.appointmentsToday}
          trend="scheduled today"
          icon={<Calendar size={24} className="text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="Scheduled"
          value={stats.scheduled}
          trend="upcoming"
          icon={<AlertCircle size={24} className="text-green-600" />}
          color="green"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          trend="all time"
          icon={<PawPrint size={24} className="text-indigo-600" />}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's schedule */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Today&apos;s Schedule</h3>
              <Link href="/appointments" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">
                View All
              </Link>
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
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {todayAppointments.slice(0, 6).map(apt => (
                    <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {apt.scheduledAt
                          ? new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{apt.patientName}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-zinc-400 capitalize">{apt.type}</td>
                      <td className="px-4 py-3">
                        <Badge
                          color={apt.status === 'completed' ? 'green' : apt.status === 'cancelled' ? 'red' : 'blue'}
                          className="capitalize"
                        >
                          {apt.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {todayAppointments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400 dark:text-zinc-500">
                        No appointments today
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Newest patients */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Newest Patients</h3>
              <Link href="/patients" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {patients.slice(0, 6).map(p => (
                <Link key={p.id} href={`/patients/${p.id}`} className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 text-sm font-bold flex-shrink-0">
                    {p.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">
                      {p.species}{p.breed ? ` · ${p.breed}` : ''}
                    </p>
                  </div>
                </Link>
              ))}
              {patients.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-4">No patients yet</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
