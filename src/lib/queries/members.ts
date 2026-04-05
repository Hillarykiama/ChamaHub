import { createServerSupabase } from '@/lib/supabase/server'

export async function getMembers(chamaId: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('members')
    .select(`
      id, full_name, phone, role, joined_at, status,
      contributions(amount, status)
    `)
    .eq('chama_id', chamaId)
    .order('joined_at')

  if (error) throw error
  return data
}

export async function addMember(member: {
  chama_id: string
  full_name: string
  phone: string
  role: string
  joined_at: string
}) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('members')
    .insert(member)
    .select()
    .single()

  if (error) throw error
  return data
}