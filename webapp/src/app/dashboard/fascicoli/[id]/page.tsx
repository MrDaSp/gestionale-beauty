'use client'

import { motion } from 'framer-motion'
import { FolderOpen, ArrowLeft, User, FileText, Calendar as CalendarIcon, Loader2, Download, Eye, Globe } from 'lucide-react'
import { useEffect, useState, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function FascicoloDettaglioPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const supabase = createClient()
  const [fascicolo, setFascicolo] = useState<any>(null)
  const [documenti, setDocumenti] = useState<any[]>([])
  const [eventi, setEventi] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Fetch Fascicolo details with Client data
      const { data: fData } = await supabase
        .from('fascicoli')
        .select('*, clienti(nome, cognome, email, telefono)')
        .eq('id', resolvedParams.id)
        .single()
      
      if (fData) setFascicolo(fData)

      // Fetch Documenti for this Fascicolo
      const { data: docs } = await supabase
        .from('documenti')
        .select('*')
        .eq('fascicolo_id', resolvedParams.id)
        .order('created_at', { ascending: false })
      if (docs) setDocumenti(docs)

      // Fetch Eventi for this Fascicolo
      const { data: evts } = await supabase
        .from('eventi_agenda')
        .select('*')
        .eq('fascicolo_id', resolvedParams.id)
        .order('data_ora', { ascending: true })
      if (evts) setEventi(evts)
      
      setLoading(false)
    }
    loadData()
  }, [supabase, resolvedParams.id])

  async function handleOpenFile(storagePath: string) {
    try {
      // Create a temporary signed URL valid for 60 seconds
      const { data, error } = await supabase.storage.from('documenti').createSignedUrl(storagePath, 60)
      if (error) throw error
      if (data) {
        // Open the URL in a new tab (the browser will preview PDFs and Images natively)
        window.open(data.signedUrl, '_blank')
      }
    } catch (error) {
      console.error(error)
      alert("Impossibile aprire il file. Controlla i permessi.")
    }
  }

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
  }

  if (!fascicolo) {
    return (
      <div className="glass rounded-3xl p-12 border border-slate-200 text-center">
        <h3 className="text-xl font-medium text-slate-700">Fascicolo non trovato</h3>
        <Link href="/dashboard/fascicoli" className="text-emerald-500 mt-4 inline-block hover:underline">Torna ai fascicoli</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/fascicoli" className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
            {fascicolo.titolo}
          </h1>
          <div className="flex items-center gap-4 text-slate-500 mt-2 text-sm font-medium">
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> Cliente: {fascicolo.clienti?.nome} {fascicolo.clienti?.cognome}</span>
            {fascicolo.numero_pratica && <span className="flex items-center gap-1"><FolderOpen className="w-4 h-4" /> Pratica n. {fascicolo.numero_pratica}</span>}
            <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> Creato il {new Date(fascicolo.created_at).toLocaleDateString('it-IT')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonna Principale: Documenti */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-white/50 p-4 rounded-t-2xl border-b border-slate-200">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              Documenti ({documenti.length})
            </h2>
            <Link href="/dashboard/inbox" className="text-sm text-emerald-500 hover:underline font-medium">
              + Carica nuovo
            </Link>
          </div>
          
          {documenti.length === 0 ? (
            <div className="glass rounded-b-2xl p-12 border border-slate-200 text-center flex flex-col items-center">
              <FileText className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-slate-500">Nessun documento caricato in questo fascicolo.</p>
            </div>
          ) : (
            <div className="glass rounded-b-2xl border border-slate-200 divide-y divide-slate-800/50">
              {documenti.map((doc) => (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-100/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-300">
                      <FileText className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 text-sm">{doc.nome_file}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs font-medium text-slate-500">
                        <span>• {new Date(doc.created_at).toLocaleDateString('it-IT')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenFile(doc.storage_path)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-emerald-400 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Apri</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Info Cliente */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-500" />
              Info Cliente
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nome Completo</p>
                <p className="text-slate-700 font-medium">{fascicolo.clienti?.nome} {fascicolo.clienti?.cognome}</p>
              </div>
              {fascicolo.clienti?.telefono && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Telefono</p>
                  <a href={`tel:${fascicolo.clienti.telefono}`} className="text-emerald-400 hover:underline font-medium">{fascicolo.clienti.telefono}</a>
                </div>
              )}
              {fascicolo.clienti?.email && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</p>
                  <a href={`mailto:${fascicolo.clienti.email}`} className="text-emerald-400 hover:underline font-medium">{fascicolo.clienti.email}</a>
                </div>
              )}
            </div>
          </div>
          
          <div className="glass rounded-3xl p-6 border border-emerald-900/30 bg-emerald-900/5">
            <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-2">Stato Pratica</h3>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-emerald-400 font-medium text-lg uppercase tracking-wide">{fascicolo.stato}</span>
            </div>
          </div>

          <div className="glass rounded-3xl border border-slate-200 overflow-hidden">
            <div className="bg-white/80 p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-500" />
                Scadenze Pratica
              </h3>
            </div>
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {eventi.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">Nessuna scadenza o udienza fissata.</p>
              ) : (
                eventi.map(ev => {
                  const past = new Date(ev.data_ora) < new Date()
                  return (
                    <div key={ev.id} className={`pl-3 border-l-2 ${past ? 'border-slate-300 opacity-50' : ev.tipo === 'udienza' ? 'border-red-500' : 'border-amber-500'} relative`}>
                      <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${past ? 'bg-slate-200' : ev.tipo === 'udienza' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                      <p className={`font-semibold text-sm ${past ? 'text-slate-500 line-through' : 'text-slate-700'}`}>{ev.titolo}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">{new Date(ev.data_ora).toLocaleString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • {ev.tipo}</p>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      