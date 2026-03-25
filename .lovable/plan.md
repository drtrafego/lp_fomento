

# Corrigir Screenshot Mobile no Mapa de Calor

## Problema

O heatmap usa um único screenshot (`/page-screenshot.png`) para ambas as visualizações Desktop e Mobile. Por isso, ao selecionar "Mobile", o fundo mostra a versão desktop da página (com 6 vídeos), quando deveria mostrar a versão mobile (com 3 vídeos).

## Solução

Usar dois screenshots separados — um para desktop e outro para mobile — e alternar conforme o device selecionado.

### Alterações em `src/components/dashboard/HeatmapTab.tsx`

1. Adicionar uma segunda constante de URL:
   - `DESKTOP_SCREENSHOT_URL = "/page-screenshot.png"`
   - `MOBILE_SCREENSHOT_URL = "/page-screenshot-mobile.png"`

2. Carregar ambas as imagens no `useEffect` de carregamento e manter dois states (`desktopImage` e `mobileImage`).

3. No `useEffect` de renderização do canvas, selecionar a imagem correta baseado no `device` ativo.

### Screenshot Mobile

É necessário gerar/capturar um screenshot da landing page em viewport mobile (ex: 390px de largura) e salvá-lo como `public/page-screenshot-mobile.png`. Isso pode ser feito manualmente tirando um print da página no modo mobile do navegador, ou via script automatizado.

**Importante**: Sem o arquivo `page-screenshot-mobile.png`, o heatmap mobile ficará sem fundo (apenas os pontos de calor sobre fundo escuro), o que ainda é funcional mas menos útil visualmente.

