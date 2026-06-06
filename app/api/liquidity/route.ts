import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const raw = await response.json()

  // Extract text content
  const textBlock = raw.content?.find((b: any) => b.type === 'text')
  const text = textBlock?.text || ''

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({
      score: 'unknown', days_to_sell: '—', demand_level: 'Не вдалось визначити',
      recommendation: 'caution', recommendation_text: 'Проведіть власний аналіз ринку.',
      insight: 'Не вдалось отримати дані.', price_trend: 'stable',
      error: 'parse_error'
    })
  }

  try {
    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({
      score: 'unknown', days_to_sell: '—', demand_level: 'Помилка аналізу',
      recommendation: 'caution', recommendation_text: 'Проведіть власний аналіз.',
      insight: text.slice(0, 200), price_trend: 'stable'
    })
  }
}
