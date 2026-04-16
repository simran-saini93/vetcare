'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { useVetCareStore } from '@/store'
import { patientsApi } from '@/lib/api'
import { Button } from '@/components/ui'
import PatientFilters from '@/components/patients/PatientFilters'
import PatientTable from '@/components/patients/PatientTable'
import PatientSearchGrid from '@/components/patients/PatientSearchGrid'

export default function PatientsPage() {
  const { patients, setPatients } = useVetCareStore()
  const [loading, setLoading]         = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('All')
  const [statusFilter, setStatusFilter]   = useState('All')
  const [searching, setSearching]     = useState(false)
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    patientsApi.getAll()
      .then(data => setPatients(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load patients'))
      .finally(() => setLoading(false))
  }, [])

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setSearching(false); return }
    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: searchQuery })
        if (speciesFilter !== 'All') params.set('species', speciesFilter)
        const res  = await fetch(`/api/search?${params}`)
        const data = await res.json()
        setSearchResults(Array.isArray(data) ? data : [])
      } catch { toast.error('Search failed') }
      finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, speciesFilter])

  const tablePatients = useMemo(() => {
    let result = [...patients]
    if (speciesFilter !== 'All') result = result.filter(p => p.species?.toLowerCase() === speciesFilter.toLowerCase())
    if (statusFilter  !== 'All') result = result.filter(p => p.status?.toLowerCase()  === statusFilter.toLowerCase())
    return result.sort((a, b) => a.name?.localeCompare(b.name))
  }, [patients, speciesFilter, statusFilter])

  const isSearchMode = searchQuery.trim().length > 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patients</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            {isSearchMode
              ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`
              : `${tablePatients.length} patient${tablePatients.length !== 1 ? 's' : ''} total`
            }
          </p>
        </div>
        <Link href="/patients/new"><Button><Plus size={18} /> New Patient</Button></Link>
      </div>

      <PatientFilters
        searchQuery={searchQuery}   onSearchChange={setSearchQuery}
        speciesFilter={speciesFilter} onSpeciesChange={setSpeciesFilter}
        statusFilter={statusFilter}   onStatusChange={setStatusFilter}
        isSearchMode={isSearchMode}
      />

      {isSearchMode
        ? <PatientSearchGrid results={searchResults} loading={searching} query={searchQuery} />
        : <PatientTable patients={tablePatients} loading={loading} />
      }
    </div>
  )
}
