'use client'

import { FlaskConical, Plus, Trash2 } from 'lucide-react'
import SmartCombobox from '@/components/ui/SmartCombobox'

const COMMON_TESTS = [
  'Complete Blood Count (CBC)', 'Blood Chemistry Panel', 'Urinalysis',
  'Fecal Examination', 'Thyroid Panel (T4)', 'ACTH Stimulation Test',
  'Bile Acids Test', 'Coagulation Panel (PT/PTT)', 'Electrolytes Panel',
  'Blood Glucose', 'BUN / Creatinine', 'ALT / AST / ALP',
  'Total Protein / Albumin', 'Chest X-Ray', 'Abdominal X-Ray',
  'Ultrasound - Abdomen', 'Ultrasound - Cardiac (Echo)',
  'Skin Cytology', 'Ear Cytology', 'Fine Needle Aspirate (FNA)',
  'Histopathology / Biopsy', 'Parvovirus Test', 'Distemper Test',
  'Heartworm Test', 'FIV / FeLV Test', 'Culture & Sensitivity',
]

function LabRow({ lab, index, onChange, onRemove }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl relative">
      <button onClick={() => onRemove(index)} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 transition-colors">
        <Trash2 size={14} />
      </button>
      <div className="grid grid-cols-2 gap-3 pr-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Test Name *</label>
          <SmartCombobox type="lab_test" value={lab.testName} onChange={v => onChange(index, { ...lab, testName: v })} staticOptions={COMMON_TESTS} placeholder="Search test…" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Notes</label>
          <input value={lab.notes} onChange={e => onChange(index, { ...lab, notes: e.target.value })} placeholder="Additional instructions…"
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
    </div>
  )
}

const emptyLab = () => ({ testName: '', notes: '' })

export default function LabList({ labRequests, onChange }) {
  const add    = () => onChange([...labRequests, emptyLab()])
  const remove = i  => onChange(labRequests.filter((_, idx) => idx !== i))
  const update = (i, updated) => onChange(labRequests.map((l, idx) => idx === i ? updated : l))

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
          <FlaskConical size={18} />
        </div>
        <h2 className="font-bold text-gray-900 dark:text-white">Lab Requests</h2>
      </div>
      <div className="space-y-3">
        {labRequests.length === 0
          ? <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-4">No lab requests added yet</p>
          : labRequests.map((lab, i) => <LabRow key={i} index={i} lab={lab} onChange={update} onRemove={remove} />)
        }
      </div>
      <button onClick={add} className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium">
        <Plus size={16} /> Add Lab Request
      </button>
    </div>
  )
}
