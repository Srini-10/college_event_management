import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs,
  query, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Vendor } from '@/lib/types'

function vendorCol(eventId: string) {
  return collection(db, 'events', eventId, 'vendors')
}

export async function addVendor(eventId: string, data: Omit<Vendor, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(vendorCol(eventId), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateVendor(eventId: string, id: string, data: Partial<Vendor>): Promise<void> {
  await updateDoc(doc(db, 'events', eventId, 'vendors', id), data)
}

export async function deleteVendor(eventId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', eventId, 'vendors', id))
}

export async function getVendors(eventId: string): Promise<Vendor[]> {
  const snap = await getDocs(query(vendorCol(eventId), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vendor))
}

export function subscribeToVendors(eventId: string, callback: (vendors: Vendor[]) => void) {
  return onSnapshot(
    query(vendorCol(eventId), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vendor)))
  )
}
