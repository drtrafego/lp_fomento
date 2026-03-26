

# Remover InitiateCheckout da página

## O que muda

O evento `InitiateCheckout` será removido do disparo client-side (Pixel + CAPI), já que o tracking agora é feito pela Zouti no checkout. Os dados históricos no dashboard continuam visíveis.

## Alterações

### 1. `src/pages/Index.tsx`
- Remover import de `trackInitiateCheckout` do hook `useMetaPixel`
- Simplificar `handleCheckoutClick` para apenas abrir a URL, sem tracking

### 2. `src/hooks/useMetaPixel.ts`
- Remover a função `trackInitiateCheckout` e seu export

### 3. Dashboard (manter)
- Os componentes `OverviewTab` e `TrafficTab` continuam exibindo dados históricos de `InitiateCheckout` vindos do banco — sem alteração

### 4. Edge function (manter)
- `meta-pixel-event` continua aceitando `InitiateCheckout` na lista de eventos válidos para não quebrar dados antigos — sem alteração

