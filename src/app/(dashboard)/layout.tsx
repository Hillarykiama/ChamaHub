import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabase()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-green-700" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">ChamaHub</span>
        </div>

        <div className="flex items-center gap-1">
          {[
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/members', label: 'Members' },
            { href: '/contributions', label: 'Contributions' },
            { href: '/loans', label: 'Loans' },
            { href: '/meetings', label: 'Meetings' },
            { href: '/reports', label: 'Reports' },
          ].map((item) => (
            
              <a key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        <form action="/api/auth/signout" method="post">
          <button className="text-sm text-gray-500 hover:text-gray-900">
            Sign out
          </button>
        </form>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  )
}