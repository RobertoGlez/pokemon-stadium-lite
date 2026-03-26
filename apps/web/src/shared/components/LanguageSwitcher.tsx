import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '../../i18n';
import { Globe, Check, ChevronDown } from 'lucide-react';

const languages: { code: SupportedLanguage; label: string }[] = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
];

export function LanguageSwitcher({ variant = 'floating' }: { variant?: 'floating' | 'inline' }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentLang = (i18n.language?.slice(0, 2) || 'es') as SupportedLanguage;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const isFloating = variant === 'floating';

  const wrapperClass = isFloating
    ? 'fixed top-4 right-4 z-[100] flex flex-col items-end gap-0'
    : 'relative inline-flex flex-col items-end';

  return (
    <div ref={ref} className={wrapperClass}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`
          flex items-center gap-2 rounded-full border backdrop-blur-md transition-all duration-200
          ${open
            ? 'border-primary/50 bg-card/95 shadow-[0_0_20px_rgba(37,99,235,0.15)]'
            : 'border-border/60 bg-card/70 hover:border-primary/30 hover:bg-card/90 shadow-lg'
          }
          ${isFloating ? 'px-3 py-2' : 'px-2.5 py-1.5'}
        `}
        aria-label="Cambiar idioma / Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className={`${isFloating ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-primary shrink-0`} />
        <span className={`${isFloating ? 'text-xs' : 'text-[11px]'} font-bold text-foreground tabular-nums`}>
          {currentLang.toUpperCase()}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2.5}
        />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-[min(100vw-2rem,11.5rem)] rounded-xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          role="listbox"
        >
          <div className="p-1.5">
            {languages.map((lang) => {
              const isActive = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150
                    ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                    }
                  `}
                >
                  <span className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {lang.label}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                    {lang.code}
                  </span>
                  {isActive ? <Check className="w-4 h-4 text-primary shrink-0" /> : <span className="w-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
