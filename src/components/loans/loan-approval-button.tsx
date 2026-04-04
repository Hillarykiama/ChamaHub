'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase/client'

export default function LoanApprovalButton({
  id,
  canApprove,
  isOwnLoan,
  amount,
  rate,
  memberPhone,
  memberName,
}: {
  id: string
  canApprove: boolean
  isOwnLoan?: boolean
  amount: number
  rate: number
  memberPhone: string
  memberName: string
}) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('')
  const router = useRouter()

  async function handleApprove() {
    if (!confirm(`Approve loan for ${memberName}? KES ${amount.toLocaleString()} will be disbursed to ${memberPhone}`)) return
    setLoading(true)
    const supabase = createBrowserSupabase()

    // 1. Calculate flat interest
    const totalInterest = Math.ceil(amount * rate / 100)
    const totalRepayable = amount + totalInterest
    const disbursedAt = new Date()

    // 2. Get duration from loan
    setStep('Approving loan...')
    const { data: loan } = await supabase
      .from('loans')
      .select('duration')
      .eq('id', id)
      .single()

    const duration = loan?.duration ?? 3
    const monthlyAmount = Math.ceil(totalRepayable / duration)

    // 3. Update loan status and balance
    const { error } = await supabase
      .from('loans')
      .update({
        status: 'active',
        disbursed_at: disbursedAt.toISOString(),
        balance: totalRepayable,
        disbursement_status: 'processing',
      })
      .eq('id', id)

    if (error) {
      alert('Error approving loan: ' + error.message)
      setLoading(false)
      setStep('')
      return
    }

    // 4. Generate monthly installment schedule
    setStep('Generating schedule...')
    const schedules = Array.from({ length: duration }, (_, i) => {
      const dueDate = new Date(disbursedAt)
      dueDate.setMonth(dueDate.getMonth() + i + 1)
      const isLast = i === duration - 1
      const amountDue = isLast
        ? totalRepayable - monthlyAmount * (duration - 1)
        : monthlyAmount

      return {
        loan_id: id,
        month_number: i + 1,
        due_date: dueDate.toISOString().slice(0, 10),
        amount_due: amountDue,
        status: 'pending',
      }
    })

    await supabase.from('loan_schedules').insert(schedules)

    // 5. Trigger M-Pesa B2C disbursement
    setStep('Disbursing via M-Pesa...')
    try {
      await fetch('/api/mpesa/b2c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: memberPhone,
          amount,
          loanId: id,
          memberName,
        }),
      })
    } catch (e) {
      console.error('B2C disbursement failed:', e)
    }

    setLoading(false)
    setStep('')
    router.refresh()
  }

  async function handleDecline() {
    if (!confirm('Decline this loan request?')) return
    setLoading(true)
    const supabase = createBrowserSupabase()
    await supabase.from('loans').delete().eq('id', id)
    router.refresh()
    setLoading(false)
  }

  if (isOwnLoan) {
    return (
      <span style={{
        padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
        background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
      }}>
        Cannot approve own loan
      </span>
    )
  }

  if (!canApprove) {
    return (
      <span style={{
        padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
        background: '#f1f5f9', color: '#9ca3af', border: '1px solid #e2e8f0',
      }}>
        Awaiting approval
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
      {step && (
        <span style={{ fontSize: 12, color: '#3B6D11', fontStyle: 'italic' }}>{step}</span>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleApprove}
          disabled={loading}
          style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3B6D11, #639922)',
            color: '#ffffff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {loading ? '...' : 'Approve & Disburse'}
        </button>
        <button
          onClick={handleDecline}
          disabled={loading}
          style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: '#fef2f2', color: '#dc2626',
            border: '1px solid #fecaca', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Decline
        </button>
      </div>
    </div>
  )
}