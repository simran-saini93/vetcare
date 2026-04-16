import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { visitRecords, prescriptions, labRequests } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const [record] = await db.select().from(visitRecords).where(eq(visitRecords.id, id))
    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const rxs  = await db.select().from(prescriptions).where(eq(prescriptions.visitId, id))
    const labs = await db.select().from(labRequests).where(eq(labRequests.visitId, id))
    return NextResponse.json({ ...record, prescriptions: rxs, labRequests: labs })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch visit record' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const body = await req.json()
    await db.update(visitRecords).set(body).where(eq(visitRecords.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update visit record' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    await db.delete(visitRecords).where(eq(visitRecords.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete visit record' }, { status: 500 })
  }
}
