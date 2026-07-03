import { nivelSemaforo } from '../utils/calculos.js'

// Cores por nível de urgência, alinhadas à identidade visual DAL.
const ESTILOS = {
  critico: { cor: '#CC2020', rotulo: 'Crítico' },
  atencao: { cor: '#B45309', rotulo: 'Atenção' },
  ok: { cor: '#2D7A4F', rotulo: 'No prazo' },
  neutro: { cor: '#64748B', rotulo: '—' },
}

// Faixa/etiqueta de urgência. Se `apenasFaixa` for true, renderiza só a barra
// lateral colorida (usada na borda do card).
export function corSemaforo(dias) {
  return ESTILOS[nivelSemaforo(dias)].cor
}

export default function SemaforoVencimento({ dias }) {
  const estilo = ESTILOS[nivelSemaforo(dias)]
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold"
      style={{ color: estilo.cor }}
    >
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: estilo.cor }}
        aria-hidden="true"
      />
      {estilo.rotulo}
    </span>
  )
}
