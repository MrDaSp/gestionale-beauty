'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, CreditCard } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function BillingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user)
    })
  }, [])

  const handleCheckout = async (planKey: string, planName: string, amount: number) => {
    if (!user) {
      alert("Utente non trovato")
      return
    }
    setLoading(planKey)
    try {
      const res = await fetch('https://panel.dani-sys.it/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app: 'kallos',
          plan: planName,
          amount: amount,
          email: user.email,
        })
      })
      const data = await res.json()
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        alert("Errore durante la generazione del checkout")
      }
    } catch (e) {
      console.error(e)
      alert("Errore di connessione al server pagamenti")
    }
    setLoading(null)
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-emerald-500" />
          Piani e Abbonamento
        </h1>
        <p className="text-slate-500 text-lg">Scegli il piano più adatto alle esigenze del tuo salone.</p>
      </div>

      <div className="flex justify-center items-center gap-4 mb-12">
        <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>Mensile</span>
        <button 
          onClick={() => setIsAnnual(!isAnnual)}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 transition-colors focus:outline-none"
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <span className={`text-sm font-medium flex items-center gap-2 ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
          Annuale <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">Risparmi</span>
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Standard */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Standard</h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-extrabold text-slate-900">€{isAnnual ? '500' : '50'}</span>
            <span className="text-slate-500 font-medium">/{isAnnual ? 'anno' : 'mese'}</span>
          </div>
          <p className="text-slate-500 mb-8 flex-1">Ideale per freelance e piccoli saloni in crescita.</p>
          <button 
            onClick={() => handleCheckout('standard', isAnnual ? 'Standard Annuale' : 'Standard Mensile', isAnnual ? 500 : 50)}
            disabled={loading !== null}
            className="w-full py-3 px-4 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-colors mb-8 disabled:opacity-50"
          >
            {loading === 'standard' ? 'Attendere...' : 'Scegli Standard'}
          </button>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-slate-600 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Fino a 15 Clienti</li>
            <li className="flex items-center gap-3 text-slate-600 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Storico Trattamenti</li>
          </ul>
        </div>

        {/* Pro */}
        <div className="bg-emerald-600 rounded-3xl p-8 border border-emerald-500 shadow-xl shadow-emerald-500/20 flex flex-col relative transform md:-translate-y-4">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-200 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Più Popolare
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-extrabold text-white">€{isAnnual ? '800' : '80'}</span>
            <span className="text-emerald-100 font-medium">/{isAnnual ? 'anno' : 'mese'}</span>
          </div>
          <p className="text-emerald-100 mb-8 flex-1">La soluzione completa per saloni affermati.</p>
          <button 
            onClick={() => handleCheckout('pro', isAnnual ? 'Pro Annuale' : 'Pro Mensile', isAnnual ? 800 : 80)}
            disabled={loading !== null}
            className="w-full py-3 px-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors mb-8 disabled:opacity-50 shadow-sm"
          >
            {loading === 'pro' ? 'Attendere...' : 'Scegli Pro'}
          </button>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-emerald-50 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-300" /> Fino a 30 Clienti</li>
            <li className="flex items-center gap-3 text-emerald-50 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-300" /> Prenotazioni Online</li>
            <li className="flex items-center gap-3 text-emerald-50 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-300" /> Tutto del piano Standard</li>
          </ul>
        </div>

        {/* Unlimited */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Unlimited</h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-extrabold text-slate-900">€{isAnnual ? '1200' : '149'}</span>
            <span className="text-slate-500 font-medium">/{isAnnual ? 'anno' : 'mese'}</span>
          </div>
          <p className="text-slate-500 mb-8 flex-1">Nessun limite. Per grandi centri estetici.</p>
          <button 
            onClick={() => handleCheckout('unlimited', isAnnual ? 'Unlimited Annuale' : 'Unlimited Mensile', isAnnual ? 1200 : 149)}
            disabled={loading !== null}
            className="w-full py-3 px-4 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors mb-8 disabled:opacity-50"
          >
            {loading === 'unlimited' ? 'Attendere...' : 'Scegli Unlimited'}
          </button>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-slate-600 font-medium"><CheckCircle2 className="w-5 h-5 text-slate-400" /> Clienti Illimitati</li>
            <li className="flex items-center gap-3 text-slate-600 font-medium"><CheckCircle2 className="w-5 h-5 text-slate-400" /> Messaggi WhatsApp</li>
            <li className="flex items-center gap-3 text-slate-600 font-medium"><CheckCircle2 className="w-5 h-5 text-slate-400" /> Tutto del piano Pro</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
