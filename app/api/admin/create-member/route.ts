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

    const { name, email, password, role, companyId, phone, address } = await request.json()

    if (!email || !password || !companyId) {
      return NextResponse.json({ error: 'email, password, companyId required' }, { status: 400 })
    }

    // Owners can only create users in their own company
    if (caller.companyId !== companyId) {
      return NextResponse.json({ error: 'Forbidden: cannot create users in other companies' }, { status: 403 })
    }

    // Prevent privilege escalation
    const roleHierarchy = ['viewer', 'manager', 'admin', 'owner']
    const callerLevel = roleHierarchy.indexOf(caller.role)
    const newRoleLevel = roleHierarchy.indexOf(role || 'manager')
    if (newRoleLevel >= callerLevel) {
      return NextResponse.json({ error: 'Cannot assign equal or higher role' }, { status: 403 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Create user in auth.users with password
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Create record in public.users with company_id
    const { error: userError } = await supabaseAdmin.from('users').upsert({
      id: authUser.user.id,
      email,
      name: name || email.split('@')[0],
      role: role || 'manager',
      company_id: companyId,
      phone: phone || '',
      address: address || '',
    })

    if (userError) {
      // Rollback - delete auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId: authUser.user.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
