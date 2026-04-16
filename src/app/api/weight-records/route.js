import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { weightRecords } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function GET(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get('patientId')
    const rows = patientId
      ? await db.select().from(weightRecords).where(eq(weightRecords.patientId, patientId)).orderBy(desc(weightRecords.recordedAt))
      : await db.select().from(weightRecords).orderBy(desc(weightRecords.recordedAt))
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch weight records' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const id = randomUUID()
    await db.insert(weightRecords).values({
      id,
      patientId:  body.patientId,
      weightKg:   body.weightKg,
      recordedAt: body.recordedAt ? new Date(body.recordedAt) : new Date(),
      recordedBy: userId,
      notes:      body.notes || null,
    })
    return NextResponse.json({ id }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create weight record' }, { status: 500 })
  }
}
