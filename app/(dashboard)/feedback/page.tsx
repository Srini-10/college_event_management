'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Feedback } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { FileText, Star, Download, Link, CheckCircle } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import * as XLSX from 'xlsx'

export default function FeedbackPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    getDocs(query(collection(db, 'events', eventId, 'feedback'), orderBy('submittedAt', 'desc')))
      .then((snap) => {
        setFeedback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Feedback)))
        setLoading(false)
      })
  }, [eventId])

  async function toggleApproval(fb: Feedback) {
    await updateDoc(doc(db, 'events', eventId, 'feedback', fb.id), { approved: !fb.approved })
    setFeedback((prev) => prev.map((f) => f.id === fb.id ? { ...f, approved: !f.approved } : f))
    toast.success(fb.approved ? 'Testimonial unapproved' : 'Testimonial approved')
  }

  function exportCSV() {
    const ws = XLSX.utils.json_to_sheet(feedback.map((f) => ({
      Name: f.submittedBy || 'Anonymous',
      Overall: f.overallRating,
      Organization: f.organizationRating || '',
      Hospitality: f.hospitalityRating || '',
      Content: f.contentRating || '',
      Suggestions: f.suggestions || '',
      Testimonial: f.testimonial || '',
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Feedback')
    XLSX.writeFile(wb, 'feedback.xlsx')
  }

  const avgRating = feedback.length > 0
    ? (feedback.reduce((s, f) => s + f.overallRating, 0) / feedback.length).toFixed(1)
    : '0'

  const publicLink = eventId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/feedback/${eventId}/submit` : ''

  const columns: ColumnDef<Feedback>[] = [
    { accessorKey: 'submittedBy', header: 'Name', cell: ({ row }) => row.original.submittedBy || 'Anonymous' },
    {
      accessorKey: 'overallRating',
      header: 'Rating',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3.5 w-3.5 ${i < row.original.overallRating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
          ))}
          <span className="text-xs text-gray-500 ml-1">{row.original.overallRating}/5</span>
        </div>
      ),
    },
    { accessorKey: 'suggestions', header: 'Suggestions', cell: ({ row }) => <span className="text-sm truncate max-w-xs block">{row.original.suggestions || '—'}</span> },
    {
      id: 'testimonial',
      header: 'Testimonial',
      cell: ({ row }) => row.original.testimonial ? (
        <Button size="sm" variant="ghost" onClick={() => toggleApproval(row.original)}>
          <CheckCircle className={`h-4 w-4 ${row.original.approved ? 'text-green-500' : 'text-gray-400'}`} />
          {row.original.approved ? 'Approved' : 'Approve'}
        </Button>
      ) : '—',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Feedback</h2>
          <p className="text-sm text-gray-500 mt-0.5">{feedback.length} responses · Avg {avgRating}/5</p>
        </div>
        <div className="flex gap-2">
          {eventId && (
            <Button variant="outline" size="sm" onClick={() => {
              navigator.clipboard.writeText(publicLink)
              toast.success('Feedback link copied!')
            }}>
              <Link className="h-4 w-4" /> Copy Link
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4" /> Export</Button>
        </div>
      </div>

      {eventId && (
        <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 text-sm">
          <span className="text-indigo-700">Public feedback form: </span>
          <span className="text-indigo-900 font-mono text-xs break-all">{publicLink}</span>
        </div>
      )}

      <DataTable
        data={feedback}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search feedback..."
        emptyState={<EmptyState icon={FileText} title="No feedback yet" description="Share the public feedback link with attendees" />}
      />
    </div>
  )
}
