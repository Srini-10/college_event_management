'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getGuests, addGuest, updateGuest } from '@/lib/firestore/guests'
import { Guest } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { guestSchema, GuestInput } from '@/lib/validations'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, MapPin, Plane, Hotel, Gift, CheckCircle, Loader2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'

export default function GuestsPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editGuest, setEditGuest] = useState<Guest | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<GuestInput>({
    resolver: zodResolver(guestSchema),
    defaultValues: { pickupRequired: false, stayRequired: false, status: 'confirmed' },
  })
  const pickupRequired = watch('pickupRequired')
  const stayRequired = watch('stayRequired')

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    getGuests(eventId).then((g) => { setGuests(g); setLoading(false) })
  }, [eventId])

  async function onSubmit(data: GuestInput) {
    if (!eventId) return toast.error('No event selected')
    setSaving(true)
    try {
      if (editGuest) {
        await updateGuest(eventId, editGuest.id, data)
        setGuests((prev) => prev.map((g) => g.id === editGuest.id ? { ...g, ...data } : g))
        toast.success('Guest updated')
      } else {
        const id = await addGuest(eventId, { ...data, eventId } as any)
        setGuests((prev) => [{ id, ...data, eventId, createdAt: {} as any }, ...prev])
        toast.success('Guest added')
      }
      setDialogOpen(false)
      reset()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function openEdit(g: Guest) {
    setEditGuest(g)
    setValue('name', g.name)
    setValue('designation', g.designation)
    setValue('organization', g.organization)
    setValue('contactNumber', g.contactNumber)
    setValue('email', g.email)
    setValue('status', g.status)
    setValue('pickupRequired', g.pickupRequired)
    setValue('stayRequired', g.stayRequired)
    if (g.arrivalMode) setValue('arrivalMode', g.arrivalMode)
    if (g.arrivalDateTime) setValue('arrivalDateTime', g.arrivalDateTime)
    if (g.departureDateTime) setValue('departureDateTime', g.departureDateTime)
    if (g.hotelName) setValue('hotelName', g.hotelName)
    if (g.roomNumber) setValue('roomNumber', g.roomNumber)
    if (g.checkIn) setValue('checkIn', g.checkIn)
    if (g.checkOut) setValue('checkOut', g.checkOut)
    if (g.dietaryPreference) setValue('dietaryPreference', g.dietaryPreference)
    if (g.specialRequirements) setValue('specialRequirements', g.specialRequirements)
    setDialogOpen(true)
  }

  async function markArrived(guest: Guest) {
    await updateGuest(eventId, guest.id, { status: 'arrived' })
    setGuests((prev) => prev.map((g) => g.id === guest.id ? { ...g, status: 'arrived' } : g))
    toast.success(`${guest.name} marked as arrived`)
  }

  const statusDot: Record<string, string> = {
    confirmed: 'bg-green-500', tentative: 'bg-amber-500',
    cancelled: 'bg-red-500', arrived: 'bg-blue-500', departed: 'bg-gray-400',
  }

  const columns: ColumnDef<Guest>[] = [
    {
      accessorKey: 'name',
      header: 'Guest',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full shrink-0', statusDot[row.original.status] || 'bg-gray-400')} />
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-gray-500">{row.original.designation}</div>
          </div>
        </div>
      ),
    },
    { accessorKey: 'organization', header: 'Organization' },
    {
      accessorKey: 'arrivalMode',
      header: 'Arrival',
      cell: ({ row }) => row.original.arrivalMode ? (
        <Badge variant="secondary" className="capitalize">{row.original.arrivalMode}</Badge>
      ) : '—',
    },
    {
      id: 'pickup',
      header: 'Pickup',
      cell: ({ row }) => row.original.pickupRequired
        ? <Badge variant="warning">Needed</Badge>
        : <span className="text-gray-400 text-xs">Not needed</span>,
    },
    {
      id: 'stay',
      header: 'Stay',
      cell: ({ row }) => row.original.stayRequired
        ? <span className="text-sm">{row.original.hotelName || 'TBD'}</span>
        : <span className="text-gray-400 text-xs">Not needed</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(row.original)}>Edit</Button>
          {row.original.status !== 'arrived' && row.original.status !== 'departed' && (
            <Button size="sm" variant="ghost" className="text-green-600" onClick={() => markArrived(row.original)}>
              <CheckCircle className="h-3.5 w-3.5" /> Arrived
            </Button>
          )}
        </div>
      ),
    },
  ]

  const stats = {
    total: guests.length,
    confirmed: guests.filter((g) => g.status === 'confirmed').length,
    arrived: guests.filter((g) => g.status === 'arrived').length,
    pendingPickup: guests.filter((g) => g.pickupRequired && g.status !== 'arrived').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Guest Management</h2>
          <div className="flex gap-3 text-xs text-gray-500 mt-1">
            <span>{stats.total} total</span>
            <span className="text-green-600">{stats.arrived} arrived</span>
            {stats.pendingPickup > 0 && (
              <span className="text-amber-600">{stats.pendingPickup} pickups pending</span>
            )}
          </div>
        </div>
        <Button onClick={() => { setEditGuest(null); reset(); setDialogOpen(true) }}>
          <Plus className="h-4 w-4" /> Add Guest
        </Button>
      </div>

      {!eventId ? (
        <EmptyState icon={Users} title="No event selected" description="Select an event first" />
      ) : (
        <DataTable
          data={guests}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search guests..."
          emptyState={
            <EmptyState icon={Users} title="No guests added" description="Add VIPs, speakers, and guests"
              actionLabel="Add Guest" onAction={() => setDialogOpen(true)} />
          }
        />
      )}

      {/* Guest Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editGuest ? 'Edit Guest' : 'Add Guest'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs defaultValue="profile">
              <TabsList className="mb-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="travel">Travel & Arrival</TabsTrigger>
                <TabsTrigger value="stay">Stay</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Full Name *</Label>
                    <Input {...register('name')} placeholder="Dr. John Doe" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Contact Number *</Label>
                    <Input {...register('contactNumber')} placeholder="9876543210" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Designation *</Label>
                    <Input {...register('designation')} placeholder="Professor / CEO" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Organization *</Label>
                    <Input {...register('organization')} placeholder="IIT Madras" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input type="email" {...register('email')} placeholder="guest@email.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Controller name="status" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['confirmed', 'tentative', 'cancelled', 'arrived', 'departed'].map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              </TabsContent>

              <TabsContent value="travel" className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Arrival Date & Time</Label>
                    <Input type="datetime-local" {...register('arrivalDateTime')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Departure Date & Time</Label>
                    <Input type="datetime-local" {...register('departureDateTime')} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Arrival Mode</Label>
                  <Controller name="arrivalMode" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                      <SelectContent>
                        {['flight', 'train', 'bus', 'cab', 'self'].map((m) => (
                          <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="flex items-center gap-3">
                  <Controller name="pickupRequired" control={control} render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )} />
                  <Label>Pickup Required</Label>
                </div>
                {pickupRequired && (
                  <div className="space-y-1.5">
                    <Label>Pickup Assigned To</Label>
                    <Input {...register('pickupAssignedTo' as any)} placeholder="Volunteer name / phone" />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stay" className="space-y-4">
                <div className="flex items-center gap-3">
                  <Controller name="stayRequired" control={control} render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )} />
                  <Label>Stay Required</Label>
                </div>
                {stayRequired && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Hotel Name</Label>
                        <Input {...register('hotelName')} placeholder="Taj Hotel" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Room Number</Label>
                        <Input {...register('roomNumber')} placeholder="101" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Check-in Date</Label>
                        <Input type="date" {...register('checkIn')} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Check-out Date</Label>
                        <Input type="date" {...register('checkOut')} />
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="other" className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Dietary Preference</Label>
                  <Controller name="dietaryPreference" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Select preference" /></SelectTrigger>
                      <SelectContent>
                        {['veg', 'non-veg', 'vegan', 'jain'].map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-1.5">
                  <Label>Special Requirements</Label>
                  <Textarea {...register('specialRequirements')} placeholder="Wheelchair access, specific food allergy, etc." />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editGuest ? 'Save Changes' : 'Add Guest'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
