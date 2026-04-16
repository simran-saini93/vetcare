'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useClerk, useUser } from '@clerk/nextjs'
import {
  LayoutDashboard, Calendar, PawPrint,
  Settings, X, MoreVertical,
  User, HelpCircle, LogOut, Syringe, BarChart2
} from 'lucide-react'
import { useVetCareStore } from '@/store'
import { useRole } from '@/hooks/useRole'

function NavLink({ href, icon: Icon, label }) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
        active
          ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
          : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      <Icon size={18} className="flex-shrink-0" />
      <span>{label}</span>
    </Link>
  )
}

export default function Sidebar() {
  const router = useRouter()
  const { signOut } = useClerk()
  const { user } = useUser()
  const { sidebarOpen, setSidebarOpen } = useVetCareStore()
  const { role, canManageVaccinations, canAccessSettings, canViewReports } = useRole()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await signOut()
    router.push('/sign-in')
  }

  const initials     = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'DR' : 'DR'
  const displayName  = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Doctor' : 'Doctor'
  const roleLabel    = role === 'admin' ? 'Admin' : role === 'vet' ? 'Veterinarian' : 'Staff'

  return (
    <div className={`
      fixed top-0 left-0 h-full w-64 z-40
      bg-white dark:bg-zinc-900
      border-r border-gray-200 dark:border-zinc-800
      flex flex-col
      transition-transform duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg group-hover:bg-indigo-700 transition-colors">
            <PawPrint size={18} />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">VetCare Pro</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
        {/* Main */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest px-3 mb-1.5">Main</p>
          <div className="space-y-0.5">
            <NavLink href="/dashboard"    icon={LayoutDashboard} label="Dashboard" />
            <NavLink href="/patients"     icon={PawPrint}        label="Patients" />
            <NavLink href="/appointments" icon={Calendar}        label="Appointments" />
            {canManageVaccinations && (
              <NavLink href="/vaccinations" icon={Syringe} label="Vaccinations" />
            )}
            {canViewReports && <NavLink href="/reports" icon={BarChart2} label="Reports" />}
          </div>
        </div>

        {/* System */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest px-3 mb-1.5">System</p>
          <div className="space-y-0.5">
            <NavLink href="/settings" icon={Settings} label="Settings" />
          </div>
        </div>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-200 dark:border-zinc-800 flex-shrink-0 relative">
        {showUserMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
            <div className="absolute bottom-full left-3 right-3 mb-2 z-20 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
              <button onClick={() => { setShowUserMenu(false); router.push('/profile') }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors">
                <User size={15} /> My Profile
              </button>
              <button onClick={() => setShowUserMenu(false)}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors">
                <HelpCircle size={15} /> Help Center
              </button>
              <div className="h-px bg-gray-100 dark:bg-zinc-800" />
              <button onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 transition-colors">
                <LogOut size={15} /> Log Out
              </button>
            </div>
          </>
        )}
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate leading-tight">{displayName}</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">{roleLabel}</p>
          </div>
          <button
            onClick={() => setShowUserMenu(v => !v)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
