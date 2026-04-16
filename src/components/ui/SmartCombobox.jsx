'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Loader2 } from 'lucide-react'

/**
 * SmartCombobox
 *
 * Props:
 *  - type: string         — option type key e.g. 'breed', 'drug_name'
 *  - value: string        — current value
 *  - onChange: fn         — called with new value string
 *  - staticOptions: []    — hardcoded predefined suggestions
 *  - placeholder: string
 *  - label: string        — optional label above
 *  - required: bool
 */
export default function SmartCombobox({
  type,
  value = '',
  onChange,
  staticOptions = [],
  placeholder = 'Type or select…',
  label,
  required,
}) {
  const [open, setOpen]               = useState(false)
  const [query, setQuery]             = useState(value)
  const [customOptions, setCustomOptions] = useState([])
  const [saving, setSaving]           = useState(false)
  const ref = useRef(null)

  // Load custom options for this type
  useEffect(() => {
    if (!type) return
    fetch(`/api/custom-options?type=${encodeURIComponent(type)}`)
      .then(r => r.json())
      .then(data => setCustomOptions(Array.isArray(data) ? data : []))
      .catch(console.error)
  }, [type])

  // Sync query with value prop
  useEffect(() => {
    setQuery(value || '')
  }, [value])

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Merge static + custom, deduplicate, filter by query
  const allOptions = [...new Set([...staticOptions, ...customOptions])]
  const filtered   = query.length === 0
    ? allOptions
    : allOptions.filter(s => s.toLowerCase().includes(query.toLowerCase()))

  // Check if query is a new custom value (not in any list)
  const trimmed   = query.trim()
  const isNewValue = trimmed.length > 0 && !allOptions.some(o => o.toLowerCase() === trimmed.toLowerCase())

  const handleSelect = (option) => {
    setQuery(option)
    onChange(option)
    setOpen(false)
  }

  const handleAddNew = async () => {
    if (!trimmed) return
    setSaving(true)
    try {
      await fetch('/api/custom-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value: trimmed }),
      })
      setCustomOptions(prev => [...prev, trimmed].sort())
      onChange(trimmed)
      setOpen(false)
    } catch {
      // Still set the value even if save fails
      onChange(trimmed)
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e) => {
    setQuery(e.target.value)
    onChange(e.target.value)
    setOpen(true)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && isNewValue) {
      e.preventDefault()
      handleAddNew()
    }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-400"
      />

      {open && (filtered.length > 0 || isNewValue) && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {/* Existing options */}
          {filtered.map(option => (
            <button
              key={option}
              type="button"
              onMouseDown={e => { e.preventDefault(); handleSelect(option) }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 ${
                option === value
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium'
                  : 'text-gray-700 dark:text-zinc-300'
              }`}
            >
              {option}
            </button>
          ))}

          {/* Add new option */}
          {isNewValue && (
            <>
              {filtered.length > 0 && <div className="h-px bg-gray-100 dark:bg-zinc-800 mx-2" />}
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); handleAddNew() }}
                disabled={saving}
                className="w-full text-left px-3 py-2.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-2 font-medium"
              >
                {saving
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Plus size={14} />
                }
                {saving ? 'Saving…' : `Add "${trimmed}"`}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
