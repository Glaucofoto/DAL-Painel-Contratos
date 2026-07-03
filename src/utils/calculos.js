import { CONFIG } from '../config/config.js'

// ---------------------------------------------------------------------------
// Cálculos de janelas temporais sobre os instrumentos já normalizados
// (ver utils/planilha.js).
//
// Fuso: os usuários do painel operam em Brasília (UTC-3). Os cálculos usam a
// data local do navegador, que para esse público equivale ao horário de
// Brasília. As datas foram ancoradas ao meio-dia local na normalização para
// evitar erro de um dia por conversão de fuso.
// ---------------------------------------------------------------------------

const UM_DIA_MS = 24 * 60 * 60 * 1000

// Data de "hoje" ancorada à meia-noite local.
export function hoje() {
  const agora = new Date()
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
}

// Diferença em dias inteiros entre uma data e hoje (positivo = futuro).
export function diasAte(data) {
  if (!data) return null
  const alvo = new Date(data.getFullYear(), data.getMonth(), data.getDate())
  return Math.round((alvo.getTime() - hoje().getTime()) / UM_DIA_MS)
}

// Instrumento vigente: sem data de encerramento registrada.
export function estaAtivo(c) {
  return !!c.ativo
}

// --- Janelas de formalização (hoje / ontem / anteontem) --------------------
export function diasDesdeFormalizacao(c) {
  const dias = diasAte(c.dataFormalizacao)
  return dias == null ? null : -dias // 0 = hoje, 1 = ontem, 2 = anteontem
}

export function formalizadosPorDia(contratos) {
  const grupos = { hoje: [], ontem: [], anteontem: [] }
  for (const c of contratos) {
    const d = diasDesdeFormalizacao(c)
    if (d === 0) grupos.hoje.push(c)
    else if (d === 1) grupos.ontem.push(c)
    else if (d === 2) grupos.anteontem.push(c)
  }
  return grupos
}

// --- Janela de vencimento (próximos N dias) --------------------------------
// Instrumentos de vigência indeterminada não têm vencimento e ficam de fora.
export function contratosAVencer(contratos, janela = CONFIG.JANELA_VENCIMENTO_DIAS) {
  return contratos
    .filter((c) => !c.vigenciaIndeterminada)
    .map((c) => ({ ...c, diasParaVencer: diasAte(c.vigenciaFim) }))
    .filter(
      (c) =>
        c.diasParaVencer != null &&
        c.diasParaVencer >= 0 &&
        c.diasParaVencer <= janela,
    )
    .sort((a, b) => a.diasParaVencer - b.diasParaVencer)
}

// Nível do semáforo de urgência.
export function nivelSemaforo(dias) {
  if (dias == null) return 'neutro'
  if (dias <= CONFIG.SEMAFORO.critico) return 'critico'
  if (dias <= CONFIG.SEMAFORO.atencao) return 'atencao'
  return 'ok'
}

// --- Agregações para os gráficos da Visão Geral ----------------------------
export function distribuicaoPorTipo(contratos) {
  const mapa = new Map()
  for (const c of contratos) {
    const atual = mapa.get(c.tipo) || { tipo: c.tipo, quantidade: 0, valor: 0 }
    atual.quantidade += 1
    atual.valor += c.valorGlobal
    mapa.set(c.tipo, atual)
  }
  return [...mapa.values()]
}
