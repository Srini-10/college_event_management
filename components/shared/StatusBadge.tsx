import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Status =
  | 'active' | 'draft' | 'completed' | 'archived'
  | 'confirmed' | 'tentative' | 'cancelled' | 'arrived' | 'departed'
  | 'pending' | 'approved' | 'rejected'
  | 'upcoming' | 'live' | 'delayed'
  | 'enquired' | 'contracted'
  | 'free' | 'paid' | 'waitlist'
  | string

const statusConfig: Record<string, { variant: any; label: string }> = {
  active:     { variant: 'success',   label: 'Active'      },
  draft:      { variant: 'secondary', label: 'Draft'       },
  completed:  { variant: 'blue',      label: 'Completed'   },
  archived:   { variant: 'outline',   label: 'Archived'    },
  confirmed:  { variant: 'success',   label: 'Confirmed'   },
  tentative:  { variant: 'warning',   label: 'Tentative'   },
  cancelled:  { variant: 'destructive', label: 'Cancelled' },
  arrived:    { variant: 'success',   label: 'Arrived'     },
  departed:   { variant: 'secondary', label: 'Departed'    },
  pending:    { variant: 'warning',   label: 'Pending'     },
  approved:   { variant: 'success',   label: 'Approved'    },
  rejected:   { variant: 'destructive', label: 'Rejected'  },
  upcoming:   { variant: 'blue',      label: 'Upcoming'    },
  live:       { variant: 'live',      label: '● Live'      },
  delayed:    { variant: 'warning',   label: 'Delayed'     },
  enquired:   { variant: 'secondary', label: 'Enquired'    },
  contracted: { variant: 'purple',    label: 'Contracted'  },
  free:       { variant: 'success',   label: 'Free'        },
  paid:       { variant: 'default',   label: 'Paid'        },
  waitlist:   { variant: 'warning',   label: 'Waitlist'    },
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: 'secondary', label: status }
  return (
    <Badge
      variant={config.variant}
      className={cn(
        status === 'live' && 'animate-pulse-orange',
        className,
      )}
    >
      {config.label}
    </Badge>
  )
}
