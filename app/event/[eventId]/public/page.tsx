import { getEvent } from '@/lib/firestore/events'
import { getSchedule } from '@/lib/firestore/schedule'
import { formatDate, formatTime, cn } from '@/lib/utils'
import { Calendar, MapPin, Clock, Building2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const SLOT_COLORS: Record<string, string> = {
  inauguration: 'bg-purple-100 text-purple-800',
  keynote: 'bg-blue-100 text-blue-800',
  session: 'bg-sky-100 text-sky-800',
  cultural: 'bg-pink-100 text-pink-800',
  award: 'bg-amber-100 text-amber-800',
  break: 'bg-gray-100 text-gray-700',
  networking: 'bg-teal-100 text-teal-800',
  valedictory: 'bg-orange-100 text-orange-800',
}

export default async function PublicEventPage({ params }: { params: { eventId: string } }) {
  const [event, schedule] = await Promise.all([
    getEvent(params.eventId),
    getSchedule(params.eventId),
  ])

  if (!event) notFound()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-indigo-700 text-white py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-indigo-300 text-sm mb-3">
            <Building2 className="h-4 w-4" />
            {event.collegeName}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
          {event.description && <p className="mt-3 text-indigo-200 text-lg">{event.description}</p>}
          <div className="flex flex-wrap gap-4 mt-6 text-indigo-100">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {event.date ? formatDate(event.date) : 'TBD'}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.venue}
            </div>
          </div>
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link href={`/feedback/${params.eventId}/submit`}
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
              Submit Feedback
            </Link>
          </div>
        </div>
      </div>

      {/* Schedule */}
      {schedule.length > 0 && (
        <div className="py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Programme Schedule</h2>
            <div className="space-y-3">
              {schedule.map((slot) => (
                <div key={slot.id} className={cn('rounded-xl p-4 flex items-start gap-4', SLOT_COLORS[slot.category] || 'bg-gray-50')}>
                  <div className="w-20 shrink-0">
                    <p className="font-semibold text-sm">{formatTime(slot.startTime)}</p>
                    <p className="text-xs opacity-70">{formatTime(slot.endTime)}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{slot.title}</p>
                    {slot.description && <p className="text-sm opacity-80 mt-0.5">{slot.description}</p>}
                    {slot.speakerName && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">{slot.speakerName}</span>
                        {slot.speakerDesignation && <span className="opacity-70">, {slot.speakerDesignation}</span>}
                      </p>
                    )}
                    {slot.venue && <p className="text-xs opacity-60 mt-1">{slot.venue}</p>}
                  </div>
                  <span className="text-xs capitalize opacity-70 shrink-0">{slot.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-50 py-6 px-6 text-center text-sm text-gray-500">
        <p>Powered by EventPro — College Event Management</p>
      </footer>
    </div>
  )
}
