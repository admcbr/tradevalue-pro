import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Default category names for widget (simplified — no full field structure needed)
const DEFAULT_CATEGORY_NAMES = [
  { id: 'cat_laptop',  name: 'Ноутбуки',   icon: '💻' },
  { id: 'cat_phone',   name: 'Смартфони',  icon: '📱' },
  { id: 'cat_tablet',  name: 'Планшети',   icon: '📲' },
  { id: 'cat_pc',      name: 'ПК та комплектуючі', icon: '🖥️' },
  { id: 'cat_gpu',     name: 'Відеокарти', icon: '🎮' },
  { id: 'cat_console', name: 'Консолі',    icon: '🕹️' },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('company_id')
  if (!companyId) return NextResponse.json({ error: 'company_id required' }, { status: 400, headers: CORS })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: company } = await supabase
    .from('companies')
    .select('id, name, plan, plan_expires_at, widget_title, widget_color')
    .eq('id', companyId)
    .maybeSingle()

  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404, headers: CORS })

  // Widget only for pro/business
  const now = new Date()
  let plan = company.plan || 'starter'
  if (plan !== 'starter' && company.plan_expires_at && now > new Date(company.plan_expires_at)) {
    plan = 'starter'
  }
  if (plan !== 'business') {
    return NextResponse.json({ error: 'Widget requires Pro or Business plan' }, { status: 403, headers: CORS })
  }

  // Load company rules
  const { data: rules } = await supabase
    .from('company_rules')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle()

  // Try to load custom categories from Supabase (saved there if synced)
  const { data: customCats } = await supabase
    .from('categories')
    .select('id, name')
    .eq('company_id', companyId)
    .order('created_at')

  // Use custom categories if exist, otherwise defaults
  const categories = (customCats && customCats.length > 0)
    ? customCats
    : DEFAULT_CATEGORY_NAMES

  return NextResponse.json({
    company: {
      id: company.id,
      name: company.name,
      widget_title: company.widget_title || `Оцінка техніки — ${company.name}`,
      widget_color: company.widget_color || '#6382FF',
    },
    categories,
    rules: rules || {
      default_buy_percent: 20,
      default_sell_percent: 5,
      min_profit: 0,
      min_profitability: 0,
      min_buy_price: 0,
    },
  }, { headers: CORS })
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}
