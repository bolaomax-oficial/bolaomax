# 🤖 SISTEMA DE AUTOMAÇÃO - BOLÃOMAX

## 📋 Sumário

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Componentes](#componentes)
4. [API Endpoints](#api-endpoints)
5. [Schema do Banco](#schema-do-banco)
6. [Cron Jobs](#cron-jobs)
7. [Notificações](#notificações)
8. [Analytics](#analytics)
9. [Instalação](#instalação)
10. [Uso](#uso)

---

## 🎯 Visão Geral

Sistema completo de automação para gerenciamento de resultados de loterias, incluindo:

- ✅ **Integração com API da Caixa Econômica Federal**
- ✅ **Atualização automática de resultados** (cron jobs)
- ✅ **Notificações de premiação** (email + push)
- ✅ **Analytics e logs** completos
- ✅ **API REST** para acesso externo
- ✅ **Banco de dados SQLite** com Drizzle ORM

---

## 🏗️ Arquitetura

```
src/api/
├── integrations/
│   └── caixa-api.ts          # API Caixa (busca resultados)
├── services/
│   ├── lottery-updater.ts    # Atualização de resultados
│   ├── notification-service.ts # Sistema de notificações
│   └── analytics-service.ts  # Analytics e logs
├── cron/
│   └── lottery-cron.ts       # Cron jobs automáticos
├── database/
│   ├── schema.ts             # Schema SQLite
│   └── index.ts              # Conexão DB
└── lottery-routes.ts         # API REST endpoints
```

---

## 🧩 Componentes

### 1. **Integração Caixa API** (`caixa-api.ts`)

**Funções principais:**

```typescript
// Busca último resultado
fetchLatestResult(tipo: LotteryType): Promise<CaixaLotteryResult | null>

// Busca resultado específico
fetchResultByContest(tipo: LotteryType, concurso: number): Promise<CaixaLotteryResult | null>

// Busca todos os resultados
fetchAllResults(): Promise<Record<LotteryType, CaixaLotteryResult | null>>

// Verifica novos resultados
checkForNewResults(currentContests: Record<LotteryType, number>): Promise<Record<LotteryType, boolean>>

// Testa conexão
testCaixaConnection(): Promise<boolean>
```

**Loterias suportadas:**
- Mega-Sena
- Lotofácil
- Quina
- Lotomania
- Dupla Sena
- Timemania
- Dia de Sorte
- Super Sete
- Federal

**Endpoint oficial:**
```
https://servicebus2.caixa.gov.br/portaldeloterias/api/{modalidade}
```

---

### 2. **Serviço de Atualização** (`lottery-updater.ts`)

**Funções principais:**

```typescript
// Salva resultado no banco
saveLotteryResult(tipo: LotteryType, data: any): Promise<boolean>

// Atualiza uma loteria
updateSingleLottery(tipo: LotteryType): Promise<{ success: boolean; concurso?: number }>

// Atualiza todas as loterias
updateAllLotteries(): Promise<{ success: number; failed: number; results: Record<LotteryType, boolean> }>

// Busca último resultado salvo
getLatestStoredResult(tipo: LotteryType): Promise<LotteryResult | null>

// Histórico de atualizações
getUpdateHistory(limite: number): Promise<UpdateHistory[]>
```

**Fluxo de atualização:**

1. Busca resultado da API da Caixa
2. Valida dados recebidos
3. Salva/atualiza no banco de dados
4. Atualiza estatísticas de frequência
5. Registra log de atualização
6. Retorna status (sucesso/falha)

---

### 3. **Sistema de Cron Jobs** (`lottery-cron.ts`)

**Intervalos configurados:**

| Job | Intervalo | Descrição |
|-----|-----------|-----------|
| **Verificação Normal** | 30 minutos | Verifica todos os resultados |
| **Verificação Intensiva** | 10 minutos | Dias de sorteio próximo ao horário |
| **Limpeza de Cache** | 24 horas | Remove logs e cache antigos |

**Dias de sorteio por loteria:**

| Loteria | Dias |
|---------|------|
| Mega-Sena | Quarta e Sábado |
| Lotofácil | Segunda a Sábado |
| Quina | Segunda a Sábado |
| Lotomania | Terça, Quinta e Sábado |
| Dupla Sena | Terça, Quinta e Sábado |
| Timemania | Terça, Quinta e Sábado |
| Dia de Sorte | Terça, Quinta e Sábado |
| Super Sete | Segunda, Quarta e Sexta |
| Federal | Quarta e Sábado |

**Funções de controle:**

```typescript
startCronJobs()       // Inicia automação
stopCronJobs()        // Para automação
restartCronJobs()     // Reinicia automação
getCronStatus()       // Status atual
manualCheck()         // Verificação manual
```

**Auto-inicialização:**
```typescript
// Em produção, inicia automaticamente
if (process.env.NODE_ENV === 'production') {
  startCronJobs();
}
```

---

### 4. **Sistema de Notificações** (`notification-service.ts`)

**Funções principais:**

```typescript
// Verifica e notifica prêmios
checkPrizesAndNotify(): Promise<void>

// Notificações não lidas
getUnreadNotifications(usuarioId: string): Promise<PrizeNotification[]>

// Marca como lida
markAsRead(notificationId: string): Promise<boolean>

// Histórico de prêmios
getUserPrizeHistory(usuarioId: string, limite: number): Promise<PrizeNotification[]>
```

**Tipos de notificação:**
- 📧 **Email** (SendGrid, AWS SES, etc)
- 📱 **Push** (FCM, OneSignal, etc)
- 💾 **Banco de dados** (sempre registrado)

**Estrutura de notificação:**

```typescript
interface PrizeNotification {
  id: string;
  usuarioId: string;
  bolaoId: string;
  tipo: string;              // megasena, lotofacil, etc
  concurso: number;
  premioFaixa: string;       // "15 acertos", "Sena", etc
  valorPremio: number;
  acertos: number;
  lida: boolean;
  enviadaEmail: boolean;
  enviadaPush: boolean;
  criadoEm: string;
}
```

---

### 5. **Sistema de Analytics** (`analytics-service.ts`)

**Funções principais:**

```typescript
// Registra evento
trackEvent(event: AnalyticsEventInput): Promise<void>

// Registra log
log(nivel: 'info' | 'warn' | 'error' | 'debug', categoria: string, mensagem: string): Promise<void>

// Relatório de analytics
getAnalyticsReport(dataInicio: string, dataFim: string, tipo?: string): Promise<Report>

// Estatísticas em tempo real
getRealtimeStats(): Promise<Stats>

// Busca logs
getSystemLogs(nivel?: string, categoria?: string, limite?: number): Promise<SystemLog[]>

// Limpeza de dados antigos
cleanOldLogs(diasParaManter: number): Promise<void>
```

**Atalhos de uso:**

```typescript
// Analytics
analytics.pageView('/lotofacil', userId, sessionId);
analytics.click('btn-participar', 'bolao', userId);
analytics.bolaoView(bolaoId, 'megasena', userId);
analytics.bolaoParticipation(bolaoId, 'lotofacil', 50.00, userId);
analytics.purchase(150.00, bolaoId, userId);
analytics.signup(userId, 'google');
analytics.login(userId, 'email');

// Logs
logger.info('api', 'Requisição processada com sucesso');
logger.warn('payment', 'Tentativa de pagamento duplicada');
logger.error('cron', 'Falha ao atualizar resultado', errorDetails);
logger.debug('database', 'Query executada em 123ms');
```

---

## 🌐 API Endpoints

Base URL: `http://localhost:4589/api`

### **Resultados**

```
GET /lottery/results/:tipo
```
Busca último resultado de uma loteria.

**Exemplo:**
```bash
curl http://localhost:4589/api/lottery/results/megasena
```

**Resposta:**
```json
{
  "success": true,
  "source": "database",
  "data": {
    "id": "megasena_2789",
    "tipo": "megasena",
    "concurso": 2789,
    "data": "2025-02-06",
    "dezenas": [7, 15, 23, 38, 42, 58],
    "acumulado": false,
    "premios": [...]
  }
}
```

---

```
GET /lottery/results/:tipo/:concurso
```
Busca resultado específico por concurso.

**Exemplo:**
```bash
curl http://localhost:4589/api/lottery/results/megasena/2789
```

---

### **Atualização**

```
POST /lottery/update
```
Atualiza todas as loterias.

**Exemplo:**
```bash
curl -X POST http://localhost:4589/api/lottery/update
```

**Resposta:**
```json
{
  "success": true,
  "message": "Atualização concluída",
  "stats": {
    "sucesso": 8,
    "falhas": 1,
    "detalhes": {
      "megasena": true,
      "lotofacil": true,
      "federal": false
    }
  }
}
```

---

```
POST /lottery/update/:tipo
```
Atualiza loteria específica.

**Exemplo:**
```bash
curl -X POST http://localhost:4589/api/lottery/update/megasena
```

---

```
GET /lottery/history?limite=50
```
Histórico de atualizações.

---

### **Cron Jobs**

```
GET /cron/status
```
Status dos cron jobs.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "activeJobs": 3,
    "config": {
      "checkResultsInterval": "30 minutos",
      "intensiveCheckInterval": "10 minutos",
      "cleanupInterval": "24 horas"
    }
  }
}
```

---

```
POST /cron/start
```
Inicia cron jobs.

```
POST /cron/stop
```
Para cron jobs.

```
POST /cron/manual
```
Executa verificação manual.

---

### **Notificações**

```
GET /notifications/:usuarioId
```
Notificações não lidas.

```
POST /notifications/:id/read
```
Marca notificação como lida.

```
GET /notifications/:usuarioId/history?limite=50
```
Histórico de prêmios.

---

### **Analytics**

```
GET /analytics/realtime
```
Estatísticas em tempo real.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "eventosHoje": 1523,
    "pageviewsHoje": 834,
    "comprasHoje": 42,
    "cadastrosHoje": 18,
    "valorTotalHoje": 6750.00
  }
}
```

---

```
GET /analytics/report?dataInicio=2025-02-01&dataFim=2025-02-17&tipo=compra
```
Relatório de analytics por período.

---

### **Logs**

```
GET /logs?nivel=error&categoria=api&limite=100
```
Busca logs do sistema.

**Parâmetros:**
- `nivel`: info | warn | error | debug
- `categoria`: api | cron | payment | notification
- `limite`: número de registros (padrão: 100)

---

### **Health Check**

```
GET /health
```
Verifica saúde do sistema.

**Resposta:**
```json
{
  "success": true,
  "status": "healthy",
  "services": {
    "api": "ok",
    "database": "ok",
    "caixaIntegration": "ok",
    "cronJobs": "running"
  },
  "timestamp": "2025-02-17T15:30:00.000Z"
}
```

---

## 💾 Schema do Banco

### **lottery_results**
Armazena resultados das loterias.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | text | PK: `megasena_2789` |
| tipo | text | Tipo da loteria |
| concurso | integer | Número do concurso |
| data | text | Data do sorteio (ISO) |
| dezenas | text | JSON array |
| dezenas2 | text | JSON array (Dupla Sena) |
| premios | text | JSON array |
| acumulado | boolean | Se acumulou |
| valorAcumulado | real | Valor acumulado |
| proximoConcurso | text | JSON object |
| timeCoracao | text | Timemania |
| mesDaSorte | text | Dia de Sorte |
| metadados | text | JSON extras |
| criadoEm | text | Timestamp |
| atualizadoEm | text | Timestamp |

---

### **update_history**
Histórico de atualizações.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | text | PK |
| tipo | text | Tipo da loteria |
| concurso | integer | Número do concurso |
| status | text | success, error, skipped |
| mensagem | text | Mensagem |
| duracaoMs | integer | Tempo de execução |
| criadoEm | text | Timestamp |

---

### **prize_notifications**
Notificações de premiação.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | text | PK |
| usuarioId | text | ID do usuário |
| bolaoId | text | ID do bolão |
| tipo | text | Tipo da loteria |
| concurso | integer | Número do concurso |
| premioFaixa | text | Faixa de prêmio |
| valorPremio | real | Valor do prêmio |
| acertos | integer | Quantidade de acertos |
| lida | boolean | Se foi lida |
| enviadaEmail | boolean | Se foi enviado email |
| enviadaPush | boolean | Se foi enviado push |
| criadoEm | text | Timestamp |

---

### **analytics_events**
Eventos de analytics.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | text | PK |
| tipo | text | pageview, click, purchase, etc |
| categoria | text | bolao, loteria, checkout |
| acao | text | participar, visualizar, comprar |
| label | text | Label descritiva |
| valor | real | Valor (compras) |
| usuarioId | text | ID do usuário |
| sessaoId | text | ID da sessão |
| dispositivo | text | mobile, desktop, tablet |
| navegador | text | Chrome, Firefox, etc |
| origem | text | utm_source |
| metadados | text | JSON extras |
| criadoEm | text | Timestamp |

---

### **system_logs**
Logs do sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | text | PK |
| nivel | text | info, warn, error, debug |
| categoria | text | api, cron, payment, notification |
| mensagem | text | Mensagem do log |
| detalhes | text | JSON com stack trace, etc |
| usuarioId | text | ID do usuário (opcional) |
| ip | text | IP do usuário |
| userAgent | text | User agent |
| criadoEm | text | Timestamp |

---

### **lottery_statistics**
Estatísticas de frequência.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | text | PK: `megasena_numero_5` |
| tipo | text | Tipo da loteria |
| numero | integer | Número sorteado |
| frequencia | integer | Quantas vezes saiu |
| ultimaAparicao | text | Data da última aparição |
| diasSemSair | integer | Dias sem sair |
| posicaoRanking | integer | Posição no ranking |
| categoriaFrequencia | text | quente, frio, normal |
| atualizadoEm | text | Timestamp |

---

### **api_cache**
Cache de requisições.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| chave | text | PK |
| valor | text | JSON |
| expiraEm | text | Data de expiração |
| criadoEm | text | Timestamp |

---

## 📦 Instalação

1. **Clonar repositório:**
```bash
git clone https://github.com/bolaomax/bolaomax-modern.git
cd bolaomax-modern
```

2. **Instalar dependências:**
```bash
npm install
```

3. **Configurar banco de dados:**
```bash
npm run db:push
```

4. **Iniciar servidor:**
```bash
npm run dev
```

5. **Testar API:**
```bash
curl http://localhost:4589/api/health
```

---

## 🚀 Uso

### **Inicializar sistema de automação:**

```typescript
import { startCronJobs } from './src/api/cron/lottery-cron';

// Inicia cron jobs
startCronJobs();
```

### **Atualizar resultados manualmente:**

```typescript
import { updateAllLotteries } from './src/api/services/lottery-updater';

const result = await updateAllLotteries();
console.log(`Sucesso: ${result.success}, Falhas: ${result.failed}`);
```

### **Buscar resultado:**

```typescript
import { fetchLatestResult } from './src/api/integrations/caixa-api';

const megasena = await fetchLatestResult('megasena');
console.log(`Concurso: ${megasena.numero}`);
console.log(`Dezenas: ${megasena.listaDezenas.join(', ')}`);
```

### **Registrar analytics:**

```typescript
import { analytics } from './src/api/services/analytics-service';

// Registra pageview
await analytics.pageView('/lotofacil', userId, sessionId);

// Registra participação em bolão
await analytics.bolaoParticipation(bolaoId, 'megasena', 50.00, userId);
```

### **Enviar notificação:**

```typescript
import { notifyWinner } from './src/api/services/notification-service';

await notifyWinner({
  usuarioId: 'user_123',
  bolaoId: 'bolao_456',
  tipo: 'megasena',
  concurso: 2789,
  acertos: 6,
  premioFaixa: 'Sena (6 acertos)',
  valorPremio: 15000000,
});
```

---

## 📊 Monitoramento

### **Dashboard de Status:**

```bash
# Status dos cron jobs
curl http://localhost:4589/api/cron/status

# Estatísticas em tempo real
curl http://localhost:4589/api/analytics/realtime

# Logs recentes
curl http://localhost:4589/api/logs?limite=50

# Health check
curl http://localhost:4589/api/health
```

---

## 🔒 Segurança

**Recomendações:**

1. ✅ Adicionar autenticação JWT nos endpoints
2. ✅ Rate limiting (limitar requisições)
3. ✅ Validação de inputs
4. ✅ CORS configurado corretamente
5. ✅ Logs de acesso
6. ✅ Monitoramento de erros (Sentry)

---

## 📝 TODO

- [ ] Integrar com serviço de email real (SendGrid)
- [ ] Integrar com serviço push real (FCM)
- [ ] Adicionar autenticação JWT
- [ ] Implementar rate limiting
- [ ] Adicionar testes automatizados
- [ ] Deploy em produção (Railway, Vercel, etc)
- [ ] Dashboard admin para monitoramento
- [ ] Webhooks para notificações externas

---

## 📄 Licença

MIT License - BolãoMax 2025

---

**Desenvolvido por:** Runable AI  
**Versão:** 1.0.0  
**Data:** 17 de Fevereiro de 2026
