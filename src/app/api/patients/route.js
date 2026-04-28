import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { patients, patientOwners, owners } from '@/db/schema'
import { desc, eq, sql, like, or, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function GET(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const search  = searchParams.get('search')  || ''
    const species = searchParams.get('species') || ''
    const status  = searchParams.get('status')  || ''
    const limit   = Math.min(parseInt(searchParams.get('limit')  || '50'), 100)
    const offset  = parseInt(searchParams.get('offset') || '0')

    // Build where conditions
    const conditions = []
    if (search) {
      conditions.push(or(
        like(patients.name,           `%${search}%`),
        like(patients.microchipNumber, `%${search}%`),
        like(patients.breed,           `%${search}%`),
      ))
    }
    if (species) conditions.push(eq(patients.species, species))
    if (status)  conditions.push(eq(patients.isActive, status === 'active'))

    const where = conditions.length > 0 ? and(...conditions) : undefined

    // Single JOIN — one query for all data
    const [rows, [{ total }]] = await Promise.all([
      db.select({
        id:                patients.id,
        name:              patients.name,
        species:           patients.species,
        breed:             patients.breed,
        dateOfBirth:       patients.dateOfBirth,
        sex:               patients.sex,
        isNeutered:        patients.isNeutered,
        color:             patients.color,
        microchipNumber:   patients.microchipNumber,
        allergies:         patients.allergies,
        chronicConditions: patients.chronicConditions,
        handlingNotes:     patients.handlingNotes,
        insuranceProvider: patients.insuranceProvider,
        insurancePolicyNo: patients.insurancePolicyNo,
        isActive:          patients.isActive,
        isStreetAnimal:    patients.isStreetAnimal,
        primaryPhotoUrl:   patients.primaryPhotoUrl,
        createdAt:         patients.createdAt,
        ownerName:         sql`TRIM(CONCAT(COALESCE(${owners.firstName},''), ' ', COALESCE(${owners.lastName},'')))`,
        ownerPhone:        owners.phone,
      })
      .from(patients)
      .leftJoin(patientOwners, eq(patientOwners.patientId, patients.id))
      .leftJoin(owners, eq(owners.id, patientOwners.ownerId))
      .where(where)
      .orderBy(desc(patients.createdAt))
      .limit(limit)
      .offset(offset),

      db.select({ total: sql`COUNT(*)`.mapWith(Number) })
        .from(patients)
        .where(where),
    ])

    return NextResponse.json({ data: rows, total, limit, offset })
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
    const [created] = await db.select().from(patients).where(eq(patients.id, id))
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error('[POST /api/patients]', err)
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 })
  }
}
