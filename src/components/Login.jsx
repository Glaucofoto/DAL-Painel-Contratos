import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'

export default function Login() {
  const { login, carregando } = useAuth()
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)
    const resultado = await login(senha)
    if (!resultado.ok) {
      setErro(resultado.error)
      setSenha('')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
            DAL — Painel de Contratos
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-primary">Acesso restrito</h2>

          <label className="block text-sm font-medium text-gray-700">
            Senha
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              autoFocus
              className="mt-1 w-full border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </label>

          <p className="mt-2 text-xs text-gray-500">Painel de uso exclusivo interno.</p>

          {erro && (
            <p className="mt-3 text-sm" style={{ color: '#CC2020' }}>
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando || !senha}
            className="mt-5 w-full bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#142d54] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? 'Acessando...' : 'Acessar'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs leading-relaxed text-gray-400">
          Dados obtidos do Contratos.gov.br (Comprasnet Contratos).
        </p>
      </div>
    </div>
  )
}
