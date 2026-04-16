'use client'

import { Syringe, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui'

const STATUS_COLOR = { up_to_date: 'green', due_soon: 'yellow', overdue: 'red' }
const STATUS_LABEL = { up_to_date: 'Up to date', due_soon: 'Due soon', overdue: 'Overdue' }
const STATUS_ICON  = { up_to_date: CheckCircle, due_soon: Clock, overdue: AlertCircle }

export default function VaccinationReportTable({ vaccinations }) {
  if (!vaccinations.length) return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-16 text-center">
      <Syringe size={40} className="mx-auto mb-3 text-gray-300 dark:text-zinc-700" />
      <p className="text-gray-500 dark:text-zinc-400">No vaccinations match your filters</p>
    </div>
  )

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-200 dark:border-zinc-700">
            <tr>
              {['Patient','Vaccine','Batch','Dose','Administered','Valid Until','Status'].map(h => (
                <th key={h} className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {vaccinations.map(v => {
              const Icon = STATUS_ICON[v.status] || Clock
              const days = v.nextDueDate ? Math.ceil((new Date(v.nextDueDate)-new Date())/(1000*60*60*24)) : null
              return (
                <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">{v.patientName||'—'}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{v.vaccineName}</td>
                  <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{v.batchNumber||'—'}</td>
                  <td className="px-5 py-3.5 text-gray-500 dark:text-zinc-400">{v.seriesTotal>1?`${v.doseNumber}/${v.seriesTotal}`:'—'}</td>
                  <td className="px-5 py-3.5 text-gray-500 dark:text-zinc-400">{v.administeredAt?new Date(v.administeredAt).toLocaleDateString():'—'}</td>
                  <td className="px-5 py-3.5">
                    {v.nextDueDate ? (
                      <div>
                        <p className="text-gray-700 dark:text-zinc-300">{new Date(v.nextDueDate).toLocaleDateString()}</p>
                        {days!==null&&<p className={`text-xs ${days<0?'text-red-500':days<=30?'text-amber-500':'text-gray-400'}`}>{days<0?`${Math.abs(days)}d overdue`:days===0?'Today':`In ${days}d`}</p>}
                      </div>
                    ) : <span className="text-xs text-gray-300 italic">Not set</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge color={STATUS_COLOR[v.status]} className="flex items-center gap-1 w-fit capitalize">
                      <Icon size={11} />{STATUS_LABEL[v.status]}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30">
        <p className="text-xs text-gray-400">{vaccinations.length} record{vaccinations.length!==1?'s':''}</p>
      </div>
    </div>
  )
}
