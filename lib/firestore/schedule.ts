import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs,
  query, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ScheduleSlot } from '@/lib/types'

function schedCol(eventId: string) {
  return collection(db, 'events', eventId, 'schedule')
}

export async function addSlot(eventId: string, data: Omit<ScheduleSlot, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(schedCol(eventId), { ...data, status: 'upcoming', createdAt: serverTimestamp() })
  return ref.id
}

export async function updateSlot(eventId: string, id: string, data: Partial<ScheduleSlot>): Promise<void> {
  await updateDoc(doc(db, 'events', eventId, 'schedule', id), data)
}

export async function deleteSlot(eventId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', eventId, 'schedule', id))
}

export async function getSchedule(eventId: string): Promise<ScheduleSlot[]> {
  const snap = await getDocs(query(schedCol(eventId), orderBy('order', 'asc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduleSlot))
}

export function subscribeToSchedule(eventId: string, callback: (slots: ScheduleSlot[]) => void) {
  return onSnapshot(
    query(schedCol(eventId), orderBy('order', 'asc')),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduleSlot)))
  )
}
