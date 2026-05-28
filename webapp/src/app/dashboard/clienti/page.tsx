'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Search, Building, User, Phone, Mail, FileText, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ClientiPage() {
  const supabase = createClient()
  const [clienti, setClienti] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [codiceFiscale, setCodiceFiscale] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: member } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', session.user.id).single()
      if (member) {
        setWorkspaceId(member.workspace_id)
        const { data: clientsData } = await supabase.from('clienti').select('*').eq('workspace_id', member.workspace_id).order('created_at', { ascending: false })
        if (clientsData) setClienti(clientsData)
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  async function handleAddCliente(e: React.FormEvent) {
    e.preventDefault()
    if (!workspaceId) return
    setSaving(true)
    
    const { data, error } = await supabase.from('clienti').insert({
      workspace_id: workspaceId,
      nome,
      cognome,
      codice_fiscale: codiceFiscale,
      email,
      telefono
    }).select().single()

    if (data) {
      setClienti([data, ...clienti])
      setIsModalOpen(false)
      // Reset form
      setNome('')
      setCognome('')
      setCodiceFiscale('')
      setEmail('')
      setTelefono('')
    } else {
      console.error(error)
      alert("Errore salvataggio cliente")
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-500" />
            Rubrica Clienti
          </h1>
          <p className="text-slate-500 mt-2">Gestisci l'anagrafica dei tuoi clienti.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuovo Cliente
        </button>
      </div>

      {/* Toolbar */}
      <div className="glass rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input type="text" placeholder="Cerca per nome, cognome o CF..." className="w-full bg-white/50 border border-slate-300 rounded-xl py-2 pl-10 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
        </div>
      </div>

      {/* Lista Clienti */}
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : clienti.length === 0 ? (
        <div className="glass rounded-3xl p-12 border border-slate-200 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-100/50 rounded-full flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-medium text-slate-700">Nessun cliente presente</h3>
          <p className="text-slate-500 mb-6">La tua rubrica è vuota. Aggiungi il primo cliente per gestire i suoi appuntamenti e trattamenti.</p>
          <button onClick={() => setIsModalOpen(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-3 rounded-xl font-medium transition-all">
            Crea il primo cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clienti.map((cliente) => (
            <motion.div key={cliente.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 border border-slate-200 hover:border-emerald-500/50 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xl border border-emerald-500/20">
                  {cliente.nome.charAt(0)}{cliente.cognome.charAt(0)}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-400 transition-colors">{cliente.nome} {cliente.cognome}</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-500">
                {cliente.telefono && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {cliente.telefono}</div>}
                {cliente.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {cliente.email}</div>}
                {cliente.codice_fiscale && <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> {cliente.codice_fiscale}</div>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modale Nuovo Cliente */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass w-full max-w-lg rounded-3xl p-6 border border-slate-200 shadow-2xl relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" />
                  Aggiungi Nuovo Cliente
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddCliente} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Nome *</label>
                    <input required type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Cognome *</label>
                    <input required type="text" value={cognome} onChange={e => setCognome(e.target.value)} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Note / Allergie</label>
                  <input type="text" value={codiceFiscale} onChange={e => setCodiceFiscale(e.target.value.toUpperCase())} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none uppercase transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Telefono</label>
                    <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                </div>
                
                <div className="pt-6 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-medium transition-all">
                    Annulla
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    Crea Cliente
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
