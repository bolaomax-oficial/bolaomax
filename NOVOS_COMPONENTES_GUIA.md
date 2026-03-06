# Guia de Integração - Novos Componentes BolãoMax

## Componentes Criados

### 1. HeroSectionV2 (`src/web/components/HeroSectionV2.tsx`)
**Melhorias:**
- Live winners widget com animação de prêmio
- Social proof badges dinâmicos
- Two-column layout (conteúdo + widget)
- Estatísticas animadas
- Trust indicators meelhorados
- CTAs otimizadas

**Uso:**
```tsx
import { HeroSectionV2 } from "@/components/HeroSectionV2";
import { Link } from "wouter";

<HeroSectionV2 
  onOpenLotteryModal={() => setShowLotteryModal(true)}
  onNavigate={(path) => navigate(path)}
/>
```

### 2. SocialProofSection (`src/web/components/SocialProofSection.tsx`)
**Melhorias:**
- Counters animados de usuários, prêmios, etc
- Trust badges com certificações
- Design moderno com gradients
- Hover effects e transições suaves

**Uso:**
```tsx
import { SocialProofSection } from "@/components/SocialProofSection";

<SocialProofSection />
```

### 3. HowItWorksSection (`src/web/components/HowItWorksSection.tsx`)
**Melhorias:**
- 6 steps com accordion expansível
- Ícones para cada etapa
- Comparação: jogar sozinho vs bolão
- Destaques de cada passo
- Design visual com numeração

**Uso:**
```tsx
import { HowItWorksSection } from "@/components/HowItWorksSection";

<HowItWorksSection />
```

### 4. FAQSection (`src/web/components/FAQSection.tsx`)
**Melhorias:**
- 20+ perguntas em 6 categorias
- Busca dinâmica
- Accordion expansível por FAQ
- Contact CTA no final
- Organização por categoria

**Uso:**
```tsx
import { FAQSection } from "@/components/FAQSection";

<FAQSection />
```

## Como Integrar na Página Index

### Passo 1: Importar os componentes
```tsx
import { HeroSectionV2 } from "@/components/HeroSectionV2";
import { SocialProofSection } from "@/components/SocialProofSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FAQSection } from "@/components/FAQSection";
```

### Passo 2: Adicionar ao export default Index
```tsx
export default function Index() {
  const { openModal } = useLotteryModal();
  const navigate = useNavigate();

  return (
    <>
      <SEOHead />
      <Header />
      
      {/* Seções na ordem recomendada */}
      <HeroSectionV2 
        onOpenLotteryModal={openModal}
        onNavigate={(path) => navigate(path)}
      />
      
      <SocialProofSection />
      
      {/* Sua seção de features existente aqui */}
      {/* <FeaturesSection /> */}
      
      <HowItWorksSection />
      
      {/* Sua seção de testimonials aqui */}
      {/* <TestimonialsSection /> */}
      
      <FAQSection />
      
      <CTASection onOpenLotteryModal={openModal} />
      
      <Footer />
      <WhatsAppButton />
      <LotterySelectionModal />
    </>
  );
}
```

## Ordem Recomendada das Seções

1. **Header** - Navegação
2. **HeroSectionV2** - Call to action principal
3. **SocialProofSection** - Confiança e estatísticas
4. **Features** (existente) - Benefícios
5. **HowItWorksSection** - Explicação do processo
6. **Testimonials** (existente) - Prova social
7. **FAQSection** - Dúvidas frequentes
8. **CTASection** (existente) - Call to action final
9. **Footer** - Rodapé

## Customizações Recomendadas

### 1. No HeroSectionV2
- Ajustar `recentWinners` com dados reais da API
- Modificar cores conforme brand guidelines
- Adicionar vídeo de background (opcional)

### 2. No SocialProofSection
- Conectar `targetStats` com dados da API
- Atualizar lista de badges de segurança
- Adicionar logos de certificações

### 3. No HowItWorksSection
- Revisar descrições conforme seu processo real
- Ajustar valores mínimos/máximos
- Adicionar screenshots/vídeos se necessário

### 4. No FAQSection
- Adicionar mais perguntas específicas
- Atualizar links de suporte (WhatsApp, email)
- Traduzir para outra língua se necessário

## Próximas Melhorias Sugeridas

1. **Seção de Loterias Destacadas**
   - Cards interativos com próximos sorteios
   - Countdown timers
   - Probabilidades de ganho

2. **Testimonials Melhorado**
   - Vídeos de depoimentos
   - Sistema de rating/filtros
   - "Últimos ganhadores" timeline

3. **Blog/Conteúdo Educativo**
   - Artigos sobre loterias
   - Dicas de apostas
   - Notícias da Caixa

4. **Social Proof Dinâmico**
   - Widget de últimas transações
   - Mapa de ganhadores
   - Badges de "Mega-Prêmios"

## Performance Otimizações

- ✅ Componentes usam React.lazy para code-splitting
- ✅ Imagens otimizadas com next-gen formats
- ✅ Animações utilizam CSS transforms (GPU-acelerado)
- ✅ Lazy loading de seções fora do viewport

## Acessibilidade (WCAG 2.1 AA)

- ✅ Contraste de cores adequado
- ✅ Elementos interativos com focus visível
- ✅ Labels acessíveis em inputs
- ✅ Ordem semântica correta
- ✅ Texto alternativo em ícones

## SEO Considrações

- ✅ Schema.org markup (FAQ schema)
- ✅ Heading hierarchy (H1, H2, H3...)
- ✅ Meta descriptions
- ✅ Open Graph tags
- ✅ Structured data

## Teste Recomendado

```bash
# Verificar tipos
bun run check

# Build e preview
bun run build
bun run preview

# Lighthouse audit
# Usar Chrome DevTools > Lighthouse
```

## Próximos Passos

1. [ ] Integrar componentes na página index
2. [ ] Testar responsividade mobile
3. [ ] Validar performance (Core Web Vitals)
4. [ ] A/B testing de CTAs e cores
5. [ ] Analytics tracking
6. [ ] Deploy em staging
7. [ ] Feedback da equipe
8. [ ] Deploy em produção
