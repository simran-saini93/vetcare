'use client'

import { Calendar, Clock, Stethoscope } from 'lucide-react'

const APPOINTMENT_TYPES = [
  'checkup', 'followup', 'vaccination', 'surgery',
  'grooming', 'emergency', 'dental', 'other',
]

export default function FollowUpSection({ followUp, onChange }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
          <Calendar size={18} />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white">Follow-up Appointment</h2>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
            Schedule a follow-up — appointment auto-booked, reminder sent to owner 1 day before
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
            <Calendar size={13} className="text-gray-400" /> Follow-up Date
          </label>
          <input
            type="date"
            value={followUp.date}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => onChange({ ...followUp, date: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
            <Clock size={13} className="text-gray-400" /> Time
          </label>
          <input
            type="time"
            value={followUp.time}
            onChange={e => onChange({ ...followUp, time: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
            <Stethoscope size={13} className="text-gray-400" /> Visit Type
          </label>
          <select
            value={followUp.type}
            onChange={e => onChange({ ...followUp, type: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none"
          >
            <option value="">Select type</option>
            {APPOINTMENT_TYPES.map(t => (
              <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Follow-up Notes</label>
        <textarea
          value={followUp.notes}
          onChange={e => onChange({ ...followUp, notes: e.target.value })}
          placeholder="Reason for follow-up, what to check…"
          rows={2}
          className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all placeholder-gray-400"
        />
      </div>

      {followUp.date && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/40 rounded-xl p-3 flex items-start gap-2">
          <Calendar size={14} className="text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-purple-700 dark:text-purple-300">
            Follow-up appointment will be auto-booked for{' '}
            <strong>{new Date(followUp.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
            {followUp.time && ` at ${followUp.time}`}.
            Owner will receive a reminder email the day before.
          </p>
        </div>
      )}
    </div>
  )
}
