import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/50 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[#1e3a8a] text-white shadow-md shadow-[#1e3a8a]/25 hover:bg-[#163070] hover:shadow-lg hover:shadow-[#1e3a8a]/30 active:scale-[0.98]',
        orange:
          'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700 hover:shadow-lg hover:shadow-orange-500/40 active:scale-[0.98]',
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-[0.98]',
        outline:
          'border border-[#dae3ff] bg-white text-[#1e3a8a] hover:bg-[#eef3ff] hover:border-[#1e3a8a]/40 active:scale-[0.98]',
        secondary:
          'bg-[#eef3ff] text-[#1e3a8a] hover:bg-[#dae3ff] active:scale-[0.98]',
        ghost:
          'text-gray-600 hover:bg-[#eef3ff] hover:text-[#1e3a8a] active:scale-[0.98]',
        link:
          'text-orange-500 underline-offset-4 hover:underline hover:text-orange-600 p-0 h-auto shadow-none',
        amber:
          'bg-amber-500 text-white shadow-sm hover:bg-amber-600 active:scale-[0.98]',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm:      'h-8 rounded-lg px-3 text-xs',
        lg:      'h-11 rounded-xl px-8 text-base',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
