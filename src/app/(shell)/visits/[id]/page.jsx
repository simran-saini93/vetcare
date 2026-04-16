'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  ArrowLeft, Printer, Pill, FlaskConical,
  Scale, Thermometer, Heart, Stethoscope,
  Lock, Calendar, User, FileText
} from 'lucide-react'
import { visitRecordsApi, patientsApi } from '@/lib/api'
import { Button, Badge } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'

// ── Print discharge summary ───────────────────────────────────────────────────

function printDischarge(visit, patient, prescriptions, labRequests) {
  const win = window.open('', '_blank')

  const rxRows = prescriptions.map(rx => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;font-weight:600">${rx.drugName}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0">${rx.dose || '—'}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0">${rx.frequency || '—'}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0">${rx.duration || '—'}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;color:#666">${rx.dispensingNotes || '—'}</td>
    </tr>
  `).join('')

  const labRows = labRequests.map(lab => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;font-weight:600">${lab.testName}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;color:#666">${lab.status}</td>
    </tr>
  `).join('')

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Discharge Summary</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: Arial, sans-serif; padding:40px; color:#111; max-width:800px; margin:0 auto; }
        .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; }
        .logo { font-size:22px; font-weight:800; color:#4f46e5; }
        .logo span { display:block; font-size:11px; color:#888; font-weight:400; margin-top:2px; }
        .title { font-size:20px; font-weight:700; color:#111; margin-bottom:4px; }
        .subtitle { color:#666; font-size:13px; }
        .divider { border:none; border-top:2px solid #4f46e5; margin:24px 0; }
        .divider-light { border:none; border-top:1px solid #eee; margin:16px 0; }
        .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px; }
        .field label { font-size:11px; text-transform:uppercase; letter-spacing:0.05em; color:#888; font-weight:600; }
        .field p { font-size:14px; color:#111; margin-top:4px; font-weight:500; }
        .section { margin-bottom:24px; }
        .section h3 { font-size:13px; text-transform:uppercase; letter-spacing:0.05em; color:#4f46e5; font-weight:700; margin-bottom:12px; display:flex; align-items:center; gap:8px; }
        .section h3::after { content:''; flex:1; height:1px; background:#e5e7eb; }
        .section p { font-size:14px; color:#333; line-height:1.6; background:#f9fafb; padding:12px; border-radius:8px; }
        table { width:100%; border-collapse:collapse; font-size:13px; }
        th { text-align:left; padding:8px; background:#f3f4f6; color:#555; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; }
        .highlight { background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:16px; margin-top:8px; }
        .highlight h3 { color:#92400e; margin-bottom:8px; font-size:14px; }
        .highlight p { color:#78350f; font-size:14px; line-height:1.6; background:transparent; padding:0; }
        .footer { margin-top:40px; padding-top:20px; border-top:1px solid #eee; display:flex; justify-content:space-between; font-size:12px; color:#999; }
        .signature { margin-top:40px; display:grid; grid-template-columns:1fr 1fr; gap:40px; }
        .sig-line { border-top:1px solid #333; padding-top:8px; font-size:12px; color:#555; }
        @media print { button { display:none !important; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🐾 VetCare Pro<span>HSCC Veterinary Clinic</span></div>
        <div style="text-align:right">
          <div class="title">Discharge Summary</div>
          <div class="subtitle">${new Date(visit.createdAt).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
        </div>
      </div>

      <hr class="divider" />

      <div class="grid">
        <div class="field"><label>Patient Name</label><p>${patient?.name || '—'}</p></div>
        <div class="field"><label>Species / Breed</label><p>${patient?.species || '—'}${patient?.breed ? ' · ' + patient.breed : ''}</p></div>
        <div class="field"><label>Visit Type</label><p>Clinical Examination</p></div>
        <div class="field"><label>Date</label><p>${new Date(visit.createdAt).toLocaleDateString()}</p></div>
      </div>

      ${(visit.weightKg || visit.temperature || visit.heartRate || visit.respiratoryRate) ? `
      <div class="section">
        <h3>Vitals</h3>
        <div class="grid" style="margin-bottom:0">
          ${visit.weightKg        ? `<div class="field"><label>Weight</label><p>${visit.weightKg} kg</p></div>` : ''}
          ${visit.temperature     ? `<div class="field"><label>Temperature</label><p>${visit.temperature} °C</p></div>` : ''}
          ${visit.heartRate       ? `<div class="field"><label>Heart Rate</label><p>${visit.heartRate} bpm</p></div>` : ''}
          ${visit.respiratoryRate ? `<div class="field"><label>Respiratory Rate</label><p>${visit.respiratoryRate} /min</p></div>` : ''}
        </div>
      </div>` : ''}

      ${visit.chiefComplaint ? `<div class="section"><h3>Reason for Visit</h3><p>${visit.chiefComplaint}</p></div>` : ''}
      ${visit.diagnosisPrimary ? `<div class="section"><h3>Diagnosis</h3><p>${visit.diagnosisPrimary}${visit.diagnosisDifferential ? '<br><em style="color:#666">Differential: ' + visit.diagnosisDifferential + '</em>' : ''}</p></div>` : ''}
      ${visit.treatmentPlan ? `<div class="section"><h3>Treatment Plan</h3><p>${visit.treatmentPlan}</p></div>` : ''}

      ${prescriptions.length > 0 ? `
      <div class="section">
        <h3>Prescriptions</h3>
        <table>
          <thead><tr><th>Drug</th><th>Dose</th><th>Frequency</th><th>Duration</th><th>Notes</th></tr></thead>
          <tbody>${rxRows}</tbody>
        </table>
      </div>` : ''}

      ${labRequests.length > 0 ? `
      <div class="section">
        <h3>Lab Requests</h3>
        <table>
          <thead><tr><th>Test</th><th>Status</th></tr></thead>
          <tbody>${labRows}</tbody>
        </table>
      </div>` : ''}

      ${visit.followUpInstructions ? `
      <div class="highlight">
        <h3>📋 Instructions for Owner</h3>
        <p>${visit.followUpInstructions.replace(/\n/g, '<br>')}</p>
      </div>` : ''}

      <div class="signature">
        <div>
          <div class="sig-line">Attending Veterinarian</div>
        </div>
        <div>
          <div class="sig-line">Date & Stamp</div>
        </div>
      </div>

      <div class="footer">
        <span>VetCare Pro · HSCC Veterinary Clinic</span>
        <span>This is an official medical document</span>
      </div>

      <script>window.onload = () => window.print()</script>
    </body>
    </html>
  `)
  win.document.close()
}

// ── Info block ────────────────────────────────────────────────────────────────

function InfoBlock({ label, value, fullWidth }) {
  if (!value) return null
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-gray-900 dark:text-white leading-relaxed">{value}</p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function VisitDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [visit, setVisit]     = useState(null)
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    visitRecordsApi.getById(id)
      .then(async data => {
        setVisit(data)
        if (data.patientId) {
          const pat = await patientsApi.getById(data.patientId)
          setPatient(pat)
        }
      })
      .catch(() => { toast.error('Visit not found'); router.push('/appointments') })
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-8 w-48" />
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
    </div>
  )

  if (!visit) return null

  const prescriptions = visit.prescriptions || []
  const labRequests   = visit.labRequests   || []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={patient ? `/patients/${patient.id}` : '/appointments'}
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} /> {patient ? `Back to ${patient.name}` : 'Back'}
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Visit Record</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {new Date(visit.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              {patient && (
                <span className="flex items-center gap-1.5">
                  <User size={13} />
                  {patient.name}
                </span>
              )}
            </p>
          </div>
          <Button onClick={() => printDischarge(visit, patient, prescriptions, labRequests)}>
            <Printer size={16} /> Print Discharge
          </Button>
        </div>
      </div>

      {/* Vitals */}
      {(visit.weightKg || visit.temperature || visit.heartRate || visit.respiratoryRate) && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Scale size={18} className="text-blue-600" />
            <h2 className="font-bold text-gray-900 dark:text-white">Vitals</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Weight',        value: visit.weightKg,        suffix: 'kg'  },
              { label: 'Temperature',   value: visit.temperature,     suffix: '°C'  },
              { label: 'Heart Rate',    value: visit.heartRate,       suffix: 'bpm' },
              { label: 'Resp. Rate',    value: visit.respiratoryRate, suffix: '/min'},
            ].map(v => v.value ? (
              <div key={v.label} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{v.label}</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-1">{v.value}<span className="text-sm ml-1">{v.suffix}</span></p>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      {/* Clinical notes */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Stethoscope size={18} className="text-indigo-600" />
          <h2 className="font-bold text-gray-900 dark:text-white">Clinical Examination</h2>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <InfoBlock label="Chief Complaint"         value={visit.chiefComplaint}       fullWidth />
          <InfoBlock label="Primary Diagnosis"       value={visit.diagnosisPrimary}              />
          <InfoBlock label="Differential Diagnosis"  value={visit.diagnosisDifferential}         />
          <InfoBlock label="Diagnosis Code"          value={visit.diagnosisCode}                 />
          <InfoBlock label="Treatment Plan"          value={visit.treatmentPlan}        fullWidth />
          <InfoBlock label="Procedures Performed"    value={visit.proceduresPerformed}  fullWidth />
          <InfoBlock label="Follow-up Instructions"  value={visit.followUpInstructions} fullWidth />
        </div>
        {visit.internalNotes && (
          <div className="mt-5 p-4 bg-gray-50 dark:bg-zinc-800 border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={13} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Internal Notes (Staff only)</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-zinc-300">{visit.internalNotes}</p>
          </div>
        )}
      </div>

      {/* Prescriptions */}
      {prescriptions.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Pill size={18} className="text-green-600" />
            <h2 className="font-bold text-gray-900 dark:text-white">Prescriptions</h2>
            <span className="ml-auto text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">
              {prescriptions.length} drug{prescriptions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-3">
            {prescriptions.map((rx, i) => (
              <div key={i} className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{rx.drugName}</p>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                      {[rx.dose, rx.frequency, rx.duration].filter(Boolean).join(' · ')}
                    </p>
                    {rx.dispensingNotes && (
                      <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 italic">{rx.dispensingNotes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lab requests */}
      {labRequests.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <FlaskConical size={18} className="text-amber-600" />
            <h2 className="font-bold text-gray-900 dark:text-white">Lab Requests</h2>
            <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold">
              {labRequests.length} test{labRequests.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {labRequests.map((lab, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{lab.testName}</p>
                <Badge color={lab.status === 'completed' ? 'green' : lab.status === 'in_progress' ? 'blue' : 'yellow'} className="capitalize text-xs">
                  {lab.status?.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up highlight */}
      {visit.followUpInstructions && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} className="text-amber-600" />
            <h2 className="font-bold text-amber-900 dark:text-amber-300">Owner Instructions</h2>
            <span className="text-xs text-amber-600 dark:text-amber-400 ml-auto">Printed on discharge</span>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed whitespace-pre-line">
            {visit.followUpInstructions}
          </p>
        </div>
      )}

      {/* Print button bottom */}
      <div className="flex justify-end pb-8">
        <Button onClick={() => printDischarge(visit, patient, prescriptions, labRequests)}>
          <Printer size={16} /> Print Discharge Summary
        </Button>
      </div>
    </div>
  )
}
