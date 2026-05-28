'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, Plus, LayoutGrid, List as ListIcon, Clock, FolderOpen, Bell, X, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import TerminiCalculatorModal from '@/components/TerminiCalculatorModal'

export default function AgendaPage() {
  const supabase = createClient()
  const [eventi, setEventi] = useState<any[]>([])
  const [fascicoli, setFascicoli] = useState<any[]>([])
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  
  // UI State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [filter, setFilter] = useState<'tutti' | 'appuntamento' | 'scadenza'>('tutti')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form State
  const [titolo, setTitolo] = useState('')
  const [dataOra, setDataOra] = useState('')
  const [tipo, setTipo] = useState<'appuntamento' | 'scadenza' | 'udienza'>('appuntamento')
  const [selectedFascicolo, setSelectedFascicolo] = useState('')
  const [promemoria, setPromemoria] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: member } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', session.user.id).single()
    if (member) {
      setWorkspaceId(member.workspace_id)
      
      // Fetch Eventi
      const { data: eventiData } = await supabase
        .from('eventi_agenda')
        .select('*, fascicoli(titolo)')
        .eq('workspace_id', member.workspace_id)
        .order('data_ora', { ascending: true })
      if (eventiData) setEventi(eventiData)

      // Fetch Fascicoli (solo aperti) per la tendina
      const { data: fascicoliData } = await supabase
        .from('fascicoli')
        .select('id, titolo')
        .eq('workspace_id', member.workspace_id)
        .eq('stato', 'aperto')
        .order('titolo')
      if (fascicoliData) setFascicoli(fascicoliData)
    }
    setLoading(false)
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!workspaceId || !titolo || !dataOra) return
    setSaving(true)

    try {
      const { error } = await supabase.from('eventi_agenda').insert({
        workspace_id: workspaceId,
        titolo,
        data_ora: new Date(dataOra).toISOString(),
        tipo,
        fascicolo_id: selectedFascicolo || null,
        promemoria_email: promemoria
      })

      if (error) throw error

      setIsModalOpen(false)
      // Reset form
      setTitolo('')
      setDataOra('')
      setTipo('appuntamento')
      setSelectedFascicolo('')
      setPromemoria(false)
      
      // Ricarica la lista
      loadData()
    } catch (error) {
      console.error(error)
      alert("Errore durante la creazione dell'evento")
    } finally {
      setSaving(false)
    }
  }

  const filteredEventi = eventi.filter(ev => {
    if (filter === 'tutti') return true
    if (filter === 'appuntamento') return ev.tipo === 'appuntamento'
    if (filter === 'scadenza') return ev.tipo === 'scadenza' || ev.tipo === 'udienza'
    return true
  })

  // Funzione per capire se l'evento è passato
  const isPast = (dateString: string) => new Date(dateString) < new Date()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
            <CalendarIcon className="w-8 h-8 text-emerald-500" />
            Agenda Legale
          </h1>
          <p className="text-slate-500 mt-2">La tua postazione di controllo temporale.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsCalculatorOpen(true)} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 border border-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calculator"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
            Calcola Termini
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nuovo Evento
          </button>
        </div>
      </div>

      {/* Controlli Vista e Filtri */}
      <div className="glass rounded-2xl p-2 border border-slate-200 flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-2 p-1 bg-white/50 rounded-xl">
          <button onClick={() => setFilter('tutti')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'tutti' ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>Tutto</button>
          <button onClick={() => setFilter('appuntamento')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'appuntamento' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-900'}`}>Appuntamenti</button>
          <button onClick={() => setFilter('scadenza')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'scadenza' ? 'bg-red-500/20 text-red-400' : 'text-slate-500 hover:text-slate-900'}`}>Scadenze / Udienze</button>
        </div>
        <div className="flex gap-2 p-1 pr-2">
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
            <ListIcon className="w-5 h-5" />
          </button>
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lista Eventi */}
      {loading ? (
        <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : filteredEventi.length === 0 ? (
        <div className="glass rounded-3xl p-12 border border-slate-200 text-center flex flex-col items-center mt-10">
          <div className="w-20 h-20 bg-slate-100/50 rounded-full flex items-center justify-center mb-4">
            <CalendarIcon className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-medium text-slate-700">La tua agenda è libera</h3>
          <p className="text-slate-500 mt-2">Non ci sono eventi o scadenze per questa vista. Goditi il relax o pianifica il tuo prossimo passo!</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
          {filteredEventi.map((ev) => (
            <motion.div key={ev.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`glass rounded-2xl p-5 border transition-all relative overflow-hidden ${
              isPast(ev.data_ora) ? 'border-slate-200 opacity-60' : 
              (ev.tipo === 'scadenza' || ev.tipo === 'udienza') ? 'border-red-900/50 hover:border-red-500/50' : 'border-emerald-900/50 hover:border-emerald-500/50'
            }`}>
              {/* Colore di sfondo laterale */}
              <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                isPast(ev.data_ora) ? 'bg-slate-200' :
                (ev.tipo === 'scadenza' || ev.tipo === 'udienza') ? 'bg-red-500' : 'bg-emerald-500'
              }`}></div>

              <div className="flex justify-between items-start pl-2">
                <div>
                  <h3 className={`font-bold text-lg ${isPast(ev.data_ora) ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{ev.titolo}</h3>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100/50 px-2 py-1 rounded-md font-medium">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      {new Date(ev.data_ora).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                    </span>
                    {ev.promemoria_email && <span title="Promemoria Email Attivo"><Bell className="w-4 h-4 text-amber-500" /></span>}
                  </div>
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                  isPast(ev.data_ora) ? 'bg-slate-100 text-slate-500' :
                  (ev.tipo === 'scadenza' || ev.tipo === 'udienza') ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {ev.tipo}
                </span>
              </div>

              {ev.fascicolo_id && (
                <div className="mt-4 pt-4 border-t border-slate-200/50 flex justify-between items-center pl-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <FolderOpen className="w-4 h-4" />
                    {ev.fascicoli?.titolo}
                  </div>
                  <Link href={`/dashboard/fascicoli/${ev.fascicolo_id}`} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline">
                    Apri Fascicolo →
                  </Link>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modale Nuovo Evento */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass w-full max-w-lg rounded-3xl p-6 border border-slate-200 shadow-2xl relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-emerald-500" />
                  Pianifica Evento
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-500 mb-1">Titolo Evento *</label>
                    <input required type="text" placeholder="es. Incontro Mario Rossi o Memorie 183" value={titolo} onChange={e => setTitolo(e.target.value)} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-emerald-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Data e Ora *</label>
                    <input required type="datetime-local" value={dataOra} onChange={e => setDataOra(e.target.value)} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-emerald-500 transition-all [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Tipo di Evento *</label>
                    <select required value={tipo} onChange={e => setTipo(e.target.value as any)} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-emerald-500 transition-all">
                      <option value="appuntamento">Appuntamento</option>
                      <option value="scadenza">Scadenza</option>
                      <option value="udienza">Udienza</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-500 mb-1">Fascicolo Collegato (Opzionale per Appuntamenti)</label>
                    <select value={selectedFascicolo} onChange={e => setSelectedFascicolo(e.target.value)} required={tipo === 'scadenza' || tipo === 'udienza'} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-emerald-500 transition-all">
                      <option value="">-- Nessun Fascicolo --</option>
                      {fascicoli.map(f => (
                        <option key={f.id} value={f.id}>{f.titolo}</option>
                      ))}
                    </select>
                    {(tipo === 'scadenza' || tipo === 'udienza') && !selectedFascicolo && (
                      <p className="text-red-400 text-xs mt-1">Per Scadenze o Udienze devi necessariamente selezionare un fascicolo.</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-6 h-6 border-2 border-slate-600 rounded-md group-hover:border-emerald-500 transition-colors">
                      <input type="checkbox" checked={promemoria} onChange={e => setPromemoria(e.target.checked)} className="absolute opacity-0 cursor-pointer" />
                      {promemoria && <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Attiva Promemoria via Email</p>
                      <p className="text-xs text-slate-500">Ricevi un avviso 3 giorni prima dell'evento.</p>
                    </div>
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-medium transition-all">
                    Annulla
                  </button>
                  <button type="submit" disabled={saving || !titolo || !dataOra || ((tipo === 'scadenza' || tipo === 'udienza') && !selectedFascicolo)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CalendarIcon className="w-5 h-5" />}
                    {saving ? 'Salvataggio...' : 'Aggiungi Evento'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TerminiCalculatorModal 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
        workspaceId={workspaceId!} 
        fascicoli=