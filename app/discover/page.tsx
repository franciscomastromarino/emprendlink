import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SwipeCards } from './swipe-cards'

export default async function DiscoverPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id },
    select: { onboardingComplete: true, onboardingStep: true },
  })

  if (!profile || !profile.onboardingComplete) {
    const step = profile?.onboardingStep ?? 1
    redirect(`/onboarding/step-${step}`)
  }

  // Get IDs already liked
  const alreadyLiked = await prisma.like.findMany({
    where: { fromUser: session.user.id },
    select: { toUser: true },
  })
  const excludeIds = [session.user.id, ...alreadyLiked.map((l) => l.toUser)]

  const profiles = await prisma.profile.findMany({
    where: {
      community: 'emprending',
      visible: true,
      onboardingComplete: true,
      id: { notIn: excludeIds },
    },
    orderBy: { updatedAt: 'desc' },
    take: 20,
  })

  return (
    <Box>
      {/* Blue gradient top background */}
      <Box
        bg="linear-gradient(180deg, #EAF0FB 0%, #FFFFFF 100%)"
        pt="6"
        pb="24"
      >
        <Container maxW="lg">
          <Stack gap="1">
            <Heading size="xl">Descubrir</Heading>
            <Text fontSize="sm" color="fg.muted">
              Conectá con emprendedores de tu comunidad
            </Text>
          </Stack>
        </Container>
      </Box>

      {/* Card overlapping the blue area */}
      <Container maxW="lg" mt="-20" pb="6">
        <SwipeCards initialProfiles={profiles} />
      </Container>
    </Box>
  )
}
