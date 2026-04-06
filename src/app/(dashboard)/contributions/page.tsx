import { createServerSupabase } from '@/lib/supabase/server'
import CollectContributionsButton from '@/components/contributions/collect-contributions-button'
import RequestPaymentButton from '@/components/contributions/request-payment-button'

export default async function ContributionsPage() {
  const supabase = await createServerSupabase()
  const period = new Date().toISOString().slice(0, 7)

  const { data: chama } = await supabase
    .from('chamas')
    .select('id, name, monthly_amount')
    .single()

  const { data: contributions } = await supabase
    .from('contributions')
    .select(`
      id, amount, status, mpesa_ref, paid_at, period, type, description,
      members(id, full_name, phone)
    `)
    .eq('period', period)
    .order('created_at', { ascending: false })

  const { data: members } = await supabase
    .from('members')
    .select('id, full_name, phone')
    .eq('status', 'active')

  const monthlyContribs = contributions?.filter((c) => c.type === 'monthly') ?? []
  const specialContribs = contributions?.filter((c) => c.type !== 'monthly') ?? []

  const totalExpected = (members?.length ?? 0) * (chama?.monthly_amount ?? 0)
  const totalCollected = contributions
    ?.filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0) ?? 0
  const totalOutstanding = totalExpected - totalCollected
  const collectionPct = totalExpected > 0
    ? Math.round((totalCollected / totalExpected) * 100)
    : 0

  const membersPaid = new Set(
    monthlyContribs.filter((c) => c.status === 'paid').map((c) => (c.members as any)?.id)
  )
  const monthlyGenerated = monthlyContribs.length > 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a2e1a', letterSpacing: '-0.5px' }}>
            Contributions
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {new Date().toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <CollectContributionsButton
            chamaId={chama?.id ?? ''}
            monthlyAmount={chama?.monthly_amount ?? 2000}
            period={period}
            members={members ?? []}
            alreadyGenerated={monthlyGenerated}
          />
          
            < a href="/contributions/special"
            style={{
              padding: '10px 20px',
              background: '#ffffff',
              color: '#374151',
              border: '1px solid #e2e8f0',
              borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none',
            }}
          >
            + Special contribution
          </a>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Monthly amount', value: 'KES ' + (chama?.monthly_amount ?? 0).toLocaleString(), color: '#1a2e1a' },
          { label: 'Expected', value: 'KES ' + totalExpected.toLocaleString(), color: '#1a2e1a' },
          { label: 'Collected', value: 'KES ' + totalCollected.toLocaleString(), color: '#3B6D11' },
          { label: 'Outstanding', value: 'KES ' + totalOutstanding.toLocaleString(), color: totalOutstanding > 0 ? '#b45309' : '#3B6D11' },
        ].map((m) => (
          <div key={m.label} style={{
            background: '#ffffff', borderRadius: 16, padding: '20px 24px',
            border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              {m.label}
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{
        background: '#ffffff', borderRadius: 16, padding: '16px 24px',
        border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
          <span style={{ color: '#6b7280' }}>Collection progress</span>
          <span style={{ fontWeight: 600, color: '#1a2e1a' }}>
            {membersPaid.size}/{members?.length ?? 0} members · {collectionPct}%
          </span>
        </div>
        <div style={{ height: 8, background: '#f1f5f9', borderRadius: 100, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: collectionPct + '%',
            background: 'linear-gradient(90deg, #3B6D11, #639922)', borderRadius: 100,
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {/* Monthly contributions */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
          Monthly contributions — {new Date().toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
        </h2>

        {!monthlyGenerated ? (
          <div style={{
            background: '#fffbeb', borderRadius: 16, padding: '24px',
            border: '1px solid #fde68a', textAlign: 'center',
          }}>
            <p style={{ fontSize: 14, color: '#b45309', marginBottom: 4, fontWeight: 500 }}>
              Contributions not yet generated for this month
            </p>
            <p style={{ fontSize: 13, color: '#6b7280' }}>
              Click "Collect contributions" to generate records for all {members?.length} members
            </p>
          </div>
        ) : (
          <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  <th className="text-left px-6 py-3" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Member</th>
                  <th className="text-left px-6 py-3" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Amount</th>
                  <th className="text-left px-6 py-3" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Date paid</th>
                  <th className="text-left px-6 py-3" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>M-Pesa ref</th>
                  <th className="text-left px-6 py-3" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</th>
                  <th className="text-left px-6 py-3" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {monthlyContribs.map((c) => {
                  const member = c.members as any
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td className="px-6 py-4">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3B6D11, #639922)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
                          }}>
                            {member?.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#1a2e1a', fontSize: 13 }}>{member?.full_name}</p>
                            <p style={{ fontSize: 11, color: '#6b7280' }}>{member?.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4" style={{ fontWeight: 600, color: '#1a2e1a' }}>
                        KES {c.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4" style={{ color: '#6b7280', fontSize: 13 }}>
                        {c.paid_at ? new Date(c.paid_at).toLocaleDateString('en-KE', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }) : '—'}
                      </td>
                      <td className="px-6 py-4" style={{ color: '#6b7280', fontSize: 12, fontFamily: 'monospace' }}>
                        {c.mpesa_ref ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span style={{
                          padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                          background: c.status === 'paid' ? '#f0fdf4' : c.status === 'failed' ? '#fef2f2' : '#fffbeb',
                          color: c.status === 'paid' ? '#3B6D11' : c.status === 'failed' ? '#dc2626' : '#b45309',
                        }}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {c.status !== 'paid' && (
                          <RequestPaymentButton
                            contributionId={c.id}
                            phone={member?.phone}
                            amount={c.amount}
                            memberId={member?.id}
                            chamaId={chama?.id ?? ''}
                            period={period}
                          />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Special contributions */}
      {specialContribs.length > 0 && (
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
            Special contributions
          </h2>
          <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  <th className="text-left px-6 py-3" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Member</th>
                  <th className="text-left px-6 py-3" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</th>
                  <th className="text-left px-6 py-3" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Amount</th>
                  <th className="text-left px-6 py-3" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</th>
                  <th className="text-left px-6 py-3" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {specialContribs.map((c) => {
                  const member = c.members as any
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td className="px-6 py-4" style={{ fontWeight: 600, color: '#1a2e1a', fontSize: 13 }}>
                        {member?.full_name}
                      </td>
                      <td className="px-6 py-4" style={{ color: '#6b7280', fontSize: 13 }}>
                        {c.description ?? c.type}
                      </td>
                      <td className="px-6 py-4" style={{ fontWeight: 600, color: '#1a2e1a' }}>
                        KES {c.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span style={{
                          padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                          background: c.status === 'paid' ? '#f0fdf4' : '#fffbeb',
                          color: c.status === 'paid' ? '#3B6D11' : '#b45309',
                        }}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {c.status !== 'paid' && (
                          <RequestPaymentButton
                            contributionId={c.id}
                            phone={member?.phone}
                            amount={c.amount}
                            memberId={member?.id}
                            chamaId={chama?.id ?? ''}
                            period={period}
                          />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}