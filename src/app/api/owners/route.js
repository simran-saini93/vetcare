import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { owners } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const rows = await db.select().from(owners).orderBy(desc(owners.createdAt))
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[GET /api/owners]', err)
    return NextResponse.json({ error: 'Failed to fetch owners' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const id = randomUUID()
    await db.insert(owners).values({
      id,
      firstName: body.firstName,
      lastName:  body.lastName,
      email:     body.email     || null,
      phone:     body.phone,
      altPhone:  body.altPhone  || null,
      address:   body.address   || null,
      city:      body.city      || null,
      notes:     body.notes     || null,
    })
    return NextResponse.json({ id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/owners]', err)
    return NextResponse.json({ error: 'Failed to create owner' }, { status: 500 })
  }
}
