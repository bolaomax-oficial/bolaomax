# ✅ BolãoMax - Autenticação Real Configurada

## 🔐 O que foi implementado

### 1. **Serviço de Autenticação** (`src/api/services/auth.js`)
- ✅ Hash de senhas com **bcrypt** (salt rounds: 10)
- ✅ Geração de **JWT tokens** (validade: 7 dias)
- ✅ Verificação de tokens
- ✅ Funções: `register()`, `login()`, `logout()`, `verifyAuth()`, `updatePassword()`

### 2. **Middlewares de Proteção** (`src/api/middleware/auth.js`)
- ✅ `requireAuth` - Bloqueia acesso sem token válido
- ✅ `requireAdmin` - Apenas administradores
- ✅ `requireRole(roles)` - Role customizada
- ✅ `requireSelfOrAdmin` - Próprio usuário ou admin
- ✅ `optionalAuth` - Auth opcional (não bloqueia)
- ✅ `rateLimit` - Limita requisições (anti-brute-force)
- ✅ `requireEmailVerified` - Apenas emails verificados

### 3. **Rotas de Autenticação** (`src/api/routes/auth.js`)
```
POST   /api/auth/register       - Criar conta
POST   /api/auth/login          - Fazer login
POST   /api/auth/logout         - Fazer logout
GET    /api/auth/me             - Verificar sessão
PUT    /api/auth/password       - Atualizar senha
POST   /api/auth/password/reset - Solicitar reset
```

### 4. **Rotas Admin Protegidas** (`server-express.js`)
Todas as rotas `/api/admin/*` agora requerem:
- ✅ Token válido
- ✅ Role = `admin`

### 5. **Frontend Atualizado** (`src/contexts/AuthContext.tsx`)
- ✅ Login real via API (removido mock)
- ✅ Token JWT salvo no localStorage
- ✅ Header `Authorization: Bearer TOKEN` automático
- ✅ Verificação de sessão ao carregar app
- ✅ Logout real

---

## 🧪 Testar Autenticação

### Credenciais disponíveis (seed data):

**Admin:**
- Email: `admin@bolaomax.com`
- Senha: `admin123`
- Role: `admin`
- Saldo: R$ 1.000,00

**Demo:**
- Email: `demo@bolaomax.com`
- Senha: `demo123`
- Role: `user`
- Saldo: R$ 100,00

---

## 🔧 Como funciona

### 1. Fazer Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bolaomax.com","password":"admin123"}'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "user": {
    "id": "user-admin-001",
    "name": "Administrador",
    "email": "admin@bolaomax.com",
    "role": "admin",
    "saldo": 1000
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Acessar Rota Protegida
```bash
curl http://localhost:3000/api/admin/boloes \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. Tentar Acessar Sem Token
```bash
curl http://localhost:3000/api/admin/boloes
```

**Resposta:**
```json
{
  "error": "Token não fornecido",
  "code": "NO_TOKEN"
}
```

### 4. Tentar Admin com Usuário Normal
```bash
# Login como demo (role: user)
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@bolaomax.com","password":"demo123"}' \
  | jq -r '.token')

# Tentar acessar admin
curl http://localhost:3000/api/admin/boloes \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta:**
```json
{
  "error": "Permissão negada",
  "code": "FORBIDDEN",
  "requiredRoles": ["admin"],
  "userRole": "user"
}
```

---

## 🌐 No Frontend (Preview)

### 1. Acesse `/login`
- Use: `admin@bolaomax.com` / `admin123`
- Token salvo automaticamente no localStorage

### 2. Acesse `/admin/boloes`
- Agora só funciona se estiver autenticado
- Token enviado automaticamente nos requests

### 3. Clique em "Sair"
- Token removido
- Redirecionado para login

---

## 🔐 Segurança Implementada

### ✅ Senhas
- **Bcrypt** com salt rounds = 10
- Hash armazenado, senha nunca em texto puro
- Comparação segura via `bcrypt.compare()`

### ✅ Tokens JWT
- Secret key: `process.env.SECRET_KEY`
- Expiração: 7 dias
- Payload: `{ id, email, role, name }`
- Assinado com HS256

### ✅ Rate Limiting
- Login: 5 tentativas / 5 minutos
- Registro: 3 tentativas / 5 minutos
- Reset senha: 3 tentativas / 1 hora

### ✅ Validações
- Email formato válido
- Senha mínimo 6 caracteres
- Nome obrigatório no registro
- Status da conta verificado

### ✅ Headers de Segurança
- CORS configurado
- Authorization via Bearer token
- Não revela se email existe (reset senha)

---

## 📝 Variáveis de Ambiente

Adicionar no `.env`:

```bash
# Secret para JWT (OBRIGATÓRIO)
SECRET_KEY=seu-secret-key-aqui-32-caracteres-minimo

# Opcional
TOKEN_EXPIRATION=7d
```

**Gerar secret seguro:**
```bash
openssl rand -base64 32
```

---

## 🚀 Próximos Passos

### Para Produção:

1. **Gerar SECRET_KEY real**
   ```bash
   openssl rand -base64 32
   ```

2. **Configurar no Railway**
   - Variável `SECRET_KEY` com valor gerado

3. **Popular Database PostgreSQL**
   ```bash
   railway run npm run db:seed:pg
   ```

4. **Trocar senhas padrão**
   - Admin: `admin123` → senha forte
   - Remover usuário demo

5. **Habilitar verificação de email** (futuro)
   - SendGrid, Mailgun, etc
   - Marcar `emailVerified = true` após verificação

6. **Implementar refresh tokens** (futuro)
   - Token de curta duração + refresh token
   - Melhor segurança

---

## 🐛 Troubleshooting

### Erro: "Token inválido ou expirado"
**Causa:** Token expirou (7 dias) ou SECRET_KEY mudou  
**Solução:** Fazer login novamente

### Erro: "Permissão negada"
**Causa:** Usuário não é admin  
**Solução:** Usar conta admin ou mudar role no database

### Erro: "Email ou senha incorretos"
**Causa:** Credenciais erradas ou usuário não existe  
**Solução:** Verificar credenciais ou criar conta

### Erro: "Muitas requisições"
**Causa:** Rate limit ativado  
**Solução:** Aguardar timeout (mostrado em `retryAfter`)

---

## ✅ Checklist de Segurança

- [x] Senhas com hash bcrypt
- [x] JWT tokens com expiração
- [x] Rotas admin protegidas
- [x] Rate limiting em auth
- [x] Validações de input
- [x] CORS configurado
- [x] Middleware de autorização
- [x] Verificação de role
- [ ] HTTPS em produção (Railway faz automaticamente)
- [ ] Verificação de email (implementar futuro)
- [ ] Refresh tokens (implementar futuro)
- [ ] 2FA (implementar futuro)

---

## 📚 Documentação das APIs

Ver arquivo: `API_AUTH_DOCS.md` (criar se necessário)

---

✅ **Autenticação Real Completa!** 🎉
