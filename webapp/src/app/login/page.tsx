'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Scissors, Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import { login } from './actions'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50">
      {/* Background blobs */}
      <div className="blob bg-emerald-600/30 w-96 h-96 rounded-full top-10 left-10" />
      <div className="blob bg-indigo-500/20 w-[30rem] h-[30rem] rounded-full bottom-0 right-10" style={{ animationDelay: '-5s' }} />

      <div className="w-full max-w-md p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Top highlight */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />

          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 mb-4 rounded-2xl overflow-hidden ring-2 ring-emerald-500/30 shadow-lg">
              <img src="/logo.jpg" alt="Kallos Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Kallos</h1>
            <p className="text-slate-500 mt-2 text-sm text-center">
              Accedi al tuo salone
            </p>
          </div>

          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email salone"
                  className="w-full bg-white/50 border border-slate-300 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  className="w-full bg-white/50 border border-slate-300 rounded-xl py-3 pl-12 pr-12 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
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
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl py-3 font-semibold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Accedi
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center space-y-2">
            <p className="text-sm text-slate-500">
              Non hai ancora un Salone?{' '}
              <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Crealo ora
              </Link>
            </p>
            <p className="text-xs text-slate-500">
              Per professionisti della bellezza
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
