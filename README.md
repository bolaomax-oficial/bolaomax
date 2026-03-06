# 🎰 BolãoMax

**Plataforma de Bolões de Loteria Online** — aposte em grupo, ganhe em grande!

[![Deploy Railway](https://img.shields.io/badge/deploy-railway-purple)](https://railway.app)
[![Node.js](https://img.shields.io/badge/node-20+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-19-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-5-blue)](https://typescriptlang.org)

---

## 🚀 Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19 + Vite + TailwindCSS 4 |
| **Backend (Railway)** | Express 5 + Node.js 20 + TypeScript (tsx) |
| **Backend (Cloudflare)** | Hono + Cloudflare Workers |
| **Database** | PostgreSQL (Railway) / SQLite (local) / D1 (Cloudflare) |
| **ORM** | Drizzle ORM |
| **Auth** | JWT customizado + better-auth |
| **Pagamentos** | Pagar.me (PIX, cartão) |
| **Roteamento** | Wouter |

---

## 📋 Funcionalidades

### Loterias Suportadas
- 🟢 Mega-Sena | Lotofácil | Quina | Lotomania
- 🟡 Timemania | Dia de Sorte | Super Sete | Dupla Sena
- 🔵 Federal | Internacional

### Para Usuários
- ✅ Cadastro e login com JWT
- ✅ Carteira digital (recarga via PIX)
- ✅ Carrinho com timer de reserva (5 min)
- ✅ Histórico de bolões e participações
- ✅ Programa de indicações
- ✅ Clube VIP com benefícios exclusivos

### Para Administradores
- ✅ Dashboard com métricas em tempo real
- ✅ Criação e gerenciamento de bolões
- ✅ Sistema financeiro (fundo, saques, receitas)
- ✅ Controle de usuários e sub-usuários
- ✅ Automação de bolões (cron jobs)
- ✅ Calendário de sorteios
- ✅ Blog e SEO
- ✅ Configurações globais do sistema

---

## 🏃 Como Executar Localmente

### Pré-requisitos
- Node.js 20+
- npm

### Instalação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/bolaomax.git
cd bolaomax

# Instalar dependências
npm install --legacy-peer-deps

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas configurações

# Executar em desenvolvimento (modo Cloudflare Workers)
npm run build
npm run dev       # Apenas frontend (Vite)

# OU executar servidor Express (modo Railway/Node.js)
npm run dev:api   # Servidor Express com API completa
```

### Banco de dados local (D1 SQLite)

```bash
# Aplicar migrações
npx wrangler d1 migrations apply DB --local

# Aplicar migrações adicionais
npx wrangler d1 execute DB --local --file=migrations-sqlite/0002_carrinho_sistema.sql
npx wrangler d1 execute DB --local --file=migrations-sqlite/0003_sub_usuarios_permissoes.sql
npx wrangler d1 execute DB --local --file=migrations-sqlite/0004_sistema_automacao_boloes.sql
npx wrangler d1 execute DB --local --file=migrations-sqlite/0005_sistema_configuracoes.sql
```

---

## 🚂 Deploy no Railway

### 1. Criar repositório no GitHub

```bash
git remote add origin https://github.com/seu-usuario/bolaomax.git
git push -u origin main
```

### 2. Configurar Railway

1. Acesse [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → selecione `bolaomax`
3. Adicione serviço **PostgreSQL** (+ New → Database → PostgreSQL)

### 3. Variáveis de Ambiente no Railway

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | (automático - PostgreSQL do Railway) |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `SECRET_KEY` | `openssl rand -base64 32` |
| `SITE_URL` | `https://seu-app.up.railway.app` |
| `PAGARME_API_KEY` | Sua chave Pagar.me |

### 4. Deploy automático

O Railway detecta o `railway.toml` e faz deploy automaticamente a cada `git push`.

---

## ☁️ Deploy no Cloudflare Pages (alternativo)

```bash
# Criar projeto D1
npx wrangler d1 create bolaomax-production

# Atualizar wrangler.json com o database_id gerado

# Aplicar migrações
npx wrangler d1 migrations apply DB

# Deploy
npm run build
npx wrangler pages deploy dist/client --project-name bolaomax
```

---

## 🔑 Credenciais Padrão (desenvolvimento)

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | `admin@bolaomax.com` | `admin123` |
| Demo | `demo@bolaomax.com` | `demo123` |
| Usuário | `usuario@teste.com` | `123456` |

> ⚠️ **Sempre altere as senhas em produção!**

---

## 📁 Estrutura do Projeto

```
bolaomax/
├── src/
│   ├── api/                    # Backend API
│   │   ├── database/           # Schema, migrations, seeds
│   │   ├── routes/             # Express routes (.js)
│   │   ├── modules/            # Módulos especiais (Timemania, Lotomania, Dia de Sorte)
│   │   ├── services/           # Lógica de negócio
│   │   ├── middleware/         # Auth, rate limiting
│   │   └── cron-jobs.js        # Automação
│   └── web/                    # Frontend React
│       ├── pages/              # Páginas (loteria, admin, etc)
│       ├── components/         # Componentes reutilizáveis
│       ├── contexts/           # React contexts
│       ├── hooks/              # Custom hooks
│       └── services/           # API clients
├── migrations-sqlite/          # Migrações SQLite adicionais
├── public/                     # Assets estáticos
├── server-prod.ts              # ✅ Servidor Railway (tsx)
├── server-express.js           # Servidor Express legado
├── railway.toml                # Configuração Railway
├── nixpacks.toml               # Build Railway
├── wrangler.json               # Cloudflare Workers
└── vite.config.ts              # Build Vite
```

---

## 📊 APIs Disponíveis

```
GET  /api/ping                      Health check
GET  /api/health                    Status detalhado
POST /api/auth/login                Login
POST /api/auth/register             Cadastro
GET  /api/auth/me                   Perfil do usuário

GET  /api/admin/boloes              Listar bolões (admin)
POST /api/admin/boloes              Criar bolão
GET  /api/admin/boloes/:id          Bolão por ID
PUT  /api/admin/boloes/:id          Atualizar bolão
DELETE /api/admin/boloes/:id        Excluir bolão

GET  /api/carrinho                  Ver carrinho
POST /api/carrinho                  Adicionar ao carrinho
GET  /api/carteira                  Saldo da carteira
POST /api/carteira/recarregar       Recarga PIX

GET  /api/financeiro/resumo         Resumo financeiro
GET  /api/financeiro/transacoes     Histórico de transações
```

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie sua branch: `git checkout -b feat/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: minha feature'`
4. Push: `git push origin feat/minha-feature`
5. Abra um Pull Request

---

## 📄 Licença

Proprietary — BolãoMax © 2026
