'use client'

import { motion } from 'framer-motion'
import { FolderOpen, Calendar as CalendarIcon, Upload, Inbox, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function DashboardPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ fascicoliAperti: 0, documentiOrfani: 0 })

  useEffect(() => {
    async function loadStats() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: member } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', session.user.id).single()
      if (member) {
        // Count fascicoli
        const { count: countFascicoli } = await supabase.from('fascicoli').select('*', { count: 'exact', head: true }).eq('workspace_id', member.workspace_id).eq('stato', 'aperto')
        
        // Count orfani in inbox
        const { count: countOrfani } = await supabase.from('documenti').select('*', { count: 'exact', head: true }).eq('workspace_id', member.workspace_id).is('fascicolo_id', null)
        
        setStats({
          fascicoliAperti: countFascicoli || 0,
          documentiOrfani: countOrfani || 0
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
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Benvenuto nel tuo nuovo Gestionale</h2>
          <p className="text-slate-500 max-w-xl">La piattaforma intelligente per gestire i tuoi clienti, i tuoi fascicoli e smistare i documenti con zero passaggi inutili.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats: Fascicoli */}
        <Link href="/dashboard/fascicoli" className="glass rounded-3xl p-6 border border-slate-200 hover:border-emerald-500/50 transition-all group block">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <FolderOpen className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold text-slate-900">{stats.fascicoliAperti}</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Fascicoli Aperti</h3>
          <p className="text-sm text-slate-500 mt-1">Pratiche attualmente in corso</p>
        </Link>

        {/* Quick Stats: Inbox */}
        <Link href="/dashboard/inbox" className="glass rounded-3xl p-6 border border-slate-200 hover:border-emerald-500/50 transition-all group block relative">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <Inbox className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold text-slate-900">{stats.documentiOrfani}</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Inbox Rapida</h3>
          <p className="text-sm text-slate-500 mt-1">Documenti in attesa di smistamento</p>
          {stats.documentiOrfani > 0 && (
            <div className="absolute top-6 right-6 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          )}
        </Link>

        {/* Quick Action: Upload */}
        <Link href="/dashboard/inbox" className="glass rounded-3xl p-6 border border-slate-200 hover:border-emerald-500/50 transition-all group block bg-gradient-to-br from-blue-900/20 to-transparent">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
              <Upload className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Caricamento Rapido</h3>
          <p className="text-sm text-slate-500 mt-1">Zero doppio passaggio. Carica e smista subito.</p>
        </Link>
      