import { useState } from 'react'
import Header from './components/Header.jsx'
import Login from './components/Login.jsx'
import TabNav from './components/TabNav.jsx'
import VisaoGeral from './components/VisaoGeral.jsx'
import RecemFormalizados from './components/RecemFormalizados.jsx'
import AVencer from './components/AVencer.jsx'
import Prorrogaveis from './components/Prorrogaveis.jsx'
import Empenhos from './components/Empenhos.jsx'
import Producao from './components/Producao.jsx'
import ImportarPlanilha from './components/ImportarPlanilha.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { useAuth } from './hooks/useAuth.js'
import { useDados } from './hooks/useDados.js'

function Painel() {
  const { logout } = useAuth()
  const [aba, setAba] = useState('visao')
  const [modoImportar, setModoImportar] = useState(false)
  const {
    contratos,
    importadoEm,
    importando,
    erro,
    expirado,
    pronto,
    temDados,
    prazoHoras,
    importar,
    limpar,
  } = useDados()

  async function handleImportar(file) {
    const resultado = await importar(file)
    if (resultado.ok) setModoImportar(false)
  }

  function handleLimpar() {
    const ok = window.confirm(
      'Limpar a planilha importada? Será necessário importar novamente para ver os dados.',
    )
    if (ok) {
      limpar()
      setModoImportar(false)
    }
  }

  const mostrarImportacao = pronto && (!temDados || modoImportar || expirado)

  return (
    <div className="flex min-h-screen flex-col bg-white" style={{ minHeight: '100dvh' }}>
      <Header
        aoImportar={() => setModoImportar(true)}
        aoLimpar={handleLimpar}
        importando={importando}
        importadoEm={importadoEm}
        prazoHoras={prazoHoras}
        mostrarBotaoImportar={temDados && !modoImportar}
        mostrarBotaoLimpar={temDados}
        aoSair={logout}
      />

      {!mostrarImportacao && temDados && (
        <TabNav abaAtiva={aba} aoMudar={setAba} />
      )}

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {!pronto && (
          <p className="py-12 text-center text-sm text-gray-500">Carregando...</p>
        )}

        {mostrarImportacao && (
          <ImportarPlanilha
            onImportar={handleImportar}
            importando={importando}
            erro={erro}
            expirado={expirado}
            prazoHoras={prazoHoras}
            podeVoltar={temDados}
            onVoltar={() => setModoImportar(false)}
          />
        )}

        {!mostrarImportacao && temDados && (
          <>
            {aba === 'visao' && <VisaoGeral contratos={contratos} />}
            {aba === 'recem' && <RecemFormalizados contratos={contratos} />}
            {aba === 'vencer' && <AVencer contratos={contratos} />}
            {aba === 'prorrogaveis' && <Prorrogaveis contratos={contratos} />}
            {aba === 'empenhos' && <Empenhos contratos={contratos} />}
            {aba === 'producao' && <Producao contratos={contratos} />}
          </>
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="px-5 py-5 text-center text-xs leading-relaxed text-gray-500 sm:px-8">
          <p className="font-semibold text-primary">DAL — Painel de Contratos</p>
          <p className="mt-1">
            Dados exportados do Contratos.gov.br (Comprasnet Contratos) e importados
            manualmente
          </p>
          <p className="mt-1">
            Os números refletem a última planilha importada; reimporte para atualizar.
          </p>
          <p className="mt-1">Uso exclusivo interno | contratos.comprasnet.gov.br</p>
        </div>
      </footer>
    </div>
  )
}

function Portal() {
  const { autenticado } = useAuth()
  if (!autenticado) return <Login />
  return <Painel />
}

export default function App() {
  return (
    <AuthProvider>
      <Portal />
    </AuthProvider>
  )
}
