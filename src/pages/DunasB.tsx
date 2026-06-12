import { useDunasPage } from "@/components/dunas/useDunasPage";
import { DunasShell } from "@/components/dunas/DunasShell";
import { HeroPrivateBanking } from "@/components/dunas/HeroPrivateBanking";
import { dunasThemeB } from "@/components/dunas/themes";

// ─── Versão B · Private Banking ───
// Sala fechada de gestão de fortunas: preto profundo, ouro champagne discreto,
// muito respiro. Hero com feixe de luz champagne e serif gigante. Copy idêntica
// às demais versões (consumida de content via shell e hero).
export default function DunasB() {
  const { root, handleCta } = useDunasPage();
  return (
    <DunasShell
      theme={dunasThemeB}
      hero={<HeroPrivateBanking onCta={handleCta} />}
      rootRef={root}
      onCta={handleCta}
    />
  );
}
