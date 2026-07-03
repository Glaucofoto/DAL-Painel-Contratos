// ---------------------------------------------------------------------------
// Parâmetros centrais do Painel de Contratos.
// ---------------------------------------------------------------------------
export const CONFIG = {
  UASG: '110120',
  JANELA_VENCIMENTO_DIAS: 30,
  JANELA_FORMALIZADOS_DIAS: 2,
  ANTECEDENCIA_ALERTA_PRORROGACAO_DIAS: 90,
  // Janelas (em dias) oferecidas na aba Prorrogáveis; a primeira em negrito é o
  // padrão exibido ao abrir a aba.
  JANELAS_PRORROGAVEL: [30, 60, 90],
  JANELA_PRORROGAVEL_PADRAO: 60,
  SEMAFORO: {
    critico: 10, // vermelho: vence em até 10 dias
    atencao: 20, // âmbar: 11-20 dias
    // acima de 20 até 30: verde
  },
}

// URL do Portal de Gestão (módulo central DAL). Usada no botão "← Portal DAL".
export const URL_PORTAL_CENTRAL = 'https://dal-portal-gestao.vercel.app/'

// Login do Contratos.gov.br — usado na tela de importação para o gestor abrir
// o sistema e exportar a planilha.
export const URL_CONTRATOS_LOGIN =
  'https://contratos.comprasnet.gov.br/login'
