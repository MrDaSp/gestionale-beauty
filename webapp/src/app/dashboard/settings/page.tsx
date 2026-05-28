'use client'

import { motion } from 'framer-motion'
import { User, Building, Shield, Bell, Smartphone, Mail, Settings as SettingsIcon, Loader2, Store } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState('salone')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [user, setUser] = useState<{id: string, nome: string, cognome: string, email: string, qualifica: string, specializzazione: string, telegram_chat_id: number | null, telegram_link_code: string | null} | null>(null)
  
  // Edit state
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [qualifica, setQualifica] = useState('')
  const [specializzazione, setSpecializzazione] = useState('')

  // Salone state
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [moduloParrucchieria, setModuloParrucchieria] = useState(true)
  const [moduloEstetica, setModuloEstetica] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single()
      if (data) {
        setUser(data)
        setNome(data.nome || '')
        setCognome(data.cognome || '')
        setQualifica(data.qualifica || '')
        setSpecializzazione(data.specializzazione || '')
      }

      const { data: member } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', session.user.id).single()
      if (member) {
        setWorkspaceId(member.workspace_id)
        const { data: settings } = await supabase.from('impostazioni_salone').select('*').eq('workspace_id', member.workspace_id).maybeSingle()
        if (settings) {
          setModuloParrucchieria(settings.modulo_parrucchieria)
          setModuloEstetica(settings.modulo_estetica)
        }
      }

      setLoading(false)
    }
    loadUser()
  }, [router, supabase])

  // generateTelegramCode removed

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setSaved(false)
    
    // Salva Utente
    await supabase.from('users').update({
      nome,
      cognome,
      qualifica,
      specializzazione
    }).eq('id', user.id)

    // Salva Impostazioni Salone
    if (workspaceId) {
      await supabase.from('impostazioni_salone').upsert({
        workspace_id: workspaceId,
        modulo_parrucchieria: moduloParrucchieria,
        modulo_estetica: moduloEstetica,
        updated_at: new Date().toISOString()
      })
    }
    
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Impostazioni Salone</h1>
        <p className="text-slate-500 mt-2">Gestisci il tuo account e le integrazioni.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Menu laterale impostazioni */}
        <div className="md:col-span-1 space-y-1">
          <button onClick={() => setActiveTab('salone')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'salone' ? 'bg-emerald-600/10 text-emerald-400' : 'text-slate-500 hover:bg-slate-100/50'}`}>
            <Store className="w-5 h-5" /> Il Salone
          </button>
          <button onClick={() => setActiveTab('profilo')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'profilo' ? 'bg-emerald-600/10 text-emerald-400' : 'text-slate-500 hover:bg-slate-100/50'}`}>
            <User className="w-5 h-5" /> Profilo Staff
          </button>
        </div>

        {/* Area di contenuto */}
        <div className="md:col-span-3 space-y-6">
          {loading ? (
             <div className="flex justify-center p-12">
               <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
             </div>
          ) : (
            <>
              {activeTab === 'salone' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 border border-slate-200">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Store className="w-5 h-5 text-emerald-400" />
                    Moduli Attivi
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Seleziona quali moduli vuoi attivare per il tuo salone. Questo cambierà le categorie visibili nel catalogo servizi e nell'agenda.
                  </p>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-white/50 border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-300 transition-all">
                      <div>
                        <span className="block font-medium text-slate-800">Settore Parrucchieria / Barbiere</span>
                        <span className="text-sm text-slate-500">Abilita taglio, piega, colore e trattamenti capelli.</span>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={moduloParrucchieria} onChange={(e) => setModuloParrucchieria(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white/50 border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-300 transition-all">
                      <div>
                        <span className="block font-medium text-slate-800">Settore Estetica / Benessere</span>
                        <span className="text-sm text-slate-500">Abilita trattamenti viso, corpo, unghie e massaggi.</span>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={moduloEstetica} onChange={(e) => setModuloEstetica(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </div>
                    </label>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-200 flex items-center gap-4">
                    <button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {saving ? 'Salvataggio...' : 'Salva Modifiche'}
                    </button>
                    {saved && (
                      <span className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                        Salvato con successo!
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'profilo' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 border border-slate-200">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-400" />
                    Dati Personali
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Nome</label>
                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-white/50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Cognome</label>
                        <input type="text" value={cognome} onChange={(e) => setCognome(e.target.value)} className="w-full bg-white/50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
                      <input type="email" disabled value={user?.email || ''} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2 text-slate-500 opacity-70 cursor-not-allowed" />
                      <p className="text-xs text-slate-500 mt-1">L'email di accesso non può essere modificata da qui.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Qualifica (Es. Parrucchiere)</label>
                        <input type="text" value={qualifica} onChange={(e) => setQualifica(e.target.value)} placeholder="Es. Estetista, Parrucchiere..." className="w-full bg-white/50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Specializzazione</label>
                        <input type="text" value={specializzazione} onChange={(e) => setSpecializzazione(e.target.value)} placeholder="Es. Colore, Taglio Sfilato" className="w-full bg-white/50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-200 flex items-center gap-4">
                      <button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {saving ? 'Salvataggio...' : 'Salva Modifiche'}
                      </button>
                      {saved && (
                        <span className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                          Salvato con successo!
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* End Tabs */}
            </>
          )}
        </div>

      </div>
    </div>
  )
}
