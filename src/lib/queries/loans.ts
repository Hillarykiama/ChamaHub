import { createServerSupabase } from '@/lib/supabase/server'

export async function getLoans(chamaId: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('loans')
    .select(`
      id, amount, balance, rate, purpose, status, disbursed_at,
      members(id, full_name, phone)
    `)
    .eq('chama_id', chamaId)
    .order('disbursed_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createLoan(loan: {
  chama_id: string
  member_id: string
  amount: number
  balance: number
  rate: number
  purpose: string
  status: string
}) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('loans')
    .insert(loan)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateLoanBalance(
  id: string,
  newBalance: number
) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('loans')
    .update({
      balance: newBalance,
      status: newBalance === 0 ? 'paid' : 'active',
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function approveLoan(id: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('loans')
    .update({
      status: 'active',
      disbursed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}