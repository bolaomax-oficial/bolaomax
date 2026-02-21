# Sistema de Indicações BolãoMax - Guia Rápido

## 🚀 Início Rápido em 5 Minutos

### 1. Acessar Painel Admin
```
URL: http://localhost:5174/admin/indicacoes
```

### 2. Gerar Dados de Teste
1. Clique no botão **"Gerar Dados Mock"** (canto superior direito)
2. ✅ Sistema cria automaticamente:
   - 3 usuários com códigos de indicação
   - 3 indicações de exemplo
   - Estatísticas preenchidas

### 3. Ver o Sistema Funcionando

#### Admin Dashboard
- **Estatísticas:** 4 cards com métricas
- **Configuração:** Editar valores de bônus
- **Relatório:** Tabela com todas indicações
- **Ranking:** Top 10 indicadores

#### Painel Cliente
```
URL: http://localhost:5174/indicacoes
```
- **Compartilhar:** Código + Links + Botões sociais
- **Acompanhar:** Suas indicações em tempo real
- **Usar Saldo:** Bônus disponível para gastar

---

## 📋 Tarefas Comuns

### Configurar Campanha
1. Admin → Indicações
2. Clique **"Editar"**
3. Altere valores:
   - Bônus Indicador: R$ 10,00
   - Bônus Indicado: R$ 10,00
   - Mínimo Compra: R$ 40,00
4. Clique **"Salvar"**

### Ativar/Desativar Campanha
1. Admin → Indicações
2. Clique **"Ativar"** ou **"Desativar"**
3. Status muda imediatamente

### Alterar Status de Indicação
1. Admin → Indicações → Tabela
2. Localize a indicação
3. Dropdown "Ações" → Selecione:
   - Pendente
   - Confirmada
   - **Paga** (credita bônus automaticamente!)

### Compartilhar Código (Cliente)
1. Acesse `/indicacoes`
2. Copie o código (botão "Copiar")
3. Ou use botões:
   - 📱 WhatsApp
   - 📧 Email
   - 📘 Facebook
   - 🔗 Mais

---

## 🔑 Informações Importantes

### Regras de Negócio

#### Indicador Ganha:
- ✅ R$ 10 quando indicado compra ≥ R$ 40
- ✅ 1 cota extra se indicado assinar plano mensal
- ✅ Sem limite de indicações

#### Indicado Ganha:
- ✅ R$ 10 de bônus na primeira compra
- ✅ Mínimo R$ 40 para ativar

#### Validações:
- ❌ Não pode usar próprio código
- ❌ Código válido apenas 1x por cliente
- ❌ Cliente existente não pode usar código

### Status de Indicação

```
Pendente → Confirmada → Paga
   🟡         🔵        🟢
```

- **Pendente:** Aguardando confirmação da compra
- **Confirmada:** Compra confirmada, bônus a pagar
- **Paga:** Bônus creditado na conta (automático!)

---

## 📱 URLs de Acesso

| Página | URL | Descrição |
|--------|-----|-----------|
| Admin Indicações | `/admin/indicacoes` | Gerenciar campanha |
| Client Indicações | `/indicacoes` | Compartilhar código |
| Admin Config | `/admin/configuracoes` | Outras configs |

---

## 🛠️ Comandos Úteis

### Ver dados no Console (F12)
```javascript
// Ver campanha
referralService.getCampaign()

// Ver todas indicações
referralService.getAllReferrals()

// Ver perfis de usuários
referralService.getAllProfiles()

// Ver estatísticas
referralService.getReferralStats()

// Gerar dados mock
referralService.generateMockData()

// LIMPAR TUDO (cuidado!)
referralService.clearAllData()
```

### Verificar servidor
```bash
curl http://localhost:5174/api/ping
```

---

## ⚡ Atalhos Rápidos

### Resetar Sistema
```javascript
// No console do navegador (F12)
referralService.clearAllData();
referralService.generateMockData();
location.reload();
```

### Criar Usuário com Código
```javascript
const profile = referralService.createOrUpdateUserProfile(
  'user_123',
  'Novo Usuário'
);
console.log('Código:', profile.referralCode);
```

### Criar Indicação Manual
```javascript
const ref = referralService.createReferral(
  'user_1',           // ID indicador
  'João Silva',       // Nome indicador
  'user_10',          // ID indicado
  'Maria Costa',      // Nome indicado
  'JOAO2026123',      // Código usado
  50.00               // Valor compra
);
```

### Ver Ranking
```javascript
const top10 = referralService.getTopReferrers(10);
console.table(top10);
```

---

## 🐛 Problemas Comuns

### "Página em branco"
```javascript
// Limpar LocalStorage
localStorage.clear();
location.reload();
```

### "Botões não funcionam"
- Verifique console (F12) para erros
- Recarregue página (Ctrl+R)
- Limpe cache (Ctrl+Shift+R)

### "Dados não aparecem"
```javascript
// Gerar dados de teste
referralService.generateMockData();
location.reload();
```

---

## 📚 Documentação Completa

Para informações detalhadas, consulte:
- `SISTEMA_INDICACOES_DOCUMENTACAO.md` - Doc completa
- `SISTEMA_INDICACOES_URLS_TESTES.txt` - URLs para testes

---

## ✅ Checklist de Teste

- [ ] Admin carrega sem erros
- [ ] Gerar dados mock funciona
- [ ] Editar campanha salva
- [ ] Ativar/desativar funciona
- [ ] Status de indicação atualiza
- [ ] Ranking aparece corretamente
- [ ] Cliente carrega sem erros
- [ ] Botão copiar código funciona
- [ ] Botão copiar link funciona
- [ ] WhatsApp abre conversa
- [ ] Email abre cliente
- [ ] Tabela de indicações aparece
- [ ] Saldo disponível correto

---

**Pronto para usar!** 🎉

Acesse `/admin/indicacoes` e clique em "Gerar Dados Mock" para começar.
