import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { vaccinations, patients } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function GET(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get('patientId')

    const rows = await db
      .select({
        id:              vaccinations.id,
        patientId:       vaccinations.patientId,
        patientName:     patients.name,
        patientPhotoUrl: patients.primaryPhotoUrl,
        visitId:         vaccinations.visitId,
        vaccineName:     vaccinations.vaccineName,
        batchNumber:     vaccinations.batchNumber,
        administeredAt:  vaccinations.administeredAt,
        administeredBy:  vaccinations.administeredBy,
        doseNumber:      vaccinations.doseNumber,
        seriesTotal:     vaccinations.seriesTotal,
        nextDueDate:     vaccinations.nextDueDate,
        status:          vaccinations.status,
        uploadedCertUrl: vaccinations.uploadedCertUrl,
        uploadedCertUrl: vaccinations.uploadedCertUrl,
      })
      .from(vaccinations)
      .leftJoin(patients, eq(vaccinations.patientId, patients.id))
      .where(patientId ? eq(vaccinations.patientId, patientId) : undefined)
      .orderBy(desc(vaccinations.administeredAt))

    return NextResponse.json(rows)
  } catch (err) {
    console.error('[GET /api/vaccinations]', err)
    return NextResponse.json({ error: 'Failed to fetch vaccinations' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const id = randomUUID()
    await db.insert(vaccinations).values({
      id,
      patientId:      body.patientId,
      visitId:        body.visitId       || null,
      vaccineName:    body.vaccineName,
      batchNumber:    body.batchNumber   || null,
      administeredAt: new Date(body.administeredAt),
      administeredBy: userId,
      doseNumber:     body.doseNumber    || 1,
      seriesTotal:    body.seriesTotal   || 1,
      nextDueDate:    body.nextDueDate   ? new Date(body.nextDueDate) : null,
      status:         'up_to_date',
    })
    return NextResponse.json({ id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/vaccinations]', err)
    return NextResponse.json({ error: 'Failed to create vaccination' }, { status: 500 })
  }
}
