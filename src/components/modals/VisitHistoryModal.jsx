'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Stethoscope, Pill, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'

function VisitCard({ visit }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {visit.chiefComplaint || 'Visit Record'}
            </p>
            {visit.diagnosisPrimary && (
              <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                {visit.diagnosisPrimary}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-xs text-gray-400 dark:text-zinc-500 flex items-center gap-1">
              <Calendar size={11} />
              {new Date(visit.createdAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
            {visit.prescriptions?.length > 0 && (
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <Pill size={11} /> {visit.prescriptions.length} rx
              </span>
            )}
            {visit.labRequests?.length > 0 && (
              <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <FlaskConical size={11} /> {visit.labRequests.length} labs
              </span>
            )}
          </div>
        </div>
        <div className="ml-3 flex-shrink-0 text-gray-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-zinc-800 p-4 space-y-3 bg-gray-50 dark:bg-zinc-800/30">
          {(visit.weightKg || visit.temperature || visit.heartRate || visit.respiratoryRate) && (
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Weight', value: visit.weightKg,        suffix: 'kg'  },
                { label: 'Temp',   value: visit.temperature,     suffix: '°C'  },
                { label: 'HR',     value: visit.heartRate,       suffix: 'bpm' },
                { label: 'RR',     value: visit.respiratoryRate, suffix: '/m'  },
              ].map(v => v.value ? (
                <div key={v.label} className="bg-white dark:bg-zinc-900 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{v.label}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    {v.value}<span className="text-[10px] font-normal ml-0.5 text-gray-400">{v.suffix}</span>
                  </p>
                </div>
              ) : null)}
            </div>
          )}

          {visit.treatmentPlan && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Treatment Plan</p>
              <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">{visit.treatmentPlan}</p>
            </div>
          )}

          {visit.followUpInstructions && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Follow-up</p>
              <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">{visit.followUpInstructions}</p>
            </div>
          )}

          {visit.prescriptions?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Prescriptions</p>
              <div className="space-y-1">
                {visit.prescriptions.map((rx, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-green-50 dark:bg-green-900/10 px-3 py-2 rounded-lg">
                    <span className="font-medium text-gray-900 dark:text-white">{rx.drugName}</span>
                    <span className="text-gray-400">{[rx.dose, rx.frequency, rx.duration].filter(Boolean).join(' · ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {visit.labRequests?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Lab Requests</p>
              <div className="space-y-1">
                {visit.labRequests.map((lab, i) => (
                  <div key={i} className="text-xs bg-amber-50 dark:bg-amber-900/10 px-3 py-2 rounded-lg text-gray-700 dark:text-zinc-300">
                    {lab.testName}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function VisitHistoryModal({ patientId, patientName, onClose }) {
  const [visits, setVisits]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/visit-records?patientId=${patientId}`)
      .then(r => r.json())
      .then(data => setVisits(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [patientId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Stethoscope size={18} className="text-indigo-600" />
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Visit History</h2>
              <p className="text-xs text-gray-400 dark:text-zinc-500">{patientName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!loading && (
              <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full font-medium">
                {visits.length} visit{visits.length !== 1 ? 's' : ''}
              </span>
            )}
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
          ) : visits.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope size={36} className="mx-auto mb-3 text-gray-300 dark:text-zinc-700" />
              <p className="text-sm text-gray-500 dark:text-zinc-400">No previous visits found</p>
            </div>
          ) : (
            visits.map(v => <VisitCard key={v.id} visit={v} />)
          )}
        </div>
      </div>
    </div>
  )
}
