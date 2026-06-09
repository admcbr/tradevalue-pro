import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, company_id, permissions } = body

    if (!user_id || !company_id || !permissions) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Check if record exists
    const { data: existing } = await supabaseAdmin
      .from('user_permissions')
      .select('id')
      .eq('user_id', user_id)
      .single()

    const payload = {
      user_id,
      company_id,
      see_dashboard: permissions.see_dashboard,
      see_history_own: permissions.see_history_own,
      see_history_all: permissions.see_history_all,
      see_statistics: permissions.see_statistics,
      see_team: permissions.see_team,
      can_edit_rules: permissions.can_edit_rules,
      can_manage_categories: permissions.can_manage_categories,
    }

    let error
    if (existing) {
      const { error: e } = await supabaseAdmin
        .from('user_permissions')
        .update(payload)
        .eq('user_id', user_id)
      error = e
    } else {
      const { error: e } = await supabaseAdmin
        .from('user_permissions')
        .insert(payload)
      error = e
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
