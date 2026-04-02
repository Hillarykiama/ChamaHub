'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase/client'

export default function LoanApprovalButton({
  id,
  canApprove,
  isOwnLoan,
}: {
  id: string
  canApprove: boolean
  isOwnLoan?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleApprove() {
    if (!confirm('Approve this loan and mark it as disbursed?')) return
    setLoading(true)
    const supabase = createBrowserSupabase()
    await supabase
      .from('loans')
      .update({ status: 'active', disbursed_at: new Date().toISOString() })
      .eq('id', id)
    router.refresh()
    setLoading(false)
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
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        onClick={handleApprove}
        disabled={loading}
        style={{
          padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: 'linear-gradient(135deg, #3B6D11, #639922)',
          color: '#ffffff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {loading ? '...' : 'Approve'}
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
  )
}