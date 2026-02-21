# Sistema de Indicações BolãoMax - Documentação Completa

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Funcionalidades](#funcionalidades)
4. [Estrutura de Arquivos](#estrutura-de-arquivos)
5. [Guia de Uso](#guia-de-uso)
6. [API Reference](#api-reference)
7. [Fluxo de Dados](#fluxo-de-dados)
8. [Troubleshooting](#troubleshooting)

---

## 📖 Visão Geral

O Sistema de Indicações "Indique e Ganhe" permite que clientes do BolãoMax ganhem bônus ao indicar novos usuários. O sistema é completo com:

- **Painel Administrativo** para gerenciamento da campanha
- **Painel Cliente** para compartilhamento e acompanhamento
- **Sistema de Bônus Automático** com regras configuráveis
- **Códigos Únicos de Indicação** por usuário
- **Compartilhamento Social** integrado (WhatsApp, Email, Facebook)

### Regras de Negócio

#### Bônus para Indicador (quem indica):
- **R$ 10,00** quando indicado faz primeira compra ≥ R$ 40,00
- **1 cota de bolão especial** se indicado assinar plano mensal
- Bônus creditado automaticamente na conta
- Sem limite de indicações

#### Bônus para Indicado (quem foi indicado):
- **R$ 10,00** de bônus na primeira compra
- Compra mínima: R$ 40,00 para ativar bônus
- Bônus aplicado no checkout

#### Validações:
- ✅ Um cliente não pode usar seu próprio código
- ✅ Código válido apenas uma vez por novo cliente
- ✅ Cliente já existente não pode usar código de indicação
- ✅ Compra mínima obrigatória

---

## 🏗️ Arquitetura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                    LocalStorage                         │
│  ┌────────────────┐ ┌────────────────┐ ┌─────────────┐ │
│  │   Campaign     │ │   Referrals    │ │   Profiles  │ │
│  └────────────────┘ └────────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────┘
                             ▲
                             │
                    ┌────────┴────────┐
                    │ referralService │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼─────────┐  ┌──────▼──────┐  ┌─────────▼────────┐
│ Admin Dashboard │  │ Client Page │  │ ShareButtons     │
│ /admin/         │  │ /indicacoes │  │ Component        │
│ indicacoes      │  │             │  │                  │
└─────────────────┘  └─────────────┘  └──────────────────┘
```

### Camadas

1. **Apresentação** (UI Layer)
   - `/pages/admin/indicacoes.tsx` - Painel Admin
   - `/pages/client/indicacoes.tsx` - Painel Cliente
   - `/components/ShareButtons.tsx` - Botões de Compartilhamento

2. **Lógica de Negócio** (Service Layer)
   - `/services/referralService.ts` - Toda lógica de indicações

3. **Persistência** (Storage Layer)
   - LocalStorage com 3 chaves:
     - `bolaomax_referral_campaign` - Configuração da campanha
     - `bolaomax_referrals` - Lista de indicações
     - `bolaomax_user_referral_profiles` - Perfis de usuários

---

## ✨ Funcionalidades

### Painel Admin (`/admin/indicacoes`)

#### 1. Dashboard de Estatísticas
```
┌──────────────────────────────────────────────────────┐
│  Total de Indicações  │  Indicações Ativas          │
│  Bônus Pagos (R$)     │  Taxa de Conversão (%)      │
└──────────────────────────────────────────────────────┘
```

**Métricas Calculadas:**
- Total de Indicações: Todas as indicações criadas
- Indicações Ativas: Status = 'confirmed' ou 'paid'
- Bônus Pagos: Soma de todos os bônus com status 'paid'
- Taxa de Conversão: (Pagas / Total) * 100

#### 2. Configuração da Campanha

**Campos Editáveis:**
- Título da Campanha (ex: "Indique e Ganhe")
- Descrição (texto longo)
- Bônus para Indicador (R$)
- Bônus para Indicado (R$)
- Valor Mínimo de Compra (R$)
- Bônus Plano Mensal (texto livre)
- Status (Ativa/Inativa)

**Ações:**
- ✏️ Editar - Habilita edição dos campos
- 💾 Salvar - Salva alterações no LocalStorage
- 👁️ Ativar/Desativar - Toggle do status da campanha

#### 3. Tabela de Indicações (Relatório)

**Colunas:**
| Indicador | Indicado | Código | Valor Compra | Bônus | Status | Data | Ações |
|-----------|----------|--------|--------------|-------|--------|------|-------|

**Status possíveis:**
- 🟡 Pendente - Indicação criada, aguardando confirmação
- 🔵 Confirmada - Compra confirmada, bônus a pagar
- 🟢 Paga - Bônus creditado

**Ações disponíveis:**
- Dropdown para alterar status manualmente
- Mudança de status dispara automação de bônus

#### 4. Ranking de Indicadores (Top 10)

Lista os 10 usuários com mais indicações confirmadas/pagas:
```
🥇 João Silva       │ 45 indicações │ R$ 450,00 ganhos
🥈 Maria Santos     │ 32 indicações │ R$ 320,00 ganhos
🥉 Pedro Oliveira   │ 28 indicações │ R$ 280,00 ganhos
```

#### 5. Botão "Gerar Dados Mock"

Cria dados de exemplo para desenvolvimento:
- 3 perfis de usuários com códigos
- 3 indicações com diferentes status
- Útil para testar a interface

---

### Painel Cliente (`/indicacoes`)

#### 1. Cards de Estatísticas

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Saldo           │  │ Total de        │  │ Total Ganho     │
│ Disponível      │  │ Indicações      │  │                 │
│ R$ 50,00        │  │ 5 pessoas       │  │ R$ 50,00        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

#### 2. Compartilhe e Ganhe

**Exibe:**
- Código de Indicação (ex: JOAO2026123)
- Link de Indicação (com ?ref=CODIGO)
- Botão "Copiar Código"
- Botão "Copiar Link"

**Botões de Compartilhamento:**
- 📱 WhatsApp - Abre app com mensagem pré-formatada
- 📧 Email - Abre cliente de email
- 📘 Facebook - Compartilha no feed
- 🔗 Mais - API nativa de compartilhamento

#### 3. Como Funciona

Explicação passo a passo com ícones:
1. Compartilhe seu código
2. Amigo faz primeira compra (mín. R$ 40)
3. Vocês dois ganham R$ 10
4. ⭐ Bônus extra se assinar plano mensal

#### 4. Minhas Indicações

Tabela com indicações do usuário:
```
┌────────────────────────────────────────────────────┐
│ Ana Costa         │ Paga      │ +R$ 10,00 │ 15/02 │
│ Carlos Almeida    │ Confirmada│ R$ 10,00  │ 16/02 │
│ Beatriz Lima      │ Pendente  │ R$ 0,00   │ 17/02 │
└────────────────────────────────────────────────────┘
```

**Estados visuais:**
- Pendente: Badge amarelo + valor R$ 0,00
- Confirmada: Badge azul + valor sem sinal
- Paga: Badge verde + valor com "+"

#### 5. Usar Saldo

Card especial que aparece quando saldo > 0:
- Exibe saldo disponível
- Botão "Usar Saldo em Compra"
- Destaque visual (gradiente verde)

---

## 📁 Estrutura de Arquivos

```
bolaomax-modern/
└── src/
    └── web/
        ├── services/
        │   └── referralService.ts          ← Service principal
        │
        ├── pages/
        │   ├── admin/
        │   │   └── indicacoes.tsx           ← Admin dashboard
        │   │
        │   └── client/
        │       └── indicacoes.tsx           ← Client page
        │
        ├── components/
        │   ├── admin/
        │   │   └── admin-layout.tsx         ← Menu com "Indicações"
        │   │
        │   └── ShareButtons.tsx             ← Botões compartilhamento
        │
        └── app.tsx                          ← Rotas configuradas
```

### Arquivos Criados/Modificados

#### Novos Arquivos:
1. ✅ `/services/referralService.ts` (530 linhas)
2. ✅ `/pages/admin/indicacoes.tsx` (580 linhas)
3. ✅ `/pages/client/indicacoes.tsx` (370 linhas)
4. ✅ `/components/ShareButtons.tsx` (240 linhas)

#### Arquivos Existentes (já configurados):
- `/components/admin/admin-layout.tsx` - Linha 55: Menu "Indicações"
- `/app.tsx` - Linhas 43 e 116: Import e rota admin
- `/app.tsx` - Linhas 33 e 101: Import e rota client

---

## 🚀 Guia de Uso

### Para Administradores

#### Acessar Painel Admin
1. Navegue para: `http://localhost:5174/admin/indicacoes`
2. No menu lateral, clique em "Indicações"

#### Gerar Dados de Teste
1. Clique no botão "Gerar Dados Mock" (canto superior direito)
2. Sistema cria:
   - 3 usuários com códigos de indicação
   - 3 indicações com status diferentes
   - Estatísticas mockadas

#### Configurar Campanha
1. Clique em "Editar"
2. Altere os valores desejados:
   - Título e descrição
   - Valores de bônus
   - Valor mínimo de compra
3. Clique em "Salvar"

#### Ativar/Desativar Campanha
1. Clique no botão "Ativar" ou "Desativar"
2. Status é atualizado imediatamente
3. Quando inativa, clientes veem mensagem de campanha indisponível

#### Gerenciar Status de Indicações
1. Na tabela de relatório, localize a indicação
2. Use o dropdown na coluna "Ações"
3. Selecione o novo status:
   - Pendente → Confirmada → Paga
4. Se mudar para "Paga", bônus é creditado automaticamente

---

### Para Clientes

#### Acessar Painel de Indicações
1. Navegue para: `http://localhost:5174/indicacoes`
2. Ou clique em link no menu do usuário

#### Compartilhar Código
**Opção 1: Copiar Código**
1. Clique em "Copiar" ao lado do código
2. Cole onde desejar (mensagens, emails, etc)

**Opção 2: Copiar Link**
1. Clique em "Copiar Link"
2. Compartilhe o link completo com parâmetro ?ref=

**Opção 3: Botões Sociais**
1. Clique em "WhatsApp" → Abre conversa com mensagem pronta
2. Clique em "Email" → Abre cliente com email formatado
3. Clique em "Facebook" → Compartilha no feed
4. Clique em "Mais" → Menu nativo do dispositivo

#### Acompanhar Indicações
1. Role até "Minhas Indicações"
2. Veja lista com todas as pessoas indicadas
3. Status em tempo real:
   - Pendente: Aguardando primeira compra
   - Confirmada: Compra confirmada, bônus a receber
   - Paga: Bônus creditado na conta

#### Usar Saldo de Bônus
1. Quando tiver saldo > 0, card "Usar Saldo" aparece
2. Clique em "Usar Saldo em Compra"
3. No checkout, saldo é aplicado automaticamente

---

## 📚 API Reference

### ReferralService

#### Métodos Principais

##### `generateReferralCode(userId, userName): string`
Gera código único de indicação.

**Formato:** `{NOME}{ANO}{RANDOM}`
- Nome: Até 5 letras maiúsculas, sem acentos
- Ano: Ano atual (4 dígitos)
- Random: Número aleatório 1-999

**Exemplo:**
```typescript
const code = referralService.generateReferralCode('user_1', 'João Silva');
// Resultado: JOAO2026123
```

##### `createOrUpdateUserProfile(userId, userName, referredBy?): UserReferralProfile`
Cria ou atualiza perfil de indicação do usuário.

**Parâmetros:**
- `userId` - ID único do usuário
- `userName` - Nome completo
- `referredBy` (opcional) - Código de quem indicou

**Retorna:**
```typescript
{
  userId: "user_1",
  name: "João Silva",
  referralCode: "JOAO2026123",
  referredBy?: "MARIA2026456",
  referralBalance: 0,
  totalReferrals: 0,
  totalEarned: 0
}
```

##### `createReferral(...params): Referral | null`
Cria nova indicação com validações.

**Parâmetros:**
```typescript
referralService.createReferral(
  referrerId: string,        // ID do indicador
  referrerName: string,      // Nome do indicador
  referredId: string,        // ID do indicado
  referredName: string,      // Nome do indicado
  referralCode: string,      // Código usado
  purchaseValue: number      // Valor da compra
)
```

**Validações automáticas:**
- ✅ Usuário não pode indicar a si mesmo
- ✅ Campanha deve estar ativa
- ✅ Valor da compra ≥ mínimo configurado
- ✅ Usuário indicado não pode ter sido indicado antes

**Retorna:**
- `Referral` - Objeto da indicação criada
- `null` - Se falhar alguma validação

##### `updateReferralStatus(id, status): boolean`
Atualiza status da indicação e dispara automações.

**Status possíveis:**
- `'pending'` - Pendente
- `'confirmed'` - Confirmada
- `'paid'` - Paga (dispara crédito de bônus)

**Automação:**
Quando status = 'paid':
1. Define `paidAt` com timestamp atual
2. Busca perfil do indicador
3. Credita bônus no saldo
4. Atualiza totalEarned

##### `getReferralStats(userId?): ReferralStats`
Retorna estatísticas de indicações.

**Sem userId:** Estatísticas globais
**Com userId:** Estatísticas do usuário específico

**Retorna:**
```typescript
{
  totalReferrals: 10,
  activeReferrals: 7,
  totalBonusPaid: 70.00,
  conversionRate: 70.0,
  pendingCount: 2,
  confirmedCount: 3,
  paidCount: 5
}
```

##### `getTopReferrers(limit): Array<...>`
Retorna ranking de indicadores.

**Parâmetros:**
- `limit` (padrão: 10) - Quantidade de resultados

**Retorna:**
```typescript
[
  {
    userId: "user_1",
    name: "João Silva",
    referralCode: "JOAO2026123",
    referralBalance: 50.00,
    totalReferrals: 5,
    totalEarned: 50.00,
    referralCount: 5    // Calculado
  },
  // ...
]
```

##### `getCampaign(): ReferralCampaign | null`
Retorna configuração da campanha.

**Retorna campanha padrão se não existir:**
```typescript
{
  id: 'default_campaign',
  title: 'Indique e Ganhe',
  description: '...',
  bonusReferrer: 10.00,
  bonusReferred: 10.00,
  minimumPurchase: 40.00,
  monthlyPlanBonus: '1 cota de bolão especial',
  isActive: true,
  createdAt: '2026-02-17T...',
  updatedAt: '2026-02-17T...'
}
```

##### `saveCampaign(campaign): ReferralCampaign`
Salva ou atualiza campanha.

**Parâmetros:**
```typescript
referralService.saveCampaign({
  title: 'Nova Campanha',
  bonusReferrer: 15.00,
  // ... outros campos
})
```

**Merge automático:** Mantém campos não especificados

##### `toggleCampaignStatus(): boolean`
Ativa/desativa campanha.

**Retorna:** Novo status (true = ativa)

##### `generateMockData(): void`
Gera dados de exemplo para desenvolvimento.

**Cria:**
- 3 perfis de usuários
- 3 indicações com status variados

**Útil para:** Testes, demonstrações, desenvolvimento

##### `clearAllData(): void`
**⚠️ CUIDADO:** Remove todos os dados do LocalStorage.

**Remove:**
- Campanha
- Indicações
- Perfis de usuários

---

## 🔄 Fluxo de Dados

### Fluxo de Indicação Completo

```
┌─────────────────────────────────────────────────────────┐
│ 1. USUÁRIO COMPARTILHA CÓDIGO                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 2. NOVO USUÁRIO USA CÓDIGO NO CADASTRO                  │
│    - createOrUpdateUserProfile('new_user', 'Nome', CODE)│
│    - Profile tem referredBy = CODE                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 3. NOVO USUÁRIO FAZ PRIMEIRA COMPRA                     │
│    - Valor ≥ minimumPurchase                            │
│    - createReferral(...) é chamado                      │
│    - Status inicial: 'pending'                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 4. SISTEMA CONFIRMA PAGAMENTO                           │
│    - updateReferralStatus(id, 'confirmed')              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 5. ADMIN APROVA BÔNUS (ou automático)                   │
│    - updateReferralStatus(id, 'paid')                   │
│    - Bônus creditado no profile do indicador            │
│    - profile.referralBalance += bonusAmount             │
│    - profile.totalEarned += bonusAmount                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 6. INDICADOR USA SALDO                                  │
│    - debitBonus(userId, amount)                         │
│    - profile.referralBalance -= amount                  │
└─────────────────────────────────────────────────────────┘
```

### Persistência no LocalStorage

#### Key: `bolaomax_referral_campaign`
```json
{
  "id": "default_campaign",
  "title": "Indique e Ganhe",
  "description": "...",
  "bonusReferrer": 10.00,
  "bonusReferred": 10.00,
  "minimumPurchase": 40.00,
  "monthlyPlanBonus": "1 cota de bolão especial",
  "isActive": true,
  "createdAt": "2026-02-17T00:00:00.000Z",
  "updatedAt": "2026-02-17T00:00:00.000Z"
}
```

#### Key: `bolaomax_referrals`
```json
[
  {
    "id": "ref_1708214400000_abc123",
    "referrerId": "user_1",
    "referrerName": "João Silva",
    "referredId": "user_10",
    "referredName": "Ana Costa",
    "referralCode": "JOAO2026123",
    "status": "paid",
    "bonusAmount": 10.00,
    "purchaseValue": 50.00,
    "createdAt": "2026-02-15T00:00:00.000Z",
    "paidAt": "2026-02-15T12:00:00.000Z"
  }
]
```

#### Key: `bolaomax_user_referral_profiles`
```json
[
  {
    "userId": "user_1",
    "name": "João Silva",
    "referralCode": "JOAO2026123",
    "referredBy": null,
    "referralBalance": 50.00,
    "totalReferrals": 5,
    "totalEarned": 50.00
  }
]
```

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Painel Admin não carrega
**Sintoma:** Página em branco ou erro no console

**Soluções:**
```bash
# Verificar se servidor está rodando
curl http://localhost:5174/api/ping

# Verificar imports
grep -r "referralService" src/web/pages/admin/indicacoes.tsx

# Limpar LocalStorage
localStorage.clear()
```

#### 2. Botão "Gerar Mock Data" não funciona
**Sintoma:** Clica mas nada acontece

**Solução:**
```javascript
// No console do navegador (F12)
import { referralService } from '@/services/referralService';
referralService.generateMockData();
```

#### 3. Status não atualiza
**Sintoma:** Muda dropdown mas tabela não reflete

**Solução:**
- Verifique se `loadData()` está sendo chamado após `handleUpdateStatus`
- Limpe cache do navegador (Ctrl+Shift+R)

#### 4. Compartilhamento não funciona
**Sintoma:** Botões sociais não abrem apps

**Soluções:**
- WhatsApp: Verifique se está em dispositivo móvel ou tem WhatsApp Web
- Email: Verifique configuração de cliente de email padrão
- Facebook: Requer https em produção

#### 5. Código de indicação duplicado
**Sintoma:** Dois usuários com mesmo código

**Isso não deveria acontecer**, mas se ocorrer:
```typescript
// Forçar regeneração
const profile = referralService.getProfileByUserId('user_id');
profile.referralCode = referralService.generateReferralCode(
  profile.userId, 
  profile.name
);
// Salvar manualmente no LocalStorage
```

#### 6. Dados corrompidos no LocalStorage
**Sintoma:** Erros ao carregar página

**Solução:**
```javascript
// Limpar todos os dados de indicações
referralService.clearAllData();

// Ou limpar manualmente
localStorage.removeItem('bolaomax_referral_campaign');
localStorage.removeItem('bolaomax_referrals');
localStorage.removeItem('bolaomax_user_referral_profiles');
```

### Debug no Console

```javascript
// Ver todos os dados
console.log('Campaign:', referralService.getCampaign());
console.log('Referrals:', referralService.getAllReferrals());
console.log('Profiles:', referralService.getAllProfiles());
console.log('Stats:', referralService.getReferralStats());

// Ver dados de um usuário específico
const userId = 'user_1';
console.log('Profile:', referralService.getProfileByUserId(userId));
console.log('Referrals:', referralService.getReferralsByUser(userId));
console.log('Stats:', referralService.getReferralStats(userId));
```

### Comandos Úteis

```bash
# Ver estrutura de arquivos criados
find src/web -name "*referral*" -o -name "*indicacoes*" -o -name "ShareButtons*"

# Verificar imports
grep -r "referralService" src/web/

# Ver rotas configuradas
grep "indicacoes" src/web/app.tsx

# Verificar menu admin
grep -A5 "Indicações" src/web/components/admin/admin-layout.tsx
```

---

## 🎯 Próximos Passos (Melhorias Futuras)

### Backend Integration
- [ ] Conectar com API real (substituir LocalStorage)
- [ ] Endpoints REST para CRUD de indicações
- [ ] Webhooks para notificações

### Automação
- [ ] Notificações push quando indicado se cadastra
- [ ] Email automático quando bônus é creditado
- [ ] Integração com sistema de pagamentos

### Analytics
- [ ] Dashboard com gráficos de crescimento
- [ ] Relatório de ROI da campanha
- [ ] Exportação para Excel/CSV

### Gamificação
- [ ] Badges para top indicadores
- [ ] Desafios mensais com prêmios
- [ ] Página pública de ranking

### Segurança
- [ ] Rate limiting para geração de códigos
- [ ] Detecção de fraudes (múltiplas contas)
- [ ] Auditoria de ações admin

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte esta documentação
2. Verifique o console do navegador (F12)
3. Teste com dados mock
4. Limpe LocalStorage se necessário

**Arquivos de Referência:**
- `SISTEMA_INDICACOES_QUICK_START.md` - Guia rápido
- `SISTEMA_INDICACOES_URLS_TESTES.txt` - URLs para testar

---

**Versão:** 1.0.0  
**Data:** 17 de Fevereiro de 2026  
**Autor:** BolãoMax Team
