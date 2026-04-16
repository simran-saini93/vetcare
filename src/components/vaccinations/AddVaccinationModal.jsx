'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Syringe, X, Search } from 'lucide-react'
import { vaccinationsApi, patientsApi } from '@/lib/api'
import { Button } from '@/components/ui'
import SmartCombobox from '@/components/ui/SmartCombobox'

const COMMON_VACCINES = [
  'Rabies', 'Distemper', 'Parvovirus', 'Adenovirus (Hepatitis)',
  'Parainfluenza', 'Bordetella (Kennel Cough)', 'Leptospirosis',
  'Lyme Disease', 'Canine Influenza', 'DHPP (5-in-1)',
  'Feline Herpesvirus', 'Feline Calicivirus', 'Feline Panleukopenia',
  'Feline Leukemia (FeLV)', 'Feline Immunodeficiency (FIV)',
  'FVRCP (3-in-1)', 'Avian Influenza', 'Newcastle Disease',
]

export default function AddVaccinationModal({ onClose, onSaved }) {
  const [patientSearch, setPatientSearch]   = useState('')
  const [patientResults, setPatientResults] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [vaccineName, setVaccineName]       = useState('')
  const [batchNumber, setBatchNumber]       = useState('')
  const [administeredAt, setAdministeredAt] = useState(new Date().toISOString().slice(0, 10))
  const [doseNumber, setDoseNumber]         = useState(1)
  const [seriesTotal, setSeriesTotal]       = useState(1)
  const [nextDueDate, setNextDueDate]       = useState('')
  const [submitting, setSubmitting]         = useState(false)

  const searchPatients = async (q) => {
    setPatientSearch(q)
    if (q.length < 2) { setPatientResults([]); return }
    try {
      const all = await patientsApi.getAll()
      setPatientResults(all.filter(p => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6))
    } catch {}
  }

  const handleSubmit = async () => {
    if (!selectedPatient) { toast.error('Select a patient'); return }
    if (!vaccineName)     { toast.error('Vaccine name is required'); return }
    setSubmitting(true)
    try {
      await vaccinationsApi.create({
        patientId:      selectedPatient.id,
        vaccineName,
        batchNumber:    batchNumber || null,
        administeredAt: new Date(administeredAt).toISOString(),
        doseNumber:     Number(doseNumber),
        seriesTotal:    Number(seriesTotal),
        nextDueDate:    nextDueDate ? new Date(nextDueDate).toISOString() : null,
        status:         'up_to_date',
      })
      toast.success(`Vaccination recorded for ${selectedPatient.name}`)
      onSaved()
      onClose()
    } catch {
      toast.error('Failed to save vaccination')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Syringe size={20} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Record Vaccination</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Patient search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Patient *</label>
            {selectedPatient ? (
              <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">{selectedPatient.name?.[0]}</div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">{selectedPatient.name}</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">{selectedPatient.species}{selectedPatient.breed ? ` · ${selectedPatient.breed}` : ''}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="text-xs text-indigo-600 hover:underline">Change</button>
              </div>
            ) : (
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={patientSearch} onChange={e => searchPatients(e.target.value)} placeholder="Search patient…"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                {patientResults.length > 0 && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg z-10 overflow-hidden">
                    {patientResults.map(p => (
                      <button key={p.id} type="button" onClick={() => { setSelectedPatient(p); setPatientSearch(''); setPatientResults([]) }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-left">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600">{p.name?.[0]}</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.species}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <SmartCombobox type="vaccine_name" label="Vaccine Name *" value={vaccineName} onChange={setVaccineName} staticOptions={COMMON_VACCINES} placeholder="Search or type vaccine…" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Batch Number</label>
              <input value={batchNumber} onChange={e => setBatchNumber(e.target.value)} placeholder="e.g. BT2024-001"
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Administered On *</label>
              <input type="date" value={administeredAt} onChange={e => setAdministeredAt(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[['Dose #', doseNumber, setDoseNumber], ['Series Total', seriesTotal, setSeriesTotal]].map(([label, val, set]) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">{label}</label>
                <input type="number" min={1} value={val} onChange={e => set(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-center" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Next Due Date</label>
              <input type="date" value={nextDueDate} onChange={e => setNextDueDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
              {submitting ? 'Saving…' : 'Record Vaccination'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
