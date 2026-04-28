'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Search, PawPrint, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import Link from 'next/link'
import { patientsApi } from '@/lib/api'
import { useVetCareStore } from '@/store'
import { Button, Badge } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'

const SPECIES_EMOJI = { dog:'🐕', cat:'🐈', bird:'🦜', rabbit:'🐇', reptile:'🦎', other:'🐾' }
const LIMIT = 50

export default function PatientsPage() {
  const router    = useRouter()
  const { openModal } = useVetCareStore()

  const [patients, setPatients] = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [species, setSpecies]   = useState('')
  const searchRef               = useRef(null)
  const debounceRef             = useRef(null)

  const fetchPatients = useCallback(async (params) => {
    setLoading(true)
    try {
      const res = await patientsApi.getPaginated(params)
      setPatients(res.data || [])
      setTotal(res.total || 0)
    } catch {
      toast.error('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchPatients({ page: 1, limit: LIMIT, search: '', species: '' })
  }, [fetchPatients])

  // Search debounce
  const handleSearch = (val) => {
    setSearch(val)
    setPage(1)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchPatients({ page: 1, limit: LIMIT, search: val, species })
    }, 400)
  }

  // Species filter
  const handleSpecies = (val) => {
    setSpecies(val)
    setPage(1)
    fetchPatients({ page: 1, limit: LIMIT, search, species: val })
  }

  // Pagination
  const handlePage = (newPage) => {
    setPage(newPage)
    fetchPatients({ page: newPage, limit: LIMIT, search, species })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patients</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            {total.toLocaleString()} total patients
          </p>
        </div>
        <Button onClick={() => router.push('/patients/new')}>
          <Plus size={18} /> New Patient
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl flex-1 min-w-60 max-w-md">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            ref={searchRef}
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by name, breed, microchip…"
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder-gray-400"
          />
          {search && (
            <button onClick={() => handleSearch('')} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Species filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {['', 'dog', 'cat', 'bird', 'rabbit', 'reptile', 'other'].map(s => (
            <button key={s} onClick={() => handleSpecies(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                species === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:border-indigo-400'
              }`}>
              {s ? `${SPECIES_EMOJI[s]} ${s}` : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-200 dark:border-zinc-700">
              <tr>
                {['Patient', 'Species', 'Age', 'Owner', 'Microchip', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => (
                    <td key={j} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                  ))}</tr>
                ))
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <PawPrint size={40} className="mx-auto mb-3 text-gray-300 dark:text-zinc-700" />
                    <p className="text-gray-500 dark:text-zinc-400">
                      {search ? `No patients matching "${search}"` : 'No patients found'}
                    </p>
                  </td>
                </tr>
              ) : (
                patients.map(p => {
                  const age = p.dateOfBirth
                    ? Math.floor((new Date() - new Date(p.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
                    : null
                  return (
                    <tr key={p.id} onClick={() => router.push(`/patients/${p.id}`)}
                      className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {p.primaryPhotoUrl
                              ? <img src={p.primaryPhotoUrl} alt={p.name} className="w-full h-full object-cover" />
                              : <span className="text-sm">{SPECIES_EMOJI[p.species] || '🐾'}</span>
                            }
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-zinc-300 capitalize">{p.species}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">{age !== null ? `${age}y` : '—'}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">{p.ownerName || '—'}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-400">{p.microchipNumber || '—'}</td>
                      <td className="px-6 py-4">
                        <Badge color={p.isActive ? 'green' : 'gray'} className="text-xs capitalize">
                          {p.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-800/30">
            <p className="text-xs text-gray-400">
              Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total.toLocaleString()} patients
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePage(page - 1)} disabled={page <= 1}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let p2
                  if (totalPages <= 5) p2 = i + 1
                  else if (page <= 3) p2 = i + 1
                  else if (page >= totalPages - 2) p2 = totalPages - 4 + i
                  else p2 = page - 2 + i
                  return (
                    <button key={p2} onClick={() => handlePage(p2)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        page === p2
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                      {p2}
                    </button>
                  )
                })}
              </div>
              <button onClick={() => handlePage(page + 1)} disabled={page >= totalPages}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
