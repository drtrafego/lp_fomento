import { useDunasPage } from "@/components/dunas/useDunasPage";
import { DunasShell } from "@/components/dunas/DunasShell";
import { HeroLei } from "@/components/dunas/HeroLei";
import { dunasThemeD } from "@/components/dunas/themes";

// ─── Versão D · Mecanismo Legal ───
// Respaldo do Estado e autoridade institucional: azul profundo + dourado. Hero
// em duas colunas com o Decreto-Lei e os órgãos federais convergindo para o nó
// Dunas Capital. Copy idêntica às demais versões (consumida de content).
export default function DunasD() {
  const { root, handleCta } = useDunasPage();
  return (
    <DunasShell
      theme={dunasThemeD}
      hero={<HeroLei onCta={handleCta} />}
      rootRef={root}
      onCta={handleCta}
    />
  );
}
