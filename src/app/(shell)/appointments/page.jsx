'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Plus, CheckCircle, X, Calendar, Clock,
  Stethoscope, Scale, ClipboardList, BadgeCheck, Ban,
} from 'lucide-react'
import Link from 'next/link'
import { useVetCareStore } from '@/store'
import { useRole } from '@/hooks/useRole'
import AddVitalsModal from '@/components/modals/AddVitalsModal'
import { appointmentsApi } from '@/lib/api'
import { Badge, Button } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'

const TYPE_COLORS = {
  checkup: 'blue', surgery: 'red', emergency: 'red',
  vaccination: 'green', grooming: 'indigo', followup: 'yellow',
}

function getRange(preset) {
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const today    = new Date(todayStr + 'T00:00:00')
  const tomorrow = new Date(todayStr + 'T23:59:59')
  switch (preset) {
    case 'today':   return { from: today, to: tomorrow }
    case '7days':  { const f = new Date(today); f.setDate(f.getDate()-7);  return { from: f, to: tomorrow } }
    case '30days': { const f = new Date(today); f.setDate(f.getDate()-30); return { from: f, to: tomorrow } }
    default:        return { from: today, to: tomorrow }
  }
}

export default function AppointmentsPage() {
  const { appointments, setAppointments, openModal } = useVetCareStore()
  const { canRecordVisit } = useRole()
  const [loading, setLoading]           = useState(true)
  const [vitalsApt, setVitalsApt]       = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [preset, setPreset]             = useState('today')
  const [customFrom, setCustomFrom]     = useState('')
  const [customTo, setCustomTo]         = useState('')

  useEffect(() => {
    appointmentsApi.getAll()
      .then(async data => {
        const all = Array.isArray(data) ? data : []
        const now = new Date()
        const expired = all.filter(a =>
          a.status === 'scheduled' && a.scheduledAt && new Date(a.scheduledAt) < now
        )
        if (expired.length > 0) {
          await Promise.allSettled(expired.map(a => appointmentsApi.update(a.id, { status: 'no_show' })))
          setAppointments(all.map(a => expired.find(e => e.id === a.id) ? { ...a, status: 'no_show' } : a))
        } else {
          setAppointments(all)
        }
      })
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let result = [...appointments]
    if (preset !== 'custom') {
      const range = getRange(preset)
      result = result.filter(a => {
        if (!a.scheduledAt) return false
        const d = new Date(a.scheduledAt)
        return d >= range.from && d <= range.to
      })
    } else if (customFrom || customTo) {
      result = result.filter(a => {
        if (!a.scheduledAt) return false
        const d = new Date(a.scheduledAt)
        if (customFrom && d < new Date(customFrom)) return false
        if (customTo && d > new Date(customTo + 'T23:59:59')) return false
        return true
      })
    }
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter)
    return result.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
  }, [appointments, preset, customFrom, customTo, statusFilter])

  const updateStatus = async (id, status) => {
    try {
      await appointmentsApi.update(id, { status })
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a))
      toast.success(`Appointment ${status}`)
    } catch { toast.error('Failed to update') }
  }

  const stats = {
    total:     filtered.length,
    scheduled: filtered.filter(a => a.status === 'scheduled').length,
    completed: filtered.filter(a => a.status === 'completed').length,
    cancelled: filtered.filter(a => a.status === 'cancelled').length,
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            {filtered.length} appointment{filtered.length !== 1 ? 's' : ''}{preset === 'today' ? ' today' : ''}
          </p>
        </div>
        <Button onClick={() => openModal('appointment')}><Plus size={18} /> Book Appointment</Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Appointments', value: stats.total,     subtitle: preset === 'today' ? 'appointments today' : 'in selected range', icon: ClipboardList, iconWrap: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' },
          { label: 'Scheduled',          value: stats.scheduled, subtitle: 'upcoming appointments',  icon: Calendar,     iconWrap: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
          { label: 'Completed',          value: stats.completed, subtitle: 'successfully finished',  icon: BadgeCheck,   iconWrap: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
          { label: 'Cancelled',          value: stats.cancelled, subtitle: 'not going ahead',        icon: Ban,          iconWrap: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400' },
        ].map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{card.value}</p>
                  <p className="mt-2 text-sm text-gray-400 dark:text-zinc-500">{card.subtitle}</p>
                </div>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconWrap}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Date Range</label>
          <div className="flex flex-wrap gap-2">
            {[{ key:'today',label:'Today'},{key:'7days',label:'Last 7 days'},{key:'30days',label:'Last 30 days'},{key:'custom',label:'Custom'}].map(p => (
              <button key={p.key} onClick={() => setPreset(p.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${preset===p.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {preset === 'custom' && (
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">From</label>
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">To</label>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        )}

        <div className="ml-auto">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-200 dark:border-zinc-700">
              <tr>
                {['Date & Time','Patient','Type','Duration','Notes','Status','Actions'].map(h => (
                  <th key={h} className={`px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider ${h==='Actions'?'text-right':''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {loading ? (
                [...Array(5)].map((_,i) => (
                  <tr key={i}>{[...Array(7)].map((_,j) => <td key={j} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Calendar size={40} className="mx-auto mb-3 text-gray-300 dark:text-zinc-700" />
                    <p className="font-medium text-gray-600 dark:text-zinc-300">
                      {preset === 'today' ? 'No appointments today' : 'No appointments found'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {preset === 'today' ? 'Try switching to Last 7 days.' : 'Adjust filters or book a new appointment.'}
                    </p>
                    <button onClick={() => openModal('appointment')} className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                      Book an appointment
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map(apt => (
                  <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Clock size={11} />
                        {apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{apt.patientName||'—'}</td>
                    <td className="px-6 py-4"><Badge color={TYPE_COLORS[apt.type]||'gray'} className="capitalize">{apt.type}</Badge></td>
                    <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">{apt.durationMinutes?`${apt.durationMinutes} min`:'—'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-zinc-400 max-w-xs"><p className="truncate">{apt.notes||'—'}</p></td>
                    <td className="px-6 py-4">
                      <Badge color={apt.status==='completed'?'green':apt.status==='cancelled'?'red':apt.status==='no_show'?'gray':'blue'} className="capitalize">
                        {apt.status?.replace('_',' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {apt.status === 'no_show' ? (
                          // Expired — reschedule for everyone
                          <button onClick={() => openModal('appointment')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors border border-amber-200 dark:border-amber-800">
                            <Calendar size={13} /> Reschedule
                          </button>
                        ) : (
                          <>
                            {/* Vet/Admin — Start Visit */}
                            {canRecordVisit && (
                              <Link href={`/visits/new?appointmentId=${apt.id}&patientId=${apt.patientId}`}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors border border-green-200 dark:border-green-800">
                                <Stethoscope size={13} /> Start Visit
                              </Link>
                            )}

                            {/* Staff — Add Vitals */}
                            {!canRecordVisit && apt.status === 'scheduled' && (
                              <button onClick={() => setVitalsApt(apt)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800">
                                <Scale size={13} /> Add Vitals
                              </button>
                            )}

                            {/* Everyone — Complete + Cancel */}
                            {apt.status === 'scheduled' && (
                              <>
                                <button onClick={() => updateStatus(apt.id,'completed')}
                                  className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Mark completed">
                                  <CheckCircle size={16} />
                                </button>
                                <button onClick={() => updateStatus(apt.id,'cancelled')}
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Cancel">
                                  <X size={16} />
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30">
            <p className="text-xs text-gray-400">Showing {filtered.length} appointment{filtered.length!==1?'s':''}</p>
          </div>
        )}
      </div>

      {vitalsApt && (
        <AddVitalsModal
          appointment={vitalsApt}
          onClose={() => setVitalsApt(null)}
          onSaved={() => setVitalsApt(null)}
        />
      )}
    </div>
  )
}
