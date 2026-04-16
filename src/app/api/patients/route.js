import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { patients, patientOwners, owners } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rows = await db.select().from(patients).orderBy(desc(patients.createdAt))

    // Fetch primary owner for each patient
    const withOwners = await Promise.all(rows.map(async p => {
      const ownerRows = await db
        .select({ firstName: owners.firstName, lastName: owners.lastName, phone: owners.phone })
        .from(patientOwners)
        .leftJoin(owners, eq(patientOwners.ownerId, owners.id))
        .where(eq(patientOwners.patientId, p.id))
        .limit(1)

      const owner = ownerRows[0]
      return {
        ...p,
        ownerName: owner ? `${owner.firstName} ${owner.lastName}`.trim() : null,
        ownerPhone: owner?.phone || null,
      }
    }))

    return NextResponse.json(withOwners)
  } catch (err) {
    console.error('[GET /api/patients]', err)
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const id = randomUUID()
    await db.insert(patients).values({
      id,
      name:              body.name,
      species:           body.species,
      breed:             body.breed             || null,
      dateOfBirth:       body.dateOfBirth       || null,
      sex:               body.sex               || 'unknown',
      isNeutered:        body.isNeutered        ?? false,
      color:             body.color             || null,
      microchipNumber:   body.microchipNumber   || null,
      allergies:         body.allergies         || null,
      chronicConditions: body.chronicConditions || null,
      handlingNotes:     body.handlingNotes     || null,
      insuranceProvider: body.insuranceProvider || null,
      insurancePolicyNo: body.insurancePolicyNo || null,
      isActive:          body.isActive          ?? true,
      isStreetAnimal:    body.isStreetAnimal    ?? false,
    })
    const { eq: eqFn } = await import('drizzle-orm')
    const [created] = await db.select().from(patients).where(eqFn(patients.id, id))
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error('[POST /api/patients]', err)
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 })
  }
}
