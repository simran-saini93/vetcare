'use client'

import { Calendar, Clock } from 'lucide-react'
import { Badge } from '@/components/ui'

const TYPE_COLORS = { checkup:'blue', surgery:'red', emergency:'red', vaccination:'green', grooming:'indigo', followup:'yellow' }

export default function AppointmentReportTable({ appointments }) {
  if (!appointments.length) return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-16 text-center">
      <Calendar size={40} className="mx-auto mb-3 text-gray-300 dark:text-zinc-700" />
      <p className="text-gray-500 dark:text-zinc-400">No appointments match your filters</p>
    </div>
  )

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-200 dark:border-zinc-700">
            <tr>
              {['Patient','Date','Time','Type','Duration','Status','Notes'].map(h => (
                <th key={h} className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {appointments.map(a => (
              <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">{a.patientName||'—'}</td>
                <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                  {a.scheduledAt?new Date(a.scheduledAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—'}
                </td>
                <td className="px-5 py-3.5 text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                  <Clock size={12} />
                  {a.scheduledAt?new Date(a.scheduledAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'—'}
                </td>
                <td className="px-5 py-3.5">
                  <Badge color={TYPE_COLORS[a.type]||'gray'} className="capitalize">{a.type}</Badge>
                </td>
                <td className="px-5 py-3.5 text-gray-500 dark:text-zinc-400">{a.durationMinutes?`${a.durationMinutes} min`:'—'}</td>
                <td className="px-5 py-3.5">
                  <Badge color={a.status==='completed'?'green':a.status==='cancelled'?'red':a.status==='no_show'?'gray':'blue'} className="capitalize">
                    {a.status?.replace('_',' ')}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-gray-400 text-xs max-w-40 truncate">{a.notes||'—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30">
        <p className="text-xs text-gray-400">{appointments.length} appointment{appointments.length!==1?'s':''}</p>
      </div>
    </div>
  )
}
