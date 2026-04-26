import { LeituraIAResultado } from '@/types'

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove o prefixo "data:image/jpeg;base64," — envia só o base64 puro
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function lerMidia(
  base64: string,
  mimeType: string,
  contextoAdicional?: string
): Promise<LeituraIAResultado> {
  const res = await fetch('/api/gemini/leitura', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, mimeType, contextoAdicional }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error ?? 'Erro ao processar mídia')
  }

  return data as LeituraIAResultado
}

export async function lerArquivo(
  file: File,
  contextoAdicional?: string
): Promise<LeituraIAResultado> {
  const base64 = await fileToBase64(file)
  return lerMidia(base64, file.type, contextoAdicional)
}
