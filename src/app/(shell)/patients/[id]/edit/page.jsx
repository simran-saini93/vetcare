'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Check } from 'lucide-react'
import { patientsApi } from '@/lib/api'
import { Button, Input, Select } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'

function StepIndicator({ current }) {
  const steps = ['Basic Info', 'Health & Insurance']
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
              i < current
                ? 'bg-indigo-600 text-white'
                : i === current
                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/50'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-400'
            }`}>
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium whitespace-nowrap ${
              i <= current ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'
            }`}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-300 ${
              i < current ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-zinc-800'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function EditPatientPage() {
  const { id } = useParams()
  const router = useRouter()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [basic, setBasic] = useState({
    name: '', species: '', breed: '', dateOfBirth: '',
    sex: 'unknown', isNeutered: false, color: '',
    microchipNumber: '', isStreetAnimal: false,
  })
  const [health, setHealth] = useState({
    allergies: '', chronicConditions: '', handlingNotes: '',
    insuranceProvider: '', insurancePolicyNo: '',
  })

  useEffect(() => {
    patientsApi.getById(id)
      .then(p => {
        setPatient(p)
        setBasic({
          name:            p.name            || '',
          species:         p.species         || '',
          breed:           p.breed           || '',
          dateOfBirth:     p.dateOfBirth     ? p.dateOfBirth.split('T')[0] : '',
          sex:             p.sex             || 'unknown',
          isNeutered:      p.isNeutered      ?? false,
          color:           p.color           || '',
          microchipNumber: p.microchipNumber || '',
          isStreetAnimal:  p.isStreetAnimal  ?? false,
        })
        setHealth({
          allergies:         p.allergies         || '',
          chronicConditions: p.chronicConditions || '',
          handlingNotes:     p.handlingNotes     || '',
          insuranceProvider: p.insuranceProvider || '',
          insurancePolicyNo: p.insurancePolicyNo || '',
        })
      })
      .catch(() => { toast.error('Patient not found'); router.push('/patients') })
      .finally(() => setLoading(false))
  }, [id, router])

  const handleSubmit = async () => {
    if (!basic.name || !basic.species) {
      toast.error('Name and species are required')
      setStep(0)
      return
    }
    setSubmitting(true)
    try {
      await patientsApi.update(id, { ...basic, ...health })
      toast.success(`${basic.name} updated successfully`)
      router.push(`/patients/${id}`)
    } catch {
      toast.error('Failed to update patient')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-8 w-48" />
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 space-y-4">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <div>
        <Link
          href={`/patients/${id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to {patient?.name}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Patient</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Update {patient?.name}&apos;s information</p>
      </div>

      <StepIndicator current={step} />

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">

        {/* Step 1 — Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Pet Name *</label>
                <input
                  value={basic.name}
                  onChange={e => setBasic(b => ({ ...b, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Species *</label>
                <select
                  value={basic.species}
                  onChange={e => setBasic(b => ({ ...b, species: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  <option value="">Select species</option>
                  <option value="Dog">🐶 Dog</option>
                  <option value="Cat">🐱 Cat</option>
                  <option value="Bird">🐦 Bird</option>
                  <option value="Rabbit">🐰 Rabbit</option>
                  <option value="Reptile">🦎 Reptile</option>
                  <option value="Other">🐾 Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Breed</label>
                <input
                  value={basic.breed}
                  onChange={e => setBasic(b => ({ ...b, breed: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={basic.dateOfBirth}
                  onChange={e => setBasic(b => ({ ...b, dateOfBirth: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Sex</label>
                <select
                  value={basic.sex}
                  onChange={e => setBasic(b => ({ ...b, sex: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  <option value="unknown">Unknown</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Color / Markings</label>
                <input
                  value={basic.color}
                  onChange={e => setBasic(b => ({ ...b, color: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Microchip Number</label>
              <input
                value={basic.microchipNumber}
                onChange={e => setBasic(b => ({ ...b, microchipNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="flex gap-6 py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={basic.isNeutered}
                  onChange={e => setBasic(b => ({ ...b, isNeutered: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span className="text-sm text-gray-700 dark:text-zinc-300">Neutered / Spayed</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={basic.isStreetAnimal}
                  onChange={e => setBasic(b => ({ ...b, isStreetAnimal: e.target.checked }))}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <span className="text-sm text-gray-700 dark:text-zinc-300">Street animal</span>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => {
                if (!basic.name || !basic.species) { toast.error('Name and species are required'); return }
                setStep(1)
              }}>
                Next →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — Health & Insurance */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Known Allergies</label>
              <textarea
                rows={2}
                value={health.allergies}
                onChange={e => setHealth(h => ({ ...h, allergies: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Chronic Conditions</label>
              <textarea
                rows={2}
                value={health.chronicConditions}
                onChange={e => setHealth(h => ({ ...h, chronicConditions: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Special Handling Notes</label>
              <textarea
                rows={2}
                value={health.handlingNotes}
                onChange={e => setHealth(h => ({ ...h, handlingNotes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
              />
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
              <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Insurance</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Provider</label>
                  <input
                    value={health.insuranceProvider}
                    onChange={e => setHealth(h => ({ ...h, insuranceProvider: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Policy No.</label>
                  <input
                    value={health.insurancePolicyNo}
                    onChange={e => setHealth(h => ({ ...h, insurancePolicyNo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
