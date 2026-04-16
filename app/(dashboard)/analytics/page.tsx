'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Registration, Guest, BudgetItem, ScheduleSlot, Feedback } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatCurrency } from '@/lib/utils'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, LineChart, Line,
} from 'recharts'
import { BarChart2, Users, UserCheck, DollarSign, Star } from 'lucide-react'

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6', '#6366F1', '#14B8A6']

export default function AnalyticsPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const [regs, setRegs] = useState<Registration[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [budget, setBudget] = useState<BudgetItem[]>([])
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    Promise.all([
      getDocs(collection(db, 'events', eventId, 'registrations')),
      getDocs(collection(db, 'events', eventId, 'guests')),
      getDocs(collection(db, 'events', eventId, 'budget')),
      getDocs(collection(db, 'events', eventId, 'schedule')),
      getDocs(collection(db, 'events', eventId, 'feedback')),
    ]).then(([r, g, b, s, f]) => {
      setRegs(r.docs.map((d) => ({ id: d.id, ...d.data() } as Registration)))
      setGuests(g.docs.map((d) => ({ id: d.id, ...d.data() } as Guest)))
      setBudget(b.docs.map((d) => ({ id: d.id, ...d.data() } as BudgetItem)))
      setSchedule(s.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduleSlot)))
      setFeedback(f.docs.map((d) => ({ id: d.id, ...d.data() } as Feedback)))
      setLoading(false)
    })
  }, [eventId])

  const checkedIn = regs.filter((r) => r.checkedIn).length
  const checkInRate = regs.length > 0 ? Math.round((checkedIn / regs.length) * 100) : 0
  const totalBudget = budget.reduce((s, b) => s + (b.estimatedAmount || 0), 0)
  const totalActual = budget.reduce((s, b) => s + (b.actualAmount || 0), 0)
  const avgRating = feedback.length > 0
    ? (feedback.reduce((s, f) => s + (f.overallRating || 0), 0) / feedback.length).toFixed(1)
    : '—'

  const categoryData = ['participant', 'guest', 'vip', 'media', 'volunteer'].map((cat) => ({
    name: cat, value: regs.filter((r) => r.category === cat).length,
  })).filter((c) => c.value > 0)

  const budgetData = ['venue', 'catering', 'decoration', 'gifts', 'travel', 'av', 'printing', 'misc'].map((cat) => {
    const items = budget.filter((b) => b.category === cat)
    return {
      name: cat,
      estimated: items.reduce((s, b) => s + (b.estimatedAmount || 0), 0),
      actual: items.reduce((s, b) => s + (b.actualAmount || 0), 0),
    }
  }).filter((c) => c.estimated > 0)

  const metrics = [
    { label: 'Total Registered', value: regs.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Check-in Rate', value: `${checkInRate}%`, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Budget Used', value: formatCurrency(totalActual), icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Avg Rating', value: avgRating, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  if (!eventId) return <EmptyState icon={BarChart2} title="No event selected" />

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analytics Dashboard</h2>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <Card key={m.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${m.bg}`}>
                    <m.icon className={`h-5 w-5 ${m.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{m.value}</p>
                    <p className="text-xs text-gray-500">{m.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category distribution */}
            {categoryData.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Registration by Category</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name ?? ''} ${(((percent as number) ?? 0) * 100).toFixed(0)}%`}>
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Budget breakdown */}
            {budgetData.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Budget: Estimated vs Actual</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={budgetData}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                      <Legend />
                      <Bar dataKey="estimated" name="Estimated" fill="#E0E7FF" />
                      <Bar dataKey="actual" name="Actual" fill="#4F46E5" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Feedback scores */}
          {feedback.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Feedback Overview ({feedback.length} responses)</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  {[
                    { label: 'Overall', key: 'overallRating' },
                    { label: 'Organization', key: 'organizationRating' },
                    { label: 'Hospitality', key: 'hospitalityRating' },
                    { label: 'Content', key: 'contentRating' },
                  ].map(({ label, key }) => {
                    const avg = feedback.length > 0
                      ? (feedback.reduce((s, f) => s + ((f as any)[key] || 0), 0) / feedback.length).toFixed(1)
                      : '—'
                    return (
                      <div key={label} className="p-3 bg-amber-50 rounded-lg">
                        <p className="text-2xl font-bold text-amber-600">{avg}</p>
                        <p className="text-xs text-gray-500 mt-1">{label}</p>
                        <div className="flex justify-center mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < Math.round(Number(avg)) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white rounded-xl border p-4">
              <p className="text-gray-500">Guests Arrived</p>
              <p className="text-2xl font-bold text-green-600">{guests.filter((g) => g.status === 'arrived').length}</p>
              <p className="text-xs text-gray-400">of {guests.length} total</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-gray-500">Schedule Slots</p>
              <p className="text-2xl font-bold text-blue-600">{schedule.length}</p>
              <p className="text-xs text-gray-400">{schedule.filter((s) => s.status === 'completed').length} completed</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-gray-500">Budget Variance</p>
              <p className={`text-2xl font-bold ${totalActual > totalBudget ? 'text-red-600' : 'text-green-600'}`}>
                {totalBudget > 0 ? `${Math.round(((totalActual - totalBudget) / totalBudget) * 100)}%` : '—'}
              </p>
              <p className="text-xs text-gray-400">vs estimated</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-gray-500">Pending Pickups</p>
              <p className="text-2xl font-bold text-amber-600">{guests.filter((g) => g.pickupRequired && g.status !== 'arrived').length}</p>
              <p className="text-xs text-gray-400">guests awaiting pickup</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
