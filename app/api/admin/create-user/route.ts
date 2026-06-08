import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, name, role, company_id } = await request.json()

    if (!email || !password || !company_id) {
      return NextResponse.json({ error: 'email, password, company_id required' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Create user in auth.users
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm email
      user_metadata: { name },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Link to company in public.users
    await supabaseAdmin.from('users').upsert({
      id: data.user.id,
      email,
      name: name || email.split('@')[0],
      role: role || 'manager',
      company_id,
    })

    return NextResponse.json({ success: true, userId: data.user.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
