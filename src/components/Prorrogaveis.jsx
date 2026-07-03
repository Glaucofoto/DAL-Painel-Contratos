import { useMemo } from 'react'
import CardContrato from './CardContrato.jsx'
import { contratosAVencer } from '../utils/calculos.js'
import { CONFIG } from '../config/config.js'

export default function Prorrogaveis({ contratos }) {
  const lista = useMemo(
    () => contratosAVencer(contratos).filter((c) => c.prorrogavel),
    [contratos],
  )

  return (
    <div className="space-y-4">
      <div className="border border-danger bg-danger-bg p-4">
        <p className="text-sm font-semibold text-danger">
          {lista.length === 0
            ? `Nenhum contrato prorrogável vence nos próximos ${CONFIG.JANELA_VENCIMENTO_DIAS} dias.`
            : `${lista.length} contrato(s) prorrogável(is) vencem nos próximos ${CONFIG.JANELA_VENCIMENTO_DIAS} dias e requerem análise.`}
        </p>
        <p className="mt-1 text-xs text-gray-600">
          Prorrogação de serviços e fornecimentos contínuos — art. 107 da Lei nº
          14.133/2021; vigência dos contratos — art. 111. Recomenda-se iniciar a
          instrução com antecedência mínima de{' '}
          {CONFIG.ANTECEDENCIA_ALERTA_PRORROGACAO_DIAS} dias do vencimento.
        </p>
      </div>

      {lista.length > 0 && (
        <div className="space-y-3">
          {lista.map((c) => {
            // Prazo sugerido para iniciar a instrução: dias restantes até
            // atingir a antecedência recomendada antes do vencimento.
            const diasParaInstrucao =
              c.diasParaVencer - CONFIG.ANTECEDENCIA_ALERTA_PRORROGACAO_DIAS
            return (
              <CardContrato
                key={c.id ?? c.numero}
                contrato={c}
                mostrarVencimento
                mostrarProrrogacao
                dias={c.diasParaVencer}
                diasParaInstrucao={diasParaInstrucao}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
