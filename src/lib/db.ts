// ── F010 · src/lib/db.ts
// Purpose: Prisma client singleton — prevents multiple instances during Next.js hot-reload
// In: DATABASE_URL (env) | Out: prisma (PrismaClient) | See: F002, F004
import { PrismaClient } from '@prisma/client'

// Prisma client singleton — re-using in dev avoids exhausting connections on hot-reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
