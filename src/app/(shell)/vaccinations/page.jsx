'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Search } from 'lucide-react'
import { vaccinationsApi } from '@/lib/api'
import { Button } from '@/components/ui'
import VaccinationStats from '@/components/vaccinations/VaccinationStats'
import VaccinationTable from '@/components/vaccinations/VaccinationTable'
import AddVaccinationModal from '@/components/vaccinations/AddVaccinationModal'

function getStatus(v) {
  if (!v.nextDueDate) return 'up_to_date'
  const days = Math.ceil((new Date(v.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24))
  if (days < 0) return 'overdue'
  if (days <= 30) return 'due_soon'
  return 'up_to_date'
}

export default function VaccinationsPage() {
  const [vaccinations, setVaccinations] = useState([])
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [refreshKey, setRefreshKey]     = useState(0)

  useEffect(() => {
    vaccinationsApi.getAll()
      .then(data => setVaccinations(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load vaccinations'))
      .finally(() => setLoading(false))
  }, [refreshKey])

  const withStatus = vaccinations.map(v => ({ ...v, status: getStatus(v) }))

  const filtered = withStatus.filter(v => {
    const matchSearch = !searchQuery ||
      v.vaccineName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.patientName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'all' || v.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total:     withStatus.length,
    upToDate:  withStatus.filter(v => v.status === 'up_to_date').length,
    dueSoon:   withStatus.filter(v => v.status === 'due_soon').length,
    overdue:   withStatus.filter(v => v.status === 'overdue').length,
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vaccinations</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{withStatus.length} records total</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus size={18} /> Record Vaccination</Button>
      </div>

      <VaccinationStats stats={stats} />

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by vaccine or patient…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Status</option>
          <option value="up_to_date">Up to Date</option>
          <option value="due_soon">Due Soon</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <VaccinationTable vaccinations={filtered} loading={loading} onAdd={() => setShowModal(true)} />

      {showModal && (
        <AddVaccinationModal
          onClose={() => setShowModal(false)}
          onSaved={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  )
}
