
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
    { label: 'Total savings', value: 'KES ' + totalSavings.toLocaleString(), sub: 'This month', color: '#3B6D11' },
    { label: 'Active loans', value: String(loanCount ?? 0), sub: 'Outstanding', color: '#b45309' },
    { label: 'Members', value: String(memberCount ?? 0), sub: 'All active', color: '#1d4ed8' },
    { label: 'Collection rate', value: collectionRate + '%', sub: 'This month', color: '#3B6D11' },
  ]

  const links = [
    { href: '/members', label: 'Manage members', desc: 'Add or edit members', icon: '👥' },
    { href: '/contributions', label: 'Contributions', desc: 'Record and collect payments', icon: '💰' },
    { href: '/loans', label: 'Loans', desc: 'Approve and track loans', icon: '🏦' },
    { href: '/meetings', label: 'Meetings', desc: 'Schedule and send reminders', icon: '📅' },
    { href: '/reports', label: 'Reports', desc: 'View financial summaries', icon: '📊' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a2e1a', letterSpacing: '-0.5px' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
          {new Date().toLocaleDateString('en-KE', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '20px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              {m.label}
            </p>
            <p style={{ fontSize: 26, fontWeight: 700, color: m.color, marginBottom: 4 }}>
              {m.value}
            </p>
            <p style={{ fontSize: 12, color: '#9ca3af' }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
          Quick access
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {links.map((item) => (
            
             < a key={item.href}
              href={item.href}
              className="hover:border-green-400 hover:bg-green-50 transition-all"
              style={{
                background: '#ffffff',
                borderRadius: 14,
                padding: '18px 20px',
                border: '1px solid #e2e8f0',
                textDecoration: 'none',
                display: 'block',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1a2e1a', marginBottom: 4 }}>{item.label}</p>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>{item.desc}</p>
              </a>  
          ))}
        </div>
      </div>
    </div>
  )
}