import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { patientOwners } from '@/db/schema'
import { randomUUID } from 'crypto'

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    await db.insert(patientOwners).values({
      id:           randomUUID(),
      patientId:    body.patientId,
      ownerId:      body.ownerId,
      relationship: body.relationship || 'primary',
    })
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/patient-owners]', err)
    return NextResponse.json({ error: 'Failed to link owner' }, { status: 500 })
  }
}
