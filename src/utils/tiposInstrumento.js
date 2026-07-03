// ---------------------------------------------------------------------------
// Mapeamento de tipos de instrumento e suas cores.
//
// O campo "tipo" da API do Contratos.gov.br traz rótulos como "Contrato",
// "Termo Aditivo", "Empenho", "Termo de Adesão", "Credenciamento",
// "Comodato", "Termo de Execução Descentralizada (TED)", "Outros" etc.
// A paleta é derivada do azul e do verde institucionais, com tons distintos
// para leitura em gráficos e badges. Tipos não previstos recebem a cor
// padrão (cinza-azulado), mantendo a consistência visual.
// ---------------------------------------------------------------------------

const PADRAO = '#64748B'

// Chaves normalizadas (minúsculas, sem acento) → cor.
const CORES = {
  contrato: '#1A3A6B', // azul institucional
  'termo aditivo': '#2D7A4F', // verde institucional
  empenho: '#3B6BA5', // azul médio
  'termo de adesao': '#4C9A6B', // verde médio
  credenciamento: '#5B7FB0', // azul acinzentado
  comodato: '#7FA88E', // verde acinzentado
  'termo de execucao descentralizada (ted)': '#8AA4C8', // azul claro
  ted: '#8AA4C8',
  'termo de cooperacao': '#A3C2AE', // verde claro
  outros: PADRAO,
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

// Paleta ordenada para uso genérico em séries de gráfico quando o tipo é
// desconhecido (mantém tons azul/verde institucionais).
export const PALETA_GRAFICO = [
  '#1A3A6B',
  '#2D7A4F',
  '#3B6BA5',
  '#4C9A6B',
  '#5B7FB0',
  '#7FA88E',
  '#8AA4C8',
  '#A3C2AE',
  PADRAO,
]
