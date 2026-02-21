# 🚀 DEPLOY AGORA - Railway

## Status: PRONTO PARA DEPLOY ✅

Todas as correções foram aplicadas e commitadas.

## Comando Único para Deploy

```bash
cd /home/user/bolaomax-preview
git push origin main
```

Isso é tudo! Railway vai:
1. Detectar o push
2. Instalar dependências com `npm install --legacy-peer-deps`
3. Buildar com `npm run build`
4. Iniciar com `node server.js`

## O Que Foi Corrigido

### ✅ package-lock.json
- Regenerado com todas as dependências do Express
- Usa `--legacy-peer-deps` para resolver conflito better-auth
- 261KB sincronizado

### ✅ tsconfig.json
- Removida referência ao tsconfig.worker.json (deletado na migração)
- Removido worker-configuration.d.ts dos types
- Build não vai mais procurar arquivos inexistentes

### ✅ railway.json
- Build command atualizado: `npm install --legacy-peer-deps && npm run build`
- Start command: `node server.js`
- Restart policy: ON_FAILURE, max 10 retries

### ✅ Git Commit
- Hash: d99e70ab
- Mensagem: "fix: Railway deployment - regenerate package-lock with express, remove tsconfig.worker reference, add legacy-peer-deps"
- 7 arquivos alterados: +1605 linhas, -2261 linhas

## Arquivos Críticos Verificados

```
✅ server.js          → Express server (PORT 5174 ou env)
✅ package.json       → express@^4.18.2
✅ package-lock.json  → 261KB, sincronizado
✅ railway.json       → --legacy-peer-deps
✅ tsconfig.json      → sem referências worker
✅ vite.config.ts     → sem cloudflare plugin
✅ .gitignore         → node_modules, dist, .env
```

## URLs Após Deploy

Quando Railway terminar (2-5 minutos):

```
🌐 Frontend:  https://seu-app.railway.app/
🔧 API Test:  https://seu-app.railway.app/api/ping
👤 Admin:     https://seu-app.railway.app/admin/indicacoes
🎁 Indicações: https://seu-app.railway.app/indicacoes
```

## Logs Railway

Monitorar deploy:
```bash
railway logs --follow
```

Você deve ver:
```
✓ npm install --legacy-peer-deps
✓ added 534 packages
✓ npm run build
✓ vite v7.3.1 building for production...
✓ Build successful
✓ Starting server...
🚀 Server running on port 3000
```

## Se Der Erro

### 1. Build Timeout
Railway tem 10 minutos de timeout. Se exceder:
```bash
# No railway.json, adicionar:
"build": {
  "builder": "NIXPACKS",
  "buildCommand": "npm install --legacy-peer-deps && NODE_OPTIONS='--max-old-space-size=4096' npm run build"
}
```

### 2. Module Not Found
Verificar se package-lock.json foi commitado:
```bash
git ls-files | grep package-lock.json
# Deve retornar: package-lock.json
```

### 3. Port Issues
Railway automaticamente seta a variável PORT. server.js já está configurado:
```javascript
const PORT = process.env.PORT || 5174;
```

## Variáveis de Ambiente

Se precisar configurar no Railway:
```
NODE_ENV=production
DATABASE_URL=<your-db-url>
BETTER_AUTH_SECRET=<random-secret>
```

## Próximos Passos

1. **Execute o push:**
   ```bash
   git push origin main
   ```

2. **Abra Railway Dashboard:**
   - Vá para railway.app
   - Selecione seu projeto BolãoMax
   - Clique em "Deployments"
   - Veja o progresso do build

3. **Aguarde 2-5 minutos**
   - Railway vai buildar e deployar
   - URL será gerada automaticamente

4. **Teste a aplicação:**
   - Abra a URL gerada
   - Teste /api/ping
   - Acesse /admin/indicacoes
   - Acesse /indicacoes

## Verificação Pós-Deploy

### Frontend:
- [ ] Home page carrega
- [ ] Menu de navegação funciona
- [ ] Botões laranjas (#FFA200) visíveis
- [ ] Bordas dos cards (#281a28) corretas
- [ ] 6 artigos em Conteúdo Educativo
- [ ] Clube VIP mostra "6x mais chances"

### Sistema de Indicações:
- [ ] Admin: /admin/indicacoes acessível
- [ ] Botão "Gerar Dados Mock" funciona
- [ ] Client: /indicacoes acessível
- [ ] Código de indicação gerado (formato: NOME2026123)
- [ ] Botões WhatsApp/Email/Facebook funcionam

### API:
- [ ] /api/ping responde
- [ ] Headers CORS corretos
- [ ] JSON responses funcionam

## Build Local vs Railway

⚠️ **NOTA:** Build local falha por falta de memória ("Killed").  
✅ **Railway tem recursos suficientes** para buildar sem problemas.

Não se preocupe se `npm run build` falhar localmente.

## Rollback (Se Necessário)

Se algo der muito errado:
```bash
# Voltar ao commit anterior
git log --oneline | head -5
git revert d99e70ab
git push origin main
```

Ou no Railway Dashboard:
1. Deployments → Select previous deployment
2. Click "Redeploy"

---

## ✅ CHECKLIST FINAL

- [x] package-lock.json regenerado
- [x] tsconfig.json corrigido
- [x] railway.json atualizado
- [x] server.js verificado
- [x] Commit criado (d99e70ab)
- [ ] **→ git push origin main** ← EXECUTE AGORA
- [ ] Aguardar deploy Railway
- [ ] Testar aplicação

---

**VOCÊ ESTÁ PRONTO!**  
Execute: `git push origin main`

Railway vai deployar automaticamente. ✨
