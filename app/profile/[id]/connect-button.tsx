'use client'

import { Button } from '@chakra-ui/react'
import { useState } from 'react'
import { connectWithProfile } from './actions'
import { trackEvent } from '@/lib/analytics'

export function ConnectButton({ targetId }: { targetId: string }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      trackEvent('whatsapp_connect_clicked', { target_id: targetId })
      const link = await connectWithProfile(targetId)
      // Use location.href instead of window.open to avoid popup blockers
      // (window.open after an await is not considered a user gesture)
      window.location.href = link
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      colorPalette="green"
      size="lg"
      w="full"
      borderRadius="full"
      onClick={handleClick}
      loading={loading}
    >
      Conectar por WhatsApp
    </Button>
  )
}
