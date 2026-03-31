import { createServerSupabase } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createServerSupabase()

  const [{ count: memberCount }, { count: loanCount }, { data: contributions }] =
    await Promise.all([
      supabase.from('members').select('*', { count: 'exact', head: true }),
      supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('contributions').select('amount, status').eq('period', new Date().toISOString().slice(0, 7)),
    ])

  const totalSavings =
    contributions?.filter((c) => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0) ?? 0

  const collectionRate =
    contributions && contributions.length > 0
      ? Math.round((contributions.filter((c) => c.status === 'paid').length / contributions.length) * 100)
      : 0

  const metrics = [
    { label: 'Total savings', value: 'KES ' + totalSavings.toLocaleString(), sub: 'This month' },
    { label: 'Active loans', value: String(loanCount ?? 0), sub: 'Outstanding' },
    { label: 'Members', value: String(memberCount ?? 0), sub: 'All active' },
    { label: 'Collection rate', value: collectionRate + '%', sub: 'This month' },
  ]

  const links = [
    { href: '/members', label: 'Manage members', desc: 'Add or edit members' },
    { href: '/contributions', label: 'Contributions', desc: 'Record and collect payments' },
    { href: '/loans', label: 'Loans', desc: 'Approve and track loans' },
    { href: '/meetings', label: 'Meetings', desc: 'Schedule and send reminders' },
    { href: '/reports', label: 'Reports', desc: 'View financial summaries' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{m.label}</p>
            <p className="text-xl font-semibold text-gray-900">{m.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {links.map((item) => (
          
            <a key={item.href}
            href={item.href}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <p className="text-sm font-medium text-gray-900">{item.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}