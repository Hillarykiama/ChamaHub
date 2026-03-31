import { createServerSupabase } from '@/lib/supabase/server'

export default async function ReportsPage() {
  const supabase = await createServerSupabase()

  const [
    { data: members },
    { data: contributions },
    { data: loans },
  ] = await Promise.all([
    supabase.from('members').select('id, full_name, joined_at'),
    supabase.from('contributions').select('member_id, amount, status, period, members(full_name)'),
    supabase.from('loans').select('member_id, amount, balance, status, members(full_name)'),
  ])

  // Member savings totals
  const memberTotals = members?.map((m) => {
    const total =
      contributions
        ?.filter((c) => c.member_id === m.id && c.status === 'paid')
        .reduce((sum, c) => sum + c.amount, 0) ?? 0
    return { ...m, total }
  })

  // Fund summary
  const totalSavings =
    contributions
      ?.filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + c.amount, 0) ?? 0

  const totalLoansOut =
    loans
      ?.filter((l) => l.status === 'active')
      .reduce((sum, l) => sum + l.balance, 0) ?? 0

  const totalRepaid =
    loans?.reduce((sum, l) => sum + (l.amount - l.balance), 0) ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Financial summary
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {/* Fund summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-medium text-gray-900 mb-4">
            Fund summary
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Total contributions collected', value: totalSavings, green: true },
              { label: 'Loans outstanding', value: totalLoansOut, amber: true },
              { label: 'Total repayments received', value: totalRepaid, green: true },
              { label: 'Net fund balance', value: totalSavings - totalLoansOut, green: true },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-500">{item.label}</span>
                <span
                  className={`text-sm font-medium ${
                    item.green
                      ? 'text-green-700'
                      : item.amber
                      ? 'text-amber-600'
                      : 'text-gray-900'
                  }`}
                >
                  KES {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Member ledger */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-900">Member ledger</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Member
                </th>
                <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Total saved
                </th>
              </tr>
            </thead>
            <tbody>
              {memberTotals && memberTotals.length > 0 ? (
                memberTotals.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2.5 text-gray-900">{m.full_name}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                      KES {m.total.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-6 text-center text-sm text-gray-400"
                  >
                    No data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export options */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-medium text-gray-900 mb-3">Export</h2>
        <div className="flex flex-wrap gap-2">
          {[
            'Member statement (PDF)',
            'Contribution history (CSV)',
            'Loan schedule (PDF)',
            'Annual report (PDF)',
          ].map((label) => (
            <button
              key={label}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}