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

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUser() {
  const email = 'dani3d.drone@gmail.com'
  
  const { data: users } = await supabase.auth.admin.listUsers()
  const targetUser = users?.users.find(u => u.email === email)
  
  if (targetUser) {
    const { data: members } = await supabase.from('workspace_members').select('*').eq('user_id', targetUser.id)
    const { data: ws } = await supabase.from('workspaces').select('*').eq('id', members[0].workspace_id).single()
    console.log("Workspace name:", ws.nome)
  }
}
checkUser()
