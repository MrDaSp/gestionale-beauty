import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token: string }
}) {
  const token = searchParams.token

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="glass p-8 rounded-2xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Token Mancante</h1>
          <p className="text-slate-600">Il link non è valido o è incompleto.</p>
        </div>
      </div>
    )
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token }
  })

  if (!verificationToken || verificationToken.expires < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="glass p-8 rounded-2xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Token Scaduto o Non Valido</h1>
          <p className="text-slate-600">Il link di verifica non è più valido. Prova a registrarti nuovamente.</p>
        </div>
      </div>
    )
  }

  // Update user
  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() }
  })

  // Delete token
  await prisma.verificationToken.delete({
    where: { token }
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="glass p-8 rounded-2xl max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Email Verificata!</h1>
        <p className="text-slate-600 mb-6">La tua email è stata verificata con successo. Ora puoi accedere al tuo salone.</p>
        <a href="/login" className="btn-primary block w-full">Vai al Login</a>
      </div>
    </div>
  )
}
