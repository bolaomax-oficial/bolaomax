# 🎰 COMO ADICIONAR NOVAS LOTERIAS AO BOLÃOMAX

## ✅ SISTEMA EXPANSÍVEL IMPLEMENTADO

O sistema foi desenvolvido de forma modular para facilitar a adição de novas loterias no futuro!

---

## 📋 LOTERIAS IMPLEMENTADAS

Atualmente temos:
- ✅ Mega-Sena (7-20 dezenas)
- ✅ Quina (6-15 dezenas)
- ✅ Lotofácil (16-20 dezenas)

---

## 🚀 COMO ADICIONAR NOVA LOTERIA

### **Passo 1: Adicionar no arquivo de constantes**

Editar: `src/web/constants/lotteries.ts`

```typescript
// Adicionar nova loteria no array LOTTERIES
{
  id: 'lotomania',
  name: 'Lotomania',
  slug: 'lotomania',
  description: 'Sorteios às terças, quintas e sábados',
  color: {
    primary: '#8B5CF6',    // Roxo
    secondary: '#7C3AED',
    light: '#A78BFA'
  },
  icon: 'Sparkles',
  drawDays: ['Terça', 'Quinta', 'Sábado'],
  drawTime: '20:00',
  dezenas: {
    min: 50,
    max: 50,          // Lotomania sempre 50 números
    totalNumbers: 100  // De 00 a 99
  },
  prizes: {
    tiers: 5,
    names: ['50 acertos', '49 acertos', '48 acertos', '47 acertos', '0 acertos']
  }
}
```

### **Passo 2: Definir tiers de premiação**

```typescript
export const LOTOMANIA_TIERS = [
  { name: '50 acertos', description: 'Acertar todos os 50 números' },
  { name: '49 acertos', description: '49 números corretos' },
  { name: '48 acertos', description: '48 números corretos' },
  { name: '47 acertos', description: '47 números corretos' },
  { name: '0 acertos', description: 'Não acertar nenhum número' }
];
```

### **Passo 3: Adicionar mock data no hook**

Editar: `src/web/hooks/useLotteryResults.ts`

```typescript
const generateLotomaniaData = (): LotteryResult => ({
  concurso: 2850,
  data: '05/02/2026',
  dezenas: generateRandomNumbers(50, 100), // 50 números de 0-99
  prizes: [
    { tier: '50 acertos', winners: 0, prizePerWinner: 0 },
    { tier: '49 acertos', winners: 5, prizePerWinner: 25000 },
    { tier: '48 acertos', winners: 150, prizePerWinner: 1500 },
    // ... outras faixas
  ],
  nextDraw: {
    date: '08/02/2026',
    estimatedPrize: 3500000
  }
});

// Adicionar case no switch
case 'lotomania':
  return generateLotomaniaData();
```

### **Passo 4: Criar página da nova loteria**

Criar: `src/web/pages/lotomania.tsx`

```typescript
export default function Lotomania() {
  const lotteryConfig = getLotteryById('lotomania');
  
  return (
    <div>
      <Header activePage="loterias" />
      <main>
        {/* Cards de bolões da Lotomania */}
        {/* Usar mesma estrutura das outras */}
      </main>
      <Footer />
    </div>
  );
}
```

### **Passo 5: Adicionar rota**

Editar: `src/web/app.tsx`

```typescript
import Lotomania from "./pages/lotomania";

// Adicionar rota
<Route path="/lotomania" component={Lotomania} />
```

### **Passo 6: Adicionar no modal de seleção**

Editar: `src/web/components/LotterySelectionModal.tsx`

```typescript
// Adicionar card no modal
<button
  onClick={() => {
    setLocation('/lotomania');
    onClose();
  }}
  className="lottery-option"
>
  <Sparkles className="w-12 h-12 text-purple-500" />
  <h3>Lotomania</h3>
  <p>Terças, Quintas e Sábados • 50 números</p>
</button>
```

### **Passo 7: Adicionar tab nos resultados**

A página de resultados já vai detectar automaticamente com base no array LOTTERIES!

---

## 📁 ARQUIVOS CRIADOS (Sistema Modular)

```
src/web/
├── constants/
│   └── lotteries.ts          ← CONFIGURAÇÕES CENTRALIZADAS
├── hooks/
│   └── useLotteryResults.ts  ← LÓGICA DE BUSCA
├── components/
│   ├── LotteryResultCard.tsx ← COMPONENTE REUTILIZÁVEL
│   └── LotterySelectionModal.tsx ← MODAL DE SELEÇÃO
└── pages/
    ├── resultados.tsx         ← PÁGINA DE RESULTADOS
    ├── lotofacil.tsx
    ├── megasena.tsx
    ├── quina.tsx
    └── [nova-loteria].tsx     ← ADICIONAR AQUI
```

---

## 🎯 LOTERIAS FÁCEIS DE ADICIONAR

### Próximas sugestões:
1. **Lotomania** (50 números de 00-99)
2. **Dupla Sena** (2 sorteios, 6 dezenas cada)
3. **Dia de Sorte** (7 números + mês da sorte)
4. **Super Sete** (7 colunas, 0-9)
5. **Timemania** (10 números + time do coração)
6. **Federal** (5 dígitos, prêmios fixos)

---

## 🔌 INTEGRAÇÃO COM API REAL

### API da Caixa (quando disponível):
```typescript
// Em useLotteryResults.ts
const CAIXA_API = 'https://servicebus2.caixa.gov.br/portaldeloterias/api';

const fetchRealResults = async (type: string) => {
  const response = await fetch(`${CAIXA_API}/${type}/latest`);
  return await response.json();
};
```

### Alternativa - Web Scraping:
Se a API oficial não estiver disponível, pode-se fazer scraping do site da Caixa.

---

## ⚡ AUTO-ATUALIZAÇÃO

O sistema já implementa:
- ✅ Busca automática a cada 5 minutos
- ✅ Cache local (evita requisições desnecessárias)
- ✅ Botão manual "Atualizar Resultados"
- ✅ Loading states

---

## 📊 ESTATÍSTICAS AUTOMÁTICAS

Para cada loteria, o sistema calcula:
- 🔥 Números quentes (mais sorteados)
- ❄️ Números frios (menos sorteados)
- 📈 Top 10 mais frequentes
- 📉 Top 10 menos frequentes
- 🎯 Estatísticas por faixa de premiação

---

## 🎨 CORES PRÉ-DEFINIDAS

```typescript
LOTERIAS_CORES = {
  'megasena': '#00A844',     // Verde
  'quina': '#0EA5E9',        // Azul
  'lotofacil': '#9333EA',    // Roxo
  'lotomania': '#8B5CF6',    // Roxo escuro
  'duplasena': '#EC4899',    // Rosa
  'diasorte': '#F59E0B',     // Amarelo
  'supersete': '#EF4444',    // Vermelho
  'timemania': '#10B981',    // Verde água
  'federal': '#6366F1'       // Índigo
}
```

---

## ✅ BENEFÍCIOS DO SISTEMA MODULAR

1. ✅ **Fácil manutenção** - configurações centralizadas
2. ✅ **Rápida expansão** - adicionar loteria leva ~30 minutos
3. ✅ **Código reutilizável** - componentes flexíveis
4. ✅ **Type-safe** - TypeScript garante consistência
5. ✅ **Performance** - cache e otimizações
6. ✅ **Escalável** - suporta ilimitadas loterias

---

## 🚀 EXEMPLO COMPLETO: Adicionar Lotomania

```bash
# 1. Editar constants
nano src/web/constants/lotteries.ts
# Adicionar objeto da Lotomania

# 2. Atualizar hook
nano src/web/hooks/useLotteryResults.ts
# Adicionar case 'lotomania'

# 3. Criar página
nano src/web/pages/lotomania.tsx
# Copiar estrutura de quina.tsx e adaptar

# 4. Adicionar rota
nano src/web/app.tsx
# Adicionar import e Route

# 5. Atualizar modal
nano src/web/components/LotterySelectionModal.tsx
# Adicionar botão Lotomania

# Pronto! Nova loteria funcionando!
```

---

**O sistema está pronto para crescer! 🎰📈**
