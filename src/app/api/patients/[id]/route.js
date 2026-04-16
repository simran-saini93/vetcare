import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { patients, weightRecords, patientPhotos, patientOwners, owners } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const [patient] = await db.select().from(patients).where(eq(patients.id, id))
    if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let weights = [], photos = [], patOwners = []

    try {
      weights = await db.select().from(weightRecords)
        .where(eq(weightRecords.patientId, id))
        .orderBy(desc(weightRecords.recordedAt))
    } catch {}

    try {
      photos = await db.select().from(patientPhotos)
        .where(eq(patientPhotos.patientId, id))
        .orderBy(desc(patientPhotos.createdAt))
    } catch {}

    try {
      patOwners = await db.select({
        id:           patientOwners.id,
        relationship: patientOwners.relationship,
        ownerId:      patientOwners.ownerId,
        firstName:    owners.firstName,
        lastName:     owners.lastName,
        phone:        owners.phone,
        email:        owners.email,
      })
        .from(patientOwners)
        .leftJoin(owners, eq(patientOwners.ownerId, owners.id))
        .where(eq(patientOwners.patientId, id))
    } catch {}

    return NextResponse.json({ ...patient, weights, photos, owners: patOwners })
  } catch (err) {
    console.error('[GET /api/patients/[id]]', err)
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const body = await req.json()
    await db.update(patients).set(body).where(eq(patients.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    await db.delete(patients).where(eq(patients.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 })
  }
}
