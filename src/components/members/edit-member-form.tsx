'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase/client'

export default function EditMemberForm({ member }: { member: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: member.full_name,
    phone: member.phone,
    role: member.role,
    status: member.status,
    joined_at: member.joined_at,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')

    if (!form.full_name || !form.phone) {
      setError('Full name and phone are required.')
      setLoading(false)
      return
    }

    const supabase = createBrowserSupabase()
    const { error } = await supabase
      .from('members')
      .update(form)
      .eq('id', member.id)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/members')
    router.refresh()
  }

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 16,
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      padding: 32,
      maxWidth: 520,
    }}>
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 20,
          fontSize: 13,
          color: '#dc2626',
        }}>
          {error}
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
            style={{
              width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
              borderRadius: 10, fontSize: 14, color: '#111827', fontFamily: 'Inter, sans-serif', outline: 'none',
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
            style={{
              width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
              borderRadius: 10, fontSize: 14, color: '#111827', fontFamily: 'Inter, sans-serif', outline: 'none',
            }}
          />
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
              borderRadius: 10, fontSize: 14, color: '#111827', fontFamily: 'Inter, sans-serif', outline: 'none', background: '#ffffff',
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
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={{
              width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
              borderRadius: 10, fontSize: 14, color: '#111827', fontFamily: 'Inter, sans-serif', outline: 'none', background: '#ffffff',
            }}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
              borderRadius: 10, fontSize: 14, color: '#111827', fontFamily: 'Inter, sans-serif', outline: 'none',
            }}
          />
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
            {loading ? 'Saving...' : 'Save changes'}
          </button>
          
           < a href="/members"
            style={{
              flex: 1, padding: '11px 20px', background: '#f9fafb', color: '#374151',
              border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', textDecoration: 'none', textAlign: 'center',
            }}
          >
            Cancel
          </a>
        </div>
      </div>
    </div>
  )
}