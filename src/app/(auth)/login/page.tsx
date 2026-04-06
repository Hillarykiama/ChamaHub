'use client'

import { useState } from 'react'
import { createBrowserSupabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')

    // Allow login with phone number — convert to email format
    const loginEmail = email.includes('@')
      ? email
      : email.replace(/\s/g, '') + '@chamahub.co.ke'

    const supabase = createBrowserSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f5e9 100%)' }}>
      <div style={{
        background: '#ffffff', padding: 32, borderRadius: 20,
        border: '1px solid #e2e8f0', width: '100%', maxWidth: 380,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #3B6D11, #639922)',
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff' }} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: '#1a2e1a', margin: 0 }}>ChamaHub</p>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Savings group management</p>
          </div>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a2e1a', marginBottom: 6 }}>
          Sign in
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
          Use your phone number or email to sign in
        </p>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
            padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#dc2626',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Phone number or email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="0712345678 or email@example.com"
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                borderRadius: 10, fontSize: 14, color: '#111827',
                fontFamily: 'Inter, sans-serif', outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                borderRadius: 10, fontSize: 14, color: '#111827',
                fontFamily: 'Inter, sans-serif', outline: 'none',
              }}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3B6D11, #639922)',
              color: '#ffffff', border: 'none', borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif', marginTop: 4,
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>

        {/* Help section */}
        <div style={{ marginTop: 20, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
          <button
            onClick={() => setShowHelp(!showHelp)}
            style={{
              background: 'none', border: 'none', fontSize: 13,
              color: '#6b7280', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              padding: 0,
            }}
          >
            {showHelp ? 'Hide help ↑' : 'Need help signing in? ↓'}
          </button>
          {showHelp && (
            <div style={{
              marginTop: 12, background: '#f8fafc', borderRadius: 10,
              padding: '12px 14px', fontSize: 12, color: '#6b7280', lineHeight: 1.7,
            }}>
              <p style={{ fontWeight: 600, color: '#374151', marginBottom: 6 }}>For members:</p>
              <p>Your email is your phone number + @chamahub.co.ke</p>
              <p>Example: 0712345678@chamahub.co.ke</p>
              <p>Your default password is your phone number</p>
              <p style={{ fontWeight: 600, color: '#374151', margin: '8px 0 4px' }}>For admins:</p>
              <p>Use the email you registered with</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}