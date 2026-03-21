

## Botão Play VSL-style nos Vídeos de Prova Social

### Conceito
Adicionar um overlay com botão de play grande estilo VSL (Video Sales Letter) sobre cada vídeo. O vídeo começa pausado e mutado. Ao tocar no botão, o overlay desaparece, o vídeo dá play COM som. O IntersectionObserver continua funcionando para pausar ao sair da viewport.

### Mudanças em `src/pages/Index.tsx`

**Novo estado**: `const [playingVideos, setPlayingVideos] = useState<Set<number>>(new Set())` para rastrear quais vídeos o usuário já clicou.

**Overlay play button** (sobre cada vídeo):
- Overlay escuro (`bg-black/40`) com botão play centralizado (triângulo grande branco/dourado dentro de círculo semi-transparente)
- Texto "Toque para assistir" ou ícone pulsante
- Visível apenas quando o vídeo NÃO está no set `playingVideos`
- Ao clicar: adiciona ao set, faz `video.muted = false` e `video.play()`

**IntersectionObserver ajustado**:
- Se o vídeo já foi "clicado" (está no set): ao sair da viewport → pause; ao voltar → play com som
- Se NÃO foi clicado: fica pausado esperando o clique

**Poster/thumbnail**: Adicionar `poster` com o primeiro frame (usar `preload="metadata"`) para mostrar thumbnail antes do play.

### Visual do botão
- Círculo `w-16 h-16 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full`
- Triângulo play dourado dentro (`Play` icon do lucide, fill)
- Animação `animate-pulse` sutil no círculo

### Resultado
Vídeos mostram thumbnail → usuário toca → play com áudio → ao scrollar para longe pausa → ao voltar retoma

