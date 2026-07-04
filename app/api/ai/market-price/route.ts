import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  try {
    const { brand, model, category, condition, specs, buy_price, market_price } = await request.json()
    if (!brand || !model) {
      return NextResponse.json({ error: 'Вкажіть Бренд і Модель' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI не налаштовано: відсутній ANTHROPIC_API_KEY в Vercel' }, { status: 500 })
    }

    const client = new Anthropic({ apiKey })

    const specsStr = Array.isArray(specs) && specs.length > 0 ? specs.join(', ') : ''
    const deviceDesc = [brand, model, specsStr].filter(Boolean).join(' ')

    const prompt = [
      'Ти — експерт з оцінки вживаної техніки в Україні. Зроби аналіз для менеджера магазину.',
      '',
      'ПРИСТРІЙ: ' + deviceDesc,
      'Категорія: ' + (category || ''),
      condition ? ('Стан: ' + condition) : '',
      buy_price ? ('Планована ціна покупки: ₴' + buy_price) : '',
      market_price ? ('Вказана ринкова ціна: ₴' + market_price) : '',
      '',
      'Знайди актуальні ціни в Україні на цей пристрій (OLX, Rozetka, Allo, Hotline).',
      'Дай відповідь ТІЛЬКИ у форматі JSON (без зайвого тексту):',
      '{',
      '  "new_price": 32000,',
      '  "used_price": 21000,',
      '  "avg_resale_price": 23000,',
      '  "price_range_used": "від 18000 до 27000₴",',
      '  "popularity": "висока",',
      '  "popularity_reason": "причина",',
      '  "days_to_sell": "5-10 днів",',
      '  "recommendation": "buy",',
      '  "recommendation_text": "пояснення рекомендації",',
      '  "margin_estimate": "₴2000-3000 при перепродажу",',
      '  "risks": "що перевірити перед покупкою",',
      '  "market_trend": "як змінюється ціна",',
      '  "sources_new": ["rozetka.com.ua — ціна"],',
      '  "sources_used": ["OLX — кількість оголошень і ціни"],',
      '  "tip": "конкретна порада менеджеру"',
      '}',
      '',
      'recommendation: "buy" = купувати, "caution" = обережно, "reject" = не купувати.',
      'ТІЛЬКИ JSON у відповіді.',
    ].filter(s => s !== null).join('\n')

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      tools: [{ type: 'web_search_20250305' as any, name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }],
    })

    let text = ''
    for (const block of message.content) {
      if (block.type === 'text') text += block.text
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI не повернув коректну відповідь', raw: text.slice(0, 200) }, { status: 500 })
    }

    const data = JSON.parse(jsonMatch[0])
    return NextResponse.json({ ...data, device: deviceDesc, condition })

  } catch (e: any) {
    console.error('AI error:', e?.message, e?.status)
    return NextResponse.json({
      error: e?.message || 'Помилка AI',
      status_code: e?.status,
    }, { status: 500 })
  }
}
