'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { patientsApi, appointmentsApi, visitRecordsApi } from '@/lib/api'
import { Button, Badge } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'
import VitalsSection from '@/components/visits/VitalsSection'
import ClinicalSection from '@/components/visits/ClinicalSection'
import PrescriptionList from '@/components/visits/PrescriptionList'
import LabList from '@/components/visits/LabList'
import FollowUpSection from '@/components/visits/FollowUpSection'

export default function NewVisitPage() {
  const searchParams  = useSearchParams()
  const router        = useRouter()
  const appointmentId = searchParams.get('appointmentId')
  const patientId     = searchParams.get('patientId')

  const [appointment, setAppointment] = useState(null)
  const [patient, setPatient]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [submitting, setSubmitting]   = useState(false)

  const [vitals, setVitals] = useState({ weightKg: '', temperature: '', heartRate: '', respiratoryRate: '' })
  const [clinical, setClinical] = useState({
    chiefComplaint: '', diagnosisPrimary: '', diagnosisDifferential: '',
    diagnosisCode: '', treatmentPlan: '', proceduresPerformed: '',
    internalNotes: '', followUpInstructions: '',
  })
  const [prescriptions, setPrescriptions] = useState([])
  const [labRequests, setLabRequests]     = useState([])
  const [followUp, setFollowUp]           = useState({ date: '', time: '', type: 'followup', notes: '' })

  useEffect(() => {
    const load = async () => {
      try {
        if (appointmentId) {
          const apt = await appointmentsApi.getById(appointmentId)
          setAppointment(apt)
          try {
            const pat = await patientsApi.getById(apt.patientId)
            setPatient(pat)
          } catch { toast.error('Patient record not found') }

          // Auto-populate vitals if staff recorded them
          try {
            const vRes = await fetch(`/api/vitals?appointmentId=${appointmentId}`)
            const vData = await vRes.json()
            if (vData) {
              setVitals({
                weightKg:        vData.weightKg        || '',
                temperature:     vData.temperature     || '',
                heartRate:       vData.heartRate       || '',
                respiratoryRate: vData.respiratoryRate || '',
              })
            }
          } catch {}
        } else if (patientId) {
          const pat = await patientsApi.getById(patientId)
          setPatient(pat)
        }
      } catch { toast.error('Failed to load data') }
      finally { setLoading(false) }
    }
    load()
  }, [appointmentId, patientId])

  const updateVital    = (key, val) => setVitals(v => ({ ...v, [key]: val }))
  const updateClinical = (key, val) => setClinical(c => ({ ...c, [key]: val }))

  const handleSave = async () => {
    if (!clinical.chiefComplaint.trim()) { toast.error('Chief complaint is required'); return }
    setSubmitting(true)
    try {
      const visit = await visitRecordsApi.create({
        appointmentId: appointmentId || null,
        patientId:     patient?.id,
        ...vitals,
        ...clinical,
      })

      await Promise.all([
        ...prescriptions.filter(rx => rx.drugName).map(rx =>
          fetch('/api/prescriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...rx, visitId: visit.id, patientId: patient?.id }) })
        ),
        ...labRequests.filter(l => l.testName).map(lab =>
          fetch('/api/lab-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ testName: lab.testName, notes: lab.notes, visitId: visit.id, patientId: patient?.id }) })
        ),
      ])

      if (appointmentId) await appointmentsApi.update(appointmentId, { status: 'completed' })

      // Auto-book follow-up appointment if date provided
      if (followUp.date && patient?.id) {
        const scheduledAt = followUp.time
          ? new Date(`${followUp.date}T${followUp.time}:00`).toISOString()
          : new Date(`${followUp.date}T09:00:00`).toISOString()

        await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId:   patient.id,
            patientName: patient.name,
            scheduledAt,
            type:        followUp.type || 'followup',
            notes:       followUp.notes || `Follow-up from visit on ${new Date().toLocaleDateString()}`,
            status:      'scheduled',
            isFollowUp:  true,
            visitId:     visit.id,
          }),
        })

        // Schedule reminder email via our reminder endpoint
        await fetch('/api/appointments/followup-reminder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId:   patient.id,
            patientName: patient.name,
            scheduledAt,
            type:        followUp.type || 'followup',
          }),
        }).catch(() => {}) // non-blocking
      }

      toast.success('Visit record saved successfully')
      router.push(`/visits/${visit.id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to save visit')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-8 w-48" />
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href={patient ? `/patients/${patient.id}` : '/appointments'}
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-white transition-colors mb-4">
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Visit Record</h1>
            {patient && (
              <p className="text-gray-500 dark:text-zinc-400 mt-1 text-sm flex items-center gap-2">
                {patient.name} · {patient.species}{patient.breed ? ` · ${patient.breed}` : ''}
                {appointment && <Badge color="blue" className="text-xs">{appointment.type}</Badge>}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleSave} disabled={submitting}><Save size={16} />{submitting ? 'Saving…' : 'Save Visit'}</Button>
          </div>
        </div>
      </div>

      <VitalsSection  vitals={vitals}           onChange={updateVital} />
      <ClinicalSection fields={clinical} onChange={updateClinical} patientId={patient?.id} patientName={patient?.name} />
      <PrescriptionList prescriptions={prescriptions} onChange={setPrescriptions} />
      <LabList          labRequests={labRequests}     onChange={setLabRequests} />
      <FollowUpSection  followUp={followUp}            onChange={setFollowUp} />

      <div className="flex justify-end gap-3 pb-8">
        <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={handleSave} disabled={submitting}>
          <Save size={16} />{submitting ? 'Saving…' : 'Save & Generate Discharge'}
        </Button>
      </div>
    </div>
  )
}
