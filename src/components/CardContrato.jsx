import { useState } from 'react'
import { corTipo, rotuloTipo } from '../utils/tiposInstrumento.js'
import { formatarData, formatarMoeda, textoContagem } from '../utils/formatters.js'
import { situacaoInstrumento } from '../utils/calculos.js'
import { corSemaforo } from './SemaforoVencimento.jsx'

// Cores da etiqueta de situação, coerentes com o card "Instrumentos vigentes".
const CORES_SITUACAO = {
  Vigente: '#2D7A4F', // verde
  Expirado: '#B45309', // âmbar — venceu, mas não foi encerrado
  Encerrado: '#64748B', // cinza
  'A iniciar': '#3B6BA5', // azul
}

// Card de instrumento reutilizado em várias abas.
// Props opcionais controlam realces contextuais:
//   - mostrarVencimento: exibe contagem regressiva e barra lateral do semáforo
//   - mostrarProrrogacao: exibe o aviso "Requer decisão de prorrogação"
//   - dias / diasParaInstrucao: contagem regressiva e prazo sugerido
export default function CardContrato({
  contrato,
  mostrarVencimento = false,
  mostrarProrrogacao = false,
  dias = null,
  diasParaInstrucao = null,
}) {
  const [aberto, setAberto] = useState(false)
  const situacao = situacaoInstrumento(contrato)
  const objeto = contrato.objeto || 'Objeto não informado.'
  const longo = objeto.length > 160
  const objetoExibido = aberto || !longo ? objeto : `${objeto.slice(0, 160).trimEnd()}…`

  const barra = mostrarVencimento ? corSemaforo(dias) : undefined

  return (
    <article
      className="border border-gray-200 bg-white p-4"
      style={barra ? { borderLeft: `4px solid ${barra}` } : undefined}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <span
            className="inline-block rounded px-2 py-0.5 text-xs font-semibold text-white"
            style={{ backgroundColor: corTipo(contrato.tipo) }}
          >
            {rotuloTipo(contrato.tipo)}
          </span>
          <h3 className="mt-1.5 text-sm font-bold text-primary">
            Instrumento nº {contrato.numero}
          </h3>
        </div>
        {mostrarVencimento && dias != null && (
          <span
            className="shrink-0 text-xs font-semibold"
            style={{ color: corSemaforo(dias) }}
          >
            {textoContagem(dias)}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm leading-snug text-ink">
        {objetoExibido}
        {longo && (
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            className="ml-1 text-xs font-medium text-secondary hover:underline"
          >
            {aberto ? 'menos' : 'mais'}
          </button>
        )}
      </p>

      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
        <Info rotulo="Fornecedor">
          {contrato.fornecedorNome}
          {contrato.fornecedorDoc ? ` — ${contrato.fornecedorDoc}` : ''}
        </Info>
        <Info rotulo="Vigência">
          {formatarData(contrato.vigenciaInicio)} —{' '}
          {contrato.vigenciaIndeterminada
            ? 'Indeterminado'
            : formatarData(contrato.vigenciaFim)}
        </Info>
        <Info rotulo="Valor global">{formatarMoeda(contrato.valorGlobal)}</Info>
        <Info rotulo="Modalidade">{contrato.modalidade || '—'}</Info>
        <Info rotulo="Situação">
          <span className="font-semibold" style={{ color: CORES_SITUACAO[situacao] }}>
            {situacao}
          </span>
        </Info>
        <Info rotulo="Prorrogável">{contrato.prorrogavel ? 'Sim' : 'Não'}</Info>
      </dl>

      {mostrarProrrogacao && (
        <div className="mt-3 border-l-4 border-warning bg-[#FFFBEB] px-3 py-2">
          <p className="text-xs font-semibold text-warning">
            Requer decisão de prorrogação
          </p>
          {diasParaInstrucao != null && (
            <p className="mt-0.5 text-xs text-gray-600">
              {diasParaInstrucao <= 0
                ? 'Prazo de antecedência para instrução já ultrapassado — priorizar.'
                : `Iniciar a instrução em até ${diasParaInstrucao} dia(s) para respeitar a antecedência recomendada.`}
            </p>
          )}
        </div>
      )}

      {contrato.linkExterno && (
        <div className="mt-3">
          <a
            href={contrato.linkExterno}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-secondary hover:underline"
          >
            Ver no Contratos.gov.br ↗
          </a>
        </div>
      )}
    </article>
  )
}

function Info({ rotulo, children }) {
  return (
    <div className="min-w-0">
      <dt className="font-medium uppercase tracking-wide text-gray-400">{rotulo}</dt>
      <dd className="break-words text-ink">{children}</dd>
    </div>
  )
}
