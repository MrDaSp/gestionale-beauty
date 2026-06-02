import { Calendar as CalendarIcon, Users, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return null
  }

  // @ts-ignore
  const userId = session.user.id

  const member = await prisma.workspaceMember.findFirst({
    where: { user_id: userId }
  })

  let appuntamentiOggi = 0
  let totaleClienti = 0

  if (member) {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    appuntamentiOggi = await prisma.appuntamento.count({
      where: {
        workspace_id: member.workspace_id,
        data_ora_inizio: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    totaleClienti = await prisma.cliente.count({
      where: {
        workspace_id: member.workspace_id
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-8 border border-slate-200 relative overflow-hidden flex justify-between items-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-emerald-900">Benvenuto nel tuo Salone Digitale</h2>
          <p className="text-emerald-700 mt-2 max-w-lg">
            La piattaforma intelligente per gestire i tuoi clienti, appuntamenti e trattamenti con zero passaggi inutili.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/agenda" className="glass rounded-3xl p-6 border border-slate-200 hover:border-emerald-500/50 transition-all group block">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold text-slate-900">{appuntamentiOggi}</span>
          </div>
          <h3 className="font-semibold text-slate-900 text-lg">Appuntamenti Oggi</h3>
          <p className="text-sm text-slate-500 mt-1">Prenotazioni in programma</p>
        </Link>

        <Link href="/dashboard/clienti" className="glass rounded-3xl p-6 border border-slate-200 hover:border-emerald-500/50 transition-all group block relative">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold text-slate-900">{totaleClienti}</span>
          </div>
          <h3 className="font-semibold text-slate-900 text-lg">Totale Clienti</h3>
          <p className="text-sm text-slate-500 mt-1">Anagrafiche nel salone</p>
        </Link>

        <Link href="/dashboard/servizi" className="glass rounded-3xl p-6 border border-slate-200 hover:border-emerald-500/50 transition-all group block bg-gradient-to-br from-emerald-900/20 to-transparent">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <h4 className="font-semibold text-slate-900">Listino Servizi</h4>
          <p className="text-sm text-slate-500 mt-1">Gestisci i trattamenti offerti.</p>
        </Link>
      </div>
    </div>
  )
}
