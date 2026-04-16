'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const useVetCareStore = create()(
  devtools(
    set => ({
      // ── UI ──────────────────────────────────────────────────────────────────
      darkMode: false,
      toggleDarkMode: () =>
        set(state => {
          const next = !state.darkMode
          if (typeof window !== 'undefined') {
            localStorage.setItem('vetcare-theme', next ? 'dark' : 'light')
            document.documentElement.classList.toggle('dark', next)
          }
          return { darkMode: next }
        }),

      sidebarOpen: false,
      setSidebarOpen: open => set({ sidebarOpen: open }),

      // ── Modals ──────────────────────────────────────────────────────────────
      modals: { patient: false, appointment: false },
      openModal:  name => set(s => ({ modals: { ...s.modals, [name]: true } })),
      closeModal: name => set(s => ({
        modals:           { ...s.modals, [name]: false },
        prefillPatientId: null,
      })),

      // ── Appointment prefill ────────────────────────────────────────────────
      prefillPatientId: null,
      openAppointmentForPatient: (patientId) => set(s => ({
        prefillPatientId: patientId,
        modals: { ...s.modals, appointment: true },
      })),

      // ── Notifications ────────────────────────────────────────────────────────
      notifications: [],
      setNotifications: notifications => set({ notifications }),

      // ── Data ─────────────────────────────────────────────────────────────────
      patients:        [],
      appointments:    [],
      setPatients:     patients     => set({ patients }),
      setAppointments: appointments => set({ appointments }),
    }),
    { name: 'vetcare-store' }
  )
)
