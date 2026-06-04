// ── F205 · src/app/api/feedback/route.ts
// Purpose: GET feedback list + summary + POST new feedback entry
// In: veda_session (F011), ?patientId=&summary=1 | Out: PatientFeedback[] | See: F010, F011

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

export async function GET(request: Request) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patientId')
  const summary   = searchParams.get('summary') === '1'

  if (summary) {
    const feedbacks = await prisma.patientFeedback.findMany({
      orderBy: { submittedAt: 'desc' },
      include: { patient: { select: { id: true, name: true } } },
    })

    if (feedbacks.length === 0) {
      return NextResponse.json({
        total: 0, avgRating: 0, lowRatingCount: 0,
        avgByCategory: {},
        ratingTrend: [],
        recent: [],
        lowRatingAlerts: [],
      })
    }

    const avg = (nums: (number | null)[]) => {
      const valid = nums.filter((n): n is number => n !== null)
      return valid.length > 0 ? Math.round((valid.reduce((s, n) => s + n, 0) / valid.length) * 10) / 10 : null
    }

    const avgRating          = avg(feedbacks.map(f => f.rating))!
    const avgTreatment       = avg(feedbacks.map(f => f.treatmentRating))
    const avgStaff           = avg(feedbacks.map(f => f.staffRating))
    const avgWaitTime        = avg(feedbacks.map(f => f.waitTimeRating))
    const avgCleanliness     = avg(feedbacks.map(f => f.cleanlinessRating))
    const avgValue           = avg(feedbacks.map(f => f.valueRating))

    // 6-month trend
    const now = new Date()
    const IST_MS = 5.5 * 60 * 60 * 1000
    const ist = new Date(now.getTime() + IST_MS)
    const yr = ist.getUTCFullYear(), mo = ist.getUTCMonth()

    const monthLabel = (y: number, m: number) =>
      new Date(Date.UTC(y, m, 1)).toLocaleDateString('en-IN', { month: 'short', year: '2-digit', timeZone: 'UTC' })

    const trendMap: Record<string, number[]> = {}
    for (let i = 5; i >= 0; i--) trendMap[monthLabel(yr, mo - i)] = []

    for (const f of feedbacks) {
      const fi = new Date(f.submittedAt.getTime() + IST_MS)
      const key = monthLabel(fi.getUTCFullYear(), fi.getUTCMonth())
      if (key in trendMap) trendMap[key].push(f.rating)
    }

    const ratingTrend = Object.entries(trendMap).map(([month, ratings]) => ({
      month,
      avg:   ratings.length > 0 ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10 : null,
      count: ratings.length,
    }))

    const low = feedbacks.filter(f => f.rating <= 2)

    return NextResponse.json({
      total:       feedbacks.length,
      avgRating,
      lowRatingCount: low.length,
      avgByCategory: {
        treatment:   avgTreatment,
        staff:       avgStaff,
        waitTime:    avgWaitTime,
        cleanliness: avgCleanliness,
        value:       avgValue,
      },
      ratingTrend,
      recent: feedbacks.slice(0, 10).map(f => ({
        id: f.id, patientId: f.patientId, patientName: f.patient.name,
        rating: f.rating, comment: f.comment, submittedAt: f.submittedAt,
      })),
      lowRatingAlerts: low.slice(0, 5).map(f => ({
        id: f.id, patientId: f.patientId, patientName: f.patient.name,
        rating: f.rating, comment: f.comment, submittedAt: f.submittedAt,
      })),
    })
  }

  // Plain list (per-patient or all)
  const feedbacks = await prisma.patientFeedback.findMany({
    where: patientId ? { patientId } : {},
    orderBy: { submittedAt: 'desc' },
    include: { patient: { select: { id: true, name: true } } },
  })

  return NextResponse.json(feedbacks)
}

export async function POST(request: Request) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as {
    patientId: string
    appointmentId?: string
    rating: number
    treatmentRating?: number
    staffRating?: number
    waitTimeRating?: number
    cleanlinessRating?: number
    valueRating?: number
    comment?: string
  }

  if (!body.patientId || !body.rating || body.rating < 1 || body.rating > 5) {
    return NextResponse.json({ error: 'patientId and rating (1–5) required' }, { status: 400 })
  }

  const feedback = await prisma.patientFeedback.create({
    data: {
      patientId:         body.patientId,
      appointmentId:     body.appointmentId ?? null,
      rating:            body.rating,
      treatmentRating:   body.treatmentRating ?? null,
      staffRating:       body.staffRating ?? null,
      waitTimeRating:    body.waitTimeRating ?? null,
      cleanlinessRating: body.cleanlinessRating ?? null,
      valueRating:       body.valueRating ?? null,
      comment:           body.comment ?? null,
    },
    include: { patient: { select: { id: true, name: true } } },
  })

  return NextResponse.json(feedback, { status: 201 })
}
