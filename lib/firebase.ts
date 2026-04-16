import { initializeApp, getApps } from 'firebase/app'
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth'
import {
  initializeFirestore, getFirestore,
  persistentLocalCache, persistentMultipleTabManager,
} from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)

// Enable IndexedDB offline cache so data is available even when the
// connection is intermittent. initializeFirestore can only be called once per
// app instance — on HMR reloads the app already exists, so fall back to
// getFirestore which returns the already-initialized instance.
function buildDb() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })
  } catch {
    return getFirestore(app)
  }
}
export const db = buildDb()

export const storage = getStorage(app)

// Persist the auth session in IndexedDB/localStorage across reloads.
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(console.error)
}

export default app
