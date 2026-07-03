const moedaBR = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
})

// Converte o valor monetário no formato brasileiro da API ("214.167,36" ou
// número) para Number. Retorna 0 quando não há valor utilizável.
export function parseValorBR(valor) {
  if (valor == null) return 0
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : 0
  const limpo = String(valor)
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  const numero = Number(limpo)
  return Number.isFinite(numero) ? numero : 0
}

export function formatarMoeda(valor) {
  const numero = Number(valor)
  if (!Number.isFinite(numero)) return '—'
  return moedaBR.format(numero)
}

// Converte uma data em Date no fuso local, ancorada ao meio-dia para evitar
// deslocamento de dia por fuso horário. Aceita:
//   - "DD/MM/AAAA" e "DD/MM/AAAA HH:MM" (formato da planilha do Contratos.gov)
//   - "AAAA-MM-DD" (ISO)
//   - objetos Date
// Retorna null para vazio, "Indeterminado" ou valor inválido.
export function parseData(valor) {
  if (!valor) return null
  if (valor instanceof Date) return Number.isNaN(valor.getTime()) ? null : valor
  const texto = String(valor).trim()
  if (!texto || /^indeterminad/i.test(texto)) return null

  let m = texto.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0)

  m = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 12, 0, 0)

  const data = new Date(texto)
  return Number.isNaN(data.getTime()) ? null : data
}

export function formatarData(valor) {
  const data = valor instanceof Date ? valor : parseData(valor)
  if (!data || Number.isNaN(data.getTime())) return '—'
  return data.toLocaleDateString('pt-BR')
}

export function formatarDataHora(iso) {
  if (!iso) return '—'
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return '—'
  return `${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

export function truncar(texto, limite = 80) {
  if (!texto) return ''
  if (texto.length <= limite) return texto
  return `${texto.slice(0, limite).trimEnd()}…`
}

export function formatarPercentual(valor, casas = 1) {
  const numero = Number(valor)
  if (!Number.isFinite(numero)) return '—'
  return `${numero.toFixed(casas).replace('.', ',')}%`
}

// "vence em X dias" / "vence hoje" / "venceu há X dias".
export function textoContagem(dias) {
  if (dias == null || Number.isNaN(dias)) return '—'
  if (dias === 0) return 'vence hoje'
  if (dias === 1) return 'vence amanhã'
  if (dias > 1) return `vence em ${dias} dias`
  if (dias === -1) return 'venceu ontem'
  return `venceu há ${Math.abs(dias)} dias`
}
