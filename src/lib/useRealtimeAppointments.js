'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useVetCareStore } from '@/store'
import { appointmentsApi } from '@/lib/api'

const POLL_INTERVAL = 30000 // 30 seconds

export function useRealtimeAppointments() {
  const { setAppointments, appointments } = useVetCareStore()
  const lastTimestampRef = useRef(null)
  const intervalRef      = useRef(null)

  const checkAndRefresh = useCallback(async () => {
    try {
      const res  = await fetch('/api/system/last-updated')
      const data = await res.json()
      const ts   = data.timestamp

      if (ts && ts !== lastTimestampRef.current) {
        // Something changed — refetch appointments
        lastTimestampRef.current = ts
        const fresh = await appointmentsApi.getAll()
        if (Array.isArray(fresh)) setAppointments(fresh)
      }
    } catch {
      // Silent fail — don't disrupt UI
    }
  }, [setAppointments])

  useEffect(() => {
    // Initial fetch to set baseline timestamp
    fetch('/api/system/last-updated')
      .then(r => r.json())
      .then(data => { lastTimestampRef.current = data.timestamp })
      .catch(() => {})

    // Poll every 30s — only refetches if timestamp changed
    intervalRef.current = setInterval(checkAndRefresh, POLL_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [checkAndRefresh])
}
