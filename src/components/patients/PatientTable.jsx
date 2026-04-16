'use client'

import Link from 'next/link'
import { PawPrint } from 'lucide-react'
import { Badge } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'

export default function PatientTable({ patients, loading }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-200 dark:border-zinc-700">
            <tr>
              {['Patient', 'Species / Breed', 'Owner', 'Microchip', 'Status', ''].map(h => (
                <th key={h} className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider last:text-right">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>{[...Array(6)].map((_, j) => (
                  <td key={j} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                ))}</tr>
              ))
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <PawPrint size={40} className="mx-auto mb-3 text-gray-300 dark:text-zinc-700" />
                  <p className="font-medium text-gray-600 dark:text-zinc-300">No patients yet</p>
                  <Link href="/patients/new" className="mt-3 inline-block text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                    Register first patient
                  </Link>
                </td>
              </tr>
            ) : (
              patients.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/patients/${p.id}`} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                        {p.primaryPhotoUrl
                          ? <img src={p.primaryPhotoUrl} alt={p.name} className="w-full h-full object-cover" />
                          : <span className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-400">{p.name?.[0]}</span>
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{p.name}</p>
                        {p.dateOfBirth && (
                          <p className="text-xs text-gray-400">{Math.floor((new Date() - new Date(p.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))} yrs</p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-zinc-300">
                    <p>{p.species}</p>
                    {p.breed && <p className="text-xs text-gray-400">{p.breed}</p>}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">
                    {p.ownerName || <span className="italic text-gray-300 dark:text-zinc-600">No owner</span>}
                  </td>
                  <td className="px-6 py-4">
                    {p.microchipNumber
                      ? <span className="font-mono text-xs text-gray-500">{p.microchipNumber}</span>
                      : <span className="text-gray-300 dark:text-zinc-600 text-xs">—</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={p.status === 'active' ? 'green' : p.status === 'deceased' ? 'red' : 'gray'} className="capitalize">
                      {p.status || 'active'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/patients/${p.id}`} className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">View</Link>
                      <Link href={`/patients/${p.id}/edit`} className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">Edit</Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && patients.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30">
          <p className="text-xs text-gray-400">{patients.length} patient{patients.length !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  )
}
