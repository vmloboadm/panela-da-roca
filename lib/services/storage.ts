import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'

export async function uploadFotoMovimentacao(file: File, movimentacaoId: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const ano = new Date().getFullYear()
  const mes = String(new Date().getMonth() + 1).padStart(2, '0')
  const path = `movimentacoes/${ano}/${mes}/${movimentacaoId}.${ext}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
