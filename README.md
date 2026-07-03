# DAL — Painel de Contratos

Módulo interno de acompanhamento gerencial dos contratos e instrumentos
congêneres da UASG **110120**, a partir de uma planilha exportada do
**Contratos.gov.br (Comprasnet Contratos)**. Integra o ecossistema DAL (mesmo
padrão visual, de autenticação e de arquitetura dos demais módulos).

## Stack

- React + Vite, Tailwind CSS, Recharts
- Leitura de planilha `.xlsx`/`.csv` no navegador com SheetJS (`xlsx`)
- Vercel Function: `api/auth.js` (autenticação por senha + SSO do Portal DAL)

## Por que a carga é manual (e não automática)

Os contratos da UASG 110120 (ABIN/DAL) **não** são publicados na base pública de
dados abertos do Contratos.gov.br nem no PNCP — existem apenas no sistema
transacional, que exige login individual. Automatizar exigiria guardar as
credenciais pessoais de um usuário no servidor (risco de segurança e uso da API
interna). Optou-se, então, por um fluxo em que o **gestor exporta a planilha** do
sistema e a **importa** no painel.

O arquivo é processado **inteiramente no navegador** (SheetJS) — nenhum dado de
contrato trafega por servidor. As linhas lidas ficam em `localStorage` para o
painel reabrir com os últimos dados; reimportar atualiza.

### Formato esperado da planilha

Export padrão "Contratos :: Contratos.gov.br", com cabeçalho na 2ª linha e as
colunas: Número do instrumento, Unidades Requisitantes, Tipo, Categoria,
Fornecedor, Processo, Objeto, Vig. Início, Vig. Fim, Valor Global, Núm.
Parcelas, Valor Parcela, Prorrogável, Modalidade da Compra, Antecipa Gov,
Atualizado em, Data Encerramento. As colunas são casadas por nome normalizado
(tolerante a acento/espaço), então pequenas variações não quebram a importação.

### Adaptações em relação aos campos

- **Situação**: o export não traz "Ativo/Encerrado"; deriva-se de *Data
  Encerramento* (vazia = ativo).
- **Formalização**: sem data de assinatura/publicação; usa-se *Vig. Início*.
- **Prorrogável**: campo nativo (`Sim`/`Não`).
- **Empenhos**: vêm como instrumentos próprios (Tipo = `Empenho`) na mesma
  planilha; a aba Empenhos é montada a partir dessas linhas (sem vínculo
  explícito empenho→contrato, que o export não fornece).
- **Vig. Fim = `Indeterminado`**: tratada como sem vencimento (fora de "A Vencer").

## Variáveis de ambiente (Vercel)

| Variável | Descrição |
|---|---|
| `APP_PASSWORD` | Senha única de acesso ao painel |
| `JWT_SECRET` | Segredo para assinar os tokens de sessão |
| `SSO_SECRET` | Segredo compartilhado do SSO com o Portal DAL (igual nos módulos) |

Não há credenciais do Comprasnet — o painel não acessa a API. Veja `.env.example`.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Abas

1. **Visão Geral** — cards de totais, destaque de vencimentos críticos, rosca de
   distribuição por tipo e barras de valor por tipo.
2. **Recém-Formalizados** — acordeão Hoje / Ontem / Anteontem (por Vig. Início).
3. **A Vencer** — instrumentos vencendo em 30 dias, com semáforo de urgência.
4. **Prorrogáveis** — subconjunto prorrogável, com prazo sugerido de instrução
   (art. 107 e 111 da Lei nº 14.133/2021).
5. **Empenhos** — totais, tabela e valor empenhado por mês.

## Ativar o card no Portal de Gestão

Após o deploy, em `dal-portal-gestao/src/data/modulos.js`, adicione/ative o
módulo "Painel de Contratos" com `status: 'ativo'`, a `url` obtida e
`scope: 'dal-contratos'` (mesmo escopo usado em `api/auth.js`).
