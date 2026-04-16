'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { StageRequirement } from '@/lib/types'
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
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Mic2, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { formatCurrency } from '@/lib/utils'

const STAGE_CATEGORIES = ['audio', 'visual', 'lighting', 'furniture', 'decor', 'technical', 'safety']
const STAGE_STATUSES = ['pending', 'ordered', 'delivered', 'setup', 'checked']
const CAT_COLORS: Record<string, string> = {
  audio: 'bg-blue-100 text-blue-800',
  visual: 'bg-purple-100 text-purple-800',
  lighting: 'bg-amber-100 text-amber-800',
  furniture: 'bg-green-100 text-green-800',
  decor: 'bg-pink-100 text-pink-800',
  technical: 'bg-cyan-100 text-cyan-800',
  safety: 'bg-red-100 text-red-800',
}

export default function StagePage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const [requirements, setRequirements] = useState<StageRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editReq, setEditReq] = useState<StageRequirement | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StageRequirement | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    category: 'audio' as StageRequirement['category'],
    itemName: '', quantity: 1, unit: 'nos', description: '',
    status: 'pending' as StageRequirement['status'],
    assignedVendor: '', estimatedCost: '', actualCost: '',
    requiredBy: '', deliveryNotes: '',
  })

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    getDocs(query(collection(db, 'events', eventId, 'stageRequirements'), orderBy('category', 'asc')))
      .then((snap) => {
        setRequirements(snap.docs.map((d) => ({ id: d.id, ...d.data() } as StageRequirement)))
        setLoading(false)
      })
  }, [eventId])

  async function handleSave() {
    if (!eventId || !form.itemName) return
    setSaving(true)
    const data = {
      ...form,
      quantity: Number(form.quantity),
      estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : undefined,
      actualCost: form.actualCost ? Number(form.actualCost) : undefined,
      eventId,
    }
    try {
      if (editReq) {
        await updateDoc(doc(db, 'events', eventId, 'stageRequirements', editReq.id), data)
        setRequirements((prev) => prev.map((r) => r.id === editReq.id ? { ...r, ...data } : r))
        toast.success('Requirement updated')
      } else {
        const ref = await addDoc(collection(db, 'events', eventId, 'stageRequirements'), { ...data, createdAt: serverTimestamp() })
        setRequirements((prev) => [...prev, { id: ref.id, ...data, createdAt: {} as any }])
        toast.success('Requirement added')
      }
      setDialogOpen(false)
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function openEdit(r: StageRequirement) {
    setEditReq(r)
    setForm({
      category: r.category, itemName: r.itemName, quantity: r.quantity,
      unit: r.unit, description: r.description || '',
      status: r.status, assignedVendor: r.assignedVendor || '',
      estimatedCost: r.estimatedCost?.toString() || '',
      actualCost: r.actualCost?.toString() || '',
      requiredBy: r.requiredBy || '', deliveryNotes: r.deliveryNotes || '',
    })
    setDialogOpen(true)
  }

  async function updateStatus(id: string, status: StageRequirement['status']) {
    await updateDoc(doc(db, 'events', eventId, 'stageRequirements', id), { status })
    setRequirements((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
  }

  const columns: ColumnDef<StageRequirement>[] = [
    {
      accessorKey: 'itemName',
      header: 'Item',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.itemName}</div>
          <span className={`text-xs px-1.5 py-0.5 rounded ${CAT_COLORS[row.original.category] || ''}`}>
            {row.original.category}
          </span>
        </div>
      ),
    },
    { accessorKey: 'quantity', header: 'Qty', cell: ({ row }) => `${row.original.quantity} ${row.original.unit}` },
    { accessorKey: 'assignedVendor', header: 'Vendor', cell: ({ row }) => row.original.assignedVendor || '—' },
    { accessorKey: 'estimatedCost', header: 'Est. Cost', cell: ({ row }) => row.original.estimatedCost ? formatCurrency(row.original.estimatedCost) : '—' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Select value={row.original.status} onValueChange={(v) => updateStatus(row.original.id, v as any)}>
          <SelectTrigger className="h-7 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STAGE_STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      ),
    },
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

  const grouped = STAGE_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = requirements.filter((r) => r.category === cat)
    return acc
  }, {} as Record<string, StageRequirement[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Stage & Logistics</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {requirements.length} items · {requirements.filter((r) => r.status === 'checked').length} checked
          </p>
        </div>
        <Button onClick={() => { setEditReq(null); setDialogOpen(true) }}>
          <Plus className="h-4 w-4" /> Add Requirement
        </Button>
      </div>

      <DataTable
        data={requirements}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search requirements..."
        emptyState={<EmptyState icon={Mic2} title="No stage requirements" description="Track audio, visual, lighting, furniture, and technical items" actionLabel="Add Requirement" onAction={() => setDialogOpen(true)} />}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editReq ? 'Edit Requirement' : 'Add Stage Requirement'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STAGE_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STAGE_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Item Name *</Label>
              <Input value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} placeholder="Wireless Microphone" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Quantity</Label>
                <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Unit</Label>
                <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="nos / sets" />
              </div>
              <div className="space-y-1.5">
                <Label>Required By</Label>
                <Input type="datetime-local" value={form.requiredBy} onChange={(e) => setForm({ ...form, requiredBy: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Estimated Cost</Label>
                <Input type="number" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} placeholder="5000" />
              </div>
              <div className="space-y-1.5">
                <Label>Vendor</Label>
                <Input value={form.assignedVendor} onChange={(e) => setForm({ ...form, assignedVendor: e.target.value })} placeholder="Vendor name" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description / Specs</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.itemName}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editReq ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete requirement?</AlertDialogTitle>
            <AlertDialogDescription>Delete &quot;{deleteTarget?.itemName}&quot;?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              await deleteDoc(doc(db, 'events', eventId, 'stageRequirements', deleteTarget!.id))
              setRequirements((prev) => prev.filter((r) => r.id !== deleteTarget!.id))
              setDeleteTarget(null)
              toast.success('Deleted')
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
