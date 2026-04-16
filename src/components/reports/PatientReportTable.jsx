'use client'

import Link from 'next/link'
import { PawPrint } from 'lucide-react'
import { Badge } from '@/components/ui'

export default function PatientReportTable({ patients }) {
  if (!patients.length) return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-16 text-center">
      <PawPrint size={40} className="mx-auto mb-3 text-gray-300 dark:text-zinc-700" />
      <p className="text-gray-500 dark:text-zinc-400">No patients match your filters</p>
    </div>
  )

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-200 dark:border-zinc-700">
            <tr>
              {['Patient','Species','Breed','Owner','Microchip','Status','Allergies'].map(h => (
                <th key={h} className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {patients.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors">
                <td className="px-5 py-3.5">
                  <Link href={`/patients/${p.id}`} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">{p.name}</Link>
                  {p.dateOfBirth && <p className="text-xs text-gray-400 mt-0.5">{Math.floor((new Date()-new Date(p.dateOfBirth))/(365.25*24*60*60*1000))} yrs</p>}
                </td>
                <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300 capitalize">{p.species}</td>
                <td className="px-5 py-3.5 text-gray-500 dark:text-zinc-400">{p.breed || '—'}</td>
                <td className="px-5 py-3.5 text-gray-500 dark:text-zinc-400">{p.ownerName || '—'}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{p.microchipNumber || '—'}</td>
                <td className="px-5 py-3.5">
                  <Badge color={p.status==='active'?'green':p.status==='deceased'?'red':'gray'} className="capitalize">{p.status||'active'}</Badge>
                </td>
                <td className="px-5 py-3.5 text-gray-400 text-xs max-w-32 truncate">{p.allergies || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30">
        <p className="text-xs text-gray-400">{patients.length} patient{patients.length!==1?'s':''}</p>
      </div>
    </div>
  )
}
