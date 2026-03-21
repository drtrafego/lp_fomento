

## Acelerar Carregamento da Imagem do Mentor

### Problema
A imagem `autoridade-homem.png` na seção do Pedro Diniz demora para carregar porque é um PNG grande e não tem `loading="lazy"` nem otimização.

### Mudanças em `src/pages/Index.tsx`

1. **Adicionar `loading="eager"` e `fetchPriority="low"`** na imagem do mentor (linha 811-815) — como está abaixo do fold, o browser pode priorizar outras coisas primeiro. Alternativamente, adicionar `loading="lazy"` para não bloquear o carregamento inicial.

2. **Adicionar `decoding="async"`** para não bloquear o rendering thread.

3. **Aplicar o mesmo tratamento** a todas as imagens abaixo do fold (mapa, selo garantia, reunião, etc.) — `loading="lazy" decoding="async"`.

4. **Placeholder visual**: Adicionar um `bg-[#1a2a4a]` no container circular para que o espaço não fique vazio enquanto a imagem carrega — o usuário verá o círculo com fundo escuro em vez de vazio.

### Resultado
- Imagem do mentor carrega sem bloquear o resto da página
- Container mostra fundo escuro enquanto a imagem baixa
- Demais imagens below-the-fold também ficam lazy

