'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, UserCheck, Mic2, Calendar, DollarSign,
  Truck, Megaphone, CheckSquare, Award, QrCode, BarChart2,
  Image, Settings, Building2, ChevronLeft, ChevronRight, MapPin,
  Plane, FileText, ChevronDown,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getEvents } from '@/lib/firestore/events'
import { Event } from '@/lib/types'
import { useRouter } from 'next/navigation'

const eventSections = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/registrations', icon: UserCheck, label: 'Registrations' },
      { href: '/guests',        icon: Users,     label: 'Guests'        },
      { href: '/coordinators',  icon: MapPin,    label: 'Coordinators'  },
    ],
  },
  {
    label: 'Logistics',
    items: [
      { href: '/stage',      icon: Mic2,        label: 'Stage & Logistics' },
      { href: '/schedule',   icon: Calendar,    label: 'Schedule'          },
      { href: '/budget',     icon: DollarSign,  label: 'Budget'            },
      { href: '/vendors',    icon: Truck,       label: 'Vendors'           },
      { href: '/travel',     icon: Plane,       label: 'Travel'            },
      { href: '/checklists', icon: CheckSquare, label: 'Checklists'        },
    ],
  },
  {
    label: 'Communication',
    items: [
      { href: '/announcements', icon: Megaphone, label: 'Announcements' },
    ],
  },
  {
    label: 'Post-Event',
    items: [
      { href: '/certificates', icon: Award,     label: 'Certificates' },
      { href: '/badges',       icon: QrCode,    label: 'Badges'       },
      { href: '/feedback',     icon: FileText,  label: 'Feedback'     },
      { href: '/analytics',    icon: BarChart2, label: 'Analytics'    },
      { href: '/media',        icon: Image,     label: 'Media'        },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

interface SidebarProps {
  eventId?: string
}

export function Sidebar({ eventId }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const pickerRef = useRef<HTMLDivElement>(null)

  // Load events for the picker when an event is selected
  useEffect(() => {
    if (eventId) {
      getEvents().then(setEvents).catch(() => {})
    }
  }, [eventId])

  // Close picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    if (pickerOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [pickerOpen])

  function getHref(href: string) {
    if (!eventId) return href
    if (href === '/dashboard') return `/dashboard/${eventId}`
    return `${href}?eventId=${eventId}`
  }

  function isActive(href: string) {
    const basePath = href === '/dashboard' && eventId ? `/dashboard/${eventId}` : href
    return pathname === basePath || pathname.startsWith(basePath + '/')
  }

  const selectedEvent = events.find((e) => e.id === eventId)

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col transition-all duration-300 overflow-hidden',
        'border-r border-[#061250]/60',
        collapsed ? 'w-16' : 'w-64',
      )}
      style={{ background: 'linear-gradient(170deg,#060f3a 0%,#0c1a6e 50%,#0f2167 100%)' }}
    >
      {/* Ambient glow shapes */}
      <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-32 -left-12 h-40 w-40 rounded-full bg-blue-400/8 blur-2xl" />

      {/* ── Logo ─────────────────────────────────────────── */}
      <div className={cn(
        'flex h-16 items-center border-b border-white/10',
        collapsed ? 'justify-center px-2' : 'px-4',
      )}>
        {!collapsed ? (
          <Link href="/events" className="flex items-center gap-3 group">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/40 group-hover:shadow-orange-500/50 transition-shadow duration-200 flex-shrink-0">
              <Building2 className="h-5 w-5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-[#0c1a6e]" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-none tracking-wide">KSR Events</p>
              <p className="text-blue-300/50 text-[10px] font-medium tracking-widest uppercase mt-0.5">Management Platform</p>
            </div>
          </Link>
        ) : (
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/40">
            <Building2 className="h-4 w-4 text-white" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400 ring-2 ring-[#0c1a6e]" />
          </div>
        )}
      </div>

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">

        {/* Always-visible: All Events */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-blue-200/35 select-none">
              Events
            </p>
          )}
          <Link
            href="/events"
            title={collapsed ? 'All Events' : undefined}
            className={cn(
              'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 select-none',
              pathname === '/events'
                ? 'bg-orange-500/18 text-orange-300'
                : 'text-blue-100/65 hover:bg-white/10 hover:text-white',
              collapsed && 'justify-center px-0 py-2.5',
            )}
          >
            {pathname === '/events' && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-orange-400" />
            )}
            <Building2
              className={cn(
                'h-4 w-4 shrink-0 transition-all duration-150',
                pathname === '/events' ? 'text-orange-400' : 'text-blue-300/55 group-hover:text-white group-hover:scale-110',
              )}
            />
            {!collapsed && (
              <>
                <span className={cn('flex-1', pathname === '/events' && 'font-semibold')}>All Events</span>
                {pathname === '/events' && <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />}
              </>
            )}
          </Link>
        </div>

        {/* Event-specific navigation — only shown when an event is selected */}
        {eventId && (
          <>
            {/* Event selector strip */}
            {!collapsed && (
              <div className="mt-3 mb-1 mx-1" ref={pickerRef}>
                <button
                  type="button"
                  onClick={() => setPickerOpen((o) => !o)}
                  className="w-full flex items-center gap-2 rounded-lg bg-white/8 border border-white/12 px-3 py-2 text-left hover:bg-white/12 transition-colors group"
                >
                  <div className="h-5 w-5 rounded-md bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
                    <Building2 className="h-3 w-3 text-white" />
                  </div>
                  <span className="flex-1 text-xs font-medium text-white/80 truncate leading-tight">
                    {selectedEvent?.title ?? 'Selected Event'}
                  </span>
                  <ChevronDown className={cn('h-3.5 w-3.5 text-white/40 transition-transform shrink-0', pickerOpen && 'rotate-180')} />
                </button>

                {/* Dropdown */}
                {pickerOpen && (
                  <div className="absolute left-2 right-2 mt-1 z-50 rounded-lg bg-[#0c1a6e] border border-white/15 shadow-2xl shadow-black/50 overflow-hidden max-h-52 overflow-y-auto">
                    {events.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => {
                          setPickerOpen(false)
                          router.push(`/dashboard/${ev.id}`)
                        }}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs hover:bg-white/10 transition-colors',
                          ev.id === eventId ? 'text-orange-300 bg-orange-500/12' : 'text-white/70',
                        )}
                      >
                        <div
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: ev.themeColor || '#1e3a8a' }}
                        />
                        <span className="truncate font-medium">{ev.title}</span>
                        {ev.id === eventId && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />}
                      </button>
                    ))}
                    <div className="border-t border-white/10 p-1.5">
                      <button
                        type="button"
                        onClick={() => { setPickerOpen(false); router.push('/events') }}
                        className="w-full text-center text-[10px] text-blue-300/60 hover:text-blue-200 py-1 transition-colors"
                      >
                        + Manage all events
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* All event sections */}
            {eventSections.map((section, si) => (
              <div key={section.label} className="mt-4">
                {!collapsed && (
                  <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-blue-200/35 select-none">
                    {section.label}
                  </p>
                )}
                {collapsed && si > 0 && (
                  <div className="mx-3 my-1 border-t border-white/8" />
                )}

                {section.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={getHref(item.href)}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 select-none',
                        active
                          ? 'bg-orange-500/18 text-orange-300'
                          : 'text-blue-100/65 hover:bg-white/10 hover:text-white',
                        collapsed && 'justify-center px-0 py-2.5',
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-orange-400" />
                      )}
                      <item.icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-all duration-150',
                          active ? 'text-orange-400' : 'text-blue-300/55 group-hover:text-white group-hover:scale-110',
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className={cn('flex-1', active && 'font-semibold')}>{item.label}</span>
                          {active && <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />}
                        </>
                      )}
                    </Link>
                  )
                })}
              </div>
            ))}
          </>
        )}

        {/* Prompt shown when no event is selected (expanded mode) */}
        {!eventId && !collapsed && (
          <div className="mt-6 mx-2 rounded-lg border border-white/10 bg-white/5 p-3 text-center">
            <Building2 className="h-6 w-6 text-orange-400/60 mx-auto mb-1.5" />
            <p className="text-[11px] text-blue-200/50 leading-snug">
              Select an event from<br />All Events to continue
            </p>
          </div>
        )}
      </nav>

      {/* ── Collapse toggle ───────────────────────────────── */}
      <div className="border-t border-white/10 p-2">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg py-2 text-blue-200/40 hover:bg-white/10 hover:text-white transition-colors duration-150"
        >
          {collapsed
            ? <ChevronRight className="h-4 w-4" />
            : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}
