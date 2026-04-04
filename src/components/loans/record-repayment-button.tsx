'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase/client'

export default function RecordRepaymentButton({
  loanId,
  currentBalance,
  totalRepayable,
  memberName,
}: {
  loanId: string
  currentBalance: number
  totalRepayable: number
  memberName: string
}) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [mpesaRef, setMpesaRef] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const isLumpSum = Number(amount) >= currentBalance

  async function handleSubmit() {
    setError('')
    const repayment = Number(amount)

    if (!repayment || repayment <= 0) {
      setError('Enter a valid amount.')
      return
    }

    if (repayment > currentBalance) {
      setError(`Amount cannot exceed balance of KES ${currentBalance.toLocaleString()}`)
      return
    }

    setLoading(true)
    const supabase = createBrowserSupabase()

    const newBalance = currentBalance - repayment
    const newStatus = newBalance === 0 ? 'paid' : 'active'

    // Update loan balance
    const { error: updateError } = await supabase
      .from('loans')
      .update({ balance: newBalance, status: newStatus })
      .eq('id', loanId)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // Log repayment
    await supabase.from('loan_repayments').insert({
      loan_id: loanId,
      amount: repayment,
      mpesa_ref: mpesaRef || null,
      paid_at: new Date().toISOString(),
    })

    setLoading(false)
    setOpen(false)
    setAmount('')
    setMpesaRef('')
    router.refresh()
  }

  async function handleLumpSum() {
    if (!confirm(`Pay full balance of KES ${currentBalance.toLocaleString()} to close this loan?`)) return
    setAmount(String(currentBalance))
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
          background: '#f0fdf4', color: '#3B6D11',
          border: '1px solid #bbf7d0', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Record repayment
      </button>
    )
  }

  return (
    <div style={{
      marginTop: 16, padding: 16, borderRadius: 12,
      background: '#f8fafc', border: '1px solid #e2e8f0',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
          Record repayment — {memberName}
        </p>
        <button
          onClick={handleLumpSum}
          style={{
            padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
            background: '#fffbeb', color: '#b45309',
            border: '1px solid #fde68a', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Pay in full (KES {currentBalance.toLocaleString()})
        </button>
      </div>

      {/* Loan summary */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
        padding: 12, borderRadius: 8, background: '#ffffff',
        border: '1px solid #e2e8f0', marginBottom: 12,
      }}>
        <div>
          <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Total repayable</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1a2e1a' }}>KES {totalRepayable.toLocaleString()}</p>
        </div>
        <div>
          <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Already paid</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#3B6D11' }}>KES {(totalRepayable - currentBalance).toLocaleString()}</p>
        </div>
        <div>
          <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Balance</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#b45309' }}>KES {currentBalance.toLocaleString()}</p>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
          padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#dc2626',
        }}>
          {error}
        </div>
      )}

      {isLumpSum && Number(amount) > 0 && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
          padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#3B6D11',
        }}>
          This will fully close the loan.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
            Amount (KES) *
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Any amount up to KES ${currentBalance.toLocaleString()}`}
            style={{
              width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
              borderRadius: 8, fontSize: 13, color: '#111827',
              fontFamily: 'Inter, sans-serif', outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
            M-Pesa reference (optional)
          </label>
          <input
            type="text"
            value={mpesaRef}
            onChange={(e) => setMpesaRef(e.target.value)}
            placeholder="e.g. QGH7K9F3X2"
            style={{
              width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
              borderRadius: 8, fontSize: 13, color: '#111827',
              fontFamily: 'Inter, sans-serif', outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex: 1, padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3B6D11, #639922)',
              color: '#ffffff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {loading ? 'Saving...' : isLumpSum && Number(amount) > 0 ? 'Close loan' : 'Save repayment'}
          </button>
          <button
            onClick={() => { setOpen(false); setError(''); setAmount(''); }}
            style={{
              flex: 1, padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: '#ffffff', color: '#374151',
              border: '1px solid #e2e8f0', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}