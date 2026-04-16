'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useVetCareStore } from '@/store'

export function useNotifications() {
  const { appointments, setNotifications } = useVetCareStore()

  // Toast when new appointment added by someone else
  const prevCountRef   = useRef(null)
  useEffect(() => {
    if (appointments.length === 0) return // skip empty state
    if (prevCountRef.current === null) {
      // First real load — set baseline silently
      prevCountRef.current = appointments.length
      return
    }
    if (appointments.length > prevCountRef.current) {
      toast.info('New appointment booked', { description: 'Appointments list updated' })
    }
    prevCountRef.current = appointments.length
  }, [appointments.length])

  // Appointment notifications
  useEffect(() => {
    const notifs = []
    const today = new Date().toISOString().split('T')[0]

    // Today's appointments
    appointments
      .filter(a => a.scheduledAt?.startsWith(today) && a.status === 'scheduled')
      .forEach(apt =>
        notifs.push({
          id:      `apt-${apt.id}`,
          title:   'Appointment Today',
          message: `${apt.patientName} — ${apt.type} at ${new Date(apt.scheduledAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`,
          type:    'info',
          time:    'Today',
          href:    '/appointments',
        })
      )

    // Tomorrow's appointments — reminder
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}`

    appointments
      .filter(a => a.scheduledAt?.startsWith(tomorrowStr) && a.status === 'scheduled')
      .forEach(apt =>
        notifs.push({
          id:      `apt-tomorrow-${apt.id}`,
          title:   'Appointment Tomorrow',
          message: `${apt.patientName} — ${apt.type} at ${new Date(apt.scheduledAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`,
          type:    'warning',
          time:    'Tomorrow',
          href:    '/appointments',
        })
      )

    setNotifications(notifs)
  }, [appointments, setNotifications])

  // Vaccine notifications — fetched separately
  useEffect(() => {
    fetch('/api/vaccinations/reminders')
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return
        useVetCareStore.setState(state => {
          const aptNotifs = state.notifications.filter(n => n.id.startsWith('apt-'))
          const vaccNotifs = data.map(v => {
            const days = Math.ceil((new Date(v.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24))
            const overdue  = days < 0
            const tomorrow = days === 1
            return {
              id:      `vacc-${v.id}`,
              title:   overdue ? '🔴 Vaccine Overdue' : tomorrow ? '🟡 Vaccine Due Tomorrow' : '🟡 Vaccine Due Soon',
              message: `${v.patientName} — ${v.vaccineName}${overdue ? ` (${Math.abs(days)}d overdue)` : tomorrow ? ' (due tomorrow)' : ` (in ${days}d)`}`,
              type:    overdue ? 'alert' : 'warning',
              time:    overdue ? 'Overdue' : tomorrow ? 'Tomorrow' : `${days}d`,
              href:    `/patients/${v.patientId}`,
            }
          })
          return { notifications: [...vaccNotifs, ...aptNotifs] }
        })
      })
      .catch(console.error)
  }, [])
}
