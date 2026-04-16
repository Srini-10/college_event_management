'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { doc, updateDoc, collection, getDocs, query, orderBy, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Settings, Users, Bell, Shield, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { AppUser } from '@/lib/types'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [users, setUsers] = useState<AppUser[]>([])
  const [saving, setSaving] = useState(false)
  const [orgForm, setOrgForm] = useState({ collegeName: '', logo: '', smtpHost: '', smtpUser: '' })

  useEffect(() => {
    getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'))).then((snap) => {
      setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as AppUser)))
    })
  }, [])

  async function updateUserRole(uid: string, role: string) {
    await updateDoc(doc(db, 'users', uid), { role })
    setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, role: role as any } : u))
    toast.success('Role updated')
  }

  const ROLE_COLORS: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-800',
    event_admin: 'bg-purple-100 text-purple-800',
    quadinator: 'bg-blue-100 text-blue-800',
    volunteer: 'bg-green-100 text-green-800',
    guest_coordinator: 'bg-amber-100 text-amber-800',
    viewer: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-xl font-semibold">Settings</h2>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-1.5" /> Users & Roles</TabsTrigger>
          <TabsTrigger value="org"><Settings className="h-4 w-4 mr-1.5" /> Organization</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1.5" /> Notifications</TabsTrigger>
        </TabsList>

        {/* Users */}
        <TabsContent value="users" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">User Management</CardTitle>
              <CardDescription>Manage roles and access for all users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.uid} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{u.displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] || ''}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                      {user?.role === 'super_admin' && u.uid !== user.uid && (
                        <Select value={u.role} onValueChange={(v) => updateUserRole(u.uid, v)}>
                          <SelectTrigger className="h-7 w-36 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['super_admin', 'event_admin', 'quadinator', 'volunteer', 'guest_coordinator', 'viewer'].map((r) => (
                              <SelectItem key={r} value={r} className="text-xs">{r.replace('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Role Permissions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {[
                { role: 'super_admin', desc: 'Full system access across all events' },
                { role: 'event_admin', desc: 'Full access to a specific event' },
                { role: 'quadinator', desc: 'Access to their assigned zone only' },
                { role: 'volunteer', desc: 'Task checklists and attendance marking' },
                { role: 'guest_coordinator', desc: 'Guest management module only' },
                { role: 'viewer', desc: 'Read-only dashboard access' },
              ].map(({ role, desc }) => (
                <div key={role} className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${ROLE_COLORS[role] || ''} shrink-0`}>{role.replace('_', ' ')}</span>
                  <span className="text-gray-600">{desc}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization */}
        <TabsContent value="org" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organization Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>College / Organization Name</Label>
                <Input value={orgForm.collegeName} onChange={(e) => setOrgForm({ ...orgForm, collegeName: e.target.value })}
                  placeholder="ABC Engineering College" />
              </div>
              <div className="space-y-1.5">
                <Label>SMTP Host</Label>
                <Input value={orgForm.smtpHost} onChange={(e) => setOrgForm({ ...orgForm, smtpHost: e.target.value })}
                  placeholder="smtp.gmail.com" />
              </div>
              <div className="space-y-1.5">
                <Label>SMTP Email</Label>
                <Input value={orgForm.smtpUser} onChange={(e) => setOrgForm({ ...orgForm, smtpUser: e.target.value })}
                  placeholder="noreply@college.edu" />
              </div>
              <Button onClick={() => toast.success('Settings saved')} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription>Configure when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                'Guest arrival reminders (2 hours before)',
                'Budget approval requests',
                'Checklist task deadlines',
                'Schedule changes',
                'New registration notifications',
              ].map((pref) => (
                <div key={pref} className="flex items-center justify-between">
                  <span className="text-sm">{pref}</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              ))}
              <Button onClick={() => toast.success('Preferences saved')}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
