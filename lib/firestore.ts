import {
  collection, doc, getDoc, getDocs, setDoc, addDoc,
  updateDoc, deleteDoc, query, QueryConstraint, serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { DocumentData } from 'firebase/firestore'

export async function getDocument<T>(colecao: string, id: string): Promise<T | null> {
  const ref = doc(db, colecao, id)
  const snap = await getDoc(ref)
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null
}

export async function getCollection<T>(
  colecao: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const ref = collection(db, colecao)
  const q = query(ref, ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as T))
}

export async function setDocument(colecao: string, id: string, data: DocumentData): Promise<void> {
  const ref = doc(db, colecao, id)
  await setDoc(ref, { ...data, atualizado_em: serverTimestamp() })
}

export async function addDocument(colecao: string, data: DocumentData): Promise<string> {
  const ref = collection(db, colecao)
  const docRef = await addDoc(ref, { ...data, criado_em: serverTimestamp() })
  return docRef.id
}

export async function updateDocument(colecao: string, id: string, data: Partial<DocumentData>): Promise<void> {
  const ref = doc(db, colecao, id)
  await updateDoc(ref, { ...data, atualizado_em: serverTimestamp() })
}

export async function deleteDocument(colecao: string, id: string): Promise<void> {
  const ref = doc(db, colecao, id)
  await deleteDoc(ref)
}
