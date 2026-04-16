'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getVendors, addVendor, updateVendor, deleteVendor } from '@/lib/firestore/vendors'
import { Vendor } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { vendorSchema, VendorInput } from '@/lib/validations'
import { toast } from 'sonner'
import { Truck, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const VENDOR_CATEGORIES = ['catering', 'decoration', 'av', 'transport', 'printing', 'photography', 'security']
const VENDOR_STATUSES = ['enquired', 'confirmed', 'contracted', 'active', 'completed', 'cancelled']

export default function VendorsPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editVendor, setEditVendor] = useState<Vendor | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null)
  const [saving, setSaving] = useState(false)
  const [deliverableInput, setDeliverableInput] = useState('')
  const [deliverables, setDeliverables] = useState<string[]>([])

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<VendorInput>({
    resolver: zodResolver(vendorSchema),
    defaultValues: { category: 'catering', status: 'enquired', deliverables: [] },
  })

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    getVendors(eventId).then((v) => { setVendors(v); setLoading(false) })
  }, [eventId])

  async function onSubmit(data: VendorInput) {
    if (!eventId) return toast.error('No event selected')
    setSaving(true)
    const payload = { ...data, deliverables }
    try {
      if (editVendor) {
        await updateVendor(eventId, editVendor.id, payload)
        setVendors((prev) => prev.map((v) => v.id === editVendor.id ? { ...v, ...payload } : v))
        toast.success('Vendor updated')
      } else {
        const id = await addVendor(eventId, { ...payload, eventId } as any)
        setVendors((prev) => [{ id, ...payload, eventId, createdAt: {} as any }, ...prev])
        toast.success('Vendor added')
      }
      setDialogOpen(false)
      reset()
      setDeliverables([])
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function openEdit(v: Vendor) {
    setEditVendor(v)
    setValue('name', v.name)
    setValue('category', v.category)
    setValue('contactPerson', v.contactPerson)
    setValue('phone', v.phone)
    setValue('email', v.email || '')
    setValue('status', v.status)
    if (v.totalAmount !== undefined) setValue('totalAmount', v.totalAmount)
    if (v.advancePaid !== undefined) setValue('advancePaid', v.advancePaid)
    setDeliverables(v.deliverables || [])
    setDialogOpen(true)
  }

  const columns: ColumnDef<Vendor>[] = [
    {
      accessorKey: 'name',
      header: 'Vendor',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-gray-500">{row.original.contactPerson} · {row.original.phone}</div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <Badge variant="secondary" className="capitalize">{row.original.category}</Badge>,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => row.original.totalAmount ? formatCurrency(row.original.totalAmount) : '—',
    },
    {
      id: 'balance',
      header: 'Balance',
      cell: ({ row }) => {
        const bal = (row.original.totalAmount || 0) - (row.original.advancePaid || 0)
        return bal > 0 ? <span className="text-amber-600 font-medium">{formatCurrency(bal)}</span> : '—'
      },
    },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(row.original)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteTarget(row.original)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Vendors</h2>
        <Button onClick={() => { setEditVendor(null); reset(); setDeliverables([]); setDialogOpen(true) }}>
          <Plus className="h-4 w-4" /> Add Vendor
        </Button>
      </div>

      <DataTable
        data={vendors}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search vendors..."
        emptyState={<EmptyState icon={Truck} title="No vendors" description="Track catering, decoration, AV and other vendors" actionLabel="Add Vendor" onAction={() => setDialogOpen(true)} />}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editVendor ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Vendor Name *</Label>
                <Input {...register('name')} placeholder="ABC Caterers" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Controller name="category" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {VENDOR_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Contact Person *</Label>
                <Input {...register('contactPerson')} placeholder="Mr. Ramesh" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone *</Label>
                <Input {...register('phone')} placeholder="9876543210" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" {...register('email')} placeholder="vendor@email.com" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Total Amount</Label>
                <Input type="number" {...register('totalAmount', { valueAsNumber: true })} placeholder="100000" />
              </div>
              <div className="space-y-1.5">
                <Label>Advance Paid</Label>
                <Input type="number" {...register('advancePaid', { valueAsNumber: true })} placeholder="25000" />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Controller name="status" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {VENDOR_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Deliverables</Label>
              <div className="flex gap-2">
                <Input value={deliverableInput} onChange={(e) => setDeliverableInput(e.target.value)} placeholder="e.g. 200 veg meals" onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (deliverableInput.trim()) {
                      setDeliverables((d) => [...d, deliverableInput.trim()])
                      setDeliverableInput('')
                    }
                  }
                }} />
                <Button type="button" variant="outline" onClick={() => {
                  if (deliverableInput.trim()) {
                    setDeliverables((d) => [...d, deliverableInput.trim()])
                    setDeliverableInput('')
                  }
                }}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {deliverables.map((d, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => setDeliverables((prev) => prev.filter((_, j) => j !== i))}>
                    {d} ×
                  </Badge>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editVendor ? 'Save' : 'Add Vendor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete vendor?</AlertDialogTitle>
            <AlertDialogDescription>Delete &quot;{deleteTarget?.name}&quot;?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              await deleteVendor(eventId, deleteTarget!.id)
              setVendors((prev) => prev.filter((v) => v.id !== deleteTarget!.id))
              setDeleteTarget(null)
              toast.success('Vendor deleted')
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
