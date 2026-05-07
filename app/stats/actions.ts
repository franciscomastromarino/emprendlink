'use server'

import { prisma } from '@/lib/prisma'

export async function getStats() {
  const [
    totalUsers,
    totalProfiles,
    completedProfiles,
    totalLikes,
    totalConnections,
    allLikes,
    profiles,
    likesByDate,
    connectionsByDate,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.profile.count(),
    prisma.profile.count({
      where: { onboardingComplete: true },
    }),
    prisma.like.count(),
    prisma.connection.count(),
    prisma.like.findMany({
      select: { fromUser: true, toUser: true },
    }),
    prisma.profile.findMany({
      where: {
        community: 'emprending',
        onboardingComplete: true,
      },
      select: {
        role: true,
        industries: true,
        lookingFor: true,
        interests: true,
        teamSize: true,
        city: true,
        createdAt: true,
      },
    }),
    prisma.like.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.connection.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  // --- Matches (mutual likes) ---
  const likeSet = new Set(allLikes.map((l) => `${l.fromUser}:${l.toUser}`))
  let totalMatches = 0
  for (const like of allLikes) {
    if (likeSet.has(`${like.toUser}:${like.fromUser}`)) {
      totalMatches++
    }
  }
  totalMatches = totalMatches / 2 // each match counted twice

  // --- KPIs ---
  const onboardingRate = totalUsers > 0 ? Math.round((completedProfiles / totalUsers) * 100) : 0
  const matchRate = totalLikes > 0 ? Math.round((totalMatches / totalLikes) * 100) : 0

  // --- Distributions ---
  const roleCount: Record<string, number> = {}
  const industryCount: Record<string, number> = {}
  const lookingForCount: Record<string, number> = {}
  const interestCount: Record<string, number> = {}
  const teamSizeCount: Record<string, number> = {}
  const cityCount: Record<string, number> = {}

  for (const p of profiles) {
    roleCount[p.role] = (roleCount[p.role] || 0) + 1
    if (p.teamSize) teamSizeCount[p.teamSize] = (teamSizeCount[p.teamSize] || 0) + 1
    if (p.city) cityCount[p.city] = (cityCount[p.city] || 0) + 1
    for (const i of p.industries) industryCount[i] = (industryCount[i] || 0) + 1
    for (const l of p.lookingFor) lookingForCount[l] = (lookingForCount[l] || 0) + 1
    for (const i of p.interests) interestCount[i] = (interestCount[i] || 0) + 1
  }

  const toSorted = (obj: Record<string, number>) =>
    Object.entries(obj)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

  // --- Activity over time (group by week) ---
  const groupByWeek = (dates: { createdAt: Date }[]) => {
    const weeks: Record<string, number> = {}
    for (const { createdAt } of dates) {
      const d = new Date(createdAt)
      const startOfWeek = new Date(d)
      startOfWeek.setDate(d.getDate() - d.getDay())
      const key = startOfWeek.toISOString().slice(0, 10)
      weeks[key] = (weeks[key] || 0) + 1
    }
    return Object.entries(weeks)
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week))
  }

  const registrationsByWeek = groupByWeek(
    profiles.map((p) => ({ createdAt: p.createdAt }))
  )
  const likesByWeek = groupByWeek(likesByDate)
  const connectionsByWeek = groupByWeek(connectionsByDate)

  // --- Funnel ---
  const profilesWithLikes = new Set(allLikes.map((l) => l.fromUser)).size
  const profilesWithMatches = new Set(
    allLikes
      .filter((l) => likeSet.has(`${l.toUser}:${l.fromUser}`))
      .map((l) => l.fromUser)
  ).size
  const profilesWithConnections = await prisma.connection
    .findMany({ select: { fromUser: true }, distinct: ['fromUser'] })
    .then((r) => r.length)

  const funnel = [
    { step: 'Registros', value: totalUsers },
    { step: 'Onboarding completo', value: completedProfiles },
    { step: 'Dio al menos 1 like', value: profilesWithLikes },
    { step: 'Tiene al menos 1 match', value: profilesWithMatches },
    { step: 'Inició conexión WhatsApp', value: profilesWithConnections },
  ]

  return {
    kpis: {
      totalUsers,
      completedProfiles,
      onboardingRate,
      totalLikes,
      totalMatches,
      matchRate,
      totalConnections,
    },
    distributions: {
      roles: toSorted(roleCount),
      industries: toSorted(industryCount),
      lookingFor: toSorted(lookingForCount),
      interests: toSorted(interestCount),
      teamSizes: toSorted(teamSizeCount),
      cities: toSorted(cityCount),
    },
    activity: {
      registrations: registrationsByWeek,
      likes: likesByWeek,
      connections: connectionsByWeek,
    },
    funnel,
  }
}
