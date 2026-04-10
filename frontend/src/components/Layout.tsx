import { Link, useLocation } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { LayoutDashboard, CheckSquare, Trophy, FileText } from 'lucide-react'
import { useInitApi } from '../hooks/useInitApi'

const nav = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/tasks',        label: 'Tasks',        icon: CheckSquare },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/reports',      label: 'Reports',      icon: FileText },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  useInitApi()
  const { pathname } = useLocation()

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-border flex flex-col py-8 px-5 gap-1 shrink-0">
        <div className="px-3 mb-8">
          <h1 className="text-2xl font-black tracking-tight">⚡ ProdTracker</h1>
          <p className="text-xs text-muted-foreground mt-1">Stay consistent. Level up.</p>
        </div>

        <nav className="flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${pathname === to
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-border pt-5 px-3 flex items-center gap-3">
          <UserButton />
          <div>
            <p className="text-sm font-medium">My Account</p>
            <p className="text-xs text-muted-foreground">Manage profile</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className="max-w-4xl mx-auto px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  )
}