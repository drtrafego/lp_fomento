

## Remover Geolocalização e Pin do Mapa

O usuário quer remover o pin de geolocalização do mapa e a copy personalizada por estado, pois pode dar errado (problemas de permissão, API falhando, etc.).

### Mudanças em `src/pages/Index.tsx`

1. **Remover** o import de `pinLocation`
2. **Remover** o hook `useUserLocation` (linhas 292-344) e todo o código auxiliar (`stateData`, `latLngToState`)
3. **Remover** a chamada `const location = useUserLocation()` no componente
4. **Remover** o bloco do pin animado sobre o mapa (linhas 577-593)
5. **Remover** os blocos de mensagem personalizada por estado (linhas 596-616)
6. Manter o mapa como estava antes (apenas imagem estática)

### Mudanças em `src/index.css`

7. **Remover** os keyframes `bounce-pin` e `pulse-glow-pin`

### Arquivos que podem ser deletados

- `src/assets/pin-location.png` (não mais usado)

