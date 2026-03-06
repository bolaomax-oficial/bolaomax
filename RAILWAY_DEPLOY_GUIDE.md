# 🚀 Deploy BolãoMax no Railway

Guia completo para fazer deploy do BolãoMax no Railway com PostgreSQL.

---

## 📋 Pré-requisitos

- ✅ Conta no [GitHub](https://github.com)
- ✅ Conta no [Railway](https://railway.app)
- ✅ Código do BolãoMax pronto

---

## 🔧 Etapa 1: Preparar Repositório GitHub

### 1.1 Criar repositório no GitHub

1. Acesse https://github.com/new
2. Nome: `bolaomax`
3. Descrição: `Plataforma de Bolões de Loteria Online`
4. **Importante:** NÃO marcar "Initialize with README"
5. Clique em "Create repository"

### 1.2 Subir código para o GitHub

```bash
cd /home/user/bolaomax-live

# Inicializar git (se ainda não iniciou)
git init

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "feat: setup inicial BolãoMax"

# Conectar ao repositório remoto
git remote add origin https://github.com/SEU_USUARIO/bolaomax.git

# Push para o GitHub
git branch -M main
git push -u origin main
```

---

## 🚂 Etapa 2: Criar Projeto no Railway

### 2.1 Novo Projeto

1. Acesse https://railway.app
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Autorize o Railway a acessar seus repositórios
5. Selecione o repositório `bolaomax`

### 2.2 Adicionar PostgreSQL

1. No projeto Railway, clique em "+ New"
2. Selecione "Database"
3. Escolha "PostgreSQL"
4. Railway criará o database automaticamente

---

## ⚙️ Etapa 3: Configurar Variáveis de Ambiente

### 3.1 Pegar URL do PostgreSQL

1. Clique no serviço "PostgreSQL"
2. Vá para aba "Variables"
3. Copie o valor de `DATABASE_URL`

Exemplo:
```
postgresql://postgres:senha123@containers-us-west-123.railway.app:5432/railway
```

### 3.2 Configurar variáveis no serviço BolãoMax

1. Clique no serviço "bolaomax" (seu app)
2. Vá para aba "Variables"
3. Clique em "+ New Variable"
4. Adicione as seguintes variáveis:

```bash
# Database
DATABASE_URL=postgresql://postgres:senha@host:5432/railway
# (cole a URL copiada do PostgreSQL)

# Servidor
PORT=3000
NODE_ENV=production

# Autenticação (gerar secret)
SECRET_KEY=SEU_SECRET_KEY_AQUI_32_CARACTERES

# Site URL
SITE_URL=https://seu-dominio.up.railway.app

# PagSeguro (opcional - configurar depois)
PAGSEGURO_EMAIL=
PAGSEGURO_TOKEN=
PAGSEGURO_SANDBOX=true

# Frontend
VITE_API_URL=https://seu-dominio.up.railway.app/api
```

### 3.3 Gerar SECRET_KEY

No terminal local:
```bash
openssl rand -base64 32
```

Copie o resultado e cole em `SECRET_KEY`.

---

## 🗄️ Etapa 4: Aplicar Migrations

### 4.1 Via Railway CLI (recomendado)

1. Instalar Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login:
```bash
railway login
```

3. Conectar ao projeto:
```bash
railway link
```

4. Aplicar migrations:
```bash
railway run npm run db:migrate:pg
```

5. Popular database:
```bash
railway run npm run db:seed:pg
```

### 4.2 Alternativa: Via código

Adicione ao `server-express.js` (início do arquivo):

```javascript
// Auto-migrate on startup (apenas produção)
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  import('./src/api/database/migrate-postgres.js')
    .then(m => m.migrate())
    .then(() => import('./src/api/database/seed-postgres.js'))
    .then(s => s.seed())
    .catch(err => console.error('Migration error:', err));
}
```

---

## 🚀 Etapa 5: Deploy

### 5.1 Build e Deploy Automático

O Railway detecta automaticamente:
- ✅ `package.json` existe
- ✅ Script `start` configurado
- ✅ Porta definida via `PORT`

### 5.2 Verificar Deploy

1. No Railway, vá para aba "Deployments"
2. Acompanhe os logs do build
3. Quando aparecer ✅ "Success", seu app está no ar!

### 5.3 Acessar o site

1. Vá para aba "Settings"
2. Em "Domains", clique em "Generate Domain"
3. Railway criará uma URL tipo: `bolaomax.up.railway.app`
4. Acesse essa URL!

---

## ✅ Etapa 6: Testar

### 6.1 Acessar Admin

1. Acesse: `https://seu-dominio.up.railway.app/login`
2. Use as credenciais:
   - Email: `admin@bolaomax.com`
   - Senha: `admin123`

3. Acesse: `https://seu-dominio.up.railway.app/admin/boloes`
4. Você deve ver os 4 bolões criados pelos seeds!

### 6.2 Testar APIs

```bash
# Health check
curl https://seu-dominio.up.railway.app/api/ping

# Listar bolões (precisa token)
curl -H "Authorization: Bearer temp-token" \
  https://seu-dominio.up.railway.app/api/admin/boloes
```

---

## 🔄 Etapa 7: Deploy Contínuo

Agora toda vez que você fizer `git push`:

1. Railway detecta mudança automaticamente
2. Faz build do projeto
3. Deploy automático
4. Zero downtime!

```bash
# Fazer mudança no código
git add .
git commit -m "feat: nova funcionalidade"
git push

# Railway faz deploy automaticamente! 🚀
```

---

## 🐛 Troubleshooting

### Problema: Build falhou

**Solução:** Verificar logs no Railway:
```
1. Aba "Deployments"
2. Clicar no deployment com erro
3. Ver logs detalhados
```

### Problema: Database connection error

**Solução:** Verificar `DATABASE_URL`:
```bash
# No Railway, aba Variables
# Copiar novamente a URL do PostgreSQL
# Colar em DATABASE_URL do serviço bolaomax
```

### Problema: Migrations não aplicadas

**Solução:** Rodar manualmente:
```bash
railway run npm run db:migrate:pg
railway run npm run db:seed:pg
```

### Problema: 500 Internal Server Error

**Solução:** Ver logs em tempo real:
```bash
railway logs --follow
```

---

## 📚 Comandos Úteis

```bash
# Ver logs em tempo real
railway logs --follow

# Rodar comando no Railway
railway run npm run db:seed:pg

# Abrir shell no container
railway run bash

# Ver status do projeto
railway status

# Abrir projeto no browser
railway open
```

---

## 🎯 Checklist Final

- [ ] Código no GitHub
- [ ] Projeto criado no Railway
- [ ] PostgreSQL adicionado
- [ ] Variáveis configuradas
- [ ] Migrations aplicadas
- [ ] Seeds executados
- [ ] Site acessível
- [ ] Login funcionando
- [ ] Admin carregando bolões

---

## 🔐 Segurança

### Produção:

1. **Trocar senhas padrão:**
```sql
-- Conectar ao PostgreSQL via Railway
UPDATE users SET password_hash = 'novo_hash' 
WHERE email = 'admin@bolaomax.com';
```

2. **Configurar Better Auth** (próxima etapa)

3. **Habilitar HTTPS** (Railway faz automaticamente)

4. **Configurar CORS** adequadamente no `server-express.js`

---

## 📞 Suporte

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Drizzle Docs: https://orm.drizzle.team

---

✅ **Pronto! Seu BolãoMax está no ar!** 🎉
