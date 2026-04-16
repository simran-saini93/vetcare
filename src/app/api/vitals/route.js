import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { appointmentVitals } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function GET(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const appointmentId = searchParams.get('appointmentId')
    if (!appointmentId) return NextResponse.json(null)

    const [row] = await db.select().from(appointmentVitals)
      .where(eq(appointmentVitals.appointmentId, appointmentId))

    return NextResponse.json(row || null)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch vitals' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { appointmentId, patientId, weightKg, temperature, heartRate, respiratoryRate } = body

    // Upsert — delete existing then insert
    await db.delete(appointmentVitals).where(eq(appointmentVitals.appointmentId, appointmentId))

    const [row] = await db.insert(appointmentVitals).values({
      id: randomUUID(),
      appointmentId,
      patientId,
      weightKg:        weightKg        || null,
      temperature:     temperature     || null,
      heartRate:       heartRate       || null,
      respiratoryRate: respiratoryRate || null,
      recordedBy:      userId,
      recordedAt:      new Date(),
    }).$returningId()

    return NextResponse.json({ success: true, id: row?.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to save vitals' }, { status: 500 })
  }
}
