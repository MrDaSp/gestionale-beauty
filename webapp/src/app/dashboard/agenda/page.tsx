'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, Plus, User, Clock, CheckCircle2, XCircle, AlertCircle, Sparkles, Scissors, Euro, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AgendaPage() {
  const supabase = createClient()
  
  const [appuntamenti, setAppuntamenti] = useState<any[]>([])
  const [clienti, setClienti] = useState<any[]>([])
  const [servizi, setServizi] = useState<any[]>([])
  const [operatori, setOperatori] = useState<any[]>([])
  
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Seleziona Data Corrente per la vista "Giornaliera"
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Form State
  const [selectedCliente, setSelectedCliente] = useState('')
  const [selectedServizio, setSelectedServizio] = useState('')
  const [selectedOperatore, setSelectedOperatore] = useState('')
  const [dataOraInizio, setDataOraInizio] = useState('')
  const [durataMinuti, setDurataMinuti] = useState(30)
  const [prezzoFinale, setPrezzoFinale] = useState(0)

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
      
      // Fetch Appuntamenti
      const { data: appuntamentiData } = await supabase
        .from('appuntamenti')
        .select(`
          *,
          clienti (nome, cognome, telefono),
          servizi (nome_servizio, categoria, settore, prezzo, durata_minuti),
          users (nome, cognome, colore_agenda)
        `)
        .eq('workspace_id', member.workspace_id)
        .order('data_ora_inizio', { ascending: true })
        
      if (appuntamentiData) setAppuntamenti(appuntamentiData)

      // Fetch Clienti
      const { data: clientiData } = await supabase.from('clienti').select('id, nome, cognome').eq('workspace_id', member.workspace_id).order('nome')
      if (clientiData) setClienti(clientiData)

      // Fetch Servizi
      const { data: serviziData } = await supabase.from('servizi').select('*').eq('workspace_id', member.workspace_id).order('nome_servizio')
      if (serviziData) setServizi(serviziData)

      // Fetch Operatori (Staff)
      const { data: staffData } = await supabase.from('workspace_members').select('user_id, users(id, nome, cognome)').eq('workspace_id', member.workspace_id)
      if (staffData) {
         setOperatori(staffData.map(s => s.users))
      }
    }
    setLoading(false)
  }

  // Quando viene selezionato un servizio, pre-imposta il prezzo e la durata di base
  useEffect(() => {
    if (selectedServizio && servizi.length > 0) {
      const s = servizi.find(s => s.id === selectedServizio)
      if (s) {
        setPrezzoFinale(s.prezzo)
        setDurataMinuti(s.durata_minuti)
      }
    }
  }, [selectedServizio, servizi])

  async function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault()
    if (!workspaceId || !selectedCliente || !selectedServizio || !dataOraInizio) return
    setSaving(true)

    // Calcola data_ora_fine in base alla durata
    const inizio = new Date(dataOraInizio)
    const fine = new Date(inizio.getTime() + durataMinuti * 60000)

    try {
      const { error } = await supabase.from('appuntamenti').insert({
        workspace_id: workspaceId,
        cliente_id: selectedCliente,
        servizio_id: selectedServizio,
        operatore_id: selectedOperatore || null,
        data_ora_inizio: inizio.toISOString(),
        data_ora_fine: fine.toISOString(),
        stato: 'prenotato',
        prezzo_finale: prezzoFinale
      })

      if (error) throw error

      setIsModalOpen(false)
      // Reset form
      setSelectedCliente('')
      setSelectedServizio('')
      setSelectedOperatore('')
      setDataOraInizio('')
      setDurataMinuti(30)
      setPrezzoFinale(0)
      
      // Ricarica la lista
      loadData()
    } catch (error) {
      console.error(error)
      alert("Errore durante la creazione dell'appuntamento")
    } finally {
      setSaving(false)
    }
  }

  async function updateStato(id: string, nuovoStato: string) {
    const { error } = await supabase.from('appuntamenti').update({ stato: nuovoStato }).eq('id', id)
    if (!error) {
      loadData()
    }
  }

  // Filtriamo gli appuntamenti per il giorno selezionato
  const filteredAppuntamenti = appuntamenti.filter(app => {
    const appDate = new Date(app.data_ora_inizio)
    return appDate.getDate() === selectedDate.getDate() && 
           appDate.getMonth() === selectedDate.getMonth() && 
           appDate.getFullYear() === selectedDate.getFullYear()
  })

  // Funzione per cambiare giorno
  const changeDay = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
  }

  const getStatusColor = (stato: string) => {
    switch (stato) {
      case 'prenotato': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'confermato': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'in_salone': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'completato': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'cancellato': return 'bg-red-100 text-red-700 border-red-200'
      case 'no_show': return 'bg-slate-200 text-slate-700 border-slate-300'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
            <CalendarIcon className="w-8 h-8 text-emerald-500" />
            Agenda Appuntamenti
          </h1>
          <p className="text-slate-500 mt-2">Pianifica le tue giornate con un click.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuovo Appuntamento
        </button>
      </div>

      {/* Controller Data Giornaliera */}
      <div className="glass rounded-2xl p-4 border border-slate-200 flex justify-between items-center">
        <button onClick={() => changeDay(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors font-medium text-slate-600">
          ← Giorno Precedente
        </button>
        
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           {selectedDate.toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h2>

        <button onClick={() => changeDay(1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors font-medium text-slate-600">
          Giorno Successivo →
        </button>
      </div>

      {/* Lista Appuntamenti del giorno */}
      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
      ) : filteredAppuntamenti.length === 0 ? (
        <div className="glass rounded-3xl p-16 border border-slate-200 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-100/50 rounded-full flex items-center justify-center mb-4">
            <CalendarIcon className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-medium text-slate-700">Agenda libera per oggi</h3>
          <p className="text-slate-500 mt-2">Non hai appuntamenti programmati per questa data.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppuntamenti.map((app) => (
            <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass bg-white/60 rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
               
               {/* Orario e Info Base */}
               <div className="flex items-center gap-6">
                  <div className="text-center min-w-[80px]">
                     <p className="text-2xl font-bold text-slate-800">{new Date(app.data_ora_inizio).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</p>
                     <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{app.servizi?.durata_minuti} MIN</p>
                  </div>
                  
                  <div className="w-1 h-12 bg-slate-200 rounded-full hidden md:block"></div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      {app.clienti?.nome} {app.clienti?.cognome}
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColor(app.stato)}`}>
                        {app.stato.replace('_', ' ')}
                      </span>
                    </h3>
                    
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                         {app.servizi?.settore === 'estetica' ? <Sparkles className="w-3.5 h-3.5 text-purple-500" /> : <Scissors className="w-3.5 h-3.5 text-emerald-500" />}
                         {app.servizi?.nome_servizio}
                      </span>
                      {app.users && (
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {app.users.nome}
                        </span>
                      )}
                    </div>
                  </div>
               </div>

               {/* Azioni Rapide e Prezzo */}
               <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                  <div className="text-xl font-bold text-slate-800">
                    €{app.prezzo_finale?.toFixed(2)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {app.stato !== 'completato' && app.stato !== 'cancellato' && (
                      <>
                        <button onClick={() => updateStato(app.id, 'completato')} title="Segna come Completato" className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg transition-colors">
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => updateStato(app.id, 'in_salone')} title="Il cliente è in salone" className="p-2 bg-amber-100 text-amber-600 hover:bg-amber-200 rounded-lg transition-colors">
                          <User className="w-5 h-5" />
                        </button>
                        <button onClick={() => updateStato(app.id, 'cancellato')} title="Cancella Appuntamento" className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
               </div>

            </motion.div>
          ))}
        </div>
      )}

      {/* Modale Nuovo Appuntamento */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass w-full max-w-xl rounded-3xl p-6 border border-slate-200 shadow-2xl relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-emerald-500" />
                  Nuovo Appuntamento
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAppointment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-500 mb-1">Cliente *</label>
                    <select required value={selectedCliente} onChange={e => setSelectedCliente(e.target.value)} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-emerald-500 transition-all">
                      <option value="">-- Seleziona Cliente --</option>
                      {clienti.map(c => <option key={c.id} value={c.id}>{c.nome} {c.cognome}</option>)}
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-500 mb-1">Trattamento (Servizio) *</label>
                    <select required value={selectedServizio} onChange={e => setSelectedServizio(e.target.value)} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-emerald-500 transition-all">
                      <option value="">-- Seleziona Trattamento --</option>
                      {servizi.map(s => <option key={s.id} value={s.id}>{s.nome_servizio} - €{s.prezzo}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-500 mb-1">Operatore (Staff)</label>
                    <select value={selectedOperatore} onChange={e => setSelectedOperatore(e.target.value)} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-emerald-500 transition-all">
                      <option value="">-- Assegnazione Libera --</option>
                      {operatori.map(o => <option key={o.id} value={o.id}>{o.nome} {o.cognome}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-500 mb-1">Data e Ora *</label>
                    <input required type="datetime-local" value={dataOraInizio} onChange={e => setDataOraInizio(e.target.value)} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 outline-none focus:border-emerald-500 transition-all [color-scheme:dark]" />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                     <label className="block text-sm font-medium text-slate-500 mb-1">Durata (Minuti) *</label>
                     <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input required type="number" min="5" step="5" value={durataMinuti} onChange={e => setDurataMinuti(Number(e.target.value))} className="w-full bg-white/80 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-slate-900 outline-none focus:border-emerald-500 transition-all" />
                     </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                     <label className="block text-sm font-medium text-slate-500 mb-1">Prezzo Finale (€) *</label>
                     <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input required type="number" min="0" step="0.50" value={prezzoFinale} onChange={e => setPrezzoFinale(Number(e.target.value))} className="w-full bg-white/80 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-slate-900 outline-none focus:border-emerald-500 transition-all font-bold text-emerald-700" />
                     </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-medium transition-all">
                    Annulla
                  </button>
                  <button type="submit" disabled={saving || !selectedCliente || !selectedServizio || !dataOraInizio} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CalendarIcon className="w-5 h-5" />}
                    {saving ? 'Salvataggio...' : 'Prenota Appuntamento'}
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
