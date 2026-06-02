'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/mailer'

export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nome = formData.get('nome') as string
  const cognome = formData.get('cognome') as string
  const type = formData.get('type') as string // 'singolo' or 'salone'
  const studioName = formData.get('studio_name') as string

  if (!email || !password || !nome) {
    return { error: 'Compila tutti i campi obbligatori' }
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return { error: 'Esiste già un account con questa email' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  // Start a transaction to create User, Workspace, Member, etc.
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${nome} ${cognome}`.trim(),
      }
    })

    const finalStudioName = type === 'salone' && studioName ? studioName : `Salone ${cognome}`

    const workspace = await prisma.workspace.create({
      data: {
        nome: finalStudioName,
      }
    })

    await prisma.workspaceMember.create({
      data: {
        user_id: user.id,
        workspace_id: workspace.id,
        ruolo: 'owner'
      }
    })

    await prisma.impostazioniSalone.create({
      data: {
        workspace_id: workspace.id,
        orario_apertura: "09:00",
        orario_chiusura: "19:00"
      }
    })

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex')
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    })

    // Send email
    try {
      await sendVerificationEmail(email, token)
    } catch (e) {
      console.error("Errore invio email:", e)
      // Continue anyway, but might want to handle it better in production
    }

  } catch (error: any) {
    console.error("Errore durante la registrazione:", error)
    return { error: 'Errore interno del server durante la registrazione' }
  }

  redirect('/login?registered=true')
}
