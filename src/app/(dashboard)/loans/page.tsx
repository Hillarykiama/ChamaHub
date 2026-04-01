import { createServerSupabase } from '@/lib/supabase/server'
import LoanApprovalButton from '@/components/loans/loan-approval-button'

export default async function LoansPage() {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: currentMember } = await supabase
    .from('members')
    .select('role')
    .eq('user_id', user!.id)
    .single()

  const canApprove = ['chairperson', 'treasurer'].includes(currentMember?.role ?? '')

  const { data: loans, error } = await supabase
    .from('loans')
    .select(`
      id, amount, balance, rate, purpose, status, disbursed_at,
      members(id, full_name, phone)
    `)
    .order('disbursed_at', { ascending: false })

  if (error) {
    return <p className="text-sm text-red-500">Failed to load loans.</p>
  }

  const totalDisbursed = loans?.filter((l) => l.status === 'active').reduce((sum, l) => sum + l.amount, 0) ?? 0
  const totalOutstanding = loans?.filter((l) => l.status === 'active').reduce((sum, l) => sum + l.balance, 0) ?? 0
  const pending = loans?.filter((l) => l.status === 'pending') ?? []
  const active = loans?.filter((l) => l.status === 'active') ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a2e1a', letterSpacing: '-0.5px' }}>
            Loans
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {loans?.length ?? 0} total loans
          </p>
        </div>
        
          < a href="/loans/new"
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #3B6D11, #639922)',
            color: '#ffffff', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}
        >
          + Request loan
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total disbursed', value: 'KES ' + totalDisbursed.toLocaleString(), color: '#1a2e1a' },
          { label: 'Outstanding', value: 'KES ' + totalOutstanding.toLocaleString(), color: '#b45309' },
          { label: 'Pending approval', value: String(pending.length), color: pending.length > 0 ? '#b45309' : '#1a2e1a' },
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

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', borderRadius: 100, marginBottom: 20,
        background: canApprove ? '#f0fdf4' : '#f8fafc',
        border: `1px solid ${canApprove ? '#bbf7d0' : '#e2e8f0'}`,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: canApprove ? '#3B6D11' : '#9ca3af',
        }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: canApprove ? '#3B6D11' : '#6b7280' }}>
          {canApprove
            ? `You can approve loans (${currentMember?.role})`
            : `You cannot approve loans (${currentMember?.role ?? 'no role'})`}
        </span>
      </div>

      {pending.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
            Pending approval ({pending.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pending.map((loan) => {
              const member = loan.members as any
              return (
                <div key={loan.id} style={{
                  background: '#fffbeb', borderRadius: 16, padding: '20px 24px',
                  border: '1px solid #fde68a', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3B6D11, #639922)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>
                      {member?.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#1a2e1a', fontSize: 14 }}>{member?.full_name}</p>
                      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                        KES {loan.amount.toLocaleString()} · {loan.rate}% interest · {loan.purpose}
                      </p>
                    </div>
                  </div>
                  <LoanApprovalButton id={loan.id} canApprove={canApprove} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
          Active loans ({active.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {active.length > 0 ? active.map((loan) => {
            const member = loan.members as any
            const repaid = loan.amount - loan.balance
            const pct = loan.amount > 0 ? Math.round((repaid / loan.amount) * 100) : 0
            return (
              <div key={loan.id} style={{
                background: '#ffffff', borderRadius: 16, padding: '20px 24px',
                border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3B6D11, #639922)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>
                      {member?.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#1a2e1a', fontSize: 14 }}>{member?.full_name}</p>
                      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                        {loan.purpose} · {loan.rate}% interest
                      </p>
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                    background: '#f0fdf4', color: '#3B6D11',
                  }}>
                    Active
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                  {[
                    { label: 'Principal', value: 'KES ' + loan.amount.toLocaleString() },
                    { label: 'Balance', value: 'KES ' + loan.balance.toLocaleString(), amber: true },
                    { label: 'Disbursed', value: loan.disbursed_at ? new Date(loan.disbursed_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                  ].map((item) => (
                    <div key={item.label}>
                      <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{item.label}</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: (item as any).amber ? '#b45309' : '#1a2e1a' }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>
                    <span>Repaid</span>
                    <span>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: pct + '%',
                      background: 'linear-gradient(90deg, #3B6D11, #639922)', borderRadius: 100,
                    }} />
                  </div>
                </div>
              </div>
            )
          }) : (
            <div style={{
              background: '#ffffff', borderRadius: 16, padding: '48px 24px',
              border: '1px solid #e2e8f0', textAlign: 'center', color: '#9ca3af', fontSize: 14,
            }}>
              No active loans yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}