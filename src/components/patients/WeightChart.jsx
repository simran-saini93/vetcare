'use client'

export default function WeightChart({ records }) {
  if (!records || records.length === 0) return null

  const weights = records.map(r => Number(r.weightKg))
  const min = Math.min(...weights)
  const max = Math.max(...weights)
  const range = max - min || 1
  const latest = weights[0]
  const previous = weights[1]
  const trend = previous ? latest - previous : 0

  const W = 200, H = 60, PAD = 8
  const points = [...records].reverse().map((r, i) => {
    const x = PAD + (i / Math.max(records.length - 1, 1)) * (W - PAD * 2)
    const y = PAD + ((max - Number(r.weightKg)) / range) * (H - PAD * 2)
    return `${x},${y}`
  })

  return (
    <div className="space-y-1">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{latest}</span>
          <span className="text-sm text-gray-500 dark:text-zinc-400 ml-1">kg</span>
        </div>
        {previous && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-red-500' : trend < 0 ? 'text-green-500' : 'text-gray-400'}`}>
            {trend > 0 ? '▲' : trend < 0 ? '▼' : '—'} {Math.abs(trend).toFixed(1)} kg
          </span>
        )}
      </div>
      {records.length > 1 && (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12">
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, i) => {
            const [x, y] = p.split(',')
            return (
              <circle
                key={i}
                cx={x} cy={y} r="2.5"
                fill={i === points.length - 1 ? '#6366f1' : 'white'}
                stroke="#6366f1"
                strokeWidth="1.5"
              />
            )
          })}
        </svg>
      )}
      <p className="text-[10px] text-gray-400 dark:text-zinc-500">
        Last recorded: {new Date(records[0].recordedAt).toLocaleDateString()}
      </p>
    </div>
  )
}
