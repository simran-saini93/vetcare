import { NextResponse } from 'next/server'
import { db } from '@/db'
import { vaccinations, patients, owners, patientOwners, reminderLogs } from '@/db/schema'
import { eq, and, lte, isNotNull, gte } from 'drizzle-orm'
import { Resend } from 'resend'
import { randomUUID } from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

// Vercel cron: runs daily at 8am
// vercel.json: { "crons": [{ "path": "/api/cron/vaccine-reminders", "schedule": "0 8 * * *" }] }

export async function GET(req) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today         = new Date()
    const in30Days      = new Date(); in30Days.setDate(today.getDate() + 30)
    const remindersSent = []
    const errors        = []

    // Get vaccinations due in next 30 days or already overdue
    const dueVaccinations = await db
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
          lte(vaccinations.nextDueDate, in30Days)
        )
      )

    for (const vacc of dueVaccinations) {
      const daysUntilDue = Math.ceil((new Date(vacc.nextDueDate) - today) / (1000 * 60 * 60 * 24))
      const isOverdue    = daysUntilDue < 0

      // Only remind at: 30 days, 14 days, 7 days, 1 day, and overdue
      const shouldRemind = [30, 14, 7, 1].includes(daysUntilDue) || (isOverdue && daysUntilDue >= -7)
      if (!shouldRemind) continue

      // Get owner email
      const ownerRows = await db
        .select({ email: owners.email, firstName: owners.firstName, lastName: owners.lastName })
        .from(patientOwners)
        .leftJoin(owners, eq(patientOwners.ownerId, owners.id))
        .where(eq(patientOwners.patientId, vacc.patientId))

      const owner = ownerRows.find(o => o.email)
      if (!owner?.email) continue

      const subject = isOverdue
        ? `⚠️ Overdue: ${vacc.patientName}'s ${vacc.vaccineName} vaccination`
        : `Reminder: ${vacc.patientName}'s ${vacc.vaccineName} due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`

      const dueText = isOverdue
        ? `was due on ${new Date(vacc.nextDueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} (${Math.abs(daysUntilDue)} days ago)`
        : `is due on ${new Date(vacc.nextDueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`

      try {
        await resend.emails.send({
          from:    `VetCare Pro <${process.env.RESEND_FROM_EMAIL}>`,
          to:      owner.email,
          subject,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;color:#111">
              <div style="margin-bottom:28px">
                <span style="font-size:22px;font-weight:800;color:#4f46e5">🐾 VetCare Pro</span>
              </div>
              <h2 style="font-size:20px;margin-bottom:8px">${isOverdue ? '⚠️ Vaccination Overdue' : '💉 Vaccination Reminder'}</h2>
              <p style="color:#555;margin-bottom:24px">Dear ${owner.firstName},</p>
              <div style="background:#f8fafc;border-left:4px solid ${isOverdue ? '#ef4444' : '#4f46e5'};padding:16px 20px;border-radius:4px;margin-bottom:24px">
                <p style="margin:0;font-size:15px">
                  <strong>${vacc.patientName}</strong>'s <strong>${vacc.vaccineName}</strong> vaccination ${dueText}.
                </p>
              </div>
              <p style="color:#555">Please contact us to schedule an appointment at your earliest convenience.</p>
              <div style="margin-top:32px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#aaa">
                HSCC Veterinary Clinic · VetCare Pro
              </div>
            </div>
          `,
        })

        // Log reminder
        await db.insert(reminderLogs).values({
          id:            randomUUID(),
          vaccinationId: vacc.id,
          sentAt:        new Date(),
          recipientEmail: owner.email,
          status:        'sent',
        })

        remindersSent.push({ patient: vacc.patientName, vaccine: vacc.vaccineName, email: owner.email })
      } catch (err) {
        errors.push({ patient: vacc.patientName, error: err.message })
      }
    }

    // ── Follow-up appointment reminders — day before ─────────────────────────
    const tomorrow      = new Date(); tomorrow.setDate(today.getDate() + 1)
    const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0)
    const tomorrowEnd   = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59)

    const tomorrowApts = await db
      .select({
        id:          appointments.id,
        patientId:   appointments.patientId,
        patientName: appointments.patientName,
        scheduledAt: appointments.scheduledAt,
        type:        appointments.type,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.status, 'scheduled'),
          gte(appointments.scheduledAt, tomorrowStart),
          lte(appointments.scheduledAt, tomorrowEnd)
        )
      )

    const aptRemindersSent = []
    for (const apt of tomorrowApts) {
      const ownerRows = await db
        .select({ email: owners.email, firstName: owners.firstName })
        .from(patientOwners)
        .leftJoin(owners, eq(patientOwners.ownerId, owners.id))
        .where(eq(patientOwners.patientId, apt.patientId))

      const owner = ownerRows.find(o => o.email)
      if (!owner?.email) continue

      const apptDate = new Date(apt.scheduledAt)
      const dateStr  = apptDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      const timeStr  = apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      try {
        await resend.emails.send({
          from:    `VetCare Pro <${process.env.RESEND_FROM_EMAIL}>`,
          to:      owner.email,
          subject: `Reminder: ${apt.patientName}'s appointment tomorrow`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;color:#111">
              <span style="font-size:22px;font-weight:800;color:#4f46e5">🐾 VetCare Pro</span>
              <h2 style="margin-top:24px">Appointment Reminder</h2>
              <p>Dear ${owner.firstName},</p>
              <div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:16px 20px;border-radius:4px;margin:20px 0">
                <p style="margin:0"><strong>${apt.patientName}</strong> has an appointment <strong>tomorrow</strong>.<br/><br/>
                <strong>Date:</strong> ${dateStr}<br/>
                <strong>Time:</strong> ${timeStr}<br/>
                <strong>Type:</strong> ${apt.type?.charAt(0).toUpperCase() + apt.type?.slice(1)}</p>
              </div>
              <div style="margin-top:32px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#aaa">
                HSCC Veterinary Clinic · VetCare Pro
              </div>
            </div>
          `,
        })
        aptRemindersSent.push({ patient: apt.patientName, email: owner.email })
      } catch (err) {
        errors.push({ patient: apt.patientName, error: err.message })
      }
    }

    return NextResponse.json({
      success:          true,
      vaccSent:         remindersSent.length,
      aptRemindersSent: aptRemindersSent.length,
      errors:           errors.length,
    })
  } catch (err) {
    console.error('[cron/vaccine-reminders]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
