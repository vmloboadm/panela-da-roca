import { Produto } from '@/types'

export const PRODUTOS_SEED: Omit<Produto, 'id' | 'estoque_atual' | 'estoque_minimo' | 'custo_medio'>[] = [
  // ── CARNES / Bovina p/ Churrasco ─────────────────────────────────
  { nome: 'Picanha Nacional', categoria: 'Carnes', subcategoria: 'Bovina p/ Churrasco', unidade_padrao: 'kg', descricao: 'Corte nobre bovino traseiro com capa de gordura', sinonimos: ['picanha', 'picanha bovina'], uso_tipico: 'buffet domingo premium, churrasco', ativo: true },
  { nome: 'Alcatra', categoria: 'Carnes', subcategoria: 'Bovina p/ Churrasco', unidade_padrao: 'kg', descricao: 'Corte bovino traseiro, macio e versátil', sinonimos: ['alcatra', 'alcatra com maminha'], uso_tipico: 'buffet diário, assado', ativo: true },
  { nome: 'Contrafilé', categoria: 'Carnes', subcategoria: 'Bovina p/ Churrasco', unidade_padrao: 'kg', descricao: 'Corte bovino com marmoreado, ideal para grelha', sinonimos: ['contrafile'], uso_tipico: 'buffet diário, grelhado', ativo: true },
  { nome: 'Costela Janela', categoria: 'Carnes', subcategoria: 'Bovina p/ Churrasco', unidade_padrao: 'kg', descricao: 'Costela bovina para churrasco e cozido', sinonimos: ['costela', 'costela bovina'], uso_tipico: 'buffet fim de semana, churrasco', ativo: true },
  { nome: 'Fraldinha', categoria: 'Carnes', subcategoria: 'Bovina p/ Churrasco', unidade_padrao: 'kg', descricao: 'Corte bovino lateral, suculento e saboroso', sinonimos: ['fraldinha bovina'], uso_tipico: 'buffet diário, grelhado', ativo: true },
  { nome: 'Maminha', categoria: 'Carnes', subcategoria: 'Bovina p/ Churrasco', unidade_padrao: 'kg', descricao: 'Corte bovino macio, parte da alcatra', sinonimos: ['maminha bovina'], uso_tipico: 'buffet diário', ativo: true },
  { nome: 'Cupim', categoria: 'Carnes', subcategoria: 'Bovina p/ Churrasco', unidade_padrao: 'kg', descricao: 'Corcova bovina, lento e macio no forno', sinonimos: ['cupim bovino'], uso_tipico: 'buffet domingo, assado lento', ativo: true },

  // ── CARNES / Bovina p/ Cozinha ───────────────────────────────────
  { nome: 'Acém', categoria: 'Carnes', subcategoria: 'Bovina p/ Cozinha', unidade_padrao: 'kg', descricao: 'Carne bovina dianteira, boa para ensopados', sinonimos: ['acem'], uso_tipico: 'buffet diário, guisado', ativo: true },
  { nome: 'Patinho', categoria: 'Carnes', subcategoria: 'Bovina p/ Cozinha', unidade_padrao: 'kg', descricao: 'Corte bovino magro, versátil', sinonimos: ['patinho bovino'], uso_tipico: 'buffet diário, assado, bife', ativo: true },
  { nome: 'Filé Mignon', categoria: 'Carnes', subcategoria: 'Bovina p/ Cozinha', unidade_padrao: 'kg', descricao: 'Corte mais nobre e macio do boi', sinonimos: ['file mignon', 'filé'], uso_tipico: 'buffet domingo premium', ativo: true },
  { nome: 'Carne Moída', categoria: 'Carnes', subcategoria: 'Bovina p/ Cozinha', unidade_padrao: 'kg', descricao: 'Carne bovina moída para recheios e molhos', sinonimos: ['carne moida'], uso_tipico: 'escondidinho, recheio', ativo: true },

  // ── CARNES / Suína ───────────────────────────────────────────────
  { nome: 'Pernil Inteiro', categoria: 'Carnes', subcategoria: 'Suína', unidade_padrao: 'kg', descricao: 'Perna suína inteira, assado lento', sinonimos: ['pernil suino', 'pernil de porco'], uso_tipico: 'buffet fim de semana, assado', ativo: true },
  { nome: 'Lombo Suíno', categoria: 'Carnes', subcategoria: 'Suína', unidade_padrao: 'kg', descricao: 'Corte suíno magro e macio', sinonimos: ['lombo', 'lombo de porco'], uso_tipico: 'buffet diário', ativo: true },
  { nome: 'Costelinha Baby Back', categoria: 'Carnes', subcategoria: 'Suína', unidade_padrao: 'kg', descricao: 'Costelinha suína menor e mais macia', sinonimos: ['costelinha', 'baby back'], uso_tipico: 'buffet fim de semana, churrasco', ativo: true },
  { nome: 'Copa Lombo', categoria: 'Carnes', subcategoria: 'Suína', unidade_padrao: 'kg', descricao: 'Corte suíno do pescoço, muito saboroso', sinonimos: ['copa', 'copa de lombo'], uso_tipico: 'buffet diário', ativo: true },
  { nome: 'Picanha Suína', categoria: 'Carnes', subcategoria: 'Suína', unidade_padrao: 'kg', descricao: 'Corte suíno com capa de gordura, para churrasco', sinonimos: ['picanha de porco'], uso_tipico: 'buffet fim de semana', ativo: true },

  // ── CARNES / Linguiças e Embutidos ──────────────────────────────
  { nome: 'Linguiça Toscana', categoria: 'Carnes', subcategoria: 'Linguiças e Embutidos', unidade_padrao: 'kg', descricao: 'Linguiça suína temperada estilo toscano', sinonimos: ['linguiça', 'toscana'], uso_tipico: 'buffet diário, churrasco', ativo: true },
  { nome: 'Linguiça Calabresa', categoria: 'Carnes', subcategoria: 'Linguiças e Embutidos', unidade_padrao: 'kg', descricao: 'Linguiça defumada apimentada', sinonimos: ['calabresa'], uso_tipico: 'buffet diário, feijão tropeiro', ativo: true },
  { nome: 'Linguiça de Frango', categoria: 'Carnes', subcategoria: 'Linguiças e Embutidos', unidade_padrao: 'kg', descricao: 'Linguiça de frango temperada', sinonimos: ['linguiça frango'], uso_tipico: 'buffet diário', ativo: true },
  { nome: 'Bacon Manta', categoria: 'Carnes', subcategoria: 'Linguiças e Embutidos', unidade_padrao: 'kg', descricao: 'Barriga suína defumada em manta', sinonimos: ['bacon', 'barriga defumada'], uso_tipico: 'tempero, acompanhamento', ativo: true },

  // ── CARNES / Aves ────────────────────────────────────────────────
  { nome: 'Peito de Frango Filé', categoria: 'Carnes', subcategoria: 'Aves', unidade_padrao: 'kg', descricao: 'Peito de frango sem osso e sem pele', sinonimos: ['file de frango', 'peito frango', 'frango'], uso_tipico: 'buffet diário, grelhado, assado', ativo: true },
  { nome: 'Sobrecoxa de Frango', categoria: 'Carnes', subcategoria: 'Aves', unidade_padrao: 'kg', descricao: 'Sobrecoxa de frango com osso, suculenta', sinonimos: ['sobrecoxa', 'coxa sobrecoxa'], uso_tipico: 'buffet diário, assado', ativo: true },
  { nome: 'Coração de Frango', categoria: 'Carnes', subcategoria: 'Aves', unidade_padrao: 'kg', descricao: 'Miúdo de frango para churrasco', sinonimos: ['coracao de frango'], uso_tipico: 'buffet fim de semana, churrasco', ativo: true },
  { nome: 'Coxinha da Asa', categoria: 'Carnes', subcategoria: 'Aves', unidade_padrao: 'kg', descricao: 'Asa de frango, crocante e saborosa', sinonimos: ['asa de frango', 'drummete', 'asinhas'], uso_tipico: 'buffet diário, aperitivo', ativo: true },
  { nome: 'Frango Caipira (Pedaços)', categoria: 'Carnes', subcategoria: 'Aves', unidade_padrao: 'kg', descricao: 'Frango caipira inteiro cortado em pedaços', sinonimos: ['frango caipira'], uso_tipico: 'buffet domingo', ativo: true },

  // ── CARNES / Peixes e Frutos do Mar ──────────────────────────────
  { nome: 'Camarão Limpo', categoria: 'Carnes', subcategoria: 'Peixes e Frutos do Mar', unidade_padrao: 'kg', descricao: 'Camarão descascado e limpo', sinonimos: ['camarao'], uso_tipico: 'buffet domingo, moqueca', ativo: true },
  { nome: 'Filé de Peixe', categoria: 'Carnes', subcategoria: 'Peixes e Frutos do Mar', unidade_padrao: 'kg', descricao: 'Filé de peixe branco para fritura ou moqueca', sinonimos: ['peixe', 'file de peixe'], uso_tipico: 'buffet diário', ativo: true },

  // ── CARNES / Refrigerados ────────────────────────────────────────
  { nome: 'Ovos', categoria: 'Carnes', subcategoria: 'Refrigerados', unidade_padrao: 'dz', descricao: 'Ovos de galinha para todas as preparações', sinonimos: ['ovo', 'ovos caipira'], uso_tipico: 'todas as preparações', ativo: true },
  { nome: 'Queijo Minas Frescal', categoria: 'Carnes', subcategoria: 'Refrigerados', unidade_padrao: 'kg', descricao: 'Queijo minas fresco para acompanhamento', sinonimos: ['queijo minas', 'queijo fresco'], uso_tipico: 'buffet, acompanhamento', ativo: true },
  { nome: 'Manteiga', categoria: 'Carnes', subcategoria: 'Refrigerados', unidade_padrao: 'kg', descricao: 'Manteiga para cozinhar e finalizar', sinonimos: ['manteiga com sal'], uso_tipico: 'todas as preparações', ativo: true },
  { nome: 'Creme de Leite', categoria: 'Carnes', subcategoria: 'Refrigerados', unidade_padrao: 'L', descricao: 'Creme de leite fresco para molhos', sinonimos: ['creme leite'], uso_tipico: 'molhos, sobremesas', ativo: true },

  // ── SECOS E GRÃOS / Grãos ────────────────────────────────────────
  { nome: 'Arroz Tipo 1', categoria: 'Secos e Grãos', subcategoria: 'Grãos', unidade_padrao: 'kg', descricao: 'Arroz branco polido tipo 1', sinonimos: ['arroz', 'arroz branco', 'arroz parboilizado'], uso_tipico: 'acompanhamento buffet diário', ativo: true },
  { nome: 'Feijão Carioca', categoria: 'Secos e Grãos', subcategoria: 'Grãos', unidade_padrao: 'kg', descricao: 'Feijão carioca para feijoada e feijão do dia', sinonimos: ['feijao', 'feijão carioquinha'], uso_tipico: 'buffet diário, feijão tropeiro', ativo: true },
  { nome: 'Feijão Preto', categoria: 'Secos e Grãos', subcategoria: 'Grãos', unidade_padrao: 'kg', descricao: 'Feijão preto para feijoada', sinonimos: ['feijao preto', 'feijoada'], uso_tipico: 'buffet domingo, feijoada', ativo: true },
  { nome: 'Feijão Vermelho', categoria: 'Secos e Grãos', subcategoria: 'Grãos', unidade_padrao: 'kg', descricao: 'Feijão vermelho para sopas e pratos especiais', sinonimos: ['feijao vermelho'], uso_tipico: 'buffet especial', ativo: true },

  // ── SECOS E GRÃOS / Farinhas e Derivados ─────────────────────────
  { nome: 'Farinha de Mandioca', categoria: 'Secos e Grãos', subcategoria: 'Farinhas e Derivados', unidade_padrao: 'kg', descricao: 'Farinha de mandioca torrada para acompanhamento', sinonimos: ['farinha', 'farofa'], uso_tipico: 'acompanhamento buffet diário', ativo: true },
  { nome: 'Fubá Mimoso', categoria: 'Secos e Grãos', subcategoria: 'Farinhas e Derivados', unidade_padrao: 'kg', descricao: 'Fubá fino para polenta e angu', sinonimos: ['fuba', 'angu', 'polenta'], uso_tipico: 'buffet diário, angu', ativo: true },
  { nome: 'Farinha de Rosca', categoria: 'Secos e Grãos', subcategoria: 'Farinhas e Derivados', unidade_padrao: 'kg', descricao: 'Farinha de rosca para empanar', sinonimos: ['farinha rosca', 'farinha de trigo'], uso_tipico: 'empanados, aperitivos', ativo: true },
  { nome: 'Amido de Milho', categoria: 'Secos e Grãos', subcategoria: 'Farinhas e Derivados', unidade_padrao: 'kg', descricao: 'Amido para engrossar molhos e sobremesas', sinonimos: ['maizena', 'amido'], uso_tipico: 'molhos, sobremesas', ativo: true },

  // ── SECOS E GRÃOS / Enlatados e Conservas ────────────────────────
  { nome: 'Extrato de Tomate', categoria: 'Secos e Grãos', subcategoria: 'Enlatados e Conservas', unidade_padrao: 'kg', descricao: 'Extrato de tomate concentrado para molhos', sinonimos: ['extrato tomate', 'molho tomate'], uso_tipico: 'base de molhos, carnes', ativo: true },
  { nome: 'Milho Enlatado', categoria: 'Secos e Grãos', subcategoria: 'Enlatados e Conservas', unidade_padrao: 'un', descricao: 'Milho verde em lata para saladas e pratos', sinonimos: ['milho lata', 'milho verde'], uso_tipico: 'salada, mingau, acompanhamento', ativo: true },
  { nome: 'Ervilha Enlatada', categoria: 'Secos e Grãos', subcategoria: 'Enlatados e Conservas', unidade_padrao: 'un', descricao: 'Ervilha em lata para saladas', sinonimos: ['ervilha lata'], uso_tipico: 'salada buffet', ativo: true },
  { nome: 'Palmito', categoria: 'Secos e Grãos', subcategoria: 'Enlatados e Conservas', unidade_padrao: 'un', descricao: 'Palmito em conserva para saladas e recheios', sinonimos: ['palmito pupunha'], uso_tipico: 'salada, recheio', ativo: true },

  // ── SECOS E GRÃOS / Óleos e Gorduras ─────────────────────────────
  { nome: 'Óleo de Soja', categoria: 'Secos e Grãos', subcategoria: 'Óleos e Gorduras', unidade_padrao: 'L', descricao: 'Óleo vegetal para fritura e refogado', sinonimos: ['oleo', 'óleo vegetal'], uso_tipico: 'todas as preparações', ativo: true },
  { nome: 'Azeite de Oliva', categoria: 'Secos e Grãos', subcategoria: 'Óleos e Gorduras', unidade_padrao: 'L', descricao: 'Azeite para finalizar e temperar', sinonimos: ['azeite'], uso_tipico: 'saladas, finalização', ativo: true },

  // ── SECOS E GRÃOS / Temperos Secos ───────────────────────────────
  { nome: 'Sal Refinado', categoria: 'Secos e Grãos', subcategoria: 'Temperos Secos', unidade_padrao: 'kg', descricao: 'Sal refinado para cozinhar', sinonimos: ['sal'], uso_tipico: 'todas as preparações', ativo: true },
  { nome: 'Colorau', categoria: 'Secos e Grãos', subcategoria: 'Temperos Secos', unidade_padrao: 'kg', descricao: 'Colorau para dar cor aos pratos', sinonimos: ['colorau', 'colorificio', 'colorau urucum'], uso_tipico: 'todas as preparações', ativo: true },
  { nome: 'Cominho', categoria: 'Secos e Grãos', subcategoria: 'Temperos Secos', unidade_padrao: 'kg', descricao: 'Cominho moído para feijão e carnes', sinonimos: [], uso_tipico: 'feijão, carnes temperadas', ativo: true },
  { nome: 'Orégano', categoria: 'Secos e Grãos', subcategoria: 'Temperos Secos', unidade_padrao: 'kg', descricao: 'Orégano para tempero de pizzas e carnes', sinonimos: ['oregano'], uso_tipico: 'pizzas, carnes grelhadas', ativo: true },

  // ── SECOS E GRÃOS / Massas ────────────────────────────────────────
  { nome: 'Macarrão Espaguete', categoria: 'Secos e Grãos', subcategoria: 'Massas', unidade_padrao: 'kg', descricao: 'Macarrão espaguete seco', sinonimos: ['macarrao', 'espaguete', 'massa'], uso_tipico: 'buffet diário, macarronada', ativo: true },
  { nome: 'Capeletti Seco', categoria: 'Secos e Grãos', subcategoria: 'Massas', unidade_padrao: 'kg', descricao: 'Capeletti para sopa e macarronada', sinonimos: ['capeletti', 'capelete'], uso_tipico: 'sopa, buffet', ativo: true },

  // ── HORTIFRUTI / Raízes e Tubérculos ─────────────────────────────
  { nome: 'Batata Inglesa', categoria: 'Hortifruti', subcategoria: 'Raízes e Tubérculos', unidade_padrao: 'kg', descricao: 'Batata comum para cozinhar e fritar', sinonimos: ['batata', 'batata cozida'], uso_tipico: 'acompanhamento buffet diário', ativo: true },
  { nome: 'Batata Doce', categoria: 'Hortifruti', subcategoria: 'Raízes e Tubérculos', unidade_padrao: 'kg', descricao: 'Batata doce para assar e purê', sinonimos: ['batata-doce'], uso_tipico: 'acompanhamento, purê', ativo: true },
  { nome: 'Mandioca', categoria: 'Hortifruti', subcategoria: 'Raízes e Tubérculos', unidade_padrao: 'kg', descricao: 'Mandioca para cozinhar ou fritar', sinonimos: ['aipim', 'macaxeira', 'mandioca cozida'], uso_tipico: 'acompanhamento buffet diário', ativo: true },
  { nome: 'Inhame', categoria: 'Hortifruti', subcategoria: 'Raízes e Tubérculos', unidade_padrao: 'kg', descricao: 'Inhame para cozinhar', sinonimos: [], uso_tipico: 'acompanhamento especial', ativo: true },
  { nome: 'Baroa (Batata Baroa)', categoria: 'Hortifruti', subcategoria: 'Raízes e Tubérculos', unidade_padrao: 'kg', descricao: 'Batata baroa para purê e cozido', sinonimos: ['baroa', 'batata baroa', 'mandioquinha'], uso_tipico: 'purê, cozido', ativo: true },

  // ── HORTIFRUTI / Legumes e Verduras ──────────────────────────────
  { nome: 'Cenoura', categoria: 'Hortifruti', subcategoria: 'Legumes e Verduras', unidade_padrao: 'kg', descricao: 'Cenoura para cozinhar e refogados', sinonimos: ['cenoura crua'], uso_tipico: 'acompanhamento, salada', ativo: true },
  { nome: 'Beterraba', categoria: 'Hortifruti', subcategoria: 'Legumes e Verduras', unidade_padrao: 'kg', descricao: 'Beterraba para salada e cozido', sinonimos: [], uso_tipico: 'salada buffet', ativo: true },
  { nome: 'Chuchu', categoria: 'Hortifruti', subcategoria: 'Legumes e Verduras', unidade_padrao: 'kg', descricao: 'Legume verde suave para refogado', sinonimos: [], uso_tipico: 'acompanhamento buffet diário', ativo: true },
  { nome: 'Abóbora Cabotiá', categoria: 'Hortifruti', subcategoria: 'Legumes e Verduras', unidade_padrao: 'kg', descricao: 'Abóbora japonesa, doce e cremosa', sinonimos: ['cabotia', 'abobora japonesa', 'abobora'], uso_tipico: 'acompanhamento, purê', ativo: true },
  { nome: 'Quiabo', categoria: 'Hortifruti', subcategoria: 'Legumes e Verduras', unidade_padrao: 'kg', descricao: 'Quiabo para refogado e frango com quiabo', sinonimos: [], uso_tipico: 'buffet diário, frango com quiabo', ativo: true },
  { nome: 'Vagem', categoria: 'Hortifruti', subcategoria: 'Legumes e Verduras', unidade_padrao: 'kg', descricao: 'Vagem para refogado e salada', sinonimos: ['feijao vagem'], uso_tipico: 'acompanhamento buffet', ativo: true },
  { nome: 'Jiló', categoria: 'Hortifruti', subcategoria: 'Legumes e Verduras', unidade_padrao: 'kg', descricao: 'Jiló para refogado', sinonimos: ['jilo'], uso_tipico: 'buffet diário', ativo: true },
  { nome: 'Tomate', categoria: 'Hortifruti', subcategoria: 'Legumes e Verduras', unidade_padrao: 'kg', descricao: 'Tomate fresco para salada e molho', sinonimos: ['tomate salada', 'tomate fresco'], uso_tipico: 'salada, molho buffet', ativo: true },
  { nome: 'Alface Crespa', categoria: 'Hortifruti', subcategoria: 'Legumes e Verduras', unidade_padrao: 'un', descricao: 'Alface crespa para salada', sinonimos: ['alface'], uso_tipico: 'salada buffet diário', ativo: true },
  { nome: 'Couve Manteiga', categoria: 'Hortifruti', subcategoria: 'Legumes e Verduras', unidade_padrao: 'kg', descricao: 'Couve para refogar e salada', sinonimos: ['couve'], uso_tipico: 'acompanhamento feijão, buffet', ativo: true },
  { nome: 'Repolho', categoria: 'Hortifruti', subcategoria: 'Legumes e Verduras', unidade_padrao: 'kg', descricao: 'Repolho para salada e cozido', sinonimos: ['repolho branco'], uso_tipico: 'salada, cozido buffet', ativo: true },
  { nome: 'Brócolis', categoria: 'Hortifruti', subcategoria: 'Legumes e Verduras', unidade_padrao: 'kg', descricao: 'Brócolis para refogar e salada', sinonimos: ['brocolis', 'brócolos'], uso_tipico: 'acompanhamento buffet', ativo: true },

  // ── HORTIFRUTI / Cebola e Alho ────────────────────────────────────
  { nome: 'Cebola', categoria: 'Hortifruti', subcategoria: 'Cebola e Alho', unidade_padrao: 'kg', descricao: 'Cebola para refogado e tempero', sinonimos: ['cebola branca', 'cebola roxa'], uso_tipico: 'tempero base todas as preparações', ativo: true },
  { nome: 'Alho', categoria: 'Hortifruti', subcategoria: 'Cebola e Alho', unidade_padrao: 'kg', descricao: 'Alho in natura para tempero', sinonimos: ['alho granel', 'alho descascado'], uso_tipico: 'tempero base todas as preparações', ativo: true },
  { nome: 'Cebolinha', categoria: 'Hortifruti', subcategoria: 'Cebola e Alho', unidade_padrao: 'kg', descricao: 'Cebolinha para finalizar pratos', sinonimos: ['cebolinha verde', 'cheiro verde'], uso_tipico: 'finalização todas as preparações', ativo: true },
  { nome: 'Salsinha', categoria: 'Hortifruti', subcategoria: 'Cebola e Alho', unidade_padrao: 'kg', descricao: 'Salsinha para finalizar pratos', sinonimos: ['salsa', 'cheiro-verde'], uso_tipico: 'finalização', ativo: true },
  { nome: 'Pimentão', categoria: 'Hortifruti', subcategoria: 'Cebola e Alho', unidade_padrao: 'kg', descricao: 'Pimentão para tempero e salada', sinonimos: ['pimentao verde', 'pimentao vermelho'], uso_tipico: 'tempero, salada', ativo: true },
  { nome: 'Pimenta Dedo de Moça', categoria: 'Hortifruti', subcategoria: 'Cebola e Alho', unidade_padrao: 'kg', descricao: 'Pimenta fresca de ardência média', sinonimos: ['pimenta', 'dedo de moca'], uso_tipico: 'tempero, molho apimentado', ativo: true },

  // ── HORTIFRUTI / Frutas ────────────────────────────────────────────
  { nome: 'Laranja', categoria: 'Hortifruti', subcategoria: 'Frutas', unidade_padrao: 'kg', descricao: 'Laranja para suco', sinonimos: ['laranja pera', 'laranja suco'], uso_tipico: 'suco, sobremesa', ativo: true },
  { nome: 'Limão', categoria: 'Hortifruti', subcategoria: 'Frutas', unidade_padrao: 'kg', descricao: 'Limão para tempero e bebidas', sinonimos: ['limao taiti', 'limão tahiti'], uso_tipico: 'tempero, caipirinha, limonada', ativo: true },
  { nome: 'Banana', categoria: 'Hortifruti', subcategoria: 'Frutas', unidade_padrao: 'kg', descricao: 'Banana para sobremesa e acompanhamento', sinonimos: ['banana prata', 'banana nanica'], uso_tipico: 'sobremesa, buffet', ativo: true },

  // ── BEBIDAS / Refrigerantes ────────────────────────────────────────
  { nome: 'Coca-Cola 2L', categoria: 'Bebidas', subcategoria: 'Refrigerantes', unidade_padrao: 'un', descricao: 'Refrigerante Coca-Cola garrafa 2 litros', sinonimos: ['coca', 'coca cola', 'refrigerante'], uso_tipico: 'venda avulsa, almoço', ativo: true },
  { nome: 'Guaraná Antarctica 2L', categoria: 'Bebidas', subcategoria: 'Refrigerantes', unidade_padrao: 'un', descricao: 'Refrigerante Guaraná Antarctica 2 litros', sinonimos: ['guarana', 'guaraná'], uso_tipico: 'venda avulsa', ativo: true },
  { nome: 'Fanta Laranja 2L', categoria: 'Bebidas', subcategoria: 'Refrigerantes', unidade_padrao: 'un', descricao: 'Refrigerante Fanta Laranja 2 litros', sinonimos: ['fanta'], uso_tipico: 'venda avulsa', ativo: true },

  // ── BEBIDAS / Cervejas ─────────────────────────────────────────────
  { nome: 'Skol Lata 350ml', categoria: 'Bebidas', subcategoria: 'Cervejas', unidade_padrao: 'un', descricao: 'Cerveja Skol em lata 350ml', sinonimos: ['skol', 'cerveja lata'], uso_tipico: 'venda avulsa', ativo: true },
  { nome: 'Brahma Lata 350ml', categoria: 'Bebidas', subcategoria: 'Cervejas', unidade_padrao: 'un', descricao: 'Cerveja Brahma em lata 350ml', sinonimos: ['brahma', 'cerveja'], uso_tipico: 'venda avulsa', ativo: true },
  { nome: 'Heineken Long Neck', categoria: 'Bebidas', subcategoria: 'Cervejas', unidade_padrao: 'un', descricao: 'Cerveja Heineken long neck 330ml', sinonimos: ['heineken', 'long neck'], uso_tipico: 'venda avulsa, domingo premium', ativo: true },

  // ── BEBIDAS / Águas ────────────────────────────────────────────────
  { nome: 'Água Mineral 500ml', categoria: 'Bebidas', subcategoria: 'Águas', unidade_padrao: 'un', descricao: 'Água mineral sem gás garrafa 500ml', sinonimos: ['agua', 'água'], uso_tipico: 'venda avulsa, refeição', ativo: true },
  { nome: 'Água com Gás 500ml', categoria: 'Bebidas', subcategoria: 'Águas', unidade_padrao: 'un', descricao: 'Água com gás 500ml', sinonimos: ['agua com gas'], uso_tipico: 'venda avulsa', ativo: true },

  // ── DESCARTÁVEIS / Para Delivery ──────────────────────────────────
  { nome: 'Marmitex Isopor G', categoria: 'Descartáveis', subcategoria: 'Para Delivery', unidade_padrao: 'cx', descricao: 'Marmitex de isopor tamanho grande', sinonimos: ['marmitex', 'isopor', 'embalagem delivery'], uso_tipico: 'delivery, quentinha', ativo: true },
  { nome: 'Sacola Plástica', categoria: 'Descartáveis', subcategoria: 'Para Delivery', unidade_padrao: 'cx', descricao: 'Sacola plástica para delivery', sinonimos: ['sacola'], uso_tipico: 'delivery', ativo: true },

  // ── DESCARTÁVEIS / Para Consumo no Local ──────────────────────────
  { nome: 'Copo Descartável 200ml', categoria: 'Descartáveis', subcategoria: 'Para Consumo no Local', unidade_padrao: 'cx', descricao: 'Copo descartável 200ml para água e bebidas', sinonimos: ['copo', 'copinho'], uso_tipico: 'consumo no local', ativo: true },
  { nome: 'Guardanapo de Papel', categoria: 'Descartáveis', subcategoria: 'Para Consumo no Local', unidade_padrao: 'cx', descricao: 'Guardanapo de papel para mesas', sinonimos: ['guardanapo'], uso_tipico: 'mesas, atendimento', ativo: true },

  // ── LIMPEZA / Produtos de Limpeza ─────────────────────────────────
  { nome: 'Detergente Líquido', categoria: 'Limpeza', subcategoria: 'Produtos de Limpeza', unidade_padrao: 'un', descricao: 'Detergente líquido para louças', sinonimos: ['detergente'], uso_tipico: 'limpeza diária', ativo: true },
  { nome: 'Água Sanitária', categoria: 'Limpeza', subcategoria: 'Produtos de Limpeza', unidade_padrao: 'L', descricao: 'Água sanitária para desinfecção', sinonimos: ['sanitaria', 'hipoclorito'], uso_tipico: 'desinfecção, limpeza', ativo: true },
  { nome: 'Desinfetante', categoria: 'Limpeza', subcategoria: 'Produtos de Limpeza', unidade_padrao: 'L', descricao: 'Desinfetante para piso e superfícies', sinonimos: [], uso_tipico: 'limpeza diária', ativo: true },

  // ── LIMPEZA / Insumos da Churrasqueira ───────────────────────────
  { nome: 'Carvão Vegetal', categoria: 'Limpeza', subcategoria: 'Insumos da Churrasqueira', unidade_padrao: 'kg', descricao: 'Carvão vegetal para churrasqueira', sinonimos: ['carvao', 'carvão'], uso_tipico: 'churrasco, buffet fim de semana', ativo: true },
  { nome: 'Sal Grosso', categoria: 'Limpeza', subcategoria: 'Insumos da Churrasqueira', unidade_padrao: 'kg', descricao: 'Sal grosso para temperar carnes na churrasqueira', sinonimos: ['sal grosso churrasco'], uso_tipico: 'tempero churrasco', ativo: true },

  // ── GÁS ───────────────────────────────────────────────────────────
  { nome: 'Gás de Cozinha P13', categoria: 'Gás', subcategoria: 'Botijão P13', unidade_padrao: 'un', descricao: 'Botijão de gás P13 (13kg) para cozinha', sinonimos: ['gas', 'gás', 'botijao', 'p13'], uso_tipico: 'cozinha diária', ativo: true },
  { nome: 'Gás de Cozinha P45', categoria: 'Gás', subcategoria: 'Botijão P45', unidade_padrao: 'un', descricao: 'Botijão de gás P45 (45kg) industrial', sinonimos: ['gas p45', 'gás industrial', 'p45'], uso_tipico: 'cozinha industrial, churrasqueira', ativo: true },
]

export const CATEGORIAS_PADRAO = [
  'Carnes',
  'Secos e Grãos',
  'Hortifruti',
  'Bebidas',
  'Congelados',
  'Descartáveis',
  'Limpeza',
  'Gás',
]
