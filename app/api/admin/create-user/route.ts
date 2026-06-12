import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { verifyOwnerOrAdmin } from '@/lib/api-auth'

export async function POST(request: Request) {
  try {
    // Verify caller is authenticated owner/admin
    const caller = await verifyOwnerOrAdmin(request)
    if (!caller) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, password, name, role, company_id } = await request.json()

    if (!email || !password || !company_id) {
      return NextResponse.json({ error: 'email, password, company_id required' }, { status: 400 })
    }

    // Owners can only create users in their own company
    if (caller.role !== 'owner' || caller.companyId !== company_id) {
      // Allow site admin to create anywhere
      const supabaseCheck = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const { data: { user } } = await supabaseCheck.auth.getUser(request.headers.get('Authorization')?.split(' ')[1] || '')
      if (user?.email !== (process.env.ADMIN_EMAIL || '') && caller.companyId !== company_id) {
        return NextResponse.json({ error: 'Forbidden: cannot create users in other companies' }, { status: 403 })
      }
    }

    // Prevent privilege escalation: cannot assign higher role than caller has
    const roleHierarchy = ['viewer', 'manager', 'admin', 'owner']
    const callerLevel = roleHierarchy.indexOf(caller.role)
    const newRoleLevel = roleHierarchy.indexOf(role || 'manager')
    if (newRoleLevel >= callerLevel && caller.role !== 'owner') {
      return NextResponse.json({ error: 'Cannot assign equal or higher role' }, { status: 403 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existing = existingUsers?.users?.find(u => u.email === email)

    let userId: string
    if (existing) {
      userId = existing.id
      await supabaseAdmin.auth.admin.updateUserById(userId, { password })
    } else {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { name, role, company_id },
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      userId = data.user.id
    }

    await new Promise(r => setTimeout(r, 500))

    const { error: updateError } = await supabaseAdmin.from('users')
      .update({ name: name || email.split('@')[0], role: role || 'manager', company_id })
      .eq('id', userId)

    if (updateError) {
      await supabaseAdmin.from('users').upsert({
        id: userId, email,
        name: name || email.split('@')[0],
        role: role || 'manager', company_id,
      })
    }

    return NextResponse.json({ success: true, userId })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
