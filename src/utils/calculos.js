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

// Instrumento sem encerramento formal (Data Encerramento vazia). Reflete a
// coluna do export, mas inclui contratos já vencidos que não foram encerrados.
export function estaAtivo(c) {
  return !!c.ativo
}

// Instrumento EM VIGOR hoje: não encerrado, já iniciado e ainda dentro da
// vigência (ou de vigência indeterminada). É o que melhor reflete a situação
// real da carteira — bem menor que o total "sem encerramento".
export function estaVigente(c) {
  if (c.dataEncerramento) return false
  const dInicio = diasAte(c.vigenciaInicio)
  if (dInicio != null && dInicio > 0) return false // começa no futuro
  if (c.vigenciaIndeterminada) return true
  const dFim = diasAte(c.vigenciaFim)
  return dFim != null && dFim >= 0 // vence hoje ou depois
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

// Prorrogáveis vencendo dentro de uma janela (subconjunto de contratosAVencer).
export function prorrogaveisAVencer(contratos, janela = CONFIG.JANELA_VENCIMENTO_DIAS) {
  return contratosAVencer(contratos, janela).filter((c) => c.prorrogavel)
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

// Agregação genérica por um campo textual (ex.: modalidade, categoria).
export function agruparPorCampo(contratos, campo, rotuloVazio = 'Não informado') {
  const mapa = new Map()
  for (const c of contratos) {
    const chave = String(c[campo] || '').trim() || rotuloVazio
    const atual = mapa.get(chave) || { rotulo: chave, quantidade: 0, valor: 0 }
    atual.quantidade += 1
    atual.valor += c.valorGlobal
    mapa.set(chave, atual)
  }
  return [...mapa.values()].sort((a, b) => b.valor - a.valor)
}

// ---------------------------------------------------------------------------
// Produção da área (por ano de formalização).
//
// "Formalização" usa a data de início da vigência (a planilha não traz a data
// de assinatura). Os instrumentos são agrupados em quatro faixas para leitura
// gerencial: Contratos, Empenhos, Aditivos (Termos Aditivos / Apostilamentos —
// proxy de prorrogações e alterações) e Outros.
// ---------------------------------------------------------------------------
const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function faixaProducao(c) {
  const t = normalizar(c.tipo)
  if (/aditiv|apostila/.test(t)) return 'Aditivos'
  if (c.isEmpenho || t === 'empenho') return 'Empenhos'
  if (t === 'contrato') return 'Contratos'
  return 'Outros'
}

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

// Anos presentes na base (por data de formalização), do mais recente ao mais antigo.
export function anosFormalizacao(contratos) {
  const anos = new Set()
  for (const c of contratos) {
    if (c.dataFormalizacao) anos.add(c.dataFormalizacao.getFullYear())
  }
  return [...anos].sort((a, b) => b - a)
}

export function producaoAno(contratos, ano) {
  const doAno = contratos.filter(
    (c) => c.dataFormalizacao && c.dataFormalizacao.getFullYear() === ano,
  )

  const faixas = { Contratos: 0, Empenhos: 0, Aditivos: 0, Outros: 0 }
  const porMes = MESES_CURTOS.map((mes) => ({
    mes,
    Contratos: 0,
    Empenhos: 0,
    Aditivos: 0,
    Outros: 0,
  }))
  let valorTotal = 0

  for (const c of doAno) {
    const faixa = faixaProducao(c)
    faixas[faixa] += 1
    valorTotal += c.valorGlobal
    porMes[c.dataFormalizacao.getMonth()][faixa] += 1
  }

  return {
    ano,
    total: doAno.length,
    valorTotal,
    faixas,
    porMes,
    porTipo: distribuicaoPorTipo(doAno).sort((a, b) => b.quantidade - a.quantidade),
  }
}
