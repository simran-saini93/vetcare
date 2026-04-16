import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { patientPhotos, patients } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name:  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
})

export async function PUT(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const body = await req.json()

    if (body.isPrimary) {
      const [photo] = await db.select().from(patientPhotos).where(eq(patientPhotos.id, id))
      if (photo) {
        await db.update(patientPhotos).set({ isPrimary: false }).where(eq(patientPhotos.patientId, photo.patientId))
        await db.update(patients).set({ primaryPhotoUrl: photo.cloudinaryUrl }).where(eq(patients.id, photo.patientId))
      }
    }

    await db.update(patientPhotos).set(body).where(eq(patientPhotos.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    // Get photo record first to get the public_id
    const [photo] = await db.select().from(patientPhotos).where(eq(patientPhotos.id, id))
    if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Delete from Cloudinary
    if (photo.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(photo.cloudinaryPublicId)
      } catch (err) {
        console.error('Cloudinary delete failed:', err)
        // Don't block DB delete if Cloudinary fails
      }
    }

    // If this was the primary photo, clear it from patient
    if (photo.isPrimary) {
      await db.update(patients)
        .set({ primaryPhotoUrl: null })
        .where(eq(patients.id, photo.patientId))
    }

    // Hard delete from DB (not soft delete since we're removing from Cloudinary too)
    await db.delete(patientPhotos).where(eq(patientPhotos.id, id))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/patient-photos/[id]]', err)
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}
