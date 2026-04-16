'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getSchedule, addSlot, updateSlot, deleteSlot } from '@/lib/firestore/schedule'
import { ScheduleSlot } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { scheduleSlotSchema, ScheduleSlotInput } from '@/lib/validations'
import { toast } from 'sonner'
import { Plus, GripVertical, Pencil, Trash2, Loader2, Radio } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'
import { Calendar } from 'lucide-react'

const CATEGORY_COLORS: Record<string, string> = {
  inauguration: 'bg-purple-100 text-purple-800 border-purple-200',
  keynote: 'bg-blue-100 text-blue-800 border-blue-200',
  session: 'bg-sky-100 text-sky-800 border-sky-200',
  cultural: 'bg-pink-100 text-pink-800 border-pink-200',
  award: 'bg-amber-100 text-amber-800 border-amber-200',
  break: 'bg-gray-100 text-gray-600 border-gray-200',
  networking: 'bg-teal-100 text-teal-800 border-teal-200',
  valedictory: 'bg-orange-100 text-orange-800 border-orange-200',
}

function SortableSlot({ slot, onEdit, onDelete, onStatusChange }: {
  slot: ScheduleSlot
  onEdit: (s: ScheduleSlot) => void
  onDelete: (s: ScheduleSlot) => void
  onStatusChange: (id: string, status: ScheduleSlot['status']) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slot.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-xl border p-4',
        CATEGORY_COLORS[slot.category] || 'bg-white border-gray-200',
        slot.status === 'live' && 'ring-2 ring-green-500'
      )}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-current/50">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">{slot.title}</span>
          {slot.status === 'live' && (
            <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
              <Radio className="h-3 w-3" /> LIVE
            </span>
          )}
          <Badge variant="outline" className="text-xs capitalize">{slot.category}</Badge>
        </div>
        <div className="text-xs mt-0.5 opacity-75">
          {slot.startTime} – {slot.endTime}
          {slot.speakerName && ` · ${slot.speakerName}`}
          {slot.venue && ` · ${slot.venue}`}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Select value={slot.status} onValueChange={(v) => onStatusChange(slot.id, v as any)}>
          <SelectTrigger className="h-7 w-28 text-xs bg-white/70 border-current/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['upcoming', 'live', 'completed', 'delayed', 'cancelled'].map((s) => (
              <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(slot)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => onDelete(slot)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export default function SchedulePage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const [slots, setSlots] = useState<ScheduleSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editSlot, setEditSlot] = useState<ScheduleSlot | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ScheduleSlot | null>(null)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<ScheduleSlotInput>({
    resolver: zodResolver(scheduleSlotSchema),
    defaultValues: { category: 'session' },
  })

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    getSchedule(eventId).then((s) => { setSlots(s); setLoading(false) })
  }, [eventId])

  async function onSubmit(data: ScheduleSlotInput) {
    if (!eventId) return toast.error('No event selected')
    setSaving(true)
    try {
      if (editSlot) {
        await updateSlot(eventId, editSlot.id, data)
        setSlots((prev) => prev.map((s) => s.id === editSlot.id ? { ...s, ...data } : s))
        toast.success('Slot updated')
      } else {
        const order = slots.length
        const id = await addSlot(eventId, { ...data, order, status: 'upcoming', eventId } as any)
        setSlots((prev) => [...prev, { id, ...data, order, status: 'upcoming', eventId, createdAt: {} as any }])
        toast.success('Slot added')
      }
      setDialogOpen(false)
      reset()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function openEdit(s: ScheduleSlot) {
    setEditSlot(s)
    setValue('title', s.title)
    setValue('description', s.description || '')
    setValue('startTime', s.startTime)
    setValue('endTime', s.endTime)
    setValue('category', s.category)
    setValue('speakerName', s.speakerName || '')
    setValue('speakerDesignation', s.speakerDesignation || '')
    setValue('venue', s.venue || '')
    setValue('mcName', s.mcName || '')
    setValue('notes', s.notes || '')
    setDialogOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteSlot(eventId, deleteTarget.id)
    setSlots((prev) => prev.filter((s) => s.id !== deleteTarget.id))
    toast.success('Slot deleted')
    setDeleteTarget(null)
  }

  async function handleStatusChange(id: string, status: ScheduleSlot['status']) {
    await updateSlot(eventId, id, { status })
    setSlots((prev) => prev.map((s) => s.id === id ? { ...s, status } : s))
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = slots.findIndex((s) => s.id === active.id)
    const newIndex = slots.findIndex((s) => s.id === over.id)
    const reordered = arrayMove(slots, oldIndex, newIndex)
    setSlots(reordered)
    await Promise.all(reordered.map((s, i) => updateSlot(eventId, s.id, { order: i })))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Schedule Builder</h2>
          <p className="text-sm text-gray-500 mt-0.5">{slots.length} slots · Drag to reorder</p>
        </div>
        <Button onClick={() => { setEditSlot(null); reset(); setDialogOpen(true) }}>
          <Plus className="h-4 w-4" /> Add Slot
        </Button>
      </div>

      {!eventId ? (
        <EmptyState icon={Calendar} title="No event selected" />
      ) : loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <EmptyState icon={Calendar} title="No schedule slots" description="Build the day's agenda"
          actionLabel="Add First Slot" onAction={() => setDialogOpen(true)} />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slots.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {slots.map((slot) => (
                <SortableSlot
                  key={slot.id}
                  slot={slot}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editSlot ? 'Edit Slot' : 'Add Schedule Slot'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input {...register('title')} placeholder="Inauguration Ceremony" />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Time *</Label>
                <Input type="time" {...register('startTime')} />
              </div>
              <div className="space-y-1.5">
                <Label>End Time *</Label>
                <Input type="time" {...register('endTime')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Controller name="category" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['inauguration', 'keynote', 'session', 'cultural', 'award', 'break', 'networking', 'valedictory'].map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Speaker Name</Label>
                <Input {...register('speakerName')} placeholder="Dr. Name" />
              </div>
              <div className="space-y-1.5">
                <Label>Venue / Hall</Label>
                <Input {...register('venue')} placeholder="Main Auditorium" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Speaker Designation</Label>
                <Input {...register('speakerDesignation')} />
              </div>
              <div className="space-y-1.5">
                <Label>MC Name</Label>
                <Input {...register('mcName')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Emcee Notes (private)</Label>
              <Textarea {...register('notes')} rows={2} placeholder="Script notes, cues..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editSlot ? 'Save' : 'Add Slot'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete slot?</AlertDialogTitle>
            <AlertDialogDescription>Delete &quot;{deleteTarget?.title}&quot;? This cannot be undone.</AlertDialogDescription>
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
