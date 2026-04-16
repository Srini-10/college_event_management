import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs,
  query, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Checklist } from '@/lib/types'

function checklistCol(eventId: string) {
  return collection(db, 'events', eventId, 'checklist')
}

export async function addChecklist(eventId: string, data: Omit<Checklist, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(checklistCol(eventId), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateChecklist(eventId: string, id: string, data: Partial<Checklist>): Promise<void> {
  await updateDoc(doc(db, 'events', eventId, 'checklist', id), data)
}

export async function deleteChecklist(eventId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', eventId, 'checklist', id))
}

export async function getChecklists(eventId: string): Promise<Checklist[]> {
  const snap = await getDocs(query(checklistCol(eventId), orderBy('createdAt', 'asc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Checklist))
}

export function subscribeToChecklists(eventId: string, callback: (lists: Checklist[]) => void) {
  return onSnapshot(
    query(checklistCol(eventId), orderBy('createdAt', 'asc')),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Checklist)))
  )
}
