'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getSettingsData() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Non autorizzato")

  // @ts-ignore
  const userId = session.user.id

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  const member = await prisma.workspaceMember.findFirst({
    where: { user_id: userId }
  })

  let settings = null
  if (member) {
    settings = await prisma.impostazioniSalone.findUnique({
      where: { workspace_id: member.workspace_id }
    })
  }

  return { user, settings, workspaceId: member?.workspace_id }
}

export async function updateSettings(data: {
  nome: string,
  cognome: string,
  workspaceId: string | null
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Non autorizzato")

  // @ts-ignore
  const userId = session.user.id

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: `${data.nome} ${data.cognome}`.trim(),
    }
  })

  // if (data.workspaceId) {
  //   We don't need to update modulo_parrucchieria/modulo_estetica anymore as they are not in schema
  // }

  return { success: true }
}
