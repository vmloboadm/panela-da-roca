import { getDocument, setDocument, getCollection, updateDocument } from './firestore'
import { FORNECEDORES_SEED } from './data/fornecedores'
import { PRODUTOS_SEED } from './data/produtos'
import { Produto } from '@/types'

const SEED_VERSION = 2

// Maps old category names (v1) → new categoria + subcategoria (v2)
const MAPA_V1_V2: Record<string, { categoria: string; subcategoria: string }> = {
  '🥩 Bovinos':   { categoria: 'Carnes',        subcategoria: 'Bovina p/ Churrasco' },
  '🐷 Suínos':    { categoria: 'Carnes',        subcategoria: 'Suína' },
  '🍗 Aves':      { categoria: 'Carnes',        subcategoria: 'Aves' },
  '🥦 Legumes':   { categoria: 'Hortifruti',    subcategoria: 'Legumes e Verduras' },
  '🥬 Folhas':    { categoria: 'Hortifruti',    subcategoria: 'Legumes e Verduras' },
  '🍅 Temperos':  { categoria: 'Hortifruti',    subcategoria: 'Cebola e Alho' },
  '🛒 Mercearia': { categoria: 'Secos e Grãos', subcategoria: 'Grãos' },
  '🍺 Bebidas':   { categoria: 'Bebidas',       subcategoria: 'Refrigerantes' },
}

export async function seedIfEmpty(): Promise<void> {
  const sentinel = await getDocument<{ seeded: boolean; version?: number }>('_meta', 'seed')

  // First ever seed
  if (!sentinel?.seeded) {
    await runFullSeed()
    await setDocument('_meta', 'seed', { seeded: true, version: SEED_VERSION })
    return
  }

  // Migration: v1 → v2 (update categories without wiping stock data)
  const currentVersion = sentinel.version ?? 1
  if (currentVersion < 2) {
    await migrarV1ParaV2()
    await updateDocument('_meta', 'seed', { version: 2 })
  }
}

async function runFullSeed(): Promise<void> {
  console.log('[seed] Populando Firebase com dados iniciais (v2)...')

  for (const fornecedor of FORNECEDORES_SEED) {
    const { id, ...data } = fornecedor
    await setDocument('fornecedores', id, { ...data, ativo: true })
  }

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

  console.log('[seed] Dados iniciais populados com sucesso.')
}

async function migrarV1ParaV2(): Promise<void> {
  console.log('[seed] Migrando categorias v1 → v2...')

  const produtos = await getCollection<Produto>('produtos')

  for (const produto of produtos) {
    const mapa = MAPA_V1_V2[produto.categoria]
    if (mapa) {
      // Update category without touching estoque/custo_medio
      await updateDocument('produtos', produto.id, {
        categoria: mapa.categoria,
        subcategoria: mapa.subcategoria,
      })
    }
  }

  // Add any new products from v2 seed that don't exist yet
  const existingIds = new Set(produtos.map(p => p.id))
  for (const produto of PRODUTOS_SEED) {
    const id = produto.nome.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
    if (!existingIds.has(id)) {
      await setDocument('produtos', id, {
        ...produto,
        estoque_atual: 0,
        estoque_minimo: 1,
        custo_medio: 0,
      })
    }
  }

  console.log('[seed] Migração v1→v2 concluída.')
}
