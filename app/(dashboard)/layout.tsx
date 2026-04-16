'use client'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { useParams, useSearchParams } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const searchParams = useSearchParams()
  // Route param takes priority (dashboard/[eventId]), then fall back to ?eventId= query param
  const eventId = (params?.eventId as string | undefined) || searchParams.get('eventId') || undefined

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7ff]">
      <Sidebar eventId={eventId} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
