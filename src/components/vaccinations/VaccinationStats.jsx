'use client'

import { ShieldCheck, Syringe, Clock3, AlertTriangle } from 'lucide-react'

export default function VaccinationStats({ stats }) {
  const items = [
    {
      label: 'Total Vaccinations',
      value: stats.total,
      subtitle: 'all recorded vaccines',
      icon: Syringe,
      iconWrap: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    },
    {
      label: 'Up to Date',
      value: stats.upToDate,
      subtitle: 'currently protected',
      icon: ShieldCheck,
      iconWrap: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    },
    {
      label: 'Due Soon',
      value: stats.dueSoon,
      subtitle: 'need attention soon',
      icon: Clock3,
      iconWrap: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      subtitle: 'require follow-up',
      icon: AlertTriangle,
      iconWrap: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(item => {
        const Icon = item.icon

        return (
          <div
            key={item.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">{item.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {item.value}
                </p>
                <p className="mt-2 text-sm text-gray-400 dark:text-zinc-500">{item.subtitle}</p>
              </div>

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.iconWrap}`}
              >
                <Icon size={20} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
