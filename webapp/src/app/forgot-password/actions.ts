'use server'

import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/mailer'
import crypto from 'crypto'

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string
  
  if (!email) {
    return { error: 'Inserisci un indirizzo email' }
  }

  const user = await prisma.user.findUnique({
    where: { email }
  })

  // We don't want to expose if a user exists or not, so we just return success
  if (!user) {
    return { success: true }
  }

  const token = crypto.randomBytes(32).toString('hex')

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
  })

  try {
    await sendPasswordResetEmail(email, token)
  } catch (e) {
    console.error("Errore invio email reset:", e)
    return { error: 'Impossibile inviare la mail di recupero. Riprova più tardi.' }
  }

  return { success: true }
}
