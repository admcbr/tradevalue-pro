import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Simple in-memory rate limiter (resets on server restart)
const rateLimits = new Map<string, { count: number; resetAt: number }>()
const MAX_REQUESTS = 10 // per window
const WINDOW_MS = 60 * 1000 // 1 minute

export async function POST(req: NextRequest) {
  // Verify user is authenticated
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.split(' ')[1]
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit per user
  const now = Date.now()
  const userLimit = rateLimits.get(user.id)
  if (userLimit) {
    if (now < userLimit.resetAt) {
      if (userLimit.count >= MAX_REQUESTS) {
        return NextResponse.json({ error: 'Rate limit exceeded. Try again in a minute.' }, { status: 429 })
      }
      userLimit.count++
    } else {
      rateLimits.set(user.id, { count: 1, resetAt: now + WINDOW_MS })
    }
  } else {
    rateLimits.set(user.id, { count: 1, resetAt: now + WINDOW_MS })
  }

  const { prompt } = await req.json()

  // Sanitize prompt - limit length
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
  }
  const sanitizedPrompt = prompt.slice(0, 500) // max 500 chars

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: sanitizedPrompt }],
    }),
  })

  const raw = await response.json()
  const textBlock = raw.content?.find((b: any) => b.type === 'text')
  const text = textBlock?.text || ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)

  if (!jsonMatch) {
    return NextResponse.json({
      score: 'unknown', days_to_sell: '—', demand_level: 'Не вдалось визначити',
      recommendation: 'caution', recommendation_text: 'Проведіть власний аналіз ринку.',
      insight: 'Не вдалось отримати дані.', price_trend: 'stable', error: 'parse_error'
    })
  }

  try {
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch {
    return NextResponse.json({
      score: 'unknown', days_to_sell: '—', demand_level: 'Помилка аналізу',
      recommendation: 'caution', recommendation_text: 'Проведіть власний аналіз.',
      insight: text.slice(0, 200), price_trend: 'stable'
    })
  }
}
