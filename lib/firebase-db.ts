import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { LogbookEntry, Achievement } from './types'

// --- Logbook ---

export async function addLogbookEntry(entry: Omit<LogbookEntry, 'id' | 'timestamp'>) {
  try {
    const docRef = await addDoc(collection(db, 'logbook_entries'), {
      ...entry,
      timestamp: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding logbook entry:', error)
    return null
  }
}

export async function getLogbookEntries(): Promise<LogbookEntry[]> {
  try {
    const q = query(collection(db, 'logbook_entries'), orderBy('timestamp', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        flightId: data.flightId,
        category: data.category,
        content: data.content,
        mood: data.mood,
        timestamp: data.timestamp instanceof Timestamp
          ? data.timestamp.toDate().toISOString()
          : new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Error getting logbook entries:', error)
    return []
  }
}

export async function deleteLogbookEntry(id: string) {
  try {
    await deleteDoc(doc(db, 'logbook_entries', id))
    return true
  } catch (error) {
    console.error('Error deleting logbook entry:', error)
    return false
  }
}

// --- Achievements ---

export async function getAchievements(): Promise<Achievement[]> {
  try {
    const snapshot = await getDocs(collection(db, 'achievements'))
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Achievement[]
  } catch (error) {
    console.error('Error getting achievements:', error)
    return []
  }
}

export async function updateAchievement(id: string, data: Partial<Achievement>) {
  try {
    await updateDoc(doc(db, 'achievements', id), data)
    return true
  } catch (error) {
    console.error('Error updating achievement:', error)
    return false
  }
}

export async function saveAchievement(achievement: Achievement) {
  try {
    await addDoc(collection(db, 'achievements'), achievement)
    return true
  } catch (error) {
    console.error('Error saving achievement:', error)
    return false
  }
}
