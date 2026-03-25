

# Heatmap: Full-width scrollável + Zoom interativo

## Problema
O canvas está comprimido com `max-h-[70vh]`, espremendo a página inteira numa área pequena. O usuário quer ver o screenshot em tamanho real (largura da tela), poder scrollar verticalmente para explorar toda a página, e fazer zoom com scroll do mouse.

## Solução

### Alterações em `src/components/dashboard/HeatmapTab.tsx`

1. **Canvas full-width**: Remover largura fixa (`390`/`500`). Usar a largura real do container via `ResizeObserver` e calcular a altura proporcional à imagem. Remover `max-h-[70vh]`.

2. **Container scrollável**: Envolver o canvas num div com `max-h-[70vh] overflow-y-auto` — o canvas terá altura total da página e o container é quem faz scroll.

3. **Zoom interativo com scroll do mouse**:
   - Adicionar state `zoom` (default `1`, min `0.5`, max `3`) e `panOffset` para posição.
   - No `onWheel` do container: se `Ctrl` ou `Meta` pressionado, ajustar zoom; caso contrário, scroll normal.
   - Aplicar `transform: scale(zoom)` + `transform-origin: top center` no canvas.
   - Mostrar indicador de zoom atual e botão de reset.

4. **Controles de zoom**: Adicionar botões `+`, `-` e `Reset` ao lado dos controles existentes, e exibir porcentagem de zoom.

### Resultado
- Screenshot ocupa toda a largura disponível
- Scroll vertical revela o conteúdo da página inteira
- Ctrl+Scroll faz zoom in/out para inspecionar áreas específicas

