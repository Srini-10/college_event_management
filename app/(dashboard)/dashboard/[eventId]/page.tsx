'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getEvent } from '@/lib/firestore/events'
import { Event, Registration, Guest, ScheduleSlot, BudgetItem } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatTime, formatDate } from '@/lib/utils'
import {
  Users, UserCheck, MapPin, DollarSign, Calendar, AlertTriangle,
  Mic2, Plus, Bell, Clock, TrendingUp, CheckSquare,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const SLOT_COLORS: Record<string, string> = {
  inauguration: 'bg-purple-100 text-purple-800 border-purple-200',
  keynote: 'bg-blue-100 text-blue-800 border-blue-200',
  session: 'bg-sky-100 text-sky-800 border-sky-200',
  cultural: 'bg-pink-100 text-pink-800 border-pink-200',
  award: 'bg-amber-100 text-amber-800 border-amber-200',
  break: 'bg-gray-100 text-gray-700 border-gray-200',
  networking: 'bg-teal-100 text-teal-800 border-teal-200',
  valedictory: 'bg-orange-100 text-orange-800 border-orange-200',
}

export default function DashboardPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([])
  const [budget, setBudget] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) return

    getEvent(eventId).then((e) => { setEvent(e); setLoading(false) })

    const unsubRegs = onSnapshot(
      collection(db, 'events', eventId, 'registrations'),
      (snap) => setRegistrations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration)))
    )
    const unsubGuests = onSnapshot(
      collection(db, 'events', eventId, 'guests'),
      (snap) => setGuests(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Guest)))
    )
    const unsubSched = onSnapshot(
      query(collection(db, 'events', eventId, 'schedule'), orderBy('order', 'asc')),
      (snap) => setSchedule(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduleSlot)))
    )
    const unsubBudget = onSnapshot(
      collection(db, 'events', eventId, 'budget'),
      (snap) => setBudget(snap.docs.map((d) => ({ id: d.id, ...d.data() } as BudgetItem)))
    )

    return () => { unsubRegs(); unsubGuests(); unsubSched(); unsubBudget() }
  }, [eventId])

  const checkedIn = registrations.filter((r) => r.checkedIn).length
  const arrivedGuests = guests.filter((g) => g.status === 'arrived').length
  const pendingPickups = guests.filter((g) => g.pickupRequired && g.status !== 'arrived').length
  const totalEstimated = budget.reduce((s, b) => s + (b.estimatedAmount || 0), 0)
  const totalActual = budget.reduce((s, b) => s + (b.actualAmount || 0), 0)
  const budgetUsedPct = totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0
  const liveSlot = schedule.find((s) => s.status === 'live')
  const pendingApprovals = budget.filter((b) => b.approvalStatus === 'pending').length

  const metrics = [
    { label: 'Total Registered', value: registrations.length, icon: Users,      color: 'text-[#1e3a8a]', bg: 'bg-[#eef3ff]' },
    { label: 'Checked In',       value: checkedIn,            icon: UserCheck,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Guests Arrived',   value: arrivedGuests,        icon: MapPin,      color: 'text-purple-600',  bg: 'bg-purple-50'  },
    { label: 'Pending Pickups',  value: pendingPickups,       icon: Clock,       color: 'text-amber-600',   bg: 'bg-amber-50'   },
    { label: 'Budget Used',      value: `${budgetUsedPct}%`,  icon: DollarSign,  color: 'text-orange-600',  bg: 'bg-orange-50'  },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-40" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0c1a6e]">{event?.title}</h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {event?.date ? formatDate(event.date) : 'TBD'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {event?.venue}
            </span>
            {event && <StatusBadge status={event.status} />}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/guests?eventId=${eventId}`}>
              <Plus className="h-4 w-4" /> Add Guest
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/announcements?eventId=${eventId}`}>
              <Bell className="h-4 w-4" /> Announce
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/budget?eventId=${eventId}`}>
              <DollarSign className="h-4 w-4" /> Add Expense
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('rounded-lg p-2', m.bg)}>
                <m.icon className={cn('h-5 w-5', m.color)} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{m.value}</p>
                <p className="text-xs text-gray-500">{m.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live slot banner */}
      {liveSlot && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
          <div className="flex-1">
            <p className="font-semibold text-green-800">Currently Live: {liveSlot.title}</p>
            <p className="text-sm text-green-700">
              {formatTime(liveSlot.startTime)} – {formatTime(liveSlot.endTime)}
              {liveSlot.speakerName && ` · ${liveSlot.speakerName}`}
            </p>
          </div>
          <StatusBadge status="live" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Today&apos;s Schedule</CardTitle>
              <Button size="sm" variant="ghost" asChild>
                <Link href={`/schedule?eventId=${eventId}`}>View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {schedule.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No schedule added yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {schedule.slice(0, 8).map((slot) => (
                  <div
                    key={slot.id}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border px-3 py-2',
                      SLOT_COLORS[slot.category] || 'bg-gray-50 border-gray-200',
                      slot.status === 'live' && 'ring-2 ring-green-500'
                    )}
                  >
                    <div className="text-xs font-medium w-16 shrink-0">
                      {formatTime(slot.startTime)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{slot.title}</p>
                      {slot.speakerName && (
                        <p className="text-xs opacity-75 truncate">{slot.speakerName}</p>
                      )}
                    </div>
                    {slot.status === 'live' && (
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingPickups > 0 && (
              <AlertItem color="amber" icon={Clock}
                message={`${pendingPickups} guest(s) awaiting pickup`}
                link={`/travel?eventId=${eventId}`}
              />
            )}
            {pendingApprovals > 0 && (
              <AlertItem color="indigo" icon={DollarSign}
                message={`${pendingApprovals} budget item(s) pending approval`}
                link={`/budget?eventId=${eventId}`}
              />
            )}
            {guests.filter((g) => g.giftHandover && !g.giftHandover.shawl).length > 0 && (
              <AlertItem color="pink" icon={CheckSquare}
                message={`${guests.filter((g) => g.giftHandover && !g.giftHandover.shawl).length} gift handover(s) pending`}
                link={`/guests?eventId=${eventId}`}
              />
            )}
            {pendingPickups === 0 && pendingApprovals === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">All clear! No active alerts.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Budget Overview</CardTitle>
            <Button size="sm" variant="ghost" asChild>
              <Link href={`/budget?eventId=${eventId}`}>View details</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Estimated</p>
              <p className="font-semibold text-lg">{formatCurrency(totalEstimated)}</p>
            </div>
            <div>
              <p className="text-gray-500">Actual Spent</p>
              <p className="font-semibold text-lg">{formatCurrency(totalActual)}</p>
            </div>
            <div>
              <p className="text-gray-500">Utilization</p>
              <p className={cn('font-semibold text-lg', budgetUsedPct > 100 ? 'text-red-600' : 'text-green-600')}>
                {budgetUsedPct}%
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', budgetUsedPct > 100 ? 'bg-red-500' : 'bg-[#1e3a8a]')}
              style={{ width: `${Math.min(budgetUsedPct, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AlertItem({ color, icon: Icon, message, link }: {
  color: string; icon: any; message: string; link: string
}) {
  const colors: Record<string, string> = {
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    indigo: 'bg-[#eef3ff] border-[#dae3ff] text-[#1e3a8a]',
    pink:  'bg-pink-50 border-pink-200 text-pink-800',
  }
  return (
    <Link href={link} className={cn('flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:opacity-80', colors[color])}>
      <Icon className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </Link>
  )
}
