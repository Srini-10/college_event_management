import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number): string {
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatDateTime(date: Date | string | number): string {
  return format(new Date(date), 'dd MMM yyyy, HH:mm')
}

export function formatTime(date: Date | string | number): string {
  // Handle plain HH:mm strings (e.g. from schedule slots) without parsing as Date
  if (typeof date === 'string' && /^\d{1,2}:\d{2}$/.test(date.trim())) {
    return date.trim()
  }
  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)
  return format(d, 'HH:mm')
}

export function timeAgo(date: Date | string | number): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
}
