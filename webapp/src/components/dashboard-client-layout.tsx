'use client'

import { LayoutDashboard, Sparkles, Calendar, Settings, LogOut, Users, Menu, X, Shield, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { signOut } from 'next-auth/react'

export function DashboardClientLayout({ 
  children,
  user,
  workspace
}: { 
  children: React.ReactNode,
  user: any,
  workspace: any
}) {
  const pathname = usePathname()
  const router = useRouter()
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera'

  const navItems = [
    { name: 'Scrivania', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clienti & Storico', href: '/dashboard/clienti', icon: Users },
    { name: 'Catalogo Servizi', href: '/dashboard/servizi', icon: Sparkles },
    { name: 'Agenda Appuntamenti', href: '/dashboard/agenda', icon: Calendar },
    { name: 'Abbonamento', href: '/dashboard/billing', icon: CreditCard },
  ]

  async function handleLogout() {
    await signOut({ redirect: true, callbackUrl: '/login' })
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden text-slate-900">
      
      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-20 shrink-0">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-emerald-500/30 shadow-sm">
             <img src="/logo.jpg" alt="Kallos" className="w-full h-full object-cover" />
           </div>
           <h2 className="font-bold text-lg tracking-tight text-slate-900">Kallos</h2>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white/50 backdrop-blur-sm z-30" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200 flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 hidden md:flex items-center gap-3 border-b border-slate-200 shrink-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-emerald-500/30 shadow-sm">
            <img src="/logo.jpg" alt="Kallos" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight">Kallos</h2>
            <p className="text-xs text-slate-500 truncate w-40">
              {workspace?.nome || 'Caricamento...'}
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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

        <div className="p-4 border-t border-slate-200 space-y-1 shrink-0">
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

      <main className="flex-1 flex flex-col overflow-hidden relative z-10 w-full">
        <header className="h-16 border-b border-slate-200 bg-white/50 backdrop-blur-md hidden md:flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-semibold">{greeting}, {user ? user.name?.split(' ')[0] : 'Professionista'}</h1>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold uppercase shadow-sm">
              {user ? user.name?.charAt(0) : 'P'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative z-0">
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
