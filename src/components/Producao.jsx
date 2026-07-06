import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import CardIndicador from './CardIndicador.jsx'
import { anosFormalizacao, producaoAno } from '../utils/calculos.js'
import { corTipo, CORES_FAIXA } from '../utils/tiposInstrumento.js'
import { formatarMoeda } from '../utils/formatters.js'

const FAIXAS = ['Contratos', 'Empenhos', 'Outros']

export default function Producao({ contratos }) {
  const anos = useMemo(() => anosFormalizacao(contratos), [contratos])
  const anoAtual = new Date().getFullYear()
  const [ano, setAno] = useState(() =>
    anos.includes(anoAtual) ? anoAtual : anos[0] ?? anoAtual,
  )

  const dados = useMemo(() => producaoAno(contratos, ano), [contratos, ano])

  return (
    <div className="space-y-6">
      {/* Cabeçalho + seletor de ano */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-primary">Produção da área</h2>
          <p className="text-sm text-gray-600">
            Instrumentos formalizados ao longo do ano selecionado.
          </p>
        </div>
        {anos.length > 0 && (
          <label className="text-xs text-gray-500">
            Ano{' '}
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="ml-1 border border-gray-300 bg-white px-2 py-1.5 text-sm text-ink focus:border-primary focus:outline-none"
            >
              {anos.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Cards de produção */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CardIndicador rotulo="Instrumentos formalizados" valor={dados.total} />
        <CardIndicador rotulo="Contratos" valor={dados.faixas.Contratos} />
        <CardIndicador rotulo="Empenhos emitidos" valor={dados.faixas.Empenhos} />
        <CardIndicador rotulo="Valor formalizado" valor={formatarMoeda(dados.valorTotal)} />
      </div>

      {/* Produção mês a mês (empilhado por faixa) */}
      <div className="border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-primary">
          Instrumentos formalizados por mês — {dados.ano}
        </h3>
        {dados.total === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Nenhum instrumento formalizado em {dados.ano}.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dados.porMes} margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {FAIXAS.map((faixa) => (
                <Bar
                  key={faixa}
                  dataKey={faixa}
                  stackId="prod"
                  fill={CORES_FAIXA[faixa]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Detalhamento por tipo */}
      {dados.porTipo.length > 0 && (
        <div className="border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-primary">
            Formalizações por tipo de instrumento — {dados.ano}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="bg-panel text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 text-right font-medium">Quantidade</th>
                  <th className="px-3 py-2 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dados.porTipo.map((t) => (
                  <tr key={t.tipo}>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-2 text-ink">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: corTipo(t.tipo) }}
                        />
                        {t.tipo}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-primary">
                      {t.quantidade}
                    </td>
                    <td className="px-3 py-2 text-right text-ink">
                      {formatarMoeda(t.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Nota metodológica */}
      <p className="border-t border-gray-200 pt-4 text-xs leading-relaxed text-gray-500">
        <strong className="text-gray-600">Nota.</strong> A produção considera a data
        de início da vigência como referência de formalização (a planilha não traz a
        data de assinatura). Aditivos e prorrogações não são contabilizados: no
        Contratos.gov.br são alterações de um contrato existente, não instrumentos
        próprios, e não aparecem como linhas no export.
      </p>
    </div>
  )
}
