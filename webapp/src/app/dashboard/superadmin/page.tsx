'use client'

import { useEffect, useState } from 'react'
import { Shield, Save, X, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function SuperAdminPage() {
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState({ plan_name: '', max_clients: 0 })
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || session.user.email !== process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL) {
        router.push('/dashboard')
        return
      }
      fetchWorkspaces()
    }
    checkAuth()
  }, [])

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch('/api/superadmin')
      if (!res.ok) throw new Error('Errore caricamento')
      const data = await res.json()
      setWorkspaces(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (ws: any) => {
    setEditingId(ws.id)
    setEditData({ plan_name: ws.plan_name, max_clients: ws.max_clients || 3 })
  }

  const handleSave = async (id: string) => {
    try {
      const res = await fetch('/api/superadmin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editData })
      })
      if (!res.ok) throw new Error('Errore nel salvataggio')
      
      setMessage('✅ Piano aggiornato con successo!')
      setEditingId(null)
      fetchWorkspaces()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ Errore durante il salvataggio')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Sei sicuro di voler eliminare definitivamente il workspace "${name}"? Questa operazione è irreversibile.`)) return
    try {
      const res = await fetch(`/api/superadmin?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Errore durante l\'eliminazione')
      setMessage('✅ Workspace eliminato con successo!')
      fetchWorkspaces()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ Errore durante l\'eliminazione')
    }
  }

  if (loading) return <div className="p-8">Caricamento Super Admin...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-pink-200 pb-4">
        <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center ring-1 ring-pink-500/30">
          <Shield className="w-5 h-5 text-pink-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Super Admin Panel</h1>
          <p className="text-slate-500">Gestione totale abbonamenti Kallos</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border ${message.includes('✅') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">ID Workspace</th>
              <th className="p-4 font-semibold text-slate-600">Nome</th>
              <th className="p-4 font-semibold text-slate-600">Piano Attuale</th>
              <th className="p-4 font-semibold text-slate-600">Max Clienti</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workspaces.map(ws => (
              <tr key={ws.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-sm text-slate-500 font-mono">{ws.id.substring(0,8)}...</td>
                <td className="p-4 font-medium">{ws.nome}</td>
                
                {editingId === ws.id ? (
                  <>
                    <td className="p-4">
                      <select 
                        value={editData.plan_name}
                        onChange={e => {
                          const val = e.target.value
                          let clients = 3
                          if(val === 'Standard') clients = 15
                          if(val === 'Pro') clients = 30
                          if(val === 'Unlimited') clients = 999999
                          setEditData({ plan_name: val, max_clients: clients })
                        }}
                        className="p-2 rounded-lg border border-slate-300 w-full"
                      >
                        <option value="Gratis">Gratis</option>
                        <option value="Standard">Standard</option>
                        <option value="Pro">Pro</option>
                        <option value="Unlimited">Unlimited</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        value={editData.max_clients}
                        onChange={e => setEditData({...editData, max_clients: parseInt(e.target.value)})}
                        className="p-2 rounded-lg border border-slate-300 w-24"
                      />
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleSave(ws.id)} className="p-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ws.plan_name === 'Unlimited' ? 'bg-purple-100 text-purple-700' :
                        ws.plan_name === 'Pro' ? 'bg-pink-100 text-pink-700' :
                        ws.plan_name === 'Standard' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {ws.plan_name || 'Gratis'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {ws.max_clients === 999999 ? '∞' : (ws.max_clients || 3)}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleEdit(ws)} className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(ws.id, ws.nome)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {workspaces.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">Nessun workspace trovato</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
