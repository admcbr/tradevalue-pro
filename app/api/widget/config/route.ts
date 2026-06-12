import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { DEFAULT_CATEGORIES } from '@/lib/defaults'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Fields never shown in widget (internal use only)
const WIDGET_HIDDEN_FIELD_IDS = ['lf_water', 'lf_bios']

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

  const now = new Date()
  let plan = company.plan || 'starter'
  if (plan !== 'starter' && company.plan_expires_at && now > new Date(company.plan_expires_at)) {
    plan = 'starter'
  }
  if (plan !== 'business') {
    return NextResponse.json({ error: 'Widget requires Business plan' }, { status: 403, headers: CORS })
  }

  // Load company rules from DB
  const { data: companyRules } = await supabase
    .from('company_rules')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle()

  const buyPercent  = companyRules?.default_buy_percent  ?? 20
  const sellPercent = companyRules?.default_sell_percent ?? 5
  const minBuyPrice = companyRules?.min_buy_price        ?? 0
  const maxBuyPrice = companyRules?.max_buy_price        ?? 999999
  const minProfit   = companyRules?.min_profit           ?? 0
  const minProfitability = companyRules?.min_profitability ?? 0

  // Build categories — apply company rules to each category's rules
  // and strip hidden fields
  const categories = DEFAULT_CATEGORIES.filter(c => c.is_active).map(cat => ({
    ...cat,
    fields: cat.fields.filter(f => !WIDGET_HIDDEN_FIELD_IDS.includes(f.id)),
    // Override category rules with company rules
    rules: {
      ...cat.rules,
      buy_percent:   buyPercent,
      sell_percent:  sellPercent,
      min_buy_price: minBuyPrice,
      max_buy_price: maxBuyPrice,
    },
  }))

  return NextResponse.json({
    company: {
      id: company.id,
      name: company.name,
      widget_title: company.widget_title || `Оцінка техніки — ${company.name}`,
      widget_color: company.widget_color || '#6382FF',
    },
    categories,
    rules: {
      default_buy_percent:  buyPercent,
      default_sell_percent: sellPercent,
      min_buy_price:        minBuyPrice,
      max_buy_price:        maxBuyPrice,
      min_profit:           minProfit,
      min_profitability:    minProfitability,
    },
  }, { headers: CORS })
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}
