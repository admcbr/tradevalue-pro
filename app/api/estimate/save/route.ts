import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const PLAN_LIMITS: Record<string, number> = {
  starter:  999999, // full access during 3-day trial
  pro:      300,
  business: 999999,
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('id, name, company_id')
      .eq('id', user.id)
      .maybeSingle()

    if (!userRecord?.company_id) {
      return NextResponse.json({ error: 'No company found' }, { status: 400 })
    }

    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('plan, plan_expires_at, trial_ends_at, estimations_this_month')
      .eq('id', userRecord.company_id)
      .maybeSingle()

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 400 })
    }

    // Check plan expiry
    const now = new Date()
    let effectivePlan = company.plan || 'starter'

    if (effectivePlan === 'starter' && (company as any).trial_ends_at) {
      // Trial expired — block completely
      if (now > new Date((company as any).trial_ends_at)) {
        return NextResponse.json({ error: 'trial_expired' }, { status: 403 })
      }
    } else if (effectivePlan !== 'starter' && company.plan_expires_at) {
      const expiresAt = new Date(company.plan_expires_at)
      if (now > expiresAt) {
        effectivePlan = 'starter'
        await supabaseAdmin
          .from('companies')
          .update({ plan: 'starter', plan_expires_at: null })
          .eq('id', userRecord.company_id)
      }
    }

    // Check monthly limit
    const limit = PLAN_LIMITS[effectivePlan] ?? 5
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const { count } = await supabaseAdmin
      .from('estimations')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', userRecord.company_id)
      .gte('created_at', startOfMonth)

    const usedThisMonth = count || 0

    if (usedThisMonth >= limit) {
      return NextResponse.json({
        error: 'plan_limit_exceeded',
        plan: effectivePlan,
        limit,
        used: usedThisMonth,
      }, { status: 403 })
    }

    // Save estimation
    const body = await request.json()

    const { data: saved, error: insertError } = await supabaseAdmin
      .from('estimations')
      .insert({
        company_id: userRecord.company_id,
        user_id: user.id,
        ...body,
      })
      .select()
      .maybeSingle()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    await supabaseAdmin
      .from('companies')
      .update({ estimations_this_month: usedThisMonth + 1 })
      .eq('id', userRecord.company_id)

    return NextResponse.json({ success: true, id: saved?.id, remaining: limit - usedThisMonth - 1 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
