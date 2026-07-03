import { useRef, useState } from 'react'
import { URL_CONTRATOS_LOGIN } from '../config/config.js'

const PASSOS = [
  'Acesse o Contratos.gov.br e faça login (gov.br ou e-mail e senha).',
  'Abra a lista de Contratos da sua unidade (UASG 110120).',
  'Selecione as colunas a exportar — marque TODAS as listadas abaixo (na dúvida, marque todas as colunas disponíveis).',
  'Vá até o FINAL da página e marque "Selecionar todos" / "Todos", para exportar a carteira inteira e não apenas a primeira página.',
  'Clique em Exportar / Baixar planilha e salve o arquivo (.xlsx ou .csv).',
  'Volte aqui e importe o arquivo no campo abaixo.',
]

// Colunas usadas pelo painel e a que servem. Exportar todas garante que os
// cinco painéis apareçam completos; se faltar alguma, o painel correspondente
// fica incompleto ou vazio.
const COLUNAS = [
  { nome: 'Número do instrumento', para: 'identifica cada contrato/empenho — usada em todas as abas' },
  { nome: 'Tipo', para: 'separa Contrato, Empenho, Termo etc. — rosca de distribuição e aba Empenhos' },
  { nome: 'Categoria', para: 'coluna da tabela de empenhos' },
  { nome: 'Fornecedor', para: 'nome e CNPJ nos cards e na tabela' },
  { nome: 'Objeto', para: 'descrição do instrumento nos cards' },
  { nome: 'Processo', para: 'número do processo (referência)' },
  { nome: 'Vig. Início', para: 'base de "Recém-Formalizados" e data dos empenhos' },
  { nome: 'Vig. Fim', para: 'base de "A Vencer", "Prorrogáveis" e do semáforo de urgência' },
  { nome: 'Valor Global', para: 'todos os totais e o gráfico de valor por tipo' },
  { nome: 'Núm. Parcelas', para: 'detalhamento do instrumento' },
  { nome: 'Valor Parcela', para: 'detalhamento do instrumento' },
  { nome: 'Prorrogável', para: 'define a aba "Prorrogáveis"' },
  { nome: 'Modalidade da Compra', para: 'exibida nos cards' },
  { nome: 'Data Encerramento', para: 'define se o instrumento está ativo (vazia = ativo)' },
  { nome: 'Atualizado em', para: 'referência da última atualização no sistema' },
  { nome: 'Unidades Requisitantes', para: 'unidade demandante (complementar)' },
]

export default function ImportarPlanilha({
  onImportar,
  importando,
  erro,
  expirado = false,
  prazoHoras,
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
          Já sabe como exportar? Solte o arquivo abaixo. Primeira vez? As instruções
          estão logo em seguida.
        </p>
      </div>

      {expirado && (
        <div className="border-l-4 border-warning bg-[#FFFBEB] p-4">
          <p className="text-sm font-semibold text-warning">
            Dados expirados — importe uma planilha atualizada.
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            A planilha anterior completou {prazoHoras || 9}h desde a importação e foi
            descartada automaticamente, para o painel não exibir números defasados.
          </p>
        </div>
      )}

      {/* Área de upload — no topo, para acesso rápido de quem já conhece o fluxo */}
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
        <p className="text-sm text-gray-600">Arraste a planilha aqui ou</p>
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

      {/* Instruções — abaixo do upload; o gestor lê nas primeiras vezes e depois
          segue direto para o carregamento acima. */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-bold text-primary">
          Como exportar a planilha do Contratos.gov.br
        </h3>
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
        <p className="mb-3 text-sm leading-relaxed text-gray-600">
          Dois cuidados garantem que os cinco painéis apareçam completos:{' '}
          <strong className="text-ink">exportar todas as colunas</strong> (cada uma
          alimenta uma parte do painel) e{' '}
          <strong className="text-ink">selecionar todos os registros</strong> (para
          trazer a carteira inteira, não só a primeira página da lista).
        </p>
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

      {/* Colunas necessárias */}
      <div className="border border-gray-200 bg-panel p-4">
        <p className="text-sm font-semibold text-primary">
          Colunas a exportar (e para que servem)
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Na tela de exportação do Contratos.gov.br, marque estas colunas. Se
          alguma faltar, o painel correspondente pode ficar incompleto — na dúvida,
          selecione todas as disponíveis.
        </p>
        <ul className="mt-3 space-y-1.5">
          {COLUNAS.map((c) => (
            <li key={c.nome} className="flex gap-2 text-xs leading-snug">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
              <span>
                <span className="font-semibold text-ink">{c.nome}</span>
                <span className="text-gray-500"> — {c.para}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
