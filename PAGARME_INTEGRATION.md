# 🔐 Integração Pagar.me (Stone) - BolãoMax

Gateway de pagamento oficial do BolãoMax.

---

## 📚 Documentação Oficial

- **Dashboard:** https://dashboard.pagar.me
- **Documentação API:** https://docs.pagar.me
- **Webhooks:** https://docs.pagar.me/docs/webhooks-overview
- **Suporte:** suporte@pagar.me

---

## 🔑 1. Obter Credenciais

### 1.1 Criar Conta
1. Acesse: https://dashboard.pagar.me
2. Crie uma conta gratuita
3. Valide seu email

### 1.2 Obter API Keys

**Ambiente Sandbox (Testes):**
1. Vá para: https://dashboard.pagar.me/#/myaccount/apikeys
2. Copie:
   - **API Key:** `sk_test_...` (chave secreta - backend)
   - **Encryption Key:** `ek_test_...` (chave pública - frontend)

**Ambiente Produção:**
1. Complete o cadastro da empresa
2. Envie documentação necessária
3. Aguarde aprovação
4. Copie as chaves de produção:
   - **API Key:** `sk_live_...`
   - **Encryption Key:** `ek_live_...`

---

## ⚙️ 2. Configurar no BolãoMax

### 2.1 Variáveis de Ambiente

Adicione no `.env.local`:

```bash
# Pagar.me
PAGARME_API_KEY=sk_test_SEU_TOKEN_AQUI
PAGARME_ENCRYPTION_KEY=ek_test_SUA_CHAVE_AQUI
PAGARME_WEBHOOK_SECRET=whsec_SEU_SECRET_AQUI
PAGARME_SANDBOX=true

# Frontend
VITE_PAGARME_ENCRYPTION_KEY=ek_test_SUA_CHAVE_AQUI
```

### 2.2 Configurar no Painel Admin

1. Acesse: `/admin` → **Configurações** → **Pagamentos**
2. Na seção **Pagar.me (Gateway Oficial)**:
   - Cole a **API Key**
   - Cole a **Encryption Key**
   - Cole o **Webhook Secret**
   - Marque **Sandbox** (para testes)
3. Clique em **Testar Conexão**
4. Se conectado, clique em **Salvar Configurações**

---

## 🔔 3. Configurar Webhooks

Webhooks notificam o BolãoMax quando o status de uma transação muda.

### 3.1 URL do Webhook

```
https://bolaomax.com/api/webhooks/pagarme
```

**Local (dev):**
```
http://localhost:3000/api/webhooks/pagarme
```

### 3.2 Configurar no Pagar.me

1. Acesse: https://dashboard.pagar.me/#/webhooks
2. Clique em **Novo Webhook**
3. Configure:
   - **URL:** `https://bolaomax.com/api/webhooks/pagarme`
   - **Versão:** v5
   - **Eventos:**
     - ✅ `transaction_status_changed`
     - ✅ `subscription_status_changed`
     - ✅ `charge_paid`
     - ✅ `charge_refunded`
4. Copie o **Webhook Secret** gerado
5. Cole no `.env` e no painel admin

### 3.3 Testar Webhook (Dev)

Use **ngrok** para expor localhost:

```bash
# Instalar ngrok
brew install ngrok  # Mac
# ou baixar em: https://ngrok.com/download

# Expor porta 3000
ngrok http 3000

# Usar URL gerada:
# https://abc123.ngrok.io/api/webhooks/pagarme
```

---

## 💳 4. Métodos de Pagamento

### 4.1 PIX

**Frontend:**
```javascript
import { createPixPayment } from '@/services/pagarme';

const result = await createPixPayment({
  amount: 100.00, // R$ 100,00
  bolaoId: 'bolao-123'
});

// Exibir QR Code
console.log(result.pixQrCode); // Código para copiar
console.log(result.pixQrCodeUrl); // URL da imagem
```

**Backend:**
```javascript
POST /api/pagarme/pix
{
  "amount": 100.00,
  "bolaoId": "bolao-123"
}
```

### 4.2 Cartão de Crédito

**Frontend (criptografar cartão):**
```javascript
import pagarme from 'pagarme';

// Inicializar com Encryption Key
const client = await pagarme.client.connect({
  encryption_key: import.meta.env.VITE_PAGARME_ENCRYPTION_KEY
});

// Criptografar dados do cartão
const cardHash = await client.security.encrypt({
  card_number: '4111111111111111',
  card_holder_name: 'João Silva',
  card_expiration_date: '1225', // MMYY
  card_cvv: '123'
});

// Enviar para backend
const result = await createCreditCardPayment({
  amount: 100.00,
  installments: 3,
  cardHash,
  bolaoId: 'bolao-123'
});
```

### 4.3 Boleto

**Frontend:**
```javascript
import { createBoletoPayment } from '@/services/pagarme';

const result = await createBoletoPayment({
  amount: 100.00,
  bolaoId: 'bolao-123'
});

// Exibir boleto
window.open(result.boletoUrl, '_blank');
```

---

## 🧪 5. Testar Pagamentos (Sandbox)

### 5.1 Cartões de Teste

**Aprovado:**
```
Número: 4111 1111 1111 1111
CVV: qualquer (ex: 123)
Validade: qualquer futura (ex: 12/25)
```

**Recusado:**
```
Número: 4000 0000 0000 0010
```

**Insuficiente:**
```
Número: 4000 0000 0000 9995
```

### 5.2 PIX de Teste

No sandbox, PIX é aprovado automaticamente após 1 minuto.

### 5.3 Boleto de Teste

No sandbox, boleto é aprovado manualmente pelo dashboard.

---

## 📊 6. Monitorar Transações

### 6.1 Dashboard Pagar.me

https://dashboard.pagar.me/#/transactions

### 6.2 Admin BolãoMax

`/admin` → **Financeiro** → **Transações**

### 6.3 API

```bash
GET /api/pagarme/transactions?page=1&count=10&status=paid
```

---

## 💰 7. Taxas Pagar.me

### Sandbox (Teste)
- **Grátis** (sem cobrança)

### Produção
- **Cartão de Crédito:** 2,99% + R$ 0,39
- **PIX:** R$ 0,99 por transação
- **Boleto:** R$ 3,49 por transação

*Taxas podem variar conforme negociação com Stone.*

---

## 🔐 8. Segurança

### ✅ Boas Práticas

1. **Nunca** exponha `API_KEY` no frontend
2. Use `ENCRYPTION_KEY` apenas no frontend
3. Valide assinatura dos webhooks
4. Use HTTPS em produção
5. Armazene chaves em variáveis de ambiente
6. Não commite `.env` no Git

### ⚠️ Atenção

- API Key = backend apenas (server-side)
- Encryption Key = frontend (client-side)
- Webhook Secret = validar webhooks

---

## 🐛 9. Troubleshooting

### Erro: "Credenciais inválidas"
**Causa:** API Key ou Encryption Key erradas  
**Solução:** Verificar no dashboard Pagar.me

### Erro: "Cartão recusado"
**Causa:** Cartão inválido ou sem saldo  
**Solução:** Usar cartão de teste ou verificar dados

### Erro: "Webhook não recebido"
**Causa:** URL incorreta ou servidor inacessível  
**Solução:** Verificar logs e testar com ngrok

### Erro: "Connection timeout"
**Causa:** API Pagar.me fora do ar  
**Solução:** Verificar status: https://status.pagar.me

---

## 📞 10. Suporte

### Pagar.me
- **Email:** suporte@pagar.me
- **Chat:** Dashboard → ícone de chat
- **Tel:** 0800 123 4567
- **Status:** https://status.pagar.me

### BolãoMax
- Documentação interna: `/docs/pagarme`
- Logs: `/admin/logs`

---

## ✅ Checklist de Integração

- [ ] Conta criada no Pagar.me
- [ ] API Keys obtidas (sandbox)
- [ ] Variáveis configuradas no `.env`
- [ ] Configuração salva no admin
- [ ] Teste de conexão OK
- [ ] Webhook configurado
- [ ] Webhook Secret salvo
- [ ] Pagamento PIX testado
- [ ] Pagamento Cartão testado
- [ ] Pagamento Boleto testado
- [ ] Webhooks recebidos OK
- [ ] Transações aparecendo no admin
- [ ] Ambiente produção configurado
- [ ] API Keys produção atualizadas
- [ ] Deploy realizado

---

## 🚀 Go Live (Produção)

### Antes de ativar produção:

1. ✅ Conta Pagar.me aprovada
2. ✅ Documentação enviada
3. ✅ Todos os testes passando
4. ✅ Webhooks configurados em produção
5. ✅ Variáveis de produção no Railway
6. ✅ HTTPS habilitado
7. ✅ Monitoramento ativo

### Ativar:

```bash
# Atualizar .env em produção (Railway)
PAGARME_API_KEY=sk_live_...
PAGARME_ENCRYPTION_KEY=ek_live_...
PAGARME_SANDBOX=false

# Frontend
VITE_PAGARME_ENCRYPTION_KEY=ek_live_...
```

---

✅ **Integração Completa!** 🎉
