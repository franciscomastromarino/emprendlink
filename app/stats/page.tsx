export const dynamic = 'force-dynamic'

import { Container, Heading, Stack, Text } from '@chakra-ui/react'
import { getStats } from './actions'
import { StatsCharts } from './charts'

export default async function StatsPage() {
  const data = await getStats()

  return (
    <Container maxW="4xl" py="8" pb="24">
      <Stack gap="8">
        <Stack gap="1">
          <Heading size="2xl" color="brand.600">
            Estadísticas
          </Heading>
          <Text fontSize="sm" color="fg.muted">
            Panel de métricas de la comunidad EmprendLink
          </Text>
        </Stack>

        <StatsCharts data={data} />
      </Stack>
    </Container>
  )
}
