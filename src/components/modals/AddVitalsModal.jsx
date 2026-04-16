'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { X, Scale, Thermometer, Heart, Wind, Save } from 'lucide-react'
import { Button } from '@/components/ui'

function VitalField({ label, value, onChange, suffix, placeholder, icon: Icon }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-zinc-300">
        {Icon && <Icon size={14} className="text-gray-400" />}
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">{suffix}</span>
        )}
      </div>
    </div>
  )
}

export default function AddVitalsModal({ appointment, onClose, onSaved }) {
  const [weightKg,        setWeightKg]        = useState('')
  const [temperature,     setTemperature]     = useState('')
  const [heartRate,       setHeartRate]       = useState('')
  const [respiratoryRate, setRespiratoryRate] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!weightKg && !temperature && !heartRate && !respiratoryRate) {
      toast.error('Enter at least one vital')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId:   appointment.id,
          patientId:       appointment.patientId,
          weightKg:        weightKg        || null,
          temperature:     temperature     || null,
          heartRate:       heartRate       || null,
          respiratoryRate: respiratoryRate || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success(`Vitals recorded for ${appointment.patientName}`)
      onSaved?.()
      onClose()
    } catch {
      toast.error('Failed to save vitals')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Record Vitals</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{appointment.patientName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <VitalField label="Weight"           value={weightKg}        onChange={setWeightKg}        suffix="kg"   placeholder="0.0"  icon={Scale} />
            <VitalField label="Temperature"      value={temperature}     onChange={setTemperature}     suffix="°C"   placeholder="38.5" icon={Thermometer} />
            <VitalField label="Heart Rate"       value={heartRate}       onChange={setHeartRate}       suffix="bpm"  placeholder="80"   icon={Heart} />
            <VitalField label="Resp. Rate"       value={respiratoryRate} onChange={setRespiratoryRate} suffix="/min" placeholder="20"   icon={Wind} />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              These vitals will be automatically filled in when the vet starts the visit record.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              <Save size={15} /> {saving ? 'Saving…' : 'Save Vitals'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
