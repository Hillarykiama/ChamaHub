'use client'

import { useEffect } from 'react'
import { createBrowserSupabase } from '@/lib/supabase/client'

export default function SignOutPage() {
  useEffect(() => {
    async function signOut() {
      const supabase = createBrowserSupabase()
      await supabase.auth.signOut()
      window.location.href = '/login'
    }
    signOut()
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f5e9 100%)',
    }}>
      <p style={{ fontSize: 14, color: '#6b7280' }}>Signing out...</p>
    </div>
  )
}