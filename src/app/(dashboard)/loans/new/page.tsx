'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase/client'

export default function NewLoanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [members, setMembers] = useState<any[]>([])
  const [form, setForm] = useState({
    member_id: '',
    amount: '',
    rate: '5',
    duration: '3',
    purpose: '',
  })

  useEffect(() => {
    async function fetchMembers() {
      const supabase = createBrowserSupabase()
      const { data } = await supabase
        .from('members')
        .select('id, full_name')
        .eq('status', 'active')
        .order('full_name')
      setMembers(data ?? [])
    }
    fetchMembers()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const totalInterest = form.amount ? Math.ceil(Number(form.amount) * Number(form.rate) / 100) : 0
  const totalRepayable = form.amount ? Number(form.amount) + totalInterest : 0
  const monthlyAmount = totalRepayable && form.duration
    ? Math.ceil(totalRepayable / Number(form.duration))
    : 0

  async function handleSubmit() {
    setLoading(true)
    setError('')

    if (!form.member_id || !form.amount || !form.purpose) {
      setError('Member, amount and purpose are required.')
      setLoading(false)
      return
    }

    const supabase = createBrowserSupabase()

    const { data: chama } = await supabase
      .from('chamas')
      .select('id')
      .single()

    if (!chama) {
      setError('No chama found.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('loans').insert({
      member_id: form.member_id,
      chama_id: chama.id,
      amount: Number(form.amount),
      balance: Number(form.amount),
      rate: Number(form.rate),
      duration: Number(form.duration),
      purpose: form.purpose,
      status: 'pending',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/loans')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-8">
        
          < a href="/loans"
          style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', marginBottom: 12, display: 'inline-block' }}
        >
          ← Back to loans
        </a>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a2e1a', letterSpacing: '-0.5px' }}>
          Request loan
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
          Submit a new loan request for approval
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        <div style={{
          background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: 32,
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
                Member *
              </label>
              <select
                name="member_id"
                value={form.member_id}
                onChange={handleChange}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                  Amount (KES) *
                </label>
                <input
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="e.g. 20000"
                  style={{
                    width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                    borderRadius: 10, fontSize: 14, color: '#111827',
                    fontFamily: 'Inter, sans-serif', outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                  Interest rate (%)
                </label>
                <input
                  name="rate"
                  type="number"
                  value={form.rate}
                  onChange={handleChange}
                  style={{
                    width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                    borderRadius: 10, fontSize: 14, color: '#111827',
                    fontFamily: 'Inter, sans-serif', outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Duration (months)
              </label>
              <select
                name="duration"
                value={form.duration}
                onChange={handleChange}
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                  borderRadius: 10, fontSize: 14, color: '#111827',
                  fontFamily: 'Inter, sans-serif', outline: 'none', background: '#ffffff',
                }}
              >
                <option value="1">1 month</option>
                <option value="2">2 months</option>
                <option value="3">3 months</option>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Purpose *
              </label>
              <textarea
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                placeholder="e.g. school fees, business capital, emergency..."
                rows={3}
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                  borderRadius: 10, fontSize: 14, color: '#111827',
                  fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'none',
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
                {loading ? 'Submitting...' : 'Submit request'}
              </button>
              
               < a href="/loans"
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

        {/* Loan summary */}
        <div style={{
          background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: 24,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Loan summary</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Principal', value: form.amount ? 'KES ' + Number(form.amount).toLocaleString() : '—' },
              { label: 'Interest rate', value: form.rate + '% flat' },
              { label: 'Duration', value: form.duration + ' months' },
              { label: 'Total interest', value: totalInterest ? 'KES ' + totalInterest.toLocaleString() : '—' },
              { label: 'Total repayable', value: totalRepayable ? 'KES ' + totalRepayable.toLocaleString() : '—' },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between',
                paddingBottom: 12, borderBottom: '1px solid #f1f5f9',
              }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a2e1a' }}>{item.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Monthly installment</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#3B6D11' }}>
                {monthlyAmount ? 'KES ' + monthlyAmount.toLocaleString() : '—'}
              </span>
            </div>
          </div>

          {/* Schedule preview */}
          {monthlyAmount > 0 && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
                Schedule preview
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Array.from({ length: Number(form.duration) }, (_, i) => {
                  const due = new Date()
                  due.setMonth(due.getMonth() + i + 1)
                  const isLast = i === Number(form.duration) - 1
                  const amt = isLast
                    ? totalRepayable - monthlyAmount * (Number(form.duration) - 1)
                    : monthlyAmount
                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: 12, color: '#6b7280',
                    }}>
                      <span>Month {i + 1} — {due.toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}</span>
                      <span style={{ fontWeight: 600, color: '#1a2e1a' }}>KES {amt.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}