'use client'

import { X, Search } from 'lucide-react'

const SPECIES = ['All', 'Dog', 'Cat', 'Bird', 'Rabbit', 'Reptile', 'Other']
const STATUS  = ['All', 'Active', 'Inactive', 'Deceased']

export default function PatientFilters({
  searchQuery, onSearchChange,
  speciesFilter, onSpeciesChange,
  statusFilter, onStatusChange,
  isSearchMode,
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex-1 min-w-64 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search by name, owner, phone, microchip, breed…"
          className="w-full pl-9 pr-10 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <select
        value={speciesFilter}
        onChange={e => onSpeciesChange(e.target.value)}
        className="px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {SPECIES.map(s => <option key={s}>{s}</option>)}
      </select>

      {!isSearchMode && (
        <select
          value={statusFilter}
          onChange={e => onStatusChange(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {STATUS.map(s => <option key={s}>{s}</option>)}
        </select>
      )}
    </div>
  )
}
