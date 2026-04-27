export interface SubcategoriaConfig {
  id: string
  nome: string
}

export interface CategoriaConfig {
  id: string
  nome: string
  icon: string
  cor: string       // hex usado em borders, badges, donut
  corBg: string     // versão suave para fundo de card
  subcategorias: SubcategoriaConfig[]
}

export const CATEGORIAS: CategoriaConfig[] = [
  {
    id: 'carnes',
    nome: 'Carnes',
    icon: '🥩',
    cor: '#ef4444',
    corBg: 'rgba(239,68,68,0.08)',
    subcategorias: [
      { id: 'bovina_churrasco', nome: 'Bovina p/ Churrasco' },
      { id: 'bovina_cozinha', nome: 'Bovina p/ Cozinha' },
      { id: 'suina', nome: 'Suína' },
      { id: 'aves', nome: 'Aves' },
      { id: 'peixes', nome: 'Peixes e Frutos do Mar' },
      { id: 'linguicas', nome: 'Linguiças e Embutidos' },
      { id: 'refrigerados', nome: 'Refrigerados' },
    ],
  },
  {
    id: 'secos',
    nome: 'Secos e Grãos',
    icon: '🌾',
    cor: '#f59e0b',
    corBg: 'rgba(245,158,11,0.08)',
    subcategorias: [
      { id: 'graos', nome: 'Grãos' },
      { id: 'farinhas', nome: 'Farinhas e Derivados' },
      { id: 'enlatados', nome: 'Enlatados e Conservas' },
      { id: 'oleos', nome: 'Óleos e Gorduras' },
      { id: 'temperos_secos', nome: 'Temperos Secos' },
      { id: 'massas', nome: 'Massas' },
    ],
  },
  {
    id: 'hortifruti',
    nome: 'Hortifruti',
    icon: '🥦',
    cor: '#22c55e',
    corBg: 'rgba(34,197,94,0.08)',
    subcategorias: [
      { id: 'raizes', nome: 'Raízes e Tubérculos' },
      { id: 'legumes', nome: 'Legumes e Verduras' },
      { id: 'cebola_alho', nome: 'Cebola e Alho' },
      { id: 'frutas', nome: 'Frutas' },
    ],
  },
  {
    id: 'bebidas',
    nome: 'Bebidas',
    icon: '🍺',
    cor: '#3b82f6',
    corBg: 'rgba(59,130,246,0.08)',
    subcategorias: [
      { id: 'refrigerantes', nome: 'Refrigerantes' },
      { id: 'cervejas', nome: 'Cervejas' },
      { id: 'aguas', nome: 'Águas' },
      { id: 'sucos', nome: 'Sucos Industrializados' },
      { id: 'outros_bebidas', nome: 'Outros' },
    ],
  },
  {
    id: 'congelados',
    nome: 'Congelados',
    icon: '🧊',
    cor: '#06b6d4',
    corBg: 'rgba(6,182,212,0.08)',
    subcategorias: [
      { id: 'congelados_ind', nome: 'Congelados Industrializados' },
      { id: 'prepreparados', nome: 'Pré-preparados Caseiros' },
    ],
  },
  {
    id: 'descartaveis',
    nome: 'Descartáveis',
    icon: '🥡',
    cor: '#8b5cf6',
    corBg: 'rgba(139,92,246,0.08)',
    subcategorias: [
      { id: 'delivery', nome: 'Para Delivery' },
      { id: 'consumo_local', nome: 'Para Consumo no Local' },
      { id: 'embalar', nome: 'Para Embalar Alimentos' },
    ],
  },
  {
    id: 'limpeza',
    nome: 'Limpeza',
    icon: '🧹',
    cor: '#ec4899',
    corBg: 'rgba(236,72,153,0.08)',
    subcategorias: [
      { id: 'prod_limpeza', nome: 'Produtos de Limpeza' },
      { id: 'utensilios', nome: 'Utensílios de Limpeza' },
      { id: 'epis', nome: 'EPIs e Cozinha' },
      { id: 'churrasco_insumos', nome: 'Insumos da Churrasqueira' },
    ],
  },
  {
    id: 'gas',
    nome: 'Gás',
    icon: '🔥',
    cor: '#f97316',
    corBg: 'rgba(249,115,22,0.08)',
    subcategorias: [
      { id: 'gas_p13', nome: 'Botijão P13' },
      { id: 'gas_p45', nome: 'Botijão P45' },
    ],
  },
]

export function getCategoriaById(id: string): CategoriaConfig | undefined {
  return CATEGORIAS.find(c => c.id === id)
}

export function getCategoriaByNome(nome: string): CategoriaConfig | undefined {
  return CATEGORIAS.find(c => c.nome.toLowerCase() === nome.toLowerCase())
}
