// types/index.ts

export type TipoFornecedor = 'supermercado' | 'atacado' | 'frigorífico' | 'açougue' | 'hortifruti'

export interface Fornecedor {
  id: string
  nome: string
  tipo: TipoFornecedor
  bairro: string
  distancia_km: number
  cor: string
  instagram_url?: string
  site_url?: string
  whatsapp?: string
  observacoes?: string
  ativo: boolean
}

// categoria is a plain string so new categories can be added freely via the UI
export interface Produto {
  id: string
  nome: string
  categoria: string
  subcategoria?: string
  unidade_padrao: string       // "kg", "un", "L", "dz", "cx"
  descricao?: string           // "Carne bovina traseira, ideal para churrasco" — helps AI understand
  sinonimos?: string[]         // ["picanha", "picanha nacional"] — AI recognizes variations
  uso_tipico?: string          // "buffet domingo premium, churrasco" — context for AI suggestions
  estoque_atual: number
  estoque_minimo: number
  custo_medio: number
  ativo: boolean
}

export type FonteCotacao = 'varredura_ia' | 'manual' | 'representante'
export type ConfiancaCotacao = 'alta' | 'media' | 'baixa' | 'estimada'

export interface Cotacao {
  id: string
  produto_id: string
  fornecedor_id: string
  preco: number
  unidade: string
  fonte: FonteCotacao
  confianca: ConfiancaCotacao
  data: string
  observacao?: string
  url_fonte?: string
}

export type OrigemMovimentacao =
  | 'foto_nota'
  | 'foto_recebimento'
  | 'manual'
  | 'baixa_preparacao'
  | 'perda_manual'

export type ConfiancaEstoque = 'confirmado' | 'estimado'

export interface MovimentacaoEstoque {
  id: string
  produto_id: string
  tipo: 'entrada' | 'saida' | 'perda'
  quantidade: number
  unidade: string
  custo_unitario?: number
  fornecedor_id?: string
  origem: OrigemMovimentacao
  confianca: ConfiancaEstoque
  foto_url?: string
  ia_pre_preenchido: boolean
  ia_dados_originais?: Record<string, unknown>
  data_validade?: string
  data: string
  observacao?: string
  confirmado_em?: string
}

export interface IngredientePreparacao {
  produto_id: string
  quantidade_entrada: number
  unidade: string
  rendimento_percentual: number
}

export type TipoPreparacao =
  | 'buffet_semana'
  | 'buffet_domingo'
  | 'quentinha'
  | 'quentinha_churrasco'

export interface Preparacao {
  id: string
  nome: string
  tipo: TipoPreparacao
  ingredientes: IngredientePreparacao[]
  custo_embalagem_unitario: number
  custo_gas_por_kg: number
  custo_condimentos_percentual: number
  ativo: boolean
}

export interface ItemRegistroDiario {
  preparacao_id: string
  kg_produzidos: number
}

export type TipoDia = 'util' | 'domingo'

export interface RegistroDiario {
  id: string
  data: string
  tipo_dia: TipoDia
  faturamento_total: number
  faturamento_selfservice?: number
  faturamento_coma_vontade?: number
  faturamento_bebidas?: number
  faturamento_quentinhas?: number
  faturamento_extras?: number
  coma_vontade_pessoas?: number
  preparacoes_do_dia: ItemRegistroDiario[]
  custo_producao_calculado: number
  lucro_bruto: number
  cmv_percentual: number
  kg_selfservice_equivalente: number
  meta_dia: number
  atingiu_meta: boolean
  modo_fechamento: 'normal' | 'rapido'
}

export interface Representante {
  id: string
  nome: string
  empresa: string
  telefone?: string
  whatsapp?: string
  email?: string
  observacoes?: string
  ativo: boolean
}

export interface ItemListaCompra {
  produto_id: string
  quantidade_sugerida: number
  unidade: string
  fornecedor_sugerido_id?: string
  preco_referencia?: number
  justificativa?: string
}

export interface ListaCompra {
  id: string
  criada_em: string
  status: 'ativa' | 'concluida' | 'descartada'
  itens: ItemListaCompra[]
  observacao?: string
}

export interface ItemKit {
  produto_id: string
  quantidade_padrao: number
  unidade: string
}

export interface KitCompra {
  id: string
  nome: string
  descricao?: string
  ativo: boolean
  itens: ItemKit[]
  criado_em: string
  atualizado_em: string
}

export interface LogAcao {
  id: string
  acao: string
  modulo: string
  dados_referencia_id?: string
  dados_referencia_colecao?: string
  timestamp: string
  dispositivo: 'mobile' | 'desktop'
  modo: 'normal' | 'rapido'
}

export interface Configuracoes {
  custo_por_km: number
  meta_dia_util: number
  meta_domingo: number
  cmv_ideal_percentual: number
  preco_kg_semana: number
  preco_kg_domingo: number
  preco_coma_vontade: number
  alerta_validade_dias_antecedencia: number
  alerta_preco_variacao_percentual: number
  alerta_compra_acima_media_percentual: number
}

export const CONFIGURACOES_PADRAO: Configuracoes = {
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
}

// ── Leitura IA Universal ──────────────────────────────────────────

export type TipoDocumento =
  | 'nota_fiscal'
  | 'folheto'
  | 'print_whatsapp'
  | 'print_instagram'
  | 'foto_produto'
  | 'audio'
  | 'outro'

export interface ItemExtraido {
  nome_original: string        // exatamente como aparece na fonte
  nome_normalizado: string     // nome padronizado
  preco_unitario: number | null
  unidade: string              // "kg", "un", "L", "cx", etc.
  quantidade: number | null
  fornecedor: string | null
  confianca: ConfiancaCotacao
  observacao: string | null
  produto_id?: string          // preenchido após matching com produtos do sistema
}

export interface LeituraIAResultado {
  itens: ItemExtraido[]
  tipo_documento: TipoDocumento
  data_documento: string | null   // data extraída do documento, se visível
  fornecedor_principal: string | null
  observacao_geral: string | null
}

// ── Varredura Web ──────────────────────────────────────────────────

export interface ResultadoVarredura {
  produto_id: string
  produto_nome: string
  cotacoes: {
    fornecedor_nome: string
    preco: number
    unidade: string
    confianca: ConfiancaCotacao
    url_fonte?: string
    observacao?: string
  }[]
}
