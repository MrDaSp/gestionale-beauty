const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/);

const url = dbUrlMatch ? dbUrlMatch[1] : '';
const key = keyMatch ? keyMatch[1] : '';

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

async function test() {
  const { data: user, error } = await supabase.from('users').select('*').eq('email', 'dani3d.drone@gmail.com').single();
  console.log("User:", user);
  if (error) console.error("Error:", error);
  
  if (user) {
    const { data: member } = await supabase.from('workspace_members').select('*').eq('user_id', user.id);
    console.log("Workspace Member:", member);
  }

  const { data: docs } = await supabase.from('documenti').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Last documents inserted:", docs);
}

test();
