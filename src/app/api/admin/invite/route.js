import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

function getRole(sessionClaims) {
  return sessionClaims?.publicMetadata?.role
      || sessionClaims?.metadata?.role
      || 'staff'
}

export async function POST(req) {
  try {
    const { sessionClaims } = await auth()
    if (getRole(sessionClaims) !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { email, role = 'staff' } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const client = await clerkClient()

    await client.invitations.createInvitation({
      emailAddress:   email,
      publicMetadata: { role },
      redirectUrl:    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-in`,
      ignoreExisting: true,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/admin/invite]', err)
    return NextResponse.json({ error: err.message || 'Failed to send invitation' }, { status: 500 })
  }
}
