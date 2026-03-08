# 🎰 BolãoMax — Plataforma de Bolões de Loteria Online

## Visão Geral
BolãoMax é uma plataforma completa para gerenciamento de bolões de loteria. Os usuários podem participar de bolões coletivos, gerenciar sua carteira virtual e acompanhar resultados em tempo real.

**Stack**: Node.js 22 + Express 5 + React 19 + Vite + SQLite (dev) / PostgreSQL (prod)  
**Deploy**: Railway · **GitHub**: https://github.com/bolaomax-oficial/bolaomax

---

## ✅ Funcionalidades Implementadas

### Autenticação
- `POST /api/auth/register` — cadastro de usuário
- `POST /api/auth/login` — login com JWT (7 dias)
- `POST /api/auth/logout` — invalidar sessão
- `GET /api/auth/me` — dados do usuário logado

### Bolões (Público)
- `GET /api/boloes` — listar bolões ativos (filtros: status, tipo, search, page, limit)
- `GET /api/boloes/:id` — detalhes de um bolão
- `GET /api/boloes/tipos` — tipos de loteria disponíveis

### Carrinho & Checkout
- `POST /api/carrinho/adicionar` — adicionar cota ao carrinho (reserva 5min)
- `GET /api/carrinho` — ver carrinho atual (itens não expirados)
- `DELETE /api/carrinho/item/:id` — remover item
- `DELETE /api/carrinho/limpar` — limpar carrinho
- `POST /api/carrinho/finalizar` — **checkout completo** (debita saldo + cria participação)
- `GET /api/carrinho/participacoes` — histórico de participações do usuário

### Carteira Virtual
- `GET /api/carteira/saldo` — saldo atual
- `GET /api/carteira/transacoes` — histórico de transações
- `GET /api/carteira/recargas` — histórico de recargas
- `POST /api/carteira/recarregar` — solicitar recarga (PIX/cartão/boleto)
- `POST /api/carteira/confirmar/:id` — confirmar recarga (sandbox)

### Financeiro
- `GET /api/financeiro/saldo` — saldo do usuário
- `GET /api/financeiro/extrato` — extrato de transações
- `GET /api/financeiro/dashboard` — dashboard financeiro (admin)

### Perfil do Usuário
- `GET /api/perfil` — dados do perfil
- `PUT /api/perfil` — atualizar nome, telefone, cpf, avatar
- `POST /api/perfil/senha` — alterar senha
- `GET /api/perfil/historico` — histórico completo (participações + recargas + transações)
- `GET /api/perfil/stats` — estatísticas pessoais

### Resultados de Loteria
- `GET /api/resultados/recentes` — últimos resultados de todas as modalidades
- `GET /api/resultados/:modalidade` — último resultado (megasena, lotofacil, quina, etc.)
- `GET /api/resultados/:modalidade/:concurso` — resultado por concurso
- `POST /api/resultados/processar/:bolaoId` — admin: processar resultado e creditar prêmios

### Notificações
- `GET /api/notificacoes` — listar notificações do usuário
- `GET /api/notificacoes/nao-lidas` — contador de não lidas
- `PATCH /api/notificacoes/:id/lida` — marcar como lida
- `PATCH /api/notificacoes/todas-lidas` — marcar todas como lidas
- `DELETE /api/notificacoes/:id` — excluir notificação
- `POST /api/notificacoes/enviar` — admin: enviar notificação (broadcast ou unicast)

### Admin
- `GET /api/admin/dashboard` — estatísticas completas (usuários, bolões, financeiro, participações)
- `GET /api/admin/usuarios` — listar usuários (filtros, busca, paginação)
- `GET /api/admin/usuarios/:id` — detalhes + histórico do usuário
- `PATCH /api/admin/usuarios/:id/status` — alterar status do usuário
- `GET /api/admin/participacoes` — todas as participações
- `GET /api/admin/transacoes` — todas as transações
- `GET /api/admin/boloes` — listar bolões (admin)
- `POST /api/admin/boloes` — criar bolão
- `PUT /api/admin/boloes/:id` — atualizar bolão
- `DELETE /api/admin/boloes/:id` — excluir bolão
- `PATCH /api/admin/boloes/:id/status` — alterar status

### Sistema
- `GET /health` — healthcheck Railway → `{"status":"ok","uptime":N}`
- `GET /api/ping` — status da API → `{"status":"ok","db":"sqlite|postgresql"}`
- `GET /*` — SPA React fallback

---

## 🚀 Executar Localmente

### Pré-requisitos
- Node.js 20+

### Setup
```bash
git clone https://github.com/bolaomax-oficial/bolaomax.git
cd bolaomax
npm install --legacy-peer-deps
cp .env.example .env
# Edite .env se necessário

# Build do frontend
npm run build

# Iniciar servidor
npm start
# → http://localhost:3000
```

### Scripts disponíveis
```bash
npm run build      # Compilar frontend (Vite)
npm start          # Iniciar servidor Express (produção)
npm run dev        # Desenvolvimento (concurrently: vite + nodemon)
npm run dev:web    # Apenas frontend (Vite)
npm run dev:api    # Apenas backend (nodemon)
npm run db:migrate # Executar migrações PostgreSQL
npm run db:seed    # Popular banco com dados de teste
```

---

## 🌍 Deploy Railway

### 1. Criar projeto Railway
```
https://railway.app/new
→ Deploy from GitHub repo → bolaomax-oficial/bolaomax
```

Railway detecta automaticamente `railway.toml`:
- **Build**: `npm install --legacy-peer-deps && npm run build`
- **Start**: `npm start`
- **Healthcheck**: `/health`

### 2. Adicionar PostgreSQL
Railway → **+ New → Database → Add PostgreSQL**  
`DATABASE_URL` é injetado automaticamente.

### 3. Variáveis de ambiente
```
NODE_ENV=production
SECRET_KEY=<gere com: openssl rand -base64 32>
SITE_URL=https://bolaomax.up.railway.app
CORS_ORIGIN=https://bolaomax.up.railway.app
PAGARME_SANDBOX=true
PORT=8080  (Railway injeta automaticamente)
```

### 4. Executar migrações
```bash
npm install -g @railway/cli
railway login
railway link
railway run npm run db:migrate
```

### 5. Verificar
```bash
curl https://bolaomax.up.railway.app/health
curl https://bolaomax.up.railway.app/api/ping
```

---

## 🔑 Credenciais de Teste (SQLite local)

| Email | Senha | Papel |
|-------|-------|-------|
| admin@bolaomax.com | admin123 | admin |
| demo@bolaomax.com | demo123 | user |
| usuario@teste.com | 123456 | user |

---

## 🗄️ Banco de Dados

### Tabelas principais
- `users` — usuários (id, name, email, password_hash, saldo, role, status)
- `boloes` — bolões de loteria (id, nome, tipo, status, cotas, valor_cota, etc.)
- `participacoes` — participações nos bolões (user_id, bolao_id, quantidade_cotas, valor_total)
- `carrinho_itens` — itens temporários no carrinho (expiram em 5min)
- `transactions` — transações financeiras (recarga, débito, prêmio)
- `recarga_carteira` — solicitações de recarga (PIX, cartão, boleto)
- `sessions` — sessões JWT
- `notifications` — notificações dos usuários

### Conexão
- **Dev**: SQLite local em `./bolaomax.db`
- **Prod**: PostgreSQL via `DATABASE_URL` (Railway)
- **SSL** em produção: `{ rejectUnauthorized: false }`

---

## 📁 Estrutura do Projeto
```
bolaomax/
├── server.js                    # Entry point Express ESM
├── package.json                 # Node 22, scripts, deps
├── vite.config.ts               # Build React → dist/
├── railway.toml                 # Config Railway
├── migrations/                  # SQL migrations PostgreSQL
│   └── 0001_initial_schema.sql
├── src/
│   ├── web/                     # Frontend React 19
│   │   ├── App.tsx
│   │   ├── pages/               # Rotas React (wouter)
│   │   └── components/          # Componentes UI
│   └── api/
│       ├── routes/              # Express routers
│       │   ├── auth.js          # Autenticação JWT
│       │   ├── boloes.js        # CRUD bolões (público + admin)
│       │   ├── carrinho.js      # Carrinho + checkout
│       │   ├── carteira.js      # Saldo + recargas
│       │   ├── financeiro.js    # Extrato + dashboard
│       │   ├── perfil.js        # Perfil do usuário
│       │   ├── resultados.js    # API Caixa Econômica
│       │   ├── notificacoes.js  # Sistema de notificações
│       │   └── admin-dashboard.js # Dashboard admin
│       ├── services/            # Lógica de negócio
│       │   ├── auth.js          # Bcrypt + JWT
│       │   ├── boloes.js        # CRUD com SQL nativo
│       │   └── carteira.js      # Saldo + transações
│       ├── middleware/
│       │   └── auth.js          # requireAuth, requireAdmin
│       └── database/
│           ├── connection.js    # SQLite/PostgreSQL auto-detect
│           ├── schema.ts        # Drizzle SQLite schema
│           └── schema-postgres.ts # Drizzle PG schema
└── public/                      # Assets estáticos
```

---

## 🔧 Arquitetura

```
Railway
  └── Node.js (Express 5, ESM)
       ├── /          → dist/ (React SPA)
       ├── /api/*     → Express routers
       └── /health    → healthcheck

Banco:
  Dev  → SQLite (better-sqlite3, ./bolaomax.db)
  Prod → PostgreSQL (Railway, SSL)

Auth: JWT (7 dias) + bcryptjs (salt 10)
```

---

**Última atualização**: 2026-03-08  
**Status**: ✅ Todas as 7 etapas implementadas e testadas
