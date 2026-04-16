'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getChecklists, addChecklist, updateChecklist, deleteChecklist } from '@/lib/firestore/checklists'
import { Checklist, ChecklistItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { toast } from 'sonner'
import { CheckSquare, Plus, Trash2, Loader2, Circle } from 'lucide-react'
import { generateId } from '@/lib/utils'
import { cn } from '@/lib/utils'

const DEFAULT_TEMPLATES: Partial<Checklist>[] = [
  {
    title: 'Pre-Event Checklist', category: 'pre-event',
    items: [
      { id: generateId(), task: 'Venue booking confirmed', status: 'pending' },
      { id: generateId(), task: 'Backdrop design approved and sent to print', status: 'pending' },
      { id: generateId(), task: 'Guest invitations sent', status: 'pending' },
      { id: generateId(), task: 'Hotel bookings for guests confirmed', status: 'pending' },
      { id: generateId(), task: 'Pickup arrangements finalized', status: 'pending' },
      { id: generateId(), task: 'Gift procurement (shawl, gift, memento)', status: 'pending' },
      { id: generateId(), task: 'Stage and AV setup verified', status: 'pending' },
      { id: generateId(), task: 'Catering menu and headcount confirmed', status: 'pending' },
      { id: generateId(), task: 'Registration desk setup complete', status: 'pending' },
      { id: generateId(), task: 'Volunteer briefing conducted', status: 'pending' },
    ],
  },
  {
    title: 'Day-of-Event Checklist', category: 'day-of',
    items: [
      { id: generateId(), task: 'Registration desk operational', status: 'pending' },
      { id: generateId(), task: 'AV equipment tested (mics, projectors)', status: 'pending' },
      { id: generateId(), task: 'Stage setup inspected', status: 'pending' },
      { id: generateId(), task: 'Guest arrival confirmations received', status: 'pending' },
      { id: generateId(), task: 'Pickup volunteers dispatched', status: 'pending' },
      { id: generateId(), task: 'Catering team on site', status: 'pending' },
      { id: generateId(), task: 'First-aid kit available', status: 'pending' },
      { id: generateId(), task: 'Photography team briefed', status: 'pending' },
      { id: generateId(), task: 'Program booklets distributed', status: 'pending' },
      { id: generateId(), task: 'Emergency contacts shared with all quadinators', status: 'pending' },
    ],
  },
]

export default function ChecklistsPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<Checklist['category']>('pre-event')
  const [newTaskInput, setNewTaskInput] = useState('')
  const [newTasks, setNewTasks] = useState<ChecklistItem[]>([])
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Checklist | null>(null)

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    getChecklists(eventId).then((c) => { setChecklists(c); setLoading(false) })
  }, [eventId])

  async function handleSeedTemplates() {
    if (!eventId) return
    setSaving(true)
    try {
      for (const tpl of DEFAULT_TEMPLATES) {
        const id = await addChecklist(eventId, { ...(tpl as any), eventId } as any)
        setChecklists((prev) => [...prev, { id, ...(tpl as any), eventId, createdAt: {} as any }])
      }
      toast.success('Default checklists added')
    } catch {
      toast.error('Failed to add templates')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateChecklist() {
    if (!eventId || !newTitle.trim()) return
    setSaving(true)
    try {
      const data = { title: newTitle, category: newCategory, items: newTasks, eventId } as any
      const id = await addChecklist(eventId, data)
      setChecklists((prev) => [...prev, { id, ...data, createdAt: {} as any }])
      toast.success('Checklist created')
      setDialogOpen(false)
      setNewTitle('')
      setNewTasks([])
    } catch {
      toast.error('Failed to create')
    } finally {
      setSaving(false)
    }
  }

  async function toggleItem(checklist: Checklist, itemId: string) {
    const updatedItems = checklist.items.map((item) =>
      item.id === itemId ? { ...item, status: item.status === 'done' ? 'pending' : 'done' } : item
    )
    await updateChecklist(eventId, checklist.id, { items: updatedItems as any })
    setChecklists((prev) => prev.map((c) => c.id === checklist.id ? { ...c, items: updatedItems as any } : c))
  }

  function getProgress(checklist: Checklist) {
    const done = checklist.items.filter((i) => i.status === 'done').length
    return checklist.items.length > 0 ? Math.round((done / checklist.items.length) * 100) : 0
  }

  const catColors: Record<string, string> = {
    'pre-event': 'bg-blue-100 text-blue-800',
    'day-of': 'bg-green-100 text-green-800',
    'post-event': 'bg-purple-100 text-purple-800',
    'custom': 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Checklists</h2>
        <div className="flex gap-2">
          {checklists.length === 0 && eventId && (
            <Button variant="outline" onClick={handleSeedTemplates} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Load Default Templates
            </Button>
          )}
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> New Checklist
          </Button>
        </div>
      </div>

      {!eventId ? (
        <EmptyState icon={CheckSquare} title="No event selected" />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : checklists.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No checklists" description="Load default templates or create a custom checklist"
          actionLabel="New Checklist" onAction={() => setDialogOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checklists.map((cl) => {
            const progress = getProgress(cl)
            const done = cl.items.filter((i) => i.status === 'done').length
            return (
              <Card key={cl.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{cl.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn('text-xs px-1.5 py-0.5 rounded', catColors[cl.category])}>{cl.category}</span>
                        <span className="text-xs text-gray-500">{done}/{cl.items.length} done</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-500 h-7 w-7 p-0" onClick={() => setDeleteTarget(cl)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Progress value={progress} className="h-1.5 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {cl.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2.5">
                        <Checkbox
                          checked={item.status === 'done'}
                          onCheckedChange={() => toggleItem(cl, item.id)}
                        />
                        <span className={cn('text-sm', item.status === 'done' && 'line-through text-gray-400')}>
                          {item.task}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Pre-Event Tasks" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={newCategory} onValueChange={(v) => setNewCategory(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['pre-event', 'day-of', 'post-event', 'custom'].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tasks</Label>
              <div className="flex gap-2">
                <Input value={newTaskInput} onChange={(e) => setNewTaskInput(e.target.value)}
                  placeholder="Add a task..." onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTaskInput.trim()) {
                      e.preventDefault()
                      setNewTasks((t) => [...t, { id: generateId(), task: newTaskInput.trim(), status: 'pending' }])
                      setNewTaskInput('')
                    }
                  }} />
                <Button type="button" variant="outline" onClick={() => {
                  if (newTaskInput.trim()) {
                    setNewTasks((t) => [...t, { id: generateId(), task: newTaskInput.trim(), status: 'pending' }])
                    setNewTaskInput('')
                  }
                }}>Add</Button>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto mt-2">
                {newTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm bg-gray-50 rounded px-2 py-1">
                    <span>{t.task}</span>
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-gray-400"
                      onClick={() => setNewTasks((prev) => prev.filter((i) => i.id !== t.id))}>×</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateChecklist} disabled={saving || !newTitle.trim()}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete checklist?</AlertDialogTitle>
            <AlertDialogDescription>Delete &quot;{deleteTarget?.title}&quot;?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              await deleteChecklist(eventId, deleteTarget!.id)
              setChecklists((prev) => prev.filter((c) => c.id !== deleteTarget!.id))
              setDeleteTarget(null)
              toast.success('Deleted')
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
