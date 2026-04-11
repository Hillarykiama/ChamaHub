import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('members')
    .select('id, full_name, role, phone')
    .eq('user_id', user.id)
    .single()

  const isAdmin = ['chairperson', 'treasurer', 'secretary'].includes(member?.role ?? '')

  if (isAdmin) {
    return <AdminDashboard supabase={supabase} member={member} />
  }

  return <MemberDashboard supabase={supabase} member={member} />
}

async function AdminDashboard({ supabase, member }: { supabase: any; member: any }) {
  const period = new Date().toISOString().slice(0, 7)

  const [
    { count: memberCount },
    { count: loanCount },
    { data: contributions },
    { data: pendingLoans },
  ] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }),
    supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('contributions').select('amount, status').eq('period', period),
    supabase.from('loans').select('id, amount, members(full_name)').eq('status', 'pending'),
  ])

  const totalSavings = contributions?.filter((c: any) => c.status === 'paid').reduce((sum: number, c: any) => sum + c.amount, 0) ?? 0
  const collectionRate = contributions && contributions.length > 0
    ? Math.round((contributions.filter((c: any) => c.status === 'paid').length / contributions.length) * 100)
    : 0

  const metrics = [
    { label: 'Total savings', value: 'KES ' + totalSavings.toLocaleString(), sub: 'This month', color: '#3B6D11' },
    { label: 'Active loans', value: String(loanCount ?? 0), sub: 'Outstanding', color: '#b45309' },
    { label: 'Members', value: String(memberCount ?? 0), sub: 'All active', color: '#1d4ed8' },
    { label: 'Collection rate', value: collectionRate + '%', sub: 'This month', color: '#3B6D11' },
  ]

  const adminLinks = [
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
          {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Pending loans alert */}
      {pendingLoans && pendingLoans.length > 0 && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12,
          padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#b45309' }}>
              {pendingLoans.length} loan{pendingLoans.length > 1 ? 's' : ''} awaiting your approval
            </span>
          </div>
          
           < a href="/loans"
            style={{
              fontSize: 12, fontWeight: 600, color: '#b45309',
              textDecoration: 'none', padding: '6px 14px',
              background: '#fef3c7', borderRadius: 8, border: '1px solid #fde68a',
            }}
          >
            Review now
          </a>
        </div>
      )}

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{
            background: '#ffffff', borderRadius: 16, padding: '20px 24px',
            border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              {m.label}
            </p>
            <p style={{ fontSize: 26, fontWeight: 700, color: m.color, marginBottom: 4 }}>{m.value}</p>
            <p style={{ fontSize: 12, color: '#9ca3af' }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Quick access</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {adminLinks.map((item) => (
            
              < a key={item.href}
              href={item.href}
              className="hover:border-green-400 hover:bg-green-50 transition-all"
              style={{
                background: '#ffffff', borderRadius: 14, padding: '18px 20px',
                border: '1px solid #e2e8f0', textDecoration: 'none', display: 'block',
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

async function MemberDashboard({ supabase, member }: { supabase: any; member: any }) {
  const period = new Date().toISOString().slice(0, 7)

  const [
    { data: myContributions },
    { data: myLoans },
    { data: meetings },
    { data: chama },
  ] = await Promise.all([
    supabase.from('contributions').select('*').eq('member_id', member?.id).order('created_at', { ascending: false }).limit(6),
    supabase.from('loans').select('*').eq('member_id', member?.id).order('created_at', { ascending: false }),
    supabase.from('meetings').select('*').gte('meeting_date', new Date().toISOString().slice(0, 10)).order('meeting_date').limit(3),
    supabase.from('chamas').select('name, monthly_amount').single(),
  ])

  const thisMonthContrib = myContributions?.find((c: any) => c.period === period)
  const activeLoans = myLoans?.filter((l: any) => l.status === 'active') ?? []
  const totalSaved = myContributions?.filter((c: any) => c.status === 'paid').reduce((sum: number, c: any) => sum + c.amount, 0) ?? 0

  return (
    <div>
      <div className="mb-8">
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a2e1a', letterSpacing: '-0.5px' }}>
          Welcome, {member?.full_name?.split(' ')[0]} 👋
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
          {chama?.name} · {new Date().toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* This month contribution status */}
      <div style={{
        background: thisMonthContrib?.status === 'paid' ? '#f0fdf4' : '#fffbeb',
        border: `1px solid ${thisMonthContrib?.status === 'paid' ? '#bbf7d0' : '#fde68a'}`,
        borderRadius: 16, padding: '20px 24px', marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: thisMonthContrib?.status === 'paid' ? '#3B6D11' : '#b45309', marginBottom: 4 }}>
            {new Date().toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })} contribution
          </p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#1a2e1a' }}>
            KES {(chama?.monthly_amount ?? 0).toLocaleString()}
          </p>
          {thisMonthContrib?.paid_at && (
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
              Paid on {new Date(thisMonthContrib.paid_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
              {thisMonthContrib.mpesa_ref && ` · Ref: ${thisMonthContrib.mpesa_ref}`}
            </p>
          )}
        </div>
        {thisMonthContrib?.status === 'paid' ? (
          <div style={{
            padding: '8px 16px', borderRadius: 100, background: '#3B6D11',
            color: '#fff', fontSize: 13, fontWeight: 600,
          }}>
            Paid ✓
          </div>
        ) : thisMonthContrib ? (
          
            < a href="/contributions"
            style={{
              padding: '10px 20px', borderRadius: 10,
              background: 'linear-gradient(135deg, #3B6D11, #639922)',
              color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}
          >
            Pay now
          </a>
        ) : (
          <span style={{ fontSize: 13, color: '#9ca3af' }}>Not yet generated</span>
        )}
      </div>

      {/* Member metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total saved', value: 'KES ' + totalSaved.toLocaleString(), color: '#3B6D11' },
          { label: 'Active loans', value: String(activeLoans.length), color: activeLoans.length > 0 ? '#b45309' : '#1a2e1a' },
          { label: 'Contributions', value: String(myContributions?.filter((c: any) => c.status === 'paid').length ?? 0), color: '#1d4ed8' },
        ].map((m) => (
          <div key={m.label} style={{
            background: '#ffffff', borderRadius: 16, padding: '20px 24px',
            border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              {m.label}
            </p>
            <p style={{ fontSize: 26, fontWeight: 700, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* My active loans */}
        <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>My loans</p>
            <a href="/loans" style={{ fontSize: 12, color: '#3B6D11', textDecoration: 'none' }}>View all</a>
          </div>
          <div style={{ padding: '14px 20px' }}>
            {activeLoans.length > 0 ? activeLoans.map((loan: any) => {
              const totalRepayable = Math.ceil(loan.amount * (1 + loan.rate / 100))
              const pct = Math.round(((totalRepayable - loan.balance) / totalRepayable) * 100)
              return (
                <div key={loan.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a2e1a' }}>KES {loan.amount.toLocaleString()}</span>
                    <span style={{ fontSize: 13, color: '#b45309', fontWeight: 600 }}>KES {loan.balance.toLocaleString()} left</span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: pct + '%', background: 'linear-gradient(90deg, #3B6D11, #639922)', borderRadius: 100 }} />
                  </div>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{pct}% repaid · {loan.purpose}</p>
                </div>
              )
            }) : (
              <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>No active loans</p>
            )}
            
              < a href="/loans/new"
              style={{
                display: 'block', textAlign: 'center', padding: '8px',
                background: '#f0fdf4', color: '#3B6D11', borderRadius: 8,
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
                border: '1px solid #bbf7d0', marginTop: 8,
              }}
            >
              Request a loan
            </a>
          </div>
        </div>

        {/* Upcoming meetings */}
        <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Upcoming meetings</p>
            <a href="/meetings" style={{ fontSize: 12, color: '#3B6D11', textDecoration: 'none' }}>View all</a>
          </div>
          <div style={{ padding: '14px 20px' }}>
            {meetings && meetings.length > 0 ? meetings.map((m: any) => (
              <div key={m.id} style={{
                padding: '10px 14px', borderRadius: 10, background: '#f8fafc',
                border: '1px solid #e2e8f0', marginBottom: 8,
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1a2e1a', marginBottom: 2 }}>
                  {new Date(m.meeting_date).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })}
                  {m.meeting_time && ' · ' + m.meeting_time}
                </p>
                {m.venue && <p style={{ fontSize: 12, color: '#6b7280' }}>{m.venue}</p>}
              </div>
            )) : (
              <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>No upcoming meetings</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}