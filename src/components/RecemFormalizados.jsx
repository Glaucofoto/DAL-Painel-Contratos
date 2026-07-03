import { useMemo, useState } from 'react'
import CardContrato from './CardContrato.jsx'
import { formalizadosPorDia } from '../utils/calculos.js'

function Secao({ titulo, contratos, aberta, aoAlternar }) {
  return (
    <div className="border border-gray-200 bg-white">
      <button
        type="button"
        onClick={aoAlternar}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary">{titulo}</span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-white">
            {contratos.length}
          </span>
        </span>
        <span className="text-gray-400">{aberta ? '−' : '+'}</span>
      </button>

      {aberta && (
        <div className="border-t border-gray-100 p-4">
          {contratos.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhum instrumento formalizado nesta data.
            </p>
          ) : (
            <div className="space-y-3">
              {contratos.map((c) => (
                <CardContrato key={c.id ?? c.numero} contrato={c} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function RecemFormalizados({ contratos }) {
  const grupos = useMemo(() => formalizadosPorDia(contratos), [contratos])
  const [abertas, setAbertas] = useState({ hoje: true, ontem: false, anteontem: false })

  const alternar = (chave) =>
    setAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }))

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Instrumentos formalizados na data atual e nos dois dias anteriores. Como o
        export não traz a data de assinatura, usa-se a data de início da vigência
        como referência de formalização.
      </p>
      <Secao
        titulo="Hoje"
        contratos={grupos.hoje}
        aberta={abertas.hoje}
        aoAlternar={() => alternar('hoje')}
      />
      <Secao
        titulo="Ontem"
        contratos={grupos.ontem}
        aberta={abertas.ontem}
        aoAlternar={() => alternar('ontem')}
      />
      <Secao
        titulo="Anteontem"
        contratos={grupos.anteontem}
        aberta={abertas.anteontem}
        aoAlternar={() => alternar('anteontem')}
      />
    </div>
  )
}
