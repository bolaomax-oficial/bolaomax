# 💰 Sistema Financeiro BolãoMax

Sistema completo de gestão financeira integrado com Pagar.me.

---

## 🎯 **Como Funciona:**

### **Problema:**
Cliente paga via gateway (PIX/Cartão), mas o dinheiro demora para "cair" na conta. Precisamos de **liquidez imediata** para registrar bolões nas lotéricas.

### **Solução:**
**Sistema de 3 Camadas:**

1. **Carteira Virtual** - Saldo do usuário no site
2. **Fundo de Registro** - Dinheiro reservado para registrar bolões
3. **Conta Bancária** - Repasse do gateway (D+1 a D+30)

---

## 🏦 **1. CARTEIRA VIRTUAL**

Cada usuário tem uma carteira virtual no BolãoMax.

### **Tipos de Transação:**

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo VARCHAR(50), -- deposito, saque, compra_cota, premio, reembolso, taxa
  valor DECIMAL(10,2),
  saldo_anterior DECIMAL(10,2),
  saldo_novo DECIMAL(10,2),
  status VARCHAR(20), -- pendente, confirmado, cancelado
  gateway_transaction_id VARCHAR(255), -- ID do Pagar.me
  metadata JSONB,
  created_at TIMESTAMP
);
```

### **Fluxo de Depósito:**

```javascript
// Cliente paga R$ 100 via PIX
1. Pagar.me gera QR Code
2. Cliente paga
3. Webhook recebido: "paid"
4. Sistema credita R$ 100 na carteira do usuário
5. Usuário pode usar imediatamente
```

---

## 💼 **2. FUNDO DE REGISTRO**

Fundo de capital de giro para registrar bolões imediatamente.

### **Conceito:**

```
FUNDO DE REGISTRO = Capital próprio do BolãoMax
Usado para: Adiantar dinheiro e registrar bolões antes do repasse
```

### **Como Funciona:**

```
Exemplo:
- Fundo inicial: R$ 10.000,00
- Bolão fecha com: R$ 2.500,00 (vendeu 100 cotas x R$ 25)
- Sistema DEBITA R$ 2.500 do Fundo
- Sistema REGISTRA o bolão na lotérica
- Quando Pagar.me repassa (D+1): Fundo recupera R$ 2.500
```

### **Tabela no Database:**

```sql
CREATE TABLE fundo_registro (
  id UUID PRIMARY KEY,
  saldo_disponivel DECIMAL(12,2) NOT NULL,
  saldo_bloqueado DECIMAL(12,2) DEFAULT 0,
  ultima_atualizacao TIMESTAMP,
  historico JSONB -- [{ data, tipo, valor, descricao }]
);

CREATE TABLE reservas_fundo (
  id UUID PRIMARY KEY,
  bolao_id UUID NOT NULL,
  valor_reservado DECIMAL(10,2),
  status VARCHAR(20), -- reservado, utilizado, liberado
  data_reserva TIMESTAMP,
  data_utilizacao TIMESTAMP,
  data_reposicao TIMESTAMP
);
```

---

## 🔄 **3. FLUXO COMPLETO**

### **Cenário 1: Cliente compra cota**

```javascript
// 1. Cliente paga R$ 50 via PIX
POST /api/pagarme/pix
{
  amount: 50.00,
  bolaoId: "bolao-001"
}

// Resposta imediata:
{
  transactionId: "tran_abc123",
  pixQrCode: "00020126...",
  status: "waiting_payment"
}

// 2. Cliente paga o PIX

// 3. Webhook recebido (1-10 segundos após pagamento)
POST /api/webhooks/pagarme
{
  event: "transaction_status_changed",
  current_status: "paid",
  transaction_id: "tran_abc123"
}

// 4. Sistema processa:
async function processPaymentConfirmed(transactionId) {
  // Buscar transação no banco
  const payment = await db.findPayment(transactionId);
  
  // Creditar carteira do usuário
  await db.transactions.create({
    userId: payment.userId,
    tipo: 'deposito',
    valor: 50.00,
    status: 'confirmado',
    gatewayTransactionId: transactionId
  });
  
  // Atualizar saldo do usuário
  await db.users.update({
    where: { id: payment.userId },
    data: { saldo: { increment: 50.00 } }
  });
  
  // Comprar cota automaticamente
  await comprarCota({
    userId: payment.userId,
    bolaoId: payment.metadata.bolaoId,
    quantidade: 2, // R$ 50 / R$ 25 por cota
    origem: 'pagamento_direto'
  });
  
  // Adicionar ao Fundo de Registro
  await adicionarAoFundo(50.00, transactionId);
  
  // Enviar notificação
  await notify(payment.userId, {
    title: "Pagamento confirmado!",
    message: "Suas cotas foram adicionadas ao bolão."
  });
}
```

---

## 📝 **4. REGISTRO NA LOTÉRICA**

### **Quando o bolão fecha:**

```javascript
// Bolão atingiu 100% das cotas vendidas ou data limite
async function fecharBolao(bolaoId) {
  const bolao = await db.boloes.findById(bolaoId);
  
  // Calcular valor total arrecadado
  const valorTotal = bolao.quantidadeCotas * bolao.valorCota;
  // Ex: 100 cotas x R$ 25 = R$ 2.500
  
  // Verificar saldo do Fundo
  const fundo = await db.fundoRegistro.findFirst();
  
  if (fundo.saldo_disponivel < valorTotal) {
    throw new Error('Fundo insuficiente para registro');
  }
  
  // Reservar valor do Fundo
  await db.fundoRegistro.update({
    saldo_disponivel: fundo.saldo_disponivel - valorTotal,
    saldo_bloqueado: fundo.saldo_bloqueado + valorTotal
  });
  
  await db.reservasFundo.create({
    bolaoId,
    valorReservado: valorTotal,
    status: 'reservado'
  });
  
  // Registrar na lotérica (integração externa ou manual)
  const registro = await registrarNaLoterica({
    tipo: bolao.tipo, // megasena, lotofacil, etc
    numeros: JSON.parse(bolao.numerosDezenas),
    concurso: bolao.concurso,
    valor: valorTotal
  });
  
  // Atualizar bolão
  await db.boloes.update({
    where: { id: bolaoId },
    data: {
      status: 'registrado',
      codigoRegistro: registro.codigo,
      dataRegistro: new Date()
    }
  });
  
  // Marcar reserva como utilizada
  await db.reservasFundo.update({
    where: { bolaoId },
    data: {
      status: 'utilizado',
      dataUtilizacao: new Date()
    }
  });
  
  // Notificar participantes
  await notifyParticipants(bolaoId, {
    title: "Bolão registrado!",
    message: `Seu bolão foi registrado na lotérica. Código: ${registro.codigo}`
  });
}
```

---

## 💸 **5. REPASSE E REPOSIÇÃO**

### **Quando Pagar.me repassa (D+1 a D+30):**

```javascript
// Transferência bancária recebida do Pagar.me
async function processarRepassePagarme(valor, referencia) {
  // Identificar transações relacionadas
  const transacoes = await db.transactions.findMany({
    where: {
      gatewayTransactionId: { contains: referencia },
      status: 'confirmado'
    }
  });
  
  // Repor Fundo de Registro
  await db.fundoRegistro.update({
    saldo_disponivel: { increment: valor },
    saldo_bloqueado: { decrement: valor }
  });
  
  // Liberar reservas antigas
  await db.reservasFundo.updateMany({
    where: { status: 'utilizado' },
    data: { 
      status: 'liberado',
      dataReposicao: new Date()
    }
  });
  
  console.log(`✅ Fundo reposto: +R$ ${valor}`);
}
```

---

## ⚠️ **6. GESTÃO DE RISCO**

### **Monitoramento do Fundo:**

```javascript
// Alert se Fundo < 20% do ideal
async function monitorarFundo() {
  const fundo = await db.fundoRegistro.findFirst();
  const boloesPendentes = await db.boloes.count({
    where: { status: 'aberto' }
  });
  
  const valorNecessario = boloesPendentes * 2500; // Estimativa
  const percentual = (fundo.saldo_disponivel / valorNecessario) * 100;
  
  if (percentual < 20) {
    await alertAdmin({
      level: 'warning',
      message: `Fundo baixo: R$ ${fundo.saldo_disponivel} (${percentual}%)`,
      action: 'Aportar capital ou reduzir bolões ativos'
    });
  }
}
```

### **Limites de Segurança:**

```javascript
// Não permitir criar bolões se Fundo insuficiente
async function validarCriacaoBolao(bolaoData) {
  const fundo = await db.fundoRegistro.findFirst();
  const valorNecessario = bolaoData.quantidadeCotas * bolaoData.valorCota;
  
  if (fundo.saldo_disponivel < valorNecessario * 1.5) { // Margem 50%
    throw new Error('Fundo insuficiente. Aguarde reposição.');
  }
}
```

---

## 📊 **7. DASHBOARD FINANCEIRO**

### **Métricas Importantes:**

```javascript
// Painel Admin → Financeiro
{
  carteiraVirtual: {
    totalDepositado: 125000.00,
    totalSacado: 15000.00,
    saldoTotal: 110000.00
  },
  fundoRegistro: {
    saldoDisponivel: 45000.00,
    saldoBloqueado: 12500.00,
    capacidade: "18 bolões"
  },
  gateway: {
    transacoesPendentes: 15,
    aguardandoRepasse: 8500.00,
    proximoRepasse: "D+1 (amanhã)"
  },
  saude: {
    liquidez: "92%", // Ótimo
    risco: "Baixo"
  }
}
```

---

## 🔐 **8. SEGURANÇA E AUDITORIA**

### **Logs de Auditoria:**

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  tipo VARCHAR(50), -- saldo_alterado, fundo_utilizado, registro_realizado
  user_id UUID,
  dados_antes JSONB,
  dados_depois JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP
);
```

### **Reconciliação Diária:**

```javascript
// Rodar todo dia às 3h da manhã
async function reconciliarFinanceiro() {
  // Somar todas as transações confirmadas
  const totalCarteiras = await db.transactions.aggregate({
    where: { status: 'confirmado' },
    _sum: { valor: true }
  });
  
  // Somar saldos de todos os usuários
  const totalUsuarios = await db.users.aggregate({
    _sum: { saldo: true }
  });
  
  // Verificar Fundo
  const fundo = await db.fundoRegistro.findFirst();
  
  // Alertar se não bater
  if (totalCarteiras !== totalUsuarios) {
    await alertAdmin({
      level: 'critical',
      message: 'Divergência financeira detectada!',
      details: { totalCarteiras, totalUsuarios, diferenca: Math.abs(totalCarteiras - totalUsuarios) }
    });
  }
}
```

---

## ✅ **9. RESUMO DA SOLUÇÃO**

### **Vantagens:**

✅ **Liquidez Imediata** - Cliente paga, sistema credita na hora
✅ **Registro Rápido** - Fundo permite registrar sem esperar repasse
✅ **Segurança** - Carteira virtual + auditoria completa
✅ **Escalável** - Fundo cresce conforme volume aumenta
✅ **Transparente** - Cliente vê saldo em tempo real

### **Capital Inicial Necessário:**

```
Fundo inicial sugerido: R$ 10.000 a R$ 50.000
- Permite operar 4 a 20 bolões simultaneamente
- Reposto automaticamente pelos repasses
- Cresce organicamente com o volume
```

---

## 🚀 **10. IMPLEMENTAÇÃO**

Vou criar os arquivos necessários agora:

1. ✅ Schema do database (carteira, fundo, transações)
2. ✅ Serviço financeiro (processar pagamentos, gerenciar fundo)
3. ✅ Rotas API (depósito, saque, histórico)
4. ✅ Dashboard financeiro (admin)
5. ✅ Sistema de alertas

**Posso implementar isso agora?** 🚀
