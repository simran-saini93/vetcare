'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Users, Shield, ChevronDown, Check, Loader2, UserPlus, X } from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { useRouter } from 'next/navigation'

const ROLES = ['staff', 'vet', 'admin']

const GRANTABLE_PERMISSIONS = [
  { key: 'clinical_notes', label: 'Clinical Notes & Diagnosis' },
  { key: 'prescriptions',  label: 'Prescriptions' },
  { key: 'labs',           label: 'Lab Requests' },
  { key: 'vaccinations',   label: 'Vaccinations' },
  { key: 'delete_patient', label: 'Delete Patients' },
  { key: 'reports',        label: 'View Reports' },
]

const DEFAULT_PERMISSIONS = {
  admin: ['register_patient','book_appointment','record_vitals','clinical_notes','prescriptions','labs','vaccinations','manage_staff','settings','delete_patient','reports'],
  vet:   ['register_patient','book_appointment','record_vitals','clinical_notes','prescriptions','labs','vaccinations'],
  staff: ['register_patient','book_appointment','record_vitals'],
}

// ── Invite Modal ──────────────────────────────────────────────────────────────

function InviteModal({ onClose, onInvited }) {
  const [email, setEmail]     = useState('')
  const [role, setRole]       = useState('staff')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!email.trim()) { toast.error('Email is required'); return }
    setSending(true)
    try {
      const res  = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Invitation sent to ${email}`)
      onInvited()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to send invitation')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-indigo-600" />
            <h2 className="font-bold text-gray-900 dark:text-white">Invite Staff Member</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="staff@example.com"
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Role</label>
            <div className="flex gap-2">
              {['staff', 'vet', 'admin'].map(r => (
                <button key={r} onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    role === r ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              An invitation email will be sent. Staff must click the link to set up their account and cannot sign up directly.
            </p>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors border border-gray-200 dark:border-zinc-700">
              Cancel
            </button>
            <button onClick={handleSend} disabled={sending}
              className="flex-1 px-4 py-2.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {sending ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              {sending ? 'Sending…' : 'Send Invitation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Staff Row ─────────────────────────────────────────────────────────────────

function StaffRow({ user, onUpdate }) {
  const [expanded, setExpanded]       = useState(false)
  const [role, setRole]               = useState(user.role)
  const [permissions, setPermissions] = useState(user.permissions || [])
  const [saving, setSaving]           = useState(false)

  const defaultPerms = DEFAULT_PERMISSIONS[role] || []
  const extraPerms   = GRANTABLE_PERMISSIONS.filter(p => !defaultPerms.includes(p.key))

  const togglePerm = (key) => {
    setPermissions(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key])
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`/api/admin/staff/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, permissions }),
      })
      toast.success(`Updated ${user.firstName} ${user.lastName}`)
      onUpdate()
      setExpanded(false)
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  return (
    <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
      >
        <img src={user.imageUrl} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">{user.email}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
          user.role === 'admin' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          : user.role === 'vet' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
          : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
        }`}>
          {user.role}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-zinc-800 p-4 space-y-4 bg-gray-50 dark:bg-zinc-800/30">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Role</label>
            <div className="flex gap-2">
              {ROLES.map(r => (
                <button key={r} onClick={() => { setRole(r); setPermissions([]) }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                    role === r ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:border-indigo-400'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {role !== 'admin' && extraPerms.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Extra Permissions <span className="font-normal normal-case">(on top of {role} defaults)</span>
              </label>
              <div className="space-y-2">
                {extraPerms.map(p => (
                  <label key={p.key} className="flex items-center gap-3 cursor-pointer group">
                    <div onClick={() => togglePerm(p.key)}
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors flex-shrink-0 ${
                        permissions.includes(p.key) ? 'bg-indigo-600' : 'border-2 border-gray-300 dark:border-zinc-600'
                      }`}>
                      {permissions.includes(p.key) && <Check size={12} className="text-white" />}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-zinc-300">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400 dark:text-zinc-500">
            Default {role} permissions: {DEFAULT_PERMISSIONS[role].join(', ')}
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setExpanded(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { canAccessSettings, isLoaded } = useRole()
  const router = useRouter()
  const [staff, setStaff]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [refreshKey, setRefreshKey]   = useState(0)
  const [showInvite, setShowInvite]   = useState(false)

  useEffect(() => {
    if (isLoaded && !canAccessSettings) router.replace('/dashboard')
  }, [isLoaded, canAccessSettings, router])

  useEffect(() => {
    fetch('/api/admin/staff')
      .then(r => r.json())
      .then(data => setStaff(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load staff'))
      .finally(() => setLoading(false))
  }, [refreshKey])

  if (!isLoaded) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!canAccessSettings) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
          <Shield size={20} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Manage staff roles and permissions</p>
        </div>
      </div>

      {/* Staff list */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-gray-500 dark:text-zinc-400" />
          <h2 className="font-bold text-gray-900 dark:text-white">Staff Members</h2>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-400">{staff.length} users</span>
            <button onClick={() => setShowInvite(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors">
              <UserPlus size={13} /> Invite Staff
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse" />)}
          </div>
        ) : staff.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No staff found</p>
        ) : (
          <div className="space-y-2">
            {staff.map(u => <StaffRow key={u.id} user={u} onUpdate={() => setRefreshKey(k => k + 1)} />)}
          </div>
        )}
      </div>

      {/* Role legend */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Role Permissions Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="text-left pb-3">Permission</th>
                <th className="text-center pb-3">Staff</th>
                <th className="text-center pb-3">Vet</th>
                <th className="text-center pb-3">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {[
                ['Register Patients',     true,  true,  true ],
                ['Book Appointments',     true,  true,  true ],
                ['Record Vitals',         true,  true,  true ],
                ['Clinical Notes',        false, true,  true ],
                ['Prescriptions',         false, true,  true ],
                ['Lab Requests',          false, true,  true ],
                ['Vaccinations',          false, true,  true ],
                ['Delete Patients',       false, false, true ],
                ['View Reports',          false, false, true ],
                ['Settings / Staff Mgmt', false, false, true ],
              ].map(([label, s, v, a]) => (
                <tr key={label}>
                  <td className="py-2.5 text-gray-700 dark:text-zinc-300">{label}</td>
                  {[s, v, a].map((has, i) => (
                    <td key={i} className="py-2.5 text-center">
                      {has ? <span className="text-green-500">✓</span> : <span className="text-gray-300 dark:text-zinc-600">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onInvited={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  )
}
