'use client'
// ── F173 · src/components/billing/InvoiceForm.tsx
// Purpose: Invoice line items + notes form (RHF+Zod) — per-line GST%, live totals; patient selected upstream
// In: onSubmit callback, InvoiceFormValues, disabled | Out: InvoiceForm, InvoiceFormValues | See: F171, F025, F012, F193

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

const lineSchema = z.object({
  description: z.string().min(1, 'Description required'),
  amount:      z.coerce.number().positive('Amount must be positive'),
  taxRate:     z.coerce.number().min(0).max(100),
})

const schema = z.object({
  lines: z.array(lineSchema).min(1, 'At least one line item required'),
  notes: z.string().optional(),
})

export type InvoiceFormValues = z.infer<typeof schema>

interface InvoiceFormProps {
  onSubmit:      (data: InvoiceFormValues) => void
  isSubmitting?: boolean
  disabled?:     boolean  // true when no patient is selected
}

const inputCls =
  'rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ' +
  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'

export function InvoiceForm({ onSubmit, isSubmitting, disabled }: InvoiceFormProps) {
  const {
    register, control, handleSubmit, watch,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      lines: [{ description: '', amount: 0, taxRate: 18 }],
      notes: '',
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })
  const lines = watch('lines')

  const subtotal = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0)
  const gst      = lines.reduce((s, l) => s + (Number(l.amount) || 0) * ((Number(l.taxRate) || 0) / 100), 0)
  const total    = subtotal + gst

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Line items */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Line Items</h3>
          <button
            type="button"
            disabled={disabled}
            onClick={() => append({ description: '', amount: 0, taxRate: 18 })}
            className="flex items-center gap-1 text-xs text-info hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="h-3.5 w-3.5" /> Add item
          </button>
        </div>

        {errors.lines?.root && (
          <p className="mb-2 text-[11px] text-danger">{errors.lines.root.message}</p>
        )}

        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_100px_90px_32px] gap-2 px-1">
            {['Description', 'Amount (₹)', 'GST %', ''].map((h) => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {h}
              </span>
            ))}
          </div>

          {fields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-[1fr_100px_90px_32px] items-start gap-2">
              <div className="flex flex-col gap-1">
                <input
                  {...register(`lines.${i}.description`)}
                  placeholder="e.g. Root Canal Treatment"
                  disabled={disabled}
                  className={cn(inputCls, errors.lines?.[i]?.description && 'border-danger', disabled && 'opacity-50')}
                />
                {errors.lines?.[i]?.description && (
                  <p className="text-[11px] text-danger">{errors.lines[i]?.description?.message}</p>
                )}
              </div>
              <input
                {...register(`lines.${i}.amount`)}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                disabled={disabled}
                className={cn(inputCls, 'text-right', errors.lines?.[i]?.amount && 'border-danger', disabled && 'opacity-50')}
              />
              <select
                {...register(`lines.${i}.taxRate`)}
                disabled={disabled}
                className={cn(inputCls, disabled && 'opacity-50')}
              >
                <option value={18}>18% GST</option>
                <option value={0}>0% Exempt</option>
              </select>
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={fields.length === 1 || disabled}
                className="mt-2 text-muted-foreground hover:text-danger disabled:opacity-30"
                aria-label="Remove line"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col items-end gap-1 border-t border-border pt-4">
          <div className="flex w-52 justify-between text-sm text-muted-foreground">
            <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex w-52 justify-between text-sm text-muted-foreground">
            <span>GST</span><span>{formatCurrency(gst)}</span>
          </div>
          <div className="flex w-52 justify-between text-base font-semibold text-foreground">
            <span>Total</span><span>{formatCurrency(total)}</span>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section>
        <label className="mb-1 block text-xs font-medium text-foreground">Notes (optional)</label>
        <textarea
          {...register('notes')}
          rows={2}
          placeholder="Internal notes for this invoice"
          disabled={disabled}
          className={cn(inputCls, 'w-full resize-none', disabled && 'opacity-50')}
        />
      </section>

      <button
        type="submit"
        disabled={isSubmitting || disabled}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating…' : 'Create Invoice'}
      </button>
      {disabled && (
        <p className="text-[11px] text-muted-foreground">Select a patient above to enable the form.</p>
      )}
    </form>
  )
}
