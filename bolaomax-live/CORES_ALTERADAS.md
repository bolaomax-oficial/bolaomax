# 🎨 ALTERAÇÃO DE CORES - MEGA-SENA

## ✅ MUDANÇAS REALIZADAS

### 1️⃣ **Cor Principal do Sistema**

**Arquivo:** `/src/web/styles.css`

```css
/* ANTES */
--color-bolao-green: #00C853;
--color-bolao-green-dark: #00A844;

/* DEPOIS */
--color-bolao-green: #02CF51;
--color-bolao-green-dark: #01A841;
```

**Impacto:**
- ✅ Toda a identidade visual verde do site
- ✅ Botões principais
- ✅ Links e destaques
- ✅ Badges e etiquetas
- ✅ Linhas e divisores

---

### 2️⃣ **Bordas dos Cards da Mega-Sena**

**Arquivo:** `/src/web/pages/megasena.tsx`

```tsx
/* ANTES */
border-bolao-card-border hover:border-emerald-500/50

/* DEPOIS */
border-2 border-[#02CF51]/70 hover:border-[#02CF51]
```

**Detalhes:**
- ✅ **Cards normais:** Borda `#02CF51` com 70% opacidade
- ✅ **Hover:** Borda `#02CF51` 100% (destaque)
- ⚠️ **Mega da Virada:** Mantém borda laranja (não alterado)

**Exemplo:**
```
┌──────────────────────────────────┐  ← Borda #02CF51/70
│  Mega-Sena #2651                 │
│  R$ 25,00 por cota               │
│  [🛒 Carrinho] [⚡ Comprar]      │
└──────────────────────────────────┘

┌──────────────────────────────────┐  ← Borda laranja (mantida)
│  ⭐ MEGA DA VIRADA                │
│  R$ 50,00 por cota               │
│  [🛒 Carrinho] [⚡ Comprar]      │
└──────────────────────────────────┘
```

---

## 🎯 O QUE FOI MANTIDO (NÃO ALTERADO)

✅ **Mega da Virada:**
- Borda laranja preservada
- Badges e destaque em laranja/dourado
- Identidade visual especial mantida

✅ **Elementos internos:**
- Badges verdes internos (emerald) dos cards
- Números dos jogos
- Ícones e decorações
- Fundos e gradientes

✅ **Outras páginas:**
- Lotofácil, Quina, etc mantêm suas cores
- Apenas Mega-Sena foi ajustada

---

## 📊 COMPARATIVO VISUAL

### **COR ANTIGA vs COR NOVA:**

```
#00C853 ████████  →  #02CF51 ████████
(Verde mais vibrante)  (Verde mais suave)
```

**Diferença:**
- Tom ligeiramente mais claro
- Mais próximo do verde "neon"
- Melhor contraste em fundos escuros

---

## 🧪 COMO VERIFICAR

### **1. Verificar cor global:**
```bash
# Abrir Developer Tools (F12)
# Console:
getComputedStyle(document.documentElement).getPropertyValue('--color-bolao-green')
# Resultado esperado: #02CF51
```

### **2. Verificar bordas dos cards:**
```
1. Ir para /megasena
2. Inspecionar card (NÃO Mega da Virada)
3. Ver border-color: #02CF51 com opacidade 70%
4. Hover: border-color: #02CF51 100%
```

### **3. Verificar Mega da Virada:**
```
1. Ir para /megasena
2. Localizar card "MEGA DA VIRADA"
3. Verificar borda: LARANJA (não verde)
4. ✅ Deve estar diferente dos outros
```

---

## 📁 ARQUIVOS MODIFICADOS

1. `/src/web/styles.css` (linha 47, 49)
2. `/src/web/pages/megasena.tsx` (linha 423)

---

## 🔄 STATUS

✅ **Cor principal atualizada:** `#02CF51`  
✅ **Bordas Mega-Sena:** Verde `#02CF51`  
✅ **Mega da Virada:** Laranja (preservada)  
✅ **Nada foi excluído:** Apenas ajustado  

---

## 🎨 PRÓXIMAS AÇÕES (SE NECESSÁRIO)

Se quiser ajustar outras cores:
- **Lotofácil:** `/src/web/pages/lotofacil.tsx`
- **Quina:** `/src/web/pages/quina.tsx`
- **Outros:** Procurar por `border-` nos arquivos `.tsx`

---

**Data:** 21/02/2026 22:45  
**Impacto:** Visual (CSS + componentes)  
**Requer restart:** Não (hot-reload automático)
