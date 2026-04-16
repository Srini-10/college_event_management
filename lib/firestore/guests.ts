import {
  collection, doc, addDoc, updateDoc, getDocs, getDoc,
  query, orderBy, where, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Guest } from '@/lib/types'

function guestCol(eventId: string) {
  return collection(db, 'events', eventId, 'guests')
}

export async function addGuest(eventId: string, data: Omit<Guest, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(guestCol(eventId), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateGuest(eventId: string, id: string, data: Partial<Guest>): Promise<void> {
  await updateDoc(doc(db, 'events', eventId, 'guests', id), { ...data, updatedAt: serverTimestamp() })
}

export async function getGuests(eventId: string): Promise<Guest[]> {
  const snap = await getDocs(query(guestCol(eventId), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Guest))
}

export async function getGuest(eventId: string, id: string): Promise<Guest | null> {
  const snap = await getDoc(doc(db, 'events', eventId, 'guests', id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Guest) : null
}

export function subscribeToGuests(eventId: string, callback: (guests: Guest[]) => void) {
  return onSnapshot(
    query(guestCol(eventId), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Guest)))
  )
}

export async function markGuestArrived(eventId: string, id: string, markedBy: string): Promise<void> {
  await updateDoc(doc(db, 'events', eventId, 'guests', id), {
    status: 'arrived',
    actualArrivalTime: serverTimestamp(),
    arrivedMarkedBy: markedBy,
    updatedAt: serverTimestamp(),
  })
}
