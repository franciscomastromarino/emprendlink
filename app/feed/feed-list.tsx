'use client'

import { Stack, Text } from '@chakra-ui/react'
import { useEffect, useRef, useState, useCallback } from 'react'
import type { Profile } from '@prisma/client'
import { ProfileCard } from './profile-card'
import { getFeed } from './actions'

export function FeedList({
  initialProfiles,
  filters,
}: {
  initialProfiles: Profile[]
  filters: {
    lookingFor?: string[]
    industries?: string[]
    roles?: string[]
    search?: string
  }
}) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialProfiles.length === 30)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setProfiles(initialProfiles)
    setPage(1)
    setHasMore(initialProfiles.length === 30)
  }, [initialProfiles])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const next = await getFeed({ ...filters, page })
    if (next.length < 30) setHasMore(false)
    setProfiles((prev) => [...prev, ...next])
    setPage((p) => p + 1)
    setLoading(false)
  }, [loading, hasMore, filters, page])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  if (profiles.length === 0) {
    return (
      <Text color="fg.muted" textAlign="center" py="10">
        No se encontraron miembros con estos filtros.
      </Text>
    )
  }

  return (
    <Stack gap="0" flex="1">
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
      {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
      {loading && (
        <Text textAlign="center" color="fg.muted">
          Cargando...
        </Text>
      )}
    </Stack>
  )
}
