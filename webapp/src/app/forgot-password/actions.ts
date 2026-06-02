'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string
  
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // Requires SMTP configuration on the server to actually send the email.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://kallos.dani-sys.it'}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: 'Impossibile inviare la mail di recupero. Riprova più tardi.' }
  }

  return { success: true }
}
