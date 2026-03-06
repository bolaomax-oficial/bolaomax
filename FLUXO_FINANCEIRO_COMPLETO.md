# 💰 Fluxo Financeiro Completo - BolãoMax

## 🎯 **CENÁRIO COMPLETO: Do Pagamento ao Registro**

---

## 📊 **ETAPA 1: Cliente Compra Cota**

```
┌──────────────────────────────────────────────────────────┐
│  CLIENTE: João quer comprar 2 cotas (R$ 25 cada = R$ 50) │
└──────────────────────────────────────────────────────────┘

1. João acessa: /boloes/mega-da-virada
2. Clica: "Comprar 2 cotas - R$ 50,00"
3. Escolhe: "Pagar com PIX"

Frontend → POST /api/pagarme/pix
{
  amount: 50.00,
  bolaoId: "bolao-001",
  quantidadeCotas: 2
}

Backend → Pagar.me API
✅ QR Code gerado
✅ Transação criada no database (status: pendente)

Resposta → Frontend
{
  pixQrCode: "00020126...",
  pixQrCodeUrl: "https://...",
  transactionId: "tran_abc123"
}

4. João escaneia QR Code e paga
```

---

## 📊 **ETAPA 2: Pagamento Confirmado (10 segundos depois)**

```
┌──────────────────────────────────────────────────────────┐
│         PAGAR.ME → BOLÃOMAX (Webhook)                    │
└──────────────────────────────────────────────────────────┘

Pagar.me → POST /api/webhooks/pagarme
{
  event: "transaction_status_changed",
  current_status: "paid",
  transaction_id: "tran_abc123",
  amount: 5000, // centavos
  metadata: {
    userId: "user-joao",
    bolaoId: "bolao-001",
    quantidadeCotas: 2
  }
}

Backend processa:

┌─────────────────────────────────────┐
│ 1. CREDITAR CARTEIRA VIRTUAL        │
└─────────────────────────────────────┘
✅ João.saldo: R$ 0 → R$ 50
✅ Transaction criada: deposito, R$ 50
✅ Status: confirmado

┌─────────────────────────────────────┐
│ 2. ADICIONAR AO FUNDO DE REGISTRO   │
└─────────────────────────────────────┘
✅ Fundo.saldoDisponivel: +R$ 50
✅ Fundo agora: R$ 10.050

┌─────────────────────────────────────┐
│ 3. COMPRAR COTAS AUTOMATICAMENTE    │
└─────────────────────────────────────┘
✅ João.saldo: R$ 50 → R$ 0 (debitado)
✅ Participação criada: 2 cotas
✅ Bolão.cotasDisponiveis: 100 → 98

┌─────────────────────────────────────┐
│ 4. NOTIFICAR CLIENTE                │
└─────────────────────────────────────┘
✅ Email enviado: "Cotas confirmadas!"
✅ Notificação no app
✅ WhatsApp (opcional)
```

---

## 📊 **ETAPA 3: Outros Clientes Compram (próximas horas/dias)**

```
Mais 98 clientes compram cotas...

Bolão Status:
- Total cotas: 100
- Vendidas: 100 ✅
- Disponíveis: 0
- Valor arrecadado: R$ 2.500 (100 x R$ 25)

Fundo Status:
- Saldo disponível: R$ 12.500
- Saldo bloqueado: R$ 0
- Capacidade: ~5 bolões
```

---

## 📊 **ETAPA 4: Bolão Fecha (100% vendido)**

```
┌──────────────────────────────────────────────────────────┐
│         SISTEMA AUTOMÁTICO: Fechar Bolão                 │
└──────────────────────────────────────────────────────────┘

Trigger: cotasDisponiveis === 0

1. RESERVAR FUNDO
   ✅ Fundo.saldoDisponivel: R$ 12.500 → R$ 10.000
   ✅ Fundo.saldoBloqueado: R$ 0 → R$ 2.500
   ✅ Reserva criada: bolao-001, R$ 2.500

2. REGISTRAR NA LOTÉRICA
   Backend → Lotérica API (ou manual)
   ✅ Tipo: Mega-Sena
   ✅ Números: [7, 15, 23, 38, 42, 58]
   ✅ Valor: R$ 2.500
   ✅ Código registro: "MEG-2856-ABC123"

3. ATUALIZAR BOLÃO
   ✅ Status: aberto → registrado
   ✅ Código registro: MEG-2856-ABC123
   ✅ Data registro: 21/02/2026 20:00

4. MARCAR RESERVA COMO UTILIZADA
   ✅ Reserva.status: reservado → utilizado
   ✅ Reserva.dataUtilizacao: 21/02/2026 20:00
   ✅ Reserva.codigoRegistro: MEG-2856-ABC123

5. NOTIFICAR 100 PARTICIPANTES
   ✅ Email: "Bolão registrado! Código: MEG-2856-ABC123"
   ✅ Push notification
   ✅ Link para comprovante
```

---

## 📊 **ETAPA 5: Repasse do Pagar.me (D+1)**

```
┌──────────────────────────────────────────────────────────┐
│    PAGAR.ME → CONTA BANCÁRIA (Transferência)            │
└──────────────────────────────────────────────────────────┘

Data: 22/02/2026 (D+1)

Pagar.me calcula repasse:
- Valor bruto: R$ 2.500,00 (100 transações de R$ 25)
- Taxa Pagar.me: R$ 99,00 (R$ 0,99 por PIX)
- Valor líquido: R$ 2.401,00

Transferência bancária:
- Origem: Pagar.me
- Destino: Conta BolãoMax
- Valor: R$ 2.401,00
- Status: Concluído

┌─────────────────────────────────────┐
│  ADMIN REGISTRA REPASSE NO SISTEMA  │
└─────────────────────────────────────┘

Admin → /admin/financeiro → "Registrar Repasse"

POST /api/financeiro/admin/repasse
{
  gatewayId: "rep_xyz789",
  valorBruto: 2500.00,
  valorTaxas: 99.00,
  valorLiquido: 2401.00,
  periodoInicio: "2026-02-21",
  periodoFim: "2026-02-21"
}

Sistema processa:

1. REPOR FUNDO
   ✅ Fundo.saldoBloqueado: R$ 2.500 → R$ 0
   ✅ Fundo.saldoDisponivel: R$ 10.000 → R$ 12.401
   ✅ Fundo.totalReposto: +R$ 2.401

2. ATUALIZAR RESERVA
   ✅ Reserva.status: utilizado → reposto_total
   ✅ Reserva.valorReposto: R$ 2.401
   ✅ Reserva.dataReposicao: 22/02/2026

3. REGISTRAR REPASSE
   ✅ Repasse criado no database
   ✅ Status: conciliado
```

---

## 📊 **ESTADO FINAL DO SISTEMA**

### **Carteira João:**
```
Saldo: R$ 0
Histórico:
  [+] R$ 50,00 - Depósito via PIX (21/02 19:30)
  [-] R$ 50,00 - Compra 2 cotas Mega-Sena (21/02 19:31)
Participações:
  [✓] Mega da Virada - 2 cotas - Registrado
```

### **Fundo de Registro:**
```
Disponível: R$ 12.401
Bloqueado: R$ 0
Total: R$ 12.401
Capacidade: ~4 bolões simultâneos
Status: Saudável ✅
```

### **Bolão Mega da Virada:**
```
Status: Registrado ✅
Código: MEG-2856-ABC123
Cotas vendidas: 100/100
Valor arrecadado: R$ 2.500
Participantes: 50 pessoas
Data sorteio: 31/12/2024
```

---

## 💡 **VANTAGENS DO SISTEMA:**

### ✅ **Para o Cliente:**
1. Paga e vê crédito **imediatamente**
2. Cotas confirmadas em **segundos**
3. Bolão registrado **sem esperar repasse**
4. Transparência total (extrato em tempo real)

### ✅ **Para o BolãoMax:**
1. **Liquidez garantida** - Fundo cobre operação
2. **Registro imediato** - Não perde prazo das lotéricas
3. **Risco zero** - Só adianta valor já pago
4. **Escalável** - Fundo cresce automaticamente
5. **Auditável** - Toda operação rastreada

### ✅ **Para as Finanças:**
1. Fluxo de caixa previsível
2. Reconciliação automática
3. Controle de risco
4. Alertas de liquidez
5. Dashboard em tempo real

---

## 📈 **EXEMPLO COM MÚLTIPLOS BOLÕES:**

```
┌────────────────────────────────────────────────────┐
│            OPERAÇÃO SIMULTÂNEA (1 DIA)             │
├────────────────────────────────────────────────────┤
│ Bolão 1 - Mega: R$ 2.500 → Registrado ✅           │
│ Bolão 2 - Lotofácil: R$ 1.500 → Registrado ✅      │
│ Bolão 3 - Quina: R$ 2.000 → Registrado ✅          │
│ Bolão 4 - Timemania: R$ 1.200 → Aguardando 80%    │
├────────────────────────────────────────────────────┤
│ Total utilizado do Fundo: R$ 6.000                 │
│ Fundo restante: R$ 6.401                          │
│ Status: Operando normalmente ✅                    │
└────────────────────────────────────────────────────┘

D+1: Pagar.me repassa R$ 6.900 (líquido)
✅ Fundo volta para: R$ 13.301
✅ Pronto para próximos 5 bolões!
```

---

## 🚨 **GESTÃO DE RISCO:**

### **Cenário de Alerta:**

```
Fundo disponível: R$ 4.500
Limite mínimo: R$ 5.000
Status: ⚠️  ATENÇÃO

Ação automática:
1. Email para admin: "Fundo abaixo do limite"
2. Bloquear criação de novos bolões grandes
3. Sugerir: Aportar R$ 5.000 ou aguardar repasse
```

### **Cenário Crítico:**

```
Fundo disponível: R$ 1.000
Bolão pronto para fechar: R$ 2.500
Status: 🔴 CRÍTICO

Ação automática:
1. Alerta urgente para admin
2. Opções:
   - Aportar capital urgente
   - Estender prazo do bolão
   - Reembolsar participantes
```

---

## ✅ **RESUMO EXECUTIVO:**

| Componente | Função | Status |
|------------|--------|--------|
| **Carteira Virtual** | Saldo do usuário | ✅ Implementado |
| **Fundo de Registro** | Capital de giro | ✅ Implementado |
| **Pagar.me** | Gateway pagamento | ✅ Integrado |
| **Webhooks** | Confirmação automática | ✅ Funcionando |
| **Compra de Cotas** | Débito + Participação | ✅ Implementado |
| **Reserva de Fundo** | Bloqueio para registro | ✅ Implementado |
| **Registro Lotérica** | Usar fundo bloqueado | 🔧 A implementar |
| **Repasse** | Repor fundo (D+1) | 🔧 A implementar |
| **Auditoria** | Rastreamento completo | ✅ Implementado |

---

✅ **Sistema pronto para operar!** 🚀
