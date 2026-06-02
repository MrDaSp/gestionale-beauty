'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  const token = formData.get('token') as string
  
  if (!password || !token) {
    return { error: 'Dati mancanti.' }
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token }
  })

  if (!resetToken || resetToken.expires < new Date()) {
    return { error: 'Token non valido o scaduto. Richiedi un nuovo link.' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { email: resetToken.email },
    data: { password: hashedPassword }
  })

  await prisma.passwordResetToken.delete({
    where: { id: resetToken.id }
  })

  return { success: true }
}
