import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { labRequests } from '@/db/schema'
import { randomUUID } from 'crypto'

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const id = randomUUID()
    await db.insert(labRequests).values({
      id,
      visitId:     body.visitId,
      patientId:   body.patientId,
      testName:    body.testName,
      status:      'requested',
      requestedBy: userId,
    })
    return NextResponse.json({ id }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create lab request' }, { status: 500 })
  }
}
