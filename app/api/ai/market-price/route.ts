import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  try {
    const { brand, model, category, condition, specs, buy_price, market_price } = await request.json()
    if (!brand || !model) {
      return NextResponse.json({ error: 'brand and model required' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    const client = new Anthropic({ apiKey })

    const specsStr = specs?.length > 0 ? specs.join(', ') : ''
    const deviceDesc = [brand, model, specsStr].filter(Boolean).join(' ')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      tools: [{ type: 'web_search_20250305' as any, name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Ти — експерт з оцінки вживаної техніки в Україні. Зроби повний аналітичний звіт для менеджера магазину.

Пристрій: ${deviceDesc}
Категорія: ${category || ''}
${specsStr ? `Характеристики: ${specsStr}` : ''}
Стан: ${condition || 'невідомо'}
${buy_price ? `Менеджер планує купити за: ₴${buy_price}` : ''}
${market_price ? `Вказана ринкова ціна: ₴${market_price}` : ''}

Знайди в інтернеті актуальні ціни і дай повний звіт ТІЛЬКИ у форматі JSON:
{
  "new_price": 25000,
  "used_price": 16000,
  "avg_resale_price": 18000,
  "price_range_used": "від 13000 до 18000₴",
  "popularity": "висока",
  "popularity_reason": "популярна модель, швидко продається",
  "days_to_sell": "3-7 днів",
  "recommendation": "buy",
  "recommendation_text": "Рекомендується купити — ліквідний товар, маржа хороша",
  "margin_estimate": "₴3,500-4,500 при перепродажу",
  "risks": "Перевірити Face ID та Touch ID перед покупкою",
  "market_trend": "ціна стабільна, попит рівномірний",
  "sources_new": ["rozetka.com.ua — 24500-25500₴"],
  "sources_used": ["OLX — 14 оголошень від 13000 до 18000₴"],
  "tip": "практична порада для менеджера"
}

recommendation має бути: "buy" (купувати), "caution" (обережно), або "reject" (не купувати).
Якщо не знайшов якесь значення — постав null. ТІЛЬКИ JSON у відповіді без зайвого тексту.`,
      }],
    })

    let text = ''
    for (const block of message.content) {
      if (block.type === 'text') text += block.text
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse AI response', raw: text }, { status: 500 })
    }

    const data = JSON.parse(jsonMatch[0])
    return NextResponse.json({ ...data, device: deviceDesc, condition })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
