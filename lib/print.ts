// Invoice / print utility
import type { Estimation } from '@/types'
import { formatMoney } from './engine'

export function printInvoice(estimation: Estimation, evaluatorName: string, companyName: string) {
  const conditionLabels: Record<string, string> = {
    Aplus: 'A+ (як новий)', A: 'A (відмінний)', B: 'B (добрий)', C: 'C (задовільний)', D: 'D (поганий)',
  }
  const completenessLabels: Record<string, string> = {
    charger: 'Зарядний пристрій', box: 'Коробка', docs: 'Документи', warranty: 'Гарантія', bag: 'Сумка',
  }
  const completenessStr = Array.isArray(estimation.completeness)
    ? estimation.completeness.map(k => completenessLabels[k] || k).join(', ') || 'Відсутня'
    : '—'

  const date = new Date(estimation.created_at)
  const dateStr = date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timeStr = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
  const invoiceNum = `TVP-${estimation.id.slice(-6).toUpperCase()}`

  const isTradeIn = (estimation as any).evaluation_type === 'tradein'

  const html = `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8">
<title>Накладна ${invoiceNum}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; color: #111; background: #fff; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #111; }
  .company-name { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
  .company-sub { font-size: 12px; color: #666; margin-top: 4px; }
  .invoice-title { text-align: right; }
  .invoice-title h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #666; }
  .invoice-title .num { font-size: 22px; font-weight: 800; color: #111; margin-top: 4px; }
  .badge { display: inline-flex; padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 6px; }
  .badge-buy { background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; }
  .badge-trade { background: #F0FDF4; color: #166534; border: 1px solid #BBF7D0; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
  .meta-block { background: #F9F9F9; border-radius: 10px; padding: 16px; }
  .meta-label { font-size: 10px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; }
  .meta-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .meta-key { font-size: 12px; color: #666; }
  .meta-val { font-size: 12px; font-weight: 600; color: #111; }
  .device-section { background: #111; color: #fff; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; }
  .device-name { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
  .device-cat { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 4px; }
  .prices { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 24px; }
  .price-box { border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 16px; }
  .price-label { font-size: 10px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
  .price-val { font-size: 22px; font-weight: 800; }
  .price-val.buy { color: #1D4ED8; }
  .price-val.sell { color: #16A34A; }
  .price-val.profit { color: #D97706; }
  .explanation { border: 1px solid #E5E7EB; border-radius: 10px; padding: 16px; margin-bottom: 24px; }
  .exp-title { font-size: 11px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; }
  .exp-item { display: flex; gap: 8px; font-size: 12px; color: #555; margin-bottom: 6px; align-items: flex-start; }
  .exp-dot { width: 5px; height: 5px; border-radius: 50%; background: #6366F1; margin-top: 4px; flex-shrink: 0; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 32px; }
  .sign-block { border-top: 1.5px solid #111; padding-top: 12px; }
  .sign-label { font-size: 11px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
  .sign-name { font-size: 13px; font-weight: 600; }
  .sign-line { height: 40px; border-bottom: 1px dashed #ccc; margin: 12px 0; }
  .footer { margin-top: 32px; text-align: center; font-size: 10px; color: #999; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="company-name">${companyName}</div>
    <div class="company-sub">TradeValue Pro · Система оцінки б/у техніки</div>
  </div>
  <div class="invoice-title">
    <h2>Акт ${isTradeIn ? 'Трейд-Ін' : 'Викупу'}</h2>
    <div class="num">${invoiceNum}</div>
    <div><span class="badge ${isTradeIn ? 'badge-trade' : 'badge-buy'}">${isTradeIn ? 'Trade-In' : 'Викуп'}</span></div>
  </div>
</div>

<div class="meta">
  <div class="meta-block">
    <div class="meta-label">Інформація про оцінку</div>
    <div class="meta-row"><span class="meta-key">Дата</span><span class="meta-val">${dateStr}</span></div>
    <div class="meta-row"><span class="meta-key">Час</span><span class="meta-val">${timeStr}</span></div>
    <div class="meta-row"><span class="meta-key">Оцінив</span><span class="meta-val">${evaluatorName}</span></div>
    <div class="meta-row"><span class="meta-key">Номер акту</span><span class="meta-val">${invoiceNum}</span></div>
  </div>
  <div class="meta-block">
    <div class="meta-label">Характеристики</div>
    <div class="meta-row"><span class="meta-key">Категорія</span><span class="meta-val">${estimation.category}</span></div>
    <div class="meta-row"><span class="meta-key">Стан</span><span class="meta-val">${conditionLabels[estimation.condition] || estimation.condition}</span></div>
    <div class="meta-row"><span class="meta-key">Комплектність</span><span class="meta-val">${completenessStr}</span></div>
    ${estimation.ram ? `<div class="meta-row"><span class="meta-key">RAM</span><span class="meta-val">${estimation.ram}</span></div>` : ''}
    ${estimation.storage ? `<div class="meta-row"><span class="meta-key">Накопичувач</span><span class="meta-val">${estimation.storage}</span></div>` : ''}
  </div>
</div>

<div class="device-section">
  <div class="device-name">${estimation.brand} ${estimation.model}</div>
  <div class="device-cat">${estimation.category} · ${estimation.cpu || ''} ${estimation.gpu ? '· ' + estimation.gpu : ''}</div>
</div>

<div class="prices">
  <div class="price-box">
    <div class="price-label">Ринкова ціна</div>
    <div class="price-val">${formatMoney(estimation.market_price)}</div>
  </div>
  <div class="price-box">
    <div class="price-label">${isTradeIn ? 'Трейд-Ін вартість' : 'Ціна викупу'}</div>
    <div class="price-val buy">${formatMoney(estimation.buy_price)}</div>
  </div>
  <div class="price-box">
    <div class="price-label">Очікуваний прибуток</div>
    <div class="price-val profit">${formatMoney(estimation.profit)} (${estimation.profitability}%)</div>
  </div>
</div>

${estimation.explanation && estimation.explanation.length > 0 ? `
<div class="explanation">
  <div class="exp-title">Розрахунок ціни</div>
  ${estimation.explanation.map(e => `<div class="exp-item"><div class="exp-dot"></div><span>${e.startsWith('⚠') ? e.slice(2) : e}</span></div>`).join('')}
</div>` : ''}

${estimation.comment ? `<div class="explanation"><div class="exp-title">Коментар</div><div style="font-size:13px;color:#444">${estimation.comment}</div></div>` : ''}

<div class="signatures">
  <div class="sign-block">
    <div class="sign-label">Менеджер / Оцінювач</div>
    <div class="sign-name">${evaluatorName}</div>
    <div class="sign-line"></div>
    <div style="font-size:11px;color:#999">Підпис</div>
  </div>
  <div class="sign-block">
    <div class="sign-label">Продавець / Клієнт</div>
    <div class="sign-name">&nbsp;</div>
    <div class="sign-line"></div>
    <div style="font-size:11px;color:#999">ПІБ та підпис</div>
  </div>
</div>

<div class="footer">
  Документ сформовано системою TradeValue Pro · ${dateStr} ${timeStr}
</div>

<script>window.onload = () => window.print()</script>
</body>
</html>`

  const w = window.open('', '_blank', 'width=900,height=700')
  if (w) { w.document.write(html); w.document.close() }
}
