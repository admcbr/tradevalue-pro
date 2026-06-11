'use client'
import { createClient } from "@/lib/supabase"

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Zap, Clock, ThumbsUp, ThumbsDown, AlertCircle, Search } from 'lucide-react'


const C = {
  card: '#0E0E16', card2: '#141422', border: '#1E1E30', border2: '#282840',
  accent: '#6382FF', success: '#34D98A', danger: '#F87171', warning: '#FBBF24',
  text: '#EDEDF0', muted: '#8080AA', muted2: '#4A4A70',
}

const SCORE_CONFIG = {
  high:    { label: 'Висока ліквідність', color: '#34D98A', bg: 'rgba(52,217,138,0.1)',  border: 'rgba(52,217,138,0.2)',  icon: '🟢' },
  medium:  { label: 'Середня ліквідність', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', icon: '🟡' },
  low:     { label: 'Низька ліквідність', color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)', icon: '🔴' },
  unknown: { label: 'Невідомо', color: C.muted, bg: 'rgba(255,255,255,0.04)', border: C.border2, icon: '⚪' },
}

const REC_CONFIG = {
  buy:     { label: '✅ Купувати', color: '#34D98A', bg: 'rgba(52,217,138,0.08)',  border: 'rgba(52,217,138,0.2)' },
  caution: { label: '⚠️ Обережно', color: '#FBBF24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
  skip:    { label: '❌ Не купувати', color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
}

interface Props {
  brand: string
  model: string
  category: string
  marketPrice: number
  condition: string
}

export default function LiquidityCard({ brand, model, category, marketPrice, condition }: Props) {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function analyze() {
    if (!brand || !model || !marketPrice) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/liquidity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Ти — експерт з вторинного ринку електроніки в Україні (OLX, Rozetka). Проаналізуй ліквідність пристрою на ринку б/у техніки:

Пристрій: ${brand} ${model}
Категорія: ${category}
Ринкова ціна: ${marketPrice.toLocaleString('uk-UA')} ₴
Стан: ${condition}

Дай відповідь ВИКЛЮЧНО у форматі JSON (без markdown):
{
  "score": "high" або "medium" або "low",
  "days_to_sell": "наприклад '3-7 днів' або '2-4 тижні'",
  "demand_level": "1 речення про попит українською",
  "recommendation": "buy" або "caution" або "skip",
  "recommendation_text": "2-3 речення чому варто або не варто купувати, конкретно про цю модель, українською",
  "insight": "1-2 конкретних факти про цю модель на вторинному ринку України, українською",
  "price_trend": "rising" або "stable" або "falling"
}`
        }),
      })
      if (!res.ok) throw new Error('Помилка API')
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError('Не вдалось отримати аналіз. Перевірте підключення до інтернету.')
    } finally {
      setLoading(false)
    }
  }

  const score = result ? (SCORE_CONFIG as any)[result.score] ?? SCORE_CONFIG.unknown : null
  const rec = result ? (REC_CONFIG as any)[result.recommendation] ?? REC_CONFIG.caution : null

  return (
    <div style={{
      borderRadius: 14, border: `1px solid ${result ? (score?.border || C.border) : C.border}`,
      background: result ? score?.bg : 'rgba(99,130,255,0.04)',
      padding: 20, marginTop: 16,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={15} color={C.accent} />
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            AI Аналіз ліквідності
          </p>
        </div>
        {!result && !loading && (
          <button onClick={analyze} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9,
            background: 'linear-gradient(135deg, #6382FF, #A78BFA)', border: 'none',
            color: '#fff', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 0 16px rgba(99,130,255,0.3)',
          }}>
            <Search size={12} /> Аналізувати
          </button>
        )}
        {result && (
          <button onClick={analyze} style={{
            padding: '5px 10px', borderRadius: 7, border: `1px solid ${C.border2}`,
            background: 'transparent', color: C.muted2, fontFamily: 'inherit', fontSize: 11, cursor: 'pointer',
          }}>↻ Оновити</button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%', background: C.accent,
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
          <p style={{ fontSize: 12, color: C.muted2 }}>Аналізую ринок...</p>
          <p style={{ fontSize: 11, color: C.muted2, opacity: 0.6 }}>OLX · Rozetka · Prom.ua</p>
          <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.15)' }}>
          <AlertCircle size={14} color="#F87171" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 12, color: '#F87171', marginBottom: 4 }}>{error}</p>
            <button onClick={analyze} style={{ fontSize: 11, color: C.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Спробувати знову</button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
          <p style={{ fontSize: 12, color: C.muted2, lineHeight: 1.6 }}>
            Натисніть «Аналізувати» щоб отримати AI-оцінку ліквідності,<br />
            рекомендацію та орієнтовний термін продажу
          </p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Score + Days */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 9.5, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Ліквідність</p>
              <p style={{ fontSize: 15, fontWeight: 800, color: score?.color }}>{score?.icon} {score?.label}</p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <Clock size={10} color={C.muted2} />
                <p style={{ fontSize: 9.5, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px' }}>Термін продажу</p>
              </div>
              <p style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{result.days_to_sell}</p>
            </div>
          </div>

          {/* Trend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.04)' }}>
            {result.price_trend === 'rising'  && <TrendingUp  size={14} color="#34D98A" />}
            {result.price_trend === 'stable'  && <Minus       size={14} color="#8080AA" />}
            {result.price_trend === 'falling' && <TrendingDown size={14} color="#F87171" />}
            <p style={{ fontSize: 12, color: C.muted, flex: 1 }}>{result.demand_level}</p>
            <span style={{ fontSize: 11, fontWeight: 600, color: result.price_trend==='rising'?'#34D98A':result.price_trend==='falling'?'#F87171':'#8080AA' }}>
              {result.price_trend==='rising'?'↑ Зростає':result.price_trend==='falling'?'↓ Падає':'→ Стабільна'}
            </span>
          </div>

          {/* Insight */}
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(99,130,255,0.06)', border: '1px solid rgba(99,130,255,0.12)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.6px' }}>💡 Аналіз</p>
            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>{result.insight}</p>
          </div>

          {/* Recommendation */}
          <div style={{ padding: '12px 14px', borderRadius: 10, background: rec?.bg, border: `1px solid ${rec?.border}` }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: rec?.color, marginBottom: 4 }}>{rec?.label}</p>
            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>{result.recommendation_text}</p>
          </div>
        </div>
      )}
    </div>
  )
}
