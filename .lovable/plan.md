

## Ajustar Imagem do Mentor na Seção "Não é Empréstimo"

### O que muda

A imagem do Pedro Diniz na seção 3 será ajustada para:
1. Mostrar apenas o busto (crop via `object-cover` + `object-top` dentro de um container circular)
2. Encaixar dentro da bola dourada (clipar em círculo com `rounded-full overflow-hidden`)
3. Aumentar o tamanho da imagem para preencher o círculo
4. Adicionar nome e credencial abaixo do círculo

### Mudanças em `src/pages/Index.tsx` (linhas 799-814)

**Antes**: Imagem retangular com corpo inteiro, gradiente na base
**Depois**: Container circular (`w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full overflow-hidden`) com a imagem usando `object-cover object-top` para focar no busto. Remover o gradiente inferior (não faz sentido em círculo).

Abaixo do círculo, adicionar:
```text
PEDRO DINIZ
+ de 50 milhões captados
```
- Nome em branco, bold, uppercase, tracking wide
- Credencial em dourado (#d4a853), text-sm

Os anéis dourados giratórios continuam atrás do círculo como estão.

