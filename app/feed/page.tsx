export const dynamic = 'force-dynamic'

import { Container, Heading, Stack, Text } from '@chakra-ui/react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { FeedFilters } from './feed-filters'
import { FeedList } from './feed-list'
import { Suspense } from 'react'

interface Props {
  searchParams: Promise<{
    lookingFor?: string
    industries?: string
    roles?: string
    search?: string
  }>
}

export default async function FeedPage({ searchParams }: Props) {
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

  const params = await searchParams
  const filters = {
    lookingFor: params.lookingFor?.split(',').filter(Boolean),
    industries: params.industries?.split(',').filter(Boolean),
    roles: params.roles?.split(',').filter(Boolean),
    search: params.search || undefined,
  }

  const profiles = await prisma.profile.findMany({
    where: {
      community: 'emprending',
      visible: true,
      onboardingComplete: true,
      id: { not: session.user.id },
      ...(filters.lookingFor?.length && {
        lookingFor: { hasSome: filters.lookingFor },
      }),
      ...(filters.industries?.length && {
        industries: { hasSome: filters.industries },
      }),
      ...(filters.roles?.length && {
        role: { in: filters.roles },
      }),
      ...(filters.search && {
        OR: [
          { fullName: { contains: filters.search, mode: 'insensitive' as const } },
          { startup: { contains: filters.search, mode: 'insensitive' as const } },
        ],
      }),
    },
    take: 30,
    orderBy: { updatedAt: 'desc' },
  })

  const [myLikes, likesFromOthers] = await Promise.all([
    prisma.like.findMany({
      where: { fromUser: session.user.id },
      select: { toUser: true },
    }),
    prisma.like.findMany({
      where: { toUser: session.user.id },
      select: { fromUser: true },
    }),
  ])
  const likedIds = new Set(myLikes.map((l) => l.toUser))
  const likedByIds = new Set(likesFromOthers.map((l) => l.fromUser))
  const matchedIds = new Set([...likedIds].filter((id) => likedByIds.has(id)))

  return (
    <Container maxW="lg" py="6">
      <Stack gap="5">
        {/* Header */}
        <Stack gap="1">
          <Heading size="xl">Explorar</Heading>
          <Text fontSize="sm" color="fg.muted">
            Conectá con emprendedores de tu comunidad
          </Text>
        </Stack>

        {/* Search + filters */}
        <Suspense>
          <FeedFilters />
        </Suspense>

        {/* Members list */}
        <FeedList initialProfiles={profiles} filters={filters} likedIds={[...likedIds]} matchedIds={[...matchedIds]} />
      </Stack>
    </Container>
  )
}
