

## Play Pulsante + Autoplay Mutado com Pause ao Sair

### O que muda

1. **Ícone de play pulsando**: Trocar `animate-pulse` por uma animação customizada mais visível — scale pulsante (1 → 1.15 → 1) com glow dourado, para induzir o clique

2. **Autoplay mutado ao entrar na viewport**: O IntersectionObserver agora dá play mutado quando o vídeo entra na viewport (mesmo sem clique), criando movimento no fundo. Ao sair, pausa.

3. **Clique no play**: Continua desmutando e escondendo o overlay como já funciona. Após clicar, o observer retoma com som ao voltar à viewport.

### Mudanças em `src/components/VideoTestimonials.tsx`

**IntersectionObserver (linhas 28-34)**: Mudar a lógica:
- Se `isIntersecting`: sempre dar `video.play()`. Se já foi ativado (`activatedVideos.has(index)`), manter `muted = false`. Se não, manter `muted = true`.
- Se não `isIntersecting`: sempre `video.pause()`

**Botão play (linha 71)**: Adicionar animação CSS customizada de pulse+scale mais agressiva via `animate-[pulse-glow_2s_ease-in-out_infinite]` e adicionar keyframes inline ou no tailwind config.

**Keyframes** no `tailwind.config.ts`:
```
"pulse-glow": {
  "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(212,168,83,0.4)" },
  "50%": { transform: "scale(1.12)", boxShadow: "0 0 25px 8px rgba(212,168,83,0.25)" }
}
```

### Resultado
- Vídeos mostram movimento (autoplay mutado) ao scrollar → induz clique
- Play pulsa com glow dourado → mais chamativo
- Pause ao sair da viewport, play ao voltar
- Clique ativa som

