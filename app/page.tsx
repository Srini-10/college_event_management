'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

function hasCachedUser(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const raw = localStorage.getItem('cem-auth')
    return !!JSON.parse(raw ?? 'null')?.state?.user
  } catch {
    return false
  }
}

export default function RootPage() {
  const router = useRouter()
  const { user, loading } = useAuthStore()

  useEffect(() => {
    if (loading) return
    if (user || hasCachedUser()) {
      router.replace('/events')
    } else {
      router.replace('/login')
    }
  }, [user, loading, router])

  return null
}
