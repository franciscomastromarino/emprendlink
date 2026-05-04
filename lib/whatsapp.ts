export function buildWhatsAppLink(phoneE164: string, message: string) {
  const cleanPhone = phoneE164.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

export function buildIntroMessage(
  target: { fullName: string },
  current: { fullName: string; role: string; startup: string }
) {
  return `Hola ${target.fullName}! Te encontré en EmprendLink. Soy ${current.fullName}, ${current.role} en ${current.startup}. Me interesa conectar.`
}
