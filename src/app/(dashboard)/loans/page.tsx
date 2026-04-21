import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoanApprovalButton from '@/components/loans/loan-approval-button'
import RecordRepaymentButton from '@/components/loans/record-repayment-button'
import LoanSchedule from '@/components/loans/loan-schedule'

export default async function LoansPage() {
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
    return <AdminLoans supabase={supabase} currentMember={member} />
  }

  return <MemberLoans supabase={supabase} member={member} />
}

async function AdminLoans({ supabase, currentMember }: { supabase: any; currentMember: any }) {
  const { data: loans, error } = await supabase
    .from('loans')
    .select(`
      id, amount, balance, rate, purpose, status, disbursed_at, duration,
      members(id, full_name, phone)
    `)
    .order('disbursed_at', { ascending: false })

  if (error) return <p className="text-sm text-red-500">Failed to load loans.</p>

  const canApprove = ['chairperson', 'treasurer'].includes(currentMember?.role ?? '')
  const totalDisbursed = loans?.filter((l: any) => l.status === 'active').reduce((sum: number, l: any) => sum + l.amount, 0) ?? 0
  const totalOutstanding = loans?.filter((l: any) => l.status === 'active').reduce((sum: number, l: any) => sum + l.balance, 0) ?? 0
  const pending = loans?.filter((l: any) => l.status === 'pending') ?? []
  const active = loans?.filter((l: any) => l.status === 'active') ?? []
  const paid = loans?.filter((l: any) => l.status === 'paid') ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a2e1a', letterSpacing: '-0.5px' }}>Loans</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>{loans?.length ?? 0} total loans</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total disbursed', value: 'KES ' + totalDisbursed.toLocaleString(), color: '#1a2e1a' },
          { label: 'Outstanding', value: 'KES ' + totalOutstanding.toLocaleString(), color: '#b45309' },
          { label: 'Pending approval', value: String(pending.length), color: pending.length > 0 ? '#b45309' : '#1a2e1a' },
          { label: 'Fully paid', value: String(paid.length), color: '#3B6D11' },
        ].map((m) => (
          <div key={m.label} style={{
            background: '#ffffff', borderRadius: 16, padding: '20px 24px',
            border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{m.label}</p>
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
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: canApprove ? '#3B6D11' : '#9ca3af' }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: canApprove ? '#3B6D11' : '#6b7280' }}>
          {canApprove ? `You can approve loans (${currentMember?.role})` : `You cannot approve loans (${currentMember?.role ?? 'no role'})`}
        </span>
      </div>

      {pending.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Pending approval ({pending.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pending.map((loan: any) => {
              const m = loan.members as any
              const isOwnLoan = m?.id === currentMember?.id
              return (
                <div key={loan.id} style={{
                  background: '#fffbeb', borderRadius: 16, padding: '20px 24px',
                  border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3B6D11, #639922)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#fff',
                    }}>
                      {m?.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#1a2e1a', fontSize: 14 }}>{m?.full_name}</p>
                      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                        KES {loan.amount.toLocaleString()} · {loan.rate}% flat · {loan.duration} months · {loan.purpose}
                      </p>
                    </div>
                  </div>
                  <LoanApprovalButton
                    id={loan.id}
                    canApprove={canApprove && !isOwnLoan}
                    isOwnLoan={isOwnLoan}
                    amount={loan.amount}
                    rate={loan.rate}
                    memberPhone={m?.phone}
                    memberName={m?.full_name}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Active loans ({active.length})</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {active.length > 0 ? active.map((loan: any) => {
            const m = loan.members as any
            const totalRepayable = Math.ceil(loan.amount * (1 + loan.rate / 100))
            const repaid = totalRepayable - loan.balance
            const pct = totalRepayable > 0 ? Math.round((repaid / totalRepayable) * 100) : 0
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
                      fontSize: 13, fontWeight: 700, color: '#fff',
                    }}>
                      {m?.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#1a2e1a', fontSize: 14 }}>{m?.full_name}</p>
                      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{loan.purpose} · {loan.rate}% flat · {loan.duration ?? 3} months</p>
                    </div>
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 500, background: '#f0fdf4', color: '#3B6D11' }}>Active</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                  {[
                    { label: 'Principal', value: 'KES ' + loan.amount.toLocaleString() },
                    { label: 'Total repayable', value: 'KES ' + totalRepayable.toLocaleString() },
                    { label: 'Already paid', value: 'KES ' + repaid.toLocaleString(), green: true },
                    { label: 'Balance', value: 'KES ' + loan.balance.toLocaleString(), amber: true },
                  ].map((item) => (
                    <div key={item.label}>
                      <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{item.label}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: (item as any).amber ? '#b45309' : (item as any).green ? '#3B6D11' : '#1a2e1a' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>
                    <span>Repayment progress</span><span>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: pct + '%', background: 'linear-gradient(90deg, #3B6D11, #639922)', borderRadius: 100 }} />
                  </div>
                </div>
                <RecordRepaymentButton loanId={loan.id} currentBalance={loan.balance} totalRepayable={totalRepayable} memberName={m?.full_name} />
                <LoanSchedule loanId={loan.id} totalRepayable={totalRepayable} memberPhone={m?.phone} />
              </div>
            )
          }) : (
            <div style={{ background: '#ffffff', borderRadius: 16, padding: '48px 24px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              No active loans yet.
            </div>
          )}
        </div>
      </div>

      {paid.length > 0 && (
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Fully paid ({paid.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {paid.map((loan: any) => {
              const m = loan.members as any
              const totalRepayable = Math.ceil(loan.amount * (1 + loan.rate / 100))
              return (
                <div key={loan.id} style={{
                  background: '#f0fdf4', borderRadius: 16, padding: '16px 24px',
                  border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3B6D11', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                      {m?.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#1a2e1a', fontSize: 14 }}>{m?.full_name}</p>
                      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>KES {loan.amount.toLocaleString()} · {loan.purpose}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#3B6D11' }}>KES {totalRepayable.toLocaleString()} paid</p>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: '#3B6D11', color: '#fff' }}>Cleared</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

async function MemberLoans({ supabase, member }: { supabase: any; member: any }) {
  const { data: myLoans } = await supabase
    .from('loans')
    .select('id, amount, balance, rate, purpose, status, disbursed_at, duration')
    .eq('member_id', member?.id)
    .order('created_at', { ascending: false })

  const activeLoans = myLoans?.filter((l: any) => l.status === 'active') ?? []
  const pendingLoans = myLoans?.filter((l: any) => l.status === 'pending') ?? []
  const paidLoans = myLoans?.filter((l: any) => l.status === 'paid') ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a2e1a', letterSpacing: '-0.5px' }}>My loans</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>{myLoans?.length ?? 0} total loans</p>
        </div>
        
          < a href="/loans/new"
          style={{
            padding: '10px 20px', background: 'linear-gradient(135deg, #3B6D11, #639922)',
            color: '#ffffff', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}
        >
          + Request loan
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Active loans', value: String(activeLoans.length), color: activeLoans.length > 0 ? '#b45309' : '#1a2e1a' },
          { label: 'Pending approval', value: String(pendingLoans.length), color: pendingLoans.length > 0 ? '#b45309' : '#1a2e1a' },
          { label: 'Fully paid', value: String(paidLoans.length), color: '#3B6D11' },
        ].map((m) => (
          <div key={m.label} style={{
            background: '#ffffff', borderRadius: 16, padding: '20px 24px',
            border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{m.label}</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {pendingLoans.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Awaiting approval</h2>
          {pendingLoans.map((loan: any) => (
            <div key={loan.id} style={{
              background: '#fffbeb', borderRadius: 16, padding: '20px 24px',
              border: '1px solid #fde68a', marginBottom: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, color: '#1a2e1a', fontSize: 15 }}>KES {loan.amount.toLocaleString()}</p>
                  <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{loan.purpose} · {loan.rate}% flat interest · {loan.duration} months</p>
                </div>
                <span style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                  Awaiting approval
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Active loans</h2>
        {activeLoans.length > 0 ? activeLoans.map((loan: any) => {
          const totalRepayable = Math.ceil(loan.amount * (1 + loan.rate / 100))
          const repaid = totalRepayable - loan.balance
          const pct = totalRepayable > 0 ? Math.round((repaid / totalRepayable) * 100) : 0
          return (
            <div key={loan.id} style={{
              background: '#ffffff', borderRadius: 16, padding: '20px 24px',
              border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <p style={{ fontWeight: 700, color: '#1a2e1a', fontSize: 18 }}>KES {loan.amount.toLocaleString()}</p>
                  <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{loan.purpose} · {loan.rate}% flat · {loan.duration ?? 3} months</p>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 500, background: '#f0fdf4', color: '#3B6D11' }}>Active</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Total repayable', value: 'KES ' + totalRepayable.toLocaleString() },
                  { label: 'Already paid', value: 'KES ' + repaid.toLocaleString(), green: true },
                  { label: 'Balance', value: 'KES ' + loan.balance.toLocaleString(), amber: true },
                ].map((item) => (
                  <div key={item.label}>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{item.label}</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: (item as any).amber ? '#b45309' : (item as any).green ? '#3B6D11' : '#1a2e1a' }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>
                  <span>Repayment progress</span><span>{pct}%</span>
                </div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: pct + '%', background: 'linear-gradient(90deg, #3B6D11, #639922)', borderRadius: 100 }} />
                </div>
              </div>
              <LoanSchedule loanId={loan.id} totalRepayable={totalRepayable} memberPhone={member?.phone} />
            </div>
          )
        }) : (
          <div style={{
            background: '#ffffff', borderRadius: 16, padding: '48px 24px',
            border: '1px solid #e2e8f0', textAlign: 'center',
          }}>
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 12 }}>No active loans</p>
            
              < a href="/loans/new"
              style={{
                display: 'inline-block', padding: '10px 24px',
                background: 'linear-gradient(135deg, #3B6D11, #639922)',
                color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}
            >
              Request your first loan
            </a>
          </div>
        )}
      </div>

      {paidLoans.length > 0 && (
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Paid loans</h2>
          {paidLoans.map((loan: any) => {
            const totalRepayable = Math.ceil(loan.amount * (1 + loan.rate / 100))
            return (
              <div key={loan.id} style={{
                background: '#f0fdf4', borderRadius: 16, padding: '16px 24px',
                border: '1px solid #bbf7d0', marginBottom: 12,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontWeight: 600, color: '#1a2e1a', fontSize: 14 }}>KES {loan.amount.toLocaleString()}</p>
                  <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{loan.purpose}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#3B6D11' }}>KES {totalRepayable.toLocaleString()} paid</p>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: '#3B6D11', color: '#fff' }}>Cleared</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}