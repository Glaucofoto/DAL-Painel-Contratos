import { useMemo } from 'react'
import CardContrato from './CardContrato.jsx'
import { contratosAVencer } from '../utils/calculos.js'
import { CONFIG } from '../config/config.js'

export default function AVencer({ contratos }) {
  const lista = useMemo(() => contratosAVencer(contratos), [contratos])

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 bg-panel p-4">
        <p className="text-sm font-semibold text-primary">
          {lista.length === 0
            ? `Nenhum contrato vence nos próximos ${CONFIG.JANELA_VENCIMENTO_DIAS} dias.`
            : `${lista.length} contrato(s) vencem nos próximos ${CONFIG.JANELA_VENCIMENTO_DIAS} dias.`}
        </p>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>
            <span className="mr-1 inline-block h-2 w-2 rounded-full align-middle" style={{ backgroundColor: '#CC2020' }} />
            até {CONFIG.SEMAFORO.critico} dias
          </span>
          <span>
            <span className="mr-1 inline-block h-2 w-2 rounded-full align-middle" style={{ backgroundColor: '#B45309' }} />
            {CONFIG.SEMAFORO.critico + 1}–{CONFIG.SEMAFORO.atencao} dias
          </span>
          <span>
            <span className="mr-1 inline-block h-2 w-2 rounded-full align-middle" style={{ backgroundColor: '#2D7A4F' }} />
            {CONFIG.SEMAFORO.atencao + 1}–{CONFIG.JANELA_VENCIMENTO_DIAS} dias
          </span>
        </p>
      </div>

      {lista.length > 0 && (
        <div className="space-y-3">
          {lista.map((c) => (
            <CardContrato
              key={c.id ?? c.numero}
              contrato={c}
              mostrarVencimento
              dias={c.diasParaVencer}
            />
          ))}
        </div>
      )}
    </div>
  )
}
