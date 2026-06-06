'use server'

import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const supabase = await createServerSupabase()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/auth/onboarding`,
    },
  })

  if (error) return { error: error.message }
  if (data.user && !data.session) {
    // Email confirmation required
    return { message: 'check_email' }
  }
  redirect('/auth/onboarding')
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export async function createCompany(formData: FormData) {
  const companyName = formData.get('company_name') as string
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Create company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({ name: companyName })
    .select()
    .single()

  if (companyError) return { error: companyError.message }

  // Update user record
  await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || user.email!.split('@')[0],
      role: 'owner',
      company_id: company.id,
    })

  // Seed default rules for company
  await supabase.from('company_rules').insert({
    company_id: company.id,
    default_buy_percent: 20,
    default_sell_percent: 5,
    min_profit: 2500,
    min_profitability: 15,
    max_buy_price: 50000,
    min_buy_price: 3000,
    max_market_price: 80000,
    min_market_price: 2000,
  })

  redirect('/dashboard')
}
