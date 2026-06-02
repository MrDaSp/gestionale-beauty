const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  'https://mjpqowxvywmmlfxrbsjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcHFvd3h2eXdtbWxmeHJic2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkzOTkwMywiZXhwIjoyMDk1NTE1OTAzfQ.FeBjRV1fwtZFvMb5UZ42CuB9fl-z82fygezrCD6EZKE'
);

async function test() {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: 'test_fake_user_' + Date.now() + '@example.com',
    password: 'password123',
    email_confirm: true,
  });
  console.log("Error:", error);
  console.log("Data:", data);
}

test();
