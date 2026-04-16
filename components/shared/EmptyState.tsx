import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center animate-fade-in-up', className)}>
      {Icon && (
        <div className="mb-5 relative">
          <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-[#eef3ff] to-[#dae3ff] flex items-center justify-center shadow-sm border border-[#dae3ff]">
            <Icon className="h-8 w-8 text-[#1e3a8a]/50" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center">
            <span className="text-[8px] text-orange-500 font-bold">0</span>
          </div>
        </div>
      )}
      <h3 className="text-base font-bold text-[#0c1a6e]">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-gray-400 max-w-xs leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
