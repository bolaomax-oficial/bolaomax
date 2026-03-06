# 🛒 SISTEMA DE CARRINHO + RECARGA DE CARTEIRA

## ✅ IMPLEMENTADO COM SUCESSO!

Este documento descreve o sistema completo de carrinho com timer + checkout multipagamento implementado.

---

## 📋 FUNCIONALIDADES IMPLEMENTADAS

### 1️⃣ **Cards de Bolão com Dupla Ação**

Cada card de bolão agora tem:
- ✅ **Campo de quantidade**: Escolher quantas cotas comprar (padrão: 1)
- ✅ **Botão "🛒 Adicionar ao Carrinho"**: Reserva por 5 minutos (estilo outline)
- ✅ **Botão "⚡ Comprar Agora"**: Checkout direto (estilo filled verde)
- ✅ **Validações**: Desabilitado se bolão fechado ou sem cotas
- ✅ **Feedback visual**: Loading states e mensagens de sucesso/erro

---

### 2️⃣ **Carrinho Flutuante com Timer**

Componente `CartFloating.tsx` sempre visível:
- ✅ **Ícone no canto superior direito** com badge de quantidade
- ✅ **Badge animado** (pulse) quando tem itens
- ✅ **Sidebar deslizante** ao clicar
- ✅ **Timer regressivo global**: ⏱️ MM:SS
- ✅ **Timer individual por item**: Cada item mostra seu próprio countdown
- ✅ **Atualização automática**: Timer atualiza a cada segundo
- ✅ **Auto-refresh**: Recarrega carrinho quando expira
- ✅ **Lista de itens**: Nome bolão, tipo loteria, quantidade, valor
- ✅ **Botão remover**: Em cada item
- ✅ **Total geral**: Valor somado de todos os itens
- ✅ **Botão "Finalizar Compra"**: Abre checkout
- ✅ **Estados**: Loading, erro com retry, carrinho vazio

---

### 3️⃣ **Modal de Adicionar Saldo**

Componente `AdicionarSaldoModal.tsx`:
- ✅ **Botão no header**: "➕ Adicionar Saldo" no dropdown do usuário
- ✅ **Saldo atual exibido**: No topo do modal
- ✅ **Botões rápidos**: R$ 50, R$ 100, R$ 200, R$ 500
- ✅ **Input customizado**: Valor entre R$ 10 e R$ 10.000
- ✅ **3 Formas de pagamento**:
  - **PIX** (recomendado):
    - QR Code exibido
    - Código Pix Copia e Cola
    - Timer de expiração (30min)
    - Auto-atualização ao pagar
  - **Cartão de Crédito**:
    - Campos: número, nome, validade, CVV
    - Validação de cartão
    - Confirmação imediata
  - **Boleto Bancário**:
    - Link para download PDF
    - Prazo de 3 dias
    - Instruções de pagamento
- ✅ **Loading states**: Durante processamento
- ✅ **Success feedback**: Confirmação visual
- ✅ **Error handling**: Mensagens amigáveis

---

### 4️⃣ **Checkout com Múltiplas Formas**

Componente `CheckoutModal.tsx`:
- ✅ **Resumo do pedido**: Todos os itens do carrinho
- ✅ **Total destacado**: Valor final grande e claro
- ✅ **4 Opções de pagamento**:
  1. **Saldo da Carteira**: Se suficiente
  2. **PIX**: QR Code instantâneo
  3. **Cartão de Crédito**: Formulário completo
  4. **Pagamento Combinado**: Saldo + PIX/Cartão
- ✅ **Pagamento Combinado**:
  - Detecta automaticamente se saldo insuficiente
  - Mostra: "Usar R$ 50 do saldo + R$ 100 no PIX"
  - Slider para ajustar divisão
- ✅ **Processamento**:
  - **Com saldo**: Débito imediato + criação de participações
  - **PIX/Cartão**: Aguarda confirmação Pagar.me
- ✅ **Pós-compra**:
  - Limpa carrinho automaticamente
  - Redireciona para "Meus Bolões"
  - Notificação de sucesso

---

## 🗄️ BACKEND (APIs)

### **Rotas de Carrinho** (`/api/carrinho/`)
```
POST   /adicionar       - Adicionar item ao carrinho
GET    /                - Buscar carrinho do usuário
DELETE /item/:id        - Remover item específico
DELETE /limpar          - Limpar todo o carrinho
POST   /finalizar       - Finalizar compra
```

### **Rotas de Carteira** (`/api/carteira/`)
```
POST /recarregar        - Solicitar recarga (PIX/Cartão/Boleto)
GET  /recargas          - Histórico de recargas
GET  /saldo             - Saldo atual
```

### **Serviços Backend**
- ✅ `carrinho.js`: Gerencia reservas temporárias
- ✅ `recarga-carteira.js`: Processa adições de saldo
- ✅ **Limpeza automática**: A cada 30s expira reservas antigas
- ✅ **Webhook Pagar.me atualizado**: Detecta recargas de carteira

---

## 📊 DATABASE (Tabelas Criadas)

### `carrinho_itens`
Armazena itens no carrinho com expiração de 5 minutos:
```sql
- id (PK)
- user_id (FK → users)
- bolao_id (FK → boloes)
- quantidade_cotas
- valor_unitario
- valor_total
- expira_em (DATETIME)
- status (reservado, expirado, comprado, cancelado)
- criado_em
```

### `recarga_carteira`
Histórico de adições de saldo:
```sql
- id (PK)
- user_id (FK → users)
- valor
- forma_pagamento (pix, credit_card, boleto)
- gateway_transaction_id
- status (pendente, confirmado, cancelado, expirado)
- qr_code, qr_code_url, boleto_url
- expira_em
- confirmado_em
- metadata (JSON)
```

### Views e Triggers
- ✅ `v_carrinho_ativo`: View com itens ativos + tempo restante
- ✅ Trigger de expiração automática

---

## 🔄 FLUXOS IMPLEMENTADOS

### **Fluxo 1: Compra com Carrinho**
```
1. Usuário clica "🛒 Adicionar ao Carrinho" no bolão
2. Item reservado por 5 minutos
3. Badge do carrinho atualiza (ex: 3 itens)
4. Timer regressivo inicia: ⏱️ 04:59
5. Usuário adiciona mais bolões
6. Clica "Finalizar Compra"
7. Escolhe forma de pagamento
8. Se PIX: QR Code aparece
9. Usuário paga
10. Webhook Pagar.me confirma
11. Carteira creditada (se saldo) OU participações criadas
12. Carrinho limpo
13. Redirecionado para "Meus Bolões"
```

### **Fluxo 2: Compra Direta**
```
1. Usuário clica "⚡ Comprar Agora"
2. Vai direto para checkout
3. Escolhe pagamento
4. Processa imediatamente
5. Sem passar pelo carrinho
```

### **Fluxo 3: Adicionar Saldo**
```
1. Usuário clica "➕ Adicionar Saldo" no header
2. Escolhe valor (R$ 50, 100, 200, 500 ou customizado)
3. Seleciona PIX
4. QR Code aparece
5. Usuário paga no banco
6. Webhook Pagar.me detecta
7. Saldo creditado automaticamente
8. Modal exibe confirmação
9. Saldo atualizado no header
```

### **Fluxo 4: Pagamento Combinado**
```
1. Carrinho: R$ 150
2. Saldo da carteira: R$ 50
3. Checkout detecta: insuficiente
4. Mostra opção: "R$ 50 saldo + R$ 100 PIX"
5. Usuário confirma
6. Débito imediato de R$ 50
7. Gera PIX de R$ 100
8. Após pagar PIX: compra finalizada
```

---

## ⚙️ CONFIGURAÇÕES TÉCNICAS

### **Timer de Expiração**
- **Carrinho**: 5 minutos por item
- **PIX**: 30 minutos
- **Boleto**: 3 dias

### **Limpeza Automática**
- Roda a cada 30 segundos
- Marca reservas expiradas como `status=expirado`
- Libera cotas para outros usuários

### **Validações**
- ✅ Valor mínimo recarga: R$ 10
- ✅ Valor máximo recarga: R$ 10.000
- ✅ Quantidade mínima cotas: 1
- ✅ Verificação de cotas disponíveis
- ✅ Verificação de saldo suficiente

---

## 📝 SERVIÇOS FRONTEND

### `carrinhoService.ts`
```typescript
adicionarAoCarrinho(bolaoId, quantidadeCotas)
buscarCarrinho()
removerItem(itemId)
limparCarrinho()
finalizarCarrinho(formaPagamento)
```

### `carteiraService.ts`
```typescript
buscarSaldo()
recarregar(valor, formaPagamento, dadosPagamento)
buscarHistoricoRecargas()
confirmarRecarga(recargaId)
```

---

## 🧪 COMO TESTAR

### **Teste 1: Adicionar ao Carrinho**
```bash
# 1. Fazer login como usuário
# 2. Ir para página de Lotofácil
# 3. Escolher quantidade: 2 cotas
# 4. Clicar "🛒 Adicionar ao Carrinho"
# 5. Verificar badge do carrinho: (2)
# 6. Abrir carrinho lateral
# 7. Verificar timer: ⏱️ 04:59
# 8. Aguardar 1 minuto → Timer: ⏱️ 03:59
```

### **Teste 2: Adicionar Saldo**
```bash
# 1. Clicar no avatar do usuário (canto superior direito)
# 2. Clicar "➕ Adicionar Saldo"
# 3. Clicar "R$ 100"
# 4. Selecionar PIX
# 5. Clicar "Recarregar"
# 6. QR Code aparece
# 7. (Sandbox) Simular pagamento no webhook
curl -X POST http://localhost:3000/api/webhooks/pagarme \
  -H "Content-Type: application/json" \
  -d '{"id":"txn_123","event":"transaction.paid","current_status":"paid","amount":10000,"metadata":{"tipo":"recarga_carteira"}}'
# 8. Saldo atualizado
```

### **Teste 3: Compra Direta**
```bash
# 1. Ir para bolão
# 2. Escolher 1 cota
# 3. Clicar "⚡ Comprar Agora"
# 4. Checkout abre
# 5. Selecionar "Saldo da Carteira"
# 6. Confirmar
# 7. Participação criada imediatamente
# 8. Redirecionado para "Meus Bolões"
```

---

## 🎨 COMPONENTES UI

Todos os componentes seguem o design system:
- ✅ Cores: `bolao-green`, `bolao-orange`, `background`
- ✅ Animações: Slide-in, fade, pulse
- ✅ Responsivo: Mobile-first
- ✅ Loading states: Spinners, skeletons
- ✅ Error states: Mensagens amigáveis com retry

---

## 🚀 DEPLOY

Tudo pronto para deploy! Apenas configure:
```env
PAGARME_API_KEY=your_key
PAGARME_ENCRYPTION_KEY=your_encryption_key
PAGARME_WEBHOOK_SECRET=your_webhook_secret
PAGARME_SANDBOX=false # Produção
```

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- **Schema Database**: `/migrations-sqlite/0002_carrinho_sistema.sql`
- **Serviços**: `/src/api/services/carrinho.js`, `recarga-carteira.js`
- **Componentes**: `/src/web/components/CartFloating.tsx`, `AdicionarSaldoModal.tsx`, `CheckoutModal.tsx`
- **APIs**: `/src/api/routes/carrinho.js`, `carteira.js`

---

**Data de Implementação**: 21/02/2026  
**Status**: ✅ 100% Funcional  
**Próximos Passos**: Testar em produção + ajustes finos de UX
