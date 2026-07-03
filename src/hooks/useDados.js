import { useCallback, useEffect, useState } from 'react'
import { lerPlanilha, normalizarLista } from '../utils/planilha.js'

// ---------------------------------------------------------------------------
// Estado dos dados importados manualmente pelo gestor.
//
// A planilha é lida no navegador (nunca sai do dispositivo). As linhas cruas
// e a data da importação ficam em localStorage, para o painel reabrir com os
// últimos dados. O gestor importa uma nova planilha para atualizar.
// ---------------------------------------------------------------------------

const CHAVE = 'dal-contratos-planilha-v1'

function lerArmazenado() {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return null
    const dados = JSON.parse(bruto)
    if (!Array.isArray(dados.linhasCruas)) return null
    return {
      contratos: normalizarLista(dados.linhasCruas),
      importadoEm: dados.importadoEm ? new Date(dados.importadoEm) : null,
      nomeArquivo: dados.nomeArquivo || '',
    }
  } catch {
    return null
  }
}

export function useDados() {
  const [contratos, setContratos] = useState([])
  const [importadoEm, setImportadoEm] = useState(null)
  const [nomeArquivo, setNomeArquivo] = useState('')
  const [importando, setImportando] = useState(false)
  const [erro, setErro] = useState(null)
  const [pronto, setPronto] = useState(false)

  // Reidrata do armazenamento local na primeira carga.
  useEffect(() => {
    const guardado = lerArmazenado()
    if (guardado) {
      setContratos(guardado.contratos)
      setImportadoEm(guardado.importadoEm)
      setNomeArquivo(guardado.nomeArquivo)
    }
    setPronto(true)
  }, [])

  const importar = useCallback(async (file) => {
    setImportando(true)
    setErro(null)
    try {
      const { instrumentos, linhasCruas } = await lerPlanilha(file)
      const agora = new Date()
      setContratos(instrumentos)
      setImportadoEm(agora)
      setNomeArquivo(file.name || '')
      try {
        localStorage.setItem(
          CHAVE,
          JSON.stringify({
            linhasCruas,
            importadoEm: agora.toISOString(),
            nomeArquivo: file.name || '',
          }),
        )
      } catch {
        // Sem espaço no storage — segue apenas em memória nesta sessão.
      }
      return { ok: true, total: instrumentos.length }
    } catch (e) {
      setErro(e.message || 'Não foi possível ler a planilha.')
      return { ok: false, error: e.message }
    } finally {
      setImportando(false)
    }
  }, [])

  const limpar = useCallback(() => {
    localStorage.removeItem(CHAVE)
    setContratos([])
    setImportadoEm(null)
    setNomeArquivo('')
    setErro(null)
  }, [])

  return {
    contratos,
    importadoEm,
    nomeArquivo,
    importando,
    erro,
    pronto,
    temDados: contratos.length > 0,
    importar,
    limpar,
  }
}
