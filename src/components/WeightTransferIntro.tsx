import React, { useState } from 'react';
import { ArrowRight, Cloud, HelpCircle, RotateCcw, X } from 'lucide-react';
import { useContactWays } from '../context/ContactWaysContext';
import { getLanguageMeta } from '../i18n/languages';

export const WeightTransferIntro: React.FC = () => {
  const {
    showIntro,
    dismissIntro,
    language,
    setLanguageSearchOpen,
    setStorageExplainerOpen,
    storageMode,
    tr,
  } = useContactWays();

  const [gifCycleKey, setGifCycleKey] = useState(0);
  const [showRationale, setShowRationale] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!showIntro) return null;

  const langMeta = getLanguageMeta(language);

  const replay = () => {
    setGifCycleKey((k) => k + 1);
  };

  return (
    <div className="fixed inset-0 z-40 flex h-dvh w-full flex-col overflow-hidden bg-[#FBFDFF]">
      {/* Compact Mobile-Friendly Top Bar (No Title Overlap) */}
      <div className="mx-auto flex h-14 w-full max-w-5xl shrink-0 items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          {!imgError ? (
            <img
              src={`${import.meta.env.BASE_URL}assets/ci_logo_frameless.png`}
              alt="Contact Ways Logo"
              onError={() => setImgError(true)}
              className="h-8 w-8 shrink-0 object-contain"
            />
          ) : (
            <span className="shrink-0 text-sm font-bold text-[#4F46E5]">c-i</span>
          )}
          <span className="font-display truncate text-base font-bold tracking-tight text-[#1E293B] sm:text-lg">
            Contact Ways
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Cloud Storage Icon-Only Button */}
          <button
            type="button"
            onClick={() => setStorageExplainerOpen(true)}
            aria-label={tr('אחסון מקומי וענן', 'Cloud & Local Storage')}
            title={tr('אחסון מקומי וענן', 'Cloud & Local Storage')}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE8F5] bg-white text-[#475569] transition-colors hover:bg-[#F0F7FF]"
          >
            <Cloud
              className={`h-4 w-4 ${
                storageMode === 'cloud' ? 'text-[#4F46E5]' : 'text-[#475569]'
              }`}
            />
            {storageMode === 'cloud' && (
              <span className="absolute top-1.5 end-1.5 h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            )}
          </button>

          {/* Language Shortcut Button (e.g. GB / IL) */}
          <button
            type="button"
            onClick={() => setLanguageSearchOpen(true)}
            aria-label={tr('בחירת שפה', 'Select Language')}
            title={langMeta.displayLabel}
            className="font-mono-tabular inline-flex h-9 items-center justify-center rounded-lg border border-[#DCE8F5] bg-[#F0F7FF] px-2.5 text-xs font-bold tracking-wider text-[#2A82C5] transition-colors hover:bg-[#DCE8F5]/60"
          >
            {langMeta.toggleBadge}
          </button>
        </div>
      </div>

      {/* Main Stage: Clean Animation + Action Buttons Only (No Text Below Animation) */}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 pb-6">
        <div className="flex w-full max-w-lg flex-col items-center">
          {/* Clean White-Background 8-Second Duet GIF */}
          <div className="relative w-full overflow-hidden rounded-2xl border border-[#DCE8F5] bg-white p-2 sm:p-3 shadow-xs">
            <img
              key={gifCycleKey}
              src={`${import.meta.env.BASE_URL}assets/video_cuts/intro_clean_duet.gif?cycle=${gifCycleKey}`}
              alt={tr('אנימציית אימפרוביזציה במגע', 'Contact Improvisation animation')}
              className="mx-auto h-52 w-full object-contain bg-white sm:h-64"
            />
          </div>

          {/* Action Buttons Directly Below Animation */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={dismissIntro}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3730A3] whitespace-nowrap"
            >
              <span>{tr('כניסה', 'Enter')}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </button>

            <button
              type="button"
              onClick={replay}
              aria-label={tr('נגן שוב', 'Replay')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE8F5] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#475569] hover:bg-[#F0F7FF] whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{tr('נגן שוב', 'Replay')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRationale(true)}
              aria-label={tr('מידע', 'Info')}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DCE8F5] bg-white text-[#2A82C5] hover:bg-[#F0F7FF]"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Rationale Modal */}
      {showRationale && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setShowRationale(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#DCE8F5] bg-white p-6 text-start shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#1E293B]">
                {tr('מהות מהלך העברת המשקל', 'The Essence of Weight Transfer')}
              </h3>
              <button
                type="button"
                onClick={() => setShowRationale(false)}
                className="rounded-lg p-1 text-[#475569] hover:bg-[#F0F7FF]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#475569]">
              {tr(
                'באימפרוביזציה במגע, המפגש אינו מתחיל בתכנון צעדים אלא בהקשבה לכוח המשיכה, מציאת נקודת מגע מתגלגלת ובניית קשת אמון הדדית.',
                'In Contact Improvisation, a duet begins not with preset steps, but with listening to gravity, meeting a rolling point of contact, and leaning into mutual counterbalance.',
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
