

## Hero Desktop: Texto Esquerda + Foto Direita

### Mudança

Reestruturar o hero (linhas 677-793) para layout split no desktop:
- **Mobile**: mantém layout atual (centralizado, foto em cima)
- **Desktop (lg+)**: grid de 2 colunas — texto/CTA na esquerda, foto do Pedro na direita

### Implementação em `src/pages/Index.tsx`

1. **Container** (linha 678): Trocar `max-w-3xl mx-auto text-center` por `max-w-6xl mx-auto` com grid no desktop:
   ```
   lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center
   ```

2. **Coluna esquerda** (texto): Envolver "AO VIVO", countdown, headline, bullets, CTA e referência do evento em uma `<div>` com `text-center lg:text-left`

3. **Coluna direita** (foto): Mover o bloco da foto do Pedro (linhas 716-734) para uma segunda `<div>` que aparece à direita no desktop. No mobile, a foto continua acima do texto (usar `order-first lg:order-last`)

4. **Ajustes de alinhamento**: `max-w-md mx-auto lg:mx-0` nos bullets e elementos centralizados para que alinhem à esquerda no desktop

### Resultado
- Desktop: layout profissional com texto à esquerda e foto à direita (como a referência)
- Mobile: mantém o layout centralizado atual sem quebrar nada

