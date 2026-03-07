# 🎰 BolãoMax

**Plataforma de Bolões de Loteria Online** — React + Express + PostgreSQL

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)

---

## 🌐 URLs

| Ambiente | URL |
|----------|-----|
| Produção (Railway) | `https://bolaomax.up.railway.app` |
| API Ping | `https://bolaomax.up.railway.app/api/ping` |
| Health Check | `https://bolaomax.up.railway.app/health` |

---

## ✨ Funcionalidades

- **Frontend React 19** com Vite + TailwindCSS
- **API REST** com Express 5 (ESM)
- **Autenticação JWT** (login, registro, middleware)
- **Painel Admin** — bolões, usuários, configurações, financeiro
- **Jogos suportados**: Mega-Sena, Lotofácil, Quina, Timemania, Lotomania, Dia de Sorte, Dupla Sena, Super Sete
- **Sistema de cotas** — compra, carrinho, checkout
- **Carteira digital** — saldo, recargas, histórico
- **Pagar.me** integração PIX/cartão
- **PostgreSQL** em produção (Railway) + **SQLite** em desenvolvimento

---

## 🚀 Execução Local

### Pré-requisitos

- Node.js >= 20
- npm >= 10

### Instalar e rodar

```bash
# 1. Clonar
git clone https://github.com/SEU_USUARIO/bolaomax.git
cd bolaomax

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# edite .env.local com suas credenciais

# 4. Build do frontend
npm run build

# 5. Iniciar o servidor
npm start
# → http://localhost:3000
```

### Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run build` | Compila o frontend para `dist/` |
| `npm start` | Inicia o servidor de produção |
| `npm run dev` | Dev completo (API + Vite concorrentes) |
| `npm run dev:web` | Apenas Vite dev server |
| `npm run dev:api` | Apenas servidor API com watch |
| `npm run db:generate` | Gera migrações Drizzle |
| `npm run db:migrate` | Aplica migrações no banco |
| `npm run db:seed` | Popula dados iniciais |
| `npm run db:studio` | Drizzle Studio (browser GUI) |

---

## 📦 Deploy no Railway

### 1. GitHub

```bash
git init
git add .
git commit -m "feat: setup inicial BolãoMax"
git remote add origin https://github.com/SEU_USUARIO/bolaomax.git
git push -u origin main
```

### 2. Railway — Novo Projeto

1. Acesse [railway.app](https://railway.app) → **New Project**
2. Selecione **Deploy from GitHub repo** → escolha `bolaomax`
3. Na aba **Settings** do serviço, configure:

| Campo | Valor |
|-------|-------|
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/health` |

### 3. Adicionar PostgreSQL

1. No projeto Railway → **+ New** → **Database** → **PostgreSQL**
2. O Railway cria e injeta `DATABASE_URL` automaticamente

### 4. Variáveis de Ambiente

No serviço Node.js, adicione as variáveis da aba **Variables**:

```
NODE_ENV=production
PORT=8080                          # Railway define automaticamente
SECRET_KEY=<openssl rand -base64 32>
SITE_URL=https://bolaomax.up.railway.app
CORS_ORIGIN=https://bolaomax.up.railway.app
PAGARME_SANDBOX=true
```

### 5. Migrações PostgreSQL

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login e vinculação
railway login
railway link

# Aplicar migrações
railway run npm run db:migrate

# Popular dados iniciais (opcional)
railway run npm run db:seed
```

### 6. Verificar deploy

```bash
curl https://bolaomax.up.railway.app/health
# → { "status": "ok", "uptime": 42.5 }

curl https://bolaomax.up.railway.app/api/ping
# → { "status": "ok", "message": "Pong! ...", "db": "postgresql" }
```

---

## 🗄️ Estrutura do Banco de Dados

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários (admin, user) |
| `sessions` | Sessões JWT |
| `boloes` | Bolões de loteria |
| `participacoes` | Participações/cotas |
| `transactions` | Transações financeiras |
| `lottery_draws` | Sorteios programados |
| `lottery_results` | Resultados dos sorteios |
| `notifications` | Notificações do usuário |
| `configuracoes_sistema` | Configurações do sistema |

---

## 📁 Estrutura do Projeto

```
bolaomax/
├── server.js                    # Express ESM — entry point
├── vite.config.ts               # Vite (base="/", outDir="dist")
├── package.json
├── .env.example
├── drizzle-postgres.config.ts   # Drizzle config PostgreSQL
├── src/
│   ├── web/                     # React frontend
│   │   ├── main.tsx
│   │   ├── app.tsx
│   │   ├── pages/
│   │   └── components/
│   └── api/
│       ├── routes/              # Express routers
│       ├── services/            # Business logic
│       ├── database/
│       │   ├── connection.js    # Pool PG + SQLite fallback
│       │   ├── schema-postgres.ts
│       │   └── schema.ts
│       └── middleware/
│           └── auth.js
├── migrations/                  # Drizzle migrations
└── dist/                        # Build output (gitignored)
```

---

## 🔐 Credenciais de Teste (dev local)

| Role | Email | Senha |
|------|-------|-------|
| Admin | admin@bolaomax.com | admin123 |
| Demo | demo@bolaomax.com | demo123 |
| Usuário | usuario@teste.com | 123456 |

> ⚠️ **Altere todas as senhas antes de ir para produção!**

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 7, TailwindCSS 4, Wouter, Radix UI
- **Backend**: Node.js 20+, Express 5, ESM
- **Database**: PostgreSQL (produção) / SQLite (dev)
- **ORM**: Drizzle ORM
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Pagamentos**: Pagar.me
- **Deploy**: Railway

---

## 📄 Licença

Proprietário — BolãoMax © 2026
