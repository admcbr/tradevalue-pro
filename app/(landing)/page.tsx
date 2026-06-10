'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  ArrowRight, CheckCircle, X, Star, Menu, XIcon,
  Zap, Shield, BarChart2, Users, Package, Globe,
  TrendingUp, Clock, ChevronDown, Play,
} from 'lucide-react'

// ─── Colors ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#07070C',
  card: '#0E0E18',
  card2: '#141422',
  border: '#1E1E32',
  border2: '#2A2A44',
  accent: '#6366F1',
  accent2: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#F8FAFC',
  muted: '#94A3B8',
  muted2: '#475569',
}

// ─── Animated counter ────────────────────────────────────────────────────────
function Counter({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        let start = 0
        const duration = 2000
        const step = to / (duration / 16)
        const timer = setInterval(() => {
          start += step
          if (start >= to) { setVal(to); clearInterval(timer) }
          else setVal(Math.floor(start))
        }, 16)
      }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to])
  return <span ref={ref}>{prefix}{val.toLocaleString('uk-UA')}{suffix}</span>
}

// ─── Plans ───────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Starter',
    emoji: '🆓',
    price: 0,
    priceYear: 0,
    color: C.muted,
    highlight: false,
    desc: 'Спробуйте безкоштовно',
    limit: '5 оцінок/міс',
    features: [
      '5 оцінок на місяць',
      '1 менеджер',
      'Базові категорії',
      'Форма оцінки',
      'Правила компанії',
      'Накладна для друку',
    ],
    blocked: ['Команда', 'Статистика', 'AI аналіз', 'Трейд-Ін', 'CSV експорт'],
    cta: 'Почати безкоштовно',
  },
  {
    name: 'Pro',
    emoji: '🚀',
    price: 799,
    priceYear: 639,
    color: C.accent,
    highlight: true,
    badge: '🔥 Найпопулярніший',
    desc: 'Для активних магазинів',
    limit: '300 оцінок/міс',
    features: [
      '300 оцінок на місяць',
      'До 3 менеджерів',
      'Всі категорії + власні',
      'Правила оцінки',
      'Статистика команди',
      'AI аналіз ліквідності',
      'Трейд-Ін оцінка',
      'Накладні + CSV',
      'Керування доступом',
    ],
    blocked: [],
    cta: 'Спробувати Pro',
  },
  {
    name: 'Business',
    emoji: '🏢',
    price: 1999,
    priceYear: 1599,
    color: C.warning,
    highlight: false,
    desc: 'Для мережі магазинів',
    limit: 'Безліміт оцінок',
    features: [
      'Необмежено оцінок',
      'До 10 менеджерів',
      'Все з Pro плану',
      'Розширена аналітика',
      'Пріоритетна підтримка',
      'Особистий менеджер',
      'Налаштування під бізнес',
    ],
    blocked: [],
    cta: 'Обрати Business',
  },
]

const FEATURES = [
  {
    icon: <Zap size={24} color={C.accent} />,
    title: 'Оцінка за 3 хвилини',
    desc: 'Менеджер вибирає категорію, заповнює характеристики — система миттєво розраховує ціну викупу, продажу та прибуток.',
    color: C.accent,
  },
  {
    icon: <Shield size={24} color={C.success} />,
    title: 'Захист від переплат',
    desc: 'Правила компанії автоматично не дають купити занадто дорого. Жоден менеджер не порушить ваші стандарти.',
    color: C.success,
  },
  {
    icon: <BarChart2 size={24} color={C.warning} />,
    title: 'Аналітика по команді',
    desc: 'Бачите хто скільки оцінок зробив, яка рентабельність і хто приносить найбільше прибутку.',
    color: C.warning,
  },
  {
    icon: <Globe size={24} color='#EC4899' />,
    title: 'AI аналіз ліквідності',
    desc: 'Штучний інтелект аналізує ринок і підказує чи варто купувати цю модель зараз і за скільки днів продасте.',
    color: '#EC4899',
  },
  {
    icon: <Users size={24} color='#14B8A6' />,
    title: 'Гнучкі права доступу',
    desc: 'Налаштовуйте що бачить кожен менеджер — свої оцінки, чужі, статистику чи правила.',
    color: '#14B8A6',
  },
  {
    icon: <Package size={24} color='#F97316' />,
    title: 'Власні категорії',
    desc: 'Додавайте будь-які категорії зі своїми характеристиками, параметрами і правилами оцінки.',
    color: '#F97316',
  },
]

const STEPS = [
  { n: '01', title: 'Реєструєтесь', desc: 'Створюєте акаунт і вводите назву компанії. Займає 2 хвилини.' },
  { n: '02', title: 'Налаштовуєте', desc: 'Виставляєте правила оцінки, відсотки знижки та заборонені моделі.' },
  { n: '03', title: 'Запрошуєте команду', desc: 'Додаєте менеджерів і налаштовуєте їх права доступу.' },
  { n: '04', title: 'Заробляєте', desc: 'Менеджери оцінюють техніку — ви контролюєте і отримуєте прибуток.' },
]

const REVIEWS = [
  {
    name: 'Олексій М.',
    role: 'Магазин техніки, Київ',
    text: 'За місяць роботи стандартизували оцінку в 3 точках. Менеджери більше не купують занадто дорого — система просто не дає.',
    stars: 5,
    avatar: 'ОМ',
    grad: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
  },
  {
    name: 'Карина Д.',
    role: 'Ломбард «Гривня», Харків',
    text: 'AI аналіз ліквідності — найкраща функція. Тепер знаю заздалегідь чи продам iPhone за тиждень чи зависне на місяць.',
    stars: 5,
    avatar: 'КД',
    grad: 'linear-gradient(135deg,#10B981,#059669)',
  },
  {
    name: 'Іван П.',
    role: 'Перекупник, Одеса',
    text: 'Реєстрація 5 хвилин, налаштування 10 хвилин — і вже оцінюю. Зручніше ніж Excel в 100 разів.',
    stars: 5,
    avatar: 'ІП',
    grad: 'linear-gradient(135deg,#F59E0B,#EF4444)',
  },
]

const STATS = [
  { value: 1240, suffix: '+', label: 'Активних магазинів' },
  { value: 284000, suffix: '+', label: 'Оцінок зроблено' },
  { value: 97, suffix: '%', label: 'Задоволених клієнтів' },
  { value: 3, suffix: ' хв', label: 'Час однієї оцінки' },
]

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
  }, [])
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    { q: 'Як швидко можна почати?', a: 'Реєстрація займає 2 хвилини, базове налаштування — ще 10. Перша оцінка вже через 15 хвилин після реєстрації.' },
    { q: 'Чи потрібні технічні знання?', a: 'Ні. Інтерфейс інтуїтивний — розбереться будь-який менеджер без інструкцій.' },
    { q: 'Що таке AI аналіз ліквідності?', a: 'Система через штучний інтелект аналізує ринок (OLX, Rozetka) і каже чи варто купувати цю модель зараз, за скільки днів продасте і чи росте ціна.' },
    { q: 'Чи можна додати власні категорії?', a: 'Так. Ви самі створюєте категорії зі своїми полями, параметрами та правилами — принтери, телевізори, дрони, будь-що.' },
    { q: 'Як захищені мої дані?', a: 'База даних PostgreSQL з шифруванням, резервні копії щодня, Row Level Security — ваші дані бачите тільки ви.' },
    { q: 'Чи є знижка на рік?', a: 'Так — при оплаті за рік знижка 20%. Pro план виходить 639 ₴/міс замість 799 ₴.' },
  ]

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden' }}>

      {/* ── NAVBAR ────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: `1px solid ${C.border}`,
        background: 'rgba(7,7,12,0.9)', backdropFilter: 'blur(16px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 66 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flex: 1 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 13, color: '#fff',
              boxShadow: '0 0 20px rgba(99,102,241,0.5)',
            }}>TV</div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>TradeValue </span>
              <span style={{ fontSize: 16, fontWeight: 800, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pro</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', gap: 32, marginRight: 32 }} className="tv-landing-nav">
            {[['#product', 'Продукт'], ['#pricing', 'Ціни'], ['#reviews', 'Відгуки'], ['#faq', 'FAQ']].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: 14, color: C.muted, textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = C.text}
                onMouseLeave={e => (e.target as HTMLElement).style.color = C.muted}>
                {label}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }} className="tv-landing-nav">
            {isLoggedIn ? (
              <Link href="/dashboard" style={{ padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700, boxShadow: '0 0 20px rgba(99,102,241,0.35)' }}>
                Перейти в дашборд →
              </Link>
            ) : (
              <>
                <Link href="/auth/login" style={{ padding: '9px 20px', borderRadius: 10, border: `1px solid ${C.border2}`, color: C.muted, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                  Увійти
                </Link>
                <Link href="/auth/register" style={{ padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700, boxShadow: '0 0 20px rgba(99,102,241,0.35)' }}>
                  Спробувати безкоштовно
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="tv-landing-hamburger"
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: C.text }}>
            {mobileMenu ? <XIcon size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[['#product', 'Продукт'], ['#pricing', 'Ціни'], ['#reviews', 'Відгуки'], ['#faq', 'FAQ']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileMenu(false)} style={{ fontSize: 16, color: C.muted, textDecoration: 'none', fontWeight: 500 }}>{label}</a>
            ))}
            <Link href="/auth/register" onClick={() => setMobileMenu(false)}
              style={{ padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 700, textAlign: 'center' }}>
              Спробувати безкоштовно
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 140, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}>
        {/* Glows */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', fontSize: 13, fontWeight: 600, color: '#A5B4FC', marginBottom: 32 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.success, boxShadow: `0 0 8px ${C.success}`, flexShrink: 0 }} />
            Вже 1,240+ магазинів довіряють нам свою оцінку
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(40px,6vw,72px)', fontWeight: 900, letterSpacing: -3, lineHeight: 1.05, marginBottom: 24 }}>
            <span style={{ color: C.text }}>Оцінка б/у техніки</span>
            <br />
            <span style={{ background: 'linear-gradient(135deg,#6366F1 0%,#8B5CF6 50%,#EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              що приносить прибуток
            </span>
          </h1>

          {/* Subheadline */}
          <p style={{ fontSize: 'clamp(16px,2.5vw,20px)', color: C.muted, lineHeight: 1.7, maxWidth: 620, margin: '0 auto 40px' }}>
            Система для магазинів, ломбардів і перекупників. Менеджер оцінює пристрій за <strong style={{ color: C.text }}>3 хвилини</strong> — ви отримуєте правильну ціну, контроль і аналітику.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <Link href="/auth/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 12,
              background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff',
              textDecoration: 'none', fontWeight: 700, fontSize: 16,
              boxShadow: '0 0 40px rgba(99,102,241,0.4)', transition: 'transform 0.15s',
            }}>
              Спробувати безкоштовно <ArrowRight size={18} />
            </Link>
            <Link href="/dashboard" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12,
              border: `1px solid ${C.border2}`, color: C.muted,
              textDecoration: 'none', fontWeight: 600, fontSize: 16,
            }}>
              <Play size={16} /> Переглянути демо
            </Link>
          </div>
          <p style={{ fontSize: 13, color: C.muted2 }}>Не потрібна картка · 5 оцінок безкоштовно · Налаштування за 10 хвилин</p>
        </div>

        {/* Hero visual */}
        <div style={{ maxWidth: 1100, margin: '60px auto 0', padding: '0 24px' }}>
          <div style={{
            borderRadius: 20, border: `1px solid ${C.border}`,
            background: 'linear-gradient(135deg,rgba(99,102,241,0.06),rgba(139,92,246,0.03))',
            padding: 3, boxShadow: '0 0 80px rgba(99,102,241,0.15)',
          }}>
            <div style={{ borderRadius: 18, background: C.card, padding: '24px 28px' }}>
              {/* Fake browser bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#EF4444','#F59E0B','#10B981'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
                </div>
                <div style={{ flex: 1, background: C.card2, borderRadius: 7, padding: '6px 14px', fontSize: 12, color: C.muted2 }}>tradevalue.pro/estimate</div>
              </div>
              {/* Mock estimate form */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '1px' }}>Категорія</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['💻 Ноутбуки', '📱 Смартфони', '🎮 Відеокарти', '🖥 ПК', '📟 Планшети'].map((c, i) => (
                      <div key={c} style={{ padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, border: `1px solid ${i === 0 ? 'rgba(99,102,241,0.5)' : C.border2}`, background: i === 0 ? 'rgba(99,102,241,0.12)' : C.card2, color: i === 0 ? C.text : C.muted }}>{c}</div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                    {[['Бренд', 'Apple'], ['Модель', 'MacBook Pro 14"'], ['Процесор', 'Apple M3 Pro'], ['RAM', '18 GB'], ['Накопичувач', '512 GB SSD'], ['Стан', 'A — відмінний']].map(([label, val]) => (
                      <div key={label}>
                        <p style={{ fontSize: 10, color: C.muted2, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700 }}>{label}</p>
                        <div style={{ padding: '8px 12px', borderRadius: 8, background: C.card2, border: `1px solid ${C.border2}`, fontSize: 13, color: C.text, fontWeight: 500 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <p style={{ fontSize: 10, color: C.muted2, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700 }}>Ринкова ціна</p>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: C.card2, border: `1px solid rgba(99,102,241,0.3)`, fontSize: 18, color: C.text, fontWeight: 800 }}>85 000 ₴</div>
                  </div>
                </div>

                {/* Result card */}
                <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(16,185,129,0.04))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Результат оцінки</p>
                    <div style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', fontSize: 11, fontWeight: 700, color: C.success }}>✓ Варто купити</div>
                  </div>
                  {[
                    { label: 'Ринкова ціна', val: '85 000 ₴', color: C.muted },
                    { label: 'Ціна викупу', val: '68 000 ₴', color: '#A5B4FC' },
                    { label: 'Ціна продажу', val: '89 250 ₴', color: C.success },
                    { label: 'Прибуток', val: '21 250 ₴', color: C.warning },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', borderRadius: 9, background: 'rgba(0,0,0,0.2)', marginBottom: 6 }}>
                      <p style={{ fontSize: 12, color: C.muted }}>{label}</p>
                      <p style={{ fontSize: 15, fontWeight: 800, color }}>{val}</p>
                    </div>
                  ))}
                  <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 9, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <p style={{ fontSize: 10, color: C.muted2, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700 }}>Рентабельність</p>
                    <p style={{ fontSize: 24, fontWeight: 900, color: C.success }}>31.3%</p>
                  </div>
                  <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 9, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                    <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>⚡ AI: Висока ліквідність · Продаж за 3–7 днів</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }} className="tv-stats-grid">
          {STATS.map(({ value, suffix, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, letterSpacing: -2, marginBottom: 8, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                <Counter to={value} suffix={suffix} />
              </p>
              <p style={{ fontSize: 15, color: C.muted }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHAT IS IT ────────────────────────────────────────────────────── */}
      <section id="product" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 13, fontWeight: 700, color: '#A5B4FC', marginBottom: 20 }}>
              Що таке TradeValue Pro
            </div>
            <h2 style={{ fontSize: 'clamp(30px,4vw,48px)', fontWeight: 900, letterSpacing: -2, marginBottom: 20 }}>
              Один інструмент замість<br />таблиць і калькуляторів
            </h2>
            <p style={{ fontSize: 17, color: C.muted, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              TradeValue Pro — це система для стандартизації оцінки б/у техніки. Замість того щоб кожен менеджер рахував по-своєму — всі оцінюють за єдиними правилами компанії.
            </p>
          </div>

          {/* Problem vs Solution */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 80 }} className="tv-grid-2">
            <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 20, padding: 32 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.danger, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20 }}>😤 Без TradeValue Pro</p>
              {[
                'Кожен менеджер рахує по-своєму',
                'Купують занадто дорого — прибуток менший',
                'Немає контролю — не знаєте що відбувається',
                'Excel таблиці які постійно ламаються',
                'Складно порівняти ефективність менеджерів',
                'Ніхто не знає чи продасться цей товар',
              ].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <X size={16} color={C.danger} style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.5 }}>{t}</p>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: 32 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.success, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20 }}>✅ З TradeValue Pro</p>
              {[
                'Єдині правила для всієї команди',
                'Система не дасть купити вище ліміту',
                'Повна статистика по кожному менеджеру',
                'Зручний інтерфейс — оцінка за 3 хвилини',
                'Порівнюєте ефективність одним кліком',
                'AI аналіз ліквідності для кожної моделі',
              ].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <CheckCircle size={16} color={C.success} style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.5 }}>{t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Features grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="tv-grid-3-land">
            {FEATURES.map(({ icon, title, desc, color }) => (
              <div key={title} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `${color}08`, filter: 'blur(20px)', pointerEvents: 'none' }} />
                <div style={{ width: 50, height: 50, borderRadius: 14, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>{icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section style={{ background: `rgba(255,255,255,0.015)`, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 13, fontWeight: 700, color: '#A5B4FC', marginBottom: 20 }}>
            Як це працює
          </div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: -2, marginBottom: 16 }}>
            Від реєстрації до першої оцінки — 15 хвилин
          </h2>
          <p style={{ fontSize: 16, color: C.muted, marginBottom: 64 }}>Не потрібні технічні знання. Розбереться будь-хто.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }} className="tv-grid-4-land">
            {STEPS.map(({ n, title, desc }, i) => (
              <div key={n} style={{ position: 'relative' }}>
                {i < 3 && <div style={{ position: 'absolute', top: 28, left: 'calc(50% + 32px)', right: 'calc(-50% + 32px)', height: 1, background: `linear-gradient(90deg,rgba(99,102,241,0.4),transparent)`, display: 'none' }} />}
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 18, fontWeight: 900, color: '#A5B4FC' }}>{n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 13, fontWeight: 700, color: '#A5B4FC', marginBottom: 20 }}>
              Прозорі ціни
            </div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: -2, marginBottom: 16 }}>Починайте безкоштовно</h2>
            <p style={{ fontSize: 16, color: C.muted, marginBottom: 32 }}>5 оцінок безкоштовно. Потім — від 799 ₴/міс.</p>

            {/* Annual toggle */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '8px 20px', background: C.card, borderRadius: 99, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: !annual ? C.text : C.muted }}>Щомісяця</span>
              <button onClick={() => setAnnual(!annual)} style={{ width: 46, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', background: annual ? C.accent : C.border2, position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: annual ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
              </button>
              <span style={{ fontSize: 14, fontWeight: 600, color: annual ? C.text : C.muted }}>
                Щорічно <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.12)', color: C.success, fontSize: 11, fontWeight: 700 }}>−20%</span>
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, alignItems: 'stretch' }} className="tv-grid-3-land">
            {PLANS.map(plan => {
              const price = annual ? plan.priceYear : plan.price
              const badge = (plan as any).badge
              return (
                <div key={plan.name} style={{
                  background: plan.highlight ? 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))' : C.card,
                  border: `1.5px solid ${plan.highlight ? 'rgba(99,102,241,0.4)' : C.border}`,
                  borderRadius: 22, padding: 32, position: 'relative', display: 'flex', flexDirection: 'column',
                  boxShadow: plan.highlight ? '0 0 60px rgba(99,102,241,0.15)' : 'none',
                }}>
                  {badge && (
                    <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '5px 16px', borderRadius: 99, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
                      {badge}
                    </div>
                  )}

                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{plan.emoji}</div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: plan.color, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>{plan.name}</p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 8 }}>
                      {price === 0 ? (
                        <span style={{ fontSize: 42, fontWeight: 900, letterSpacing: -2, color: C.text }}>Безкоштовно</span>
                      ) : (
                        <>
                          <span style={{ fontSize: 46, fontWeight: 900, letterSpacing: -2, color: C.text }}>₴{price}</span>
                          <span style={{ fontSize: 14, color: C.muted, paddingBottom: 8 }}>/міс</span>
                        </>
                      )}
                    </div>
                    <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 7, background: `${plan.color}15`, fontSize: 12, fontWeight: 700, color: plan.color }}>{plan.limit}</div>
                    <p style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>{plan.desc}</p>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CheckCircle size={15} color={C.success} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: C.text }}>{f}</span>
                      </div>
                    ))}
                    {plan.blocked.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.35 }}>
                        <X size={15} color={C.muted} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: C.muted }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/auth/register" style={{
                    display: 'block', textAlign: 'center', padding: '13px', borderRadius: 12,
                    background: plan.highlight ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : C.card2,
                    border: plan.highlight ? 'none' : `1px solid ${C.border2}`,
                    color: plan.highlight ? '#fff' : C.muted,
                    textDecoration: 'none', fontWeight: 700, fontSize: 15,
                    boxShadow: plan.highlight ? '0 0 24px rgba(99,102,241,0.35)' : 'none',
                  }}>
                    {plan.cta}
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Comparison note */}
          <div style={{ marginTop: 32, padding: '20px 28px', borderRadius: 16, background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              '✓ Скасувати в будь-який момент',
              '✓ Дані зберігаються після скасування 90 днів',
              '✓ Перехід між планами без втрати даних',
              '✓ Підтримка для всіх планів',
            ].map(t => <span key={t} style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{t}</span>)}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ───────────────────────────────────────────────────────── */}
      <section id="reviews" style={{ background: 'rgba(255,255,255,0.015)', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 13, fontWeight: 700, color: '#A5B4FC', marginBottom: 20 }}>
              Відгуки
            </div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: -2 }}>Що кажуть наші клієнти</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="tv-grid-3-land">
            {REVIEWS.map(({ name, role, text, stars, avatar, grad }) => (
              <div key={name} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 28 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {Array.from({ length: stars }).map((_, i) => <Star key={i} size={15} color={C.warning} fill={C.warning} />)}
                </div>
                <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, marginBottom: 24, fontStyle: 'italic' }}>"{text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{avatar}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700 }}>{name}</p>
                    <p style={{ fontSize: 12, color: C.muted2 }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 13, fontWeight: 700, color: '#A5B4FC', marginBottom: 20 }}>
              FAQ
            </div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, letterSpacing: -1.5 }}>Часті запитання</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqs.map(({ q, a }, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${openFaq === i ? 'rgba(99,102,241,0.3)' : C.border}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.15s' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, fontFamily: 'inherit' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: C.text, textAlign: 'left' }}>{q}</span>
                  <ChevronDown size={18} color={C.muted2} style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 22px 20px', fontSize: 14, color: C.muted, lineHeight: 1.8 }}>{a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.015)', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ position: 'relative', background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 28, padding: '56px 48px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: -2, marginBottom: 16 }}>
                Готові збільшити прибуток?
              </h2>
              <p style={{ fontSize: 16, color: C.muted, marginBottom: 36, lineHeight: 1.7 }}>
                Приєднуйтесь до 1,240+ магазинів які вже оцінюють техніку правильно. Перші 5 оцінок — безкоштовно.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/auth/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 12,
                  background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff',
                  textDecoration: 'none', fontWeight: 700, fontSize: 16,
                  boxShadow: '0 0 40px rgba(99,102,241,0.4)',
                }}>
                  Почати безкоштовно <ArrowRight size={18} />
                </Link>
                <Link href="/auth/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12,
                  border: `1px solid ${C.border2}`, color: C.muted,
                  textDecoration: 'none', fontWeight: 600, fontSize: 15,
                }}>
                  Увійти в акаунт
                </Link>
              </div>
              <p style={{ fontSize: 13, color: C.muted2, marginTop: 20 }}>Не потрібна кредитна картка · Скасувати в будь-який момент</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, color: '#fff' }}>TV</div>
              <span style={{ fontWeight: 700, fontSize: 14 }}>TradeValue Pro</span>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              {[['#product','Продукт'],['#pricing','Ціни'],['#faq','FAQ']].map(([href,label]) => (
                <a key={href} href={href} style={{ fontSize: 13, color: C.muted2, textDecoration: 'none' }}>{label}</a>
              ))}
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: C.muted2, marginBottom: 4 }}>© 2025 TradeValue Pro. Система оцінки б/у техніки.</p>
              <p style={{ fontSize: 11, color: C.muted2 }}>ФОП Матящук Андрій Анатолійович · ЄРДПОУ 3369301195 · м. Вінниця, Україна</p>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                ['/terms', 'Публічна оферта'],
                ['/terms#5', 'Умови повернення'],
                ['/support', 'Контакти'],
              ].map(([href, label]) => (
                <a key={href} href={href} style={{ fontSize: 12, color: C.muted2, textDecoration: 'none', borderBottom: '1px solid transparent' }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = C.muted}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = C.muted2}>
                  {label}
                </a>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 11, color: C.muted2, marginTop: 12, opacity: 0.7 }}>
            Оплата через LiqPay. Здійснюючи оплату, ви погоджуєтесь з <a href="/terms" style={{ color: C.muted2, textDecoration: 'underline' }}>умовами надання послуг</a> та <a href="/terms#5" style={{ color: C.muted2, textDecoration: 'underline' }}>політикою повернення</a>.
          </p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .tv-grid-3-land { grid-template-columns: 1fr !important; }
          .tv-grid-4-land { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 640px) {
          .tv-landing-nav { display: none !important; }
          .tv-landing-hamburger { display: block !important; }
          .tv-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .tv-grid-4-land { grid-template-columns: 1fr !important; }
          .tv-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
