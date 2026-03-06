# 👥 SISTEMA DE SUB-USUÁRIOS - DOCUMENTAÇÃO COMPLETA

## ✅ IMPLEMENTAÇÃO EM ANDAMENTO

---

## 🎯 OBJETIVO

Criar sistema de gerenciamento de equipe onde o **Admin Master** pode:
- ✅ Criar contas para membros da equipe
- ✅ Definir permissões granulares por módulo
- ✅ Ativar/Desativar/Bloquear acessos
- ✅ Editar permissões a qualquer momento
- ✅ Excluir sub-usuários
- ✅ Ver logs de auditoria

---

## 🗄️ DATABASE (JÁ CRIADO)

### **Tabelas:**

#### `sub_usuarios`
```sql
- id (PK)
- nome
- email (UNIQUE)
- password_hash
- telefone
- avatar
- cargo (Ex: "Gerente", "Atendente")
- status (ativo, inativo, bloqueado)
- criado_por (FK → users.id)
- criado_em
- atualizado_em
- ultimo_acesso
- notas
```

#### `permissoes_sub_usuario`
```sql
- id (PK)
- sub_usuario_id (FK)
- modulo (boloes, usuarios, financeiro, saques, relatorios, suporte, whatsapp)
- permissao (visualizar, criar, editar, excluir, aprovar, enviar)
- ativo (BOOLEAN)
- criado_em
```

#### `roles_pre_definidas`
```sql
- id (PK)
- nome (Gerente Geral, Atendente, Analista Financeiro, Operador)
- descricao
- permissoes (JSON)
```

#### `logs_acesso_sub_usuario`
```sql
- id (PK)
- sub_usuario_id (FK)
- acao (login, visualizou_boloes, editou_bolao, etc)
- modulo
- detalhes (JSON)
- ip_address
- user_agent
- criado_em
```

---

## 🔐 MÓDULOS E PERMISSÕES

### **Estrutura de Permissões:**

| Módulo | Permissões Disponíveis |
|--------|------------------------|
| **Bolões** | visualizar, criar, editar, excluir |
| **Usuários** | visualizar, editar |
| **Financeiro** | visualizar |
| **Saques** | visualizar, aprovar |
| **Relatórios** | visualizar |
| **Suporte** | visualizar, criar, editar |
| **WhatsApp** | visualizar, enviar |

---

## 👔 ROLES PRÉ-DEFINIDAS (TEMPLATES)

### **1. Gerente Geral**
```json
{
  "boloes": ["visualizar", "criar", "editar"],
  "usuarios": ["visualizar", "editar"],
  "financeiro": ["visualizar"],
  "saques": ["visualizar", "aprovar"],
  "relatorios": ["visualizar"],
  "suporte": ["visualizar", "criar", "editar"],
  "whatsapp": ["visualizar", "enviar"]
}
```
**Pode:** Quase tudo exceto excluir dados críticos

---

### **2. Atendente**
```json
{
  "boloes": ["visualizar"],
  "usuarios": ["visualizar"],
  "suporte": ["visualizar", "criar", "editar"],
  "whatsapp": ["visualizar", "enviar"]
}
```
**Pode:** Suporte ao cliente, ver informações básicas

---

### **3. Analista Financeiro**
```json
{
  "financeiro": ["visualizar"],
  "saques": ["visualizar", "aprovar"],
  "relatorios": ["visualizar"],
  "usuarios": ["visualizar"]
}
```
**Pode:** Gestão financeira, aprovar saques

---

### **4. Operador de Bolões**
```json
{
  "boloes": ["visualizar", "criar", "editar"],
  "usuarios": ["visualizar"]
}
```
**Pode:** Gerenciar bolões apenas

---

## 📊 INTERFACE DO ADMIN

### **Menu Lateral (novo item):**
```
Admin
├── Painel
├── Bolões
├── 👥 Sub-Usuários ← NOVO!
├── Financeiro
├── Usuários
├── Configurações
└── Sair
```

---

### **Página: /admin/sub-usuarios**

```
┌────────────────────────────────────────────────────────────┐
│  👥 Sub-Usuários                     [+ Adicionar Membro]  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Filtros: [Todos ▼] [Cargo ▼] [🔍 Buscar...]             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Nome          Email           Cargo       Status    │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ João Silva    joao@email.com  Gerente    ● Ativo   │  │
│  │ [Bolões] [Usuários] [Financeiro] [Saques]          │  │
│  │ [✏️ Editar] [🔄 Desativar] [🗑️ Excluir]            │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ Maria Santos  maria@email.com Atendente  ● Ativo   │  │
│  │ [Suporte] [WhatsApp]                                │  │
│  │ [✏️ Editar] [🔄 Desativar] [🗑️ Excluir]            │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ Pedro Costa   pedro@email.com Analista   ⏸ Inativo │  │
│  │ [Financeiro] [Saques] [Relatórios]                  │  │
│  │ [✏️ Editar] [🔄 Ativar] [🗑️ Excluir]               │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

### **Modal: Adicionar Sub-Usuário**

```
┌───────────────────────────────────────────────────┐
│  👤 Novo Membro da Equipe                         │
├───────────────────────────────────────────────────┤
│                                                    │
│  📋 Informações Básicas                           │
│  ┌────────────────────────────────────────────┐   │
│  │ Nome completo:    [________________]       │   │
│  │ Email:            [________________]       │   │
│  │ Senha:            [________________]       │   │
│  │ Telefone:         [________________]       │   │
│  │ Cargo/Função:     [________________]       │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  🎯 Usar Template (Opcional)                      │
│  [Gerente Geral] [Atendente] [Analista] [Operador]│
│                                                    │
│  ✅ Definir Permissões                            │
│                                                    │
│  ▸ Bolões                                          │
│    ☑ Visualizar  ☐ Criar  ☐ Editar  ☐ Excluir   │
│                                                    │
│  ▸ Usuários                                        │
│    ☑ Visualizar  ☐ Editar                        │
│                                                    │
│  ▸ Financeiro                                      │
│    ☑ Visualizar                                   │
│                                                    │
│  ▸ Saques                                          │
│    ☑ Visualizar  ☐ Aprovar                       │
│                                                    │
│  ▸ Relatórios                                      │
│    ☑ Visualizar                                   │
│                                                    │
│  ▸ Suporte                                         │
│    ☑ Visualizar  ☑ Criar  ☑ Editar              │
│                                                    │
│  ▸ WhatsApp                                        │
│    ☑ Visualizar  ☑ Enviar                        │
│                                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  [Cancelar]                    [Criar Sub-Usuário]│
└───────────────────────────────────────────────────┘
```

---

## 🔒 COMO FUNCIONA

### **1. Admin Master cria sub-usuário:**
```
Admin → "Adicionar Sub-Usuário"
      → Preenche dados
      → Seleciona permissões
      → Salva
```

### **2. Sub-usuário faz login:**
```
Sub-usuário → Login com email/senha
            → Sistema verifica permissões
            → Menu mostra APENAS itens permitidos
```

### **3. Sub-usuário tenta acessar recurso:**
```
Sub-usuário → Clica em "Bolões"
            → Middleware verifica permissão "boloes.visualizar"
            → Se TEM: Exibe página
            → Se NÃO TEM: Erro 403 "Sem permissão"
```

### **4. Admin altera permissões:**
```
Admin → Lista sub-usuários
      → Clica "Editar Permissões" em João
      → Adiciona "Saques.Aprovar"
      → Salva
      → João agora pode aprovar saques
```

### **5. Admin desativa sub-usuário:**
```
Admin → Toggle status de "Ativo" para "Inativo"
      → Sub-usuário não consegue mais fazer login
      → Sessão atual é invalidada
```

---

## 🎨 MENU DINÂMICO POR PERMISSÃO

### **Admin Master vê:**
```
├── Painel
├── Bolões
├── Sub-Usuários ← Só admin master
├── Financeiro
├── Saques
├── Usuários
├── Relatórios
├── Suporte
├── WhatsApp
└── Configurações
```

### **Gerente (com permissões) vê:**
```
├── Painel
├── Bolões (ver, criar, editar)
├── Financeiro (só ver)
├── Saques (ver, aprovar)
├── Usuários (só ver)
├── Relatórios
├── Suporte
└── WhatsApp
```

### **Atendente (limitado) vê:**
```
├── Painel
├── Suporte
└── WhatsApp
```

---

## 🔧 API ENDPOINTS (JÁ CRIADOS)

```
GET    /api/admin/sub-usuarios              - Listar todos
GET    /api/admin/sub-usuarios/:id          - Buscar específico
POST   /api/admin/sub-usuarios              - Criar novo
PUT    /api/admin/sub-usuarios/:id          - Atualizar dados
PUT    /api/admin/sub-usuarios/:id/permissoes - Atualizar permissões
PATCH  /api/admin/sub-usuarios/:id/status   - Ativar/Desativar/Bloquear
DELETE /api/admin/sub-usuarios/:id          - Excluir
GET    /api/admin/sub-usuarios/roles/templates - Templates de roles
```

---

## 🔒 MIDDLEWARE DE SEGURANÇA

### **Verificação de Permissão:**
```javascript
// Proteger rota específica
app.get('/api/admin/boloes', 
  requireAuth,
  requirePermission('boloes', 'visualizar'),
  (req, res) => { ... }
);

// Requer qualquer uma das permissões (OR)
app.post('/api/admin/boloes',
  requireAuth,
  requireAnyPermission([
    ['boloes', 'criar'],
    ['boloes', 'editar']
  ]),
  (req, res) => { ... }
);
```

---

## 📋 STATUS DE IMPLEMENTAÇÃO

### ✅ **BACKEND (100% Pronto):**
- [x] Tabelas criadas
- [x] Migrations executadas
- [x] Serviço sub-usuarios.js
- [x] API routes completa
- [x] Middleware de permissões
- [x] Roles pré-definidas
- [x] Sistema de logs

### ⏳ **FRONTEND (Em criação):**
- [ ] Página Sub-Usuários
- [ ] Modal Criar Sub-Usuário
- [ ] Modal Editar Permissões
- [ ] Item no menu lateral
- [ ] Menu dinâmico baseado em permissões
- [ ] Serviço frontend

---

## 🎯 PRÓXIMOS PASSOS

Vou criar o frontend agora com todos os componentes visuais!

Devo continuar? 🚀
