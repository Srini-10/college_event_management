'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getBudget, addBudgetItem, updateBudgetItem, deleteBudgetItem } from '@/lib/firestore/budget'
import { BudgetItem } from '@/lib/types'
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
import { budgetItemSchema, BudgetItemInput } from '@/lib/validations'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Plus, Pencil, Trash2, Loader2, Download, CheckCircle, XCircle } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend,
} from 'recharts'
import { useAuthStore } from '@/store/auth'
import * as XLSX from 'xlsx'

const BUDGET_CATEGORIES = ['venue', 'catering', 'decoration', 'gifts', 'travel', 'accommodation', 'av', 'printing', 'misc']
const CAT_COLORS: Record<string, string> = {
  venue: '#4F46E5', catering: '#10B981', decoration: '#F59E0B',
  gifts: '#EC4899', travel: '#3B82F6', accommodation: '#8B5CF6',
  av: '#6366F1', printing: '#14B8A6', misc: '#9CA3AF',
}

export default function BudgetPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const { user } = useAuthStore()
  const [items, setItems] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<BudgetItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BudgetItem | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<BudgetItemInput>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: { category: 'misc', estimatedAmount: 0 },
  })

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    getBudget(eventId).then((b) => { setItems(b); setLoading(false) })
  }, [eventId])

  async function onSubmit(data: BudgetItemInput) {
    if (!eventId) return toast.error('No event selected')
    setSaving(true)
    try {
      if (editItem) {
        await updateBudgetItem(eventId, editItem.id, data)
        setItems((prev) => prev.map((i) => i.id === editItem.id ? { ...i, ...data } : i))
        toast.success('Item updated')
      } else {
        const id = await addBudgetItem(eventId, { ...data, approvalStatus: 'pending', eventId } as any)
        setItems((prev) => [{ id, ...data, approvalStatus: 'pending', eventId, createdAt: {} as any }, ...prev])
        toast.success('Expense added')
      }
      setDialogOpen(false)
      reset()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleApproval(item: BudgetItem, status: 'approved' | 'rejected') {
    await updateBudgetItem(eventId, item.id, { approvalStatus: status, approvedBy: user?.uid })
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, approvalStatus: status } : i))
    toast.success(`Item ${status}`)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteBudgetItem(eventId, deleteTarget.id)
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id))
    toast.success('Deleted')
    setDeleteTarget(null)
  }

  function openEdit(item: BudgetItem) {
    setEditItem(item)
    setValue('category', item.category)
    setValue('itemName', item.itemName)
    setValue('estimatedAmount', item.estimatedAmount)
    if (item.actualAmount !== undefined) setValue('actualAmount', item.actualAmount)
    if (item.paymentMode) setValue('paymentMode', item.paymentMode)
    if (item.notes) setValue('notes', item.notes)
    setDialogOpen(true)
  }

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(items.map((i) => ({
      Category: i.category, Item: i.itemName,
      Estimated: i.estimatedAmount, Actual: i.actualAmount || '',
      Status: i.approvalStatus, Mode: i.paymentMode || '',
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Budget')
    XLSX.writeFile(wb, 'budget.xlsx')
  }

  const totalEstimated = items.reduce((s, i) => s + (i.estimatedAmount || 0), 0)
  const totalActual = items.reduce((s, i) => s + (i.actualAmount || 0), 0)
  const utilization = totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0

  const categoryData = BUDGET_CATEGORIES.map((cat) => {
    const catItems = items.filter((i) => i.category === cat)
    return {
      name: cat,
      estimated: catItems.reduce((s, i) => s + (i.estimatedAmount || 0), 0),
      actual: catItems.reduce((s, i) => s + (i.actualAmount || 0), 0),
    }
  }).filter((c) => c.estimated > 0)

  const columns: ColumnDef<BudgetItem>[] = [
    {
      accessorKey: 'itemName',
      header: 'Item',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.itemName}</div>
          <div className="text-xs text-gray-500 capitalize">{row.original.category}</div>
        </div>
      ),
    },
    {
      accessorKey: 'estimatedAmount',
      header: 'Estimated',
      cell: ({ row }) => formatCurrency(row.original.estimatedAmount),
    },
    {
      accessorKey: 'actualAmount',
      header: 'Actual',
      cell: ({ row }) => row.original.actualAmount ? formatCurrency(row.original.actualAmount) : '—',
    },
    {
      id: 'variance',
      header: 'Variance',
      cell: ({ row }) => {
        if (!row.original.actualAmount) return '—'
        const v = row.original.actualAmount - row.original.estimatedAmount
        return <span className={v > 0 ? 'text-red-600' : 'text-green-600'}>{v > 0 ? '+' : ''}{formatCurrency(v)}</span>
      },
    },
    { accessorKey: 'paymentMode', header: 'Mode', cell: ({ row }) => row.original.paymentMode || '—' },
    {
      accessorKey: 'approvalStatus',
      header: 'Approval',
      cell: ({ row }) => <StatusBadge status={row.original.approvalStatus} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(row.original)}><Pencil className="h-3.5 w-3.5" /></Button>
          {row.original.approvalStatus === 'pending' && (
            <>
              <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleApproval(row.original, 'approved')}><CheckCircle className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleApproval(row.original, 'rejected')}><XCircle className="h-3.5 w-3.5" /></Button>
            </>
          )}
          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteTarget(row.original)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Budget & Finance</h2>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} items · {utilization}% utilized</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportExcel}><Download className="h-4 w-4" /> Export</Button>
          <Button size="sm" onClick={() => { setEditItem(null); reset(); setDialogOpen(true) }}>
            <Plus className="h-4 w-4" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Total Estimated</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalEstimated)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Total Actual</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalActual)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Utilization</p>
          <p className={`text-xl font-bold ${utilization > 100 ? 'text-red-600' : 'text-green-600'}`}>{utilization}%</p>
        </CardContent></Card>
      </div>

      {/* Chart */}
      {categoryData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3">Category-wise Breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend />
                <Bar dataKey="estimated" name="Estimated" fill="#E0E7FF" />
                <Bar dataKey="actual" name="Actual" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search items..."
        emptyState={<EmptyState icon={DollarSign} title="No budget items" description="Track estimated and actual expenses" actionLabel="Add Expense" onAction={() => setDialogOpen(true)} />}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Controller name="category" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BUDGET_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-1.5">
              <Label>Item Name *</Label>
              <Input {...register('itemName')} placeholder="Stage decoration" />
              {errors.itemName && <p className="text-xs text-red-500">{errors.itemName.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Estimated Amount *</Label>
                <Input type="number" {...register('estimatedAmount', { valueAsNumber: true })} placeholder="50000" />
              </div>
              <div className="space-y-1.5">
                <Label>Actual Amount</Label>
                <Input type="number" {...register('actualAmount', { valueAsNumber: true })} placeholder="48000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Payment Mode</Label>
                <Controller name="paymentMode" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['cash', 'upi', 'bank-transfer', 'cheque'].map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" {...register('date')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea {...register('notes')} rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editItem ? 'Save' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>Delete &quot;{deleteTarget?.itemName}&quot;?</AlertDialogDescription>
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
