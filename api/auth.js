import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

// ---------------------------------------------------------------------------
// Autenticação do painel (senha única + SSO do Portal DAL).
// Controle de tentativas (rate limiting) em memória do processo serverless.
// Para o uso interno previsto, o controle por instância é suficiente como
// primeira barreira.
// ---------------------------------------------------------------------------
const MAX_TENTATIVAS = 5
const BLOQUEIO_MS = 10 * 60 * 1000 // 10 minutos
const tentativas = new Map() // ip -> { count, bloqueadoAte }

// Escopo/audiência do token deste módulo. Deve casar com o "scope" cadastrado
// para o Painel de Contratos no Portal DAL (src/data/modulos.js).
const SCOPE = 'dal-contratos'

function getIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim()
  return req.socket?.remoteAddress || 'desconhecido'
}

function compararSenha(informada, esperada) {
  const a = Buffer.from(String(informada))
  const b = Buffer.from(String(esperada))
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  const appPassword = process.env.APP_PASSWORD
  const jwtSecret = process.env.JWT_SECRET || process.env.APP_PASSWORD

  if (!appPassword || !jwtSecret) {
    return res
      .status(500)
      .json({ error: 'Servidor não configurado. Contate o administrador.' })
  }

  // Acesso via SSO vindo do Portal DAL: troca um token de passagem de vida
  // curta (assinado com SSO_SECRET, destinado a este módulo) pela sessão
  // normal de 8h. Não passa pelo controle de tentativas de senha.
  const { sso } = req.body || {}
  if (typeof sso === 'string' && sso.length > 0) {
    const ssoSecret = process.env.SSO_SECRET
    if (!ssoSecret) {
      return res
        .status(500)
        .json({ error: 'Servidor não configurado. Contate o administrador.' })
    }
    try {
      jwt.verify(sso, ssoSecret, { audience: SCOPE })
    } catch {
      return res.status(401).json({ error: 'Acesso SSO inválido ou expirado.' })
    }
    const token = jwt.sign({ scope: SCOPE }, jwtSecret, { expiresIn: '8h' })
    return res.status(200).json({ token })
  }

  const ip = getIp(req)
  const agora = Date.now()
  const registro = tentativas.get(ip)

  if (registro?.bloqueadoAte && registro.bloqueadoAte > agora) {
    const restante = Math.ceil((registro.bloqueadoAte - agora) / 60000)
    return res.status(429).json({
      error: `Muitas tentativas. Tente novamente em ${restante} minuto(s).`,
    })
  }

  const { password } = req.body || {}

  if (typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: 'Informe a senha.' })
  }

  if (compararSenha(password, appPassword)) {
    tentativas.delete(ip)
    const token = jwt.sign({ scope: SCOPE }, jwtSecret, { expiresIn: '8h' })
    return res.status(200).json({ token })
  }

  // Senha incorreta — incrementa contador.
  const count = (registro?.count || 0) + 1
  if (count >= MAX_TENTATIVAS) {
    tentativas.set(ip, { count, bloqueadoAte: agora + BLOQUEIO_MS })
    return res.status(429).json({
      error: 'Muitas tentativas. Acesso bloqueado por 10 minutos.',
    })
  }

  tentativas.set(ip, { count, bloqueadoAte: 0 })
  return res.status(401).json({ error: 'Senha incorreta.' })
}
