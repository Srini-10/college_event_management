'use client'
import { useEffect, useState } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  doc, updateDoc, writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/store/auth'
import { Notification } from '@/lib/types'
import { Bell, BellOff, CheckCheck, Trash2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import Link from 'next/link'

const TYPE_COLORS: Record<Notification['type'], string> = {
  task:         'bg-blue-100 text-blue-700',
  guest:        'bg-purple-100 text-purple-700',
  budget:       'bg-amber-100 text-amber-700',
  checklist:    'bg-green-100 text-green-700',
  approval:     'bg-orange-100 text-orange-700',
  announcement: 'bg-[#eef3ff] text-[#1e3a8a]',
}

const TYPE_LABELS: Record<Notification['type'], string> = {
  task:         'Task',
  guest:        'Guest',
  budget:       'Budget',
  checklist:    'Checklist',
  approval:     'Approval',
  announcement: 'Announcement',
}

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (!user?.uid) return
    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)))
      setLoading(false)
    })
    return unsub
  }, [user?.uid])

  async function markRead(notifId: string) {
    if (!user?.uid) return
    await updateDoc(doc(db, 'users', user.uid, 'notifications', notifId), { read: true })
  }

  async function markAllRead() {
    if (!user?.uid) return
    const unread = notifications.filter(n => !n.read)
    if (!unread.length) return
    const batch = writeBatch(db)
    unread.forEach(n => {
      batch.update(doc(db, 'users', user.uid, 'notifications', n.id), { read: true })
    })
    await batch.commit()
    toast.success('All notifications marked as read')
  }

  async function deleteNotif(notifId: string) {
    if (!user?.uid) return
    const { deleteDoc } = await import('firebase/firestore')
    await deleteDoc(doc(db, 'users', user.uid, 'notifications', notifId))
  }

  async function clearAll() {
    if (!user?.uid) return
    const batch = writeBatch(db)
    const { deleteDoc } = await import('firebase/firestore')
    notifications.forEach(n => {
      batch.delete(doc(db, 'users', user.uid, 'notifications', n.id))
    })
    await batch.commit()
    toast.success('All notifications cleared')
  }

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            filter === 'unread' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0 divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-4">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={BellOff}
                title="No notifications"
                description={filter === 'unread' ? 'You have no unread notifications.' : 'Notifications will appear here.'}
              />
            </div>
          ) : (
            filtered.map(notif => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group ${
                  !notif.read ? 'bg-[#eef3ff]/40' : ''
                }`}
              >
                {/* Type dot */}
                <div className="mt-0.5 shrink-0">
                  <span className={`inline-flex h-2 w-2 rounded-full mt-1.5 ${!notif.read ? 'bg-orange-500' : 'bg-transparent'}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TYPE_COLORS[notif.type]}`}>
                          {TYPE_LABELS[notif.type]}
                        </span>
                        <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notif.createdAt
                          ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true })
                          : 'Just now'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {!notif.read && (
                        <button
                          onClick={() => markRead(notif.id)}
                          title="Mark as read"
                          className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotif(notif.id)}
                        title="Delete"
                        className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      {notif.link && (
                        <Link
                          href={notif.link}
                          onClick={() => markRead(notif.id)}
                          className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
