'use client'

import { useState, useEffect } from 'react'
import { createClient } from "@/lib/supabase"
import { CheckCircle, Zap, Crown, Building2, ArrowRight, X } from 'lucide-react'
import { useLang } from '@/lib/i18n'

const C = {
  card: '#0E0E16', card2: '#141422', card3: '#1A1A2E',
  border: '#1E1E30', border2: '#282840',
  accent: '#6382FF', accent2: '#A78BFA',
  success: '#34D98A', danger: '#F87171', warning: '#FBBF24',
  text: '#EDEDF0', muted: '#8080AA', muted2: '#4A4A70',
}

const PLANS = [
  {
    id: 'starter', name: 'Starter', icon: <Zap size={20} color="#8080AA" />,
    priceMonth: 0, priceYear: 0,
    color: C.muted, highlight: false, current: false, // updated dynamically
    desc: { uk: 'Для знайомства з системою', ru: 'Для знакомства с системой' },
    features: {
      uk: [
        '5 оцінок на місяць',
        '1 користувач',
        'Базові категорії (Ноутбуки, Смартфони, GPU)',
        'Форма оцінки з правилами',
        'Накладна для друку',
      ],
      ru: [
        '5 оценок в месяц',
        '1 пользователь',
        'Базовые категории (Ноутбуки, Смартфоны, GPU)',
        'Форма оценки с правилами',
        'Накладная для печати',
      ],
    },
    blocked: {
      uk: ['Власні правила оцінки', 'Команда менеджерів', 'Статистика', 'AI ліквідність', 'Трейд-Ін', 'Експорт CSV'],
      ru: ['Собственные правила', 'Команда менеджеров', 'Статистика', 'AI ликвидность', 'Трейд-Ин', 'Экспорт CSV'],
    },
  },
  {
    id: 'pro', name: 'Pro', icon: <Crown size={20} color="#6382FF" />,
    priceMonth: 799, priceYear: 639,
    color: C.accent, highlight: true, current: false,
    badge: { uk: '🔥 Популярний', ru: '🔥 Популярный' },
    desc: { uk: 'Для активних магазинів та ломбардів', ru: 'Для активных магазинов и ломбардов' },
    features: {
      uk: [
        '300 оцінок на місяць',
        'До 3 менеджерів',
        'Всі категорії + власні',
        'Власні правила оцінки',
        'Статистика по менеджерах',
        'AI аналіз ліквідності',
        'Трейд-Ін оцінка',
        'Накладні + Експорт CSV',
        'Управління доступом',
      ],
      ru: [
        '300 оценок в месяц',
        'До 3 менеджеров',
        'Все категории + собственные',
        'Собственные правила оценки',
        'Статистика по менеджерам',
        'AI анализ ликвидности',
        'Трейд-Ин оценка',
        'Накладные + Экспорт CSV',
        'Управление доступом',
      ],
    },
    blocked: { uk: [], ru: [] },
  },
  {
    id: 'business', name: 'Business', icon: <Building2 size={20} color="#FBBF24" />,
    priceMonth: 1999, priceYear: 1599,
    color: C.warning, highlight: false, current: false,
    desc: { uk: 'Для мережі магазинів', ru: 'Для сети магазинов' },
    features: {
      uk: [
        'Безліміт оцінок',
        'До 10 менеджерів',
        'Всі можливості Pro',
        'Розширена аналітика',
        'Пріоритетна підтримка',
        'Особистий менеджер',
        'Налаштування під бізнес',
        'API доступ (скоро)',
      ],
      ru: [
        'Безлимит оценок',
        'До 10 менеджеров',
        'Все возможности Pro',
        'Расширенная аналитика',
        'Приоритетная поддержка',
        'Личный менеджер',
        'Настройка под бизнес',
        'API доступ (скоро)',
      ],
    },
    blocked: { uk: [], ru: [] },
  },
]

const FAQ_UK = [
  { q: 'Чи можна змінити тариф в будь-який момент?', a: 'Так. Підвищити тариф — одразу. Знизити — з наступного циклу оплати.' },
  { q: 'Що відбувається якщо вичерпано ліміт оцінок?', a: 'Ви отримуєте повідомлення. Можна підвищити тариф або почекати нового місяця.' },
  { q: 'Чи зберігаються дані при зміні тарифу?', a: 'Так, всі оцінки та налаштування зберігаються завжди.' },
  { q: 'Чи є знижка для ломбардів або мереж?', a: 'Так, для мереж від 3 точок — зверніться до нас напряму.' },
]
const FAQ_RU = [
  { q: 'Можно ли изменить тариф в любой момент?', a: 'Да. Повысить — сразу. Понизить — со следующего цикла оплаты.' },
  { q: 'Что происходит когда исчерпан лимит оценок?', a: 'Вы получаете уведомление. Можно повысить тариф или подождать нового месяца.' },
  { q: 'Сохраняются ли данные при смене тарифа?', a: 'Да, все оценки и настройки сохраняются всегда.' },
  { q: 'Есть ли скидки для ломбардов или сетей?', a: 'Да, для сетей от 3 точек — свяжитесь с нами напрямую.' },
]

export default function PricingPage() {
  const { t, lang } = useLang()
  const [annual, setAnnual] = useState(false)
  const [usageCount, setUsageCount] = useState(0)
  const [planLimit, setPlanLimit] = useState(5)
  const [currentPlan, setCurrentPlan] = useState('starter')
  const [nextReset, setNextReset] = useState('1 серпня')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: ur } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      if (!ur?.company_id) return
      const { data: comp } = await supabase.from('companies').select('plan').eq('id', ur.company_id).single()
      if (comp) {
        setCurrentPlan(comp.plan || 'starter')
        setPlanLimit(comp.plan === 'pro' ? 300 : comp.plan === 'business' ? 999999 : 5)
      }
      const startOfMonth = new Date()
      startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0)
      const { count } = await supabase.from('estimations')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', ur.company_id)
        .gte('created_at', startOfMonth.toISOString())
      setUsageCount(count || 0)
      const next = new Date(); next.setMonth(next.getMonth() + 1); next.setDate(1)
      setNextReset(next.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' }))
    })
  }, [])
  const [selected, setSelected] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const isUk = lang === 'uk'
  const faq = isUk ? FAQ_UK : FAQ_RU

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, color: C.text }}>
          {isUk ? 'Тарифні плани' : 'Тарифные планы'}
        </h1>
        <p style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>
          {isUk ? `Поточний тариф: ${currentPlan}. Використано: ${usageCount} / ${planLimit === 999999 ? '∞' : planLimit} оцінок.` : `Текущий тариф: ${currentPlan}. Использовано: ${usageCount} / ${planLimit === 999999 ? '∞' : planLimit} оценок.`}
        </p>
      </div>

      {/* Current usage bar */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 22px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{isUk ? 'Оцінок цього місяця' : 'Оценок в этом месяце'}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: usageCount >= planLimit ? C.danger : C.warning }}>{usageCount} / {planLimit === 999999 ? '∞' : planLimit}</span>
          </div>
          <div style={{ height: 6, background: C.border2, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min((usageCount / Math.max(planLimit === 999999 ? 999 : planLimit, 1)) * 100, 100)}%`, background: usageCount >= planLimit ? 'linear-gradient(90deg,#F87171,#EF4444)' : 'linear-gradient(90deg,#6382FF,#A78BFA)', borderRadius: 99 }} />
          </div>
        </div>
        <div style={{ fontSize: 12, color: C.muted2, textAlign: 'right', flexShrink: 0 }}>
          {isUk ? `Оновлення ${nextReset}` : `Обновление ${nextReset}`}
        </div>
      </div>

      {/* Cancel subscription */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'flex-end' }}>
        <button style={{
          padding: '7px 14px', borderRadius: 8,
          border: '1px solid rgba(248,113,113,0.2)', background: 'transparent',
          color: '#F87171', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}
          onClick={() => {
            if (window.confirm(isUk
              ? 'Ви впевнені що хочете скасувати підписку? Поточний план буде активний до кінця оплаченого періоду.'
              : 'Вы уверены что хотите отменить подписку? Текущий план будет активен до конца оплаченного периода.'
            )) {
              alert(isUk ? 'Підписку скасовано. Ваш план залишається активним до кінця поточного циклу.' : 'Подписка отменена. Ваш план остаётся активным до конца текущего цикла.')
            }
          }}>
          {isUk ? 'Скасувати підписку' : 'Отменить подписку'}
        </button>
      </div>

      {/* Billing toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: !annual ? C.text : C.muted }}>{isUk ? 'Щомісяця' : 'Ежемесячно'}</span>
        <button onClick={() => setAnnual(!annual)} style={{ width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', background: annual ? C.accent : C.border2, position: 'relative', transition: 'background 0.2s' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: annual ? 23 : 3, transition: 'left 0.2s' }} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: annual ? C.text : C.muted }}>
          {isUk ? 'Щорічно' : 'Ежегодно'}
          <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 6, background: 'rgba(52,217,138,0.12)', color: C.success, fontSize: 11, fontWeight: 700 }}>-20%</span>
        </span>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 48 }} className="tv-grid-2">
        {PLANS.map(plan => {
          const price = annual ? plan.priceYear : plan.priceMonth
          const badge = (plan as any).badge
          const features = plan.features[lang as 'uk' | 'ru']
          const blocked = plan.blocked[lang as 'uk' | 'ru']
          return (
            <div key={plan.id} style={{
              background: plan.highlight ? 'linear-gradient(135deg,rgba(99,130,255,0.07),rgba(167,139,250,0.04))' : C.card,
              border: `1.5px solid ${plan.highlight ? 'rgba(99,130,255,0.3)' : plan.current ? 'rgba(52,217,138,0.3)' : C.border}`,
              borderRadius: 16, padding: 24, position: 'relative',
              boxShadow: plan.highlight ? '0 0 40px rgba(99,130,255,0.1)' : 'none',
            }}>
              {badge && (
                <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', padding: '3px 14px', borderRadius: 99, background: 'linear-gradient(135deg,#6382FF,#A78BFA)', fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                  {badge[lang as 'uk' | 'ru']}
                </div>
              )}
              {plan.current && (
                <div style={{ position: 'absolute', top: 12, right: 12, padding: '2px 9px', borderRadius: 6, background: 'rgba(52,217,138,0.12)', border: '1px solid rgba(52,217,138,0.25)', fontSize: 10, fontWeight: 700, color: C.success }}>
                  {isUk ? 'Поточний' : 'Текущий'}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                {plan.icon}
                <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{plan.name}</span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: price === 0 ? 28 : 34, fontWeight: 900, letterSpacing: -1.5, color: C.text }}>
                  {price === 0 ? (isUk ? 'Безкоштовно' : 'Бесплатно') : `₴${price}`}
                </div>
                {price > 0 && <p style={{ fontSize: 12, color: C.muted2, marginTop: 2 }}>{isUk ? `/ ${annual ? 'місяць (при оплаті за рік)' : 'місяць'}` : `/ ${annual ? 'месяц (при оплате за год)' : 'месяц'}`}</p>}
                <p style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{plan.desc[lang as 'uk' | 'ru']}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <CheckCircle size={14} color={C.success} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 12.5, color: C.text }}>{f}</span>
                  </div>
                ))}
                {blocked.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, opacity: 0.4 }}>
                    <X size={14} color={C.danger} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 12.5, color: C.muted }}>{f}</span>
                  </div>
                ))}
              </div>

              {plan.current ? (
                <div style={{ textAlign: 'center', padding: '10px', borderRadius: 10, background: 'rgba(52,217,138,0.08)', border: '1px solid rgba(52,217,138,0.2)', fontSize: 13, fontWeight: 600, color: C.success }}>
                  {isUk ? '✓ Ваш поточний тариф' : '✓ Ваш текущий тариф'}
                </div>
              ) : (
                <button onClick={() => setSelected(plan.id)} style={{
                  width: '100%', padding: '11px', borderRadius: 10, cursor: 'pointer',
                  background: plan.highlight ? 'linear-gradient(135deg,#6382FF,#A78BFA)' : C.card2,
                  border: plan.highlight ? 'none' : `1px solid ${C.border2}`,
                  color: plan.highlight ? '#fff' : C.muted,
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
                  boxShadow: plan.highlight ? '0 0 20px rgba(99,130,255,0.25)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  {isUk ? 'Перейти' : 'Перейти'} на {plan.name} <ArrowRight size={13} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Payment modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setSelected(null)}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 36, maxWidth: 420, width: '100%' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>
                {isUk ? `Перейти на ${selected}` : `Перейти на ${selected}`}
              </h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted2 }}><X size={18} /></button>
            </div>

            <div style={{ padding: '16px', borderRadius: 12, background: C.card2, border: `1px solid ${C.border2}`, marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 1.7 }}>
                {isUk
                  ? 'Оплата через Stripe або LiqPay. Після підтвердження тариф активується миттєво.'
                  : 'Оплата через Stripe или LiqPay. После подтверждения тариф активируется мгновенно.'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button style={{ padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6382FF,#A78BFA)', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                💳 {isUk ? 'Оплатити карткою' : 'Оплатить картой'}
              </button>
              <button style={{ padding: '12px', borderRadius: 10, border: `1px solid ${C.border2}`, background: C.card2, color: C.muted, fontFamily: 'inherit', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                🏦 {isUk ? 'LiqPay / Приват24' : 'LiqPay / Приват24'}
              </button>
              <button onClick={() => setSelected(null)} style={{ padding: '12px', borderRadius: 10, border: 'none', background: 'transparent', color: C.muted2, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>
                {isUk ? 'Скасувати' : 'Отмена'}
              </button>
            </div>

            <p style={{ fontSize: 11, color: C.muted2, textAlign: 'center', marginTop: 14 }}>
              {isUk ? 'Відмінити підписку можна в будь-який момент' : 'Отменить подписку можно в любой момент'}
            </p>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>{isUk ? 'Часті запитання' : 'Частые вопросы'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faq.map(({ q, a }, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'inherit' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.text, textAlign: 'left' }}>{q}</span>
                <span style={{ color: C.muted, fontSize: 18, flexShrink: 0, marginLeft: 16 }}>{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 16px', fontSize: 13.5, color: C.muted, lineHeight: 1.7 }}>{a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div style={{ background: 'linear-gradient(135deg,rgba(99,130,255,0.08),rgba(167,139,250,0.04))', border: '1px solid rgba(99,130,255,0.2)', borderRadius: 16, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{isUk ? 'Потрібен індивідуальний тариф?' : 'Нужен индивидуальный тариф?'}</p>
          <p style={{ fontSize: 13, color: C.muted }}>{isUk ? 'Для мережей від 3 точок або великих об\'ємів — напишіть нам' : 'Для сетей от 3 точек или больших объемов — напишите нам'}</p>
        </div>
        <a href="/support" style={{ padding: '11px 22px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6382FF,#A78BFA)', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
          {isUk ? 'Зв\'язатись з нами' : 'Связаться с нами'}
        </a>
      </div>
    </div>
  )
}
