'use client'

import { Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import PatientCard from '@/components/patients/PatientCard'

export default function PatientSearchGrid({ results, loading, query }) {
  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )

  if (results.length === 0) return (
    <div className="text-center py-20">
      <Search size={40} className="mx-auto mb-3 text-gray-300 dark:text-zinc-700" />
      <p className="font-medium text-gray-600 dark:text-zinc-300">No patients found for &quot;{query}&quot;</p>
      <p className="text-sm text-gray-400 mt-1">Try name, breed, owner, phone or microchip</p>
    </div>
  )

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {results.map(patient => <PatientCard key={patient.id} patient={patient} />)}
    </div>
  )
}
