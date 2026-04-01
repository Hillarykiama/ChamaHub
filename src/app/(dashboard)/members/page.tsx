import { createServerSupabase } from '@/lib/supabase/server'
import DeleteMemberButton from '@/components/members/delete-member-button'

export default async function MembersPage() {
  const supabase = await createServerSupabase()

  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .order('joined_at')

  if (error) {
    return <p className="text-sm text-red-500">Failed to load members.</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a2e1a', letterSpacing: '-0.5px' }}>
            Members
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {members?.length ?? 0} total members
          </p>
        </div>
        
          < a href="/members/new"
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #3B6D11, #639922)',
            color: '#ffffff',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          + Add member
        </a>
      </div>

      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <th className="text-left px-6 py-3" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Name</th>
              <th className="text-left px-6 py-3" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Phone</th>
              <th className="text-left px-6 py-3" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Role</th>
              <th className="text-left px-6 py-3" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Joined</th>
              <th className="text-left px-6 py-3" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</th>
              <th className="text-left px-6 py-3" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members && members.length > 0 ? (
              members.map((member) => (
                <tr
                  key={member.id}
                  style={{ borderBottom: '1px solid #f1f5f9' }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3B6D11, #639922)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#fff',
                        flexShrink: 0,
                      }}>
                        {member.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: '#1a2e1a' }}>{member.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4" style={{ color: '#6b7280' }}>{member.phone}</td>
                  <td className="px-6 py-4">
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 100,
                      fontSize: 12,
                      fontWeight: 500,
                      background: member.role === 'chairperson' ? '#eff6ff' : member.role === 'treasurer' ? '#f0fdf4' : member.role === 'secretary' ? '#fffbeb' : '#f9fafb',
                      color: member.role === 'chairperson' ? '#1d4ed8' : member.role === 'treasurer' ? '#3B6D11' : member.role === 'secretary' ? '#b45309' : '#6b7280',
                    }}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4" style={{ color: '#6b7280' }}>
                    {new Date(member.joined_at).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 100,
                      fontSize: 12,
                      fontWeight: 500,
                      background: '#f0fdf4',
                      color: '#3B6D11',
                    }}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      
                        < a href={`/members/${member.id}/edit`}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 500,
                          background: '#f8fafc',
                          color: '#374151',
                          border: '1px solid #e2e8f0',
                          textDecoration: 'none',
                        }}
                      >
                        Edit
                      </a>
                      <DeleteMemberButton id={member.id} name={member.full_name} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center" style={{ color: '#9ca3af', fontSize: 14 }}>
                  No members yet. Add your first member to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}