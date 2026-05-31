'use client'
// ── F110 · src/app/(auth)/login/page.tsx
// Purpose: Login form (RHF+Zod) — LoginForm wrapped in Suspense for useSearchParams safety
// In: POST /api/auth/login (F050), ?next= param | Out: LoginPage | See: F050, F011, F101

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CLINIC_NAME } from '@/constants/clinic'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginValues = z.infer<typeof schema>

const inputCls =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(schema) })

  async function onSubmit(data: LoginValues) {
    setServerError(null)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setServerError(body.error ?? 'Sign in failed. Please try again.')
      return
    }

    const next = params.get('next') ?? '/dashboard'
    router.push(next)
    router.refresh()
  }

  return (
    <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
      <h2 className="mb-5 text-sm font-semibold text-foreground">Sign in to your account</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-foreground">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@vedadental.in"
            autoComplete="email"
            className={cn(inputCls, errors.email && 'border-danger focus:ring-danger')}
          />
          {errors.email && (
            <p className="text-[11px] text-danger">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-foreground">Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className={cn(inputCls, 'pr-10', errors.password && 'border-danger focus:ring-danger')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-danger">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <div className="rounded-md bg-danger-bg px-3 py-2 text-xs text-danger">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold">
          V
        </div>
        <h1 className="text-xl font-semibold text-foreground">VEDA Dental PMS</h1>
        <p className="mt-1 text-xs text-muted-foreground">{CLINIC_NAME}</p>
      </div>

      <Suspense fallback={<div className="rounded-xl border border-border bg-background p-6 h-48" />}>
        <LoginForm />
      </Suspense>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        VEDA Dental PMS · Authorised staff only
      </p>
    </div>
  )
}
