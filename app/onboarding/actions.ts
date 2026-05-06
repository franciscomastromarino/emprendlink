'use server'

import { z } from 'zod'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ROLES, INDUSTRIES, INTENTS, INTERESTS, TEAM_SIZES } from '@/lib/constants'

const Step1Schema = z.object({
  fullName: z.string().min(2, 'Mínimo 2 caracteres').max(80),
  whatsappE164: z.string().refine(isValidPhoneNumber, 'Número inválido'),
  avatarUrl: z.string().url().optional().or(z.literal('')),
})

const Step2Schema = z.object({
  role: z.enum(ROLES as unknown as [string, ...string[]]),
  startup: z.string().min(1, 'Requerido').max(80),
  startupUrl: z.string().url().optional().or(z.literal('')),
  teamSize: z.enum(TEAM_SIZES as unknown as [string, ...string[]], 'Elegí el tamaño'),
  industries: z
    .array(z.enum(INDUSTRIES as unknown as [string, ...string[]]))
    .min(1, 'Elegí al menos una')
    .max(3, 'Máximo 3'),
})

const Step3Schema = z.object({
  lookingFor: z
    .array(z.enum(INTENTS as unknown as [string, ...string[]]))
    .min(1, 'Elegí al menos una')
    .max(2, 'Máximo 2'),
  interests: z
    .array(z.enum(INTERESTS as unknown as [string, ...string[]]))
    .min(1, 'Elegí al menos uno')
    .max(3, 'Máximo 3'),
  bio: z.string().max(280).optional().or(z.literal('')),
})

async function getSessionUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session.user.id
}

export async function saveStep1(input: z.infer<typeof Step1Schema>) {
  const userId = await getSessionUserId()
  const data = Step1Schema.parse(input)

  await prisma.profile.upsert({
    where: { id: userId },
    create: {
      id: userId,
      fullName: data.fullName,
      whatsappE164: data.whatsappE164,
      avatarUrl: data.avatarUrl || null,
      role: '',
      startup: '',
      industries: [],
      lookingFor: [],
      interests: [],
      onboardingStep: 2,
    },
    update: {
      fullName: data.fullName,
      whatsappE164: data.whatsappE164,
      avatarUrl: data.avatarUrl || null,
      onboardingStep: 2,
    },
  })

  redirect('/onboarding/step-2')
}

export async function saveStep2(input: z.infer<typeof Step2Schema>) {
  const userId = await getSessionUserId()
  const data = Step2Schema.parse(input)

  await prisma.profile.update({
    where: { id: userId },
    data: {
      role: data.role,
      startup: data.startup,
      startupUrl: data.startupUrl || null,
      teamSize: data.teamSize,
      industries: data.industries,
      onboardingStep: 3,
    },
  })

  redirect('/onboarding/step-3')
}

export async function saveStep3(input: z.infer<typeof Step3Schema>) {
  const userId = await getSessionUserId()
  const data = Step3Schema.parse(input)

  await prisma.profile.update({
    where: { id: userId },
    data: {
      lookingFor: data.lookingFor,
      interests: data.interests,
      bio: data.bio || null,
      onboardingComplete: true,
      onboardingStep: 3,
    },
  })

  redirect('/feed')
}

export async function getProfile() {
  const userId = await getSessionUserId()
  return prisma.profile.findUnique({ where: { id: userId } })
}

export async function getSessionUser() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  return session.user
}
