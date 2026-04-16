import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/layout/AuthProvider'
import { Toaster } from 'sonner'
import QueryProvider from '@/components/layout/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EventPro — College Event Management',
  description: 'Manage college events end-to-end: registrations, guests, logistics, and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
