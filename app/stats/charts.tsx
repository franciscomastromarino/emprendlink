'use client'

import {
  Box,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'
import {
  Users,
  UserCheck,
  Heart,
  Handshake,
  MessageCircle,
  TrendingUp,
  Percent,
} from 'lucide-react'
import type { ReactNode } from 'react'

// --- Types ---
type KV = { name: string; value: number }
type WeekCount = { week: string; count: number }
type FunnelStep = { step: string; value: number }

interface StatsData {
  kpis: {
    totalUsers: number
    completedProfiles: number
    onboardingRate: number
    totalLikes: number
    totalMatches: number
    matchRate: number
    totalConnections: number
  }
  distributions: {
    roles: KV[]
    industries: KV[]
    lookingFor: KV[]
    interests: KV[]
    teamSizes: KV[]
    cities: KV[]
  }
  activity: {
    registrations: WeekCount[]
    likes: WeekCount[]
    connections: WeekCount[]
  }
  funnel: FunnelStep[]
}

const FUNNEL_COLORS = ['#2E5EA6', '#3B7DDD', '#5A9AE8', '#F5A623', '#22c55e']

const BUBBLE_COLORS = ['#2E5EA6', '#3B7DDD', '#5A9AE8', '#8DB8F2', '#F5A623', '#E8932F', '#22c55e', '#4ade80']

// --- KPI Card ---
function KpiCard({ label, value, icon, sub }: { label: string; value: string | number; icon: ReactNode; sub?: string }) {
  return (
    <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
      <HStack gap="3" mb="2">
        <Box color="brand.500">{icon}</Box>
        <Text fontSize="xs" fontWeight="600" color="fg.muted" textTransform="uppercase" letterSpacing="wide">
          {label}
        </Text>
      </HStack>
      <Text fontSize="3xl" fontWeight="700" color="brand.600" lineHeight="1">
        {value}
      </Text>
      {sub && (
        <Text fontSize="xs" color="fg.subtle" mt="1">{sub}</Text>
      )}
    </Box>
  )
}

// --- Section wrapper ---
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap="4">
      <Heading size="md" color="brand.600">{title}</Heading>
      {children}
    </Stack>
  )
}

// --- Horizontal bar chart ---
function HBar({ data, color = '#2E5EA6' }: { data: KV[]; color?: string }) {
  if (data.length === 0) return <Text fontSize="sm" color="fg.subtle">Sin datos</Text>
  return (
    <ResponsiveContainer width="100%" height={data.length * 36 + 20}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: '#666' }} />
        <Tooltip
          contentStyle={{ borderRadius: 8, fontSize: 13 }}
          formatter={(v) => [v, 'Total']}
        />
        <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// --- City Bubble Map ---
function CityMap({ cities }: { cities: KV[] }) {
  const maxVal = Math.max(...cities.map((c) => c.value), 1)
  const total = cities.reduce((sum, c) => sum + c.value, 0)

  return (
    <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
      {/* Bubble visualization */}
      <Box display="flex" flexWrap="wrap" justifyContent="center" gap="4" mb="5">
        {cities.map((city, i) => {
          const size = 48 + (city.value / maxVal) * 72
          const color = BUBBLE_COLORS[i % BUBBLE_COLORS.length]
          const pct = total > 0 ? Math.round((city.value / total) * 100) : 0
          return (
            <Stack key={city.name} align="center" gap="1.5">
              <Box position="relative">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                  <circle
                    cx={size / 2} cy={size / 2} r={size / 2 - 2}
                    fill={color} fillOpacity={0.15}
                    stroke={color} strokeWidth={2}
                  />
                  <circle
                    cx={size / 2} cy={size / 2} r={size / 2 - 2}
                    fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.3}
                  >
                    <animate attributeName="r" from={String(size / 2 - 2)} to={String(size / 2 + 4)} dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.3" to="0" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <text
                    x={size / 2} y={size / 2}
                    textAnchor="middle" dominantBaseline="central"
                    style={{ fontSize: size > 80 ? 22 : 16, fontWeight: 700, fill: color }}
                  >
                    {city.value}
                  </text>
                </svg>
              </Box>
              <Text fontSize="xs" fontWeight="600" color="fg.DEFAULT" textAlign="center" lineHeight="1.2">
                {city.name}
              </Text>
              <Text fontSize="2xs" color="fg.subtle">{pct}%</Text>
            </Stack>
          )
        })}
      </Box>

      {/* Ranked list below */}
      <Stack gap="2">
        {cities.map((city, i) => {
          const pct = total > 0 ? Math.round((city.value / total) * 100) : 0
          const color = BUBBLE_COLORS[i % BUBBLE_COLORS.length]
          return (
            <HStack key={city.name} gap="3">
              <Box w="3" h="3" borderRadius="full" bg={color} flexShrink={0} />
              <Text fontSize="sm" flex="1">{city.name}</Text>
              <Text fontSize="sm" fontWeight="600" color="fg.muted">{city.value}</Text>
              <Box w="80px">
                <Box bg="surface.elevated" borderRadius="full" h="2" overflow="hidden">
                  <Box bg={color} h="full" borderRadius="full" style={{ width: `${(city.value / maxVal) * 100}%` }} />
                </Box>
              </Box>
              <Text fontSize="xs" color="fg.subtle" w="35px" textAlign="right">{pct}%</Text>
            </HStack>
          )
        })}
      </Stack>
    </Box>
  )
}

// --- Main component ---
export function StatsCharts({ data }: { data: StatsData }) {
  const { kpis, distributions, activity, funnel } = data

  return (
    <Stack gap="8">
      {/* KPIs */}
      <Section title="Resumen general">
        <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
          <KpiCard label="Usuarios" value={kpis.totalUsers} icon={<Users size={18} />} />
          <KpiCard
            label="Onboarding"
            value={kpis.completedProfiles}
            icon={<UserCheck size={18} />}
            sub={`${kpis.onboardingRate}% completaron`}
          />
          <KpiCard label="Likes" value={kpis.totalLikes} icon={<Heart size={18} />} />
          <KpiCard
            label="Matches"
            value={kpis.totalMatches}
            icon={<Handshake size={18} />}
            sub={`${kpis.matchRate}% tasa de match`}
          />
          <KpiCard label="Conexiones WhatsApp" value={kpis.totalConnections} icon={<MessageCircle size={18} />} />
          <KpiCard label="Tasa onboarding" value={`${kpis.onboardingRate}%`} icon={<Percent size={18} />} />
          <KpiCard label="Tasa de match" value={`${kpis.matchRate}%`} icon={<TrendingUp size={18} />} />
        </SimpleGrid>
      </Section>

      {/* Funnel */}
      <Section title="Embudo de conversión">
        <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
          <Stack gap="3">
            {funnel.map((step, i) => {
              const pct = funnel[0].value > 0 ? Math.round((step.value / funnel[0].value) * 100) : 0
              return (
                <Box key={step.step}>
                  <HStack justify="space-between" mb="1">
                    <Text fontSize="sm" fontWeight="500">{step.step}</Text>
                    <Text fontSize="sm" fontWeight="600" color="brand.500">
                      {step.value} ({pct}%)
                    </Text>
                  </HStack>
                  <Box bg="surface.elevated" borderRadius="full" h="6" overflow="hidden">
                    <Box
                      bg={FUNNEL_COLORS[i] || '#2E5EA6'}
                      h="full"
                      borderRadius="full"
                      style={{ width: `${pct}%` }}
                      transition="width 0.5s"
                    />
                  </Box>
                </Box>
              )
            })}
          </Stack>
        </Box>
      </Section>

      {/* City Map */}
      {distributions.cities.length > 0 && (
        <Section title="Mapa por ciudad">
          <CityMap cities={distributions.cities} />
        </Section>
      )}

      {/* Distributions */}
      <Section title="Distribuciones">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
            <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Roles</Text>
            <HBar data={distributions.roles} color="#2E5EA6" />
          </Box>
          <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
            <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Industrias</Text>
            <HBar data={distributions.industries} color="#3B7DDD" />
          </Box>
          <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
            <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Qué buscan</Text>
            <HBar data={distributions.lookingFor} color="#F5A623" />
          </Box>
          <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
            <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Intereses</Text>
            <HBar data={distributions.interests} color="#22c55e" />
          </Box>
          <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
            <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Tamaño de equipo</Text>
            <HBar data={distributions.teamSizes} color="#5A9AE8" />
          </Box>
          <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
            <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Top ciudades</Text>
            <HBar data={distributions.cities.slice(0, 10)} color="#1B3B6F" />
          </Box>
        </SimpleGrid>
      </Section>

      {/* Activity over time */}
      <Section title="Actividad en el tiempo">
        <SimpleGrid columns={{ base: 1, md: 1 }} gap="4">
          {activity.registrations.length > 0 && (
            <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
              <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Registros por semana</Text>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={activity.registrations} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                  <Line type="monotone" dataKey="count" stroke="#2E5EA6" strokeWidth={2} dot={{ r: 3 }} name="Registros" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
          {activity.likes.length > 0 && (
            <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
              <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Likes por semana</Text>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={activity.likes} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                  <Line type="monotone" dataKey="count" stroke="#F5A623" strokeWidth={2} dot={{ r: 3 }} name="Likes" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
          {activity.connections.length > 0 && (
            <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
              <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Conexiones WhatsApp por semana</Text>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={activity.connections} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                  <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Conexiones" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </SimpleGrid>
      </Section>
    </Stack>
  )
}
