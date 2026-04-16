'use client'

import { useState } from 'react'
import { Stethoscope, Lock, History } from 'lucide-react'
import dynamic from 'next/dynamic'
import SmartCombobox from '@/components/ui/SmartCombobox'
import { useRole } from '@/hooks/useRole'

const VisitHistoryModal = dynamic(() => import('@/components/modals/VisitHistoryModal'), { ssr: false })

const DIAGNOSIS_CODES = [
  'K29.1 - Acute gastritis', 'K29.7 - Gastritis unspecified',
  'J06.9 - URTI unspecified', 'A09 - Gastroenteritis',
  'L30.9 - Dermatitis unspecified', 'H66.9 - Otitis media',
  'M79.3 - Panniculitis', 'N39.0 - UTI unspecified',
]

function TextArea({ label, value, onChange, placeholder, rows = 3, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all placeholder-gray-400"
      />
    </div>
  )
}

export default function ClinicalSection({ fields, onChange, patientId, patientName }) {
  const { canViewClinicalNotes } = useRole()
  const [showHistory, setShowHistory] = useState(false)

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
          <Stethoscope size={18} />
        </div>
        <h2 className="font-bold text-gray-900 dark:text-white">Clinical Examination</h2>
        {patientId && (
          <button
            onClick={() => setShowHistory(true)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
          >
            <History size={13} /> Show History
          </button>
        )}
      </div>

      <TextArea label="Chief Complaint / Reason for Visit" value={fields.chiefComplaint} onChange={v => onChange('chiefComplaint', v)} placeholder="What brings the patient in today?" rows={2} required />

      <div className="grid grid-cols-2 gap-4">
        <TextArea label="Primary Diagnosis"      value={fields.diagnosisPrimary}      onChange={v => onChange('diagnosisPrimary', v)}      placeholder="e.g. Acute gastroenteritis" />
        <TextArea label="Differential Diagnosis" value={fields.diagnosisDifferential} onChange={v => onChange('diagnosisDifferential', v)} placeholder="e.g. Rule out pancreatitis" />
      </div>

      <SmartCombobox
        type="diagnosis_code"
        label="ICD / VeNom Code"
        value={fields.diagnosisCode}
        onChange={v => onChange('diagnosisCode', v)}
        staticOptions={DIAGNOSIS_CODES}
        placeholder="e.g. K29.1"
      />

      <TextArea label="Treatment Plan"       value={fields.treatmentPlan}       onChange={v => onChange('treatmentPlan', v)}       placeholder="Outline the treatment plan…" rows={3} />
      <TextArea label="Procedures Performed" value={fields.proceduresPerformed} onChange={v => onChange('proceduresPerformed', v)} placeholder="List procedures done during this visit…" rows={2} />
      <TextArea label="Follow-up Instructions for Owner" value={fields.followUpInstructions} onChange={v => onChange('followUpInstructions', v)} placeholder="Instructions to give the owner on discharge…" rows={3} />

      {canViewClinicalNotes && (
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Lock size={14} className="text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Internal Clinical Notes</label>
            <span className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 px-2 py-0.5 rounded-full">Staff only</span>
          </div>
          <textarea
            value={fields.internalNotes}
            onChange={e => onChange('internalNotes', e.target.value)}
            placeholder="Notes visible only to clinical staff…"
            rows={2}
            className="w-full px-3 py-2.5 border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-gray-50 dark:bg-zinc-800/50 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-gray-400"
          />
        </div>
      )}

      {showHistory && patientId && (
        <VisitHistoryModal
          patientId={patientId}
          patientName={patientName}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  )
}
