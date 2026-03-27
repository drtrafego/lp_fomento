

# Nova aba "Cliques & Botões" no Dashboard

## Objetivo
Criar uma aba dedicada à análise de cliques em botões, com insights sobre conversão, impacto da remoção do botão da hero, e performance de cada CTA.

## Estrutura da aba

### 1. Cards de métricas principais (topo)
- **Total de Cliques em CTAs** (filtrar `click_target` que contenha botão/link relevante)
- **Clique → Checkout (taxa)** (cruzar cliques em CTAs com `checkout_events`)
- **Clique → Compra (taxa)** (cruzar com purchases)
- **Botão mais clicado** (nome + contagem)

### 2. Ranking de botões (tabela)
Agrupar cliques por `click_target` filtrando por elementos de ação (`button`, `a`, e textos conhecidos como "GARANTIR", "QUERO MEU INGRESSO", etc.). Mostrar:
- Nome/texto do botão
- Seção onde aparece (`section_name`)
- Total de cliques
- % do total

### 3. Análise: Hero com botão vs sem botão (antes/depois)
O botão da hero foi comentado (removido). Comparar períodos:
- **Com botão**: dados antes da remoção
- **Sem botão**: dados depois da remoção
- Métricas: taxa de checkout, taxa de compra, scroll depth médio
- Mostrar se a remoção melhorou ou piorou conversão

### 4. Gráfico: Cliques por seção (bar chart horizontal)
Cliques agrupados por `section_name` para ver onde os usuários mais interagem.

### 5. Gráfico: Botão de vídeo / prova social
Filtrar cliques em elementos de vídeo (`click_target` contendo "video", "play", "depoimento") para medir engajamento com prova social.

### 6. Funil por botão
Para cada CTA principal, mostrar: Cliques → Checkouts → Compras (com taxas de conversão).

## Detalhes técnicos

### Novo arquivo: `src/components/dashboard/ClicksTab.tsx`
- Query `page_analytics` filtrando `event_type = 'click'`
- Query `checkout_events` para cruzar conversões
- Identificar CTAs por padrões no `click_target`: `button:GARANTIR`, `button:QUERO MEU INGRESSO`, etc.
- Usar recharts para gráficos (já instalado)
- Aceita prop `dateRange` como as outras abas

### Alteração: `src/pages/Dashboard.tsx`
- Adicionar `{ id: "clicks", label: "Cliques & Botões" }` ao array `TABS`
- Lazy import do `ClicksTab`
- Renderizar no switch de abas

### Bug fix incluído: viewport_y decimal
Os network requests mostram erros `invalid input syntax for type integer: "3956.75"` porque `e.clientY + window.scrollY` produz decimais. Corrigir em `usePageAnalytics.ts` aplicando `Math.round()` nos valores de `viewport_x` e `viewport_y`.

