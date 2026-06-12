import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

// Campo de partículas em onda sinusoidal 3D fluindo de baixo-esquerda para
// cima-direita. Cor varia por altura (#1e3358 embaixo -> #d4a853 no topo),
// partículas grandes ganham halo dourado. Pulsam com o tempo. Atrator segue o
// mouse com repulsao suave. ScrollTrigger no #hero controla rotacao, deslocamento,
// velocidade do fluxo e blur de saida.

const COUNT = 2600;
const BIG_RATIO = 0.2;

const COLOR_LOW = new THREE.Color("#1e3358");
const COLOR_HIGH = new THREE.Color("#d4a853");
const COLOR_HALO = new THREE.Color("#f5d98a");

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform vec2 uMouse;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aBig;
  attribute float aPhase;
  varying float vBig;
  varying float vHeight;

  void main() {
    vBig = aBig;
    vec3 p = position;

    // fluxo diagonal: baixo-esquerda -> cima-direita
    float flow = uTime * uSpeed;
    p.x += flow * 0.35;
    p.y += flow * 0.5;

    // re-circula dentro do volume para o campo nunca esvaziar
    p.x = mod(p.x + 6.0, 12.0) - 6.0;
    p.y = mod(p.y + 5.0, 10.0) - 5.0;

    // onda sinusoidal 3D
    float w = sin(p.x * 0.6 + flow) * cos(p.y * 0.5 - flow * 0.7);
    p.z += w * 1.1;
    p.y += sin(p.x * 0.4 + aPhase + flow) * 0.25;

    // repulsao do atrator (mouse) em espaco aproximado de tela
    vec2 toMouse = p.xy - uMouse * 5.0;
    float d = length(toMouse);
    float push = smoothstep(1.5, 0.0, d) * 0.9;
    p.xy += normalize(toMouse + 0.0001) * push;

    vHeight = clamp((p.y + 5.0) / 10.0, 0.0, 1.0);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float pulse = 0.7 + 0.3 * sin(uTime * 2.0 + aPhase);
    gl_PointSize = aSize * pulse * uPixelRatio * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorLow;
  uniform vec3 uColorHigh;
  uniform vec3 uColorHalo;
  varying float vBig;
  varying float vHeight;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float dist = length(c);
    if (dist > 0.5) discard;

    vec3 base = mix(uColorLow, uColorHigh, smoothstep(0.0, 1.0, vHeight));
    float core = smoothstep(0.5, 0.0, dist);

    // particulas grandes ganham halo dourado claro
    vec3 col = mix(base, uColorHalo, vBig * 0.6);
    float halo = vBig > 0.5 ? smoothstep(0.5, 0.1, dist) * 0.5 : 0.0;
    float alpha = core + halo;

    gl_FragColor = vec4(col, alpha);
  }
`;

function Particles({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const mouseLerp = useRef(new THREE.Vector2(0, 0));

  const { positions, sizes, bigs, phases } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const bigs = new Float32Array(COUNT);
    const phases = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
      const big = Math.random() < BIG_RATIO ? 1 : 0;
      bigs[i] = big;
      sizes[i] = big ? 5 + Math.random() * 4 : 1.5 + Math.random() * 1.5;
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, sizes, bigs, phases };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: 0.3 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uColorLow: { value: COLOR_LOW.clone() },
      uColorHigh: { value: COLOR_HIGH.clone() },
      uColorHalo: { value: COLOR_HALO.clone() },
    }),
    [],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseTarget.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      );
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const mat = matRef.current;
    const pts = pointsRef.current;
    if (!mat || !pts) return;

    mat.uniforms.uTime.value += dt;
    // lerp 0.05 do atrator
    mouseLerp.current.lerp(mouseTarget.current, 0.05);
    mat.uniforms.uMouse.value.copy(mouseLerp.current);

    const s = scrollRef.current; // 0 -> 1 ao longo do hero
    mat.uniforms.uSpeed.value = 0.3 + s * 0.9; // 0.3 -> 1.2
    pts.rotation.z = THREE.MathUtils.degToRad(15 * s); // 0 -> 15deg
    pts.position.y = s * 2.2; // sobe ao sair
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aBig" args={[bigs, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        // recalcula pixelRatio quando o canvas redimensiona
        onUpdate={(m) => {
          (m as THREE.ShaderMaterial).uniforms.uPixelRatio.value = Math.min(
            window.devicePixelRatio,
            2,
          );
        }}
        key={size.width}
      />
    </points>
  );
}

function HeroFallback() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{ background: "var(--gradient-hero-bg)" }}
    />
  );
}

export function HeroCanvas() {
  const [enabled, setEnabled] = useState(false);
  const scrollRef = useRef(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;
    if (reduce || isMobile) {
      setEnabled(false);
      return;
    }
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const hero = document.getElementById("hero");
    const st = ScrollTrigger.create({
      trigger: hero || wrapRef.current,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        scrollRef.current = self.progress;
        // blur 0 -> 4px ao sair do hero
        if (wrapRef.current) {
          wrapRef.current.style.filter = `blur(${self.progress * 4}px)`;
        }
      },
    });
    return () => st.kill();
  }, [enabled]);

  if (!enabled) return <HeroFallback />;

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero-bg)" }}
      />
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Particles scrollRef={scrollRef} />
      </Canvas>
    </div>
  );
}
