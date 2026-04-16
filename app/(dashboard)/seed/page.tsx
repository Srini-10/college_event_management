'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { seed, SeedLog } from '@/scripts/seed'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react'

export default function SeedPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [eventId, setEventId] = useState<string | null>(null)
  const [logs, setLogs] = useState<SeedLog[]>([])
  const [error, setError] = useState<string | null>(null)

  async function runSeed() {
    setRunning(true)
    setLogs([])
    setError(null)
    setDone(false)
    try {
      const result = await seed(user?.uid)
      setLogs(result.logs)
      setEventId(result.eventId)
      setDone(true)
    } catch (err: any) {
      setError(err?.message ?? 'Seeding failed. Check the console for details.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Seed Demo Data</h2>
        <p className="text-sm text-gray-500 mt-1">
          Populates Firestore with a complete demo event — registrations, guests, schedule,
          budget, vendors, travel, announcements, certificates, feedback, and notifications.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4 text-[#1e3a8a]" />
            TECHNOVA 2026 – National Level Technical Symposium
          </CardTitle>
          <CardDescription>
            KSR College of Engineering, Tiruchengode, Namakkal · Apr 14–17 2026 (active) · 45 registrations · 10 guests · 22 schedule slots · 25 budget items · 10 vendors · 12 travel records · 4 checklists · 20 certificates · 12 feedback · 20 media files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!done && (
            <Button onClick={runSeed} disabled={running} className="w-full">
              {running ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Seeding data…</>
              ) : (
                <><Database className="h-4 w-4" /> Run Seed</>
              )}
            </Button>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {logs.length > 0 && (
            <div className="rounded-lg border bg-gray-50 divide-y text-sm font-mono">
              {logs.map((l, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2">
                  {l.ok
                    ? <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    : <XCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                  <span className={l.ok ? 'text-gray-700' : 'text-amber-700'}>{l.msg}</span>
                </div>
              ))}
            </div>
          )}

          {done && eventId && (
            <div className="space-y-3">
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                <strong>Seed complete!</strong> Event ID: <code className="font-mono">{eventId}</code>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => router.push('/events')}
                >
                  Go to Events <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/${eventId}`)}
                >
                  Open Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400">
        Run this only once — each click creates a new event with fresh data.
        For a clean re-seed, delete existing demo documents in the Firebase Console first.
      </p>
    </div>
  )
}
