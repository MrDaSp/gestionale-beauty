'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { resetPassword } from './actions'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await resetPassword(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50">
      {/* Background blobs */}
      <div className="blob bg-yellow-500/30 w-96 h-96 rounded-full top-10 left-10" />
      <div className="blob bg-orange-500/20 w-[30rem] h-[30rem] rounded-full bottom-0 right-10" style={{ animationDelay: '-5s' }} />

      <div className="w-full max-w-md p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Top highlight */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600" />

          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Kallos</h1>
            <p className="text-slate-500 text-sm text-center">
              Recupero Password
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
              <h3 className="text-lg font-semibold text-slate-900">Email Inviata!</h3>
              <p className="text-slate-500 text-sm">
                Controlla la tua casella di posta elettronica per il link di recupero.
              </p>
              <Link href="/login" className="inline-block mt-4 text-yellow-600 font-medium hover:text-yellow-700">
                Torna al Login
              </Link>
            </motion.div>
          ) : (
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-slate-600 mb-4 text-center">
                  Inserisci la tua email e ti invieremo un link per reimpostare la password in totale sicurezza.
                </p>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Email salone"
                    className="w-full bg-white/50 border border-slate-300 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
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
                  'Invia Link di Recupero'
                )}
              </button>
              
              <div className="text-center mt-4">
                <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Torna al Login
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
