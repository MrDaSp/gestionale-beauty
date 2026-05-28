'use client'

import { motion } from 'framer-motion'
import { User, Building, Shield, Bell, Smartphone, Mail, Settings as SettingsIcon, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState('profilo')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [user, setUser] = useState<{id: string, nome: string, cognome: string, email: string, foro: string, numero_albo: string, telegram_chat_id: number | null, telegram_link_code: string | null} | null>(null)
  
  // Edit state
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [foro, setForo] = useState('')
  const [albo, setAlbo] = useState('')

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
        setForo(data.foro || '')
        setAlbo(data.numero_albo || '')
      }
      setLoading(false)
    }
    loadUser()
  }, [router, supabase])

  async function generateTelegramCode() {
    if (!user) return
    // Genera un codice casuale es. STYLO-A1B2
    const code = 'STYLO-' + Math.random().toString(36).substring(2, 6).toUpperCase()
    
    await supabase.from('users').update({ telegram_link_code: code }).eq('id', user.id)
    setUser({ ...user, telegram_link_code: code })
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setSaved(false)
    await supabase.from('users').update({
      nome,
      cognome,
      foro,
      numero_albo: albo
    }).eq('id', user.id)
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
          <button onClick={() => setActiveTab('profilo')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'profilo' ? 'bg-emerald-600/10 text-emerald-400' : 'text-slate-500 hover:bg-slate-100/50'}`}>
            <User className="w-5 h-5" /> Profilo
          </button>
          <button onClick={() => setActiveTab('telegram')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'telegram' ? 'bg-emerald-600/10 text-emerald-400' : 'text-slate-500 hover:bg-slate-100/50'}`}>
            <Smartphone className="w-5 h-5" /> Bot Telegram
          </button>
          <button onClick={() => setActiveTab('email')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'email' ? 'bg-emerald-600/10 text-emerald-400' : 'text-slate-500 hover:bg-slate-100/50'}`}>
            <Mail className="w-5 h-5" /> Email Inbound
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
                        <label className="block text-sm font-medium text-slate-500 mb-1">Specializzazione</label>
                        <input type="text" value={foro} onChange={(e) => setForo(e.target.value)} placeholder="Es. Taglio, Colore, Estetica" className="w-full bg-white/50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">P.IVA</label>
                        <input type="text" value={albo} onChange={(e) => setAlbo(e.target.value)} placeholder="Es. 12345678901" className="w-full bg-white/50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
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

              {activeTab === 'telegram' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 border border-slate-200">
                  <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-500" />
                    Integrazione Stylo Telegram Bot
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Inoltra le foto e i documenti che ricevi su WhatsApp direttamente al Bot Telegram di Stylo.
                    Il Bot ti chiederà in quale scheda trattamento salvarli.
                  </p>
                  
                  {user?.telegram_chat_id ? (
                    <div className="bg-emerald-50/80 p-6 rounded-xl border border-emerald-200 flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                        <Smartphone className="w-6 h-6 text-emerald-600" />
                      </div>
                      <h4 className="font-semibold text-emerald-800 text-lg mb-1">Bot Connesso con Successo!</h4>
                      <p className="text-sm text-emerald-600">Il tuo account Telegram è stato agganciato. Ora puoi condividere file al @StyloBot.</p>
                    </div>
                  ) : (
                    <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100 text-center">
                      <h4 className="font-semibold text-slate-800 text-lg mb-2">Connetti il tuo Account</h4>
                      <p className="text-sm text-slate-600 mb-6">Genera un codice univoco per collegare la tua app Telegram al tuo salone su Stylo.</p>
                      
                      {user?.telegram_link_code ? (
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm inline-block">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Il tuo codice segreto</p>
                            <p className="text-2xl font-bold tracking-widest text-emerald-600 font-mono">{user.telegram_link_code}</p>
                          </div>
                          <p className="text-sm text-slate-600 max-w-md mx-auto">
                            Apri Telegram, cerca <strong>@StyloBot</strong> e inviagli questo codice esatto.
                          </p>
                        </div>
                      ) : (
                        <button onClick={generateTelegramCode} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">
                          Genera Codice di Collegamento
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'email' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 border border-slate-200">
                  <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-emerald-500" />
                    Integrazione Inoltro Email
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Inoltra qualsiasi email con allegati (foto, immagini, documenti) all'indirizzo speciale di Stylo. Il sistema li salverà in automatico!
                  </p>
                  
                  <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100 mb-6">
                    <p className="text-sm text-slate-700 font-medium mb-3">Indirizzo di Inoltro:</p>
                    <div className="bg-white p-3 rounded-lg border border-emerald-200 inline-block">
                      <p className="text-lg font-mono font-bold text-emerald-600 select-all">foto@stylo.dani-sys.it</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm text-slate-600">
                    <p className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <span>
                        <strong>Nessuna configurazione necessaria:</strong> Stylo riconoscerà automaticamente che l'email proviene da te perché il mittente corrisponde alla tua email di registrazione (<strong>{user?.email}</strong>).
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <span>
                        <strong>Smistamento via Telegram:</strong> Appena inoltrerai un'email, il Bot Telegram ti manderà un messaggio chiedendoti in quale scheda trattamento archiviare gli allegati estratti.
                      </span>
                    </p>
                    <p className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <Shield className="w-5 h-5 shrink-0" />
                      <span>
                        <strong>Attenzione:</strong> Questa funzione è attiva solo se inoltri l'email dal tuo indirizzo personale associato a Stylo. I clienti non possono inviare documenti direttamente a questo indirizzo.
                      </span>
                    </p>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}
