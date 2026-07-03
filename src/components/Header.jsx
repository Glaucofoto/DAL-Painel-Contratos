import { URL_PORTAL_CENTRAL } from '../config/config.js'
import { formatarDataHora } from '../utils/formatters.js'

export default function Header({
  aoImportar,
  aoLimpar,
  importando,
  importadoEm,
  prazoHoras,
  mostrarBotaoImportar,
  mostrarBotaoLimpar,
  aoSair,
}) {
  return (
    <header className="z-30 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b-4 border-primary bg-white px-4 py-3 sm:px-6">
      <div className="min-w-0">
        <a
          href={URL_PORTAL_CENTRAL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-secondary hover:underline"
        >
          ← Portal DAL
        </a>
        <h1 className="min-w-0 break-words text-base font-bold leading-tight tracking-tight text-primary sm:text-lg">
          DAL — Painel de Contratos
        </h1>
        {importadoEm && (
          <p className="text-xs text-gray-400">
            Planilha importada em {formatarDataHora(importadoEm.toISOString())}
            {prazoHoras ? ` · validade de ${prazoHoras}h` : ''}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {mostrarBotaoImportar && (
          <button
            type="button"
            onClick={aoImportar}
            disabled={importando}
            className="hidden bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#142d54] disabled:cursor-not-allowed disabled:opacity-50 sm:block"
          >
            Importar planilha
          </button>
        )}

        {mostrarBotaoLimpar && (
          <button
            type="button"
            onClick={aoLimpar}
            className="shrink-0 text-xs text-gray-400 underline hover:text-danger"
          >
            Limpar planilha
          </button>
        )}

        <button
          type="button"
          onClick={aoSair}
          className="shrink-0 text-xs text-gray-400 underline hover:text-gray-600"
        >
          Sair
        </button>
      </div>

      {/* Botão de importação fixo no mobile */}
      {mostrarBotaoImportar && (
        <button
          type="button"
          onClick={aoImportar}
          disabled={importando}
          className="fixed bottom-5 right-5 z-30 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#142d54] disabled:opacity-50 sm:hidden"
        >
          Importar
        </button>
      )}
    </header>
  )
}
