'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, X, Calendar as CalendarIcon, FolderOpen, Loader2 } from 'lucide-react'
import { LegalTemplates, calcolaScadenza } from '@/utils/legal-calculator'
import { createClient } from '@/utils/supabase/client'

export default function TerminiCalculatorModal({
  isOpen,
  onClose,
  workspaceId,
  fascicoli,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
  fascicoli: any[]
  onSuccess: () => void
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(LegalTemplates[0].id)
  const [startDate, setStartDate] = useState('')
  const [selectedFascicolo, setSelectedFascicolo] = useState('')
  const [applySospensione, setApplySospensione] = useState(true)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  async function handleCalculateAndSave(e: React.FormEvent) {
    e.preventDefault()
    if (!startDate || !selectedFascicolo || !workspaceId) return
    setSaving(true)

    try {
      const template = LegalTemplates.find(t => t.id === selectedTemplateId)
      if (!template) return

      let baseDate = new Date(startDate)
      
      const eventsToInsert = []

      for (const step of template.steps) {
        const decorrenza = step.fromPrevious ? baseDate : new Date(startDate)
        const computedDate = calcolaScadenza({
          startDate: decorrenza,
          daysToAdd: step.daysToAdd,
          applySospensioneFeriale: applySospensione
        })

        eventsToInsert.push({
          workspace_id: workspaceId,
          fascicolo_id: selectedFascicolo,
          titolo: step.name,
          data_ora: computedDate.toISOString(),
          tipo: step.type,
          promemoria_email: true // Promemoria attivo di default per le scadenze automatiche
        })

        // Se lo step successivo parte da questo, aggiorniamo la baseDate
        if (step.fromPrevious || (!step.fromPrevious && template.steps.indexOf(step) === 0 && template.steps.length > 1 && template.steps[1].fromPrevious)) {
            // Nota: logicamente se fromPrevious è true, la computedDate diventa la nuova base per i successivi
            // Nel caso di 30+30+20: la prima data non ha fromPrevious. Ma la seconda parte dalla prima.
            baseDate = computedDate
        }
      }

      // Inserimento batch in Supabase
      const { error } = await supabase.from('eventi_agenda').insert(eventsToInsert)

      if (error) throw error

      onSuccess()
      onClose()
      
      // Reset form
      setStartDate('')
      setSelectedFascicolo('')
      setSelectedTemplateId(LegalTemplates[0].id)
      setApplySospensione(true)
      
    } catch (error) {
      console.error(error)
      alert("Errore durante il calcolo e il salvataggio dei termini")
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const activeTemplate = LegalTemplates.find(t => t.id === selectedTemplateId)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass w-full max-w-xl bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl relative z-10">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                <Calculator className="w-5 h-5 text-indigo-500" />
                Calcolatore Termini Processuali
              </h2>
              <p className="text-sm text-slate-500 mt-1">L'IA calcolerà sabati, domeniche, festivi e sospensione feriale.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCalculateAndSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fascicolo *</label>
              <select required value={selectedFascicolo} onChange={e => setSelectedFascicolo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:border-indigo-500 transition-all outline-none">
                <option value="">-- Seleziona il fascicolo di riferimento --</option>
                {fascicoli.map(f => (
                  <option key={f.id} value={f.id}>{f.titolo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Modello Scadenze *</label>
              <select required value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:border-indigo-500 transition-all outline-none">
                {LegalTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {activeTemplate && (
                <p className="text-xs text-indigo-600 mt-1.5 font-medium flex items-center gap-1">
                   Genererà in agenda: {activeTemplate.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data di Decorrenza (es. Udienza) *</label>
              <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:border-indigo-500 transition-all outline-none" />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer group p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-colors">
                <div className="relative flex items-center justify-center w-5 h-5 border-2 border-indigo-300 rounded focus-within:border-indigo-500">
                  <input type="checkbox" checked={applySospensione} onChange={e => setApplySospensione(e.target.checked)} className="absolute opacity-0 cursor-pointer w-full h-full" />
                  {applySospensione && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"></div>}
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-900">Applica Sospensione Feriale</p>
                  <p className="text-xs text-indigo-700">Aggiunge 31 giorni se il termine cade tra il 1 e il 31 Agosto.</p>
                </div>
              </label>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-medium transition-all">
                Annulla
              </button>
              <button type="submit" disabled={saving || !startDate || !selectedFascicolo} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
                {saving ? 'Calcolando...' : 'Genera Scadenze'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
