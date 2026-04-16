'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Quadinator } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { MapPin, Plus, Pencil, Trash2, Loader2, Users } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { generateId } from '@/lib/utils'

export default function CoordinatorsPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const [coordinators, setCoordinators] = useState<Quadinator[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editCoord, setEditCoord] = useState<Quadinator | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Quadinator | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', phone: '', assignedQuad: '',
    shiftStart: '', shiftEnd: '', reportingTo: '',
    responsibilities: '', teamMembersRaw: '',
  })

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    const col = collection(db, 'events', eventId, 'quadinators')
    getDocs(query(col, orderBy('createdAt', 'desc'))).then((snap) => {
      setCoordinators(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quadinator)))
      setLoading(false)
    })
  }, [eventId])

  async function handleSave() {
    if (!eventId) return
    setSaving(true)
    try {
      const data = {
        ...form,
        responsibilities: form.responsibilities.split('\n').filter(Boolean),
        teamMembers: form.teamMembersRaw.split('\n').filter(Boolean).map((line) => {
          const [name, phone, role] = line.split(',').map((s) => s.trim())
          return { name: name || '', phone: phone || '', role: role || '' }
        }),
        eventId,
      }
      if (editCoord) {
        await updateDoc(doc(db, 'events', eventId, 'quadinators', editCoord.id), data)
        setCoordinators((prev) => prev.map((c) => c.id === editCoord.id ? { ...c, ...data } : c))
        toast.success('Coordinator updated')
      } else {
        const ref = await addDoc(collection(db, 'events', eventId, 'quadinators'), { ...data, createdAt: serverTimestamp() })
        setCoordinators((prev) => [{ id: ref.id, ...data, createdAt: {} as any }, ...prev])
        toast.success('Coordinator added')
      }
      setDialogOpen(false)
      setForm({ name: '', email: '', phone: '', assignedQuad: '', shiftStart: '', shiftEnd: '', reportingTo: '', responsibilities: '', teamMembersRaw: '' })
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function openEdit(c: Quadinator) {
    setEditCoord(c)
    setForm({
      name: c.name, email: c.email, phone: c.phone,
      assignedQuad: c.assignedQuad, shiftStart: c.shiftStart, shiftEnd: c.shiftEnd,
      reportingTo: c.reportingTo,
      responsibilities: c.responsibilities.join('\n'),
      teamMembersRaw: c.teamMembers.map((m) => `${m.name}, ${m.phone}, ${m.role}`).join('\n'),
    })
    setDialogOpen(true)
  }

  const columns: ColumnDef<Quadinator>[] = [
    {
      accessorKey: 'name',
      header: 'Coordinator',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-gray-500">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'assignedQuad',
      header: 'Zone / Area',
      cell: ({ row }) => <Badge variant="secondary">{row.original.assignedQuad}</Badge>,
    },
    { accessorKey: 'phone', header: 'Phone' },
    {
      id: 'shift',
      header: 'Shift',
      cell: ({ row }) => <span className="text-sm">{row.original.shiftStart} – {row.original.shiftEnd}</span>,
    },
    {
      id: 'team',
      header: 'Team Size',
      cell: ({ row }) => row.original.teamMembers?.length || 0,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Coordinators & Teams</h2>
        <Button onClick={() => { setEditCoord(null); setDialogOpen(true) }}>
          <Plus className="h-4 w-4" /> Add Coordinator
        </Button>
      </div>

      <DataTable
        data={coordinators}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search coordinators..."
        emptyState={<EmptyState icon={MapPin} title="No coordinators" description="Assign coordinators to zones and areas" actionLabel="Add Coordinator" onAction={() => setDialogOpen(true)} />}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editCoord ? 'Edit Coordinator' : 'Add Coordinator'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Assigned Zone / Area *</Label>
              <Input value={form.assignedQuad} onChange={(e) => setForm({ ...form, assignedQuad: e.target.value })}
                placeholder="e.g. Registration Desk A, Main Stage, F&B Zone" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Shift Start</Label>
                <Input type="time" value={form.shiftStart} onChange={(e) => setForm({ ...form, shiftStart: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Shift End</Label>
                <Input type="time" value={form.shiftEnd} onChange={(e) => setForm({ ...form, shiftEnd: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Responsibilities (one per line)</Label>
              <Textarea rows={3} value={form.responsibilities}
                onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                placeholder="Manage registration queue&#10;Ensure badge printing&#10;Coordinate with volunteers" />
            </div>
            <div className="space-y-1.5">
              <Label>Team Members (Name, Phone, Role — one per line)</Label>
              <Textarea rows={3} value={form.teamMembersRaw}
                onChange={(e) => setForm({ ...form, teamMembersRaw: e.target.value })}
                placeholder="Ravi, 9876543210, Registration Helper&#10;Priya, 8765432109, Badge Printer" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editCoord ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete coordinator?</AlertDialogTitle>
            <AlertDialogDescription>Delete &quot;{deleteTarget?.name}&quot;?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              await deleteDoc(doc(db, 'events', eventId, 'quadinators', deleteTarget!.id))
              setCoordinators((prev) => prev.filter((c) => c.id !== deleteTarget!.id))
              setDeleteTarget(null)
              toast.success('Deleted')
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
