'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getAgendaData() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Non autorizzato")

  // @ts-ignore
  const userId = session.user.id

  const member = await prisma.workspaceMember.findFirst({
    where: { user_id: userId }
  })

  if (!member) throw new Error("Workspace non trovato")

  const appuntamenti = await prisma.appuntamento.findMany({
    where: { workspace_id: member.workspace_id },
    include: {
      cliente: { select: { nome: true, cognome: true, telefono: true } },
      servizio: { select: { nome_servizio: true, categoria: true, settore: true, prezzo: true, durata_minuti: true } },
      operatore: { select: { name: true } }
    },
    orderBy: { data_ora_inizio: 'asc' }
  })

  const clienti = await prisma.cliente.findMany({
    where: { workspace_id: member.workspace_id },
    select: { id: true, nome: true, cognome: true },
    orderBy: { nome: 'asc' }
  })

  const servizi = await prisma.servizio.findMany({
    where: { workspace_id: member.workspace_id },
    orderBy: { nome_servizio: 'asc' }
  })

  const staffMembers = await prisma.workspaceMember.findMany({
    where: { workspace_id: member.workspace_id },
    include: {
      user: { select: { id: true, name: true } }
    }
  })

  const operatori = staffMembers.map(m => m.user)

  return { appuntamenti, clienti, servizi, operatori }
}

export async function addAppuntamento(data: {
  cliente_id: string,
  servizio_id: string,
  operatore_id?: string | null,
  data_ora_inizio: Date,
  durata_minuti: number,
  prezzo_finale: number
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Non autorizzato")

  // @ts-ignore
  const userId = session.user.id

  const member = await prisma.workspaceMember.findFirst({
    where: { user_id: userId }
  })

  if (!member) throw new Error("Workspace non trovato")

  const data_ora_fine = new Date(data.data_ora_inizio.getTime() + data.durata_minuti * 60000)

  const result = await prisma.appuntamento.create({
    data: {
      workspace_id: member.workspace_id,
      cliente_id: data.cliente_id,
      servizio_id: data.servizio_id,
      operatore_id: data.operatore_id,
      data_ora_inizio: data.data_ora_inizio,
      data_ora_fine,
      stato: 'prenotato',
      prezzo_finale: data.prezzo_finale
    }
  })

  return result
}

export async function updateAppuntamentoStatus(id: string, stato: string) {
  return await prisma.appuntamento.update({
    where: { id },
    data: { stato }
  })
}
