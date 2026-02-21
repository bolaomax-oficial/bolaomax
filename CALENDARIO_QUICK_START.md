# 🚀 GUIA RÁPIDO - CALENDÁRIO DE SORTEIOS

## ⚡ START RÁPIDO (5 minutos)

### 1. Iniciar o servidor
```bash
cd /home/user/bolaomax-modern
npm run dev
# Acessa em: http://localhost:5175
```

### 2. Acessar as páginas
- **Pública:** http://localhost:5175/calendar
- **Admin:** http://localhost:5175/admin/calendario

### 3. Testar API
```bash
# Todos os sorteios
curl http://localhost:5175/api/sorteios

# Próximos 30 dias
curl http://localhost:5175/api/sorteios/proximos?dias=30

# Sorteios de Fevereiro
curl http://localhost:5175/api/sorteios/mes/2?ano=2025

# Exportar .ics
curl http://localhost:5175/api/sorteios/exportar?formato=ics > sorteios.ics
```

---

## 📋 CHECKLIST - O QUE FOI IMPLEMENTADO

### Backend ✅
- [x] 4 tabelas de banco de dados criadas
- [x] 45 sorteios pré-cadastrados (9 loterias)
- [x] 6 endpoints RESTful funcionando
- [x] Exportação .ics, CSV, JSON
- [x] Sistema de alertas CRUD
- [x] CORS habilitado

### Frontend Público ✅
- [x] Página `/calendar` com Header + Footer
- [x] 3 views: Próximos, Calendário, Lista
- [x] Busca e filtros
- [x] Responsivo para mobile

### Admin Panel ✅
- [x] Página `/admin/calendario` integrada
- [x] Dashboard com estatísticas
- [x] 3 views diferentes
- [x] Menu lateral com botão "Calendário"

---

## 📊 DADOS DISPONÍVEIS

### 45 Sorteios Pré-Cadastrados
```
Mega-Sena    : 7 sorteios   (Qua/Sab)
Lotofácil    : 6 sorteios   (Diários)
Quina        : 6 sorteios   (Diários)
Lotomania    : 6 sorteios   (Ter/Qui/Sab)
Dupla Sena   : 4 sorteios   (Ter/Qui/Sab)
Timemania    : 4 sorteios   (Ter/Qui/Sab)
Dia de Sorte : 4 sorteios   (Ter/Qui/Sab)
Super Sete   : 4 sorteios   (Seg/Qua/Sex)
Federal      : 4 sorteios   (Qua/Sab)
```

Todos com: data, hora, local, cor, ícone, badges

---

## 🎯 ENDPOINTS MAIS USADOS

### Listar Sorteios
```bash
GET /api/sorteios
GET /api/sorteios?tipo=megasena
GET /api/sorteios?mes=2&ano=2025
```

### Próximos Sorteios
```bash
GET /api/sorteios/proximos?dias=30
# Response: lista com badges "Hoje", "Amanhã", "Esta Semana"
```

### Exportar para Calendário
```bash
GET /api/sorteios/exportar?formato=ics
# Download direto do arquivo .ics
```

### Gerenciar Alertas
```bash
POST /api/sorteios/alertas
{
  "usuarioId": "user123",
  "sorteioId": "megasena_20250219_2789",
  "tipo": "email",
  "diasAntes": 1
}
```

---

## 🎨 CORES POR LOTERIA

```
Mega-Sena    → #10B981 (Emerald)
Lotofácil    → #8B5CF6 (Violet)
Quina        → #0EA5E9 (Sky)
Lotomania    → #F97316 (Orange)
Dupla Sena   → #A855F7 (Purple)
Timemania    → #10B981 (Green)
Dia de Sorte → #F59E0B (Yellow)
Super Sete   → #EC4899 (Pink)
Federal      → #3B82F6 (Blue)
```

---

## 🔧 PERSONALIZAÇÕES COMUNS

### Adicionar novo sorteio
Editar: `src/api/services/sorteios-precadastrados.ts`
```typescript
{
  tipo: "megasena",
  numero: 2795,
  data: "2025-03-12",
  hora: "20:00",
  dia_semana: "Quarta",
  mes: 3,
  ano: 2025,
  local_sorteio: "São Paulo",
}
```

### Alterar cores
Editar: `getCoresPorLoteria()` em `sorteios-precadastrados.ts`

### Alterar quantidade de dias (próximos)
Editar: `src/web/pages/calendar.tsx`
```typescript
const resProximos = await fetch("/api/sorteios/proximos?dias=60"); // 60 dias ao invés de 30
```

---

## 📱 RESPONSIVE DESIGN

- ✅ Mobile: 1 coluna
- ✅ Tablet: 2 colunas
- ✅ Desktop: 3+ colunas
- ✅ Calendário adapta automaticamente

---

## 🧪 DEBUG

### Ver logs do servidor
```bash
tail -f /tmp/server.log
```

### Testar conexão
```bash
curl http://localhost:5175/api/ping
# {"message":"Pong! ..."}
```

### Ver todos os sorteios (pretty print)
```bash
curl http://localhost:5175/api/sorteios | python3 -m json.tool
```

---

## ⚙️ CONFIGURAÇÕES

### Porta
Padrão: `5175`
Mudar em: `vite.config.ts`

### Banco de Dados
Atualmente: Mock em memória
Para produção: Conectar ao SQLite real

### CORS
Habilitado para todas as origens (`*`)
Para produção: Restringir em `src/api/index.ts`

---

## 🐛 TROUBLESHOOTING

### "404 Not Found" na API
- Verificar se servidor está rodando: `curl http://localhost:5175/api/ping`
- Verificar URL: deve ser `/api/sorteios` não `/sorteios`

### Página branca ao abrir `/calendar`
- Abrir console (F12) e ver erros
- Verificar se API está respondendo: `curl http://localhost:5175/api/sorteios`

### .ics não está sendo baixado
- Verificar headers de resposta: `curl -v http://localhost:5175/api/sorteios/exportar?formato=ics`
- Content-Type deve ser `text/calendar`

---

## 📚 DOCUMENTAÇÃO

- **API Detalhada**: `CALENDARIO_API_PRONTA.md`
- **Implementação Completa**: `CALENDARIO_SORTEIOS_COMPLETO.md`
- **Este arquivo**: `CALENDARIO_QUICK_START.md`

---

## 🎉 PRONTO!

Seu calendário de sorteios está **100% funcional** e pronto para usar!

### Próximos passos opcionais:
1. Conectar a um banco de dados real (SQLite)
2. Implementar sistema de notificações por email
3. Adicionar sincronização com Google Calendar
4. Criar app mobile

---

**Desenvolvido com ❤️ por Runable AI**
**17 de Fevereiro de 2026**
