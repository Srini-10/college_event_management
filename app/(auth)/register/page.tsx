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
import { Building2, Loader2, UserPlus } from 'lucide-react'
import { useState } from 'react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-4"
      style={{ background: 'linear-gradient(145deg,#060f3a 0%,#0c1a6e 40%,#1a2f8a 70%,#0f2167 100%)' }}
    >
      {/* Ambient shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -right-32 h-120 w-120 rounded-full animate-float"
          style={{ background: 'radial-gradient(circle,rgba(249,115,22,0.15) 0%,transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full animate-float-reverse"
          style={{ background: 'radial-gradient(circle,rgba(99,152,255,0.12) 0%,transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize:'28px 28px' }}
        />
      </div>

      <div className="w-full max-w-100 animate-fade-in-up">
        {/* Brand */}
        <div className="flex flex-col items-center mb-7">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-900/50 mb-4"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
          >
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">KSR Events</h1>
          <p className="text-blue-200/55 text-sm mt-1">K.S. Rangasamy College of Technology</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-2xl shadow-[#060f3a]/60 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#eef3ff] flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-[#1e3a8a]" />
            </div>
            <div>
              <h2 className="text-[18px] font-extrabold text-[#0c1a6e]">Create account</h2>
              <p className="text-xs text-gray-400">Start managing events today</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-[#0c1a6e] font-semibold text-xs uppercase tracking-wide">
                Full Name
              </Label>
              <Input
                id="displayName"
                placeholder="Dr. / Mr. / Ms. Full Name"
                className="border-[#dae3ff] bg-[#f4f7ff] text-[#0c1a6e] placeholder:text-gray-400 focus:border-[#1e3a8a] focus:bg-white transition-colors h-10"
                {...register('displayName')}
              />
              {errors.displayName && <p className="text-xs text-red-500">{errors.displayName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#0c1a6e] font-semibold text-xs uppercase tracking-wide">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@ksr.edu.in"
                className="border-[#dae3ff] bg-[#f4f7ff] text-[#0c1a6e] placeholder:text-gray-400 focus:border-[#1e3a8a] focus:bg-white transition-colors h-10"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[#0c1a6e] font-semibold text-xs uppercase tracking-wide">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 6 chars"
                  className="border-[#dae3ff] bg-[#f4f7ff] focus:border-[#1e3a8a] focus:bg-white transition-colors h-10"
                  {...register('password')}
                />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-[#0c1a6e] font-semibold text-xs uppercase tracking-wide">
                  Confirm
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat"
                  className="border-[#dae3ff] bg-[#f4f7ff] focus:border-[#1e3a8a] focus:bg-white transition-colors h-10"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full h-10 font-bold tracking-wide" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-500 hover:text-orange-600 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-[11px] text-blue-200/30 mt-5">
          © 2026 K.S. Rangasamy College of Technology, Tiruchengode, India
        </p>
      </div>
    </div>
  )
}
