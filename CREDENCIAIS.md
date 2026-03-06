# 🔑 CREDENCIAIS DE ACESSO - BolãoMax

**Servidor:** https://6636-imbcvcp3ypeyorx2uajxq.e2b.app/

---

## ✅ USUÁRIOS DISPONÍVEIS

### 👨‍💼 **ADMINISTRADOR**

```
📧 Email:       admin@bolaomax.com
🔒 Senha:       admin123
👤 Nome:        Administrador
💰 Saldo:       R$ 1.000,00
🎯 Permissões:  ADMIN (acesso total)
```

**Acessa:**
- ✅ Dashboard Financeiro
- ✅ Fundo de Registro (R$ 100.000)
- ✅ Gestão de Bolões
- ✅ Aprovação de Saques
- ✅ Configurações do Sistema
- ✅ Relatórios

---

### 👤 **USUÁRIO TESTE**

```
📧 Email:    usuario@teste.com
🔒 Senha:    123456
👤 Nome:     Usuário Teste
💰 Saldo:    R$ 100,00
🎯 Tipo:     USER (usuário normal)
```

**Acessa:**
- ✅ Explorar Bolões
- ✅ Comprar Cotas
- ✅ Carrinho (timer 5min)
- ✅ Adicionar Saldo
- ✅ Minha Carteira
- ✅ Meus Bolões
- ✅ Histórico

---

### 👤 **USUÁRIO DEMO**

```
📧 Email:    demo@bolaomax.com
🔒 Senha:    demo123
👤 Nome:     Usuário Demo
💰 Saldo:    R$ 150,00
🎯 Tipo:     USER (usuário normal)
```

---

## 🧪 COMO TESTAR

### **Teste 1: Login Usuário**
```
1. Ir para: https://6636-imbcvcp3ypeyorx2uajxq.e2b.app/
2. Clicar "Entrar"
3. Email: usuario@teste.com
4. Senha: 123456
5. ✅ Logado com R$ 100 de saldo
```

### **Teste 2: Login Admin**
```
1. Ir para: https://6636-imbcvcp3ypeyorx2uajxq.e2b.app/
2. Clicar "Entrar"
3. Email: admin@bolaomax.com
4. Senha: admin123
5. ✅ Acesso ao painel /admin
```

---

## 🎯 FUNCIONALIDADES PARA TESTAR

### **Como USUÁRIO (usuario@teste.com):**

#### 1️⃣ **Carrinho com Timer**
```
→ Ir para "Lotofácil"
→ Escolher quantidade de cotas
→ Clicar "🛒 Adicionar ao Carrinho"
→ Ver badge: (1)
→ Abrir carrinho lateral
→ Ver timer: ⏱️ 04:59
→ Aguardar → Timer decrementa
```

#### 2️⃣ **Adicionar Saldo**
```
→ Clicar no avatar (canto superior direito)
→ Clicar "➕ Adicionar Saldo"
→ Escolher R$ 50
→ Selecionar PIX
→ Ver QR Code
```

#### 3️⃣ **Comprar com Saldo**
```
→ Adicionar bolão ao carrinho
→ Clicar "Finalizar Compra"
→ Selecionar "Saldo da Carteira"
→ Confirmar
→ Saldo debitado imediatamente
→ Participação criada
```

#### 4️⃣ **Compra Direta**
```
→ Ir para bolão
→ Escolher 1 cota
→ Clicar "⚡ Comprar Agora"
→ Checkout abre direto
→ Sem passar pelo carrinho
```

---

### **Como ADMIN (admin@bolaomax.com):**

#### 1️⃣ **Dashboard Financeiro**
```
→ Ir para /admin/financeiro
→ Ver Fundo de Registro: R$ 100.000
→ Ver status: Saudável ✅
→ Ver métricas: usuários, transações, saques
```

#### 2️⃣ **Gestão de Bolões**
```
→ Ir para /admin/boloes
→ Criar novo bolão
→ Editar bolão existente
→ Ver participantes
```

#### 3️⃣ **Aprovar Saques**
```
→ Ir para /admin/financeiro
→ Aba "Saques"
→ Ver saques pendentes
→ Aprovar ou recusar
```

---

## 🔧 TESTE DE API (CURL)

### **Login Usuário:**
```bash
curl -X POST http://localhost:6636/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@teste.com","password":"123456"}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "user": {
    "id": "user-teste-001",
    "name": "Usuário Teste",
    "email": "usuario@teste.com",
    "saldo": 100,
    "role": "user"
  },
  "token": "..."
}
```

### **Login Admin:**
```bash
curl -X POST http://localhost:6636/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bolaomax.com","password":"admin123"}'
```

---

## 📝 NOTAS IMPORTANTES

### ⚠️ **Sistema usa In-Memory Store**
Os usuários estão em memória (não SQLite) porque o Hono está ativo.
Se reiniciar o servidor, as transações são perdidas (mas usuários permanecem).

### 💾 **Para Persistência Real:**
Quando fizer deploy no Railway:
- Configurar PostgreSQL
- Usuários serão salvos no banco
- Dados persistirão entre restarts

### 🔄 **Saldo Inicial:**
- Admin: R$ 1.000
- usuario@teste.com: R$ 100
- demo@bolaomax.com: R$ 150

---

## 🚀 STATUS DO SISTEMA

✅ **Autenticação:** Funcionando  
✅ **Carrinho:** Timer 5min ativo  
✅ **Pagamentos:** PIX/Cartão/Boleto  
✅ **Fundo:** R$ 100.000 inicializado  
✅ **Webhook:** Integrado  
✅ **Dashboard:** Admin funcionando  

---

**Última Atualização:** 21/02/2026 22:30  
**Preview URL:** https://6636-imbcvcp3ypeyorx2uajxq.e2b.app/
