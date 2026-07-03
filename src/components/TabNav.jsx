const ABAS = [
  { id: 'visao', rotulo: 'Visão Geral' },
  { id: 'recem', rotulo: 'Recém-Formalizados' },
  { id: 'vencer', rotulo: 'A Vencer' },
  { id: 'prorrogaveis', rotulo: 'Prorrogáveis' },
  { id: 'empenhos', rotulo: 'Empenhos' },
]

export default function TabNav({ abaAtiva, aoMudar }) {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
        {ABAS.map((aba) => {
          const ativa = aba.id === abaAtiva
          return (
            <button
              key={aba.id}
              type="button"
              onClick={() => aoMudar(aba.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                ativa
                  ? 'border-primary font-semibold text-primary'
                  : 'border-transparent text-gray-500 hover:text-primary'
              }`}
            >
              {aba.rotulo}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
