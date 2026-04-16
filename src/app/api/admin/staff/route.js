import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

function getRole(sessionClaims) {
  return sessionClaims?.publicMetadata?.role
      || sessionClaims?.metadata?.role
      || sessionClaims?.role
      || 'staff'
}

export async function GET() {
  try {
    const { sessionClaims } = await auth()
    const role = getRole(sessionClaims)
    if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const client = await clerkClient()
    const { data: users } = await client.users.getUserList({ limit: 100 })
    const mapped = users.map(u => ({
      id:          u.id,
      firstName:   u.firstName,
      lastName:    u.lastName,
      email:       u.emailAddresses[0]?.emailAddress,
      role:        u.publicMetadata?.role || 'staff',
      permissions: u.publicMetadata?.permissions || [],
      imageUrl:    u.imageUrl,
    }))
    return NextResponse.json(mapped)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
