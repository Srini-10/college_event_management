'use client'
import { create } from 'zustand'
import { Event } from '@/lib/types'

interface EventState {
  currentEvent: Event | null
  events: Event[]
  setCurrentEvent: (event: Event | null) => void
  setEvents: (events: Event[]) => void
}

export const useEventStore = create<EventState>((set) => ({
  currentEvent: null,
  events: [],
  setCurrentEvent: (currentEvent) => set({ currentEvent }),
  setEvents: (events) => set({ events }),
}))
