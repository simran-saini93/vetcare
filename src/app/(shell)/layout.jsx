'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useVetCareStore } from '@/store'
import { useNotifications } from '@/lib/useNotifications'
import { useRealtimeAppointments } from '@/lib/useRealtimeAppointments'
import { patientsApi, appointmentsApi } from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import PatientModal from '@/components/modals/PatientModal'
import AppointmentModal from '@/components/modals/AppointmentModal'

export default function ShellLayout({ children }) {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const {
    darkMode,
    sidebarOpen,
    setSidebarOpen,
    setPatients,
    setAppointments,
  } = useVetCareStore()

  // ── Init sidebar based on screen size ─────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setSidebarOpen(mq.matches)
    const handler = (e) => setSidebarOpen(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setSidebarOpen])

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace('/sign-in')
  }, [isLoaded, isSignedIn, router])

  // ── Theme ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('vetcare-theme')
    const isDark = saved === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    useVetCareStore.setState({ darkMode: isDark })
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSignedIn) return
    patientsApi.getAll().then(setPatients).catch(console.error)
    appointmentsApi.getAll().then(setAppointments).catch(console.error)
  }, [isSignedIn, setPatients, setAppointments])

  useNotifications()
  useRealtimeAppointments()

  if (!isLoaded || !isSignedIn) return null

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black overflow-hidden">
      {/* Sidebar — always fixed, controlled by sidebarOpen */}
      <Sidebar />

      {/* Overlay backdrop — only on small screens */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content — shifts right when sidebar open on lg+ */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'ml-0'
        }`}
      >
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black p-4 md:p-8">
          {children}
        </main>
      </div>

      <PatientModal />
      <AppointmentModal />
    </div>
  )
}
