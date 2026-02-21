# 🛠️ Comandos Úteis - BolãoMax

## 📦 Instalação

```bash
# Instalar todas as dependências
npm install

# Instalar apenas produção
npm install --production

# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 🏗️ Build

```bash
# Build para produção
npm run build

# Build com log detalhado
npm run build -- --debug

# Build otimizado (via script)
./build.sh

# Limpar build anterior
rm -rf dist/
```

---

## 🚀 Desenvolvimento

```bash
# Rodar em modo dev (HMR)
npm run dev

# Dev em porta específica
PORT=3000 npm run dev

# Dev com logs detalhados
DEBUG=* npm run dev
```

---

## 🌐 Produção (Local)

```bash
# Build + Start
npm run build && npm start

# Apenas start (requer build prévio)
npm start

# Start em porta específica
PORT=8080 npm start

# Preview do build (Vite)
npm run preview
```

---

## 🚂 Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar projeto
railway init

# Deploy
railway up

# Ver logs
railway logs

# Abrir no browser
railway open

# Variáveis de ambiente
railway variables set PORT=5174

# Ver status
railway status

# Rollback
railway rollback
```

---

## 🧪 Testes

```bash
# Testar API local
curl http://localhost:5174/api/ping

# Testar com watch (arquivo muda, recarrega)
curl -w "@curl-format.txt" http://localhost:5174/api/ping

# Health check
curl -I http://localhost:5174

# Testar POST
curl -X POST http://localhost:5174/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'
```

---

## 🐛 Debug

```bash
# Ver processos na porta 5174
lsof -i :5174

# Matar processo na porta
npx kill-port 5174

# Ver logs do servidor
tail -f logs/*.log

# Verificar versão Node
node --version

# Verificar npm packages
npm list --depth=0

# Audit de segurança
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## 📊 Análise

```bash
# Tamanho do build
du -sh dist/

# Listar arquivos do build
ls -lh dist/

# Bundle analyzer (requer plugin)
npm run build -- --analyze

# Ver dependências grandes
npm ls --depth=0 --prod --json | jq '.dependencies'
```

---

## 🔧 Manutenção

```bash
# Atualizar todas dependências
npm update

# Atualizar uma dependência específica
npm update express

# Ver dependências desatualizadas
npm outdated

# Limpar cache npm
npm cache clean --force

# Verificar integridade
npm ci
```

---

## 🗑️ Limpeza

```bash
# Limpar tudo
rm -rf node_modules dist .next .cache

# Limpar apenas build
rm -rf dist/

# Limpar logs
rm -rf logs/*.log

# Script completo de reset
npm run clean  # (se configurado)
```

---

## 📦 Deploy Manual

```bash
# 1. Build
npm run build

# 2. Comprimir
tar -czf bolaomax.tar.gz dist/ server.js package.json

# 3. Upload para servidor
scp bolaomax.tar.gz user@server:/path/

# 4. No servidor
tar -xzf bolaomax.tar.gz
npm install --production
PORT=80 node server.js
```

---

## 🔐 Variáveis de Ambiente

```bash
# Ver variáveis atuais
env | grep -i bolao

# Definir temporariamente
export PORT=3000

# Definir no .env (criar arquivo)
echo "PORT=3000" > .env

# Railway
railway variables set PORT=3000
railway variables set NODE_ENV=production
```

---

## 📝 Git

```bash
# Status
git status

# Commit
git add .
git commit -m "feat: migração para Railway"

# Push
git push origin main

# Ver diferenças
git diff

# Ver histórico
git log --oneline

# Reverter mudanças
git checkout -- arquivo.js
```

---

## 🚀 CI/CD (GitHub Actions exemplo)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm test
```

---

## 💡 Dicas Rápidas

```bash
# Ver porta que app está usando
netstat -tuln | grep :5174

# Reiniciar servidor rapidamente
pkill -f "node server.js" && npm start

# Build + Deploy automático
npm run build && railway up

# Ver uso de memória
ps aux | grep node

# Monitorar logs em tempo real
tail -f logs/app.log | grep ERROR
```

---

## 📚 Scripts Personalizados (adicionar ao package.json)

```json
{
  "scripts": {
    "clean": "rm -rf dist node_modules",
    "reset": "npm run clean && npm install",
    "build:prod": "NODE_ENV=production npm run build",
    "start:prod": "NODE_ENV=production node server.js",
    "logs": "railway logs",
    "deploy": "npm run build && railway up"
  }
}
```

---

**Comandos prontos para usar! 🎯**
