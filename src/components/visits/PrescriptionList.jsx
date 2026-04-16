'use client'

import { Pill, Plus, Trash2 } from 'lucide-react'
import SmartCombobox from '@/components/ui/SmartCombobox'

const COMMON_DRUGS = [
  'Amoxicillin', 'Amoxicillin-Clavulanate', 'Ampicillin', 'Azithromycin',
  'Cephalexin', 'Clindamycin', 'Doxycycline', 'Enrofloxacin',
  'Metronidazole', 'Trimethoprim-Sulfamethoxazole', 'Meloxicam',
  'Carprofen', 'Tramadol', 'Buprenorphine', 'Prednisolone',
  'Dexamethasone', 'Furosemide', 'Atenolol', 'Amlodipine',
  'Phenobarbital', 'Levetiracetam', 'Metoclopramide', 'Maropitant',
  'Ondansetron', 'Omeprazole', 'Famotidine', 'Fenbendazole',
  'Ivermectin', 'Fluconazole', 'Atropine', 'Ketamine', 'Propofol',
]

function PrescriptionRow({ rx, index, onChange, onRemove }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl space-y-3 relative">
      <button onClick={() => onRemove(index)} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 transition-colors">
        <Trash2 size={14} />
      </button>
      <div className="grid grid-cols-2 gap-3 pr-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Drug Name *</label>
          <SmartCombobox type="drug_name" value={rx.drugName} onChange={v => onChange(index, { ...rx, drugName: v })} staticOptions={COMMON_DRUGS} placeholder="Search drug…" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Dose</label>
          <input value={rx.dose} onChange={e => onChange(index, { ...rx, dose: e.target.value })} placeholder="e.g. 250mg"
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'frequency', label: 'Frequency', placeholder: 'e.g. Twice daily' },
          { key: 'duration',  label: 'Duration',  placeholder: 'e.g. 7 days' },
          { key: 'dispensingNotes', label: 'Notes', placeholder: 'e.g. With food' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">{f.label}</label>
            <input value={rx[f.key]} onChange={e => onChange(index, { ...rx, [f.key]: e.target.value })} placeholder={f.placeholder}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        ))}
      </div>
    </div>
  )
}

const emptyRx = () => ({ drugName: '', dose: '', frequency: '', duration: '', dispensingNotes: '' })

export default function PrescriptionList({ prescriptions, onChange }) {
  const add    = () => onChange([...prescriptions, emptyRx()])
  const remove = i  => onChange(prescriptions.filter((_, idx) => idx !== i))
  const update = (i, updated) => onChange(prescriptions.map((rx, idx) => idx === i ? updated : rx))

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
          <Pill size={18} />
        </div>
        <h2 className="font-bold text-gray-900 dark:text-white">Prescriptions</h2>
      </div>
      <div className="space-y-3">
        {prescriptions.length === 0
          ? <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-4">No prescriptions added yet</p>
          : prescriptions.map((rx, i) => <PrescriptionRow key={i} index={i} rx={rx} onChange={update} onRemove={remove} />)
        }
      </div>
      <button onClick={add} className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 font-medium">
        <Plus size={16} /> Add Prescription
      </button>
    </div>
  )
}
