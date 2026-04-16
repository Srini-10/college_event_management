'use client'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { getRegistrations } from '@/lib/firestore/registrations'
import { Registration } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
import { QrCode, Download, Printer } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  vip: 'bg-amber-500 text-white',
  guest: 'bg-purple-500 text-white',
  participant: 'bg-blue-500 text-white',
  media: 'bg-green-500 text-white',
  volunteer: 'bg-gray-500 text-white',
}

function BadgeCard({ reg }: { reg: Registration }) {
  return (
    <div className="w-[3.5in] h-[2.2in] border-2 border-gray-300 rounded-lg overflow-hidden flex flex-col bg-white shadow-sm">
      <div className={cn('px-3 py-1.5 flex items-center justify-between', CATEGORY_COLORS[reg.category] || 'bg-indigo-600 text-white')}>
        <span className="text-xs font-bold uppercase tracking-wider">{reg.category}</span>
        <span className="text-xs opacity-80">EventPro</span>
      </div>
      <div className="flex-1 flex items-center gap-3 px-3 py-2">
        <div className="flex-1">
          <p className="font-bold text-sm leading-tight text-gray-900 line-clamp-2">{reg.name}</p>
          <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{reg.designation}</p>
          <p className="text-xs text-gray-500 line-clamp-1">{reg.organization}</p>
        </div>
        <div className="shrink-0 h-16 w-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
          QR
        </div>
      </div>
      <div className="bg-gray-50 px-3 py-1">
        <p className="text-xs text-gray-400 font-mono">{reg.qrToken.slice(0, 12).toUpperCase()}</p>
      </div>
    </div>
  )
}

export default function BadgesPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('all')
  const [previewMode, setPreviewMode] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    getRegistrations(eventId).then((r) => { setRegistrations(r); setLoading(false) })
  }, [eventId])

  function handlePrint() {
    window.print()
  }

  const filtered = filterCategory === 'all'
    ? registrations
    : registrations.filter((r) => r.category === filterCategory)

  const columns: ColumnDef<Registration>[] = [
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => <div className="font-medium">{row.original.name}</div> },
    { accessorKey: 'organization', header: 'Organization' },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <span className={cn('px-2 py-0.5 rounded text-xs font-semibold', CATEGORY_COLORS[row.original.category])}>{row.original.category}</span>,
    },
    {
      id: 'preview',
      header: 'Preview',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" onClick={() => {
          setPreviewMode(true)
          setFilterCategory(row.original.category)
        }}>Preview Badge</Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Badge System</h2>
          <p className="text-sm text-gray-500 mt-0.5">{registrations.length} badges</p>
        </div>
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {['participant', 'guest', 'vip', 'media', 'volunteer'].map((c) => (
                <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
            <QrCode className="h-4 w-4" /> {previewMode ? 'List View' : 'Badge Preview'}
          </Button>
          <Button size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {!previewMode ? (
        <DataTable
          data={registrations}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search registrations..."
          emptyState={<EmptyState icon={QrCode} title="No registrations" description="Add registrations to generate badges" />}
        />
      ) : (
        <div ref={printRef} className="print:p-0">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-2">
            {filtered.map((reg) => <BadgeCard key={reg.id} reg={reg} />)}
          </div>
        </div>
      )}
    </div>
  )
}
