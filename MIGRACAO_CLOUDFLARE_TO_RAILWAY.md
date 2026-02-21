# 🔄 Guia de Migração: Cloudflare → Node.js + Railway

## 📋 O que Mudou?

### ❌ Removido (Cloudflare)
```diff
- @cloudflare/vite-plugin
- wrangler
- Cloudflare Workers runtime
- .wrangler/ directory
- wrangler.json
- tsconfig.worker.json
- worker-configuration.d.ts
```

### ✅ Adicionado (Node.js + Railway)
```diff
+ express (servidor web)
+ server.js (ponto de entrada)
+ railway.json (config Railway)
+ Procfile (config alternativa)
+ build.sh (script de build)
+ DEPLOY_RAILWAY.md (guia deploy)
```

---

## 🏗️ Nova Arquitetura

### Antes (Cloudflare Workers)
```
┌─────────────────────────────────────┐
│ Cloudflare Workers (Edge Runtime)  │
│  ├─ Hono API                        │
│  └─ Static Assets (R2/Pages)        │
└─────────────────────────────────────┘
```

### Depois (Node.js + Railway)
```
┌─────────────────────────────────────┐
│ Railway (Container)                 │
│  ┌─────────────────────────────────┐│
│  │ Express Server (Node.js)        ││
│  │  ├─ API Routes (/api/*)         ││
│  │  └─ Static Files (dist/)        ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## 🔧 Alterações nos Arquivos

### 1. `package.json`

**Antes:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "deploy": "wrangler deploy"
  },
  "devDependencies": {
    "@cloudflare/vite-plugin": "^1.20.1",
    "wrangler": "^4.58.0"
  }
}
```

**Depois:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

### 2. `vite.config.ts`

**Antes:**
```typescript
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    react(), 
    cloudflare(),  // ❌ Removido
    tailwind()
  ]
});
```

**Depois:**
```typescript
export default defineConfig({
  plugins: [
    react(), 
    tailwind()  // ✅ Sem cloudflare
  ],
  server: {
    host: '0.0.0.0',
    port: 5174
  }
});
```

### 3. `server.js` (NOVO)

```javascript
import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5174;

// API Routes
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Pong!' });
});

// Serve static files
app.use(express.static('dist'));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 🚀 Como Migrar

### Passo 1: Limpar Dependências Cloudflare
```bash
npm uninstall @cloudflare/vite-plugin wrangler
```

### Passo 2: Instalar Dependências Node.js
```bash
npm install express
npm install --save-dev @types/express
```

### Passo 3: Atualizar Arquivos
- Copie `server.js`
- Atualize `vite.config.ts`
- Atualize `package.json`

### Passo 4: Testar Localmente
```bash
# Build
npm run build

# Testar servidor
npm start

# Verificar
curl http://localhost:5174/api/ping
```

### Passo 5: Deploy no Railway
```bash
# Via CLI
railway init
railway up

# Via Dashboard
# 1. Conectar GitHub repo
# 2. Railway detecta automaticamente
# 3. Deploy automático
```

---

## 🔍 Diferenças de Comportamento

### 1. **Cold Start**
- **Cloudflare:** ~0ms (edge always on)
- **Railway:** ~1-2s (container spin up)

### 2. **Escalabilidade**
- **Cloudflare:** Automática, global
- **Railway:** Vertical, regional (upgradeable)

### 3. **Custo**
- **Cloudflare:** Free até 100k req/dia
- **Railway:** Free tier: $5 crédito/mês

### 4. **Deploy**
- **Cloudflare:** `wrangler deploy`
- **Railway:** Git push (auto-deploy)

### 5. **Logs**
- **Cloudflare:** Wrangler tail / Dashboard
- **Railway:** Dashboard / CLI logs

---

## ✅ Checklist de Migração

- [ ] Remover dependências Cloudflare
- [ ] Instalar Express
- [ ] Criar `server.js`
- [ ] Atualizar `vite.config.ts`
- [ ] Atualizar `package.json`
- [ ] Remover arquivos `.wrangler/`
- [ ] Criar `railway.json`
- [ ] Testar build local
- [ ] Testar servidor local
- [ ] Deploy no Railway
- [ ] Verificar endpoints API
- [ ] Verificar frontend
- [ ] Configurar domínio (opcional)

---

## 🎯 Vantagens da Migração

### ✅ Vantagens
- 🔧 **Mais controle** sobre servidor
- 🐳 **Docker support** nativo
- 📦 **npm packages** full support
- 🗄️ **Database** fácil integração
- 🔌 **WebSockets** suporte nativo
- 📊 **Logs** melhores ferramentas

### ⚠️ Trade-offs
- ⏱️ Cold start ~1-2s
- 🌍 Não é edge (mas Railway tem múltiplas regiões)
- 💰 Custo depois do free tier

---

## 🆘 Troubleshooting

### Erro: "Cannot find module 'express'"
```bash
npm install express
```

### Erro: "Port 5174 already in use"
```bash
# Matar processo na porta
npx kill-port 5174

# Ou mudar porta
PORT=3000 npm start
```

### Build falha
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Deploy falha no Railway
1. Verificar logs no dashboard
2. Verificar `railway.json` está correto
3. Verificar `package.json` tem `"type": "module"`
4. Verificar comando start: `node server.js`

---

## 📞 Suporte

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Express Docs: https://expressjs.com

---

**Migração completa! 🎉**
Seu projeto agora roda em Node.js puro e está pronto para Railway.
