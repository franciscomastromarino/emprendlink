export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id },
    select: { onboardingStep: true },
  })

  const step = profile?.onboardingStep ?? 1
  redirect(`/onboarding/step-${step}`)
}
