'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Certificate, Registration } from '@/lib/types'
import { getRegistrations } from '@/lib/firestore/registrations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { toast } from 'sonner'
import { Award, Plus, Download, Mail, Loader2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { formatDateTime } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'

const CERT_TYPES = ['participation', 'appreciation', 'best-paper', 'felicitation', 'volunteer']

const CERT_COLORS: Record<string, string> = {
  participation: 'border-blue-200 bg-blue-50',
  appreciation: 'border-purple-200 bg-purple-50',
  'best-paper': 'border-amber-200 bg-amber-50',
  felicitation: 'border-green-200 bg-green-50',
  volunteer: 'border-gray-200 bg-gray-50',
}

export default function CertificatesPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const { user } = useAuthStore()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [bulkCertType, setBulkCertType] = useState('participation')
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    recipientName: '', certType: 'participation',
    recipientRegId: '',
  })

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    Promise.all([
      getDocs(query(collection(db, 'events', eventId, 'certificates'), orderBy('issuedAt', 'desc'))),
      getRegistrations(eventId),
    ]).then(([certSnap, regs]) => {
      setCertificates(certSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Certificate)))
      setRegistrations(regs)
      setLoading(false)
    })
  }, [eventId])

  async function issueCertificate() {
    if (!eventId || !user || !form.recipientName) return
    setSaving(true)
    try {
      const ref = await addDoc(collection(db, 'events', eventId, 'certificates'), {
        recipientName: form.recipientName,
        certType: form.certType,
        recipientRegId: form.recipientRegId || '',
        issuedBy: user.uid,
        emailed: false,
        issuedAt: serverTimestamp(),
        eventId,
      })
      setCertificates((prev) => [{
        id: ref.id, recipientName: form.recipientName, certType: form.certType as any,
        recipientRegId: form.recipientRegId || '', issuedBy: user.uid, emailed: false,
        issuedAt: {} as any, eventId,
      }, ...prev])
      toast.success('Certificate issued')
      setDialogOpen(false)
    } catch {
      toast.error('Failed to issue')
    } finally {
      setSaving(false)
    }
  }

  async function bulkIssue() {
    if (!eventId || !user) return
    const checkedIn = registrations.filter((r) => r.checkedIn)
    setSaving(true)
    try {
      const newCerts: Certificate[] = []
      for (const reg of checkedIn) {
        const ref = await addDoc(collection(db, 'events', eventId, 'certificates'), {
          recipientName: reg.name,
          recipientRegId: reg.id,
          certType: bulkCertType,
          issuedBy: user.uid,
          emailed: false,
          issuedAt: serverTimestamp(),
          eventId,
        })
        newCerts.push({ id: ref.id, recipientName: reg.name, recipientRegId: reg.id, certType: bulkCertType as any, issuedBy: user.uid, emailed: false, issuedAt: {} as any, eventId })
      }
      setCertificates((prev) => [...newCerts, ...prev])
      toast.success(`${checkedIn.length} certificates issued`)
    } catch {
      toast.error('Bulk issue failed')
    } finally {
      setSaving(false)
    }
  }

  function downloadCSV() {
    const rows = certificates.map((c) => `${c.recipientName},${c.certType},${c.emailed ? 'emailed' : 'pending'}`)
    const csv = 'Name,Type,Status\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'certificates.csv'; a.click()
  }

  const columns: ColumnDef<Certificate>[] = [
    { accessorKey: 'recipientName', header: 'Recipient', cell: ({ row }) => <div className="font-medium">{row.original.recipientName}</div> },
    {
      accessorKey: 'certType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge className={`capitalize border ${CERT_COLORS[row.original.certType] || ''}`}>{row.original.certType}</Badge>
      ),
    },
    {
      accessorKey: 'emailed',
      header: 'Emailed',
      cell: ({ row }) => row.original.emailed
        ? <span className="text-green-600 text-xs font-medium">Sent</span>
        : <span className="text-gray-400 text-xs">Pending</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Certificate Generator</h2>
          <p className="text-sm text-gray-500 mt-0.5">{certificates.length} issued</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadCSV}><Download className="h-4 w-4" /> Export</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Issue Certificate
          </Button>
        </div>
      </div>

      {/* Bulk issue card */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 flex items-center gap-4 flex-wrap">
        <div className="flex-1">
          <p className="font-medium text-indigo-900">Bulk Issue Certificates</p>
          <p className="text-sm text-indigo-700 mt-0.5">Issue to all {registrations.filter(r => r.checkedIn).length} checked-in participants</p>
        </div>
        <Select value={bulkCertType} onValueChange={setBulkCertType}>
          <SelectTrigger className="w-40 bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CERT_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={bulkIssue} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Issue All
        </Button>
      </div>

      <DataTable
        data={certificates}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search by name..."
        emptyState={<EmptyState icon={Award} title="No certificates issued" description="Issue participation and appreciation certificates" actionLabel="Issue Certificate" onAction={() => setDialogOpen(true)} />}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Issue Certificate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Recipient Name *</Label>
              <Input value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Certificate Type</Label>
              <Select value={form.certType} onValueChange={(v) => setForm({ ...form, certType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CERT_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={issueCertificate} disabled={saving || !form.recipientName}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
