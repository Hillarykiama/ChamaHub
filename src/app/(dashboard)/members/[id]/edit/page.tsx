import { createServerSupabase } from '@/lib/supabase/server'
import EditMemberForm from '@/components/members/edit-member-form'

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: member, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !member) {
    return <p className="text-sm text-red-500">Member not found.</p>
  }

  return (
    <div>
      <div className="mb-8">
        
         < a href="/members"
          style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12 }}
        >
          ← Back to members
        </a>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a2e1a', letterSpacing: '-0.5px' }}>
          Edit member
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
          Update {member.full_name}'s details
        </p>
      </div>
      <EditMemberForm member={member} />
    </div>
  )
}