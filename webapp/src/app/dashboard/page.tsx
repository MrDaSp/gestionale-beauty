'use client'

import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Users, Sparkles, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function DashboardPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ appuntamentiOggi: 0, totaleClienti: 0 })

  useEffect(() => {
    async function loadStats() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: member } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', session.user.id).single()
      if (member) {
        // Appuntamenti oggi
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)

        const { count: countAppuntamenti } = await supabase.from('appuntamenti')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', member.workspace_id)
          .gte('data_ora_inizio', startOfDay.toISOString())
          .lte('data_ora_inizio', endOfDay.toISOString())
        
        // Count clienti
        const { count: countClienti } = await supabase.from('clienti')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', member.workspace_id)
        
        setStats({
          appuntamentiOggi: countAppuntamenti || 0,
          totaleClienti: countClienti || 0
        })
      }
      setLoading(false)
    }
    loadStats()
  }, [supabase])

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass rounded-3xl p-8 border border-slate-200 relative overflow-hidden flex justify-between items-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-emerald-900">Benvenuto nel tuo Salone Digitale</h2>
          <p className="text-emerald-700 mt-2 max-w-lg">
            La piattaforma intelligente per gestire i tuoi clienti, appuntamenti e trattamenti con zero passaggi inutili.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats: Appuntamenti */}
        <Link href="/dashboard/agenda" className="glass rounded-3xl p-6 border border-slate-200 hover:border-emerald-500/50 transition-all group block">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold text-slate-900">{stats.appuntamentiOggi}</span>
          </div>
          <h3 className="font-semibold text-slate-900 text-lg">Appuntamenti Oggi</h3>
          <p className="text-sm text-slate-500 mt-1">Prenotazioni in programma</p>
        </Link>

        {/* Quick Stats: Clienti */}
        <Link href="/dashboard/clienti" className="glass rounded-3xl p-6 border border-slate-200 hover:border-emerald-500/50 transition-all group block relative">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold text-slate-900">{stats.totaleClienti}</span>
          </div>
          <h3 className="font-semibold text-slate-900 text-lg">Totale Clienti</h3>
          <p className="text-sm text-slate-500 mt-1">Anagrafiche nel salone</p>
        </Link>

        {/* Quick Action: Servizi */}
        <Link href="/dashboard/servizi" className="glass rounded-3xl p-6 border border-slate-200 hover:border-emerald-500/50 transition-all group block bg-gradient-to-br from-emerald-900/20 to-transparent">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <h4 className="font-semibold text-slate-900">Listino Servizi</h4>
          <p className="text-sm text-slate-500 mt-1">Gestisci i trattamenti offerti.</p>
        </Link>
      </div>
    </div>
  )
}
