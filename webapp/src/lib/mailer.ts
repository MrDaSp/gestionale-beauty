import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Benvenuto in Kallos - Verifica la tua email",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1 style="color: #ca8a04;">Benvenuto in Kallos!</h1>
        <p>Grazie per esserti registrato. Clicca sul bottone qui sotto per verificare il tuo account e iniziare a usare il gestionale per il tuo salone.</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #ca8a04; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Verifica Email</a>
        <p style="margin-top: 30px; font-size: 0.9em; color: #666;">Se non hai richiesto questa registrazione, ignora questa email.</p>
      </div>
    `
  })
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Kallos - Recupero Password",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1 style="color: #ca8a04;">Recupero Password</h1>
        <p>Hai richiesto il reset della tua password. Clicca sul bottone qui sotto per impostarne una nuova.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #ca8a04; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Resetta Password</a>
        <p style="margin-top: 30px; font-size: 0.9em; color: #666;">Questo link scadrà tra 24 ore. Se non hai richiesto il reset, ignora questa email.</p>
      </div>
    `
  })
}
