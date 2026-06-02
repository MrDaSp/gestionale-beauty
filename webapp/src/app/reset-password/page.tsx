'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { updatePassword } from './actions'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const password = formData.get('password') as string
    const confirm = formData.get('confirm_password') as string
    
    if (password !== confirm) {
      setError('Le password non coincidono.')
      setLoading(false)
      return
    }

    const result = await updatePassword(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50">
      <div className="blob bg-yellow-500/30 w-96 h-96 rounded-full top-10 left-10" />
      <div className="blob bg-orange-500/20 w-[30rem] h-[30rem] rounded-full bottom-0 right-10" style={{ animationDelay: '-5s' }} />

      <div className="w-full max-w-md p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600" />

          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Kallos</h1>
            <p className="text-slate-500 text-sm text-center">
              Imposta nuova password
            </p>
          </div>

          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Password Aggiornata!</h3>
              <p className="text-slate-500 text-sm">
                Stai per essere reindirizzato alla dashboard...
              </p>
            </motion.div>
          ) : (
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Nuova Password"
                    className="w-full bg-white/50 border border-slate-300 rounded-xl py-3 pl-12 pr-12 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    name="confirm_password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Conferma Password"
                    className="w-full bg-white/50 border border-slate-300 rounded-xl py-3 pl-12 pr-12 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white rounded-xl py-3 font-semibold shadow-lg shadow-yellow-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Aggiorna Password'
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
