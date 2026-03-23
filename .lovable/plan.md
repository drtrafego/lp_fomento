

## Resultado do Teste de Performance

### Desktop (1440x900)

| Metrica | Valor | Status |
|---------|-------|--------|
| First Contentful Paint (FCP) | 6.0s | Ruim |
| Full Page Load | 8.3s | Ruim |
| CLS (Layout Shift) | 0.05 | Bom |
| JS Heap | 13.3MB | Bom |
| DOM Nodes | 3646 | OK |

### Mobile (375x812)

| Metrica | Valor | Status |
|---------|-------|--------|
| First Contentful Paint (FCP) | 3.5s | Precisa melhorar |
| Full Page Load | 5.7s | Precisa melhorar |
| CLS (Layout Shift) | 0.02 | Bom |
| JS Heap | 25.3MB | OK |
| DOM Nodes | 7343 | Alto |

### Problema Principal: Imagens Gigantes

As imagens estão em formato PNG sem compressão e são responsáveis por ~90% do tempo de carregamento:

| Imagem | Tamanho | Tempo |
|--------|---------|-------|
| pedro-hero.png | **2.9 MB** | 1.7s |
| pedro-palco-desktop.png | **2.3 MB** | 1.3s |
| mapa-orgaos.png | **1.1 MB** | 2.2s |
| lista-top-icon.png | **616 KB** | 2.0s |
| selo-garantia.png | **387 KB** | 1.4s |
| pedro-igor.png | **367 KB** | 2.3s |

**Total de imagens: ~7.7 MB** — isso é extremamente pesado.

### Plano de Otimizacao

1. **Converter todas as imagens PNG para WebP** com qualidade 80-85%, reduzindo o tamanho total em ~70-80% (de ~7.7MB para ~1.5-2MB)

2. **Adicionar `loading="lazy"`** em todas as imagens abaixo do fold (tudo exceto pedro-hero)

3. **Adicionar `fetchpriority="high"`** na imagem hero para priorizar seu carregamento

4. **Redimensionar imagens** para o tamanho real de exibicao (pedro-hero.png provavelmente nao precisa ser maior que 800px de largura)

5. **Adicionar `decoding="async"`** em imagens nao-criticas

### Secao tecnica

- As imagens serao convertidas via script usando ferramentas de linha de comando
- Os imports em `src/pages/Index.tsx` serao atualizados para apontar para os novos arquivos `.webp`
- Nenhuma mudanca visual — apenas reducao de tamanho de arquivo

