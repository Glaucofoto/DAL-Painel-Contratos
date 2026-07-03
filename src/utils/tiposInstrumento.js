// ---------------------------------------------------------------------------
// Mapeamento de tipos de instrumento e suas cores.
//
// O campo "tipo" da planilha traz rótulos como "Contrato", "Empenho", "Termo
// Aditivo", "Termo de Adesão", "Acordo de Cooperação Técnica (ACT)", "Termo de
// Execução Descentralizada (TED)", "Credenciamento", "Comodato", "Outros" etc.
//
// A paleta parte do azul e do verde institucionais (cores do Brasil como base)
// e explora variações de azul e verde, âmbar/dourado, teal, vermelho, roxo e
// grafite (quase preto) para dar contraste e leitura clara — objetivo
// pedagógico: cada categoria com uma cor distinta e fácil de diferenciar. As
// cores do Brasil são prioridade, não exclusividade. Tipos não previstos
// recebem a cor padrão (cinza-azulado).
// ---------------------------------------------------------------------------

const PADRAO = '#64748B'

// Paleta qualitativa ampla (12 cores) — distinção máxima em pizzas/barras com
// muitas categorias. Ordem pensada para que fatias vizinhas contrastem.
export const PALETA_GRAFICO = [
  '#1A3A6B', // azul institucional (escuro)
  '#2D7A4F', // verde institucional
  '#D9A404', // dourado/âmbar
  '#0F766E', // teal
  '#B45309', // laranja/âmbar escuro
  '#3B6BA5', // azul médio
  '#6BA368', // verde claro
  '#9B2C2C', // vermelho/vinho
  '#6D28D9', // roxo
  '#1F2937', // grafite (quase preto)
  '#14B8A6', // turquesa
  '#A16207', // mostarda
]

// Chaves normalizadas (minúsculas, sem acento) → cor.
const CORES = {
  contrato: '#1A3A6B', // azul institucional
  empenho: '#2D7A4F', // verde institucional
  'termo aditivo': '#D9A404', // dourado — destaque para aditivos/prorrogações
  'termo de apostilamento': '#B45309', // âmbar escuro
  'acordo de cooperacao tecnica (act)': '#0F766E', // teal
  act: '#0F766E',
  'termo de execucao descentralizada (ted)': '#3B6BA5', // azul médio
  ted: '#3B6BA5',
  'termo de adesao': '#6BA368', // verde claro
  convenio: '#14B8A6', // turquesa
  credenciamento: '#6D28D9', // roxo
  comodato: '#A16207', // mostarda
  'termo de cooperacao': '#9B2C2C', // vermelho/vinho
  outros: PADRAO,
}

// Cores fixas das faixas de produção (aba Produção), coerentes com o mapa acima.
export const CORES_FAIXA = {
  Contratos: '#1A3A6B',
  Empenhos: '#2D7A4F',
  Aditivos: '#D9A404',
  Outros: '#334155', // grafite/ardósia
}

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

export function rotuloTipo(tipo) {
  const t = String(tipo || '').trim()
  return t.length > 0 ? t : 'Não informado'
}

export function corTipo(tipo) {
  return CORES[normalizar(tipo)] || PADRAO
}

// Cor por índice, para séries sem tipo definido (ex.: modalidades).
export function corPorIndice(i) {
  return PALETA_GRAFICO[i % PALETA_GRAFICO.length]
}
