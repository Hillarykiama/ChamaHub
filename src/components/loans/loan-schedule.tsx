'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabase } from '@/lib/supabase/client'

export default function LoanSchedule({
  loanId,
  totalRepayable,
  memberPhone,
}: {
  loanId: string
  totalRepayable: number
  memberPhone: string
}) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const router_refresh = () => window.location.reload()

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

  async function handleSTKPush(scheduleId: string, amountDue: number, amountPaid: number) {
    const remaining = amountDue - amountPaid
    if (remaining <= 0) return

    // Format phone — ensure it starts with 254
    const phone = memberPhone.startsWith('0')
      ? '254' + memberPhone.slice(1)
      : memberPhone.startsWith('+')
      ? memberPhone.slice(1)
      : memberPhone

    setPaying(scheduleId)
    setMessage('')

    try {
      const res = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          amount: remaining,
          memberId: loanId,
          chamaId: loanId,
          period: scheduleId,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('M-Pesa prompt sent! Complete payment on your phone.')
      } else {
        setMessage('STK Push failed: ' + (data.error ?? 'Unknown error'))
      }
    } catch (e) {
      setMessage('Failed to send M-Pesa prompt. Check your connection.')
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

      {message && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13,
          background: message.includes('failed') || message.includes('Failed') ? '#fef2f2' : '#f0fdf4',
          color: message.includes('failed') || message.includes('Failed') ? '#dc2626' : '#3B6D11',
          border: `1px solid ${message.includes('failed') || message.includes('Failed') ? '#fecaca' : '#bbf7d0'}`,
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {schedules.map((s) => {
          const isPaid = s.status === 'paid'
          const isOverdue = !isPaid && new Date(s.due_date) < new Date()
          const remaining = s.amount_due - (s.amount_paid ?? 0)

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
                  {isOverdue && !isPaid && (
                    <span style={{ marginLeft: 8, fontSize: 11, color: '#dc2626', fontWeight: 500 }}>
                      Overdue
                    </span>
                  )}
                </p>
                <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                  Due: {new Date(s.due_date).toLocaleDateString('en-KE', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                  {s.mpesa_ref && ` · Ref: ${s.mpesa_ref}`}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: isPaid ? '#3B6D11' : '#1a2e1a' }}>
                    KES {s.amount_due.toLocaleString()}
                  </p>
                  {s.amount_paid > 0 && !isPaid && (
                    <p style={{ fontSize: 11, color: '#b45309' }}>
                      Paid: KES {s.amount_paid.toLocaleString()} · Rem: KES {remaining.toLocaleString()}
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
                    onClick={() => handleSTKPush(s.id, s.amount_due, s.amount_paid ?? 0)}
                    disabled={paying === s.id}
                    style={{
                      padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: paying === s.id ? '#9ca3af' : isOverdue
                        ? '#dc2626'
                        : 'linear-gradient(135deg, #3B6D11, #639922)',
                      color: '#ffffff',
                      border: 'none',
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