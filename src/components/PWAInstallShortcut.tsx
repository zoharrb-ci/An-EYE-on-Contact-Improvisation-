import React, { useState } from 'react';
import { Check, Copy, Download, MonitorSmartphone, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useContactWays } from '../context/ContactWaysContext';
import { BrandLogo } from './BrandLogo';

export const PWAInstallShortcut: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isInIframe, install } = usePWAInstall();
  const { siteConfig, tr } = useContactWays();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuideModal(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2200);
    } catch {
      // Clipboard ignored if unavailable
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-2 rounded-2xl border border-[#DCE8F5] bg-white px-5 py-2.5 text-xs font-semibold text-[#475569] shadow-2xs transition-colors hover:border-[#2A82C5]/40 hover:bg-[#F0F7FF] hover:text-[#1E293B] whitespace-nowrap"
      >
        <Download className="h-3.5 w-3.5 text-[#0F766E]" />
        <span>{tr('התקנת קיצור דרך', 'Install Shortcut')}</span>
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs text-start"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#DCE8F5] bg-white p-5 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <BrandLogo
                  alt={siteConfig.brandName || 'EYE-on-CI'}
                  className="h-10 w-10 shrink-0 object-contain"
                />
                <div>
                  <h3 className="font-display text-base font-bold text-[#1E293B]">
                    {tr('התקנת קיצור דרך למכשיר', 'Install App Shortcut')}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {siteConfig.brandName || 'EYE-on-CI'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE8F5] text-[#64748B] hover:bg-[#F0F7FF]"
                aria-label={tr('סגור', 'Close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3.5 space-y-2 text-xs text-[#334155]">
                <div className="flex items-center gap-2 font-semibold text-[#0F766E]">
                  <Share className="h-4 w-4 shrink-0" />
                  <span>{tr('באייפון / אייפד (Safari):', 'On iPhone / iPad (Safari):')}</span>
                </div>
                <ol className="list-decimal ps-4 space-y-1.5 leading-relaxed">
                  <li>
                    {tr(
                      'לחץ על כפתור השיתוף (Share) בסרגל הדפדפן.',
                      'Tap the Share button in the Safari toolbar.',
                    )}
                  </li>
                  <li>
                    {tr(
                      'גלול ובחר ב-"הוסף למסך הבית" (Add to Home Screen).',
                      'Scroll down and tap "Add to Home Screen".',
                    )}
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-[#334155]">
                <div className="rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-[#0F766E]">
                    <Smartphone className="h-4 w-4 shrink-0" />
                    <span>{tr('בנייד (Android / Chrome):', 'On Mobile (Android / Chrome):')}</span>
                  </div>
                  <p className="leading-relaxed">
                    {tr(
                      'פתח את תפריט הדפדפן (⋮) ובחר "התקן אפליקציה" או "הוסף למסך הבית".',
                      'Open the browser menu (⋮) and tap "Install app" or "Add to Home screen".',
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-[#1D4ED8]">
                    <MonitorSmartphone className="h-4 w-4 shrink-0" />
                    <span>{tr('במחשב (Chrome / Edge):', 'On Desktop (Chrome / Edge):')}</span>
                  </div>
                  <p className="leading-relaxed">
                    {tr(
                      'לחץ על סמל ההתקנה בשורת הכתובת למעלה, או בתפריט (⋮) ← "שמירה ושיתוף" ← "יצירת קיצור דרך".',
                      'Click the install icon in the address bar, or Menu (⋮) → "Save and share" → "Create shortcut".',
                    )}
                  </p>
                </div>
              </div>
            )}

            {isInIframe && (
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
                {tr(
                  'טיפ: להתקנה ישירה בלחיצה אחת, פתח את האפליקציה בלשונית דפדפן עצמאית (מחוץ לתצוגה המקדימה).',
                  'Tip: For one-click installation, open the app URL in its own browser tab outside the preview pane.',
                )}
              </p>
            )}

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3.5 py-2 text-xs font-medium text-[#475569] hover:bg-[#F0F7FF]"
              >
                {copiedUrl ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#0F766E]" />
                    <span>{tr('הקישור הועתק', 'Link Copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{tr('העתק קישור לאפליקציה', 'Copy App Link')}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3730A3]"
              >
                {tr('סגור', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
