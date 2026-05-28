'use server'

import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Move client creation inside the action to guarantee fresh env variables read at runtime
export async function register(formData: FormData) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    
    if (!supabaseUrl || !supabaseKey) {
      return { error: 'Configurazione server mancante (URL o Key).' }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const nome = formData.get('nome') as string
    const cognome = formData.get('cognome') as string
    const type = formData.get('type') as string // 'singolo' or 'salone'
    const studioName = formData.get('studio_name') as string

    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm for now
    })

    if (authError || !authData?.user) {
      console.error("Auth error:", authError);
      return { error: authError?.message || 'Errore durante la registrazione' }
    }

  const userId = authData.user.id

  // 2. Insert into public.users
  const { error: userError } = await supabaseAdmin.from('users').insert({
    id: userId,
    email,
    nome,
    cognome,
  })

  if (userError) return { error: 'Errore creazione profilo utente: ' + userError.message }

  // 3. Create the Workspace
  const finalStudioName = type === 'salone' && studioName ? studioName : `Salone ${cognome}`
  
  const { data: workspaceData, error: workspaceError } = await supabaseAdmin.from('workspaces').insert({
    nome: finalStudioName,
    tipo: type,
  }).select('id').single()

  if (workspaceError || !workspaceData) {
    return { error: 'Errore creazione workspace: ' + workspaceError?.message }
  }

  // 3.5 Create the default settings for the salon
  const { error: settingsError } = await supabaseAdmin.from('impostazioni_salone').insert({
    workspace_id: workspaceData.id,
    modulo_parrucchieria: true,
    modulo_estetica: false,
  })

  if (settingsError) {
    return { error: 'Errore creazione impostazioni salone: ' + settingsError.message }
  }

  // 4. Link User to Workspace as Owner
  const { error: memberError } = await supabaseAdmin.from('workspace_members').insert({
    user_id: userId,
    workspace_id: workspaceData.id,
    ruolo: 'owner',
  })

  if (memberError) return { error: 'Errore assegnazione permessi: ' + memberError.message }

  // Since we created the user via Admin API, we should let the user log in directly on the frontend
  // Or we can just redirect them to login page to sign in
  redirect('/login?registered=true')
  } catch (e: any) {
    console.error("Register catch error:", e);
    return { error: 'Si è verificato un errore di rete o server. Riprova.' }
  }
}
