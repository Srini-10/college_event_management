'use client'
import { Bell, LogOut, Settings, ChevronDown, Menu } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { logout } from '@/lib/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'
import Link from 'next/link'

const PAGE_TITLES: Record<string, string> = {
  '/events':        'Events',
  '/dashboard':     'Dashboard',
  '/registrations': 'Registrations',
  '/guests':        'Guests',
  '/coordinators':  'Coordinators',
  '/stage':         'Stage & Logistics',
  '/schedule':      'Schedule',
  '/budget':        'Budget',
  '/vendors':       'Vendors',
  '/travel':        'Travel',
  '/checklists':    'Checklists',
  '/announcements': 'Announcements',
  '/certificates':  'Certificates',
  '/badges':        'Badges',
  '/feedback':      'Feedback',
  '/analytics':     'Analytics',
  '/media':         'Media',
  '/settings':      'Settings',
  '/notifications': 'Notifications',
  '/seed':          'Seed Demo Data',
}

function getTitle(pathname: string): string {
  for (const [key, label] of Object.entries(PAGE_TITLES)) {
    if (pathname === key || pathname.startsWith(key + '/') || pathname.startsWith(key + '?')) {
      return label
    }
  }
  return 'KSR Events'
}

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  const title = getTitle(pathname)

  return (
    <header className="flex h-14 items-center justify-between border-b border-[#dae3ff] bg-white px-3 sm:px-6 sticky top-0 z-20 shadow-sm shadow-[#dae3ff]/60">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-[#eef3ff] hover:text-[#1e3a8a] transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="h-5 w-1 rounded-full bg-linear-to-b from-orange-400 to-orange-600 shrink-0" />
        <h1 className="text-sm sm:text-[15px] font-bold text-[#0c1a6e] tracking-tight truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-slate-500 hover:text-[#1e3a8a] hover:bg-[#eef3ff]"
          asChild
        >
          <Link href="/notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500 ring-1.5 ring-white" />
          </Link>
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 h-9 hover:bg-[#eef3ff] rounded-lg"
            >
              <div className="h-7 w-7 rounded-full bg-linear-to-br from-[#1e3a8a] to-[#2952a3] text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-[#dae3ff]">
                {user ? getInitials(user.displayName) : 'U'}
              </div>
              <span className="text-sm text-gray-700 font-medium hidden sm:inline max-w-28 truncate">
                {user?.displayName}
              </span>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 border-[#dae3ff] shadow-lg shadow-[#1e3a8a]/10">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-[#0c1a6e]">{user?.displayName}</span>
                <span className="text-xs text-gray-400 font-normal truncate">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/settings">
                <Settings className="h-4 w-4 text-[#1e3a8a]" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
