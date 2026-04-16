import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { appointments, patients } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const [row] = await db.select().from(appointments).where(eq(appointments.id, id))
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(row)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const body = await req.json()
    if (body.status === 'completed') {
      const [apt] = await db.select().from(appointments).where(eq(appointments.id, id))
      if (apt?.patientId) {
        await db.update(patients).set({ lastVisitDate: new Date() }).where(eq(patients.id, apt.patientId))
      }
    }
    await db.update(appointments).set(body).where(eq(appointments.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    await db.delete(appointments).where(eq(appointments.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 })
  }
}
