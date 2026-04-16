import { PawPrint } from 'lucide-react'

export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen flex">

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] bg-indigo-600 flex-col justify-between p-12 relative overflow-hidden flex-shrink-0">

        {/* Paw pattern background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-white text-7xl select-none"
              style={{
                top:       `${(i * 19 + 8) % 105}%`,
                left:      `${(i * 27 + 5) % 100}%`,
                transform: `rotate(${i * 41}deg)`,
                opacity:   0.06,
              }}
            >
              🐾
            </div>
          ))}
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3 z-10">
          <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl border border-white/20">
            <PawPrint size={22} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">VetCare Pro</span>
            <span className="block text-indigo-200 text-xs font-medium tracking-widest uppercase mt-0.5">
              Veterinary System
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-light text-white leading-snug">
              Every animal deserves{' '}
              <span className="font-semibold">exceptional care.</span>
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Manage your clinic efficiently — patients, appointments,
              records, and billing, all in one place.
            </p>
          </div>

          <ul className="space-y-3">
            {[
              'Multi-photo pet profiles',
              'Smart visual pet search',
              'Complete medical records',
              'Automated billing & invoices',
            ].map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/90">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
          {[['Patients', '2,400+'], ['Vets', '15+'], ['Uptime', '99.9%']].map(([label, val]) => (
            <div key={label}>
              <p className="text-xl font-bold text-white">{val}</p>
              <p className="text-indigo-200 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — Clerk form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-gray-50">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <PawPrint size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">VetCare Pro</span>
        </div>

        {children}

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} VetCare Pro. All rights reserved.
        </p>
      </div>
    </div>
  )
}
