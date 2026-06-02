import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.email !== process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const workspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(workspaces)
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.email !== process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { id, plan_name, max_clients } = await request.json()

  if (!id || !plan_name) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 })
  }

  try {
    const updated = await prisma.workspace.update({
      where: { id },
      data: { plan_name, max_clients }
    })
    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.email !== process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing workspace id' }, { status: 400 })
  }

  try {
    await prisma.workspace.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
