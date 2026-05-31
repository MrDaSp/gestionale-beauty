import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, plan, secret } = await request.json()
    if (secret !== "DANI_SYS_AUTO_UNLOCK_2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    
    if (!email || !plan) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find user
    const { data: user } = await supabaseAdmin.from('users').select('id').eq('email', email).single()
    if (!user) {
      return NextResponse.json({ error: "User not found in public.users" }, { status: 404 })
    }

    // Find workspace
    const { data: member } = await supabaseAdmin.from('workspace_members').select('workspace_id').eq('user_id', user.id).single()
    if (!member) {
      return NextResponse.json({ error: "Workspace member not found" }, { status: 404 })
    }

    // Determine limits
    let plan_name = 'Free'
    let max_clients = 3
    const p = plan.toLowerCase()
    
    if (p.includes('standard')) {
      plan_name = 'Standard'
      max_clients = 15
    } else if (p.includes('pro')) {
      plan_name = 'Pro'
      max_clients = 30
    } else if (p.includes('unlimited')) {
      plan_name = 'Unlimited'
      max_clients = 9999
    }

    const { error } = await supabaseAdmin
      .from('workspaces')
      .update({ plan_name, max_clients })
      .eq('id', member.workspace_id)

    if (error) throw error

    return NextResponse.json({ success: true, plan: plan_name, max_clients })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
