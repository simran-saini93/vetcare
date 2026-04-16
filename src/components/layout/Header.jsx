'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Bell, Moon, Sun, AlertCircle, Clock, Info } from 'lucide-react'
import { useVetCareStore } from '@/store'

export default function Header() {
  const router = useRouter()
  const { sidebarOpen, setSidebarOpen, darkMode, toggleDarkMode, notifications } = useVetCareStore()
  const [showNotifications, setShowNotifications] = useState(false)

  const handleNotifClick = (n) => {
    setShowNotifications(false)
    if (n.href) router.push(n.href)
  }

  const overdueCount = notifications.filter(n => n.type === 'alert').length
  const totalCount   = notifications.length

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-8 z-20 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 p-2 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-1.5 w-48 md:w-64 border border-transparent focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-gray-700 transition-all">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input placeholder="Search anything…" className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-900 dark:text-white placeholder-gray-500" />
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(v => !v)}
            className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Bell size={20} />
            {totalCount > 0 && (
              <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1 ${
                overdueCount > 0 ? 'bg-red-500' : 'bg-amber-500'
              }`}>
                {totalCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-20 cursor-default" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-30 overflow-hidden">
                <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {overdueCount > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 px-2 py-0.5 rounded-full font-medium">
                        {overdueCount} Overdue
                      </span>
                    )}
                    {totalCount > 0 && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                        {totalCount} Total
                      </span>
                    )}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
                  {totalCount === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        className="p-3 cursor-pointer group hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                      >
                        <div className="flex gap-3 items-start">
                          <div className="mt-0.5 flex-shrink-0">
                            {n.type === 'alert'   && <AlertCircle size={16} className="text-red-500" />}
                            {n.type === 'warning' && <Clock size={16} className="text-amber-500" />}
                            {n.type === 'info'    && <Info size={16} className="text-blue-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                {n.title}
                              </p>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2 flex-shrink-0">{n.time}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {totalCount > 0 && (
                  <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 text-center">
                    <button onClick={() => setShowNotifications(false)} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                      Close
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Dark mode */}
        <button onClick={toggleDarkMode} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  )
}
