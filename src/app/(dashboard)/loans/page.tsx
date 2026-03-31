import { createServerSupabase } from '@/lib/supabase/server'

export default async function LoansPage() {
  const supabase = await createServerSupabase()

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

  const totalDisbursed =
    loans?.reduce((sum, l) => sum + l.amount, 0) ?? 0
  const totalOutstanding =
    loans
      ?.filter((l) => l.status === 'active')
      .reduce((sum, l) => sum + l.balance, 0) ?? 0
  const totalPending =
    loans?.filter((l) => l.status === 'pending').length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Loans</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loans?.length ?? 0} total loans
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total disbursed', value: 'KES ' + totalDisbursed.toLocaleString() },
          { label: 'Outstanding', value: 'KES ' + totalOutstanding.toLocaleString(), amber: true },
          { label: 'Pending approval', value: String(totalPending), amber: totalPending > 0 },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {m.label}
            </p>
            <p
              className={`text-xl font-semibold ${
                m.amber ? 'text-amber-600' : 'text-gray-900'
              }`}
            >
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Loans list */}
      <div className="space-y-3">
        {loans && loans.length > 0 ? (
          loans.map((loan) => {
            const repaid = loan.amount - loan.balance
            const pct =
              loan.amount > 0
                ? Math.round((repaid / loan.amount) * 100)
                : 0
            const member = loan.members as any

            return (
              <div
                key={loan.id}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700">
                      {member?.full_name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {member?.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {loan.purpose} · {loan.rate}% interest
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      loan.status === 'active'
                        ? 'bg-green-50 text-green-700'
                        : loan.status === 'pending'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {loan.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Principal</p>
                    <p className="font-medium text-gray-900">
                      KES {loan.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Balance</p>
                    <p className="font-medium text-amber-600">
                      KES {loan.balance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Disbursed</p>
                    <p className="font-medium text-gray-900">
                      {loan.disbursed_at
                        ? new Date(loan.disbursed_at).toLocaleDateString(
                            'en-KE',
                            { day: 'numeric', month: 'short', year: 'numeric' }
                          )
                        : '—'}
                    </p>
                  </div>
                </div>

                {/* Repayment progress */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Repaid</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full"
                      style={{ width: pct + '%' }}
                    />
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
            No loans recorded yet.
          </div>
        )}
      </div>
    </div>
  )
}