

## Redesign Mobile da Seção "O que você vai aprender" — Numeração Centralizada, Zoom-In, Typewriter Scroll + Logo Zoom

### Mudanças

**1. Números 01, 02, 03 centralizados no mobile**
- Mover de `absolute -top-3 -left-1` para centralizado acima do card: `text-center` com `text-7xl` dourado semi-transparente

**2. Zoom-In dos números ao entrar na viewport**
- Cada número começa com `scale(3) opacity(0)` e anima para `scale(1) opacity(1)` ao entrar na viewport via IntersectionObserver individual por card
- Transição suave de ~600ms com easing

**3. Bullet points com efeito typewriter baseado em scroll**
- Cada bullet point usa `onScroll` listener para revelar caractere por caractere conforme o scroll avança
- Texto começa com `filter: blur(4px)` e vai ficando nítido à medida que "digita"
- Velocidade de digitação proporcional à velocidade do scroll
- Implementar via cálculo de scroll progress relativo à posição de cada bullet

**4. Logo Zoom**
- Copiar `user-uploads://zoom.png` → `src/assets/zoom-logo.png`
- Colocar no título da seção, ao lado de "WORKSHOP AO VIVO" — badge pequeno com o logo Zoom e texto "via Zoom" para reforçar que é ao vivo

### Implementação técnica

- **ScrollTypewriter component**: Componente que recebe texto e calcula quantos caracteres mostrar baseado na posição de scroll relativa ao elemento. Usa `getBoundingClientRect()` no `scroll` event para mapear progress 0→1 para 0→text.length
- **Blur effect**: Últimos 3-5 caracteres visíveis ganham `filter: blur` gradual (mais blur nos mais recentes)
- **Zoom numbers**: CSS transition com `transform: scale()` controlada pelo state de visibilidade do IntersectionObserver

### Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | Refatorar `WorkshopLearningSection` mobile: centralizar números, zoom-in animation, scroll-typewriter nos bullets, adicionar logo Zoom |
| `src/assets/zoom-logo.png` | Logo do Zoom copiado |

