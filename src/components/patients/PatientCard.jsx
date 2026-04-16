'use client'

import Link from 'next/link'
import { Users, Phone, Calendar, MapPin } from 'lucide-react'

const SPECIES_EMOJI = {
  Dog: '🐶', Cat: '🐱', Bird: '🐦',
  Rabbit: '🐰', Reptile: '🦎', Other: '🐾',
}

function VaccinationBadge({ status }) {
  if (!status) return null
  const styles = {
    up_to_date: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    due_soon:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    overdue:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  const labels = { up_to_date: 'Up to date', due_soon: 'Due soon', overdue: 'Overdue' }
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

export default function PatientCard({ patient }) {
  const age = patient.dateOfBirth
  ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}y`
  : null

  return (
    <Link
      href={`/patients/${patient.id}`}
      className="group block bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            {patient.primaryPhotoUrl ? (
              <img
                src={patient.primaryPhotoUrl}
                alt={patient.name}
                className="w-14 h-14 rounded-xl object-cover ring-2 ring-gray-100 dark:ring-zinc-800"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-2xl">
                {SPECIES_EMOJI[patient.species] || '🐾'}
              </div>
            )}
            {patient.isStreetAnimal && (
              <span className="absolute -top-1 -right-1 text-base" title="Street animal">🏠</span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <VaccinationBadge status={patient.vaccinationStatus} />
            {!patient.isActive && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">
                Inactive
              </span>
            )}
          </div>
        </div>

        {/* Name & breed */}
        <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {patient.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
          {[patient.breed, patient.species, age].filter(Boolean).join(' · ')}
        </p>

        {/* Owner info */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-1.5">
          {patient.isStreetAnimal ? (
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <MapPin size={12} />
              <span>Street animal — no owner</span>
            </div>
          ) : (
            <>
              {patient.ownerName && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
                  <Users size={12} />
                  <span className="truncate">{patient.ownerName}</span>
                </div>
              )}
              {patient.ownerPhone && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
                  <Phone size={12} />
                  <span>{patient.ownerPhone}</span>
                </div>
              )}
            </>
          )}
          {patient.lastVisitDate && (
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-zinc-500">
              <Calendar size={12} />
              <span>Last visit: {new Date(patient.lastVisitDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
