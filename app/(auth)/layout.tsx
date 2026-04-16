import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — KSR Events',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(145deg,#060f3a 0%,#0c1a6e 40%,#1a2f8a 70%,#0f2167 100%)' }}>
      {children}
    </div>
  )
}
