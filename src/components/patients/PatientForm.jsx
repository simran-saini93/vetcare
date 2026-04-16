'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronRight, ChevronLeft, Check, Search, Plus, Home } from 'lucide-react'
import { patientsApi, ownersApi } from '@/lib/api'
import { Input, Select, Button } from '@/components/ui'
import SmartCombobox from '@/components/ui/SmartCombobox'

const SPECIES_OPTIONS = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Reptile', 'Other']

const BREED_BY_SPECIES = {
  Dog:     ['Labrador', 'Golden Retriever', 'German Shepherd', 'Poodle', 'Beagle', 'Bulldog', 'Rottweiler', 'Dachshund', 'Shih Tzu', 'Husky', 'Doberman', 'Boxer', 'Cocker Spaniel', 'Great Dane', 'Pomeranian'],
  Cat:     ['Persian', 'Siamese', 'Maine Coon', 'Bengal', 'Ragdoll', 'British Shorthair', 'Abyssinian', 'Scottish Fold', 'Sphynx', 'Russian Blue'],
  Bird:    ['Parrot', 'Cockatiel', 'Budgerigar', 'Macaw', 'Lovebird', 'Canary', 'Finch', 'Cockatoo'],
  Rabbit:  ['Holland Lop', 'Mini Rex', 'Lionhead', 'Dutch', 'Flemish Giant', 'Angora', 'Rex'],
  Reptile: ['Bearded Dragon', 'Leopard Gecko', 'Ball Python', 'Corn Snake', 'Blue-tongued Skink', 'Chameleon', 'Iguana'],
  Other:   [],
}

const COAT_COLORS = [
  'Black', 'White', 'Brown', 'Golden', 'Cream', 'Gray', 'Silver',
  'Red', 'Fawn', 'Brindle', 'Merle', 'Spotted', 'Tabby', 'Calico',
  'Tortoiseshell', 'Black & White', 'Brown & White', 'Tri-color',
]

const Step1Schema = z.object({
  name:            z.string().min(1, 'Pet name is required'),
  species:         z.string().min(1, 'Species is required'),
  sex:             z.enum(['male', 'female', 'unknown']),
  dateOfBirth:     z.string().optional(),
  isNeutered:      z.boolean().optional(),
  isStreetAnimal:  z.boolean().optional(),
})

const Step2Schema = z.object({
  allergies:         z.string().optional(),
  chronicConditions: z.string().optional(),
  handlingNotes:     z.string().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNo: z.string().optional(),
})

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current, steps }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
              i < current  ? 'bg-indigo-600 text-white'
              : i === current ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/50'
              : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500'
            }`}>
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium whitespace-nowrap ${
              i <= current ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-zinc-500'
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

// ── Step 1 ────────────────────────────────────────────────────────────────────

function Step1({ data, onNext }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(Step1Schema),
    defaultValues: { sex: 'unknown', isNeutered: false, isStreetAnimal: false, ...data },
  })

  const species        = watch('species')
  const isStreetAnimal = watch('isStreetAnimal')

  const [breed, setBreed]           = useState(data.breed || '')
  const [color, setColor]           = useState(data.color || '')
  const [microchip, setMicrochip]   = useState(data.microchipNumber || '')

  const handleNext = handleSubmit(formData => {
    onNext({ ...formData, breed, color, microchipNumber: microchip })
  })

  return (
    <form onSubmit={handleNext} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Pet Name *"
          placeholder="e.g. Buddy"
          error={errors.name?.message}
          {...register('name')}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Species *</label>
          <select
            className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 appearance-none ${errors.species ? 'border-red-300' : 'border-gray-300 dark:border-zinc-700'}`}
            {...register('species')}
          >
            <option value="">Select species</option>
            {SPECIES_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.species && <p className="mt-1 text-xs text-red-500">{errors.species.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Breed — SmartCombobox */}
        <SmartCombobox
          type="breed"
          label="Breed"
          value={breed}
          onChange={setBreed}
          staticOptions={BREED_BY_SPECIES[species] || []}
          placeholder="e.g. Labrador"
        />
        <Input
          label="Date of Birth"
          type="date"
          {...register('dateOfBirth')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Sex</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            {...register('sex')}
          >
            <option value="unknown">Unknown</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        {/* Color — SmartCombobox */}
        <SmartCombobox
          type="coat_color"
          label="Color / Markings"
          value={color}
          onChange={setColor}
          staticOptions={COAT_COLORS}
          placeholder="e.g. Golden brown"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Microchip Number</label>
        <input
          value={microchip}
          onChange={e => setMicrochip(e.target.value)}
          placeholder="e.g. 985112345678901"
          className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>

      <div className="flex gap-6 py-2">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" className="w-4 h-4 rounded text-indigo-600" {...register('isNeutered')} />
          <span className="text-sm text-gray-700 dark:text-zinc-300">Neutered / Spayed</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" className="w-4 h-4 rounded text-amber-500" {...register('isStreetAnimal')} />
          <span className="text-sm text-gray-700 dark:text-zinc-300 flex items-center gap-1">
            <Home size={13} /> Street animal
          </span>
        </label>
      </div>

      {isStreetAnimal && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-700 dark:text-amber-400">
          Street animal — owner details will be skipped in Step 3.
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit">Next <ChevronRight size={16} /></Button>
      </div>
    </form>
  )
}

// ── Step 2 ────────────────────────────────────────────────────────────────────

function Step2({ data, onNext, onBack }) {
  const { register, handleSubmit } = useForm({ defaultValues: data })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Known Allergies</label>
        <textarea rows={2} placeholder="e.g. Penicillin, certain foods..." className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg outline-none text-sm bg-white dark:bg-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none" {...register('allergies')} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Chronic Conditions</label>
        <textarea rows={2} placeholder="e.g. Diabetes, hip dysplasia..." className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg outline-none text-sm bg-white dark:bg-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none" {...register('chronicConditions')} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Special Handling Notes</label>
        <textarea rows={2} placeholder="e.g. Aggressive when stressed, muzzle required..." className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg outline-none text-sm bg-white dark:bg-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none" {...register('handlingNotes')} />
      </div>
      <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
        <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Insurance</p>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Insurance Provider" placeholder="e.g. PetSure" {...register('insuranceProvider')} />
          <Input label="Policy Number" placeholder="e.g. PS-2024-12345" {...register('insurancePolicyNo')} />
        </div>
      </div>
      <div className="flex justify-between pt-2">
        <Button variant="secondary" type="button" onClick={onBack}><ChevronLeft size={16} /> Back</Button>
        <Button type="submit">Next <ChevronRight size={16} /></Button>
      </div>
    </form>
  )
}

// ── Step 3 — Owner ────────────────────────────────────────────────────────────

function Step3({ isStreetAnimal, onBack, onSubmit, isSubmitting }) {
  const [searchQuery, setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedOwner, setSelectedOwner] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newOwner, setNewOwner]         = useState({ firstName: '', lastName: '', phone: '', email: '' })
  const [relationship, setRelationship] = useState('primary')
  const [searching, setSearching]       = useState(false)

  const handleSearch = async (q) => {
    setSearchQuery(q)
    if (!q || q.length < 2) { setSearchResults([]); return }
    setSearching(true)
    try {
      const results = await ownersApi.getAll()
      setSearchResults(results.filter(o =>
        `${o.firstName} ${o.lastName}`.toLowerCase().includes(q.toLowerCase()) ||
        o.phone?.includes(q)
      ))
    } catch {}
    setSearching(false)
  }

  const handleFinalSubmit = () => {
    onSubmit({ selectedOwner, newOwner: showCreateForm ? newOwner : null, relationship })
  }

  if (isStreetAnimal) return (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
        <Home size={32} className="mx-auto mb-3 text-amber-500" />
        <p className="font-medium text-amber-800 dark:text-amber-300">Street Animal — No Owner Required</p>
      </div>
      <div className="flex justify-between">
        <Button variant="secondary" type="button" onClick={onBack}><ChevronLeft size={16} /> Back</Button>
        <Button onClick={handleFinalSubmit} disabled={isSubmitting}>{isSubmitting ? 'Registering…' : 'Register Patient'}</Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {!showCreateForm ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Search existing owners</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchQuery} onChange={e => handleSearch(e.target.value)} placeholder="Search by name or phone…" className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg outline-none text-sm bg-white dark:bg-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
          </div>
          {searchResults.length > 0 && (
            <div className="border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800">
              {searchResults.map(owner => (
                <button key={owner.id} type="button" onClick={() => { setSelectedOwner(owner); setSearchQuery(''); setSearchResults([]) }} className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{owner.firstName} {owner.lastName}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">{owner.phone}</p>
                </button>
              ))}
            </div>
          )}
          {selectedOwner && (
            <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">{selectedOwner.firstName} {selectedOwner.lastName}</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">{selectedOwner.phone}</p>
              </div>
              <button onClick={() => setSelectedOwner(null)} className="text-xs text-indigo-600 hover:underline">Remove</button>
            </div>
          )}
          {selectedOwner && (
            <Select label="Relationship" value={relationship} onChange={e => setRelationship(e.target.value)} options={[
              { value: 'primary', label: 'Primary owner' },
              { value: 'secondary', label: 'Secondary owner' },
              { value: 'emergency', label: 'Emergency contact' },
            ]} />
          )}
          <button type="button" onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium">
            <Plus size={16} /> Create new owner
          </button>
        </>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">New owner details</p>
            <button onClick={() => setShowCreateForm(false)} className="text-xs text-gray-500 hover:text-gray-700">← Search instead</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name *" value={newOwner.firstName} onChange={e => setNewOwner({...newOwner, firstName: e.target.value})} />
            <Input label="Last Name *" value={newOwner.lastName} onChange={e => setNewOwner({...newOwner, lastName: e.target.value})} />
          </div>
          <Input label="Phone *" value={newOwner.phone} onChange={e => setNewOwner({...newOwner, phone: e.target.value})} />
          <Input label="Email *" type="email" value={newOwner.email} onChange={e => setNewOwner({...newOwner, email: e.target.value})} required />
        </div>
      )}
      <div className="flex justify-between pt-2">
        <Button variant="secondary" type="button" onClick={onBack}><ChevronLeft size={16} /> Back</Button>
        <Button onClick={handleFinalSubmit} disabled={isSubmitting || (!selectedOwner && !showCreateForm && !isStreetAnimal)}>
          {isSubmitting ? 'Registering…' : 'Register Patient'}
        </Button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PatientForm() {
  const router = useRouter()
  const [step, setStep]             = useState(0)
  const [formData, setFormData]     = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStep1 = data => { setFormData(prev => ({ ...prev, ...data })); setStep(1) }
  const handleStep2 = data => { setFormData(prev => ({ ...prev, ...data })); setStep(2) }

  const handleFinalSubmit = async ({ selectedOwner, newOwner, relationship }) => {
    setIsSubmitting(true)
    try {
      let ownerId = selectedOwner?.id
      if (newOwner && newOwner.firstName && newOwner.phone && newOwner.email) {
        const created = await ownersApi.create({ firstName: newOwner.firstName, lastName: newOwner.lastName || '', phone: newOwner.phone, email: newOwner.email || null })
        ownerId = created.id
      }
      const patient = await patientsApi.create({ ...formData, isNeutered: formData.isNeutered ?? false, isStreetAnimal: formData.isStreetAnimal ?? false })
      if (ownerId && patient.id) {
        await fetch('/api/patient-owners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: patient.id, ownerId, relationship: relationship || 'primary' }) })
      }
      toast.success(`${formData.name} registered successfully!`)
      router.push(`/patients/${patient.id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to register patient')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator current={step} steps={['Basic Info', 'Health & Insurance', 'Owner']} />
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
        {step === 0 && <Step1 data={formData} onNext={handleStep1} />}
        {step === 1 && <Step2 data={formData} onNext={handleStep2} onBack={() => setStep(0)} />}
        {step === 2 && <Step3 isStreetAnimal={formData.isStreetAnimal} onBack={() => setStep(1)} onSubmit={handleFinalSubmit} isSubmitting={isSubmitting} />}
      </div>
    </div>
  )
}
