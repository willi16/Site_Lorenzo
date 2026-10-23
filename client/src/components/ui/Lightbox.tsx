import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Maximize2, Minimize2, Share2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface LightboxItem {
  src: string;
  alt: string;
  caption?: string;
}

export function Lightbox({
  items,
  index,
  onClose,
  onIndexChange,
  title,
}: {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  title?: string;
}) {
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null;
  const current = open ? items[index] : undefined;

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      const next = (index + delta + items.length) % items.length;
      setZoom(1);
      onIndexChange(next);
    },
    [index, items.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'ArrowRight':
          event.preventDefault();
          go(1);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          go(-1);
          break;
        case '+':
        case '=':
          event.preventDefault();
          setZoom((z) => Math.min(3, z + 0.25));
          break;
        case '-':
          event.preventDefault();
          setZoom((z) => Math.max(1, z - 0.25));
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, go, onClose]);

  const share = async () => {
    if (!current) return;
    const url = `${window.location.origin}${window.location.pathname}#photo-${index}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: current.alt, url });
        return;
      } catch {
        /* l'utilisateur a annulé */
      }
    }
    await navigator.clipboard?.writeText(url);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && current ? (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col bg-navy-950/96 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={title ?? 'Galerie'}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <p className="text-sm font-medium text-white/80">
              {title ? `${title} — ` : ''}
              <span className="text-white/50">
                {(index ?? 0) + 1} / {items.length}
              </span>
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Dézoomer"
              >
                <ZoomOut className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Zoomer"
              >
                <ZoomIn className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setFullscreen((f) => !f)}
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label={fullscreen ? 'Quitter le plein écran' : 'Plein écran'}
              >
                {fullscreen ? <Minimize2 className="h-5 w-5" aria-hidden /> : <Maximize2 className="h-5 w-5" aria-hidden />}
              </button>
              <a
                href={current.src}
                download
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Télécharger l’image"
              >
                <Download className="h-5 w-5" aria-hidden />
              </a>
              <button
                type="button"
                onClick={share}
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Partager"
              >
                <Share2 className="h-5 w-5" aria-hidden />
              </button>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Fermer la galerie"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4 sm:px-16">
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:left-4"
              aria-label="Image précédente"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden />
            </button>

            <AnimatePresence mode="wait">
              <motion.img
                key={current.src}
                src={current.src}
                alt={current.alt}
                className="max-h-full max-w-full cursor-zoom-in rounded-lg object-contain shadow-lift transition-transform duration-300"
                style={{ transform: `scale(${zoom})` }}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onClick={() => setZoom((z) => (z > 1 ? 1 : 2))}
                decoding="async"
              />
            </AnimatePresence>

            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:right-4"
              aria-label="Image suivante"
            >
              <ChevronRight className="h-6 w-6" aria-hidden />
            </button>
          </div>

          {current.caption ? (
            <p className="px-6 pb-6 text-center text-sm text-white/60">{current.caption}</p>
          ) : null}

          <div className="flex justify-center gap-2 overflow-x-auto px-6 pb-6">
            {items.map((item, i) => (
              <button
                key={item.src + i}
                type="button"
                onClick={() => onIndexChange(i)}
                className={cn(
                  'h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition',
                  i === index ? 'border-clay-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-90',
                )}
                aria-label={item.alt}
                aria-current={i === index}
              >
                <img src={item.src} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
