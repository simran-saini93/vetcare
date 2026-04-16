import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { patients, owners, patientOwners } from '@/db/schema'
import { like, or, eq, and } from 'drizzle-orm'

export async function GET(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const q       = searchParams.get('q')       || ''
    const species = searchParams.get('species')  || ''
    const breed   = searchParams.get('breed')    || ''
    const status  = searchParams.get('status')   || ''

    if (!q && !species && !breed && !status) {
      return NextResponse.json([])
    }

    const pattern = `%${q}%`

    // Build conditions
    const conditions = []

    if (q) {
      conditions.push(or(
        like(patients.name,            pattern),
        like(patients.microchipNumber, pattern),
        like(patients.breed,           pattern),
        like(patients.species,         pattern),
      ))
    }
    if (species) conditions.push(eq(patients.species, species))
    if (breed)   conditions.push(like(patients.breed, `%${breed}%`))
    if (status === 'active')   conditions.push(eq(patients.isActive, true))
    if (status === 'inactive') conditions.push(eq(patients.isActive, false))

    const whereClause = conditions.length > 0
      ? conditions.reduce((acc, c) => and(acc, c))
      : undefined

    const results = whereClause
      ? await db.select().from(patients).where(whereClause).limit(20)
      : await db.select().from(patients).limit(20)

    // Also search by owner name/phone if q provided
    let ownerMatches = []
    if (q) {
      ownerMatches = await db.select({
        id:              patients.id,
        name:            patients.name,
        species:         patients.species,
        breed:           patients.breed,
        primaryPhotoUrl: patients.primaryPhotoUrl,
        lastVisitDate:   patients.lastVisitDate,
        isActive:        patients.isActive,
        isStreetAnimal:  patients.isStreetAnimal,
      })
        .from(patients)
        .innerJoin(patientOwners, eq(patientOwners.patientId, patients.id))
        .innerJoin(owners, eq(owners.id, patientOwners.ownerId))
        .where(or(
          like(owners.firstName, pattern),
          like(owners.lastName,  pattern),
          like(owners.phone,     pattern),
        ))
        .limit(20)
    }

    // Merge and deduplicate
    const merged = [...results]
    ownerMatches.forEach(om => {
      if (!merged.find(r => r.id === om.id)) merged.push(om)
    })

    return NextResponse.json(merged.slice(0, 20))
  } catch (err) {
    console.error('[GET /api/search]', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
