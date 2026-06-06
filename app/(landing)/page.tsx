'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  CheckCircle, ArrowRight, Shield, Zap, BarChart2,
  Users, TrendingUp, Star, ChevronRight, Menu, X,
  Package, Clock, Globe,
} from 'lucide-react'

// ─── Design ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#07070C', card: '#0E0E18', card2: '#141422',
  border: '#1E1E32', border2: '#2A2A44',
  accent: '#6382FF', accent2: '#A78BFA',
  success: '#34D98A', danger: '#F87171', warning: '#FBBF24',
  text: '#F0F0F8', muted: '#8888AA', muted2: '#4A4A68',
}

const btn = (primary = true): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: primary ? '13px 28px' : '12px 24px',
  borderRadius: 12, fontFamily: 'inherit', fontWeight: 700,
  fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
  background: primary ? 'linear-gradient(135deg,#6382FF,#A78BFA)' : 'transparent',
  color: primary ? '#fff' : C.muted,
  border: primary ? 'none' : `1px solid ${C.border2}`,
  boxShadow: primary ? '0 0 30px rgba(99,130,255,0.3)' : 'none',
  textDecoration: 'none',
})

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0
        const step = to / 60
        const timer = setInterval(() => {
          start += step
          if (start >= to) { setVal(to); clearInterval(timer) }
          else setVal(Math.floor(start))
        }, 16)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to])
  return <span ref={ref}>{val.toLocaleString('uk-UA')}{suffix}</span>
}

// ─── Pricing plan ────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Starter', price: 0, period: 'безкоштовно',
    color: C.muted, badge: null,
    desc: 'Спробуйте безкоштовно',
    features: [
      { t: '5 оцінок на місяць', ok: true },
      { t: '1 користувач', ok: true },
      { t: 'Базові категорії', ok: true },
      { t: 'Власні правила', ok: false },
      { t: 'Статистика', ok: false },
      { t: 'Трейд-Ін', ok: false },
      { t: 'Накладні', ok: false },
      { t: 'Пріоритетна підтримка', ok: false },
    ],
    cta: 'Почати безкоштовно',
    highlight: false,
  },
  {
    name: 'Pro', price: 799, period: 'місяць',
    color: C.accent, badge: '🔥 Популярний',
    desc: 'Для активних магазинів',
    features: [
      { t: '300 оцінок на місяць', ok: true },
      { t: 'До 3 менеджерів', ok: true },
      { t: 'Всі категорії', ok: true },
      { t: 'Власні правила', ok: true },
      { t: 'Статистика команди', ok: true },
      { t: 'Трейд-Ін', ok: true },
      { t: 'Накладні та CSV', ok: true },
      { t: 'Пріоритетна підтримка', ok: false },
    ],
    cta: 'Спробувати Pro',
    highlight: true,
  },
  {
    name: 'Business', price: 1999, period: 'місяць',
    color: C.warning, badge: null,
    desc: 'Для мережі магазинів',
    features: [
      { t: 'Безліміт оцінок', ok: true },
      { t: 'До 10 менеджерів', ok: true },
      { t: 'Всі категорії + власні', ok: true },
      { t: 'Розширені правила', ok: true },
      { t: 'Повна аналітика', ok: true },
      { t: 'Трейд-Ін + AI аналіз', ok: true },
      { t: 'Накладні та CSV', ok: true },
      { t: 'Пріоритетна підтримка', ok: true },
    ],
    cta: 'Обрати Business',
    highlight: false,
  },
]

const STATS = [
  { value: 1240, suffix: '+', label: 'Активних магазинів' },
  { value: 284000, suffix: '+', label: 'Оцінок зроблено' },
  { value: 97, suffix: '%', label: 'Задоволених клієнтів' },
  { value: 3, suffix: 'хв', label: 'Середній час оцінки' },
]

const FEATURES = [
  { icon: <Zap size={22} color={C.accent} />, title: 'Швидка оцінка', desc: 'Менеджер оцінює пристрій за 3 хвилини. Система сама рахує ціну, прибуток та рентабельність.' },
  { icon: <Shield size={22} color={C.success} />, title: 'Правила компанії', desc: 'Ваші стандарти оцінки завжди виконуються. Жоден менеджер не купить занадто дорого.' },
  { icon: <BarChart2 size={22} color={C.accent2} />, title: 'Аналітика і звіти', desc: 'Бачте хто скільки купує, яка рентабельність і які моделі продаються найшвидше.' },
  { icon: <Globe size={22} color={C.warning} />, title: 'AI ліквідність', desc: 'Штучний інтелект аналізує ринок і підказує чи варто купувати конкретну модель зараз.' },
  { icon: <Users size={22} color={C.danger} />, title: 'Команда', desc: 'Керуйте правами кожного менеджера окремо. Хто що бачить — вирішуєте ви.' },
  { icon: <Package size={22} color={C.success} />, title: 'Гнучкі категорії', desc: 'Налаштуйте власні категорії товарів зі своїми полями, параметрами і правилами.' },
]

const TESTIMONIALS = [
  { name: 'Олексій Маринець', role: 'Власник «ТехноБіт», Київ', text: 'За 2 місяці роботи з TradeValue Pro ми стандартизували оцінку в 3 магазинах. Менеджери більше не купують занадто дорого.', stars: 5 },
  { name: 'Карина Дудник', role: 'Адмін ломбарду «Гривня»', text: 'Нарешті можна бачити хто скільки заробляє. Звіт по менеджерах — це саме те що нам було потрібно.', stars: 5 },
  { name: 'Іван Петренко', role: 'Перекуп, Харків', text: 'AI аналіз ліквідності — вогонь. Тепер знаю заздалегідь чи продам iPhone за тиждень чи місяць.', stars: 5 },
]

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [regForm, setRegForm] = useState({ name: '', email: '', company: '', password: '' })
  const [regStep, setRegStep] = useState<'form' | 'success'>('form')
  const [billingAnnual, setBillingAnnual] = useState(false)

  function handleReg(e: React.FormEvent) {
    e.preventDefault()
    if (!regForm.name || !regForm.email || !regForm.password) return
    setRegStep('success')
  }

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: `1px solid ${C.border}`, background: 'rgba(7,7,12,0.85)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#6382FF,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#fff', boxShadow: '0 0 16px rgba(99,130,255,0.4)' }}>TV</div>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5 }}>TradeValue <span style={{ color: C.accent }}>Pro</span></span>
          </div>
          <div className="tv-landing-nav" style={{ display: 'flex', alignItems: 'center', gap: 32, marginRight: 32 }}>
            {[['#features', 'Можливості'], ['#pricing', 'Тарифи'], ['#testimonials', 'Відгуки']].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: 14, fontWeight: 500, color: C.muted, textDecoration: 'none' }}>{label}</a>
            ))}
          </div>
          <div className="tv-landing-nav" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link href="/dashboard" style={{ ...btn(false), padding: '9px 18px', fontSize: 13 }}>Увійти</Link>
            <a href="/auth/register" style={{ ...btn(true), padding: '9px 18px', fontSize: 13 }}>Реєстрація</a>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="tv-landing-hamburger" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: C.text }}>
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileMenu && (
          <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[['#features', 'Можливості'], ['#pricing', 'Тарифи'], ['#testimonials', 'Відгуки']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileMenu(false)} style={{ fontSize: 15, fontWeight: 500, color: C.muted, textDecoration: 'none' }}>{label}</a>
            ))}
            <a href="/auth/register" onClick={() => setMobileMenu(false)} style={{ ...btn(true), justifyContent: 'center' }}>Реєстрація</a>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 140, paddingBottom: 100, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,130,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(99,130,255,0.1)', border: '1px solid rgba(99,130,255,0.2)', fontSize: 13, fontWeight: 600, color: C.accent, marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success, boxShadow: `0 0 8px ${C.success}` }} />
            1,240+ магазинів вже використовують
          </div>

          <h1 style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 900, letterSpacing: -2, lineHeight: 1.1, marginBottom: 24, background: 'linear-gradient(135deg,#F0F0F8 0%,#A0A0CC 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Система оцінки<br />б/у техніки для<br /><span style={{ background: 'linear-gradient(135deg,#6382FF,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>вашого бізнесу</span>
          </h1>

          <p style={{ fontSize: 18, color: C.muted, lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
            Стандартизуйте оцінку техніки, контролюйте менеджерів і збільшуйте прибуток. Менеджер оцінює пристрій за 3 хвилини.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/register" style={btn(true)}>Спробувати безкоштовно <ArrowRight size={16} /></a>
            <Link href="/dashboard" style={btn(false)}>Демо →</Link>
          </div>

          <p style={{ fontSize: 12, color: C.muted2, marginTop: 16 }}>Не потрібна кредитна картка · 5 оцінок безкоштовно</p>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.card }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }} className="tv-stats-grid">
          {STATS.map(({ value, suffix, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: -1, color: C.accent, marginBottom: 6 }}>
                <Counter to={value} suffix={suffix} />
              </p>
              <p style={{ fontSize: 14, color: C.muted }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Можливості</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: -1.5, marginBottom: 16 }}>Все що потрібно для<br />ефективного викупу</h2>
            <p style={{ fontSize: 16, color: C.muted, maxWidth: 480, margin: '0 auto' }}>Від форми оцінки до аналітики по кожному менеджеру — все в одному місці</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="tv-grid-3-land">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, borderRadius: '50%', background: 'rgba(99,130,255,0.04)', filter: 'blur(20px)', pointerEvents: 'none' }} />
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,130,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>{icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section style={{ background: C.card, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Як це працює</p>
          <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, letterSpacing: -1, marginBottom: 56 }}>Від реєстрації до першої оцінки<br />за 10 хвилин</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }} className="tv-grid-4-land">
            {[
              { n: '01', title: 'Реєструєтесь', desc: 'Створюєте акаунт і компанію. Займає 2 хвилини.' },
              { n: '02', title: 'Налаштовуєте', desc: 'Виставляєте правила оцінки, відсотки і заборонені моделі.' },
              { n: '03', title: 'Додаєте команду', desc: 'Запрошуєте менеджерів і налаштовуєте їх права доступу.' },
              { n: '04', title: 'Оцінюєте', desc: 'Менеджери оцінюють техніку — система рахує все автоматично.' },
            ].map(({ n, title, desc }) => (
              <div key={n} style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: 'rgba(99,130,255,0.2)', letterSpacing: -2, marginBottom: 12 }}>{n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Тарифи</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: -1.5, marginBottom: 16 }}>Прозорі ціни без сюрпризів</h2>
            <p style={{ fontSize: 16, color: C.muted, marginBottom: 28 }}>Починайте безкоштовно, масштабуйтесь разом з нами</p>

            {/* Billing toggle */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '6px 16px', background: C.card, borderRadius: 99, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: !billingAnnual ? C.text : C.muted }}>Щомісяця</span>
              <button onClick={() => setBillingAnnual(!billingAnnual)} style={{
                width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
                background: billingAnnual ? C.accent : C.border2, position: 'relative', transition: 'background 0.2s',
              }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: billingAnnual ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
              </button>
              <span style={{ fontSize: 13, fontWeight: 600, color: billingAnnual ? C.text : C.muted }}>
                Щорічно <span style={{ background: 'rgba(52,217,138,0.15)', color: C.success, padding: '2px 7px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>−20%</span>
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, alignItems: 'start' }} className="tv-grid-3-land">
            {PLANS.map(plan => {
              const price = billingAnnual ? Math.round(plan.price * 0.8) : plan.price
              return (
                <div key={plan.name} style={{
                  background: plan.highlight ? 'linear-gradient(135deg,rgba(99,130,255,0.08),rgba(167,139,250,0.05))' : C.card,
                  border: `1.5px solid ${plan.highlight ? 'rgba(99,130,255,0.35)' : C.border}`,
                  borderRadius: 20, padding: 32, position: 'relative',
                  boxShadow: plan.highlight ? '0 0 50px rgba(99,130,255,0.12)' : 'none',
                }}>
                  {plan.badge && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', borderRadius: 99, background: 'linear-gradient(135deg,#6382FF,#A78BFA)', fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                      {plan.badge}
                    </div>
                  )}

                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: plan.color, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>{plan.name}</p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: price === 0 ? 36 : 42, fontWeight: 900, letterSpacing: -2, color: C.text }}>
                        {price === 0 ? 'Безкоштовно' : `₴${price}`}
                      </span>
                      {price > 0 && <span style={{ fontSize: 14, color: C.muted, paddingBottom: 6 }}>/ {plan.period}</span>}
                    </div>
                    <p style={{ fontSize: 13, color: C.muted }}>{plan.desc}</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                    {plan.features.map(({ t, ok }) => (
                      <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: ok ? 'rgba(52,217,138,0.15)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {ok ? <CheckCircle size={11} color={C.success} /> : <span style={{ width: 4, height: 4, borderRadius: '50%', background: C.muted2, display: 'block' }} />}
                        </div>
                        <span style={{ fontSize: 13, color: ok ? C.text : C.muted2, fontWeight: ok ? 500 : 400 }}>{t}</span>
                      </div>
                    ))}
                  </div>

                  <a href="/auth/register" style={{
                    ...btn(plan.highlight),
                    width: '100%', justifyContent: 'center', borderRadius: 10,
                    background: plan.highlight ? 'linear-gradient(135deg,#6382FF,#A78BFA)' : C.card2,
                    border: plan.highlight ? 'none' : `1px solid ${C.border2}`,
                    color: plan.highlight ? '#fff' : C.muted,
                    boxShadow: plan.highlight ? '0 0 20px rgba(99,130,255,0.3)' : 'none',
                    display: 'flex', textDecoration: 'none',
                  }}>{plan.cta}</a>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <section id="testimonials" style={{ background: C.card, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Відгуки</p>
            <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, letterSpacing: -1 }}>Що кажуть наші клієнти</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="tv-grid-3-land">
            {TESTIMONIALS.map(({ name, role, text, stars }) => (
              <div key={name} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 18 }}>
                  {Array.from({ length: stars }).map((_, i) => <Star key={i} size={15} color={C.warning} fill={C.warning} />)}
                </div>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic' }}>"{text}"</p>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700 }}>{name}</p>
                  <p style={{ fontSize: 12, color: C.muted2, marginTop: 2 }}>{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REGISTER ───────────────────────────────────────────────────────── */}
      <section id="register" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 800, letterSpacing: -1, marginBottom: 12 }}>Почніть прямо зараз</h2>
            <p style={{ fontSize: 15, color: C.muted }}>Безкоштовно · Без кредитної картки · 5 хвилин на налаштування</p>
          </div>

          {regStep === 'form' ? (
            <form onSubmit={handleReg} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 36, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: "Ваше ім'я *", ph: 'Олексій Коваль', key: 'name', type: 'text' },
                { label: 'Email *', ph: 'oleksii@shop.ua', key: 'email', type: 'email' },
                { label: 'Назва компанії', ph: 'ТехноМаркет', key: 'company', type: 'text' },
                { label: 'Пароль *', ph: '••••••••', key: 'password', type: 'password' },
              ].map(({ label, ph, key, type }) => (
                <div key={key}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 7 }}>{label}</p>
                  <input type={type} placeholder={ph} required={label.includes('*')}
                    value={(regForm as any)[key]}
                    onChange={e => setRegForm(r => ({ ...r, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: C.card2, border: `1px solid ${C.border2}`, color: C.text, fontFamily: 'inherit', fontSize: 14, outline: 'none' }} />
                </div>
              ))}

              <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(52,217,138,0.06)', border: '1px solid rgba(52,217,138,0.15)', fontSize: 13, color: C.muted }}>
                ✓ Починаєте з тарифом <strong style={{ color: C.success }}>Starter (безкоштовно)</strong>. Можна змінити в будь-який момент.
              </div>

              <button type="submit" style={{ ...btn(true), justifyContent: 'center', padding: '13px', fontSize: 15, borderRadius: 11, width: '100%' }}>
                Створити акаунт безкоштовно
              </button>

              <p style={{ textAlign: 'center', fontSize: 12, color: C.muted2 }}>
                Вже маєте акаунт? <Link href="/dashboard" style={{ color: C.accent, textDecoration: 'none', fontWeight: 600 }}>Увійти</Link>
              </p>
            </form>
          ) : (
            <div style={{ background: C.card, border: '1px solid rgba(52,217,138,0.25)', borderRadius: 20, padding: 48, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(52,217,138,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={32} color={C.success} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Акаунт створено!</h3>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 28 }}>
                Ласкаво просимо, <strong style={{ color: C.text }}>{regForm.name}</strong>!<br />
                Ваш акаунт готовий до роботи.
              </p>
              <Link href="/dashboard" style={{ ...btn(true), justifyContent: 'center', display: 'flex', textDecoration: 'none' }}>
                Перейти до дашборду <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6382FF,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: '#fff' }}>TV</div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>TradeValue Pro</span>
        </div>
        <p style={{ fontSize: 13, color: C.muted2 }}>© 2025 TradeValue Pro. Система оцінки б/у техніки.</p>
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
        }
      `}</style>
    </div>
  )
}
