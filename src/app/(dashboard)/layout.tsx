import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: member } = await supabase
    .from('members')
    .select('id, full_name, role')
    .eq('user_id', user!.id)
    .single()

  const displayName = member?.full_name ?? user!.email ?? 'User'
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/members', label: 'Members' },
    { href: '/contributions', label: 'Contributions' },
    { href: '/loans', label: 'Loans' },
    { href: '/meetings', label: 'Meetings' },
    { href: '/reports', label: 'Reports' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f5e9 100%)' }}>
      <nav style={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #3B6D11, #639922)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#1a2e1a', letterSpacing: '-0.3px' }}>
              ChamaHub
            </span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              
               < a key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-green-700 hover:bg-green-50 transition-colors"
                style={{ textDecoration: 'none' }}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#1a2e1a', margin: 0 }}>
                {member?.full_name ?? 'User'}
              </p>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, textTransform: 'capitalize' }}>
                {member?.role ?? 'member'}
              </p>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B6D11, #639922)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {initials}
            </div>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}