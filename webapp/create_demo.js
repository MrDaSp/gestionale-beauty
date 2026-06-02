const fs = require('fs')
const envContent = fs.readFileSync('./.env.local', 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) env[match[1]] = match[2].trim()
})
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY']
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

async function createDemo() {
  const email = 'demo@dani-sys.it'
  const password = 'Password123!'
  
  const { data: authData } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true
  })
  
  if (!authData.user) return console.log("User already exists or error.")
  const userId = authData.user.id

  await supabaseAdmin.from('users').insert({
    id: userId, email, nome: 'Mario', cognome: 'Rossi'
  })

  const { data: ws } = await supabaseAdmin.from('workspaces').insert({
    nome: 'Salone Demo', tipo: 'salone'
  }).select('id').single()

  await supabaseAdmin.from('workspace_members').insert({
    user_id: userId, workspace_id: ws.id, ruolo: 'owner'
  })

  console.log("Demo account created!")
}
createDemo()
