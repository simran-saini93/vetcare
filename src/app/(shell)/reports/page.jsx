'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { FileText, Download, Filter, Calendar, PawPrint, Syringe, RefreshCw } from 'lucide-react'
import { patientsApi, appointmentsApi, vaccinationsApi } from '@/lib/api'
import { Badge, Button } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'
import PatientReportTable from '@/components/reports/PatientReportTable'
import VaccinationReportTable from '@/components/reports/VaccinationReportTable'
import AppointmentReportTable from '@/components/reports/AppointmentReportTable'
import { exportCSV, exportPDF } from '@/lib/reportExport'

const TABS = [
  { key: 'patients',      label: 'Patients',      icon: PawPrint  },
  { key: 'vaccinations',  label: 'Vaccinations',  icon: Syringe   },
  { key: 'appointments',  label: 'Appointments',  icon: Calendar  },
]

function getVaccinationStatus(v) {
  if (!v.nextDueDate) return 'up_to_date'
  const days = Math.ceil((new Date(v.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24))
  if (days < 0) return 'overdue'
  if (days <= 30) return 'due_soon'
  return 'up_to_date'
}

export default function ReportsPage() {
  const [activeTab, setActiveTab]         = useState('patients')
  const [patients, setPatients]           = useState([])
  const [vaccinations, setVaccinations]   = useState([])
  const [appointments, setAppointments]   = useState([])
  const [loading, setLoading]             = useState(true)

  // Filters
  const [speciesFilter, setSpeciesFilter] = useState('all')
  const [statusFilter, setStatusFilter]   = useState('all')
  const [vaccStatusFilter, setVaccStatusFilter] = useState('all')
  const [aptStatusFilter, setAptStatusFilter]   = useState('all')
  const [dateFrom, setDateFrom]           = useState('')
  const [dateTo, setDateTo]               = useState('')

  useEffect(() => {
    Promise.all([
      patientsApi.getAll(),
      vaccinationsApi.getAll(),
      appointmentsApi.getAll(),
    ])
      .then(([p, v, a]) => {
        setPatients(Array.isArray(p) ? p : [])
        setVaccinations(Array.isArray(v) ? v : [])
        setAppointments(Array.isArray(a) ? a : [])
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  // ── Filtered data ─────────────────────────────────────────────────────────

  const filteredPatients = useMemo(() => {
    let r = [...patients]
    if (speciesFilter !== 'all') r = r.filter(p => p.species?.toLowerCase() === speciesFilter)
    if (statusFilter  !== 'all') r = r.filter(p => (p.status || 'active') === statusFilter)
    return r.sort((a, b) => a.name?.localeCompare(b.name))
  }, [patients, speciesFilter, statusFilter])

  const filteredVaccinations = useMemo(() => {
    let r = vaccinations.map(v => ({ ...v, status: getVaccinationStatus(v) }))
    if (vaccStatusFilter !== 'all') r = r.filter(v => v.status === vaccStatusFilter)
    if (dateFrom) r = r.filter(v => v.administeredAt && new Date(v.administeredAt) >= new Date(dateFrom))
    if (dateTo)   r = r.filter(v => v.administeredAt && new Date(v.administeredAt) <= new Date(dateTo + 'T23:59:59'))
    return r.sort((a, b) => new Date(b.administeredAt) - new Date(a.administeredAt))
  }, [vaccinations, vaccStatusFilter, dateFrom, dateTo])

  const filteredAppointments = useMemo(() => {
    let r = [...appointments]
    if (aptStatusFilter !== 'all') r = r.filter(a => a.status === aptStatusFilter)
    if (dateFrom) r = r.filter(a => a.scheduledAt && new Date(a.scheduledAt) >= new Date(dateFrom))
    if (dateTo)   r = r.filter(a => a.scheduledAt && new Date(a.scheduledAt) <= new Date(dateTo + 'T23:59:59'))
    return r.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))
  }, [appointments, aptStatusFilter, dateFrom, dateTo])

  // ── Export handlers ───────────────────────────────────────────────────────

  const handleExport = (format) => {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

    if (activeTab === 'patients') {
      const rows = filteredPatients.map(p => ({
        Name:       p.name,
        Species:    p.species,
        Breed:      p.breed || '—',
        Sex:        p.sex || '—',
        DOB:        p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : '—',
        Owner:      p.ownerName || '—',
        Microchip:  p.microchipNumber || '—',
        Status:     p.status || 'active',
        Allergies:  p.allergies || '—',
      }))
      if (format === 'csv') exportCSV(rows, `patients-report-${date}`)
      else exportPDF({ title: 'Patient Report', subtitle: `Generated ${date} · ${rows.length} patients`, columns: Object.keys(rows[0] || {}), rows, filename: `patients-report-${date}` })
    }

    if (activeTab === 'vaccinations') {
      const rows = filteredVaccinations.map(v => ({
        Patient:      v.patientName || '—',
        Vaccine:      v.vaccineName,
        'Batch No':   v.batchNumber || '—',
        'Dose':       v.seriesTotal > 1 ? `${v.doseNumber}/${v.seriesTotal}` : '1',
        Administered: v.administeredAt ? new Date(v.administeredAt).toLocaleDateString() : '—',
        'Valid Until': v.nextDueDate   ? new Date(v.nextDueDate).toLocaleDateString()   : '—',
        Status:       v.status?.replace('_', ' '),
      }))
      if (format === 'csv') exportCSV(rows, `vaccinations-report-${date}`)
      else exportPDF({ title: 'Vaccination Report', subtitle: `Generated ${date} · ${rows.length} records`, columns: Object.keys(rows[0] || {}), rows, filename: `vaccinations-report-${date}` })
    }

    if (activeTab === 'appointments') {
      const rows = filteredAppointments.map(a => ({
        Patient:  a.patientName || '—',
        Date:     a.scheduledAt ? new Date(a.scheduledAt).toLocaleDateString() : '—',
        Time:     a.scheduledAt ? new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        Type:     a.type || '—',
        Duration: a.durationMinutes ? `${a.durationMinutes} min` : '—',
        Status:   a.status?.replace('_', ' '),
        Notes:    a.notes || '—',
      }))
      if (format === 'csv') exportCSV(rows, `appointments-report-${date}`)
      else exportPDF({ title: 'Appointment Report', subtitle: `Generated ${date} · ${rows.length} appointments`, columns: Object.keys(rows[0] || {}), rows, filename: `appointments-report-${date}` })
    }
  }

  const currentCount = activeTab === 'patients'
    ? filteredPatients.length
    : activeTab === 'vaccinations'
    ? filteredVaccinations.length
    : filteredAppointments.length

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{currentCount} records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => handleExport('csv')}>
            <Download size={16} /> Export CSV
          </Button>
          <Button onClick={() => handleExport('pdf')}>
            <FileText size={16} /> Export PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800 gap-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 flex flex-wrap gap-4 items-end">
        {activeTab === 'patients' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Species</label>
              <select value={speciesFilter} onChange={e => setSpeciesFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">All Species</option>
                {['dog','cat','bird','rabbit','reptile','other'].map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deceased">Deceased</option>
              </select>
            </div>
          </>
        )}

        {activeTab === 'vaccinations' && (
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
            <select value={vaccStatusFilter} onChange={e => setVaccStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">All Status</option>
              <option value="up_to_date">Up to Date</option>
              <option value="due_soon">Due Soon</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
            <select value={aptStatusFilter} onChange={e => setAptStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        )}

        {/* Date range — vaccinations + appointments */}
        {activeTab !== 'patients' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(''); setDateTo('') }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors self-end">
                <RefreshCw size={14} /> Clear
              </button>
            )}
          </>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-4 px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
              {[...Array(5)].map((_, j) => <Skeleton key={j} className="h-4 flex-1" />)}
            </div>
          ))}
        </div>
      ) : (
        <>
          {activeTab === 'patients'     && <PatientReportTable     patients={filteredPatients} />}
          {activeTab === 'vaccinations' && <VaccinationReportTable vaccinations={filteredVaccinations} />}
          {activeTab === 'appointments' && <AppointmentReportTable appointments={filteredAppointments} />}
        </>
      )}
    </div>
  )
}
