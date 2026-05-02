export interface SaudacaoResult {
  texto: string
  emoji: string
  extra?: string
}

export function getSaudacao(date: Date): SaudacaoResult {
  const hora = date.getHours()
  const isDomingo = date.getDay() === 0

  let texto: string
  let emoji: string

  if (hora < 12) {
    texto = 'Bom dia'
    emoji = '🌅'
  } else if (hora < 18) {
    texto = 'Boa tarde'
    emoji = '☀️'
  } else {
    texto = 'Boa noite'
    emoji = '🌙'
  }

  return { texto, emoji, extra: isDomingo ? 'Dia de churrasco! 🔥' : undefined }
}
