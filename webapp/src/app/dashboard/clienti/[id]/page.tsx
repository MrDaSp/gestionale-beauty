'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Phone, Mail, Calendar, FileText, Clock, Euro, Sparkles, Scissors, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

export default function SchedaClientePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const router = useRouter()
  
  const [cliente, setCliente] = useState<any>(null)
  const [appuntamenti, setAppuntamenti] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Load client details
      const { data: clientData } = await supabase
        .from('clienti')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (clientData) {
        setCliente(clientData)
      } else {
        router.push('/dashboard/clienti')
        return
      }

      // Load appuntamenti history
      const { data: appData } = await supabase
        .from('appuntamenti')
        .select(`
          *,
          servizi (nome_servizio, categoria, settore),
          users (nome, cognome)
        `)
        .eq('cliente_id', params.id)
        .order('data_ora_inizio', { ascending: false })
      
      if (appData) {
        setAppuntamenti(appData)
      }

      setLoading(false)
    }
    loadData()
  }, [params.id, router, supabase])

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!cliente) return null

  const calculateAge = (dob: string) => {
    if (!dob) return null
    const diff_ms = Date.now() - new Date(dob).getTime()
    const age_dt = new Date(diff_ms)
    return Math.abs(age_dt.getUTCFullYear() - 1970)
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clienti" className="p-2 hover:bg-slate-200 rounded-full transition-colors bg-white border border-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Scheda Tecnica Cliente
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Box */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-3xl p-6 border border-slate-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-3xl border border-emerald-500/20 shadow-inner">
                {cliente.nome.charAt(0)}{cliente.cognome.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{cliente.nome} {cliente.cognome}</h2>
                <p className="text-sm text-slate-500">Cliente dal {new Date(cliente.created_at).getFullYear()}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-700 bg-white/50 p-3 rounded-xl border border-slate-100">
                <Phone className="w-5 h-5 text-slate-400" />
                <span className="font-medium">{cliente.telefono || 'Nessun telefono'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 bg-white/50 p-3 rounded-xl border border-slate-100">
                <Mail className="w-5 h-5 text-slate-400" />
                <span className="font-medium">{cliente.email || 'Nessuna email'}</span>
              </div>
              {cliente.data_nascita && (
                <div className="flex items-center gap-3 text-slate-700 bg-white/50 p-3 rounded-xl border border-slate-100">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <span className="font-medium">{new Date(cliente.data_nascita).toLocaleDateString('it-IT')} ({calculateAge(cliente.data_nascita)} anni)</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" /> Note e Allergie
              </h3>
              <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl text-sm text-amber-900 leading-relaxed min-h-[100px]">
                {cliente.note_allergie || 'Nessuna nota tecnica o allergia registrata per questo cliente.'}
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 border border-slate-200">
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Euro className="w-4 h-4 text-emerald-500" /> Riepilogo Valore
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 border border-slate-100 p-4 rounded-xl text-center">
                  <p className="text-xs text-slate-500 uppercase font-medium mb-1">Visite Totali</p>
                  <p className="text-2xl font-bold text-slate-800">{appuntamenti.filter(a => a.stato === 'completato').length}</p>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl text-center">
                  <p className="text-xs text-emerald-600 uppercase font-medium mb-1">Spesa Totale</p>
                  <p className="text-2xl font-bold text-emerald-700">€{appuntamenti.filter(a => a.stato === 'completato').reduce((acc, curr) => acc + (curr.prezzo_finale || 0), 0).toFixed(2)}</p>
                </div>
              </div>
          </div>
        </div>

        {/* Storico Trattamenti */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-800">Storico Trattamenti</h2>
            <Link href="/dashboard/agenda" className="text-sm text-emerald-600 font-medium hover:underline">
              Prenota Nuovo +
            </Link>
          </div>

          {appuntamenti.length === 0 ? (
            <div className="glass rounded-3xl p-12 border border-slate-200 text-center">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Nessun appuntamento nello storico.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appuntamenti.map((app) => (
                <motion.div key={app.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass bg-white/60 rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${app.servizi?.settore === 'estetica' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {app.servizi?.settore === 'estetica' ? <Sparkles className="w-4 h-4" /> : <Scissors className="w-4 h-4" />}
                        </div>
                        <h4 className="font-bold text-lg text-slate-800">{app.servizi?.nome_servizio || 'Servizio Generico'}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          app.stato === 'completato' ? 'bg-emerald-100 text-emerald-700' :
                          app.stato === 'cancellato' ? 'bg-red-100 text-red-700' :
                          app.stato === 'no_show' ? 'bg-slate-200 text-slate-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {app.stato.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="text-sm text-slate-500 flex flex-wrap items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(app.data_ora_inizio).toLocaleDateString('it-IT')}</div>
                        <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(app.data_ora_inizio).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</div>
                        {app.users && <div className="flex items-center gap-1.5"><User className="w-4 h-4" /> {app.users.nome} {app.users.cognome}</div>}
                      </div>

                      {app.note_formula && (
                        <div className="mt-4 bg-slate-50 border border-slate-100 p-3 rounded-lg text-sm text-slate-700">
                          <strong className="text-slate-900 block mb-1 text-xs uppercase tracking-wider">Formula / Note Tecniche:</strong>
                          {app.note_formula}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 min-w-[120px]">
                      <div className="text-2xl font-bold text-slate-800">
                        €{app.prezzo_finale ? app.prezzo_finale.toFixed(2) : '--'}
                      </div>
                      
                      {(app.foto_prima || app.foto_dopo) && (
                        <div className="mt-auto flex gap-2">
                           <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1">
                             <ImageIcon className="w-3 h-3" /> Foto
                           </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
