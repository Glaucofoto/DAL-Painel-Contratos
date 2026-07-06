import { createContext, useCallback, useEffect, useRef, useState } from 'react'

export const AuthContext = createContext(null)

const TOKEN_KEY = 'dal-contratos-token'
const ACTIVITY_KEY = 'dal-contratos-last-activity'
const INATIVIDADE_MS = 8 * 60 * 60 * 1000 // 8 horas

function lerSessao() {
  const token = sessionStorage.getItem(TOKEN_KEY)
  if (!token) return null
  const last = Number(sessionStorage.getItem(ACTIVITY_KEY) || 0)
  if (last && Date.now() - last > INATIVIDADE_MS) {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(ACTIVITY_KEY)
    return null
  }
  return token
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => lerSessao())
  const [carregando, setCarregando] = useState(false)
  // Evita o flash da tela de login quando o acesso vem do Portal DAL (#sso=):
  // se há token SSO na URL e ainda não há sessão, iniciamos em carregamento
  // (decisão síncrona, antes da 1ª pintura) até a troca do token concluir.
  const [inicializando, setInicializando] = useState(
    () => !lerSessao() && /(?:^#|&)sso=/.test(window.location.hash)
  )
  const timerRef = useRef(null)

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(ACTIVITY_KEY)
    setToken(null)
  }, [])

  const registrarAtividade = useCallback(() => {
    if (!token) return
    sessionStorage.setItem(ACTIVITY_KEY, String(Date.now()))
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(logout, INATIVIDADE_MS)
  }, [token, logout])

  // Timeout de inatividade de 8 horas, reiniciado a cada interação do usuário.
  useEffect(() => {
    if (!token) return
    registrarAtividade()
    const eventos = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart']
    eventos.forEach((e) => window.addEventListener(e, registrarAtividade))
    return () => {
      eventos.forEach((e) => window.removeEventListener(e, registrarAtividade))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [token, registrarAtividade])

  const login = useCallback(async (password) => {
    setCarregando(true)
    try {
      const resp = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok || !data.token) {
        return { ok: false, error: data.error || 'Não foi possível acessar.' }
      }
      sessionStorage.setItem(TOKEN_KEY, data.token)
      sessionStorage.setItem(ACTIVITY_KEY, String(Date.now()))
      setToken(data.token)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Falha de conexão. Tente novamente.' }
    } finally {
      setCarregando(false)
    }
  }, [])

  // Consome o token SSO vindo do Portal DAL (fragmento #sso=...) na primeira
  // carga: troca-o pela sessão normal do módulo e limpa a URL. Quem chega sem
  // esse token (link direto) segue para a tela de senha normalmente.
  const ssoConsumidoRef = useRef(false)
  useEffect(() => {
    if (ssoConsumidoRef.current) return
    const match = window.location.hash.match(/(?:^#|&)sso=([^&]+)/)
    if (!match) return
    ssoConsumidoRef.current = true

    const ssoToken = decodeURIComponent(match[1])
    // Remove o token da URL imediatamente (não deve ficar no histórico).
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search
    )

    if (sessionStorage.getItem(TOKEN_KEY)) {
      setInicializando(false)
      return // já autenticado
    }

    ;(async () => {
      try {
        const resp = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sso: ssoToken }),
        })
        const data = await resp.json().catch(() => ({}))
        if (resp.ok && data.token) {
          sessionStorage.setItem(TOKEN_KEY, data.token)
          sessionStorage.setItem(ACTIVITY_KEY, String(Date.now()))
          setToken(data.token)
        }
      } catch {
        // silencioso — o usuário verá a tela de senha
      } finally {
        setInicializando(false)
      }
    })()
  }, [])

  return (
    <AuthContext.Provider
      value={{ token, autenticado: !!token, carregando, inicializando, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
