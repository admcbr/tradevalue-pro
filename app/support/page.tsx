'use client'

import { useState } from 'react'
import { useLang } from '@/lib/i18n'
import {
  MessageCircle, Mail, Phone, Globe, ChevronDown, ChevronUp,
  Zap, Shield, BarChart2, Users, CheckCircle, Star,
} from 'lucide-react'
import { Card, SectionLabel } from '@/components/ui'

const C = {
  card: '#0E0E16', card2: '#141422', border: '#1E1E30', border2: '#282840',
  accent: '#6382FF', success: '#34D98A', danger: '#F87171', warning: '#FBBF24',
  text: '#EDEDF0', muted: '#8080AA', muted2: '#4A4A70',
}

export default function SupportPage() {
  const { lang } = useLang()
  const isUk = lang === 'uk'
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const content = {
    uk: {
      title: 'Підтримка та контакти',
      sub: 'Ми завжди готові допомогти. Звертайтесь зручним способом.',
      about_title: 'Про TradeValue Pro',
      about_text: 'TradeValue Pro — це SaaS-платформа для стандартизації оцінки та викупу б/у техніки. Ми допомагаємо магазинам, ломбардам та перекупникам автоматизувати процес оцінки, контролювати роботу менеджерів і збільшувати прибутковість кожної угоди.',
      about_text2: 'Платформа створена командою підприємців з досвідом у рітейлі б/у техніки. Ми знаємо проблему зсередини: менеджери купують занадто дорого, не дотримуються стандартів компанії, складно контролювати роботу кількох точок. TradeValue Pro вирішує ці проблеми.',
      why_title: 'Чому обирають нас',
      contact_title: 'Зв\'язатись з нами',
      faq_title: 'Часті запитання',
      form_title: 'Написати в підтримку',
      form_name: 'Ваше ім\'я',
      form_email: 'Email',
      form_message: 'Повідомлення',
      form_message_ph: 'Опишіть вашу проблему або запитання...',
      form_btn: 'Надіслати повідомлення',
      form_sent: '✓ Повідомлення надіслано! Відповімо протягом 24 годин.',
      working_hours: 'Пн–Пт, 9:00–18:00',
      response_time: 'Відповідь протягом 24 годин',
      docs_title: 'Документація',
      docs_sub: 'Детальні інструкції та відео-гайди',
      stats: [
        { value: '1,240+', label: 'Активних магазинів' },
        { value: '284k+', label: 'Оцінок зроблено' },
        { value: '97%', label: 'Задоволених клієнтів' },
        { value: '< 24г', label: 'Час відповіді' },
      ],
      why: [
        { icon: <Zap size={18} color={C.accent} />, title: 'Швидко впроваджується', desc: '10 хвилин від реєстрації до першої оцінки. Не потрібні технічні знання.' },
        { icon: <Shield size={18} color={C.success} />, title: 'Захист від помилок', desc: 'Система не дасть менеджеру купити занадто дорого або не за правилами компанії.' },
        { icon: <BarChart2 size={18} color={C.warning} />, title: 'Прозора аналітика', desc: 'Бачте рентабельність кожної угоди та ефективність кожного менеджера в реальному часі.' },
        { icon: <Users size={18} color={C.accent} />, title: 'Підтримка 24/7', desc: 'Ми відповідаємо на всі запити протягом однієї робочої доби. Telegram, email, телефон.' },
      ],
      faq: [
        { q: 'Як почати користуватись TradeValue Pro?', a: 'Зареєструйтесь на головній сторінці → введіть назву компанії → налаштуйте правила оцінки → додайте менеджерів. Весь процес займає 10-15 хвилин.' },
        { q: 'Чи можна імпортувати дані з іншої системи?', a: 'Наразі підтримується ручне введення та CSV-імпорт для базових даних. Повноцінний API-імпорт з інших систем — у планах на Q3 2025.' },
        { q: 'Як додати нову категорію товарів?', a: 'Перейдіть в «Категорії» → натисніть «Нова категорія» → вкажіть назву та іконку. Потім у формі оцінки для цієї категорії натискайте «+ Поле» для додавання характеристик.' },
        { q: 'Чи можна обмежити доступ менеджера до статистики?', a: 'Так. В розділі «Команда» → розкрийте картку менеджера → розділ «Доступ до розділів» → вимкніть потрібні пункти.' },
        { q: 'Що таке Трейд-Ін оцінка?', a: 'Трейд-Ін — це окремий тип оцінки, коли клієнт здає старий пристрій в рахунок покупки нового. Система дає клієнту на 5% кращу ціну (або фіксовану надбавку, яку ви налаштуєте).' },
        { q: 'Де зберігаються мої дані?', a: 'Всі дані зберігаються в хмарній базі даних Supabase (PostgreSQL). Резервні копії щоденно. Дані не передаються третім особам.' },
        { q: 'Як скасувати підписку?', a: 'В розділі «Тарифи» → кнопка «Скасувати підписку». Скасування набирає чинності в кінці поточного оплаченого періоду. Дані зберігаються 90 днів після скасування.' },
      ],
    },
    ru: {
      title: 'Поддержка и контакты',
      sub: 'Мы всегда готовы помочь. Обращайтесь удобным способом.',
      about_title: 'О TradeValue Pro',
      about_text: 'TradeValue Pro — это SaaS-платформа для стандартизации оценки и выкупа б/у техники. Мы помогаем магазинам, ломбардам и перекупщикам автоматизировать процесс оценки, контролировать работу менеджеров и увеличивать прибыльность каждой сделки.',
      about_text2: 'Платформа создана командой предпринимателей с опытом в рознице б/у техники. Мы знаем проблему изнутри: менеджеры покупают слишком дорого, не соблюдают стандарты компании, сложно контролировать работу нескольких точек. TradeValue Pro решает эти проблемы.',
      why_title: 'Почему выбирают нас',
      contact_title: 'Связаться с нами',
      faq_title: 'Частые вопросы',
      form_title: 'Написать в поддержку',
      form_name: 'Ваше имя',
      form_email: 'Email',
      form_message: 'Сообщение',
      form_message_ph: 'Опишите вашу проблему или вопрос...',
      form_btn: 'Отправить сообщение',
      form_sent: '✓ Сообщение отправлено! Ответим в течение 24 часов.',
      working_hours: 'Пн–Пт, 9:00–18:00',
      response_time: 'Ответ в течение 24 часов',
      docs_title: 'Документация',
      docs_sub: 'Подробные инструкции и видео-гайды',
      stats: [
        { value: '1,240+', label: 'Активных магазинов' },
        { value: '284k+', label: 'Оценок сделано' },
        { value: '97%', label: 'Довольных клиентов' },
        { value: '< 24ч', label: 'Время ответа' },
      ],
      why: [
        { icon: <Zap size={18} color={C.accent} />, title: 'Быстро внедряется', desc: '10 минут от регистрации до первой оценки. Не нужны технические знания.' },
        { icon: <Shield size={18} color={C.success} />, title: 'Защита от ошибок', desc: 'Система не даст менеджеру купить слишком дорого или не по правилам компании.' },
        { icon: <BarChart2 size={18} color={C.warning} />, title: 'Прозрачная аналитика', desc: 'Видите рентабельность каждой сделки и эффективность каждого менеджера в реальном времени.' },
        { icon: <Users size={18} color={C.accent} />, title: 'Поддержка 24/7', desc: 'Мы отвечаем на все запросы в течение одного рабочего дня. Telegram, email, телефон.' },
      ],
      faq: [
        { q: 'Как начать пользоваться TradeValue Pro?', a: 'Зарегистрируйтесь на главной странице → введите название компании → настройте правила оценки → добавьте менеджеров. Весь процесс занимает 10-15 минут.' },
        { q: 'Можно ли импортировать данные из другой системы?', a: 'В настоящее время поддерживается ручной ввод и CSV-импорт для базовых данных. Полноценный API-импорт из других систем — в планах на Q3 2025.' },
        { q: 'Как добавить новую категорию товаров?', a: 'Перейдите в «Категории» → нажмите «Новая категория» → укажите название и иконку. Затем в форме оценки для этой категории нажимайте «+ Поле» для добавления характеристик.' },
        { q: 'Можно ли ограничить доступ менеджера к статистике?', a: 'Да. В разделе «Команда» → раскройте карточку менеджера → раздел «Доступ к разделам» → отключите нужные пункты.' },
        { q: 'Что такое Трейд-Ин оценка?', a: 'Трейд-Ин — это отдельный тип оценки, когда клиент сдаёт старое устройство в счёт покупки нового. Система даёт клиенту на 5% лучшую цену (или фиксированную надбавку, которую вы настроите).' },
        { q: 'Где хранятся мои данные?', a: 'Все данные хранятся в облачной базе данных Supabase (PostgreSQL). Резервные копии ежедневно. Данные не передаются третьим лицам.' },
        { q: 'Как отменить подписку?', a: 'В разделе «Тарифы» → кнопка «Отменить подписку». Отмена вступает в силу в конце текущего оплаченного периода. Данные хранятся 90 дней после отмены.' },
      ],
    },
  }

  const T = content[lang as 'uk' | 'ru']

  const contacts = [
    { icon: <MessageCircle size={20} color={C.accent} />, label: 'Telegram', value: '@tradevalue_support', link: 'https://t.me/tradevalue_support', color: C.accent },
    { icon: <Mail size={20} color={C.success} />, label: 'Email', value: 'support@tradevalue.pro', link: 'mailto:support@tradevalue.pro', color: C.success },
    { icon: <Phone size={20} color={C.warning} />, label: isUk ? 'Телефон' : 'Телефон', value: '+380 44 000 00 00', link: 'tel:+380440000000', color: C.warning },
    { icon: <Globe size={20} color={C.muted} />, label: isUk ? 'Сайт' : 'Сайт', value: 'tradevalue.pro', link: '/', color: C.muted },
  ]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, color: C.text }}>{T.title}</h1>
        <p style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>{T.sub}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }} className="tv-stats-grid">
        {T.stats.map(({ value, label }) => (
          <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
            <p style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1, color: C.accent, marginBottom: 4 }}>{value}</p>
            <p style={{ fontSize: 12, color: C.muted }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} className="tv-grid-2">
        {/* About */}
        <Card style={{ padding: 24 }}>
          <SectionLabel>{T.about_title}</SectionLabel>
          <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.8, marginBottom: 14 }}>{T.about_text}</p>
          <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.8 }}>{T.about_text2}</p>
        </Card>

        {/* Contacts */}
        <Card style={{ padding: 24 }}>
          <SectionLabel>{T.contact_title}</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {contacts.map(({ icon, label, value, link, color }) => (
              <a key={label} href={link} target={link.startsWith('http') ? '_blank' : undefined}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 11, background: C.card2, border: `1px solid ${C.border2}`, textDecoration: 'none', transition: 'border-color 0.15s' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{value}</p>
                </div>
              </a>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 9, background: 'rgba(52,217,138,0.06)', border: '1px solid rgba(52,217,138,0.15)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle size={14} color={C.success} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.success }}>{T.response_time}</p>
              <p style={{ fontSize: 11, color: C.muted2 }}>{T.working_hours}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Why us */}
      <Card style={{ padding: 24, marginBottom: 20 }}>
        <SectionLabel>{T.why_title}</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }} className="tv-grid-2">
          {T.why.map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 14, padding: '14px', borderRadius: 12, background: C.card2, border: `1px solid ${C.border2}` }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,130,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 4 }}>{title}</p>
                <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} className="tv-grid-2">
        {/* FAQ */}
        <Card style={{ padding: 24 }}>
          <SectionLabel>{T.faq_title}</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {T.faq.map(({ q, a }, i) => (
              <div key={i} style={{ border: `1px solid ${C.border2}`, borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'inherit', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text, textAlign: 'left' }}>{q}</span>
                  {openFaq === i ? <ChevronUp size={14} color={C.muted2} /> : <ChevronDown size={14} color={C.muted2} />}
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 14px 14px', fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{a}</div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Contact form */}
        <Card style={{ padding: 24 }}>
          <SectionLabel>{T.form_title}</SectionLabel>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <CheckCircle size={40} color={C.success} style={{ margin: '0 auto 16px', display: 'block' }} />
              <p style={{ fontSize: 14, color: C.success, fontWeight: 600 }}>{T.form_sent}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'name', label: T.form_name, ph: isUk ? 'Олексій Коваль' : 'Алексей Ковалёв', type: 'text' },
                { key: 'email', label: T.form_email, ph: 'oleksii@shop.ua', type: 'email' },
              ].map(({ key, label, ph, type }) => (
                <div key={key}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>{label}</p>
                  <input type={type} required placeholder={ph}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 13px', borderRadius: 9, background: C.card2, border: `1px solid ${C.border2}`, color: C.text, fontFamily: 'inherit', fontSize: 13, outline: 'none' }} />
                </div>
              ))}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>{T.form_message}</p>
                <textarea required rows={5} placeholder={T.form_message_ph}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ width: '100%', padding: '10px 13px', borderRadius: 9, background: C.card2, border: `1px solid ${C.border2}`, color: C.text, fontFamily: 'inherit', fontSize: 13, outline: 'none', resize: 'none', lineHeight: 1.6 }} />
              </div>
              <button type="submit" style={{
                padding: '11px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#6382FF,#A78BFA)', color: '#fff',
                fontFamily: 'inherit', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                boxShadow: '0 0 20px rgba(99,130,255,0.25)',
              }}>{T.form_btn}</button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
