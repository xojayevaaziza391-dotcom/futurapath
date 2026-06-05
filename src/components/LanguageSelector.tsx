import React from 'react';
import { Languages, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { t } from '../lib/translations';
import { SUPPORTED_LANGUAGES, getLanguageByCode, getFlagUrl } from '../lib/languages';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  variant?: 'nav' | 'account';
}

export default function LanguageSelector({ currentLanguage, onLanguageChange, variant = 'nav' }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLang = getLanguageByCode(currentLanguage);

  if (variant === 'account') {
    return (
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <Languages className="w-3 h-3" />
          {t('preferredLanguage', currentLanguage)}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border flex items-center justify-center gap-2 ${
                currentLanguage === lang.code
                  ? 'bg-[#ff4e00]/10 border-[#ff4e00] text-[#ff4e00]'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <img src={getFlagUrl(lang.flagCode)} alt={lang.name} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-xs font-medium text-gray-300"
      >
        <img src={getFlagUrl(selectedLang.flagCode)} alt={selectedLang.name} className="w-4 h-3 object-cover rounded-sm shadow-sm" />
        <span>{selectedLang.label}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                    currentLanguage === lang.code
                      ? 'bg-[#ff4e00]/10 text-[#ff4e00]'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={getFlagUrl(lang.flagCode)} alt={lang.name} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                    <span>{lang.name}</span>
                  </div>
                  {currentLanguage === lang.code && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
