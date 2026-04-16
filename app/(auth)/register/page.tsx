'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterInput } from '@/lib/validations'
import { registerWithEmail } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Building2, Loader2, UserPlus, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterInput) {
    setLoading(true)
    try {
      await registerWithEmail(data.email, data.password, data.displayName)
      toast.success('Account created! Welcome to KSR Events.')
      router.replace('/events')
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 sm:p-6"
      style={{ background: 'linear-gradient(145deg,#060f3a 0%,#0c1a6e 40%,#1a2f8a 70%,#0f2167 100%)' }}
    >
      {/* Ambient shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 h-125 w-125 rounded-full animate-float"
          style={{ background: 'radial-gradient(circle,rgba(249,115,22,0.15) 0%,transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full animate-float-reverse"
          style={{ background: 'radial-gradient(circle,rgba(99,152,255,0.12) 0%,transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }}
        />
      </div>

      <div className="w-full max-w-105 animate-fade-in-up relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-7">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-900/50 mb-4 animate-pulse-orange"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
          >
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">KSR Events</h1>
          <p className="text-blue-200/55 text-sm mt-1">K.S. Rangasamy College of Technology</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-2xl shadow-[#060f3a]/60 p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#eef3ff] flex items-center justify-center shrink-0">
              <UserPlus className="h-4 w-4 text-[#1e3a8a]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0c1a6e]">Create account</h2>
              <p className="text-xs text-gray-400">Start managing events today</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-[#0c1a6e] font-semibold text-xs uppercase tracking-wide">
                Full Name
              </Label>
              <Input
                id="displayName"
                placeholder="Dr. / Mr. / Ms. Full Name"
                autoComplete="name"
                className="border-[#dae3ff] bg-[#f4f7ff] text-[#0c1a6e] placeholder:text-gray-400 focus:border-[#1e3a8a] focus:bg-white transition-colors h-11"
                {...register('displayName')}
              />
              {errors.displayName && <p className="text-xs text-red-500">{errors.displayName.message}</p>}
            </div>

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
              <Label htmlFor="password" className="text-[#0c1a6e] font-semibold text-xs uppercase tracking-wide">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-[#0c1a6e] font-semibold text-xs uppercase tracking-wide">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className="border-[#dae3ff] bg-[#f4f7ff] text-[#0c1a6e] focus:border-[#1e3a8a] focus:bg-white transition-colors h-11 pr-10"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1e3a8a] transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full h-11 font-bold tracking-wide text-sm" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-500 hover:text-orange-600 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-[11px] text-blue-200/25 mt-4">
          © 2026 K.S. Rangasamy College of Technology, Tiruchengode
        </p>
      </div>
    </div>
  )
}
