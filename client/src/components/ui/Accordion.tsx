import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface AccordionItem {
  id: string;
  question: string;
  answer: ReactNode;
}

export function Accordion({
  items,
  className,
  defaultOpen,
}: {
  items: AccordionItem[];
  className?: string;
  defaultOpen?: string;
}) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? items[0]?.id ?? null);

  return (
    <div className={cn('divide-y divide-ink-800/[0.08] overflow-hidden rounded-2xl border border-ink-800/[0.08] bg-white', className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                aria-controls={`accordion-panel-${item.id}`}
                id={`accordion-trigger-${item.id}`}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-navy-700/[0.03] sm:px-7"
              >
                <span className="font-display text-base font-bold text-navy-800 sm:text-lg">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-clay-500 transition-transform duration-300',
                    isOpen && 'rotate-180',
                  )}
                  aria-hidden
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={`accordion-panel-${item.id}`}
                  role="region"
                  aria-labelledby={`accordion-trigger-${item.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-6 text-[0.95rem] leading-relaxed text-ink-600 sm:px-7">
                    {item.answer}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
