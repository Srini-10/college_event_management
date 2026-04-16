'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getTravels, addTravel, updateTravel, deleteTravel } from '@/lib/firestore/travel'
import { TravelRecord } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { travelSchema, TravelInput } from '@/lib/validations'
import { toast } from 'sonner'
import { Plane, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'

export default function TravelPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const [records, setRecords] = useState<TravelRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<TravelRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TravelRecord | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<TravelInput>({
    resolver: zodResolver(travelSchema),
    defaultValues: {
      mode: 'flight', personType: 'guest', bookingStatus: 'pending',
      pickupRequired: false, dropRequired: false, reimbursable: false,
    },
  })
  const pickupRequired = watch('pickupRequired')
  const dropRequired = watch('dropRequired')

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    getTravels(eventId).then((t) => { setRecords(t); setLoading(false) })
  }, [eventId])

  async function onSubmit(data: TravelInput) {
    if (!eventId) return toast.error('No event selected')
    setSaving(true)
    try {
      if (editRecord) {
        await updateTravel(eventId, editRecord.id, data)
        setRecords((prev) => prev.map((r) => r.id === editRecord.id ? { ...r, ...data } : r))
        toast.success('Travel updated')
      } else {
        const id = await addTravel(eventId, { ...data, personId: '', eventId } as any)
        setRecords((prev) => [...prev, { id, ...data, personId: '', eventId, createdAt: {} as any }])
        toast.success('Travel record added')
      }
      setDialogOpen(false)
      reset()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function updatePickupStatus(id: string, status: string) {
    await updateTravel(eventId, id, { pickupStatus: status as any })
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, pickupStatus: status as any } : r))
    toast.success('Pickup status updated')
  }

  const modeIcons: Record<string, string> = {
    flight: '✈️', train: '🚂', bus: '🚌', cab: '🚕', self: '🚗',
  }

  const columns: ColumnDef<TravelRecord>[] = [
    {
      accessorKey: 'personName',
      header: 'Traveler',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.personName}</div>
          <Badge variant="secondary" className="text-xs capitalize mt-0.5">{row.original.personType}</Badge>
        </div>
      ),
    },
    {
      accessorKey: 'mode',
      header: 'Mode',
      cell: ({ row }) => <span>{modeIcons[row.original.mode]} {row.original.mode}</span>,
    },
    {
      id: 'route',
      header: 'Route',
      cell: ({ row }) => <span className="text-sm">{row.original.origin} → {row.original.destination}</span>,
    },
    {
      accessorKey: 'arrivalDateTime',
      header: 'Arrival',
      cell: ({ row }) => <span className="text-sm">{row.original.arrivalDateTime}</span>,
    },
    {
      accessorKey: 'bookingStatus',
      header: 'Booking',
      cell: ({ row }) => <StatusBadge status={row.original.bookingStatus} />,
    },
    {
      id: 'pickup',
      header: 'Pickup',
      cell: ({ row }) => row.original.pickupRequired ? (
        <Select value={row.original.pickupStatus || 'scheduled'} onValueChange={(v) => updatePickupStatus(row.original.id, v)}>
          <SelectTrigger className="h-7 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['scheduled', 'dispatched', 'picked_up', 'dropped_off'].map((s) => (
              <SelectItem key={s} value={s} className="text-xs">{s.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : <span className="text-gray-400 text-xs">Not needed</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => {
            setEditRecord(row.original)
            setValue('personName', row.original.personName)
            setValue('personType', row.original.personType)
            setValue('mode', row.original.mode)
            setValue('origin', row.original.origin)
            setValue('destination', row.original.destination)
            setValue('departureDateTime', row.original.departureDateTime)
            setValue('arrivalDateTime', row.original.arrivalDateTime)
            setValue('bookingStatus', row.original.bookingStatus)
            setValue('pickupRequired', row.original.pickupRequired)
            setValue('dropRequired', row.original.dropRequired)
            setValue('reimbursable', row.original.reimbursable)
            setDialogOpen(true)
          }}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteTarget(row.original)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Travel Management</h2>
        <Button onClick={() => { setEditRecord(null); reset(); setDialogOpen(true) }}>
          <Plus className="h-4 w-4" /> Add Travel
        </Button>
      </div>

      <DataTable
        data={records}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search by name or route..."
        emptyState={<EmptyState icon={Plane} title="No travel records" description="Log flights, trains, pickups for guests and speakers" actionLabel="Add Travel" onAction={() => setDialogOpen(true)} />}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editRecord ? 'Edit Travel' : 'Add Travel Record'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Person Name *</Label>
                <Input {...register('personName')} />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Controller name="personType" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['guest', 'speaker', 'vip', 'staff'].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Mode</Label>
                <Controller name="mode" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['flight', 'train', 'bus', 'cab', 'self'].map((m) => <SelectItem key={m} value={m} className="capitalize">{modeIcons[m]} {m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-1.5">
                <Label>Booking Status</Label>
                <Controller name="bookingStatus" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['pending', 'confirmed', 'cancelled'].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Origin *</Label>
                <Input {...register('origin')} placeholder="Chennai" />
              </div>
              <div className="space-y-1.5">
                <Label>Destination *</Label>
                <Input {...register('destination')} placeholder="Coimbatore" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Departure *</Label>
                <Input type="datetime-local" {...register('departureDateTime')} />
              </div>
              <div className="space-y-1.5">
                <Label>Arrival *</Label>
                <Input type="datetime-local" {...register('arrivalDateTime')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Booking Reference</Label>
              <Input {...register('bookingReference')} placeholder="PNR / Ticket number" />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Controller name="pickupRequired" control={control} render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )} />
                <Label>Pickup Required</Label>
              </div>
              <div className="flex items-center gap-2">
                <Controller name="dropRequired" control={control} render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )} />
                <Label>Drop Required</Label>
              </div>
              <div className="flex items-center gap-2">
                <Controller name="reimbursable" control={control} render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )} />
                <Label>Reimbursable</Label>
              </div>
            </div>
            {pickupRequired && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Pickup Vehicle</Label>
                  <Input {...register('pickupVehicle' as any)} placeholder="TN 01 AB 1234" />
                </div>
                <div className="space-y-1.5">
                  <Label>Pickup Contact</Label>
                  <Input {...register('pickupContact' as any)} placeholder="Driver phone" />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editRecord ? 'Save' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete travel record?</AlertDialogTitle>
            <AlertDialogDescription>Delete travel record for &quot;{deleteTarget?.personName}&quot;?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              await deleteTravel(eventId, deleteTarget!.id)
              setRecords((prev) => prev.filter((r) => r.id !== deleteTarget!.id))
              setDeleteTarget(null)
              toast.success('Deleted')
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
