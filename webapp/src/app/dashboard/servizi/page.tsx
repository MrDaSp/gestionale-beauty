'use client'

import { useState, useEffect } from 'react'
import { getServiziData, addServizio } from './actions'
import { useRouter } from 'next/navigation'
import { Plus, Search, Loader2, Scissors, Sparkles, Clock, Euro } from 'lucide-react'
import { motion } from 'framer-motion'

type Servizio = {
  id: string
  nome_servizio: string
  categoria: string
  settore: 'parrucchieria' | 'estetica'
  durata_minuti: number
  prezzo: number
}

export default function ServiziPage() {
  const router = useRouter()

  const [servizi, setServizi] = useState<Servizio[]>([])
  const [loading, setLoading] = useState(true)
  
  const [moduloParrucchieria, setModuloParrucchieria] = useState(true)
  const [moduloEstetica, setModuloEstetica] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // New Service Form
  const [nomeServizio, setNomeServizio] = useState('')
  const [categoria, setCategoria] = useState('Taglio e Forma')
  const [settore, setSettore] = useState<'parrucchieria' | 'estetica'>('parrucchieria')
  const [durata, setDurata] = useState('30')
  const [prezzo, setPrezzo] = useState('0')

  useEffect(() => {
    async function loadData() {
      try {
        const { servizi, settings } = await getServiziData()
        // If settings ever had modulo_parrucchieria, it doesn't anymore, so we default to true for both.
        setModuloParrucchieria(true)
        setModuloEstetica(true)
        setServizi(servizi as Servizio[])
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const categorieParrucchieria = ['Taglio e Forma', 'Colore', 'Trattamenti Tecnici', 'Styling & Acconciature', 'Altro']
  const categorieEstetica = ['Trattamenti Viso', 'Trattamenti Corpo', 'Manicure / Pedicure', 'Altro']

  async function handleAddServizio(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const nuovo = await addServizio({
        nome_servizio: nomeServizio,
        categoria,
        settore,
        durata_minuti: parseInt(durata),
        prezzo: parseFloat(prezzo)
      })

      setServizi([...servizi, nuovo as Servizio])
      setIsModalOpen(false)
      // Reset form
      setNomeServizio('')
      setDurata('30')
      setPrezzo('0')
    } catch (err) {
      console.error(err)
      alert("Errore salvataggio servizio")
    }
    setSaving(false)
  }

  const filteredServizi = servizi.filter(s => 
    s.nome_servizio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const parrucchieriaServizi = filteredServizi.filter(s => s.settore === 'parrucchieria')
  const esteticaServizi = filteredServizi.filter(s => s.settore === 'estetica')

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Catalogo Servizi</h1>
          <p className="text-slate-500 mt-1">Gestisci i trattamenti, i prezzi e le durate del tuo salone.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" /> Nuovo Servizio
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Cerca un servizio o una categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/80 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-12">
          {moduloParrucchieria && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Scissors className="w-6 h-6 text-emerald-500" /> Parrucchieria / Barbiere
              </h2>
              {parrucchieriaServizi.length === 0 ? (
                <div className="text-center p-8 bg-white/50 border border-slate-200 rounded-2xl">
                  <p className="text-slate-500">Nessun servizio di parrucchieria inserito.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {parrucchieriaServizi.map((servizio) => (
                    <div key={servizio.id} className="bg-white/80 border border-slate-200 p-5 rounded-2xl hover:border-emerald-300 transition-all shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider">{servizio.categoria}</span>
                        <h3 className="text-lg font-bold text-slate-800 mt-3">{servizio.nome_servizio}</h3>
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                          <Clock className="w-4 h-4" /> {servizio.durata_minuti} min
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-lg">
                          <Euro className="w-4 h-4" /> {servizio.prezzo.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {moduloEstetica && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-500" /> Estetica / Benessere
              </h2>
              {esteticaServizi.length === 0 ? (
                <div className="text-center p-8 bg-white/50 border border-slate-200 rounded-2xl">
                  <p className="text-slate-500">Nessun servizio di estetica inserito.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {esteticaServizi.map((servizio) => (
                    <div key={servizio.id} className="bg-white/80 border border-slate-200 p-5 rounded-2xl hover:border-emerald-300 transition-all shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-md uppercase tracking-wider">{servizio.categoria}</span>
                        <h3 className="text-lg font-bold text-slate-800 mt-3">{servizio.nome_servizio}</h3>
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                          <Clock className="w-4 h-4" /> {servizio.durata_minuti} min
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-lg">
                          <Euro className="w-4 h-4" /> {servizio.prezzo.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Nuovo Servizio */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold">Aggiungi Servizio</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2">&times;</button>
            </div>
            
            <form onSubmit={handleAddServizio} className="p-6 space-y-5">
              
              {moduloParrucchieria && moduloEstetica && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Settore</label>
                  <select 
                    value={settore} 
                    onChange={(e) => {
                      setSettore(e.target.value as 'parrucchieria' | 'estetica')
                      setCategoria(e.target.value === 'parrucchieria' ? categorieParrucchieria[0] : categorieEstetica[0])
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="parrucchieria">Parrucchieria / Barbiere</option>
                    <option value="estetica">Estetica / Benessere</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <select 
                  value={categoria} 
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {(settore === 'parrucchieria' ? categorieParrucchieria : categorieEstetica).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Servizio</label>
                <input 
                  type="text" 
                  required 
                  value={nomeServizio} 
                  onChange={(e) => setNomeServizio(e.target.value)}
                  placeholder="Es. Taglio Sfilato, Balayage, Manicure..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Durata (Minuti)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      required 
                      min="5" step="5"
                      value={durata} 
                      onChange={(e) => setDurata(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Clock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prezzo Base (€)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      required 
                      min="0" step="0.5"
                      value={prezzo} 
                      onChange={(e) => setPrezzo(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Euro className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all">
                  Annulla
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-medium transition-all flex justify-center items-center gap-2">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salva Servizio'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
