'use server'

import { z } from 'zod'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ROLES, INDUSTRIES, INTENTS, INTERESTS, TEAM_SIZES } from '@/lib/constants'

const normalizeUrl = (val: string) => {
  if (!val) return val
  if (!/^https?:\/\//i.test(val)) return `https://${val}`
  return val
}

const ProfileSchema = z.object({
  fullName: z.string().min(2).max(80),
  whatsappE164: z.string().refine(isValidPhoneNumber, 'Número inválido'),
  avatarUrl: z.string().optional().or(z.literal('')),
  role: z.enum(ROLES as unknown as [string, ...string[]]),
  startup: z.string().min(1).max(80),
  startupUrl: z.string().transform(normalizeUrl).pipe(z.string().url()).optional().or(z.literal('')),
  teamSize: z.enum(TEAM_SIZES as unknown as [string, ...string[]]).optional().or(z.literal('')),
  industries: z.array(z.string()).min(1).max(3),
  lookingFor: z.array(z.string()).min(1).max(2),
  interests: z.array(z.string()).min(1).max(3),
  bio: z.string().max(280).optional().or(z.literal('')),
  city: z.string().max(80).optional().or(z.literal('')),
  linkedinUrl: z.string().transform(normalizeUrl).pipe(z.string().url()).optional().or(z.literal('')),
  visible: z.boolean(),
})

export async function updateProfile(input: z.infer<typeof ProfileSchema>) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const data = ProfileSchema.parse(input)

  await prisma.profile.update({
    where: { id: session.user.id },
    data: {
      ...data,
      avatarUrl: data.avatarUrl || null,
      startupUrl: data.startupUrl || null,
      teamSize: data.teamSize || null,
      bio: data.bio || null,
      city: data.city || null,
      linkedinUrl: data.linkedinUrl || null,
    },
  })

  return { success: true }
}

export async function deleteAccount() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  await prisma.user.delete({ where: { id: session.user.id } })
  redirect('/')
}

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2 MB

export async function uploadAvatar(base64: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const match = base64.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!match) throw new Error('Formato inválido')

  const mime = match[1]
  if (!ALLOWED_MIME.includes(mime)) throw new Error('Formato no soportado')

  const buffer = Buffer.from(match[2], 'base64')
  if (buffer.length > MAX_SIZE) throw new Error('Imagen demasiado grande (máx 2MB)')

  // Store the data URL directly in the database (works on serverless/containers)
  const avatarUrl = `data:${mime};base64,${buffer.toString('base64')}`

  await prisma.profile.update({
    where: { id: session.user.id },
    data: { avatarUrl },
  })

  return { avatarUrl }
}

export async function getMyProfile() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  return prisma.profile.findUnique({ where: { id: session.user.id } })
}
