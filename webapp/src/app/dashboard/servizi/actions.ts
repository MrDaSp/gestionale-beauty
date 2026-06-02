'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getServiziData() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Non autorizzato")

  // @ts-ignore
  const userId = session.user.id

  const member = await prisma.workspaceMember.findFirst({
    where: { user_id: userId }
  })

  if (!member) throw new Error("Workspace non trovato")

  const settings = await prisma.impostazioniSalone.findUnique({
    where: { workspace_id: member.workspace_id }
  })

  const servizi = await prisma.servizio.findMany({
    where: { workspace_id: member.workspace_id },
    orderBy: { categoria: 'asc' }
  })

  return { servizi, settings }
}

export async function addServizio(data: {
  nome_servizio: string,
  categoria: string,
  settore: string,
  durata_minuti: number,
  prezzo: number
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Non autorizzato")

  // @ts-ignore
  const userId = session.user.id

  const member = await prisma.workspaceMember.findFirst({
    where: { user_id: userId }
  })

  if (!member) throw new Error("Workspace non trovato")

  const servizio = await prisma.servizio.create({
    data: {
      workspace_id: member.workspace_id,
      nome_servizio: data.nome_servizio,
      categoria: data.categoria,
      settore: data.settore,
      durata_minuti: data.durata_minuti,
      prezzo: data.prezzo
    }
  })

  return servizio
}
