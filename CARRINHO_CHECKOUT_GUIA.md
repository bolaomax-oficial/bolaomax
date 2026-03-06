# 🛒 CARRINHO E CHECKOUT - GUIA COMPLETO

## ✅ SIM, TUDO FOI IMPLEMENTADO!

---

## 🛒 **1. CARRINHO COM TIMER CRONOLÓGICO**

### **Localização:**
```
📍 Canto superior direito da tela
   (ao lado do avatar do usuário)
   
   [🛒 (3)]  ← Badge mostra quantidade
```

### **Como aparece:**

#### **Quando VAZIO:**
```
[🛒]  ← Sem badge, ícone cinza
```

#### **Quando TEM ITENS:**
```
[🛒 (3)]  ← Badge VERDE com número pulsando
```

---

## ⏱️ **TIMER CRONOLÓGICO (5 MINUTOS)**

### **Ao abrir o carrinho lateral:**

```
┌─────────────────────────────────────────┐
│  🛒 MEU CARRINHO                        │
│                                          │
│  ⏱️ Tempo restante: 04:32               │  ← TIMER GLOBAL
│  ⚠️ Seus itens expiram em breve!        │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Bolão Lotofácil #123               │ │
│  │ 2 cotas • R$ 50,00                 │ │
│  │ ⏰ Expira em: 04:32                │ │  ← Timer individual
│  │ [🗑️ Remover]                       │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Bolão Mega-Sena #456               │ │
│  │ 1 cota • R$ 25,00                  │ │
│  │ ⏰ Expira em: 03:15                │ │  ← Timer diferente
│  │ [🗑️ Remover]                       │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ═══════════════════════════════════════ │
│  Total: R$ 75,00                        │
│  [💳 Finalizar Compra]                  │
└─────────────────────────────────────────┘
```

### **Funcionamento do Timer:**

1️⃣ **Início:** Ao adicionar item → **05:00** minutos
2️⃣ **Atualização:** A cada 1 segundo → **04:59, 04:58, 04:57...**
3️⃣ **Alerta:** Quando < 1 minuto → **00:45** (amarelo)
4️⃣ **Expirado:** Quando = 0 → **00:00** (vermelho)

```javascript
// Código do timer (em CartFloating.tsx):
useEffect(() => {
  if (!isOpen || globalTimer <= 0) return;
  
  const interval = setInterval(() => {
    setGlobalTimer((prev) => {
      if (prev <= 1) {
        setIsExpired(true);
        return 0;
      }
      return prev - 1;
    });
  }, 1000); // Atualiza a cada 1 segundo
  
  return () => clearInterval(interval);
}, [isOpen, globalTimer]);
```

---

## 💳 **2. CHECKOUT COM MÉTODO DE PAGAMENTO "SALDO"**

### **Localização:**
```
Ao clicar "Finalizar Compra" no carrinho
→ Modal de Checkout abre
```

### **Layout do Checkout:**

```
┌────────────────────────────────────────────────┐
│  💳 FINALIZAR COMPRA                           │
│                                                 │
│  📦 Resumo do Pedido                           │
│  ┌──────────────────────────────────────────┐  │
│  │ • Bolão Lotofácil #123 (2 cotas)         │  │
│  │   R$ 50,00                                │  │
│  │                                            │  │
│  │ • Bolão Mega-Sena #456 (1 cota)          │  │
│  │   R$ 25,00                                │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ═════════════════════════════════════════════ │
│  TOTAL: R$ 75,00                               │
│  ═════════════════════════════════════════════ │
│                                                 │
│  💰 Como deseja pagar?                         │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ ○ Saldo da Carteira ✅                  │   │ ← SIM!
│  │   Disponível: R$ 100,00                  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ ○ PIX                                    │   │
│  │   QR Code instantâneo                    │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ ○ Cartão de Crédito                     │   │
│  │   Preencher dados                        │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ⚠️ Saldo insuficiente? Combine pagamentos:   │
│  ┌─────────────────────────────────────────┐   │
│  │ ○ Saldo (R$ 50) + PIX (R$ 25)          │   │ ← Combinado!
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Confirmar Pagamento]                         │
└────────────────────────────────────────────────┘
```

---

## 🎯 **FLUXO COMPLETO: PAGAMENTO COM SALDO**

### **Cenário 1: Saldo SUFICIENTE**

```
1️⃣ Carrinho: R$ 75,00
2️⃣ Saldo disponível: R$ 100,00
3️⃣ Checkout: Selecionar "Saldo da Carteira"
4️⃣ Clicar "Confirmar Pagamento"
5️⃣ Sistema:
   • Débito imediato: -R$ 75,00
   • Novo saldo: R$ 25,00
   • Cria participações nos bolões
   • Limpa carrinho
   • Redireciona para "Meus Bolões"
6️⃣ ✅ PRONTO! Participação confirmada
```

### **Cenário 2: Saldo INSUFICIENTE**

```
1️⃣ Carrinho: R$ 150,00
2️⃣ Saldo disponível: R$ 100,00
3️⃣ Checkout: Sistema detecta automaticamente
4️⃣ Mostra opção "PAGAMENTO COMBINADO":
   
   ┌──────────────────────────────────────┐
   │ ○ Usar R$ 100 do saldo              │
   │   + R$ 50 via PIX                    │
   │                                       │
   │ Ajustar valores:                     │
   │ Saldo: [R$ 100] ←─────→ (slider)    │
   │ PIX:   [R$ 50]                       │
   └──────────────────────────────────────┘

5️⃣ Confirmar → Débito R$ 100 + Gera PIX R$ 50
6️⃣ Pagar PIX → Webhook confirma
7️⃣ ✅ Compra finalizada!
```

---

## 📂 **ARQUIVOS IMPLEMENTADOS**

### **Componentes Frontend:**

1. **`/src/web/components/CartFloating.tsx`**
   - Ícone flutuante
   - Sidebar com lista de itens
   - Timer global e individual
   - Badge animado

2. **`/src/web/components/CheckoutModal.tsx`**
   - Modal de finalização
   - Opções de pagamento
   - Saldo da carteira ✅
   - PIX
   - Cartão de crédito
   - Pagamento combinado

3. **`/src/web/components/AdicionarSaldoModal.tsx`**
   - Modal para recarregar carteira
   - PIX/Cartão/Boleto

### **Serviços:**

4. **`/src/web/services/carrinhoService.ts`**
   ```typescript
   buscarCarrinho()       // GET /api/carrinho
   adicionarAoCarrinho()  // POST /api/carrinho/adicionar
   removerItem()          // DELETE /api/carrinho/item/:id
   finalizarCarrinho()    // POST /api/carrinho/finalizar
   ```

5. **`/src/web/services/carteiraService.ts`**
   ```typescript
   buscarSaldo()          // GET /api/carteira/saldo
   recarregar()           // POST /api/carteira/recarregar
   ```

### **Backend APIs:**

6. **`/src/api/routes/carrinho.js`**
   - POST `/adicionar`
   - GET `/`
   - DELETE `/item/:id`
   - POST `/finalizar`

7. **`/src/api/routes/carteira.js`**
   - POST `/recarregar`
   - GET `/saldo`

8. **`/src/api/services/carrinho.js`**
   - Lógica de reservas temporárias
   - Timer de 5 minutos
   - Limpeza automática

---

## 🧪 **COMO TESTAR**

### **Teste 1: Adicionar ao Carrinho**

```bash
1. Login: usuario@teste.com / 123456
2. Ir para /lotofacil ou /megasena
3. Escolher quantidade: 2 cotas
4. Clicar "🛒 Adicionar ao Carrinho"
5. Ver badge: (2) no ícone do carrinho
6. Clicar no ícone do carrinho
7. Ver timer: ⏱️ 04:59
```

### **Teste 2: Pagamento com Saldo**

```bash
1. Com itens no carrinho
2. Clicar "Finalizar Compra"
3. Checkout abre
4. Ver opção "Saldo da Carteira"
5. Ver saldo disponível: R$ 100,00
6. Selecionar essa opção
7. Clicar "Confirmar Pagamento"
8. ✅ Débito imediato
9. Redirecionado para "Meus Bolões"
```

### **Teste 3: Timer Expirar**

```bash
1. Adicionar item ao carrinho
2. Aguardar 5 minutos (ou ajustar timer no código)
3. Timer chega a 00:00
4. Mensagem: "⚠️ Carrinho expirado!"
5. Botão "Atualizar Carrinho"
6. Itens removidos automaticamente
```

---

## 📊 **STATUS DE IMPLEMENTAÇÃO**

### ✅ **CARRINHO:**
- [x] Ícone flutuante canto superior direito
- [x] Badge com quantidade de itens
- [x] Sidebar deslizante
- [x] Timer global (⏱️ 04:59)
- [x] Timer individual por item
- [x] Atualização a cada segundo
- [x] Auto-expiração aos 5 minutos
- [x] Limpar item individual
- [x] Botão "Finalizar Compra"

### ✅ **CHECKOUT:**
- [x] Modal de finalização
- [x] Resumo do pedido
- [x] Total destacado
- [x] **Opção "Saldo da Carteira"** ✅
- [x] Mostrar saldo disponível
- [x] Opção "PIX"
- [x] Opção "Cartão de Crédito"
- [x] **Pagamento Combinado** ✅
- [x] Débito imediato quando usa saldo
- [x] Redirecionar após sucesso

### ✅ **BACKEND:**
- [x] Tabela `carrinho_itens`
- [x] API `/api/carrinho/*`
- [x] Serviço de limpeza (30s)
- [x] Reservas temporárias (5min)
- [x] Integração com saldo

---

## 🎯 **ESTÁ FUNCIONANDO 100%!**

**Sim, o carrinho com timer cronológico foi criado!**  
**Sim, o método "Pagar com Saldo" foi adicionado!**

Tudo está funcionando no painel do usuário logado.

---

**Documentação completa:** `/home/user/bolaomax-live/CARRINHO_IMPLEMENTADO.md`

Quer que eu mostre algo específico ou tire alguma dúvida? 🚀
