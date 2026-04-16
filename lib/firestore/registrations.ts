import {
  collection, doc, addDoc, updateDoc, getDocs, getDoc,
  query, orderBy, where, onSnapshot, serverTimestamp, writeBatch, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Registration } from '@/lib/types'

function regCol(eventId: string) {
  return collection(db, 'events', eventId, 'registrations')
}

export async function addRegistration(
  eventId: string,
  data: Omit<Registration, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(regCol(eventId), {
    ...data,
    checkedIn: false,
    badgePrinted: false,
    certificateIssued: false,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateRegistration(
  eventId: string, id: string, data: Partial<Registration>
): Promise<void> {
  await updateDoc(doc(db, 'events', eventId, 'registrations', id), {
    ...data, updatedAt: serverTimestamp(),
  })
}

export async function getRegistrations(eventId: string): Promise<Registration[]> {
  const snap = await getDocs(query(regCol(eventId), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration))
}

export async function getRegistrationByToken(eventId: string, token: string): Promise<Registration | null> {
  const snap = await getDocs(query(regCol(eventId), where('qrToken', '==', token)))
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Registration
}

export async function checkInRegistration(eventId: string, id: string): Promise<void> {
  await updateDoc(doc(db, 'events', eventId, 'registrations', id), {
    checkedIn: true,
    checkInTime: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function subscribeToRegistrations(
  eventId: string, callback: (regs: Registration[]) => void
) {
  return onSnapshot(
    query(regCol(eventId), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration)))
  )
}

export async function bulkAddRegistrations(
  eventId: string, records: Omit<Registration, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<void> {
  const BATCH_SIZE = 499
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = writeBatch(db)
    const chunk = records.slice(i, i + BATCH_SIZE)
    chunk.forEach((r) => {
      const ref = doc(regCol(eventId))
      batch.set(ref, {
        ...r,
        checkedIn: false,
        badgePrinted: false,
        certificateIssued: false,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    })
    await batch.commit()
  }
}
