import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { weightRecords } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    await db.delete(weightRecords).where(eq(weightRecords.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete weight record' }, { status: 500 })
  }
}
