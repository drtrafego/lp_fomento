

# Ranking de Cliques em Vídeos (Mobile vs Desktop)

## Problema atual
Os cliques nos vídeos são todos registrados com o mesmo `click_target` ("div: Toque para ouvir"), impossibilitando identificar qual vídeo específico foi clicado. Precisamos de duas mudanças: uma para rastrear corretamente e outra para exibir no dashboard.

## Alterações

### 1. `src/components/VideoTestimonials.tsx`
Adicionar o `handle` do depoimento no texto capturado pelo click tracker. No overlay de play (div com `onClick`), adicionar um atributo `data-video` com o handle do depoimento. Também ajustar o texto do span para incluir o handle, de forma que o click_target registrado seja algo como `"div:▶ @bulldogburguer"` em vez de `"div: Toque para ouvir"` genérico.

Concretamente: trocar o conteúdo do span "Toque para ouvir" para incluir um `data-click-label` ou simplesmente mudar o texto capturado usando um atributo no div pai que o tracker já captura (tag:textContent).

Abordagem mais limpa: adicionar um `aria-label` com o handle no div clicável, e no `usePageAnalytics.ts`, usar `aria-label` quando disponível como `click_target`.

### 2. `src/hooks/usePageAnalytics.ts`
No handleClick, priorizar `aria-label` ou `data-click-label` do elemento clicado (ou ancestral próximo) para o `click_target`, para que cliques em vídeos capturem o nome do depoimento.

### 3. `src/components/dashboard/ClicksTab.tsx`
Adicionar uma nova seção **"🎬 Ranking de Vídeos"** com:
- Tabela rankeando cliques por vídeo (usando o handle como identificador)
- Duas colunas: **Mobile** (os 3 primeiros) e **Desktop** (todos os 6)
- Filtrar usando `viewport_width` já buscado na query: `< 768` = mobile, `≥ 768` = desktop
- Incluir contagem de cliques e % do total para cada vídeo
- Posicionar entre a seção de "Prova Social / Vídeos" existente e o funil

### 4. `src/components/BelowFoldSections.tsx` (linha 688)
Adicionar `data-section="ProvaSocial"` na Section de vídeos para que os cliques nessa área também tenham `section_name` preenchido.

## Nota importante
Os dados históricos não terão a identificação por vídeo (todos aparecerão como "Toque para ouvir"). A partir da implementação, novos cliques serão rastreados com o nome correto. No dashboard, mostrar os dados disponíveis e indicar que o tracking detalhado é a partir da data de deploy.

