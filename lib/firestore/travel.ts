import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs,
  query, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { TravelRecord } from '@/lib/types'

function travelCol(eventId: string) {
  return collection(db, 'events', eventId, 'travel')
}

export async function addTravel(eventId: string, data: Omit<TravelRecord, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(travelCol(eventId), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateTravel(eventId: string, id: string, data: Partial<TravelRecord>): Promise<void> {
  await updateDoc(doc(db, 'events', eventId, 'travel', id), data)
}

export async function deleteTravel(eventId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', eventId, 'travel', id))
}

export async function getTravels(eventId: string): Promise<TravelRecord[]> {
  const snap = await getDocs(query(travelCol(eventId), orderBy('arrivalDateTime', 'asc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TravelRecord))
}

export function subscribeToTravels(eventId: string, callback: (records: TravelRecord[]) => void) {
  return onSnapshot(
    query(travelCol(eventId), orderBy('arrivalDateTime', 'asc')),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as TravelRecord)))
  )
}
