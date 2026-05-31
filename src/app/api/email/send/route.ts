// ── F075 · src/app/api/email/send/route.ts
// Purpose: POST transactional email stub — no external service used; returns ok (stub)
// In: veda_session | Out: 501 | See: F011
export async function POST() { return Response.json({ error: 'not implemented' }, { status: 501 }) }
