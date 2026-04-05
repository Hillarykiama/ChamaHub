import { createServerSupabase } from '@/lib/supabase/server'

export async function getContributions(chamaId: string, period: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('contributions')
    .select(`
      id, amount, status, mpesa_ref, paid_at, period,
      members(id, full_name, phone)
    `)
    .eq('chama_id', chamaId)
    .eq('period', period)
    .order('paid_at', { ascending: false })

  if (error) throw error
  return data
}

export async function recordContribution(contribution: {
  chama_id: string
  member_id: string
  amount: number
  period: string
  status: string
  mpesa_ref?: string
  paid_at?: string
}) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('contributions')
    .insert(contribution)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function markContributionPaid(
  id: string,
  mpesaRef: string
) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('contributions')
    .update({
      status: 'paid',
      mpesa_ref: mpesaRef,
      paid_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}