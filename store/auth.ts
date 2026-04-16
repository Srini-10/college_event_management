'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AppUser } from '@/lib/types'

interface AuthState {
  user: AppUser | null
  loading: boolean
  setUser: (user: AppUser | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'cem-auth',
      // Only persist the user profile, never the transient loading flag.
      partialize: (state) => ({ user: state.user }),
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        } as any)
      ),
    }
  )
)
