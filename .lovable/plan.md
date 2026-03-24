

## Plano: Mapa de Calor com Screenshot da Página como Fundo

### Problema
O mapa de calor atual mostra os cliques sobre um fundo escuro vazio — impossível saber em qual elemento da página o clique aconteceu.

### Solução
Capturar um screenshot da landing page e usá-lo como fundo do canvas do mapa de calor, sobrepondo os pontos de clique.

### Implementação

**1. Gerar screenshot da página**
- Usar a biblioteca `html2canvas` ou simplesmente capturar um screenshot manualmente e salvar como imagem estática em `public/page-screenshot.png`.
- A abordagem mais prática e confiável: tirar um screenshot real da landing page (via browser tool) e salvá-lo no projeto como imagem de referência.

**2. Atualizar `HeatmapTab.tsx`**
- Carregar a imagem de fundo no canvas antes de desenhar os pontos de calor.
- Ajustar as dimensões do canvas para a proporção real da página.
- Normalizar as coordenadas dos cliques usando `viewport_y + scrollY` relativo à altura total da página (usando `page_height` já salvo na tabela).
- Desenhar a imagem primeiro, depois os pontos com gradiente radial por cima.

**3. Melhorias visuais**
- Usar blending mode (`globalCompositeOperation`) para que os pontos de calor fiquem mais visíveis sobre a imagem.
- Adicionar controle de opacidade da imagem de fundo para facilitar visualização.

### Detalhes técnicos

- O `usePageAnalytics` já salva `viewport_y`, `viewport_width`, `viewport_height` e `page_height` — dados suficientes para posicionar cliques sobre o screenshot.
- A normalização será: `x_canvas = (viewport_x / viewport_width) * canvas_width` e `y_canvas = (viewport_y / page_height) * canvas_height` (considerando scroll position).
- Porém o hook atual salva `clientY` (posição na viewport), não a posição absoluta na página. Será necessário ajustar o hook para salvar `e.clientY + window.scrollY` como posição absoluta.

### Arquivos alterados
- `src/hooks/usePageAnalytics.ts` — salvar posição absoluta Y (clientY + scrollY)
- `src/components/dashboard/HeatmapTab.tsx` — renderizar screenshot como fundo + overlay de cliques
- `public/page-screenshot.png` — screenshot capturado da landing page

