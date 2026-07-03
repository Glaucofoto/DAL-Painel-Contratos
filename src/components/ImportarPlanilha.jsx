import { useRef, useState } from 'react'
import { URL_CONTRATOS_LOGIN } from '../config/config.js'

const PASSOS = [
  'Acesse o Contratos.gov.br e faça login (gov.br ou e-mail e senha).',
  'No menu Contratos, filtre pela sua UASG (110120) e pelos instrumentos desejados.',
  'Clique em Exportar / Baixar planilha e salve o arquivo (.xlsx ou .csv).',
  'Volte aqui e importe o arquivo no campo abaixo.',
]

export default function ImportarPlanilha({
  onImportar,
  importando,
  erro,
  podeVoltar = false,
  onVoltar,
}) {
  const inputRef = useRef(null)
  const [arraste, setArraste] = useState(false)

  function selecionar(file) {
    if (file) onImportar(file)
  }

  function aoSoltar(e) {
    e.preventDefault()
    setArraste(false)
    const file = e.dataTransfer.files?.[0]
    selecionar(file)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-primary">Importar planilha de contratos</h2>
        <p className="mt-1 text-sm text-gray-600">
          Este painel é alimentado por uma planilha exportada do Contratos.gov.br.
        </p>
      </div>

      {/* Por que não é automático */}
      <div className="border-l-4 border-secondary bg-panel p-4">
        <p className="text-sm font-semibold text-primary">Por que a carga não é automática?</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">
          Os contratos da UASG 110120 não são publicados na base pública de dados
          abertos (nem no PNCP) — eles existem apenas no sistema transacional do
          Contratos.gov.br, que exige login individual. Por isso a atualização é
          feita pelo próprio gestor, exportando a planilha e importando aqui. O
          arquivo é processado no seu navegador e não é enviado a nenhum servidor.
        </p>
      </div>

      {/* Passo a passo */}
      <div>
        <p className="mb-2 text-sm font-semibold text-primary">Passo a passo</p>
        <ol className="space-y-2">
          {PASSOS.map((passo, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                {i + 1}
              </span>
              <span className="pt-0.5">{passo}</span>
            </li>
          ))}
        </ol>
        <a
          href={URL_CONTRATOS_LOGIN}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block bg-secondary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          Abrir o Contratos.gov.br ↗
        </a>
      </div>

      {/* Área de upload */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setArraste(true)
        }}
        onDragLeave={() => setArraste(false)}
        onDrop={aoSoltar}
        className={`flex flex-col items-center justify-center border-2 border-dashed px-4 py-10 text-center transition-colors ${
          arraste ? 'border-primary bg-panel' : 'border-gray-300 bg-white'
        }`}
      >
        <p className="text-sm text-gray-600">
          Arraste a planilha aqui ou
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={importando}
          className="mt-3 bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#142d54] disabled:opacity-50"
        >
          {importando ? 'Lendo planilha...' : 'Selecionar arquivo'}
        </button>
        <p className="mt-2 text-xs text-gray-400">Formatos aceitos: .xlsx e .csv</p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => selecionar(e.target.files?.[0])}
        />
      </div>

      {erro && (
        <p className="border border-danger bg-danger-bg px-3 py-2 text-sm text-danger">
          {erro}
        </p>
      )}

      {podeVoltar && (
        <button
          type="button"
          onClick={onVoltar}
          className="text-sm text-gray-500 underline hover:text-gray-700"
        >
          ← Voltar aos dados atuais
        </button>
      )}
    </div>
  )
}
