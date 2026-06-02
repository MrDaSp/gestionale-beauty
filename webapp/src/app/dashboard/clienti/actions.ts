'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getClienti() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  // @ts-ignore
  const userId = session.user.id

  const member = await prisma.workspaceMember.findFirst({
    where: { user_id: userId }
  })

  if (!member) return []

  const clienti = await prisma.cliente.findMany({
    where: { workspace_id: member.workspace_id },
    orderBy: { createdAt: 'desc' }
  })

  return clienti
}

export async function addCliente(data: {
  nome: string,
  cognome: string,
  email?: string,
  telefono?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Non autorizzato")

  // @ts-ignore
  const userId = session.user.id

  const member = await prisma.workspaceMember.findFirst({
    where: { user_id: userId }
  })

  if (!member) throw new Error("Workspace non trovato")

  const cliente = await prisma.cliente.create({
    data: {
      workspace_id: member.workspace_id,
      nome: data.nome,
      cognome: data.cognome,
      email: data.email,
      telefono: data.telefono,
    }
  })

  return cliente
}
