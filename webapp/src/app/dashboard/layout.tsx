import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardClientLayout } from "@/components/dashboard-client-layout"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  // @ts-ignore
  const userId = session.user.id

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  const member = await prisma.workspaceMember.findFirst({
    where: { user_id: userId },
    include: { workspace: true }
  })

  return (
    <DashboardClientLayout user={user} workspace={member?.workspace}>
      {children}
    </DashboardClientLayout>
  )
}
