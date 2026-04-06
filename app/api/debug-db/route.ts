// app/api/debug-db/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const url = process.env.DATABASE_URL
  
  return NextResponse.json({
    databaseUrl: url ? url.substring(0, 30) + '...' : 'NOT SET',
    provider: url?.startsWith('postgresql') ? 'postgresql' : 
              url?.startsWith('file:') ? 'sqlite' : 
              'unknown',
    fullUrlHint: url?.split('@')[1] ?? 'no host found', // shows host without credentials
  })
}