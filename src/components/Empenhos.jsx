import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import CardIndicador from './CardIndicador.jsx'
import { formatarData, formatarMoeda } from '../utils/formatters.js'

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// Na planilha do Contratos.gov.br os empenhos vêm como instrumentos próprios
// (Tipo = "Empenho"). Esta aba é montada a partir dessas linhas — não há um
// vínculo explícito empenho→contrato no export, então essa coluna não aparece.
export default function Empenhos({ contratos }) {
  const dados = useMemo(() => {
    const empenhos = contratos.filter((c) => c.isEmpenho)
    const valorTotal = empenhos.reduce((s, e) => s + e.valorGlobal, 0)

    const anoAtual = new Date().getFullYear()
    const porMes = Array.from({ length: 12 }, (_, i) => ({ mes: MESES[i], valor: 0 }))
    for (const e of empenhos) {
      // Data de referência do empenho: início da vigência (data do empenho).
      const data = e.vigenciaInicio || e.atualizadoEm
      if (data && data.getFullYear() === anoAtual) {
        porMes[data.getMonth()].valor += e.valorGlobal
      }
    }

    const ordenados = [...empenhos].sort(
      (a, b) => (b.vigenciaInicio?.getTime() || 0) - (a.vigenciaInicio?.getTime() || 0),
    )
    return { empenhos, valorTotal, porMes, ordenados, anoAtual }
  }, [contratos])

  if (dados.empenhos.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-500">
        Nenhum empenho na planilha importada.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <CardIndicador rotulo="Total de empenhos" valor={dados.empenhos.length} />
        <CardIndicador
          rotulo="Valor total empenhado"
          valor={formatarMoeda(dados.valorTotal)}
        />
      </div>

      <div className="border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-primary">
          Valor empenhado por mês — {dados.anoAtual}
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={dados.porMes} margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
            />
            <Tooltip formatter={(v) => formatarMoeda(v)} />
            <Bar dataKey="valor" fill="#1A3A6B" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto border border-gray-200">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-3 py-2 font-medium">Empenho</th>
              <th className="px-3 py-2 font-medium">Categoria</th>
              <th className="px-3 py-2 font-medium">Credor</th>
              <th className="px-3 py-2 text-right font-medium">Valor</th>
              <th className="px-3 py-2 font-medium">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dados.ordenados.map((e) => (
              <tr key={e.id}>
                <td className="px-3 py-2 font-medium text-primary">{e.numero}</td>
                <td className="px-3 py-2 text-ink">{e.categoria || '—'}</td>
                <td className="px-3 py-2 text-ink">{e.fornecedorNome}</td>
                <td className="px-3 py-2 text-right text-ink">{formatarMoeda(e.valorGlobal)}</td>
                <td className="px-3 py-2 text-ink">{formatarData(e.vigenciaInicio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
