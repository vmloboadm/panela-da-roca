import { getDocument, setDocument } from './firestore'
import { FORNECEDORES_SEED } from './data/fornecedores'
import { PRODUTOS_SEED } from './data/produtos'

export async function seedIfEmpty(): Promise<void> {
  // Check if already seeded using a sentinel document
  const sentinel = await getDocument<{ seeded: boolean }>('_meta', 'seed')
  if (sentinel?.seeded) return

  console.log('[seed] Populando Firebase com dados iniciais...')

  // Seed fornecedores
  for (const fornecedor of FORNECEDORES_SEED) {
    const { id, ...data } = fornecedor
    await setDocument('fornecedores', id, { ...data, ativo: true })
  }

  // Seed produtos
  for (const produto of PRODUTOS_SEED) {
    const id = produto.nome.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
    await setDocument('produtos', id, {
      ...produto,
      estoque_atual: 0,
      estoque_minimo: 1,
      custo_medio: 0,
    })
  }

  // Seed configurações padrão
  await setDocument('configuracoes', 'geral', {
    custo_por_km: 1.20,
    meta_dia_util: 2500,
    meta_domingo: 5000,
    cmv_ideal_percentual: 35,
    preco_kg_semana: 76.90,
    preco_kg_domingo: 82.90,
    preco_coma_vontade: 54.90,
    alerta_validade_dias_antecedencia: 3,
    alerta_preco_variacao_percentual: 10,
    alerta_compra_acima_media_percentual: 50,
  })

  // Mark as seeded
  await setDocument('_meta', 'seed', { seeded: true })
  console.log('[seed] Dados iniciais populados com sucesso.')
}
