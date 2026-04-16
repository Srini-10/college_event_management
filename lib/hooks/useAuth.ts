'use client'
import { useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useAuthStore } from '@/store/auth'
import { AppUser } from '@/lib/types'

// ─── Debug logger ─────────────────────────────────────────────────────────────
// Prefix every log with a timestamp and category so it's easy to trace the
// exact sequence of events in the browser DevTools console.
function log(category: string, msg: string, data?: unknown) {
  const ts = new Date().toISOString().slice(11, 23) // HH:MM:SS.mmm
  if (data !== undefined) {
    console.log(`[${ts}] [${category}] ${msg}`, data)
  } else {
    console.log(`[${ts}] [${category}] ${msg}`)
  }
}
function logError(category: string, msg: string, err: unknown) {
  console.error(`[${new Date().toISOString().slice(11, 23)}] [${category}] ${msg}`, err)
}

// ─── Module-level flags ───────────────────────────────────────────────────────

// Set to true only when the user explicitly calls logout().
// Used to distinguish a real sign-out from Firebase firing null due to
// connectivity issues (CONFIGURATION_NOT_FOUND, network error, etc.)
let _explicitLogout = false

// Read the persisted user directly from localStorage.
// We cannot rely on useAuthStore.getState().user here because Zustand's
// persist middleware hydrates asynchronously — onAuthStateChanged may fire
// before the store is populated from localStorage, making getState() return
// null even though a valid cached session exists.
function hasCachedUser(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const raw = localStorage.getItem('cem-auth')
    const has = !!JSON.parse(raw ?? 'null')?.state?.user
    log('CACHE', `hasCachedUser → ${has}`)
    return has
  } catch (e) {
    logError('CACHE', 'Failed to read cem-auth from localStorage', e)
    return false
  }
}

// ─── Auth state listener ──────────────────────────────────────────────────────

export function useAuthListener() {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    log('AUTH-LISTENER', 'Subscribing to onAuthStateChanged')

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      log('AUTH-STATE', `onAuthStateChanged fired — user: ${firebaseUser ? firebaseUser.uid : 'null'}`)

      try {
        if (firebaseUser) {
          _explicitLogout = false
          log('AUTH-STATE', `Authenticated as ${firebaseUser.email} (uid: ${firebaseUser.uid})`)

          log('FIRESTORE', `Reading users/${firebaseUser.uid}`)
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          log('FIRESTORE', `getDoc result — exists: ${userDoc.exists()}`)

          if (userDoc.exists()) {
            const appUser = { uid: firebaseUser.uid, ...userDoc.data() } as AppUser
            log('STORE', 'setUser (from Firestore)', { uid: appUser.uid, email: appUser.email, role: appUser.role })
            setUser(appUser)
          } else {
            log('FIRESTORE', `No document for uid ${firebaseUser.uid} — creating new user record`)
            const newUser: Omit<AppUser, 'uid'> = {
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || 'User',
              photoURL: firebaseUser.photoURL || undefined,
              role: 'viewer',
              createdAt: serverTimestamp() as any,
            }
            log('FIRESTORE', `Writing users/${firebaseUser.uid}`, newUser)
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser)
            log('FIRESTORE', 'setDoc succeeded')
            const appUser = { uid: firebaseUser.uid, ...newUser }
            log('STORE', 'setUser (new user)', { uid: appUser.uid, email: appUser.email })
            setUser(appUser)
          }

        } else {
          // Firebase returned null.
          log('AUTH-STATE', 'Firebase returned null user')
          log('AUTH-STATE', `_explicitLogout=${_explicitLogout}, hasCachedUser=${hasCachedUser()}`)

          if (_explicitLogout || !hasCachedUser()) {
            log('STORE', 'setUser(null) — explicit logout or no cache')
            _explicitLogout = false
            setUser(null)
          } else {
            log('STORE', 'Keeping cached user — Firebase offline or transient null (connectivity issue)')
          }
        }

      } catch (err) {
        logError('AUTH-LISTENER', 'Error inside onAuthStateChanged handler', err)

        // Firestore failed but auth is valid — fall back to Firebase Auth profile.
        if (firebaseUser) {
          log('STORE', 'setUser (fallback to auth profile — Firestore unavailable)', { uid: firebaseUser.uid })
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL ?? undefined,
            role: 'viewer',
            createdAt: {} as any,
          })
        } else if (_explicitLogout || !hasCachedUser()) {
          log('STORE', 'setUser(null) — in catch, no cached user')
          _explicitLogout = false
          setUser(null)
        }

      } finally {
        log('STORE', 'setLoading(false)')
        setLoading(false)
      }
    })

    return () => {
      log('AUTH-LISTENER', 'Unsubscribing from onAuthStateChanged')
      unsubscribe()
    }
  }, [setUser, setLoading])
}

// ─── Login / register / logout ────────────────────────────────────────────────

export async function loginWithEmail(email: string, password: string) {
  log('LOGIN', `loginWithEmail called for ${email}`)
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    log('LOGIN', `signInWithEmailAndPassword succeeded — uid: ${cred.user.uid}`)
    return cred
  } catch (err) {
    logError('LOGIN', 'signInWithEmailAndPassword failed', err)
    throw err
  }
}

export async function registerWithEmail(email: string, password: string, displayName: string) {
  log('REGISTER', `registerWithEmail called for ${email}`)
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    log('REGISTER', `createUserWithEmailAndPassword succeeded — uid: ${cred.user.uid}`)
    await updateProfile(cred.user, { displayName })
    log('FIRESTORE', `Writing users/${cred.user.uid} (new registration)`)
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      displayName,
      role: 'viewer',
      createdAt: serverTimestamp(),
    })
    log('FIRESTORE', 'setDoc succeeded (registration)')
    return cred
  } catch (err) {
    logError('REGISTER', 'Registration failed', err)
    throw err
  }
}

// loginWithGoogle now uses redirect (not popup) to avoid COOP issues.
// Google's sign-in page sets COOP: same-origin, which breaks the popup's
// browsing context group and prevents window.close() from working.
// signInWithRedirect navigates the current tab to Google and back, bypassing
// all cross-origin popup restrictions.
export async function loginWithGoogle() {
  log('LOGIN', 'loginWithGoogle — initiating signInWithRedirect')
  const provider = new GoogleAuthProvider()
  return signInWithRedirect(auth, provider)
}

// Call this once on the login page to pick up a completed Google redirect.
// Returns the user credential if a redirect just completed, or null otherwise.
export async function checkGoogleRedirect() {
  log('LOGIN', 'checkGoogleRedirect — calling getRedirectResult')
  try {
    const result = await getRedirectResult(auth)
    if (result) {
      log('LOGIN', `getRedirectResult — Google sign-in completed, uid: ${result.user.uid}`)
    } else {
      log('LOGIN', 'getRedirectResult — no pending redirect (normal page load)')
    }
    return result
  } catch (err) {
    logError('LOGIN', 'getRedirectResult failed', err)
    throw err
  }
}

export async function resetPassword(email: string) {
  log('RESET', `sendPasswordResetEmail called for ${email}`)
  try {
    await sendPasswordResetEmail(auth, email)
    log('RESET', 'Password reset email sent')
  } catch (err) {
    logError('RESET', 'sendPasswordResetEmail failed', err)
    throw err
  }
}

export async function logout() {
  log('LOGOUT', 'logout called — setting _explicitLogout=true and clearing store')
  _explicitLogout = true
  useAuthStore.getState().setUser(null)
  return signOut(auth)
}
