'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase/client'

export default function NewMemberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [chama, setChama] = useState<any>(null)
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    role: 'member',
    joined_at: new Date().toISOString().slice(0, 10),
  })

  useEffect(() => {
    async function fetchChama() {
      const supabase = createBrowserSupabase()
      const { data } = await supabase.from('chamas').select('id, name').single()
      setChama(data)
    }
    fetchChama()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    setSuccess('')

    if (!form.full_name || !form.phone) {
      setError('Full name and phone are required.')
      setLoading(false)
      return
    }

    const supabase = createBrowserSupabase()

    // 1. Add member to DB
    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert({
        full_name: form.full_name,
        phone: form.phone,
        role: form.role,
        joined_at: form.joined_at,
        chama_id: chama?.id,
        status: 'active',
      })
      .select()
      .single()

    if (memberError) {
      setError(memberError.message)
      setLoading(false)
      return
    }

    // 2. Create auth account + send SMS
    const res = await fetch('/api/members/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: member.id,
        fullName: form.full_name,
        phone: form.phone,
        chamaName: chama?.name ?? 'your chama',
      }),
    })

    const result = await res.json()

    if (!result.success) {
      setSuccess(`Member added but account setup failed: ${result.error}`)
    } else {
      setSuccess(`Member added! Login credentials sent to ${form.phone}`)
    }

    setLoading(false)
    setTimeout(() => {
      router.push('/members')
      router.refresh()
    }, 2000)
  }

  return (
    <div>
      <div className="mb-8">
        
         < a href="/members"
          style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', marginBottom: 12, display: 'inline-block' }}
        >
          ← Back to members
        </a>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a2e1a', letterSpacing: '-0.5px' }}>
          Add member
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
          A login account will be created and sent to the member via SMS
        </p>
      </div>

      <div style={{
        background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: 32, maxWidth: 520,
      }}>
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
            padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
            padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#3B6D11',
          }}>
            {success}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Full name *
            </label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="e.g. Grace Wanjiku"
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                borderRadius: 10, fontSize: 14, color: '#111827',
                fontFamily: 'Inter, sans-serif', outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Phone number *
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. 0712345678"
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                borderRadius: 10, fontSize: 14, color: '#111827',
                fontFamily: 'Inter, sans-serif', outline: 'none',
              }}
            />
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
              Login email will be {form.phone || '0712345678'}@chamahub.co.ke
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                borderRadius: 10, fontSize: 14, color: '#111827',
                fontFamily: 'Inter, sans-serif', outline: 'none', background: '#ffffff',
              }}
            >
              <option value="member">Member</option>
              <option value="chairperson">Chairperson</option>
              <option value="treasurer">Treasurer</option>
              <option value="secretary">Secretary</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Date joined
            </label>
            <input
              name="joined_at"
              type="date"
              value={form.joined_at}
              onChange={handleChange}
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                borderRadius: 10, fontSize: 14, color: '#111827',
                fontFamily: 'Inter, sans-serif', outline: 'none',
              }}
            />
          </div>

          {/* What happens next info box */}
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 10, padding: '12px 16px',
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#3B6D11', marginBottom: 6 }}>
              What happens when you add this member:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                'Member record created in the chama',
                'Login account created automatically',
                'SMS sent with email & password',
                'Member can log in and pay contributions',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#3B6D11' }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#3B6D11', flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 1, padding: '11px 20px',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3B6D11, #639922)',
                color: '#ffffff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              {loading ? 'Adding member...' : 'Add member'}
            </button>
            
             < a  href="/members"
              style={{
                flex: 1, padding: '11px 20px', background: '#f9fafb', color: '#374151',
                border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontWeight: 600,
                textDecoration: 'none', textAlign: 'center', fontFamily: 'Inter, sans-serif',
              }}
            >
              Cancel
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}