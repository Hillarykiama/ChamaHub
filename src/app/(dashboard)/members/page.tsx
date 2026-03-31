import { createServerSupabase } from '@/lib/supabase/server'

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Members</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {members?.length ?? 0} total members
          </p>
        </div>
        
          < a href="/members/new"
          className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add member
        </a>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Joined</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {members && members.length > 0 ? (
              members.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700">
                        {member.full_name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">
                        {member.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{member.phone}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        member.role === 'chairperson'
                          ? 'bg-blue-50 text-blue-700'
                          : member.role === 'treasurer'
                          ? 'bg-green-50 text-green-700'
                          : member.role === 'secretary'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(member.joined_at).toLocaleDateString('en-KE', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
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