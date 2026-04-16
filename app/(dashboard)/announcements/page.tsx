'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getAnnouncements, addAnnouncement, updateAnnouncement } from '@/lib/firestore/announcements'
import { Announcement } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { announcementSchema, AnnouncementInput } from '@/lib/validations'
import { toast } from 'sonner'
import { Megaphone, Plus, Send, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { formatDateTime, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'

const TEMPLATES = [
  { label: 'Welcome Guest', message: 'We warmly welcome you to the event! Our team is ready to assist you. Please reach out to your assigned coordinator for any assistance.' },
  { label: 'Pickup Dispatched', message: 'Your pickup vehicle has been dispatched and is on the way. Please be ready at the designated pickup point. Contact your driver if needed.' },
  { label: 'Schedule Change', message: 'Please note there has been a change in the schedule. The updated program will be shared shortly. We apologize for any inconvenience.' },
  { label: 'Session Reminder', message: 'Reminder: The next session begins in 15 minutes. Please make your way to the hall. Thank you for your participation.' },
]

export default function AnnouncementsPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const { user } = useAuthStore()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<AnnouncementInput>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { targetAudience: 'all', channel: 'push' },
  })

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    getAnnouncements(eventId).then((a) => { setAnnouncements(a); setLoading(false) })
  }, [eventId])

  async function onSubmit(data: AnnouncementInput) {
    if (!eventId || !user) return
    setSaving(true)
    try {
      const status = data.scheduledAt ? 'scheduled' : 'sent'
      const id = await addAnnouncement(eventId, {
        ...data, sentBy: user.uid, status, eventId,
        sentAt: status === 'sent' ? {} as any : undefined,
      } as any)
      setAnnouncements((prev) => [{
        id, ...data, sentBy: user.uid, status, eventId, createdAt: {} as any,
      }, ...prev])
      toast.success(status === 'sent' ? 'Announcement sent!' : 'Announcement scheduled')
      setDialogOpen(false)
      reset()
    } catch {
      toast.error('Failed to send')
    } finally {
      setSaving(false)
    }
  }

  async function handleEmergencyAlert() {
    if (!eventId || !user) return
    const id = await addAnnouncement(eventId, {
      title: '🚨 Emergency Alert',
      message: 'This is an emergency alert. Please follow instructions from event staff immediately.',
      targetAudience: 'all',
      channel: 'push',
      sentBy: user.uid,
      status: 'sent',
      eventId,
      sentAt: {} as any,
    } as any)
    setAnnouncements((prev) => [{
      id,
      title: '🚨 Emergency Alert',
      message: 'Emergency alert sent.',
      targetAudience: 'all',
      channel: 'push',
      sentBy: user.uid,
      status: 'sent',
      eventId,
      createdAt: {} as any,
    }, ...prev])
    toast.error('Emergency alert sent to all!')
  }

  const audienceColors: Record<string, string> = {
    all: 'bg-indigo-100 text-indigo-800',
    quadinators: 'bg-blue-100 text-blue-800',
    guests: 'bg-purple-100 text-purple-800',
    volunteers: 'bg-green-100 text-green-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Announcements</h2>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={handleEmergencyAlert}>
            <AlertTriangle className="h-4 w-4" /> Emergency Alert
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> New Announcement
          </Button>
        </div>
      </div>

      {!eventId ? (
        <EmptyState icon={Megaphone} title="No event selected" />
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements yet" description="Send messages to guests, volunteers, and coordinators"
          actionLabel="Create Announcement" onAction={() => setDialogOpen(true)} />
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <Card key={ann.id} className={cn(ann.title?.includes('Emergency') && 'border-red-300 bg-red-50/50')}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{ann.title}</h3>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize', audienceColors[ann.targetAudience])}>
                        {ann.targetAudience}
                      </span>
                      <Badge variant="secondary" className="text-xs capitalize">{ann.channel}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{ann.message}</p>
                  </div>
                  <StatusBadge status={ann.status} />
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  {ann.status === 'scheduled' && ann.scheduledAt ? (
                    <><Clock className="h-3 w-3" /> Scheduled for {ann.scheduledAt}</>
                  ) : (
                    <><Send className="h-3 w-3" /> Sent</>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Templates */}
            <div className="space-y-1.5">
              <Label>Quick Templates</Label>
              <div className="flex flex-wrap gap-1">
                {TEMPLATES.map((t) => (
                  <Button key={t.label} type="button" variant="outline" size="sm" className="text-xs h-7"
                    onClick={() => { setValue('title', t.label); setValue('message', t.message) }}>
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input {...register('title')} placeholder="Session Reminder" />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Message *</Label>
              <Textarea {...register('message')} rows={3} placeholder="Type your announcement..." />
              {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Target Audience</Label>
                <Controller name="targetAudience" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['all', 'quadinators', 'guests', 'volunteers'].map((a) => (
                        <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-1.5">
                <Label>Channel</Label>
                <Controller name="channel" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['push', 'email', 'whatsapp', 'sms'].map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Schedule For Later (optional)</Label>
              <Input type="datetime-local" {...register('scheduledAt')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Now
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
