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

    // Build precise device description from all specs
    const specsStr = specs?.length > 0 ? specs.join(', ') : ''
    const deviceDesc = [brand, model, specsStr].filter(Boolean).join(' ')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      tools: [{ type: 'web_search_20250305' as any, name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Ти — експерт з оцінки вживаної техніки в Україні. Зроби аналіз для менеджера магазину.

ТОЧНІ ХАРАКТЕРИСТИКИ ПРИСТРОЮ:
- Бренд/Модель: ${brand} ${model}
- Категорія: ${category || ''}
${specsStr ? `- Характеристики: ${specsStr}` : ''}
- Стан: ${condition || 'не вказано'}
${buy_price ? `- Планована ціна покупки: ₴${buy_price}` : ''}
${market_price ? `- Вказана ринкова ціна: ₴${market_price}` : ''}

ВАЖЛИВО: Шукай ціну САМЕ ЦІЄї конфігурації з урахуванням всіх характеристик (${specsStr || 'базова конфігурація'}).
Якщо такої точної конфігурації немає — знайди найближчу і вкажи різницю в note.

Зроби пошук і дай відповідь ТІЛЬКИ у форматі JSON:
{
  "new_price": 32000,
  "used_price": 21000,
  "avg_resale_price": 23000,
  "price_range_used": "від 18000 до 27000₴",
  "popularity": "висока",
  "popularity_reason": "детальна причина чому популярна або не популярна",
  "days_to_sell": "5-10 днів",
  "recommendation": "buy",
  "recommendation_text": "Рекомендується купити — детальне пояснення",
  "margin_estimate": "₴2000-3000 при перепродажу",
  "risks": "Що перевірити перед покупкою цього конкретного пристрою",
  "market_trend": "як змінюється ціна на цю конфігурацію",
  "sources_new": ["rozetka.com.ua — ${brand} ${model} ${specsStr}: 31000-33000₴"],
  "sources_used": ["OLX — 12 оголошень від 18000 до 27000₴"],
  "tip": "конкретна порада для цієї конфігурації",
  "device": "${deviceDesc}"
}

recommendation: "buy" = купувати, "caution" = обережно, "reject" = не купувати.
ТІЛЬКИ JSON без зайвого тексту.`,
      }],
    })

    let text = ''
    for (const block of message.content) {
      if (block.type === 'text') text += block.text
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 })
    }

    const data = JSON.parse(jsonMatch[0])
    return NextResponse.json({ ...data, device: deviceDesc, condition })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
