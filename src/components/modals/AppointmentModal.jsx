'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { X, Search, Calendar, Clock, User } from 'lucide-react'
import { useVetCareStore } from '@/store'
import { appointmentsApi, patientsApi } from '@/lib/api'
import { Button, Input, Select } from '@/components/ui'
import { randomUUID } from 'crypto'

const Schema = z.object({
  scheduledAt: z.string().min(1, 'Date & time is required'),
  type: z.string().min(1, 'Type is required'),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
})

export default function AppointmentModal() {
  const { modals, closeModal, appointments, setAppointments, prefillPatientId } = useVetCareStore()
  const isOpen = modals.appointment

  const [patientQuery, setPatientQuery] = useState('')
  const [patientResults, setPatientResults] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const searchRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(Schema),
    defaultValues: { type: 'checkup' },
  })

  useEffect(() => {
    if (!isOpen) return
    if (prefillPatientId) {
      patientsApi
        .getById(prefillPatientId)
        .then((p) => setSelectedPatient(p))
        .catch(console.error)
    }
  }, [isOpen, prefillPatientId])

  useEffect(() => {
    if (!isOpen) {
      reset()
      setPatientQuery('')
      setPatientResults([])
      setSelectedPatient(null)
    }
  }, [isOpen, reset])

  useEffect(() => {
    if (!patientQuery || patientQuery.length < 2) {
      setPatientResults([])
      return
    }

    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const all = await patientsApi.getAll()
        setPatientResults(
          all
            .filter(
              (p) =>
                p.name.toLowerCase().includes(patientQuery.toLowerCase()) ||
                p.breed?.toLowerCase().includes(patientQuery.toLowerCase())
            )
            .slice(0, 6)
        )
      } catch {}
      setSearching(false)
    }, 300)

    return () => clearTimeout(t)
  }, [patientQuery])

  const onSubmit = async (data) => {
    if (!selectedPatient) {
      toast.error('Please select a patient')
      return
    }

    setSubmitting(true)
    try {
      const result = await appointmentsApi.create({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        type: data.type,
        followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString() : null,
        notes: data.notes || null,
      })

      setAppointments([
        {
          id: result.id,
          patientId: selectedPatient.id,
          patientName: selectedPatient.name,
          scheduledAt: data.scheduledAt,
          type: data.type,
          status: 'scheduled',
          notes: data.notes || null,
        },
        ...appointments,
      ])

      toast.success(`Appointment booked for ${selectedPatient.name}`)
      closeModal('appointment')
    } catch (err) {
      toast.error(err.message || 'Failed to book appointment')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Book Appointment</h2>
          </div>
          <button
            onClick={() => closeModal('appointment')}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[80vh] space-y-5 overflow-y-auto p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Patient *
            </label>
            {selectedPatient ? (
              <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-800 dark:bg-indigo-900/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-900/50">
                    {selectedPatient.name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">
                      {selectedPatient.name}
                    </p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">
                      {selectedPatient.species}
                      {selectedPatient.breed ? ` · ${selectedPatient.breed}` : ''}
                    </p>
                  </div>
                </div>
                {!prefillPatientId && (
                  <button
                    onClick={() => {
                      setSelectedPatient(null)
                      setPatientQuery('')
                    }}
                    className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Change
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={patientQuery}
                  onChange={(e) => setPatientQuery(e.target.value)}
                  placeholder="Search patient by name or breed…"
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
                {patientResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                    {patientResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPatient(p)
                          setPatientQuery('')
                          setPatientResults([])
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      >
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-900/50">
                          {p.name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                          <p className="text-xs text-gray-400">
                            {p.species}
                            {p.breed ? ` · ${p.breed}` : ''}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searching && (
                  <p className="absolute left-0 top-full mt-1 px-1 text-xs text-gray-400">Searching…</p>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:text-white ${
                  errors.scheduledAt ? 'border-red-300' : 'border-gray-300 dark:border-zinc-700'
                }`}
                {...register('scheduledAt')}
              />
              {errors.scheduledAt && (
                <p className="mt-1 text-xs text-red-500">{errors.scheduledAt.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Type *
                </label>
                <select
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  {...register('type')}
                >
                  <option value="checkup">Checkup</option>
                  <option value="surgery">Surgery</option>
                  <option value="emergency">Emergency</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="grooming">Grooming</option>
                  <option value="followup">Follow-up</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  {...register('followUpDate')}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Notes
              </label>
              <textarea
                rows={3}
                placeholder="Any special instructions or reason for visit…"
                className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                {...register('notes')}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => closeModal('appointment')}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !selectedPatient}>
                {submitting ? 'Booking…' : 'Book Appointment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
