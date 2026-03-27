

# Melhorar seção de preço/oferta

Inspirado nas referências enviadas, vou redesenhar o lado direito do card de oferta (linhas 753-778) para ter mais impacto visual e conversão.

## Alterações em `src/components/BelowFoldSections.tsx`

### Redesign do bloco de preço (linhas 753-778)

- **Preço com mais destaque**: Aumentar o "37" para `text-7xl sm:text-8xl`, adicionar efeito de sombra/glow dourado (`drop-shadow`)
- **Preço antigo mais visível**: Aumentar "De R$ 97,00" com texto maior e line-through mais evidente (vermelho)
- **Badge "VAGAS LIMITADAS"**: Fundo dourado sólido (`bg-[#d4a853]`) com texto escuro em vez de vermelho translúcido, mais chamativo como na referência
- **Separação visual**: Adicionar uma linha divisória ou espaçamento maior entre "POR" e o preço
- **"Pagamento único · Acesso imediato"**: Texto verde claro para reforçar segurança
- **Bandeiras de pagamento**: Aumentar levemente e melhorar opacidade (de 0.4 para 0.6)
- **Animação de entrada**: Adicionar scale-in sutil no preço quando visível

