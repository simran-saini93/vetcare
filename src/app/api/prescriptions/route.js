import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { prescriptions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const id = randomUUID()
    await db.insert(prescriptions).values({
      id,
      visitId:         body.visitId,
      patientId:       body.patientId,
      drugName:        body.drugName,
      dose:            body.dose            || null,
      frequency:       body.frequency       || null,
      duration:        body.duration        || null,
      dispensingNotes: body.dispensingNotes || null,
      prescribedBy:    userId,
    })
    return NextResponse.json({ id }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 })
  }
}
