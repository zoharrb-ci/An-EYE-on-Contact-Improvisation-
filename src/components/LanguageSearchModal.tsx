import React, { useMemo, useState } from 'react';
import { Check, Globe, MapPin, Search, X } from 'lucide-react';
import { useContactWays } from '../context/ContactWaysContext';
import { filterLanguagesForSearchWindow } from '../i18n/languages';

export const LanguageSearchModal: React.FC = () => {
  const {
    isLanguageSearchOpen,
    setLanguageSearchOpen,
    language,
    setLanguage,
    locality,
    setLocalityIsraelOverride,
    tr,
  } = useContactWays();

  const [query, setQuery] = useState('');

  const results = useMemo(
    () => filterLanguagesForSearchWindow(query, locality.isIsraelDeviceLocality),
    [query, locality.isIsraelDeviceLocality],
  );

  if (!isLanguageSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={tr('חלון חיפוש ובחירת שפה', 'Language Search & Selection')}
      onClick={() => setLanguageSearchOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#DCE8F5] bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0F7FF] text-[#2A82C5]">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#1E293B]">
                {tr('חיפוש ובחירת שפה', 'Language Search Window')}
              </h2>
              <p className="text-xs text-[#475569]">
                {locality.isIsraelDeviceLocality
                  ? tr(
                      'זוהתה מקומיות בישראל (IL) — עברית מוצעת אוטומטית',
                      'Israel (IL) locality detected — Hebrew is suggested',
                    )
                  : tr(
                      'מיקום בינלאומי — עברית תוצג בחיפוש רק בהקלדת "עברית"',
                      'International locality — Hebrew appears only if "עברית" is searched',
                    )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLanguageSearchOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE8F5] text-[#475569] transition-colors hover:bg-[#F0F7FF] hover:text-[#1E293B]"
            aria-label={tr('סגור', 'Close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Locality Detection Box */}
        <div className="mt-4 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#475569]">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#1E293B]">
              <MapPin className="h-3.5 w-3.5 text-[#4F46E5]" />
              {tr('מיקום מזוהה:', 'Detected Locality:')} {locality.countryCode} · {locality.timeZoneId}
            </span>
            <span className="font-mono-tabular text-[11px] text-[#94A3B8]">
              {locality.localeTag}
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLocalityIsraelOverride(true)}
              className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                locality.isIsraelDeviceLocality
                  ? 'border-[#4F46E5] bg-[#4F46E5] text-white'
                  : 'border-[#DCE8F5] bg-white text-[#475569] hover:bg-[#F0F7FF]'
              }`}
            >
              🇮🇱 {tr('ישראל (IL)', 'Israel (IL)')}
            </button>
            <button
              type="button"
              onClick={() => setLocalityIsraelOverride(false)}
              className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                !locality.isIsraelDeviceLocality
                  ? 'border-[#4F46E5] bg-[#4F46E5] text-white'
                  : 'border-[#DCE8F5] bg-white text-[#475569] hover:bg-[#F0F7FF]'
              }`}
            >
              🌍 {tr('חו״ל (International)', 'International')}
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute top-1/2 start-3.5 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              locality.isIsraelDeviceLocality
                ? tr('חפש שפה (עברית, English, Italiano...)', 'Search languages...')
                : 'Search languages... (type "עברית" for Hebrew)'
            }
            className="w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] py-2.5 ps-10 pe-9 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#4F46E5] focus:bg-white focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute top-1/2 end-2.5 -translate-y-1/2 rounded p-1 text-[#94A3B8] hover:text-[#1E293B]"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Language Results List */}
        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pe-1">
          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#DCE8F5] p-6 text-center text-sm text-[#475569]">
              {tr(
                'לא נמצאו שפות התואמות לחיפוש.',
                'No matching languages found. Outside Israel, type "עברית" to reveal Hebrew.',
              )}
            </div>
          ) : (
            results.map((item) => {
              const isSelected = item.code === language;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code);
                    setLanguageSearchOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-start transition-colors ${
                    isSelected
                      ? 'border-[#4F46E5] bg-[#F0F7FF]'
                      : 'border-[#DCE8F5] bg-white hover:bg-[#FBFDFF]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden="true">
                      {item.flagEmoji}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-[#1E293B]">
                        {item.displayLabel}
                      </div>
                      <div className="text-xs text-[#475569]">
                        {item.englishName} · {item.nativeCountry} · {item.dir.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono-tabular text-xs font-semibold text-[#4F46E5]">
                      {item.toggleBadge}
                    </span>
                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4F46E5] text-white">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
