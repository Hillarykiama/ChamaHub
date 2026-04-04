'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabase } from '@/lib/supabase/client'

export default function LoanSchedule({
  loanId,
  totalRepayable,
}: {
  loanId: string
  totalRepayable: number
}) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState<string | null>(null)

  async function fetchSchedules() {
    const supabase = createBrowserSupabase()
    const { data } = await supabase
      .from('loan_schedules')
      .select('*')
      .eq('loan_id', loanId)
      .order('month_number')
    setSchedules(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchSchedules() }, [loanId])

  async function handleSTKPush(scheduleId: string, amountDue: number, phone: string) {
    setPaying(scheduleId)
    try {
      const res = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          amount: amountDue,
          scheduleId,
          loanId,
          period: scheduleId,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert('M-Pesa prompt sent to your phone. Complete payment to confirm.')
      } else {
        alert('STK Push failed: ' + (data.error ?? 'Unknown error'))
      }
    } catch (e) {
      alert('Failed to send M-Pesa prompt')
    }
    setPaying(null)
  }

  if (loading) return (
    <div style={{ padding: '12px 0', fontSize: 13, color: '#9ca3af' }}>
      Loading schedule...
    </div>
  )

  if (schedules.length === 0) return null

  const totalPaid = schedules.reduce((sum, s) => sum + (s.amount_paid ?? 0), 0)

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
          Repayment schedule
        </p>
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          KES {totalPaid.toLocaleString()} / KES {totalRepayable.toLocaleString()} paid
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {schedules.map((s) => {
          const isPaid = s.status === 'paid'
          const isOverdue = !isPaid && new Date(s.due_date) < new Date()

          return (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: 10,
              background: isPaid ? '#f0fdf4' : isOverdue ? '#fef2f2' : '#f8fafc',
              border: `1px solid ${isPaid ? '#bbf7d0' : isOverdue ? '#fecaca' : '#e2e8f0'}`,
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1a2e1a' }}>
                  Month {s.month_number}
                </p>
                <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                  Due: {new Date(s.due_date).toLocaleDateString('en-KE', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                  {s.mpesa_ref && ` · ${s.mpesa_ref}`}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: isPaid ? '#3B6D11' : '#1a2e1a' }}>
                    KES {s.amount_due.toLocaleString()}
                  </p>
                  {s.amount_paid > 0 && !isPaid && (
                    <p style={{ fontSize: 11, color: '#b45309' }}>
                      Partial: KES {s.amount_paid.toLocaleString()}
                    </p>
                  )}
                </div>

                {isPaid ? (
                  <span style={{
                    padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                    background: '#f0fdf4', color: '#3B6D11', border: '1px solid #bbf7d0',
                  }}>
                    Paid
                  </span>
                ) : (
                  <button
                    onClick={() => handleSTKPush(s.id, s.amount_due - s.amount_paid, '254712345678')}
                    disabled={paying === s.id}
                    style={{
                      padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                      background: isOverdue ? '#fef2f2' : 'linear-gradient(135deg, #3B6D11, #639922)',
                      color: isOverdue ? '#dc2626' : '#ffffff',
                      border: isOverdue ? '1px solid #fecaca' : 'none',
                      cursor: paying === s.id ? 'not-allowed' : 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {paying === s.id ? '...' : 'Pay via M-Pesa'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}