'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { User, Mail, Shield, Clock, Edit2, Save, X, Building2 } from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { Button } from '@/components/ui'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 dark:border-zinc-800 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={15} className="text-gray-500 dark:text-zinc-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{value || '—'}</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const { role } = useRole()

  const [editingName, setEditingName] = useState(false)
  const [firstName, setFirstName]     = useState('')
  const [lastName, setLastName]       = useState('')
  const [saving, setSaving]           = useState(false)

  const [editingClinic, setEditingClinic] = useState(false)
  const [clinicName, setClinicName]       = useState('HSCC Veterinary Clinic')
  const [clinicAddress, setClinicAddress] = useState('')
  const [clinicPhone, setClinicPhone]     = useState('')
  const [clinicEmail, setClinicEmail]     = useState('')

  const roleLabel = role === 'admin' ? 'Administrator' : role === 'vet' ? 'Veterinarian' : 'Staff'
  const roleColor = role === 'admin'
    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    : role === 'vet'
    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'

  const handleSaveName = async () => {
    setSaving(true)
    try {
      await user.update({ firstName, lastName })
      toast.success('Name updated')
      setEditingName(false)
    } catch {
      toast.error('Failed to update name')
    } finally {
      setSaving(false)
    }
  }

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || '?'
    : '?'

  if (!isLoaded) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Manage your account information</p>
      </div>

      {/* Avatar + name */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt={user.firstName} className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {initials}
              </div>
            )}
            <span className={`absolute -bottom-2 -right-2 text-xs font-bold px-2 py-0.5 rounded-full ${roleColor}`}>
              {roleLabel}
            </span>
          </div>

          {/* Name edit */}
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">First Name</label>
                    <input
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Last Name</label>
                    <input
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveName} disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50">
                    <Save size={13} /> {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditingName(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <button
                    onClick={() => { setFirstName(user?.firstName || ''); setLastName(user?.lastName || ''); setEditingName(true) }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Account Details</h3>
        <div>
          <InfoRow icon={Mail}   label="Email"       value={user?.primaryEmailAddress?.emailAddress} />
          <InfoRow icon={Shield} label="Role"        value={roleLabel} />
          <InfoRow icon={Clock}  label="Last Sign In" value={user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'} />
          <InfoRow icon={User}   label="User ID"     value={user?.id} />
        </div>
      </div>

      {/* Clinic info */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white">Clinic Information</h3>
          {role === 'admin' && (
            <button
              onClick={() => setEditingClinic(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
            >
              <Edit2 size={12} /> Edit
            </button>
          )}
        </div>

        {editingClinic ? (
          <div className="space-y-3">
            {[
              { label: 'Clinic Name',    value: clinicName,    set: setClinicName,    placeholder: 'e.g. HSCC Veterinary Clinic' },
              { label: 'Address',        value: clinicAddress, set: setClinicAddress, placeholder: 'Full clinic address' },
              { label: 'Phone',          value: clinicPhone,   set: setClinicPhone,   placeholder: '+1 000 000 0000' },
              { label: 'Contact Email',  value: clinicEmail,   set: setClinicEmail,   placeholder: 'clinic@example.com' },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button onClick={() => { toast.success('Clinic info saved'); setEditingClinic(false) }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors">
                <Save size={13} /> Save
              </button>
              <button onClick={() => setEditingClinic(false)}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <InfoRow icon={Building2} label="Clinic Name" value={clinicName}    />
            <InfoRow icon={User}      label="Address"     value={clinicAddress} />
            <InfoRow icon={Mail}      label="Phone"       value={clinicPhone}   />
            <InfoRow icon={Mail}      label="Email"       value={clinicEmail}   />
          </div>
        )}
      </div>
    </div>
  )
}
