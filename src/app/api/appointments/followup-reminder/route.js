import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { patients, patientOwners, owners } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Stores follow-up reminders to be sent by cron the day before
// For now sends a confirmation email immediately + cron picks up tomorrow reminder
export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { patientId, patientName, scheduledAt, type } = await req.json()

    // Get owner email
    const ownerRows = await db
      .select({ email: owners.email, firstName: owners.firstName })
      .from(patientOwners)
      .leftJoin(owners, eq(patientOwners.ownerId, owners.id))
      .where(eq(patientOwners.patientId, patientId))

    const owner = ownerRows.find(o => o.email)
    if (!owner?.email) return NextResponse.json({ success: true, note: 'No owner email found' })

    const apptDate = new Date(scheduledAt)
    const dateStr  = apptDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const timeStr  = apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Send booking confirmation now
    await resend.emails.send({
      from:    `VetCare Pro <${process.env.RESEND_FROM_EMAIL}>`,
      to:      owner.email,
      subject: `Follow-up appointment booked for ${patientName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;color:#111">
          <div style="margin-bottom:24px">
            <span style="font-size:22px;font-weight:800;color:#4f46e5">🐾 VetCare Pro</span>
          </div>
          <h2 style="font-size:18px;margin-bottom:8px">Follow-up Appointment Booked</h2>
          <p style="color:#555;margin-bottom:20px">Dear ${owner.firstName},</p>
          <div style="background:#f5f3ff;border-left:4px solid #7c3aed;padding:16px 20px;border-radius:4px;margin-bottom:20px">
            <p style="margin:0;font-size:15px">
              A follow-up appointment has been scheduled for <strong>${patientName}</strong>.<br/><br/>
              <strong>Date:</strong> ${dateStr}<br/>
              <strong>Time:</strong> ${timeStr}<br/>
              <strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}
            </p>
          </div>
          <p style="color:#555;font-size:13px">You will receive a reminder the day before the appointment.</p>
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#aaa">
            HSCC Veterinary Clinic · VetCare Pro
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[followup-reminder]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
