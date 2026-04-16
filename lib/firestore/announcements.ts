import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs,
  query, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Announcement } from '@/lib/types'

function annCol(eventId: string) {
  return collection(db, 'events', eventId, 'announcements')
}

export async function addAnnouncement(eventId: string, data: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(annCol(eventId), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateAnnouncement(eventId: string, id: string, data: Partial<Announcement>): Promise<void> {
  await updateDoc(doc(db, 'events', eventId, 'announcements', id), data)
}

export async function getAnnouncements(eventId: string): Promise<Announcement[]> {
  const snap = await getDocs(query(annCol(eventId), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement))
}

export function subscribeToAnnouncements(eventId: string, callback: (items: Announcement[]) => void) {
  return onSnapshot(
    query(annCol(eventId), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement)))
  )
}
