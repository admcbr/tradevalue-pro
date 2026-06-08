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

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existing = existingUsers?.users?.find(u => u.email === email)

    let userId: string

    if (existing) {
      // User exists — just update their record
      userId = existing.id
      // Update password if needed
      await supabaseAdmin.auth.admin.updateUserById(userId, { password })
    } else {
      // Create new user
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role, company_id },
      })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      userId = data.user.id
    }

    // Wait a bit for trigger to run first
    await new Promise(r => setTimeout(r, 500))

    // Now UPDATE (not insert) the user record with correct role and company
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        name: name || email.split('@')[0],
        role: role || 'manager',
        company_id,
      })
      .eq('id', userId)

    if (updateError) {
      // Try upsert as fallback
      await supabaseAdmin.from('users').upsert({
        id: userId,
        email,
        name: name || email.split('@')[0],
        role: role || 'manager',
        company_id,
      })
    }

    return NextResponse.json({ success: true, userId })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
