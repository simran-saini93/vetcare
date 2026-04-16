import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { patientPhotos, patients } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function GET(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get('patientId')
    const rows = patientId
      ? await db.select().from(patientPhotos)
          .where(and(eq(patientPhotos.patientId, patientId), eq(patientPhotos.isArchived, false)))
          .orderBy(desc(patientPhotos.createdAt))
      : await db.select().from(patientPhotos).orderBy(desc(patientPhotos.createdAt))
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()

    // Enforce max 5 active photos per patient
    const existing = await db.select().from(patientPhotos)
      .where(and(eq(patientPhotos.patientId, body.patientId), eq(patientPhotos.isArchived, false)))
    if (existing.length >= 5) {
      return NextResponse.json({ error: 'Maximum 5 active photos per patient' }, { status: 400 })
    }

    const id = randomUUID()

    // If setting as primary, unset others
    if (body.isPrimary) {
      await db.update(patientPhotos).set({ isPrimary: false })
        .where(eq(patientPhotos.patientId, body.patientId))
      await db.update(patients).set({ primaryPhotoUrl: body.cloudinaryUrl })
        .where(eq(patients.id, body.patientId))
    }

    await db.insert(patientPhotos).values({
      id,
      patientId:          body.patientId,
      cloudinaryUrl:      body.cloudinaryUrl,
      cloudinaryPublicId: body.cloudinaryPublicId,
      label:              body.label      || null,
      notes:              body.notes      || null,
      takenAt:            body.takenAt    ? new Date(body.takenAt) : new Date(),
      uploadedBy:         userId,
      visitId:            body.visitId    || null,
      isPrimary:          body.isPrimary  ?? false,
      isArchived:         false,
    })
    return NextResponse.json({ id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/patient-photos]', err)
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
  }
}
