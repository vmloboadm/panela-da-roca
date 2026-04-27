import { getCollection, addDocument, updateDocument } from '@/lib/firestore'
import { MovimentacaoEstoque, Produto } from '@/types'
import { orderBy, where, limit } from 'firebase/firestore'

export async function getProdutos(): Promise<Produto[]> {
  return getCollection<Produto>('produtos', [orderBy('nome')])
}

export async function getMovimentacoes(limite = 50): Promise<MovimentacaoEstoque[]> {
  return getCollection<MovimentacaoEstoque>('movimentacoes_estoque', [
    orderBy('data', 'desc'),
    limit(limite),
  ])
}

export async function getMovimentacoesPorProduto(produto_id: string): Promise<MovimentacaoEstoque[]> {
  return getCollection<MovimentacaoEstoque>('movimentacoes_estoque', [
    where('produto_id', '==', produto_id),
    orderBy('data', 'desc'),
  ])
}

export async function salvarEntrada(
  mov: Omit<MovimentacaoEstoque, 'id'>,
  produto: Produto
): Promise<void> {
  await addDocument('movimentacoes_estoque', mov)

  const estoqueAnt = produto.estoque_atual ?? 0
  const custoAnt = produto.custo_medio ?? 0
  const custoNovo = mov.custo_unitario ?? 0
  const novoEstoque = estoqueAnt + mov.quantidade

  const novoCusto = novoEstoque === 0
    ? custoNovo
    : (estoqueAnt * custoAnt + mov.quantidade * custoNovo) / novoEstoque

  await updateDocument('produtos', produto.id, {
    estoque_atual: novoEstoque,
    custo_medio: Math.round(novoCusto * 100) / 100,
  })
}

export async function salvarBaixa(
  mov: Omit<MovimentacaoEstoque, 'id'>,
  produto: Produto
): Promise<void> {
  await addDocument('movimentacoes_estoque', mov)
  const novoEstoque = Math.max(0, (produto.estoque_atual ?? 0) - mov.quantidade)
  await updateDocument('produtos', produto.id, { estoque_atual: novoEstoque })
}

export async function salvarPerda(
  mov: Omit<MovimentacaoEstoque, 'id'>,
  produto: Produto
): Promise<void> {
  await addDocument('movimentacoes_estoque', mov)
  const novoEstoque = Math.max(0, (produto.estoque_atual ?? 0) - mov.quantidade)
  await updateDocument('produtos', produto.id, { estoque_atual: novoEstoque })
}
