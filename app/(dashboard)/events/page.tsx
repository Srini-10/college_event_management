'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventSchema, EventInput } from '@/lib/validations'
import { createEvent, getEvents, updateEvent, deleteEvent } from '@/lib/firestore/events'
import { Event } from '@/lib/types'
import { Timestamp } from 'firebase/firestore'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import { Plus, Calendar, MapPin, Building2, MoreHorizontal, Loader2, Pencil, Trash2, ExternalLink } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

export default function EventsPage() {
  const { user } = useAuthStore()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editEvent, setEditEvent] = useState<Event | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
  })

  useEffect(() => {
    getEvents().then((e) => { setEvents(e); setLoading(false) })
  }, [])

  function openNew() {
    setEditEvent(null)
    reset()
    setDialogOpen(true)
  }

  function openEdit(ev: Event) {
    setEditEvent(ev)
    setValue('title', ev.title)
    setValue('description', ev.description || '')
    setValue('date', ev.date)
    setValue('venue', ev.venue)
    setValue('collegeName', ev.collegeName)
    setDialogOpen(true)
  }

  async function onSubmit(data: EventInput) {
    if (!user) return
    setSaving(true)
    try {
      if (editEvent) {
        await updateEvent(editEvent.id, data)
        setEvents((prev) => prev.map((e) => e.id === editEvent.id ? { ...e, ...data } : e))
        toast.success('Event updated')
      } else {
        const id = await createEvent({ ...data, description: data.description ?? '', status: 'draft', createdBy: user.uid })
        setEvents((prev) => [{ id, ...data, description: data.description ?? '', status: 'draft', createdBy: user.uid, createdAt: Timestamp.now() }, ...prev])
        toast.success('Event created')
      }
      setDialogOpen(false)
      reset()
    } catch {
      toast.error('Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteEvent(deleteTarget.id)
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id))
      toast.success('Event deleted')
    } catch {
      toast.error('Failed to delete event')
    } finally {
      setDeleteTarget(null)
    }
  }

  const statusColors = {
    draft:     'border-[#dae3ff] bg-white',
    active:    'border-orange-200 bg-orange-50/30',
    completed: 'border-emerald-200 bg-emerald-50/20',
    archived:  'border-gray-200 bg-gray-50/50',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0c1a6e]">Events</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage all your college events</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> New Event
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent></Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No events yet"
          description="Create your first event to get started"
          actionLabel="Create Event"
          onAction={openNew}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => (
            <Card key={ev.id} className={`relative overflow-hidden border ${statusColors[ev.status] || ''}`}>
              {ev.themeColor && (
                <div className="h-1.5 w-full" style={{ backgroundColor: ev.themeColor }} />
              )}
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link href={`/dashboard/${ev.id}`} className="font-semibold text-[#0c1a6e] hover:text-orange-500 line-clamp-1 transition-colors">
                      {ev.title}
                    </Link>
                    {ev.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ev.description}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/${ev.id}`}><ExternalLink className="h-4 w-4" /> Open Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(ev)}>
                        <Pencil className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => setDeleteTarget(ev)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {ev.date ? formatDate(ev.date) : 'TBD'}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{ev.venue}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="truncate">{ev.collegeName}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <StatusBadge status={ev.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editEvent ? 'Edit Event' : 'New Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Event Title *</Label>
              <Input placeholder="National Symposium on Engineering Innovation" {...register('title')} />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Brief description of the event..." rows={2} {...register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Event Date *</Label>
                <Input type="date" {...register('date')} />
                {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Theme Color</Label>
                <Input type="color" {...register('themeColor')} defaultValue="#4F46E5" className="h-9 p-1" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Venue *</Label>
              <Input placeholder="Auditorium, Main Campus" {...register('venue')} />
              {errors.venue && <p className="text-xs text-red-500">{errors.venue.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>College / Organization *</Label>
              <Input placeholder="ABC Engineering College" {...register('collegeName')} />
              {errors.collegeName && <p className="text-xs text-red-500">{errors.collegeName.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editEvent ? 'Save Changes' : 'Create Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.title}&quot; and all its data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
