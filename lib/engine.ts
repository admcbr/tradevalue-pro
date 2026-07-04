import type { Category, EstimationResult, ImpactType } from './types'

export function formatMoney(n: number) {
  return Math.round(n).toLocaleString('uk-UA') + ' ₴'
}

export const STATUS_LABELS: Record<string, string> = {
  good: 'Варто купити', caution: 'Обережно',
  rejected: 'Не купувати', not_evaluated: 'Не оцінюється',
}
export const DEAL_STATUS_LABELS: Record<string, string> = {
  estimated: 'Оцінено', bought: 'Куплено', refused: 'Відмовлено', sold: 'Продано',
}

function applyImpact(price: number, type: ImpactType, value: number): number {
  if (type === 'add_amount')   return price + value
  if (type === 'sub_amount')   return price - value
  if (type === 'add_percent')  return price * (1 + value / 100)
  if (type === 'sub_percent')  return price * (1 - value / 100)
  return price
}

function blocked(reason: string): EstimationResult {
  return { status: 'not_evaluated', buy_price: 0, sell_price: 0, profit: 0, profitability: 0, explanation: [], blocked_reason: reason }
}

export interface EstimationInput {
  category: Category
  field_values: Record<string, string>      // field_id → value or option name
  completeness_present: string[]            // ids of completeness items PRESENT
  market_price: number
  company_price_ranges?: { id: string; from: number; to: number; buy_percent: number }[]
  eval_type: 'buyout' | 'tradein'
  tradein_bonus_percent: number
}

export function calculate(input: EstimationInput): EstimationResult {
  const { category, field_values, completeness_present, market_price, eval_type, tradein_bonus_percent } = input
  const explanation: string[] = []

  // ── Price limits ─────────────────────────────────────────────────────────────
  const rules = category.rules
  if (market_price < rules.min_market_price)
    return blocked(`Ринкова ціна (${formatMoney(market_price)}) нижча за мінімум категорії (${formatMoney(rules.min_market_price)}).`)
  if (market_price > rules.max_market_price)
    return blocked(`Ринкова ціна (${formatMoney(market_price)}) перевищує ліміт категорії (${formatMoney(rules.max_market_price)}).`)

  // ── Blocked brands/models ────────────────────────────────────────────────────
  const brandField = category.fields.find(f => f.name === 'Бренд' || f.name === 'Виробник')
  if (brandField) {
    const brand = field_values[brandField.id] || ''
    if (category.blocked_brands.some(b => b.toLowerCase() === brand.toLowerCase()))
      return blocked(`Бренд "${brand}" не приймається за правилами компанії.`)
  }
  const modelField = category.fields.find(f => f.name === 'Модель' || f.name === 'Модель GPU')
  if (modelField) {
    const model = field_values[modelField.id] || ''
    const hit = category.blocked_models.find(m => model.toLowerCase().includes(m.toLowerCase()))
    if (hit) return blocked(`Модель "${hit}" не приймається за правилами компанії.`)
  }

  // ── Buy percent ──────────────────────────────────────────────────────────────
  // Apply price range override from company rules if available
  let buyPct = rules.buy_percent
  if (input.company_price_ranges && input.company_price_ranges.length > 0) {
    const matchedRange = input.company_price_ranges
      .filter(r => market_price >= r.from && (r.to === 0 || market_price < r.to))
      .sort((a, b) => b.from - a.from)[0]
    if (matchedRange) {
      buyPct = matchedRange.buy_percent
    }
  }
  if (eval_type === 'tradein' && tradein_bonus_percent > 0) {
    buyPct = Math.max(0, buyPct - tradein_bonus_percent)
    explanation.push(`Тип: Трейд-Ін — купуємо на ${buyPct}% нижче ринку (+${tradein_bonus_percent}% бонус клієнту).`)
  } else {
    explanation.push(`Базове правило категорії "${category.name}": купуємо на ${buyPct}% нижче ринку.`)
  }

  let buyPrice = market_price * (1 - buyPct / 100)

  // ── Field options impacts ─────────────────────────────────────────────────────
  for (const field of category.fields) {
    if (!field.affects_price) continue
    const val = field_values[field.id]
    if (!val) continue

    if (field.type === 'number') {
      // Special: battery health rule
      const num = parseFloat(val)
      if (!isNaN(num) && field.name.toLowerCase().includes('батарея') || field.name.toLowerCase().includes('батареї')) {
        if (num < 70) {
          buyPrice -= 1500
          explanation.push(`Здоров'я батареї ${num}% (менше 70%): −1 500 ₴`)
        } else if (num < 80) {
          buyPrice -= 500
          explanation.push(`Здоров'я батареї ${num}% (менше 80%): −500 ₴`)
        }
      }
      continue
    }

    const option = field.options.find(o => o.name === val)
    if (!option) continue

    if (option.block_estimation)
      return blocked(`${field.name}: "${val}" — товар не підлягає оцінці.`)

    if (option.impact_type !== 'none') {
      const before = buyPrice
      buyPrice = applyImpact(buyPrice, option.impact_type, option.impact_value)
      const diff = Math.round(buyPrice - before)
      const sign = diff > 0 ? '+' : ''
      let label = ''
      if (option.impact_type === 'add_percent') label = `${field.name} "${val}": +${option.impact_value}%`
      else if (option.impact_type === 'sub_percent') label = `${field.name} "${val}": −${option.impact_value}%`
      else label = `${field.name} "${val}": ${sign}${Math.abs(diff).toLocaleString('uk-UA')} ₴`
      explanation.push(label)
    }
  }

  // ── Completeness impacts ──────────────────────────────────────────────────────
  for (const item of category.completeness) {
    if (!item.is_active) continue
    const isPresent = completeness_present.includes(item.id)

    // If item blocks on absence and it's absent → reject
    if (item.block_estimation && !isPresent)
      return blocked(`Відсутній обов'язковий пункт комплектності: "${item.name}".`)

    if (item.impact_type === 'none') continue

    // sub_amount / block = penalty for ABSENCE; add_amount = bonus for PRESENCE
    const isBonus = item.impact_type === 'add_amount' || item.impact_type === 'add_percent'

    if (isBonus && isPresent) {
      buyPrice = applyImpact(buyPrice, item.impact_type, item.impact_value)
      explanation.push(`Є ${item.name}: +${item.impact_value.toLocaleString('uk-UA')} ₴`)
    } else if (!isBonus && !isPresent) {
      buyPrice = applyImpact(buyPrice, item.impact_type, item.impact_value)
      explanation.push(`Відсутній ${item.name.toLowerCase()}: −${item.impact_value.toLocaleString('uk-UA')} ₴`)
    }
  }

  buyPrice = Math.max(0, Math.round(buyPrice))
  const sellPrice = Math.round(market_price * (1 + rules.sell_percent / 100))
  const profit = sellPrice - buyPrice
  const profitability = buyPrice > 0 ? Math.round((profit / buyPrice) * 100) : 0

  // ── Status warnings ───────────────────────────────────────────────────────────
  const warnings: string[] = []
  if (buyPrice < rules.min_buy_price)
    warnings.push(`Ціна викупу (${formatMoney(buyPrice)}) нижча за мінімум компанії (${formatMoney(rules.min_buy_price)}).`)
  if (buyPrice > rules.max_buy_price)
    warnings.push(`Ціна викупу (${formatMoney(buyPrice)}) перевищує ліміт компанії (${formatMoney(rules.max_buy_price)}).`)

  return {
    status: warnings.length > 0 ? 'caution' : 'good',
    buy_price: buyPrice, sell_price: sellPrice, profit, profitability,
    explanation: [...explanation, ...warnings.map(w => `⚠ ${w}`)],
  }
}
