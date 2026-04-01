'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase/client'

export default function DeleteMemberButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Are you sure you want to remove ${name} from the chama?`)) return

    setLoading(true)
    const supabase = createBrowserSupabase()
    await supabase.from('members').delete().eq('id', id)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        padding: '5px 12px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        background: loading ? '#f9fafb' : '#fef2f2',
        color: '#dc2626',
        border: '1px solid #fecaca',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {loading ? '...' : 'Delete'}
    </button>
  )
}