'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Inbox, Upload, FileText, Smartphone, Mail, Globe, Search, Loader2, X, FolderOpen, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function InboxPage() {
  const supabase = createClient()
  const [documenti, setDocumenti] = useState<any[]>([])
  const [fascicoli, setFascicoli] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Form State per Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFascicolo, setSelectedFascicolo] = useState('')

  // Form State per Smistamento
  const [isSmistaModalOpen, setIsSmistaModalOpen] = useState(false)
  const [smistaDocId, setSmistaDocId] = useState<string | null>(null)
  const [smistaFascicolo, setSmistaFascicolo] = useState('')
  const [smistando, setSmistando] = useState(false)

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: member } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', session.user.id).single()
      if (member) {
        setWorkspaceId(member.workspace_id)
        
        // Fetch fascicoli for the dropdown
        const { data: fascicoliData } = await supabase.from('fascicoli').select('id, titolo').eq('workspace_id', member.workspace_id).eq('stato', 'aperto').order('titolo')
        if (fascicoliData) setFascicoli(fascicoliData)

        // Fetch "orfani" (documenti in Inbox senza fascicolo)
        const { data: docs } = await supabase.from('documenti').select('*').eq('workspace_id', member.workspace_id).is('fascicolo_id', null).order('created_at', { ascending: false })
        if (docs) setDocumenti(docs)
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  const getSourceIcon = (source: string) => {
    return <Globe className="w-3 h-3" />
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile || !workspaceId || !selectedFascicolo) return
    
    setUploading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      // 1. Upload fisico su Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${workspaceId}/${fileName}`
      
      const { error: uploadError } = await supabase.storage.from('documenti').upload(filePath, selectedFile)
      if (uploadError) throw uploadError

      // 2. Registrazione in tabella documenti (assegnato DIRETTAMENTE al fascicolo)
      const { error: dbError } = await supabase.from('documenti').insert({
        workspace_id: workspaceId,
        fascicolo_id: selectedFascicolo,
        caricato_da: session?.user.id,
        nome_file: selectedFile.name,
        tipo_documento: selectedFile.type,
        storage_path: filePath,
        stato: 'archiviato'
      })
      if (dbError) throw dbError

      // Upload completato con successo (non lo aggiungiamo alla lista dell'inbox perché è già smistato!)
      setIsUploadModalOpen(false)
      setSelectedFile(null)
      setSelectedFascicolo('')
      alert("Foto caricata e salvata correttamente nella scheda!")

    } catch (error) {
      console.error(error)
      alert("Errore durante il caricamento del file.")
    } finally {
      setUploading(false)
    }
  }

  const openSmistaModal = (docId: string) => {
    setSmistaDocId(docId)
    setSmistaFascicolo('')
    setIsSmistaModalOpen(true)
  }

  async function handleSmista(e: React.FormEvent) {
    e.preventDefault()
    if (!smistaDocId || !smistaFascicolo) return
    
    setSmistando(true)
    try {
      const { error } = await supabase
        .from('documenti')
        .update({ fascicolo_id: smistaFascicolo, stato: 'archiviato' })
        .eq('id', smistaDocId)
        
      if (error) throw error
      
      setDocumenti(prev => prev.filter(d => d.id !== smistaDocId))
      setIsSmistaModalOpen(false)
      setSmistaDocId(null)
      alert("Documento smistato con successo!")
    } catch (error) {
      console.error(error)
      alert("Errore durante lo smistamento.")
    } finally {
      setSmistando(false)
    }
  }

  async function handleOpenFile(storagePath: string) {
    try {
      const { data, error } = await supabase.storage.from('documenti').createSignedUrl(storagePath, 60)
      if (error) throw error
      if (data) {
        window.open(data.signedUrl, '_blank')
      }
    } catch (error) {
      console.error(error)
      alert("Impossibile aprire il file. Controlla i permessi.")
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex flex-wrap items-center gap-3">
            <Inbox className="w-8 h-8 text-emerald-500" />
            Galleria Foto
            {documenti.length > 0 && (
              <span className="bg-emerald-600 text-white text-sm font-bold px-3 py-1 rounded-full">{documenti.length}</span>
            )}
          </h1>
          <p className="text-slate-500 mt-2">Le foto orfane in attesa di essere organizzate.</p>
        </div>
        <button onClick={() => setIsUploadModalOpen(true)} className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Carica Foto
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : documenti.length === 0 ? (
        <div className="glass rounded-3xl p-12 border border-slate-200 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-100/50 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-medium text-slate-700">La tua Galleria è ordinata!</h3>
          <p className="text-slate-500 mt-2 mb-6 max-w-md">Non ci sono foto in attesa di smistamento. Tutte le foto sono ordinate nelle rispettive schede trattamento.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-white/50 flex items-center">
            <Search className="w-5 h-5 text-slate-500 mr-3" />
            <input type="text" placeholder="Cerca tra le foto orfane..." className="bg-transparent border-none outline-none text-slate-900 w-full placeholder:text-slate-500" />
          </div>
          <div className="divide-y divide-slate-800/50">
            {documenti.map((doc) => (
              <motion.div key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 hover:bg-slate-100/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-300">
                    <FileText className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{doc.nome_file}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {getSourceIcon('')} Web Upload
                      </span>
                      <span>• {new Date(doc.created_at).toLocaleDateString('it-IT')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex w-full sm:w-auto justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenFile(doc.storage_path)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors">
                    Anteprima
                  </button>
                  <button onClick={() => openSmistaModal(doc.id)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                    Smista
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Modale Upload "Zero Doppio Passaggio" */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsUploadModalOpen(false)} className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass w-full max-w-lg rounded-3xl p-6 border border-slate-200 shadow-2xl relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-500" />
                  Caricamento Rapido
                </h2>
                <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm flex gap-3 mb-6">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p><strong>Zero Doppio Passaggio:</strong> Seleziona subito il trattamento di destinazione. La foto salterà la Galleria e andrà direttamente al posto giusto.</p>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Seleziona il File *</label>
                  <input required type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">In quale scheda trattamento vuoi metterla? *</label>
                  {fascicoli.length === 0 ? (
                    <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-3 rounded-xl text-sm">
                      Non hai ancora creato nessun trattamento attivo.
                    </div>
                  ) : (
                    <select required value={selectedFascicolo} onChange={e => setSelectedFascicolo(e.target.value)} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                      <option value="">-- Seleziona Trattamento --</option>
                      {fascicoli.map(f => (
                        <option key={f.id} value={f.id}>{f.titolo}</option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div className="pt-6 flex gap-3">
                  <button type="button" onClick={() => setIsUploadModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-medium transition-all">
                    Annulla
                  </button>
                  <button type="submit" disabled={uploading || !selectedFile || !selectedFascicolo} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FolderOpen className="w-5 h-5" />}
                    {uploading ? 'Caricamento in corso...' : 'Salva nella Scheda'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modale Smista Documento */}
      <AnimatePresence>
        {isSmistaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSmistaModalOpen(false)} className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-2xl relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-emerald-500" />
                  Smista Documento
                </h2>
                <button onClick={() => setIsSmistaModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSmista} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Seleziona Trattamento di destinazione *</label>
                  {fascicoli.length === 0 ? (
                    <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-3 rounded-xl text-sm">
                      Non hai ancora creato nessun trattamento attivo.
                    </div>
                  ) : (
                    <select required value={smistaFascicolo} onChange={e => setSmistaFascicolo(e.target.value)} className="w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                      <option value="">-- Seleziona Trattamento --</option>
                      {fascicoli.map(f => (
                        <option key={f.id} value={f.id}>{f.titolo}</option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div className="pt-6 flex gap-3">
                  <button type="button" onClick={() => setIsSmistaModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-medium transition-all">
                    Annulla
                  </button>
                  <button type="submit" disabled={smistando || !smistaFascicolo} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {smistando ? <Loader2 className="w-5 h-5 animate-spin" /> : <FolderOpen className="w-5 h-5" />}
                    {smistando ? 'Smistamento...' : 'Conferma'}
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
