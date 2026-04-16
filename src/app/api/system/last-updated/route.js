import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { appointments } from '@/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [latest] = await db
      .select({ createdAt: appointments.createdAt })
      .from(appointments)
      .orderBy(desc(appointments.createdAt))
      .limit(1)

    return NextResponse.json({
      timestamp: latest?.createdAt ? new Date(latest.createdAt).toISOString() : null
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
