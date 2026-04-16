'use client'

import { Plus, Users, Phone, Trash2 } from 'lucide-react'
import { useVetCareStore } from '@/store'
import { Card, Button } from '@/components/ui'
import { patientsApi } from '@/lib/api'

export default function PatientsView() {
  const { patients, setPatients, openModal, setPrefillPatientId } = useVetCareStore()

  const handleDelete = async (id) => {
    if (!confirm('Delete this patient?')) return
    try {
      await patientsApi.delete(id)
      setPatients(patients.filter(p => p.id !== id))
    } catch (err) {
      console.error('Failed to delete patient:', err.message)
    }
  }

  const handleBookVisit = (patientId) => {
    setPrefillPatientId(patientId)
    openModal('appointment')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Records</h1>
        <Button onClick={() => openModal('patient')}>
          <Plus size={18} /> Add Patient
        </Button>
      </div>

      {patients.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Users size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No patients registered yet.</p>
          <Button className="mt-4" onClick={() => openModal('patient')}>
            <Plus size={16} /> Add First Patient
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map(p => (
          <Card key={p.id} className="hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-2xl">
                {p.species === 'Cat'    ? '🐱'
                 : p.species === 'Bird'   ? '🐦'
                 : p.species === 'Rabbit' ? '🐰'
                 : p.species === 'Reptile'? '🦎'
                 : '🐶'}
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{p.name}</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-1">
              {p.breed ? `${p.breed} · ` : ''}{p.species}
              {p.age ? ` · ${p.age}` : ''}
            </p>

            <div className="pt-4 border-t border-gray-100 dark:border-zinc-700 space-y-2 mt-3">
              {p.ownerName && (
                <div className="flex items-center text-xs text-gray-500 dark:text-zinc-400 gap-2">
                  <Users size={13} /> {p.ownerName}
                </div>
              )}
              {p.ownerContact && (
                <div className="flex items-center text-xs text-gray-500 dark:text-zinc-400 gap-2">
                  <Phone size={13} /> {p.ownerContact}
                </div>
              )}
            </div>

            <div className="mt-4">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => handleBookVisit(p.id)}
              >
                Book Visit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}