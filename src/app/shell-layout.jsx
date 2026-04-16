'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useVetCareStore } from '@/store'
import { useNotifications } from '@/lib/useNotifications'
import { patientsApi, appointmentsApi } from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function ShellLayout({ children }) {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const {
    darkMode, sidebarOpen, setSidebarOpen,
    setPatients, setAppointments,
  } = useVetCareStore()

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace('/sign-in')
  }, [isLoaded, isSignedIn, router])

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

  useEffect(() => {
    if (!isSignedIn) return
    patientsApi.getAll().then(setPatients).catch(console.error)
    appointmentsApi.getAll().then(setAppointments).catch(console.error)
  }, [isSignedIn, setPatients, setAppointments ])

  useNotifications()

  if (!isLoaded || !isSignedIn) return null

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
