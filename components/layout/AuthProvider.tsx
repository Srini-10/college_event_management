'use client'
import { useAuthListener } from '@/lib/hooks/useAuth'
import { useAuthStore } from '@/store/auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Building2 } from 'lucide-react'

const PUBLIC_PATHS = ['/login', '/register', '/checkin', '/event/', '/feedback']
const AUTH_ONLY_PATHS = ['/login', '/register']

function log(msg: string, data?: unknown) {
  const ts = new Date().toISOString().slice(11, 23)
  if (data !== undefined) {
    console.log(`[${ts}] [PROVIDER] ${msg}`, data)
  } else {
    console.log(`[${ts}] [PROVIDER] ${msg}`)
  }
}

function hasCachedUser(): boolean {
  try {
    const raw = localStorage.getItem('cem-auth')
    return !!JSON.parse(raw ?? 'null')?.state?.user
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthListener()

  const { user, loading, setLoading } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [timedOut, setTimedOut] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const isPublicRef = useRef(isPublic)
  isPublicRef.current = isPublic

  const routerRef = useRef(router)
  routerRef.current = router

  useEffect(() => {
    if (!loading) return
    const t = setTimeout(() => {
      log('⚠️ 5-second timeout — Firebase Auth did not respond')
      setTimedOut(true)
      setLoading(false)
    }, 5000)
    return () => clearTimeout(t)
  }, [loading, setLoading])

  log(`render — pathname="${pathname}" user=${user ? user.email : 'null'} loading=${loading} hydrated=${hydrated}`)

  useEffect(() => {
    const cached = hasCachedUser()
    if (!hydrated || loading) return
    if (!user && !cached && !isPublicRef.current) {
      routerRef.current.replace('/login')
    }
  }, [loading, user, hydrated])

  useEffect(() => {
    if (!hydrated || loading) return
    const onAuthPage = AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p))
    const hasUser = !!user || hasCachedUser()
    if (hasUser && onAuthPage) {
      routerRef.current.replace('/events')
    }
  }, [pathname, hydrated, loading, user])

  if (!user && (!hydrated || loading)) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: 'linear-gradient(145deg,#060f3a 0%,#0c1a6e 50%,#0f2167 100%)' }}
      >
        <div className="flex flex-col items-center gap-5 animate-fade-in">
          {/* Logo */}
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-900/40 animate-pulse-orange"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
          >
            <Building2 className="h-8 w-8 text-white" />
          </div>

          {/* Brand */}
          <div className="text-center">
            <p className="text-white font-extrabold text-lg tracking-tight">KSR Events</p>
            <p className="text-blue-200/50 text-xs mt-0.5">Loading your workspace…</p>
          </div>

          {/* Dot loader */}
          <div className="dot-loader flex items-center gap-2">
            <span />
            <span />
            <span />
          </div>

          {timedOut && (
            <div className="mt-2 rounded-xl bg-red-900/30 border border-red-500/30 p-4 text-sm text-red-300 text-center max-w-xs">
              Firebase Auth is not responding. Make sure <strong>Authentication</strong> is
              enabled in the Firebase Console for project{' '}
              <code className="font-mono text-red-200">college-event-management-9ddf5</code> and
              that Email/Password and Google sign-in methods are turned on.
            </div>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
