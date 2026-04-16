import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs,
  query, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { BudgetItem } from '@/lib/types'

function budgetCol(eventId: string) {
  return collection(db, 'events', eventId, 'budget')
}

export async function addBudgetItem(eventId: string, data: Omit<BudgetItem, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(budgetCol(eventId), { ...data, approvalStatus: 'pending', createdAt: serverTimestamp() })
  return ref.id
}

export async function updateBudgetItem(eventId: string, id: string, data: Partial<BudgetItem>): Promise<void> {
  await updateDoc(doc(db, 'events', eventId, 'budget', id), data)
}

export async function deleteBudgetItem(eventId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', eventId, 'budget', id))
}

export async function getBudget(eventId: string): Promise<BudgetItem[]> {
  const snap = await getDocs(query(budgetCol(eventId), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BudgetItem))
}

export function subscribeToBudget(eventId: string, callback: (items: BudgetItem[]) => void) {
  return onSnapshot(
    query(budgetCol(eventId), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as BudgetItem)))
  )
}
