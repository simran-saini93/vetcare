'use client'

import { Scale } from 'lucide-react'

function Field({ label, value, onChange, suffix, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{suffix}</span>}
      </div>
    </div>
  )
}

export default function VitalsSection({ vitals, onChange }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
          <Scale size={18} />
        </div>
        <h2 className="font-bold text-gray-900 dark:text-white">Vitals</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field label="Weight"     value={vitals.weightKg}        onChange={v => onChange('weightKg', v)}        suffix="kg"   placeholder="0.0" />
        <Field label="Temperature" value={vitals.temperature}    onChange={v => onChange('temperature', v)}     suffix="°C"   placeholder="38.5" />
        <Field label="Heart Rate" value={vitals.heartRate}       onChange={v => onChange('heartRate', v)}       suffix="bpm"  placeholder="80" />
        <Field label="Resp. Rate" value={vitals.respiratoryRate} onChange={v => onChange('respiratoryRate', v)} suffix="/min" placeholder="20" />
      </div>
    </div>
  )
}
