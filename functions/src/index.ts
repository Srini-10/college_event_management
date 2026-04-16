import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as nodemailer from 'nodemailer'

admin.initializeApp()
const db = admin.firestore()

// Email transporter (configure via Firebase environment config)
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. onRegistrationCreate — generate QR token & send confirmation email
// ─────────────────────────────────────────────────────────────────────────────
export const onRegistrationCreate = functions.firestore
  .document('events/{eventId}/registrations/{regId}')
  .onCreate(async (snap, context) => {
    const data = snap.data()
    const { eventId, regId } = context.params

    // Generate QR token if missing
    if (!data.qrToken) {
      const token = `${eventId}-${regId}-${Date.now().toString(36)}`
      await snap.ref.update({ qrToken: token })
    }

    // Send confirmation email
    if (data.email) {
      try {
        const eventSnap = await db.doc(`events/${eventId}`).get()
        const event = eventSnap.data()
        const transporter = getTransporter()
        await transporter.sendMail({
          from: `"EventPro" <${process.env.SMTP_USER}>`,
          to: data.email,
          subject: `Registration Confirmed — ${event?.title || 'Event'}`,
          html: `
            <h2>Registration Confirmed!</h2>
            <p>Dear ${data.name},</p>
            <p>Your registration for <strong>${event?.title}</strong> has been confirmed.</p>
            <p><strong>Category:</strong> ${data.category}</p>
            <p><strong>QR Token:</strong> ${data.qrToken || ''}</p>
            <p>Please present this email or your QR code at the registration desk.</p>
            <br><p>Best regards,<br>${event?.collegeName || 'Event Team'}</p>
          `,
        })
      } catch (err) {
        console.error('Failed to send confirmation email:', err)
      }
    }
  })

// ─────────────────────────────────────────────────────────────────────────────
// 2. onGuestStatusChange — notify pickup volunteer when En Route
// ─────────────────────────────────────────────────────────────────────────────
export const onGuestStatusChange = functions.firestore
  .document('events/{eventId}/guests/{guestId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data()
    const after = change.after.data()
    const { eventId } = context.params

    if (before.status !== 'en_route' && after.status === 'en_route' && after.pickupAssignedTo) {
      try {
        const transporter = getTransporter()
        await transporter.sendMail({
          from: `"EventPro" <${process.env.SMTP_USER}>`,
          to: after.pickupAssignedTo,
          subject: `Guest En Route — ${after.name}`,
          html: `
            <h2>Guest is on the way!</h2>
            <p><strong>${after.name}</strong> (${after.designation}, ${after.organization}) is en route.</p>
            <p><strong>Arrival Mode:</strong> ${after.arrivalMode}</p>
            <p><strong>Expected Arrival:</strong> ${after.arrivalDateTime || 'TBD'}</p>
            <p>Please be ready at the pickup point.</p>
          `,
        })
      } catch (err) {
        console.error('Failed to send pickup notification:', err)
      }
    }
  })

// ─────────────────────────────────────────────────────────────────────────────
// 3. onBudgetApprovalRequest — notify admin of pending approval
// ─────────────────────────────────────────────────────────────────────────────
export const onBudgetApprovalRequest = functions.firestore
  .document('events/{eventId}/budget/{budgetId}')
  .onCreate(async (snap, context) => {
    const data = snap.data()
    const { eventId } = context.params

    if (data.approvalStatus === 'pending') {
      // Get event admins
      const adminsSnap = await db.collection('users')
        .where('role', 'in', ['event_admin', 'super_admin'])
        .get()

      const eventSnap = await db.doc(`events/${eventId}`).get()
      const event = eventSnap.data()

      const emails = adminsSnap.docs.map((d) => d.data().email).filter(Boolean)
      if (emails.length > 0) {
        try {
          const transporter = getTransporter()
          await transporter.sendMail({
            from: `"EventPro" <${process.env.SMTP_USER}>`,
            to: emails.join(','),
            subject: `Budget Approval Required — ${event?.title}`,
            html: `
              <h2>Budget Item Pending Approval</h2>
              <p><strong>Item:</strong> ${data.itemName}</p>
              <p><strong>Category:</strong> ${data.category}</p>
              <p><strong>Estimated Amount:</strong> ₹${data.estimatedAmount}</p>
              <p>Please review and approve this expense in the EventPro dashboard.</p>
            `,
          })
        } catch (err) {
          console.error('Failed to send approval notification:', err)
        }
      }
    }
  })

// ─────────────────────────────────────────────────────────────────────────────
// 4. scheduledReminderJob — hourly: notify pickup volunteers 2h before arrival
// ─────────────────────────────────────────────────────────────────────────────
export const scheduledReminderJob = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async () => {
    const now = new Date()
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    const eventsSnap = await db.collection('events').where('status', '==', 'active').get()

    for (const eventDoc of eventsSnap.docs) {
      const guestsSnap = await eventDoc.ref.collection('guests')
        .where('pickupRequired', '==', true)
        .where('status', '==', 'confirmed')
        .get()

      for (const guestDoc of guestsSnap.docs) {
        const guest = guestDoc.data()
        if (!guest.arrivalDateTime || !guest.pickupAssignedTo) continue

        const arrivalTime = new Date(guest.arrivalDateTime)
        const diffMs = arrivalTime.getTime() - now.getTime()

        // Send reminder if arrival is in the next 2 hours
        if (diffMs > 0 && diffMs <= 2 * 60 * 60 * 1000 && !guest.pickupReminderSent) {
          try {
            const transporter = getTransporter()
            await transporter.sendMail({
              from: `"EventPro" <${process.env.SMTP_USER}>`,
              to: guest.pickupAssignedTo,
              subject: `Pickup Reminder: ${guest.name} arriving in 2 hours`,
              html: `
                <h2>Pickup Reminder</h2>
                <p><strong>${guest.name}</strong> (${guest.designation}) is arriving in approximately 2 hours.</p>
                <p><strong>Arrival Time:</strong> ${guest.arrivalDateTime}</p>
                <p><strong>Mode:</strong> ${guest.arrivalMode}</p>
                <p>Please ensure the vehicle is ready and proceed to the pickup point.</p>
              `,
            })
            await guestDoc.ref.update({ pickupReminderSent: true })
          } catch (err) {
            console.error('Failed to send pickup reminder:', err)
          }
        }
      }
    }
  })

// ─────────────────────────────────────────────────────────────────────────────
// 5. bulkCertificateEmail — manually triggered, emails certificate PDFs
// ─────────────────────────────────────────────────────────────────────────────
export const bulkCertificateEmail = functions.https.onCall(async (data: any, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Auth required')

  const { eventId } = data
  const certsSnap = await db.collection('events').doc(eventId).collection('certificates')
    .where('emailed', '==', false).get()

  const regsSnap = await db.collection('events').doc(eventId).collection('registrations').get()
  const regMap = new Map(regsSnap.docs.map((d) => [d.id, d.data()]))
  const eventSnap = await db.doc(`events/${eventId}`).get()
  const event = eventSnap.data()

  let sent = 0
  const transporter = getTransporter()

  for (const certDoc of certsSnap.docs) {
    const cert = certDoc.data()
    const reg = regMap.get(cert.recipientRegId)
    const email = reg?.email

    if (!email) continue
    try {
      await transporter.sendMail({
        from: `"EventPro" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Your Certificate — ${event?.title}`,
        html: `
          <h2>Certificate of ${cert.certType.charAt(0).toUpperCase() + cert.certType.slice(1)}</h2>
          <p>Dear ${cert.recipientName},</p>
          <p>Thank you for participating in <strong>${event?.title}</strong>.</p>
          <p>Your certificate of <strong>${cert.certType}</strong> has been issued.</p>
          <p>Best regards,<br>${event?.collegeName || 'Event Team'}</p>
        `,
      })
      await certDoc.ref.update({ emailed: true, emailedAt: admin.firestore.FieldValue.serverTimestamp() })
      sent++
    } catch (err) {
      console.error('Failed to email certificate:', err)
    }
  }

  return { sent }
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. onAnnouncementScheduled — Pub/Sub trigger to send announcement at scheduled time
// ─────────────────────────────────────────────────────────────────────────────
export const processScheduledAnnouncements = functions.pubsub
  .schedule('every 15 minutes')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now()
    const eventsSnap = await db.collection('events').where('status', '==', 'active').get()

    for (const eventDoc of eventsSnap.docs) {
      const annsSnap = await eventDoc.ref.collection('announcements')
        .where('status', '==', 'scheduled')
        .get()

      for (const annDoc of annsSnap.docs) {
        const ann = annDoc.data()
        if (!ann.scheduledAt) continue

        const scheduledTime = new Date(ann.scheduledAt)
        if (scheduledTime <= new Date()) {
          // Mark as sent
          await annDoc.ref.update({
            status: 'sent',
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
          })
          // TODO: Add actual delivery channel logic here
          console.log(`Sent announcement: ${ann.title} for event ${eventDoc.id}`)
        }
      }
    }
  })

// ─────────────────────────────────────────────────────────────────────────────
// 7. generateEventReport — on-demand full event summary
// ─────────────────────────────────────────────────────────────────────────────
export const generateEventReport = functions.https.onCall(async (data: any, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Auth required')

  const { eventId } = data
  const [eventSnap, regsSnap, guestsSnap, budgetSnap, certsSnap] = await Promise.all([
    db.doc(`events/${eventId}`).get(),
    db.collection('events').doc(eventId).collection('registrations').get(),
    db.collection('events').doc(eventId).collection('guests').get(),
    db.collection('events').doc(eventId).collection('budget').get(),
    db.collection('events').doc(eventId).collection('certificates').get(),
  ])

  const event = eventSnap.data()
  const regs = regsSnap.docs.map((d) => d.data())
  const guests = guestsSnap.docs.map((d) => d.data())
  const budget = budgetSnap.docs.map((d) => d.data())

  const totalEstimated = budget.reduce((s: number, b: any) => s + (b.estimatedAmount || 0), 0)
  const totalActual = budget.reduce((s: number, b: any) => s + (b.actualAmount || 0), 0)

  return {
    event: { title: event?.title, date: event?.date, venue: event?.venue, collegeName: event?.collegeName },
    registrations: {
      total: regs.length,
      checkedIn: regs.filter((r: any) => r.checkedIn).length,
      categories: ['participant', 'guest', 'vip', 'media', 'volunteer'].reduce((acc: any, cat) => {
        acc[cat] = regs.filter((r: any) => r.category === cat).length
        return acc
      }, {}),
    },
    guests: {
      total: guests.length,
      arrived: guests.filter((g: any) => g.status === 'arrived').length,
      pending: guests.filter((g: any) => g.status === 'confirmed').length,
    },
    budget: { totalEstimated, totalActual, utilization: totalEstimated > 0 ? (totalActual / totalEstimated * 100).toFixed(1) + '%' : '0%' },
    certificates: { issued: certsSnap.size, emailed: certsSnap.docs.filter((d) => d.data().emailed).length },
    generatedAt: new Date().toISOString(),
  }
})
