export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SettingsForm } from './settings-form'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id },
  })

  if (!profile) redirect('/onboarding/step-1')

  return <SettingsForm profile={profile} />
}
