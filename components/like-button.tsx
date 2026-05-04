'use client'

import { Button } from '@chakra-ui/react'
import { useState } from 'react'
import { Zap } from 'lucide-react'
import { likeProfile } from '@/app/discover/actions'
import { trackEvent } from '@/lib/analytics'

export function LikeButton({
  targetId,
  variant = 'outline',
  size = 'sm',
}: {
  targetId: string
  variant?: 'outline' | 'solid'
  size?: 'sm' | 'md' | 'lg'
}) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<'liked' | 'match' | null>(null)

  const handleLike = async () => {
    if (loading || result) return
    setLoading(true)
    trackEvent('like_from_profile', { target_id: targetId })
    const res = await likeProfile(targetId)
    setResult(res.match ? 'match' : 'liked')
    setLoading(false)
  }

  if (result === 'match') {
    return (
      <Button colorPalette="green" size={size} borderRadius="full" disabled>
        Match!
      </Button>
    )
  }

  if (result === 'liked') {
    return (
      <Button variant={variant} size={size} borderRadius="full" disabled>
        Enviado
      </Button>
    )
  }

  return (
    <Button
      colorPalette="brand"
      size={size}
      borderRadius="full"
      onClick={handleLike}
      loading={loading}
      px="4"
    >
      <Zap size={14} fill="currentColor" />
      Conectar
    </Button>
  )
}
