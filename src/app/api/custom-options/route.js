import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { customOptions } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function GET(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    if (!type) return NextResponse.json({ error: 'type is required' }, { status: 400 })

    const rows = await db.select()
      .from(customOptions)
      .where(eq(customOptions.type, type))
      .orderBy(customOptions.value)

    return NextResponse.json(rows.map(r => r.value))
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { type, value } = await req.json()
    if (!type || !value) return NextResponse.json({ error: 'type and value required' }, { status: 400 })

    // Check for duplicate
    const existing = await db.select()
      .from(customOptions)
      .where(and(eq(customOptions.type, type), eq(customOptions.value, value)))

    if (existing.length > 0) return NextResponse.json({ success: true, duplicate: true })

    await db.insert(customOptions).values({
      id:        randomUUID(),
      type,
      value:     value.trim(),
      createdBy: userId,
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save option' }, { status: 500 })
  }
}