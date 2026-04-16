'use client'

import { useUser } from '@clerk/nextjs'

const DEFAULT_PERMISSIONS = {
  admin: [
    'register_patient', 'book_appointment', 'record_vitals',
    'clinical_notes', 'prescriptions', 'labs', 'vaccinations',
    'manage_staff', 'settings', 'delete_patient', 'reports',
  ],
  vet: [
    'register_patient', 'book_appointment', 'record_vitals',
    'clinical_notes', 'prescriptions', 'labs', 'vaccinations',
  ],
  staff: [
    'register_patient', 'book_appointment', 'record_vitals',
  ],
}

export function useRole() {
  const { user, isLoaded } = useUser()
  const role = user?.publicMetadata?.role || 'staff'

  // Merge default permissions with any extra granted by admin
  const extraPermissions = user?.publicMetadata?.permissions || []
  const defaultPerms     = DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.staff
  const allPermissions   = [...new Set([...defaultPerms, ...extraPermissions])]

  const can = (permission) => allPermissions.includes(permission)

  return {
    role,
    isAdmin:  role === 'admin',
    isVet:    role === 'vet' || role === 'admin',
    isLoaded,
    can,
    // Shortcuts
    canRecordVitals:       can('record_vitals'),
    canRecordVisit:        can('clinical_notes'),
    canViewClinicalNotes:  can('clinical_notes'),
    canRecordPrescriptions:can('prescriptions'),
    canRecordLabs:         can('labs'),
    canManageVaccinations: can('vaccinations'),
    canAccessSettings:     can('settings'),
    canManageStaff:        can('manage_staff'),
    canDeletePatient:      can('delete_patient'),
    canViewReports:        can('reports'),
  }
}
