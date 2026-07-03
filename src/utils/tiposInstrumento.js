// ---------------------------------------------------------------------------
// Mapeamento de tipos de instrumento e suas cores.
//
// O campo "tipo" da planilha traz rótulos como "Contrato", "Empenho", "Termo
// Aditivo", "Termo de Adesão", "Acordo de Cooperação Técnica (ACT)", "Termo de
// Execução Descentralizada (TED)", "Credenciamento", "Comodato", "Outros" etc.
//
// A paleta parte do azul e do verde institucionais (cores do Brasil como base)
// e explora âmbar/dourado e tons complementares para dar contraste e leitura
// clara nos gráficos — as cores do Brasil são prioridade, não exclusividade.
// Tipos não previstos recebem a cor padrão (cinza-azulado).
// ---------------------------------------------------------------------------

const PADRAO = '#64748B'

// Paleta qualitativa institucional (azul/verde na frente, âmbar e complementares
// para distinção). Usada em séries de gráfico e como fallback por índice.
export const PALETA_GRAFICO = [
  '#1A3A6B', // azul institucional
  '#2D7A4F', // verde institucional
  '#D9A404', // dourado/âmbar
  '#0F766E', // teal
  '#B45309', // âmbar escuro
  '#3B6BA5', // azul médio
  '#6BA368', // verde claro
  '#8C6D1F', // ocre
  '#5B7FB0', // azul acinzentado
  PADRAO, // cinza-azulado
]

// Chaves normalizadas (minúsculas, sem acento) → cor.
const CORES = {
  contrato: '#1A3A6B', // azul institucional
  empenho: '#2D7A4F', // verde institucional
  'termo aditivo': '#D9A404', // dourado/âmbar — destaque para aditivos/prorrogações
  'termo de apostilamento': '#B45309', // âmbar escuro
  'acordo de cooperacao tecnica (act)': '#0F766E', // teal
  act: '#0F766E',
  'termo de execucao descentralizada (ted)': '#3B6BA5', // azul médio
  ted: '#3B6BA5',
  'termo de adesao': '#6BA368', // verde claro
  credenciamento: '#5B7FB0', // azul acinzentado
  comodato: '#8C6D1F', // ocre
  outros: PADRAO,
}

// Cores fixas das faixas de produção (aba Produção), coerentes com o mapa acima.
export const CORES_FAIXA = {
  Contratos: '#1A3A6B',
  Empenhos: '#2D7A4F',
  Aditivos: '#D9A404',
  Outros: '#64748B',
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
