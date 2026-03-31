import { createServerSupabase } from '@/lib/supabase/server'

export default async function ContributionsPage() {
  const supabase = await createServerSupabase()
  const period = new Date().toISOString().slice(0, 7)

  const { data: contributions, error } = await supabase
    .from('contributions')
    .select(`
      id, amount, status, mpesa_ref, paid_at, period,
      members(id, full_name, phone)
    `)
    .eq('period', period)
    .order('paid_at', { ascending: false })

  if (error) {
    return <p className="text-sm text-red-500">Failed to load contributions.</p>
  }

  const totalExpected = (contributions?.length ?? 0) * 2000
  const totalCollected =
    contributions
      ?.filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + c.amount, 0) ?? 0
  const totalPending = totalExpected - totalCollected
  const collectionPct =
    totalExpected > 0
      ? Math.round((totalCollected / totalExpected) * 100)
      : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Contributions</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-KE', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Expected', value: 'KES ' + totalExpected.toLocaleString() },
          { label: 'Collected', value: 'KES ' + totalCollected.toLocaleString(), green: true },
          { label: 'Outstanding', value: 'KES ' + totalPending.toLocaleString(), amber: true },
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
                m.green
                  ? 'text-green-700'
                  : m.amber
                  ? 'text-amber-600'
                  : 'text-gray-900'
              }`}
            >
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Collection progress</span>
          <span className="font-medium text-gray-900">{collectionPct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-600 rounded-full transition-all"
            style={{ width: collectionPct + '%' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Member</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date paid</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">M-Pesa ref</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {contributions && contributions.length > 0 ? (
              contributions.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700">
                        {(c.members as any)?.full_name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">
                        {(c.members as any)?.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {c.status === 'paid'
                      ? 'KES ' + c.amount.toLocaleString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.paid_at
                      ? new Date(c.paid_at).toLocaleDateString('en-KE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {c.mpesa_ref ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.status === 'paid'
                          ? 'bg-green-50 text-green-700'
                          : c.status === 'failed'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-gray-400"
                >
                  No contributions recorded for this period yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}