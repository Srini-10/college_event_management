'use client'
import { useState, useEffect, useRef } from 'react'
import { getRegistrationByToken, checkInRegistration } from '@/lib/firestore/registrations'
import { Registration } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { toast } from 'sonner'
import { QrCode, CheckCircle, XCircle, Search, UserCheck } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function CheckInPage() {
  const [eventId, setEventId] = useState('')
  const [scanning, setScanning] = useState(false)
  const [found, setFound] = useState<Registration | null>(null)
  const [manualToken, setManualToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)
  const scannerRef = useRef<any>(null)

  async function lookupToken(token: string) {
    if (!eventId || !token) return
    setLoading(true)
    setFound(null)
    setCheckedIn(false)
    try {
      const reg = await getRegistrationByToken(eventId, token.trim())
      if (reg) {
        setFound(reg)
        setCheckedIn(reg.checkedIn)
      } else {
        toast.error('Registration not found for this QR code')
      }
    } catch {
      toast.error('Lookup failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckIn() {
    if (!found || !eventId) return
    setLoading(true)
    try {
      await checkInRegistration(eventId, found.id)
      setCheckedIn(true)
      setFound({ ...found, checkedIn: true })
      toast.success(`${found.name} checked in successfully!`)
    } catch {
      toast.error('Check-in failed')
    } finally {
      setLoading(false)
    }
  }

  const CATEGORY_COLORS: Record<string, string> = {
    vip: 'bg-amber-500',
    guest: 'bg-purple-500',
    participant: 'bg-blue-500',
    media: 'bg-green-500',
    volunteer: 'bg-gray-500',
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-indigo-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <QrCode className="h-6 w-6" />
          <h1 className="text-xl font-bold">QR Check-in Portal</h1>
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full p-6 space-y-6">
        {/* Event ID Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Event ID</label>
          <Input
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="Paste event ID here"
            className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
          />
        </div>

        {/* Manual token input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">QR Token (manual)</label>
          <div className="flex gap-2">
            <Input
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Paste or type QR token"
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
              onKeyDown={(e) => e.key === 'Enter' && lookupToken(manualToken)}
            />
            <Button onClick={() => lookupToken(manualToken)} disabled={loading || !eventId}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Result card */}
        {found && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-full ${CATEGORY_COLORS[found.category] || 'bg-gray-600'} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                  {found.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{found.name}</h3>
                  <p className="text-gray-400 text-sm">{found.designation} · {found.organization}</p>
                  <p className="text-gray-400 text-sm">{found.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className={`${CATEGORY_COLORS[found.category]} text-white border-0 capitalize`}>
                      {found.category}
                    </Badge>
                    <StatusBadge status={found.checkedIn ? 'arrived' : 'pending'} />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {checkedIn ? (
                  <div className="flex items-center gap-2 text-green-400 bg-green-900/30 rounded-lg p-3">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Already checked in</span>
                  </div>
                ) : (
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleCheckIn} disabled={loading}>
                    <UserCheck className="h-4 w-4" />
                    Check In {found.name}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!found && (
          <div className="text-center py-12 text-gray-500 space-y-2">
            <QrCode className="h-12 w-12 mx-auto opacity-30" />
            <p>Enter the event ID and scan or paste a QR token to check in a registrant</p>
          </div>
        )}
      </div>
    </div>
  )
}
