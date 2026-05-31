'use client'
// ── F146 · src/components/patients/PatientForm.tsx
// Purpose: RHF+Zod demographics + medical history form; comma-separated array inputs
// In: defaultValues (PatientFormValues), onSubmit callback | Out: PatientForm, PatientFormValues | See: F141, F149

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'

const schema = z.object({
  // Patient
  name: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit number'),
  dob: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other', '']).optional(),
  email: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  abha_number: z.string().optional(),
  preferred_language: z.enum(['te', 'en']),
  // MedicalHistory (comma-separated — converted to string[] on submit)
  allergies: z.string().optional(),
  conditions: z.string().optional(),
  medications: z.string().optional(),
  medical_notes: z.string().optional(),
})

export type PatientFormValues = z.infer<typeof schema>

interface PatientFormProps {
  defaultValues?: Partial<PatientFormValues>
  onSubmit: (data: PatientFormValues) => void
  isSubmitting?: boolean
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </div>
  )
}

const inputCls =
  'rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50'

export function PatientForm({ defaultValues, onSubmit, isSubmitting }: PatientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      preferred_language: 'te',
      gender: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Demographics */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Demographics</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name?.message} required>
            <input
              {...register('name')}
              placeholder="e.g. Ravi Shankar Reddy"
              className={cn(inputCls, errors.name && 'border-danger focus:ring-danger')}
            />
          </Field>

          <Field label="Phone" error={errors.phone?.message} required>
            <input
              {...register('phone')}
              type="tel"
              placeholder="10-digit mobile number"
              className={cn(inputCls, errors.phone && 'border-danger focus:ring-danger')}
            />
          </Field>

          <Field label="Date of birth" error={errors.dob?.message}>
            <input
              {...register('dob')}
              type="date"
              className={inputCls}
            />
          </Field>

          <Field label="Gender" error={errors.gender?.message}>
            <select {...register('gender')} className={inputCls}>
              <option value="">— Select —</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              placeholder="patient@example.com"
              className={inputCls}
            />
          </Field>

          <Field label="Preferred language" error={errors.preferred_language?.message} required>
            <select {...register('preferred_language')} className={inputCls}>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="en">English</option>
            </select>
          </Field>

          <Field label="Address" error={errors.address?.message}>
            <input
              {...register('address')}
              placeholder="Full address"
              className={inputCls}
            />
          </Field>

          <Field label="Emergency contact" error={errors.emergency_contact?.message}>
            <input
              {...register('emergency_contact')}
              placeholder="Name — Phone"
              className={inputCls}
            />
          </Field>

          <Field label="ABHA number" error={errors.abha_number?.message}>
            <input
              {...register('abha_number')}
              placeholder="14-digit ABHA number"
              className={cn(inputCls, 'font-mono')}
            />
          </Field>
        </div>
      </section>

      {/* Medical history */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Medical History</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Separate multiple entries with commas.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Allergies" error={errors.allergies?.message}>
            <input
              {...register('allergies')}
              placeholder="e.g. Penicillin, Latex"
              className={inputCls}
            />
          </Field>

          <Field label="Medical conditions" error={errors.conditions?.message}>
            <input
              {...register('conditions')}
              placeholder="e.g. Diabetes, Hypertension"
              className={inputCls}
            />
          </Field>

          <Field label="Current medications" error={errors.medications?.message}>
            <input
              {...register('medications')}
              placeholder="e.g. Metformin 500mg"
              className={inputCls}
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Additional notes" error={errors.medical_notes?.message}>
            <textarea
              {...register('medical_notes')}
              rows={3}
              placeholder="Any other relevant medical information"
              className={cn(inputCls, 'resize-none')}
            />
          </Field>
        </div>
      </section>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving…' : 'Save Patient'}
      </button>
    </form>
  )
}
