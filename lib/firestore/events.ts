import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Event } from '@/lib/types'

const eventsCol = collection(db, 'events')

export async function createEvent(data: Omit<Event, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(eventsCol, {
    ...data,
    status: data.status || 'draft',
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateEvent(id: string, data: Partial<Event>): Promise<void> {
  await updateDoc(doc(db, 'events', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', id))
}

export async function getEvent(id: string): Promise<Event | null> {
  const snap = await getDoc(doc(db, 'events', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Event
}

export async function getEvents(): Promise<Event[]> {
  const snap = await getDocs(query(eventsCol, orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Event))
}

export function subscribeToEvents(callback: (events: Event[]) => void) {
  return onSnapshot(query(eventsCol, orderBy('createdAt', 'desc')), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Event)))
  })
}

export function subscribeToEvent(id: string, callback: (event: Event | null) => void) {
  return onSnapshot(doc(db, 'events', id), (snap) => {
    callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as Event) : null)
  })
}
