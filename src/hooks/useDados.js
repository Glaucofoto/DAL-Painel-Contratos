import { useCallback, useEffect, useRef, useState } from 'react'
import { lerPlanilha, normalizarLista } from '../utils/planilha.js'

// ---------------------------------------------------------------------------
// Estado dos dados importados manualmente pelo gestor.
//
// A planilha é lida no navegador (nunca sai do dispositivo). As linhas cruas e
// a data da importação ficam em localStorage. Para evitar que o painel exiba
// dados defasados, há um PRAZO de validade: passadas 9 horas da importação, os
// dados são descartados e o painel solicita uma nova planilha. O gestor também
// pode limpar manualmente a qualquer momento.
// ---------------------------------------------------------------------------

const CHAVE = 'dal-contratos-planilha-v1'
const PRAZO_MS = 12 * 60 * 60 * 1000 // 12 horas

function lerArmazenado() {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return null
    const dados = JSON.parse(bruto)
    if (!Array.isArray(dados.linhasCruas)) return null
    return {
      linhasCruas: dados.linhasCruas,
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
  const [expirado, setExpirado] = useState(false)
  const [pronto, setPronto] = useState(false)
  const timerRef = useRef(null)

  const expirar = useCallback(() => {
    localStorage.removeItem(CHAVE)
    setContratos([])
    setImportadoEm(null)
    setNomeArquivo('')
    setExpirado(true)
  }, [])

  // Reidrata do armazenamento local na primeira carga.
  useEffect(() => {
    const guardado = lerArmazenado()
    if (guardado) {
      setContratos(normalizarLista(guardado.linhasCruas))
      setImportadoEm(guardado.importadoEm)
      setNomeArquivo(guardado.nomeArquivo)
    }
    setPronto(true)
  }, [])

  // Agenda a expiração de 9h relativa à data de importação. Se os dados já
  // estiverem vencidos ao carregar, expira imediatamente.
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!importadoEm) return
    const restante = importadoEm.getTime() + PRAZO_MS - Date.now()
    if (restante <= 0) {
      expirar()
      return
    }
    timerRef.current = setTimeout(expirar, restante)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [importadoEm, expirar])

  const importar = useCallback(async (file) => {
    setImportando(true)
    setErro(null)
    try {
      const { instrumentos, linhasCruas } = await lerPlanilha(file)
      const agora = new Date()
      setContratos(instrumentos)
      setImportadoEm(agora)
      setNomeArquivo(file.name || '')
      setExpirado(false)
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
    setExpirado(false)
  }, [])

  return {
    contratos,
    importadoEm,
    nomeArquivo,
    importando,
    erro,
    expirado,
    pronto,
    temDados: contratos.length > 0,
    prazoHoras: PRAZO_MS / (60 * 60 * 1000),
    importar,
    limpar,
  }
}
