'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase/client'

export default function CollectContributionsButton({
  chamaId,
  monthlyAmount,
  period,
  members,
  alreadyGenerated,
}: {
  chamaId: string
  monthlyAmount: number
  period: string
  members: any[]
  alreadyGenerated: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCollect() {
    if (alreadyGenerated) {
      alert('Contributions already generated for this month.')
      return
    }

    if (!confirm(`Generate contribution records for all ${members.length} members?\nAmount: KES ${monthlyAmount.toLocaleString()} each`)) return

    setLoading(true)
    const supabase = createBrowserSupabase()

    const records = members.map((m) => ({
      member_id: m.id,
      chama_id: chamaId,
      amount: monthlyAmount,
      period,
      status: 'pending',
      type: 'monthly',
    }))

    const { error } = await supabase.from('contributions').insert(records)

    if (error) {
      alert('Error: ' + error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleCollect}
      disabled={loading || alreadyGenerated}
      style={{
        padding: '10px 20px',
        background: alreadyGenerated ? '#f1f5f9' : 'linear-gradient(135deg, #3B6D11, #639922)',
        color: alreadyGenerated ? '#9ca3af' : '#ffffff',
        border: 'none',
        borderRadius: 10, fontSize: 14, fontWeight: 600,
        cursor: loading || alreadyGenerated ? 'not-allowed' : 'pointer',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {loading ? 'Generating...' : alreadyGenerated ? 'Contributions generated' : 'Collect contributions'}
    </button>
  )
}