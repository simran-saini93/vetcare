import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

function getRole(sessionClaims) {
  return sessionClaims?.publicMetadata?.role
      || sessionClaims?.metadata?.role
      || sessionClaims?.role
      || 'staff'
}

export async function PUT(req, { params }) {
  try {
    const { sessionClaims } = await auth()
    const role = getRole(sessionClaims)
    if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { userId } = await params
    const { role: newRole, permissions } = await req.json()
    const client = await clerkClient()

    const user     = await client.users.getUser(userId)
    const existing = user.publicMetadata || {}

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...existing,
        ...(newRole       !== undefined && { role: newRole }),
        ...(permissions   !== undefined && { permissions }),
      },
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
