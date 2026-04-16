'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  ArrowLeft, Edit2, Calendar, Syringe, Plus, Printer, Upload, Eye, Trash2,
  FileText, Image, AlertCircle, Heart,
  Shield, MapPin, Phone, Mail, User,
  Scale, Microchip, Palette, Info
} from 'lucide-react'
import { patientsApi, appointmentsApi } from '@/lib/api'
import { Button, Badge } from '@/components/ui'
import { ProfileSkeleton } from '@/components/ui/Skeleton'
import WeightChart from '@/components/patients/WeightChart'
import PhotoGallery from '@/components/patients/PhotoGallery'
import SmartCombobox from '@/components/ui/SmartCombobox'
import dynamic from 'next/dynamic'
const CertificateViewer = dynamic(() => import('@/components/vaccinations/CertificateViewer'), { ssr: false })
import { useVetCareStore } from '@/store'

const SPECIES_EMOJI = {
  Dog: '🐶', Cat: '🐱', Bird: '🐦',
  Rabbit: '🐰', Reptile: '🦎', Other: '🐾',
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null
  const dob = new Date(dateOfBirth)
  const now = new Date()
  const years = Math.floor((now - dob) / (365.25 * 24 * 60 * 60 * 1000))
  const months = Math.floor((now - dob) / (30.44 * 24 * 60 * 60 * 1000))
  if (years >= 1) return `${years}y ${months % 12}m`
  return `${months}m`
}

// ── Info chip ─────────────────────────────────────────────────────────────────

function InfoChip({ icon: Icon, label, value, className = '' }) {
  if (!value) return null
  return (
    <div className={`flex items-start gap-2.5 p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl ${className}`}>
      <Icon size={15} className="text-gray-400 dark:text-zinc-500 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5 truncate">{value}</p>
      </div>
    </div>
  )
}

// ── Tab button ────────────────────────────────────────────────────────────────

function Tab({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
          : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
      }`}
    >
      <Icon size={16} />
      {label}
      {count != null && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
          active ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}

// ── Overview tab ──────────────────────────────────────────────────────────────

function OverviewTab({ patient }) {
  return (
    <div className="space-y-6">
      {/* Alerts */}
      {patient.allergies && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Known Allergies</p>
            <p className="text-sm text-red-600 dark:text-red-300 mt-0.5">{patient.allergies}</p>
          </div>
        </div>
      )}
      {patient.handlingNotes && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <Info size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Handling Notes</p>
            <p className="text-sm text-amber-600 dark:text-amber-300 mt-0.5">{patient.handlingNotes}</p>
          </div>
        </div>
      )}

      {/* Weight */}
      {patient.weights?.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Scale size={16} className="text-indigo-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Weight History</h3>
          </div>
          <WeightChart records={patient.weights} />
        </div>
      )}

      {/* Chronic conditions */}
      {patient.chronicConditions && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={16} className="text-rose-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Chronic Conditions</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-zinc-300">{patient.chronicConditions}</p>
        </div>
      )}

      {/* Insurance */}
      {(patient.insuranceProvider || patient.insurancePolicyNo) && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Insurance</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {patient.insuranceProvider && (
              <div>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Provider</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{patient.insuranceProvider}</p>
              </div>
            )}
            {patient.insurancePolicyNo && (
              <div>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Policy No.</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{patient.insurancePolicyNo}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Owners */}
      {patient.owners?.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Owners</h3>
          <div className="space-y-3">
            {patient.owners.map(o => (
              <div key={o.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold">
                    {o.firstName?.[0]}{o.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{o.firstName} {o.lastName}</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">{o.phone}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 rounded-full capitalize">
                  {o.relationship}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Visits tab ────────────────────────────────────────────────────────────────

function VisitsTab({ patientId }) {
  const [visitRecords, setVisitRecords] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/visit-records?patientId=${patientId}`).then(r => r.json()),
      appointmentsApi.getAll().then(data => Array.isArray(data) ? data.filter(a => a.patientId === patientId) : []),
    ])
      .then(([visits, apts]) => {
        setVisitRecords(Array.isArray(visits) ? visits : [])
        setAppointments(apts)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [patientId])

  if (loading) return <div className="text-center py-12 text-gray-400">Loading visits…</div>

  const upcomingApts = appointments.filter(a => a.status === 'scheduled')

  return (
    <div className="space-y-6">
      {/* Upcoming appointments */}
      {upcomingApts.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Upcoming Appointments</p>
          <div className="space-y-2">
            {upcomingApts.map(apt => (
              <div key={apt.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{apt.type}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                    {apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </p>
                </div>
                <Link
                  href={`/visits/new?appointmentId=${apt.id}&patientId=${patientId}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800"
                >
                  Start Visit →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visit records */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Visit History</p>
          <Link
            href={`/visits/new?patientId=${patientId}`}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            + New Visit
          </Link>
        </div>

        {visitRecords.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={36} className="mx-auto mb-3 text-gray-300 dark:text-zinc-700" />
            <p className="text-sm text-gray-500 dark:text-zinc-400">No visit records yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visitRecords.map(v => (
              <Link
                key={v.id}
                href={`/visits/${v.id}`}
                className="block p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {v.chiefComplaint || 'Visit Record'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                      {new Date(v.createdAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    {v.diagnosisPrimary && (
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5">
                        Dx: {v.diagnosisPrimary}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-indigo-500 dark:text-indigo-400 ml-4">View →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Vaccinations tab ──────────────────────────────────────────────────────────

function printCertificate(v, status) {
  const win = window.open('', '_blank')
  const STATUS_LABEL = { up_to_date: 'Up to date', due_soon: 'Due soon', overdue: 'Overdue' }
  const statusColor  = status === 'overdue' ? '#ef4444' : status === 'due_soon' ? '#f59e0b' : '#10b981'
  const administeredDate = v.administeredAt ? new Date(v.administeredAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'
  const validUntilDate   = v.nextDueDate    ? new Date(v.nextDueDate).toLocaleDateString('en-US',    { year: 'numeric', month: 'long', day: 'numeric' }) : '—'
  win.document.write(`<!DOCTYPE html><html><head><title>Vaccination Certificate</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:40px;color:#111;max-width:700px;margin:0 auto}
    .logo{font-size:22px;font-weight:800;color:#4f46e5}.logo span{display:block;font-size:11px;color:#888;font-weight:400;margin-top:2px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px}
    hr{border:none;border-top:3px solid #4f46e5;margin:24px 0}
    .badge{display:inline-block;padding:4px 14px;border-radius:999px;font-size:12px;font-weight:700;color:white;background:${statusColor};margin-bottom:24px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px}
    .field label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#888;font-weight:700}
    .field p{font-size:15px;color:#111;margin-top:5px;font-weight:600}
    .validity-box{background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:20px;margin-bottom:28px}
    .validity-box h3{font-size:13px;font-weight:700;color:#166534;margin-bottom:12px;text-transform:uppercase}
    .sig{margin-top:48px;display:grid;grid-template-columns:1fr 1fr;gap:40px}
    .sig-line{border-top:1px solid #333;padding-top:8px;font-size:12px;color:#555}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #eee;display:flex;justify-content:space-between;font-size:11px;color:#aaa}
    @media print{button{display:none!important}}</style></head><body>
    <div class="header"><div class="logo">🐾 VetCare Pro<span>HSCC Veterinary Clinic</span></div>
    <div style="text-align:right"><h1 style="font-size:20px;font-weight:700">Vaccination Certificate</h1>
    <p style="font-size:12px;color:#666;margin-top:4px">Issued: ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p></div></div>
    <hr/><div class="badge">${STATUS_LABEL[status]}</div>
    <div class="grid">
    <div class="field"><label>Patient Name</label><p>${v.vaccineName ? v.vaccineName : '—'}</p></div>
    <div class="field"><label>Vaccine</label><p>${v.vaccineName}</p></div>
    ${v.batchNumber ? `<div class="field"><label>Batch Number</label><p>${v.batchNumber}</p></div>` : ''}
    ${v.seriesTotal > 1 ? `<div class="field"><label>Dose</label><p>${v.doseNumber} of ${v.seriesTotal}</p></div>` : ''}
    </div>
    <div class="validity-box"><h3>✓ Validity Period</h3>
    <div class="grid" style="margin-bottom:0">
    <div class="field"><label>Administered On</label><p>${administeredDate}</p></div>
    <div class="field"><label>Valid Until / Next Due</label><p>${validUntilDate}</p></div>
    </div></div>
    <div class="sig"><div><div class="sig-line">Attending Veterinarian</div></div><div><div class="sig-line">Clinic Stamp & Date</div></div></div>
    <div class="footer"><span>VetCare Pro · HSCC Veterinary Clinic</span><span>Official Vaccination Record</span></div>
    <script>window.onload=()=>window.print()</script></body></html>`)
  win.document.close()
}


function VaccineCard({ name, sorted, totalDoses, doneDoses, isComplete, status, latest, uploadingId, setUploadingId, setViewingCert, openNextDose, getStatus, load, STATUS_COLOR, STATUS_LABEL }) {
  const [selectedDose, setSelectedDose] = useState(doneDoses - 1) // default latest done

  const dose    = sorted[selectedDose]
  const doseDays = dose?.nextDueDate
    ? Math.ceil((new Date(dose.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  const handleUpload = async (file, doseId) => {
    setUploadingId(doseId)
    try {
      const authRes  = await fetch('/api/imagekit-auth')
      const authData = await authRes.json()
      const fd = new FormData()
      fd.append('file', file)
      fd.append('fileName', `cert-${doseId}-${Date.now()}`)
      fd.append('publicKey',  process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY)
      fd.append('signature',  authData.signature)
      fd.append('expire',     authData.expire)
      fd.append('token',      authData.token)
      fd.append('folder',     '/vetcare/certificates')
      const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', body: fd })
      const data = await uploadRes.json()
      if (data.url) {
        await fetch(`/api/vaccinations/${doseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uploadedCertUrl: data.url }),
        })
        load()
        toast.success('Certificate uploaded')
      } else {
        throw new Error(data.message || 'Upload failed')
      }
    } catch (err) { toast.error(err.message || 'Upload failed') }
    finally { setUploadingId(null) }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{name}</p>
          {totalDoses > 1 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
              isComplete
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'
            }`}>
              {isComplete ? `✓ ${totalDoses} doses` : `${doneDoses}/${totalDoses}`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Badge color={STATUS_COLOR[status]} className="capitalize text-xs">{STATUS_LABEL[status]}</Badge>
          {!isComplete && (
            <button onClick={() => openNextDose(latest)}
              className="text-xs px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors font-medium">
              + Dose {doneDoses + 1}
            </button>
          )}
        </div>
      </div>

      {/* Dose tabs */}
      {totalDoses > 1 && (
        <div className="flex items-center gap-1.5 px-4 pt-3">
          {Array.from({ length: totalDoses }).map((_, i) => {
            const done = i < doneDoses
            const selected = selectedDose === i
            return (
              <button
                key={i}
                onClick={() => done && setSelectedDose(i)}
                disabled={!done}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  selected
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 dark:ring-indigo-700 scale-110'
                    : done
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/60'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-300 dark:text-zinc-600 cursor-not-allowed'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
          {totalDoses === 1 && null}
        </div>
      )}

      {/* Selected dose details */}
      {dose && (
        <div className="px-4 py-3">
          {totalDoses > 1 && (
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1.5">Dose {dose.doseNumber}</p>
          )}

          {/* Info + actions in one row on lg, stacked on mobile */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
            {/* Info */}
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Given: <span className="text-gray-700 dark:text-zinc-200">{new Date(dose.administeredAt).toLocaleDateString()}</span>
              </p>
              {dose.nextDueDate && (
                <p className={`text-xs ${doseDays < 0 ? 'text-red-500' : doseDays <= 30 ? 'text-amber-500' : 'text-gray-400'}`}>
                  Next: {new Date(dose.nextDueDate).toLocaleDateString()}
                  {doseDays !== null && ` (${doseDays < 0 ? `${Math.abs(doseDays)}d overdue` : doseDays === 0 ? 'today' : `in ${doseDays}d`})`}
                </p>
              )}
              {dose.batchNumber && (
                <p className="text-xs text-gray-400 font-mono">#{dose.batchNumber}</p>
              )}
            </div>

            {/* Action buttons — right aligned on lg */}
            <div className="flex items-center gap-1.5 flex-wrap lg:flex-nowrap lg:flex-shrink-0">
              <button onClick={() => printCertificate(dose, getStatus(dose))}
                className="text-xs px-2.5 py-1.5 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 transition-colors flex items-center gap-1">
                <Printer size={14} /> Print
              </button>
              {dose.uploadedCertUrl && (
                <>
                  <button onClick={() => setViewingCert(dose.uploadedCertUrl)}
                    className="text-xs px-2.5 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg border border-green-200 dark:border-green-800 transition-colors flex items-center gap-1 font-medium">
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('Delete this certificate? This cannot be undone.')) return
                      try {
                        // Delete from ImageKit via API
                        await fetch('/api/imagekit-delete', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ url: dose.uploadedCertUrl }),
                        })
                        // Clear from DB
                        await fetch(`/api/vaccinations/${dose.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ uploadedCertUrl: null }),
                        })
                        load()
                        toast.success('Certificate deleted')
                      } catch { toast.error('Failed to delete certificate') }
                    }}
                    className="text-xs px-2.5 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg border border-red-200 dark:border-red-800 transition-colors flex items-center gap-1">
                    <Trash2 size={14} /> Delete
                  </button>
                </>
              )}
              <label className={`text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg border border-gray-200 dark:border-zinc-700 transition-colors flex items-center gap-1 cursor-pointer ${uploadingId === dose.id ? 'opacity-50 pointer-events-none' : ''}`}>
                <Upload size={11} />
                {uploadingId === dose.id ? 'Uploading…' : dose.uploadedCertUrl ? 'Re-upload' : 'Upload Cert'}
                <input type="file" accept="image/*,application/pdf" className="hidden"
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (file) await handleUpload(file, dose.id)
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


function VaccinationsTab({ patientId }) {
  const [vaccinations, setVaccinations] = useState([])
  const [loading, setLoading]           = useState(true)
  const [showAdd, setShowAdd]           = useState(false)
  const [nextDoseFor, setNextDoseFor]   = useState(null) // series being continued
  const [vaccineName, setVaccineName]   = useState('')
  const [administeredAt, setAdministeredAt] = useState(new Date().toISOString().slice(0, 10))
  const [nextDueDate, setNextDueDate]   = useState('')
  const [batchNumber, setBatchNumber]   = useState('')
  const [doseNumber, setDoseNumber]     = useState(1)
  const [seriesTotal, setSeriesTotal]   = useState(1)
  const [submitting, setSubmitting]     = useState(false)
  const [viewingCert, setViewingCert]   = useState(null)
  const [uploadingId, setUploadingId]   = useState(null)

  const COMMON_VACCINES = [
    'Rabies', 'Distemper', 'Parvovirus', 'DHPP (5-in-1)',
    'Bordetella', 'Leptospirosis', 'Lyme Disease',
    'Feline Herpesvirus', 'Feline Calicivirus', 'Feline Panleukopenia',
    'Feline Leukemia (FeLV)', 'FVRCP (3-in-1)',
  ]

  const load = () => {
    fetch(`/api/vaccinations?patientId=${patientId}`)
      .then(r => r.json())
      .then(data => setVaccinations(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [patientId])

  // Group vaccinations by vaccine name — latest dose per vaccine
  const grouped = vaccinations.reduce((acc, v) => {
    const key = v.vaccineName
    if (!acc[key]) { acc[key] = []; }
    acc[key].push(v)
    return acc
  }, {})

  const getStatus = (v) => {
    if (!v.nextDueDate) return 'up_to_date'
    const days = Math.ceil((new Date(v.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'overdue'
    if (days <= 30) return 'due_soon'
    return 'up_to_date'
  }

  const STATUS_COLOR = { up_to_date: 'green', due_soon: 'yellow', overdue: 'red' }
  const STATUS_LABEL = { up_to_date: 'Up to date', due_soon: 'Due soon', overdue: 'Overdue' }

  const openNextDose = (latestDose) => {
    setNextDoseFor(latestDose)
    setVaccineName(latestDose.vaccineName)
    setDoseNumber(latestDose.doseNumber + 1)
    setSeriesTotal(latestDose.seriesTotal)
    setBatchNumber('')
    setNextDueDate('')
    setAdministeredAt(new Date().toISOString().slice(0, 10))
    setShowAdd(false)
  }

  const resetForm = () => {
    setVaccineName(''); setBatchNumber(''); setNextDueDate('')
    setDoseNumber(1); setSeriesTotal(1)
    setAdministeredAt(new Date().toISOString().slice(0, 10))
    setShowAdd(false); setNextDoseFor(null)
  }

  const handleAdd = async () => {
    if (!vaccineName) { toast.error('Vaccine name is required'); return }
    setSubmitting(true)
    try {
      await fetch('/api/vaccinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          vaccineName,
          batchNumber:    batchNumber || null,
          administeredAt: new Date(administeredAt).toISOString(),
          doseNumber:     Number(doseNumber),
          seriesTotal:    Number(seriesTotal),
          nextDueDate:    nextDueDate ? new Date(nextDueDate).toISOString() : null,
          status:         'up_to_date',
        }),
      })
      toast.success(nextDoseFor ? `Dose ${doseNumber} recorded` : 'Vaccination recorded')
      resetForm()
      load()
    } catch { toast.error('Failed to save') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading vaccinations…</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-zinc-400">{vaccinations.length} vaccination{vaccinations.length !== 1 ? 's' : ''} recorded</p>
        <button
          onClick={() => { resetForm(); setShowAdd(v => !v) }}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
        >
          <Plus size={15} /> Add Vaccination
        </button>
      </div>

      {/* Add / Next Dose form */}
      {(showAdd || nextDoseFor) && (
        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-4 space-y-3">
          {nextDoseFor && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40 px-2.5 py-1 rounded-full">
                Recording Dose {doseNumber} of {seriesTotal} — {vaccineName}
              </span>
            </div>
          )}
          {!nextDoseFor && (
            <SmartCombobox
              type="vaccine_name"
              label="Vaccine Name *"
              value={vaccineName}
              onChange={setVaccineName}
              staticOptions={COMMON_VACCINES}
              placeholder="Search or type vaccine…"
            />
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Batch Number</label>
              <input value={batchNumber} onChange={e => setBatchNumber(e.target.value)} placeholder="e.g. BT2024-001" className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Administered On</label>
              <input type="date" value={administeredAt} onChange={e => setAdministeredAt(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          {!nextDoseFor && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Dose #</label>
                <input type="number" min={1} value={doseNumber} onChange={e => setDoseNumber(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-center" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Series Total</label>
                <input type="number" min={1} value={seriesTotal} onChange={e => setSeriesTotal(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-center" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">
              {nextDoseFor ? 'Next Dose Due Date' : 'Next Due Date'}
            </label>
            <input type="date" value={nextDueDate} onChange={e => setNextDueDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="px-4 py-2 text-sm text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleAdd} disabled={submitting} className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50">
              {submitting ? 'Saving…' : nextDoseFor ? `Record Dose ${doseNumber}` : 'Save'}
            </button>
          </div>
        </div>
      )}

      {vaccinations.length === 0 ? (
        <div className="text-center py-12">
          <Syringe size={36} className="mx-auto mb-3 text-gray-300 dark:text-zinc-700" />
          <p className="text-sm text-gray-500 dark:text-zinc-400">No vaccinations recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).map(([name, doses]) => {
            // Sort doses by dose number
            const sorted     = [...doses].sort((a, b) => a.doseNumber - b.doseNumber)
            const latest     = sorted[sorted.length - 1]
            const status     = getStatus(latest)
            const totalDoses = latest.seriesTotal
            const doneDoses  = sorted.length
            const isComplete = doneDoses >= totalDoses
            const daysUntilDue = latest.nextDueDate
              ? Math.ceil((new Date(latest.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24))
              : null

            return (
              <VaccineCard
                key={name}
                name={name}
                sorted={sorted}
                totalDoses={totalDoses}
                doneDoses={doneDoses}
                isComplete={isComplete}
                status={status}
                latest={latest}
                uploadingId={uploadingId}
                setUploadingId={setUploadingId}
                setViewingCert={setViewingCert}
                openNextDose={openNextDose}
                getStatus={getStatus}
                load={load}
                STATUS_COLOR={STATUS_COLOR}
                STATUS_LABEL={STATUS_LABEL}
              />
            )
          })}
        </div>
      )}

      {viewingCert && <CertificateViewer url={viewingCert} onClose={() => setViewingCert(null)} />}
    </div>
  )
}


function PhotosTab({ patientId, onPrimaryChange }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/patient-photos?patientId=${patientId}`)
      .then(r => r.json())
      .then(data => setPhotos(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [patientId])

  if (loading) return <div className="text-center py-12 text-gray-400">Loading photos…</div>

  return (
    <PhotoGallery
      patientId={patientId}
      initialPhotos={photos}
      onPrimaryChange={onPrimaryChange}
    />
  )
}

// ── Main profile page ─────────────────────────────────────────────────────────

export default function PatientProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const { openAppointmentForPatient } = useVetCareStore()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    patientsApi.getById(id)
      .then(setPatient)
      .catch(() => { toast.error('Patient not found'); router.push('/patients') })
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) return (
    <div className="max-w-4xl mx-auto">
      <ProfileSkeleton />
    </div>
  )

  if (!patient) return null

  const age = calculateAge(patient.dateOfBirth)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/patients"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> All Patients
      </Link>

      {/* Profile header */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex items-start gap-5 flex-wrap">
          {/* Photo */}
          <div className="relative flex-shrink-0">
            {patient.primaryPhotoUrl ? (
              <img
                src={patient.primaryPhotoUrl}
                alt={patient.name}
                className="w-28 h-28 rounded-2xl object-cover ring-4 ring-gray-100 dark:ring-zinc-800"
              />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-5xl">
                {SPECIES_EMOJI[patient.species] || '🐾'}
              </div>
            )}
            {patient.isStreetAnimal && (
              <div className="absolute -bottom-2 -right-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-700">
                Street
              </div>
            )}
          </div>

          {/* Name & details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{patient.name}</h1>
                <p className="text-gray-500 dark:text-zinc-400 mt-0.5">
                  {[patient.breed, patient.species].filter(Boolean).join(' · ')}
                  {age && <span className="text-gray-400 dark:text-zinc-500"> · {age} old</span>}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {!patient.isActive && <Badge color="gray">Inactive</Badge>}
                  {patient.isNeutered && <Badge color="indigo">Neutered</Badge>}
                  {patient.sex && patient.sex !== 'unknown' && (
                    <Badge color="blue" className="capitalize">{patient.sex}</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openAppointmentForPatient(id)}
                >
                  <Calendar size={15} /> Book Visit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push(`/patients/${id}/edit`)}
                  title="Edit patient"
                >
                  <Edit2 size={15} />
                </Button>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
              <InfoChip icon={Palette}   label="Color"     value={patient.color} />
              <InfoChip icon={Microchip} label="Microchip" value={patient.microchipNumber} />
              {patient.lastVisitDate && (
                <InfoChip icon={Calendar} label="Last Visit" value={new Date(patient.lastVisitDate).toLocaleDateString()} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-zinc-800 overflow-x-auto px-4 gap-1">
          <Tab active={activeTab === 'overview'}      onClick={() => setActiveTab('overview')}      icon={User}      label="Overview" />
          <Tab active={activeTab === 'visits'}        onClick={() => setActiveTab('visits')}        icon={Calendar}  label="Visits"        count={patient.appointments?.length} />
          <Tab active={activeTab === 'vaccinations'}  onClick={() => setActiveTab('vaccinations')}  icon={Syringe}   label="Vaccinations" />
          <Tab active={activeTab === 'photos'}        onClick={() => setActiveTab('photos')}        icon={Image}     label="Photos" />
        </div>

        <div className="p-5">
          {activeTab === 'overview'     && <OverviewTab patient={patient} />}
          {activeTab === 'visits'       && <VisitsTab patientId={id} />}
          {activeTab === 'vaccinations' && <VaccinationsTab patientId={id} />}
          {activeTab === 'photos'       && <PhotosTab patientId={id} onPrimaryChange={url => setTimeout(() => setPatient(p => ({ ...p, primaryPhotoUrl: url })), 0)} />}
        </div>
      </div>
    </div>
  )
}
