# 🚀 Деплой TradeValue Pro

## Крок 1 — Supabase (база даних + авторизація)

1. Зайдіть на https://supabase.com → Sign Up
2. New Project → назва `tradevalue-pro`, регіон: **Frankfurt (eu-central-1)**
3. SQL Editor → вставте вміст `supabase-schema.sql` → Run
4. Settings → API → скопіюйте:
   - **Project URL** (виглядає як `https://xxxx.supabase.co`)
   - **anon public** key

5. Authentication → Email → вимкніть "Confirm email" для тестування
   (або залиште для production — тоді user отримає email підтвердження)

## Крок 2 — GitHub

1. github.com → New repository → назва `tradevalue-pro`
2. Завантажте проєкт:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/tradevalue-pro.git
git push -u origin main
```

## Крок 3 — Vercel (хостинг)

1. vercel.com → Sign Up через GitHub
2. New Project → Import `tradevalue-pro`
3. Environment Variables — додайте:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...
   NEXT_PUBLIC_SITE_URL = https://your-app.vercel.app
   ```
4. Deploy!

## Крок 4 — Supabase Site URL

Supabase → Authentication → URL Configuration:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth/callback`

## Локальна розробка

```bash
cp .env.local.example .env.local
# Заповніть .env.local
npm install
npm run dev
```

## Структура

- `/` — Лендінг (публічний)
- `/auth/login` — Вхід
- `/auth/register` — Реєстрація
- `/auth/onboarding` — Створення компанії
- `/dashboard` — Захищений дашборд
- `/estimate` — Форма оцінки

## Тарифні ліміти (в базі даних)

| Тариф    | Оцінок/міс |
|----------|-----------|
| starter  | 5         |
| pro      | 300       |
| business | необмежено|
