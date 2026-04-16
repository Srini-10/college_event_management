'use client'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { getRegistrations, addRegistration, updateRegistration, bulkAddRegistrations } from '@/lib/firestore/registrations'
import { Registration } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationSchema, RegistrationInput } from '@/lib/validations'
import { toast } from 'sonner'
import { generateId, formatDateTime } from '@/lib/utils'
import { Plus, Upload, Download, UserCheck, Users, Loader2, QrCode } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export default function RegistrationsPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editReg, setEditReg] = useState<Registration | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { category: 'participant', registrationType: 'pre-registered', paymentStatus: 'free' },
  })

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    getRegistrations(eventId).then((r) => { setRegistrations(r); setLoading(false) })
  }, [eventId])

  async function onSubmit(data: RegistrationInput) {
    if (!eventId) return toast.error('No event selected')
    setSaving(true)
    try {
      const qrToken = generateId()
      if (editReg) {
        await updateRegistration(eventId, editReg.id, data)
        setRegistrations((prev) => prev.map((r) => r.id === editReg.id ? { ...r, ...data } : r))
        toast.success('Registration updated')
      } else {
        const id = await addRegistration(eventId, { ...data, qrToken, eventId } as any)
        setRegistrations((prev) => [{ id, ...data, qrToken, eventId, checkedIn: false, badgePrinted: false, certificateIssued: false, createdAt: {} as any, updatedAt: {} as any }, ...prev])
        toast.success('Registration added')
      }
      setDialogOpen(false)
      reset()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function openEdit(reg: Registration) {
    setEditReg(reg)
    setValue('name', reg.name)
    setValue('email', reg.email)
    setValue('phone', reg.phone)
    setValue('designation', reg.designation)
    setValue('organization', reg.organization)
    setValue('category', reg.category)
    setValue('registrationType', reg.registrationType)
    setValue('paymentStatus', reg.paymentStatus)
    setDialogOpen(true)
  }

  function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !eventId) return
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const records = (results.data as any[]).map((row) => ({
          name: row.name || row.Name || '',
          email: row.email || row.Email || '',
          phone: row.phone || row.Phone || '',
          designation: row.designation || row.Designation || '',
          organization: row.organization || row.Organization || '',
          category: row.category || 'participant',
          registrationType: row.registrationType || 'pre-registered',
          paymentStatus: row.paymentStatus || 'free',
          qrToken: generateId(),
          eventId,
        })).filter((r) => r.name && r.email)

        try {
          await bulkAddRegistrations(eventId, records as any)
          const fresh = await getRegistrations(eventId)
          setRegistrations(fresh)
          toast.success(`Imported ${records.length} registrations`)
        } catch {
          toast.error('Import failed')
        }
      },
    })
    e.target.value = ''
  }

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(
      registrations.map((r) => ({
        Name: r.name, Email: r.email, Phone: r.phone,
        Designation: r.designation, Organization: r.organization,
        Category: r.category, CheckedIn: r.checkedIn ? 'Yes' : 'No',
        QRToken: r.qrToken,
      }))
    )
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Registrations')
    XLSX.writeFile(wb, 'registrations.xlsx')
  }

  const columns: ColumnDef<Registration>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'organization', header: 'Organization' },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <Badge variant="secondary" className="capitalize">{row.original.category}</Badge>,
    },
    {
      accessorKey: 'checkedIn',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.checkedIn ? 'arrived' : row.original.status || 'active'} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(row.original)}>Edit</Button>
          {!row.original.checkedIn && (
            <Button size="sm" variant="ghost" className="text-green-600" onClick={async () => {
              await updateRegistration(eventId, row.original.id, { checkedIn: true, checkInTime: {} as any })
              setRegistrations((prev) => prev.map((r) => r.id === row.original.id ? { ...r, checkedIn: true } : r))
              toast.success('Checked in!')
            }}>
              <UserCheck className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const checkedInCount = registrations.filter((r) => r.checkedIn).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Registrations</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {registrations.length} total · {checkedInCount} checked in
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/checkin" target="_blank">
              <QrCode className="h-4 w-4" /> QR Check-in
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
          <Button variant="outline" size="sm" onClick={exportExcel}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" onClick={() => { setEditReg(null); reset(); setDialogOpen(true) }}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {!eventId ? (
        <EmptyState icon={Users} title="No event selected" description="Select an event from the events page first" />
      ) : (
        <DataTable
          data={registrations}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search by name or email..."
          emptyState={
            <EmptyState icon={Users} title="No registrations" description="Add manually or import via CSV"
              actionLabel="Add Registration" onAction={() => setDialogOpen(true)} />
          }
          toolbar={
            <div className="flex gap-2 text-xs text-gray-500">
              <span className="bg-green-100 text-green-800 rounded px-2 py-1">{checkedInCount} checked in</span>
              <span className="bg-gray-100 text-gray-700 rounded px-2 py-1">{registrations.length - checkedInCount} pending</span>
            </div>
          }
        />
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editReg ? 'Edit Registration' : 'New Registration'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input placeholder="John Doe" {...register('name')} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Phone *</Label>
                <Input placeholder="9876543210" {...register('phone')} />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" placeholder="john@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Designation *</Label>
                <Input placeholder="Prof / Dr / Student" {...register('designation')} />
              </div>
              <div className="space-y-1.5">
                <Label>Organization *</Label>
                <Input placeholder="College / Company" {...register('organization')} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Controller name="category" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['participant', 'guest', 'vip', 'media', 'volunteer'].map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Controller name="registrationType" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['walk-in', 'pre-registered', 'invited'].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-1.5">
                <Label>Payment</Label>
                <Controller name="paymentStatus" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['free', 'paid', 'pending'].map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editReg ? 'Save Changes' : 'Register'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
