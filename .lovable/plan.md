

## Otimização de Performance da Página

### Problemas Identificados

1. **Scroll listeners sem throttle** — ScrollTypewriter, PixNotifications e useSequentialBulletProgress adicionam listeners de scroll que disparam a cada pixel, causando muitos recálculos
2. **Componentes pesados carregados de uma vez** — VideoTestimonials (6 vídeos), WorkshopLearningSection e BonusSection são renderizados imediatamente mesmo fora da tela
3. **Imagem do hero não tem lazy loading** — `pedroHeroImg` e `pedroPalcoDesktop` carregam imediatamente
4. **Efeitos de blur pesados** — Múltiplos divs com `blur-[80px]` e `blur-[120px]` consomem GPU
5. **Chamada de API externa no load** — `ipapi.co/json/` bloqueia rendering
6. **Sem preconnect para CDN de vídeos** — os vídeos de `dunas.b-cdn.net` iniciam conexão tarde

### Implementação

#### 1. `index.html` — Adicionar preconnect e meta de performance
- `<link rel="preconnect" href="https://dunas.b-cdn.net">`
- `<link rel="dns-prefetch" href="https://ipapi.co">`

#### 2. `src/pages/Index.tsx` — Lazy loading de componentes pesados
- Usar `React.lazy()` + `Suspense` para `VideoTestimonials` e `ScrollTypewriter`
- Adicionar `loading="lazy"` nas imagens do hero que faltam (desktop)

#### 3. `src/pages/Index.tsx` — Throttle nos scroll listeners
- Criar um utilitário `throttle` simples (16ms ≈ 60fps)
- Aplicar em `PixNotificationsSection`, `useSequentialBulletProgress` e `ScrollTypewriter`

#### 4. `src/pages/Index.tsx` — Reduzir efeitos de blur
- Diminuir tamanho dos divs de glow decorativos (de 500-600px para 300-400px)
- Reduzir blur de 120px para 60px nos backgrounds decorativos
- Remover `animate-pulse` dos glows de background (repaints constantes)

#### 5. `src/pages/Index.tsx` — Otimizar countdown
- Usar `requestAnimationFrame` ao invés de `setInterval` de 1s para o countdown (evita re-renders desnecessários quando tab está inativa)

#### 6. `src/components/VideoTestimonials.tsx` — Otimizar vídeos
- Trocar `preload="metadata"` por `preload="none"` — carregar metadata só quando o usuário interage
- Adicionar `poster` attribute ou thumbnail placeholder

#### 7. `src/components/ScrollTypewriter.tsx` — Throttle scroll
- Adicionar throttle de 16ms no handler de scroll

### Resultado Esperado
- First Contentful Paint mais rápido (menos recursos carregados inicialmente)
- Scroll mais suave (menos trabalho por frame)
- Menor consumo de GPU (menos blurs e animações constantes)
- Vídeos não consomem banda até o usuário interagir

