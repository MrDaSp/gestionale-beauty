'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, Search, Plus, User, FileText, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function FascicoliPage() {
  const supabase = createClient()
  const [fascicoli, setFascicoli] = useState<any[]>([])
  const [clienti, setClienti] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form State
  const [titolo, setTitolo] = useState('')
  const [numeroPratica, setNumeroPratica] = useState('')
  const [clienteId, setClienteId] = useState('')

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: member } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', session.user.id).single()
      if (member) {
        setWorkspaceId(member.workspace_id)
        
        // Fetch clients for the dropdown
        const { data: clientsData } = await supabase.from('clienti').select('id, nome, cognome').eq('workspace_id', member.workspace_id).order('cognome')
        if (clientsData) setClienti(clientsData)

        // Fetch fascicoli with joined client data
        const { data: fascicoliData } = await supabase.from('fascicoli').select('*, clienti(nome, cognome)').eq('workspace_id', member.workspace_id).order('created_at', { ascending: false })
        if (fascicoliData) setFascicoli(fascicoliData)
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  async function handleAddFascicolo(e: React.FormEvent) {
    e.preventDefault()
    if (!workspaceId || !clienteId) return
    setSaving(true)
    
    const { data, error } = await supabase.from('fascicoli').insert({
      workspace_id: workspaceId,
      cliente_id: clienteId,
      titolo,
      numero_pratica: numeroPratica,
      stato: 'aperto'
    }).select('*, clienti(nome, cognome)').single()

    if (data) {
      setFascicoli([data, ...fascicoli])
      setIsModalOpen(false)
      setTitolo('')
      setNumeroPratica('')
      setClienteId('')
    } else {
      console.error(error)
      alert("Errore salvataggio fascicolo")
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
            <FolderOpen className="w-8 h-8 text-emerald-500" />
            Trattamenti
          </h1>
          <p className="text-slate-500 mt-2">Gestisci tutte le schede trattamento dei tuoi clienti.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuovo Trattamento
        </button>
      </div>

      <div className="glass rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input type="text" placeholder="Cerca per trattamento o cliente..." className="w-full bg-white/50 border border-slate-300 rounded-xl py-2 pl-10 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : fascicoli.length === 0 ? (
        <div className="glass rounded-3xl p-12 border border-slate-200 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-100/50 rounded-full flex items-center justify-center mb-4">
            <FolderOpen className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-medium text-slate-700">Nessun trattamento attivo</h3>
          <p className="text-slate-500 mt-2 mb-6 max-w-md">Inizia creando un nuovo trattamento per uno dei tuoi clienti.</p>
          <button onClick={() => setIsModalOpen(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-3 rounded-xl font-medium transition-all">
            Crea il primo trattamento
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {fascicoli.map((fascicolo) => (
            <Link key={fascicolo.id} href={`/dashboard/fascicoli/${fascicolo.id}`} className="block">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 border border-slate-200 hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <FolderOpen className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-400 transition-colors">{fascicolo.titolo}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><User className="w-4 h-4" /> {fascicolo.clienti?.nome} {fascicolo.clienti?.cognome}</span>
                    {fascicolo.numero_pratica && <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> Rif. {fascicolo.numero_pratica}</span>}
                    <span>• Creato il {new Date(fascicolo.created_at).toLocaleDateString('it-IT')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                  fascicolo.stato === 'aperto' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-slate-100 text-slate-500 border-slate-300'
                }`}>
                  {fascicolo.stato}
                </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}

      {/* Modale Nuovo Fascicolo */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass w-full max-w-lg rounded-3xl p-6 border border-slate-200 shadow-2xl relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-emerald-500" />
                  Nuovo Trattamento
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddFascicolo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Cliente *</label>
                  {clienti.length === 0 ? (
                    <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-3 rounded-xl text-sm flex items-center justify-between">
                      Devi prima creare un cliente.
                      <Link href="/dashboard/clienti" className="underline font-medium">Vai in Rubrica</Link>
                    </div>
                  ) : (
                    <select required value={clienteId} onChange={e => setClienteId(e.target.value)} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                      <option value="">-- Seleziona Cliente --</option>
                      {clienti.map(c => (
                        <option key={c.id} value={c.id}>{c.nome} {c.cognome}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Tipo di Trattamento *</label>
                  <input required type="text" value={titolo} onChange={e => setTitolo(e.target.value)} placeholder="Es. Taglio + Colore Maria Rossi" className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Riferimento Interno (Opzionale)</label>
                  <input type="text" value={numeroPratica} onChange={e => setNumeroPratica(e.target.value)} placeholder="Es. STYLO-001" className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                </div>
                
                <div className="pt-6 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-medium transition-all">
                    Annulla
                  </button>
                  <button type="submit" disabled={saving || clienti.length === 0} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crea Trattamento'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
