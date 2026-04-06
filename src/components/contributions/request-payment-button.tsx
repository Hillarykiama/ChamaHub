'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RequestPaymentButton({
  contributionId,
  phone,
  amount,
  memberId,
  chamaId,
  period,
}: {
  contributionId: string
  phone: string
  amount: number
  memberId: string
  chamaId: string
  period: string
}) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleSTKPush() {
    setLoading(true)
    setMessage('')

    const formattedPhone = phone.startsWith('0')
      ? '254' + phone.slice(1)
      : phone.startsWith('+')
      ? phone.slice(1)
      : phone

    try {
      const res = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formattedPhone,
          amount,
          memberId,
          chamaId,
          period,
          contributionId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setMessage('M-Pesa prompt sent!')
        router.refresh()
      } else {
        setMessage('Failed: ' + (data.error ?? 'Unknown error'))
      }
    } catch {
      setMessage('Request failed. Check connection.')
    }

    setLoading(false)
  }

  return (
    <div>
      <button
        onClick={handleSTKPush}
        disabled={loading}
        style={{
          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
          background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3B6D11, #639922)',
          color: '#ffffff', border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {loading ? '...' : 'Request via M-Pesa'}
      </button>
      {message && (
        <p style={{
          fontSize: 11, marginTop: 4,
          color: message.includes('Failed') || message.includes('failed') ? '#dc2626' : '#3B6D11',
        }}>
          {message}
        </p>
      )}
    </div>
  )
}