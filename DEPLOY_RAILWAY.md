# 🚀 BolãoMax - Deploy Railway

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🏗️ Estrutura do Projeto

```
bolaomax-preview/
├── src/
│   ├── web/          # Frontend React
│   └── api/          # Backend API (Hono)
├── dist/             # Build do frontend (gerado)
├── server.js         # Servidor Express
├── package.json
├── vite.config.ts
└── railway.json      # Configuração Railway
```

## 🔧 Instalação Local

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento
npm run dev

# 3. Build para produção
npm run build

# 4. Testar build localmente
npm start
```

## 🚂 Deploy no Railway

### Método 1: Via CLI

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Inicializar projeto
railway init

# 4. Deploy
railway up
```

### Método 2: Via Dashboard

1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Conecte seu repositório
5. Railway detectará automaticamente o `railway.json`
6. Clique em "Deploy"

## ⚙️ Variáveis de Ambiente

Configure no Railway Dashboard:

```env
PORT=5174
NODE_ENV=production
```

## 📦 O que foi Removido

- ❌ `@cloudflare/vite-plugin`
- ❌ `wrangler`
- ❌ Cloudflare Workers
- ❌ `.wrangler/` directory
- ❌ `wrangler.json`
- ❌ `tsconfig.worker.json`
- ❌ `worker-configuration.d.ts`

## ✅ O que foi Adicionado

- ✅ `express` - Servidor web
- ✅ `server.js` - Ponto de entrada
- ✅ `railway.json` - Configuração Railway
- ✅ `Procfile` - Alternativa de config
- ✅ `.env.example` - Exemplo de variáveis

## 🎯 Scripts Disponíveis

```bash
npm run dev       # Desenvolvimento (Vite HMR)
npm run build     # Build para produção
npm start         # Rodar servidor produção
npm run preview   # Preview do build
npm run lint      # Lint do código
```

## 🔍 Verificar Deploy

Após deploy, teste os endpoints:

```bash
# Health check
curl https://seu-app.railway.app/api/ping

# Frontend
curl https://seu-app.railway.app
```

## 🐛 Troubleshooting

### Erro: "Cannot find module 'express'"
```bash
npm install express
```

### Erro: "Port already in use"
```bash
# Mudar porta no .env
PORT=3000
```

### Build falha
```bash
# Limpar cache e reinstalar
rm -rf node_modules dist
npm install
npm run build
```

## 📊 Monitoramento

Railway fornece automaticamente:
- Logs em tempo real
- Métricas de uso
- Deploys automáticos via Git

## 🔗 Links Úteis

- [Railway Docs](https://docs.railway.app)
- [Railway Status](https://status.railway.app)
- [Railway Discord](https://discord.gg/railway)

## 📝 Notas

- Build time: ~2-3 minutos
- Cold start: ~1-2 segundos
- Custo: Free tier disponível
- SSL/HTTPS: Automático
- Domínio: `*.railway.app` (customizável)

---

**Desenvolvido com ❤️ para BolãoMax**
