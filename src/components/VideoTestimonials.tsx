import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Volume2 } from "lucide-react";

interface Testimonial {
  handle: string;
  value: string;
  video?: string;
}

export const VideoTestimonials = ({ testimonials }: { testimonials: Testimonial[] }) => {
  const [activatedVideos, setActivatedVideos] = useState<Set<number>>(new Set());
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const observersRef = useRef<IntersectionObserver[]>([]);

  const handlePlay = useCallback((index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    video.muted = false;
    video.play().catch(() => {});
    setActivatedVideos(prev => new Set(prev).add(index));
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (activatedVideos.has(index)) {
              video.muted = false;
            } else {
              video.muted = true;
            }
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(video);
      observers.push(observer);
    });

    observersRef.current = observers;
    return () => observers.forEach(o => o.disconnect());
  }, [activatedVideos]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {testimonials.map((t, i) => (
        <div
          key={i}
          className={`bg-[#0f1d32] border border-[#d4a853]/20 rounded-2xl overflow-hidden hover:border-[#d4a853]/40 transition-colors group shadow-lg shadow-black/20 ${i >= 3 ? "hidden sm:block" : ""}`}
        >
          <div className="relative aspect-[9/16] bg-[#0a1628] flex items-center justify-center rounded-t-2xl overflow-hidden">
            {t.video ? (
              <>
                <video
                  ref={(el) => { videoRefs.current[i] = el; }}
                  src={t.video}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
                {/* VSL Play Overlay */}
                {!activatedVideos.has(i) && (
                  <div
                    onClick={() => handlePlay(i)}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 cursor-pointer group/play"
                  >
                    <div className="relative">
                      {/* Ping rings */}
                      <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-[#d4a853]/50 animate-ping-ring" />
                      <div className="absolute inset-0 w-20 h-20 rounded-full border border-[#d4a853]/30 animate-ping-ring [animation-delay:0.6s]" />
                      {/* Main button */}
                      <div className="relative w-20 h-20 bg-white/15 backdrop-blur-sm border-2 border-[#d4a853]/60 rounded-full flex items-center justify-center animate-pulse-glow group-hover/play:scale-110 transition-transform shadow-[0_0_20px_rgba(212,168,83,0.3)]">
                        <Play className="w-9 h-9 text-[#d4a853] fill-[#d4a853] ml-1 drop-shadow-[0_0_8px_rgba(212,168,83,0.6)]" />
                      </div>
                    </div>
                    <span className="mt-4 text-white/90 font-bold text-sm tracking-widest uppercase flex items-center gap-2 drop-shadow-lg">
                      <Volume2 size={14} className="text-[#d4a853]" /> Toque para ouvir
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[#d4a853]/20 flex items-center justify-center">
                  <Play className="text-[#d4a853] ml-1" size={28} fill="currentColor" />
                </div>
                <span className="absolute bottom-3 right-3 bg-black/60 text-white/80 text-xs px-2 py-1 rounded">
                  Vídeo em breve
                </span>
              </>
            )}
          </div>
          <div className="p-5 space-y-1 text-left">
            <p className="text-white/50 text-sm">{t.handle}</p>
            <p className="text-[#d4a853] text-xl font-bold">{t.value}</p>
            <p className="text-white/40 text-xs">captados com Programas de Incentivo</p>
          </div>
        </div>
      ))}
    </div>
  );
};
