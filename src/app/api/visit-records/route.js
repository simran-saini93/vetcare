import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { visitRecords, weightRecords } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function GET(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get('patientId')
    const query = db.select().from(visitRecords)
    const rows = patientId
      ? await query.where(eq(visitRecords.patientId, patientId)).orderBy(desc(visitRecords.createdAt))
      : await query.orderBy(desc(visitRecords.createdAt))
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch visit records' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const id = randomUUID()

    await db.insert(visitRecords).values({
      id,
      appointmentId:         body.appointmentId         || null,
      patientId:             body.patientId,
      vetId:                 userId,
      chiefComplaint:        body.chiefComplaint        || null,
      temperature:           body.temperature           || null,
      weightKg:              body.weightKg              || null,
      heartRate:             body.heartRate             || null,
      respiratoryRate:       body.respiratoryRate       || null,
      diagnosisPrimary:      body.diagnosisPrimary      || null,
      diagnosisDifferential: body.diagnosisDifferential || null,
      diagnosisCode:         body.diagnosisCode         || null,
      treatmentPlan:         body.treatmentPlan         || null,
      proceduresPerformed:   body.proceduresPerformed   || null,
      internalNotes:         body.internalNotes         || null,
      followUpInstructions:  body.followUpInstructions  || null,
    })

    // Auto-create weight record if weight provided
    if (body.weightKg) {
      await db.insert(weightRecords).values({
        id:         randomUUID(),
        patientId:  body.patientId,
        weightKg:   body.weightKg,
        recordedAt: new Date(),
        recordedBy: userId,
        notes:      `Recorded during visit`,
      })
    }

    return NextResponse.json({ id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/visit-records]', err)
    return NextResponse.json({ error: 'Failed to create visit record' }, { status: 500 })
  }
}
