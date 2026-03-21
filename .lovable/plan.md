

## Cards Premium + Autoplay por Scroll nos Vídeos de Prova Social

### O que muda

1. **Cards premium**: Adicionar padding/margin nos vídeos mobile (remover `rounded-none -mx-6`) e usar `rounded-2xl` com borda dourada e sombra em todos os breakpoints
2. **Autoplay por scroll**: Usar IntersectionObserver para dar play quando o vídeo entra na viewport e pause quando sai

### Mudanças em `src/pages/Index.tsx`

**Grid container (linha 957)**:
- Remover `-mx-6 sm:mx-0` para vídeos não encostarem na borda
- Manter `gap-4 sm:gap-6`

**Card (linha 961)**:
- Trocar `rounded-none sm:rounded-2xl` por `rounded-2xl` em todos os breakpoints
- Adicionar `shadow-lg shadow-black/20` para efeito premium

**Video (linhas 963-981)**:
- Trocar `aspect-[9/16] sm:max-h-[320px]` por `aspect-[9/16]` com `rounded-t-2xl overflow-hidden`
- Adicionar `ref` via callback ref com IntersectionObserver
- Configurar `muted autoPlay` controlado pelo observer (threshold ~0.5)
- Remover `controls` e adicionar `muted loop playsInline` para autoplay funcionar no mobile

**Lógica IntersectionObserver** (novo useEffect ou inline):
- Criar um observer com `threshold: 0.5`
- Quando o vídeo entra em 50% da viewport: `video.play()`
- Quando sai: `video.pause()`
- Usar `useRef` com array de refs para os vídeos
- Cleanup no unmount

### Resultado visual
- Vídeos dentro de cards com bordas arredondadas e sombra
- Espaçamento nas laterais no mobile (não encosta na borda)
- Autoplay silencioso ao scrollar, pausa ao sair da tela

