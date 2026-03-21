

## Vídeos em Formato Stories (9:16) no Mobile

### Problema
Os vídeos estão em `aspect-video` (16:9) no mobile, ficando achatados e com espaços vazios. O formato correto para mobile é stories (9:16 vertical).

### Mudança em `src/pages/Index.tsx`

**Linha 959**: Trocar `aspect-video` por `aspect-[9/16]` no mobile e remover o `sm:max-h-[320px]` do desktop:

```
aspect-video sm:aspect-[9/16] sm:max-h-[320px]
```
→
```
aspect-[9/16] sm:max-h-[320px]
```

Isso faz os vídeos no mobile ficarem em formato vertical/stories, preenchendo o espaço como o usuário deseja. No desktop mantém o mesmo aspecto 9:16.

