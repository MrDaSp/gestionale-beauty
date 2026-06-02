'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: 'Impossibile aggiornare la password: ' + error.message }
  }

  return { success: true }
}
