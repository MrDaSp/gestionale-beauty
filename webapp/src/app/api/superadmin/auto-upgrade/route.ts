import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, plan, secret } = await request.json()
    if (secret !== "DANI_SYS_AUTO_UNLOCK_2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    
    if (!email || !plan) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find workspace
    const member = await prisma.workspaceMember.findFirst({
      where: { user_id: user.id }
    })
    
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

    await prisma.workspace.update({
      where: { id: member.workspace_id },
      data: { plan_name, max_clients }
    })

    return NextResponse.json({ success: true, plan: plan_name, max_clients })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
