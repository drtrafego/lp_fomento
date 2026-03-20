

## Adicionar 5 Cases Reais ao Marquee

### Cases a implementar

| # | Handle | Valor | Imagem |
|---|--------|-------|--------|
| 1 | @bulldogburguer | R$ 420.000 | WhatsApp_Image_2026-03-20_at_19.03.09.jpeg |
| 2 | @roysbrasil | R$ 79.000 | WhatsApp_Image_2026-03-20_at_19.04.29.jpeg |
| 3 | @biofluid_ | R$ 194.410 | WhatsApp_Image_2026-03-20_at_19.05.38.jpeg |
| 4 | @querysistemas | R$ 70.000 | WhatsApp_Image_2026-03-20_at_19.07.32.jpeg |
| 5 | @instabovreal | R$ 739.000 | WhatsApp_Image_2026-03-20_at_19.08.12.jpeg |

### Implementação

**1. Copiar 5 imagens** para `src/assets/cases/`

**2. Editar `src/pages/Index.tsx`**:
- Importar as 5 imagens
- Adicionar campo opcional `image` à estrutura do array `marqueeCases`
- Substituir os 5 primeiros itens placeholder pelos dados reais com fotos
- Atualizar o render do marquee: se `c.image` existir, exibir `<img>` circular com `object-cover`; senão, manter placeholder colorido

Os 25 itens restantes continuam como placeholder até mais dados reais.

