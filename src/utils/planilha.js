import * as XLSX from 'xlsx'
import { parseData, parseValorBR } from './formatters.js'

// ---------------------------------------------------------------------------
// Leitura e normalização da planilha exportada do Contratos.gov.br.
//
// O export ("Contratos :: Contratos.gov.br") traz uma linha de título antes do
// cabeçalho, então detectamos a linha de cabeçalho pela coluna "Número do
// instrumento". As colunas são casadas por nome normalizado (tolerante a
// acento, espaço e pontuação), de modo que pequenas variações no export não
// quebrem a importação. Todo o processamento ocorre no navegador — o arquivo
// nunca é enviado a um servidor.
// ---------------------------------------------------------------------------

function normalizarTexto(t) {
  return String(t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// Cabeçalho normalizado → campo interno.
const CAMPOS = {
  'numero do instrumento': 'numero',
  'unidades requisitantes': 'unidadeRequisitante',
  tipo: 'tipo',
  categoria: 'categoria',
  fornecedor: 'fornecedor',
  processo: 'processo',
  objeto: 'objeto',
  'vig inicio': 'vigInicio',
  'vig fim': 'vigFim',
  'valor global': 'valorGlobal',
  'num parcelas': 'numParcelas',
  'valor parcela': 'valorParcela',
  prorrogavel: 'prorrogavel',
  'modalidade da compra': 'modalidade',
  'antecipa gov': 'antecipaGov',
  'atualizado em': 'atualizadoEm',
  'data encerramento': 'dataEncerramento',
}

function acharCabecalho(linhas) {
  for (let i = 0; i < Math.min(linhas.length, 15); i += 1) {
    const norm = (linhas[i] || []).map(normalizarTexto)
    if (norm.includes('numero do instrumento')) return i
  }
  return -1
}

function separarFornecedor(valor) {
  const texto = String(valor || '').trim()
  const sep = texto.indexOf(' - ')
  if (sep > 0) {
    return { doc: texto.slice(0, sep).trim(), nome: texto.slice(sep + 3).trim() }
  }
  return { doc: '', nome: texto }
}

function normalizarInstrumento(obj, indice) {
  const { doc, nome } = separarFornecedor(obj.fornecedor)
  const dataEncerramento = parseData(obj.dataEncerramento)
  const vigFimTexto = String(obj.vigFim || '').trim()
  const vigenciaFim = parseData(obj.vigFim)
  const parcelasNum = Number(String(obj.numParcelas || '').replace(/\D/g, ''))
  const tipo = String(obj.tipo || '').trim() || 'Não informado'

  const ativo = !dataEncerramento

  return {
    id: indice,
    numero: String(obj.numero || '—').trim(),
    tipo,
    isEmpenho: normalizarTexto(tipo) === 'empenho',
    categoria: String(obj.categoria || '').trim(),
    unidadeRequisitante: String(obj.unidadeRequisitante || '').trim(),
    objeto: String(obj.objeto || '').trim(),
    processo: String(obj.processo || '').trim(),
    modalidade: String(obj.modalidade || '').trim(),
    antecipaGov: String(obj.antecipaGov || '').trim(),
    fornecedorNome: nome || '—',
    fornecedorDoc: doc,
    prorrogavel: normalizarTexto(obj.prorrogavel) === 'sim',
    vigenciaInicio: parseData(obj.vigInicio),
    vigenciaFim,
    // "Indeterminado" é uma situação real de contratos de fornecimento contínuo.
    vigenciaIndeterminada: /^indeterminad/i.test(vigFimTexto),
    valorGlobal: parseValorBR(obj.valorGlobal),
    valorParcela: parseValorBR(obj.valorParcela),
    numParcelas: Number.isFinite(parcelasNum) && parcelasNum > 0 ? parcelasNum : null,
    dataEncerramento,
    atualizadoEm: parseData(obj.atualizadoEm),
    ativo,
    situacao: ativo ? 'Ativo' : 'Encerrado',
    // Data de formalização: a planilha não traz assinatura/publicação, então
    // usamos a Vig. Início como referência (ver README / nota metodológica).
    dataFormalizacao: parseData(obj.vigInicio),
    // O export não fornece o id interno do contrato, então não há link direto
    // por instrumento; o acesso ao sistema fica na tela de importação.
    linkExterno: null,
    raw: obj,
  }
}

// Re-normaliza uma lista de linhas cruas (campos-string já mapeados). Usada
// tanto na importação quanto ao reidratar do armazenamento local — como as
// datas são re-parseadas a cada chamada, não há problema de serialização de
// objetos Date.
export function normalizarLista(linhasCruas) {
  return (linhasCruas || []).map((obj, i) => normalizarInstrumento(obj, i))
}

// Lê um arquivo .xlsx/.csv e devolve { instrumentos, linhasCruas }.
// - instrumentos: objetos normalizados prontos para a UI.
// - linhasCruas: os campos-string mapeados, para persistir e reidratar depois.
// Lança Error com mensagem amigável quando o formato não é reconhecido.
export async function lerPlanilha(file) {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array', cellDates: false })
  const ws = wb.Sheets[wb.SheetNames[0]]
  if (!ws) throw new Error('A planilha está vazia ou em formato não reconhecido.')

  // raw:false → valores como exibidos (datas em DD/MM/AAAA, valores "R$ ...").
  const linhas = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' })
  const iCab = acharCabecalho(linhas)
  if (iCab < 0) {
    throw new Error(
      'Não encontrei o cabeçalho esperado (coluna "Número do instrumento"). ' +
        'Confirme que é o export de Contratos do Contratos.gov.br.',
    )
  }

  const cabecalho = linhas[iCab].map(normalizarTexto)
  // índice de coluna → campo interno
  const indiceCampo = cabecalho.map((h) => CAMPOS[h] || null)

  const linhasCruas = []
  for (let i = iCab + 1; i < linhas.length; i += 1) {
    const linha = linhas[i] || []
    // Ignora linhas totalmente vazias (rodapés/linhas em branco do export).
    if (linha.every((c) => String(c || '').trim() === '')) continue
    const obj = {}
    indiceCampo.forEach((campo, col) => {
      if (campo) obj[campo] = linha[col]
    })
    if (!String(obj.numero || '').trim()) continue
    linhasCruas.push(obj)
  }

  if (linhasCruas.length === 0) {
    throw new Error('Nenhum instrumento foi lido da planilha.')
  }
  return { instrumentos: normalizarLista(linhasCruas), linhasCruas }
}
