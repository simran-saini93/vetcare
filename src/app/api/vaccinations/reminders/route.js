import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { vaccinations, patients } from '@/db/schema'
import { eq, and, lte, isNotNull } from 'drizzle-orm'

// Returns vaccinations that are overdue or due within 30 days
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const rows = await db
      .select({
        id:          vaccinations.id,
        patientId:   vaccinations.patientId,
        patientName: patients.name,
        vaccineName: vaccinations.vaccineName,
        nextDueDate: vaccinations.nextDueDate,
      })
      .from(vaccinations)
      .leftJoin(patients, eq(vaccinations.patientId, patients.id))
      .where(
        and(
          isNotNull(vaccinations.nextDueDate),
          lte(vaccinations.nextDueDate, thirtyDaysFromNow)
        )
      )

    return NextResponse.json(rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 })
  }
}
