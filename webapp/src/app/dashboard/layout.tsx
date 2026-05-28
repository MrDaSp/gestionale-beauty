'use client'

import { LayoutDashboard, Sparkles, FolderOpen, Inbox, Calendar, Settings, LogOut, Bell, Users, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<{nome: string, cognome: string, email: string} | null>(null)
  const [workspace, setWorkspace] = useState<{nome: string} | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Fetch user profile
      const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single()
      if (profile) setUser(profile)

      // Fetch workspace
      const { data: member } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', session.user.id).single()
      if (member) {
        const { data: ws } = await supabase.from('workspaces').select('nome').eq('id', member.workspace_id).single()
        if (ws) setWorkspace(ws)
      }
    }
    loadData()
  }, [router, supabase])

  // Dynamic greeting based on time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera'

  const navItems = [
    { name: 'Scrivania', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Rubrica Clienti', href: '/dashboard/clienti', icon: Users },
    { name: 'Trattamenti', href: '/dashboard/fascicoli', icon: Sparkles },
    { name: 'Galleria Foto', href: '/dashboard/inbox', icon: Inbox },
    { name: 'Agenda', href: '/dashboard/agenda', icon: Calendar },
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden text-slate-900">
      
      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-20 shrink-0">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center ring-1 ring-emerald-500/30">
             <span className="font-bold text-emerald-400">S</span>
           </div>
           <h2 className="font-bold text-lg tracking-tight text-slate-900">Stylo</h2>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Overlay Sfondo per Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white/50 backdrop-blur-sm z-30" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar (Nascosta su mobile, fissa su desktop) */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200 flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 hidden md:flex items-center gap-3 border-b border-slate-200 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center ring-1 ring-emerald-500/30">
            <span className="font-bold text-emerald-400 text-xl">S</span>
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight">Stylo</h2>
            <p className="text-xs text-slate-500">{workspace?.nome || 'Caricamento...'}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-700'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : ''}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-1">
          <Link href="/dashboard/settings" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
            pathname === '/dashboard/settings' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-700'
          }`}>
            <Settings className="w-5 h-5" />
            <span className="font-medium">Impostazioni</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Esci</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10 w-full">
        {/* Top Header - Hidden on mobile */}
        <header className="h-16 border-b border-slate-200 bg-white/50 backdrop-blur-md hidden md:flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-semibold">{greeting}, {user ? user.cognome : 'Professionista'}</h1>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-slate-100 transition-all">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 border-2 border-slate-200 cursor-pointer" />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 relative z-0">
          {/* Subtle background blob for the main area */}
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
