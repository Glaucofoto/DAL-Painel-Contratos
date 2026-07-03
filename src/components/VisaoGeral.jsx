import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import CardIndicador from './CardIndicador.jsx'
import {
  agruparPorCampo,
  contratosAVencer,
  distribuicaoPorTipo,
  estaAtivo,
  formalizadosPorDia,
  prorrogaveisAVencer,
} from '../utils/calculos.js'
import { corPorIndice, corTipo } from '../utils/tiposInstrumento.js'
import { formatarMoeda, formatarPercentual } from '../utils/formatters.js'

function moedaCompacta(valor) {
  if (valor >= 1_000_000) return `R$ ${(valor / 1_000_000).toFixed(1).replace('.', ',')} mi`
  if (valor >= 1_000) return `R$ ${(valor / 1_000).toFixed(0)} mil`
  return formatarMoeda(valor)
}

export default function VisaoGeral({ contratos }) {
  const resumo = useMemo(() => {
    const ativos = contratos.filter(estaAtivo)
    const grupos = formalizadosPorDia(contratos)
    const formalizadosHoje = grupos.hoje.length
    const ultimos2 = grupos.ontem.length + grupos.anteontem.length
    const aVencer = contratosAVencer(contratos)
    const prorrogaveis = aVencer.filter((c) => c.prorrogavel).length
    const naoProrrogaveis = aVencer.length - prorrogaveis
    const prorrogaveis60 = prorrogaveisAVencer(contratos, 60).length

    const porTipo = distribuicaoPorTipo(contratos)
    const total = contratos.length || 1
    const pizza = porTipo
      .map((t) => ({ ...t, percentual: (t.quantidade / total) * 100 }))
      .sort((a, b) => b.quantidade - a.quantidade)
    const barras = [...porTipo].sort((a, b) => b.valor - a.valor)
    // Top modalidades por valor (limita a 8 para leitura).
    const modalidades = agruparPorCampo(contratos, 'modalidade').slice(0, 8)

    return {
      ativos: ativos.length,
      formalizadosHoje,
      ultimos2,
      aVencerTotal: aVencer.length,
      prorrogaveis,
      naoProrrogaveis,
      prorrogaveis60,
      pizza,
      barras,
      modalidades,
    }
  }, [contratos])

  return (
    <div className="space-y-6">
      {/* Cards de totais */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CardIndicador rotulo="Instrumentos ativos" valor={resumo.ativos} />
        <CardIndicador rotulo="Formalizados hoje" valor={resumo.formalizadosHoje} />
        <CardIndicador
          rotulo="Formalizados (últimos 2 dias)"
          valor={resumo.ultimos2}
        />
        <CardIndicador
          rotulo="Vencendo em 30 dias"
          valor={resumo.aVencerTotal}
        />
      </div>

      {/* Destaques de vencimento */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="border border-danger bg-danger-bg p-4">
          <p className="text-sm font-semibold text-danger">
            {resumo.aVencerTotal === 0
              ? 'Nenhum contrato vence nos próximos 30 dias.'
              : `${resumo.aVencerTotal} contrato(s) vencem nos próximos 30 dias.`}
          </p>
          {resumo.aVencerTotal > 0 && (
            <p className="mt-1 text-xs text-gray-600">
              {resumo.prorrogaveis} prorrogável(is) · {resumo.naoProrrogaveis} não
              prorrogável(is)
            </p>
          )}
        </div>
        <div className="border border-warning bg-[#FFFBEB] p-4">
          <p className="text-sm font-semibold text-warning">
            {resumo.prorrogaveis60 === 0
              ? 'Nenhum prorrogável vence nos próximos 60 dias.'
              : `${resumo.prorrogaveis60} contrato(s) prorrogável(is) vencem nos próximos 60 dias.`}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Janela ampliada para antecipar a instrução das prorrogações (ver aba
            Prorrogáveis).
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-primary">
            Distribuição por tipo de instrumento
          </h3>
          {resumo.pizza.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">Sem dados.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={resumo.pizza}
                  dataKey="quantidade"
                  nameKey="tipo"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={1}
                >
                  {resumo.pizza.map((t) => (
                    <Cell key={t.tipo} fill={corTipo(t.tipo)} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(valor, _nome, item) => [
                    `${valor} (${formatarPercentual(item.payload.percentual)})`,
                    item.payload.tipo,
                  ]}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(_v, _e, i) => {
                    const t = resumo.pizza[i]
                    return `${t.tipo}: ${t.quantidade} (${formatarPercentual(t.percentual)})`
                  }}
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-primary">
            Valor contratado por tipo
          </h3>
          {resumo.barras.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">Sem dados.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, resumo.barras.length * 48)}>
              <BarChart
                data={resumo.barras}
                layout="vertical"
                margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
              >
                <XAxis type="number" tickFormatter={moedaCompacta} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="tipo"
                  width={110}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={(valor) => formatarMoeda(valor)} />
                <Bar dataKey="valor" radius={[0, 3, 3, 0]}>
                  {resumo.barras.map((t) => (
                    <Cell key={t.tipo} fill={corTipo(t.tipo)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Valor por modalidade de contratação */}
      <div className="border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-primary">
          Valor por modalidade de contratação
        </h3>
        {resumo.modalidades.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">Sem dados.</p>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={Math.max(200, resumo.modalidades.length * 44)}
          >
            <BarChart
              data={resumo.modalidades}
              layout="vertical"
              margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
            >
              <XAxis type="number" tickFormatter={moedaCompacta} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="rotulo" width={130} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(valor, _n, item) => [
                  `${formatarMoeda(valor)} · ${item.payload.quantidade} instrumento(s)`,
                  item.payload.rotulo,
                ]}
              />
              <Bar dataKey="valor" radius={[0, 3, 3, 0]}>
                {resumo.modalidades.map((m, i) => (
                  <Cell key={m.rotulo} fill={corPorIndice(i)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Nota metodológica */}
      <p className="border-t border-gray-200 pt-4 text-xs leading-relaxed text-gray-500">
        <strong className="text-gray-600">Nota metodológica.</strong> Os números
        refletem a última planilha exportada do Contratos.gov.br (Comprasnet
        Contratos) para a UASG 110120 e importada neste painel. As janelas temporais
        (hoje, últimos 2 dias, próximos 30 dias) são calculadas no navegador a partir
        da data atual (horário de Brasília). "Instrumentos ativos" considera os que
        não têm data de encerramento; "formalizados" usa a data de início da vigência
        (a planilha não traz a data de assinatura). Reimporte a planilha para
        atualizar e confirme informações críticas na fonte oficial.
      </p>
    </div>
  )
}
