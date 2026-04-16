'use client'

import { useRole } from '@/hooks/useRole'

/**
 * <RoleGuard permission="clinical_notes">  — check specific permission
 * <RoleGuard role="admin">                 — check role level
 * <RoleGuard permission="labs" fallback={<p>No access</p>}>
 */
export default function RoleGuard({ permission, role, fallback = null, children }) {
  const { can, isAdmin, isVet } = useRole()

  let hasAccess = true
  if (permission) hasAccess = can(permission)
  else if (role === 'admin') hasAccess = isAdmin
  else if (role === 'vet')   hasAccess = isVet

  return hasAccess ? children : fallback
}
