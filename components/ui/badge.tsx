import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'border-transparent bg-[#1e3a8a]/10 text-[#1e3a8a]',
        secondary:   'border-transparent bg-gray-100 text-gray-700',
        destructive: 'border-transparent bg-red-100 text-red-700',
        outline:     'border-gray-300 text-gray-600',
        success:     'border-transparent bg-emerald-100 text-emerald-700',
        warning:     'border-transparent bg-amber-100 text-amber-700',
        orange:      'border-transparent bg-orange-100 text-orange-700',
        purple:      'border-transparent bg-purple-100 text-purple-700',
        blue:        'border-transparent bg-sky-100 text-sky-700',
        pink:        'border-transparent bg-pink-100 text-pink-700',
        live:        'border-transparent bg-green-500 text-white shadow-sm shadow-green-400/40',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
