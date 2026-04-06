'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase/client'

export default function SpecialContributionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [members, setMembers] = useState<any[]>([])
  const [chama, setChama] = useState<any>(null)
  const [applyToAll, setApplyToAll] = useState(true)
  const [form, setForm] = useState({
    member_id: '',
    amount: '',
    description: '',
    type: 'welfare',
  })

  useEffect(() => {
    async function fetch() {
      const supabase = createBrowserSupabase()
      const [{ data: m }, { data: c }] = await Promise.all([
        supabase.from('members').select('id, full_name, phone').eq('status', 'active'),
        supabase.from('chamas').select('id').single(),
      ])
      setMembers(m ?? [])
      setChama(c)
    }
    fetch()
  }, [])

  async function handleSubmit() {
    setLoading(true)
    setError('')

    if (!form.amount || !form.description) {
      setError('Amount and description are required.')
      setLoading(false)
      return
    }

    if (!applyToAll && !form.member_id) {
      setError('Please select a member.')
      setLoading(false)
      return
    }

    const supabase = createBrowserSupabase()
    const period = new Date().toISOString().slice(0, 7)

    const records = applyToAll
      ? members.map((m) => ({
          member_id: m.id,
          chama_id: chama?.id,
          amount: Number(form.amount),
          period,
          status: 'pending',
          type: form.type,
          description: form.description,
        }))
      : [{
          member_id: form.member_id,
          chama_id: chama?.id,
          amount: Number(form.amount),
          period,
          status: 'pending',
          type: form.type,
          description: form.description,
        }]

    const { error } = await supabase.from('contributions').insert(records)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/contributions')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-8">
        
          < a href="/contributions"
          style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', marginBottom: 12, display: 'inline-block' }}
        >
          ← Back to contributions
        </a>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a2e1a', letterSpacing: '-0.5px' }}>
          Special contribution
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
          Create a one-off contribution for welfare, fines, projects etc.
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                borderRadius: 10, fontSize: 14, color: '#111827',
                fontFamily: 'Inter, sans-serif', outline: 'none', background: '#ffffff',
              }}
            >
              <option value="welfare">Welfare</option>
              <option value="fine">Fine</option>
              <option value="project">Project</option>
              <option value="emergency">Emergency</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Description *
            </label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Member welfare — John's bereavement"
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                borderRadius: 10, fontSize: 14, color: '#111827',
                fontFamily: 'Inter, sans-serif', outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Amount (KES) *
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="e.g. 500"
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                borderRadius: 10, fontSize: 14, color: '#111827',
                fontFamily: 'Inter, sans-serif', outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 10 }}>
              Apply to
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setApplyToAll(true)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                  background: applyToAll ? '#f0fdf4' : '#f8fafc',
                  color: applyToAll ? '#3B6D11' : '#6b7280',
                  border: `1px solid ${applyToAll ? '#bbf7d0' : '#e2e8f0'}`,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
              >
                All members ({members.length})
              </button>
              <button
                onClick={() => setApplyToAll(false)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                  background: !applyToAll ? '#f0fdf4' : '#f8fafc',
                  color: !applyToAll ? '#3B6D11' : '#6b7280',
                  border: `1px solid ${!applyToAll ? '#bbf7d0' : '#e2e8f0'}`,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
              >
                Specific member
              </button>
            </div>
          </div>

          {!applyToAll && (
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Member
              </label>
              <select
                value={form.member_id}
                onChange={(e) => setForm({ ...form, member_id: e.target.value })}
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                  borderRadius: 10, fontSize: 14, color: '#111827',
                  fontFamily: 'Inter, sans-serif', outline: 'none', background: '#ffffff',
                }}
              >
                <option value="">Select member...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </div>
          )}

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
              {loading ? 'Creating...' : applyToAll ? `Create for all ${members.length} members` : 'Create contribution'}
            </button>
            
              < a href="/contributions"
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