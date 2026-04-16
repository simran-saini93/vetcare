'use client'

import { Syringe, Printer, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'

const STATUS_COLOR = { up_to_date: 'green', due_soon: 'yellow', overdue: 'red' }
const STATUS_LABEL = { up_to_date: 'Up to date', due_soon: 'Due soon', overdue: 'Overdue' }
const STATUS_ICON  = { up_to_date: CheckCircle, due_soon: Clock, overdue: AlertCircle }

function getStatus(v) {
  if (!v.nextDueDate) return 'up_to_date'
  const days = Math.ceil((new Date(v.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24))
  if (days < 0) return 'overdue'
  if (days <= 30) return 'due_soon'
  return 'up_to_date'
}

function printCertificate(v, status) {
  const win = window.open('', '_blank')
  const administeredDate = v.administeredAt ? new Date(v.administeredAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'
  const validUntilDate   = v.nextDueDate    ? new Date(v.nextDueDate).toLocaleDateString('en-US',    { year: 'numeric', month: 'long', day: 'numeric' }) : '—'
  const statusColor      = status === 'overdue' ? '#ef4444' : status === 'due_soon' ? '#f59e0b' : '#10b981'
  const statusLabel      = STATUS_LABEL[status]

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vaccination Certificate</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; color: #111; max-width: 700px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .logo { font-size: 22px; font-weight: 800; color: #4f46e5; }
        .logo span { display: block; font-size: 11px; color: #888; font-weight: 400; margin-top: 2px; }
        .cert-title { text-align: right; }
        .cert-title h1 { font-size: 20px; font-weight: 700; color: #111; }
        .cert-title p { font-size: 12px; color: #666; margin-top: 4px; }
        .divider { border: none; border-top: 3px solid #4f46e5; margin: 24px 0; }
        .badge { display: inline-block; padding: 4px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; color: white; background: ${statusColor}; margin-bottom: 24px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
        .field label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; font-weight: 700; }
        .field p { font-size: 15px; color: #111; margin-top: 5px; font-weight: 600; }
        .validity-box { background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 20px; margin-bottom: 28px; }
        .validity-box h3 { font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
        .validity-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .validity-grid .field label { color: #166534; }
        .validity-grid .field p { color: #14532d; }
        .signature { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .sig-line { border-top: 1px solid #333; padding-top: 8px; font-size: 12px; color: #555; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; display: flex; justify-content: space-between; font-size: 11px; color: #aaa; }
        @media print { button { display: none !important; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🐾 VetCare Pro<span>HSCC Veterinary Clinic</span></div>
        <div class="cert-title">
          <h1>Vaccination Certificate</h1>
          <p>Issued: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <hr class="divider" />

      <div class="badge">${statusLabel}</div>

      <div class="grid">
        <div class="field"><label>Patient Name</label><p>${v.patientName || '—'}</p></div>
        <div class="field"><label>Vaccine</label><p>${v.vaccineName}</p></div>
        ${v.batchNumber ? `<div class="field"><label>Batch Number</label><p>${v.batchNumber}</p></div>` : ''}
        ${v.seriesTotal > 1 ? `<div class="field"><label>Dose</label><p>${v.doseNumber} of ${v.seriesTotal}</p></div>` : ''}
      </div>

      <div class="validity-box">
        <h3>✓ Validity Period</h3>
        <div class="validity-grid">
          <div class="field"><label>Administered On</label><p>${administeredDate}</p></div>
          <div class="field"><label>Valid Until / Next Due</label><p>${validUntilDate}</p></div>
        </div>
      </div>

      <div class="signature">
        <div><div class="sig-line">Attending Veterinarian</div></div>
        <div><div class="sig-line">Clinic Stamp & Date</div></div>
      </div>

      <div class="footer">
        <span>VetCare Pro · HSCC Veterinary Clinic</span>
        <span>Official Vaccination Record</span>
      </div>

      <script>window.onload = () => window.print()</script>
    </body>
    </html>
  `)
  win.document.close()
}

export default function VaccinationTable({ vaccinations, loading, onAdd }) {
  const withStatus = vaccinations.map(v => ({ ...v, status: getStatus(v) }))

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-200 dark:border-zinc-700">
            <tr>
              {['Patient', 'Vaccine', 'Dose', 'Administered', 'Valid Until', 'Status', ''].map(h => (
                <th key={h} className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider last:text-right">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(7)].map((_, j) => (
                  <td key={j} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                ))}</tr>
              ))
            ) : withStatus.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <Syringe size={40} className="mx-auto mb-3 text-gray-300 dark:text-zinc-700" />
                  <p className="text-gray-500 dark:text-zinc-400">No vaccinations recorded yet</p>
                  <button onClick={onAdd} className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                    Record first vaccination
                  </button>
                </td>
              </tr>
            ) : (
              withStatus.map(v => {
                const StatusIcon   = STATUS_ICON[v.status] || Clock
                const daysUntilDue = v.nextDueDate
                  ? Math.ceil((new Date(v.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24))
                  : null
                return (
                  <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                          {v.patientPhotoUrl
                            ? <img src={v.patientPhotoUrl} alt={v.patientName} className="w-full h-full object-cover" />
                            : <span className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">{v.patientName?.[0]}</span>
                          }
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{v.patientName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{v.vaccineName}</p>
                      {v.batchNumber && <p className="text-xs text-gray-400">Batch: {v.batchNumber}</p>}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">
                      {v.seriesTotal > 1 ? `${v.doseNumber}/${v.seriesTotal}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">
                      {v.administeredAt ? new Date(v.administeredAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {v.nextDueDate ? (
                        <div>
                          <p className="text-gray-700 dark:text-zinc-300">{new Date(v.nextDueDate).toLocaleDateString()}</p>
                          {daysUntilDue !== null && (
                            <p className={`text-xs ${daysUntilDue < 0 ? 'text-red-500' : daysUntilDue <= 30 ? 'text-amber-500' : 'text-gray-400'}`}>
                              {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}d overdue` : daysUntilDue === 0 ? 'Due today' : `In ${daysUntilDue}d`}
                            </p>
                          )}
                        </div>
                      ) : <span className="text-xs text-gray-300 dark:text-zinc-600 italic">Not set</span>}
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={STATUS_COLOR[v.status]} className="flex items-center gap-1 w-fit capitalize">
                        <StatusIcon size={11} />
                        {STATUS_LABEL[v.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => printCertificate(v, v.status)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
                        >
                          <Printer size={13} /> Certificate
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {!loading && withStatus.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30">
          <p className="text-xs text-gray-400">{withStatus.length} vaccination{withStatus.length !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  )
}
