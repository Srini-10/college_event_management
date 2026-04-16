'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from '@/lib/validations'
import { loginWithEmail, loginWithGoogle, checkGoogleRedirect, resetPassword } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import {
  Building2, Loader2, Calendar, Users, Award, BarChart2,
  Shield, Eye, EyeOff, CheckCircle2,
} from 'lucide-react'

function authErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Incorrect email or password.'
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact your administrator.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Try again later or reset your password.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return ''
    case 'auth/unauthorized-domain':
      return 'This domain is not authorised for Google sign-in.'
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Enable it in Firebase Console.'
    default:
      return `Sign-in failed (${code || 'unknown'}).`
  }
}

const FEATURES = [
  { icon: Calendar,  label: 'Schedule & Programme',  desc: 'Plan every session, speaker & slot across all 4 days' },
  { icon: Users,     label: 'Guest & Registration',  desc: 'Manage VIPs, pickups, check-ins & badge printing'    },
  { icon: Award,     label: 'Certificates & Badges', desc: 'Instant digital certificates with gold-border theme'  },
  { icon: BarChart2, label: 'Live Analytics',        desc: 'Real-time event insights, ratings & budget tracking'  },
]

const STATS = [
  { value: '50+', label: 'Colleges' },
  { value: '400+', label: 'Attendees' },
  { value: '4', label: 'Days' },
  { value: '8', label: 'Departments' },
]

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    setGoogleLoading(true)
    checkGoogleRedirect()
      .then((result) => {
        if (result) console.log('[LOGIN-PAGE] Google redirect — uid:', result.user.uid)
      })
      .catch((err: any) => {
        const msg = authErrorMessage(err?.code ?? '')
        if (msg) toast.error(msg)
      })
      .finally(() => setGoogleLoading(false))
  }, [])

  async function onSubmit(data: LoginInput) {
    setLoading(true)
    try {
      await loginWithEmail(data.email, data.password)
      router.replace('/events')
    } catch (err: any) {
      const msg = authErrorMessage(err?.code ?? '')
      if (msg) toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    try { await loginWithGoogle() } catch (err: any) {
      const msg = authErrorMessage(err?.code ?? '')
      if (msg) toast.error(msg)
    }
  }

  async function handleForgotPassword() {
    const email = getValues('email')
    if (!email) { toast.error('Enter your email address above first.'); return }
    setResetLoading(true)
    try {
      await resetPassword(email)
      toast.success(`Password reset email sent to ${email}.`)
    } catch (err: any) {
      const code = err?.code ?? ''
      if (code === 'auth/user-not-found') toast.error('No account found with that email.')
      else if (code === 'auth/invalid-email') toast.error('Enter a valid email address.')
      else toast.error('Failed to send reset email. Try again.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg,#060f3a 0%,#0c1a6e 40%,#1a2f8a 70%,#0f2167 100%)' }}
    >
      {/* ── Ambient shapes ───────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 h-125 w-125 rounded-full animate-float"
          style={{ background: 'radial-gradient(circle,rgba(249,115,22,0.18) 0%,transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full animate-float-reverse"
          style={{ background: 'radial-gradient(circle,rgba(99,152,255,0.14) 0%,transparent 70%)' }}
        />
        <div className="absolute bottom-1/4 right-1/4 h-20 w-20 rounded-full border border-orange-400/10 animate-float-reverse" style={{ animationDelay: '1s' }} />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }}
        />
      </div>

      {/* ── LEFT PANEL — Branding (hidden on mobile, shown md+) ─ */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between p-10 xl:p-14 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/40"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
          >
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">KSR Events</p>
            <p className="text-blue-300/50 text-[10px] tracking-widest uppercase mt-0.5">Management Platform</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="space-y-6">
          <div>
            <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-3">
              TECHNOVA 2026 — Now Live
            </p>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Manage every detail of<br />
              <span className="text-orange-400">KSR College events</span><br />
              from one platform.
            </h2>
            <p className="text-blue-200/60 text-sm xl:text-base mt-4 leading-relaxed max-w-sm">
              From guest pickups to live analytics — TECHNOVA 2026 runs on KSR Events.
              Built for K.S. Rangasamy College of Technology, Tiruchengode.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-5">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-extrabold text-white">{value}</p>
                <p className="text-blue-200/50 text-xs">{label}</p>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, label, desc }, i) => (
              <div
                key={label}
                className="flex items-center gap-3 ksr-glass rounded-xl px-4 py-3 animate-slide-in-left"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="h-8 w-8 rounded-lg bg-orange-500/20 border border-orange-500/25 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-orange-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/90 text-sm font-semibold leading-none">{label}</p>
                  <p className="text-blue-200/45 text-xs mt-0.5 leading-snug">{desc}</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-green-400/70 shrink-0 ml-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-blue-200/25 text-xs">
          © 2026 K.S. Rangasamy College of Technology, Tiruchengode, Tamil Nadu
        </p>
      </div>

      {/* ── RIGHT PANEL — Login form ─────────────────────────── */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-105 animate-fade-in-up">

          {/* Mobile-only brand header */}
          <div className="flex flex-col items-center mb-7 lg:hidden">
            <div className="relative mb-4">
              <div
                className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-900/50 animate-pulse-orange"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
              >
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-400 ring-2 ring-[#0c1a6e] flex items-center justify-center">
                <Shield className="h-3 w-3 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">KSR Events</h1>
            <p className="text-blue-200/55 text-sm mt-1 text-center">
              K.S. Rangasamy College of Technology
            </p>
          </div>

          {/* Desktop brand header (inside card area) */}
          <div className="hidden lg:flex items-center gap-2 mb-6">
            <div className="h-2 w-2 rounded-full bg-orange-400" />
            <p className="text-blue-200/50 text-xs tracking-widest uppercase font-medium">Secure Sign In</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-white shadow-2xl shadow-[#060f3a]/60 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0c1a6e]">Welcome back</h2>
              <p className="text-sm text-gray-400 mt-1">Sign in to manage your events</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#0c1a6e] font-semibold text-xs uppercase tracking-wide">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@ksr.edu.in"
                  autoComplete="email"
                  className="border-[#dae3ff] bg-[#f4f7ff] text-[#0c1a6e] placeholder:text-gray-400 focus:border-[#1e3a8a] focus:bg-white transition-colors h-11"
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#0c1a6e] font-semibold text-xs uppercase tracking-wide">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                    className="text-xs text-orange-500 hover:text-orange-600 font-semibold disabled:opacity-50 transition-colors"
                  >
                    {resetLoading ? 'Sending…' : 'Forgot password?'}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="border-[#dae3ff] bg-[#f4f7ff] text-[#0c1a6e] focus:border-[#1e3a8a] focus:bg-white transition-colors h-11 pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1e3a8a] transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-bold tracking-wide text-sm"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign in to KSR Events
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 tracking-widest font-medium">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 font-semibold text-sm"
              onClick={handleGoogle}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </Button>

            <p className="text-center text-sm text-gray-400 mt-5">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-orange-500 hover:text-orange-600 font-bold transition-colors">
                Sign up free
              </Link>
            </p>
          </div>

          <p className="text-center text-[11px] text-blue-200/25 mt-4 lg:hidden">
            © 2026 K.S. Rangasamy College of Technology, Tiruchengode
          </p>
        </div>
      </div>
    </div>
  )
}
