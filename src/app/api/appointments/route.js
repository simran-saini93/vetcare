import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { appointments } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const rows = await db.select().from(appointments).orderBy(desc(appointments.scheduledAt))
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[GET /api/appointments]', err)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const id = randomUUID()
    await db.insert(appointments).values({
      id,
      patientId:       body.patientId,
      patientName:     body.patientName     || null,
      vetId:           userId,
      scheduledAt:     new Date(body.scheduledAt),
      type:            body.type            || 'checkup',
      status:          'scheduled',
      durationMinutes: body.durationMinutes || null,
      followUpDate:    body.followUpDate    ? new Date(body.followUpDate) : null,
      notes:           body.notes           || null,
    })
    return NextResponse.json({ id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/appointments]', err)
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}
