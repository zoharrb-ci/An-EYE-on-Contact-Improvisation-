import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  HeartHandshake,
  Mail,
  MessageSquarePlus,
  Sparkles,
  X,
} from 'lucide-react';
import { useContactWays } from '../context/ContactWaysContext';
import { BrandLogo } from './BrandLogo';

export const AboutContactModal: React.FC = () => {
  const {
    isAboutOpen,
    setAboutOpen,
    setFeedbackOpen,
    siteConfig,
    language,
    tr,
  } = useContactWays();

  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isAboutOpen) return null;

  const isHe = language === 'he';
  const aboutTitle = isHe ? siteConfig.aboutTitleHe : siteConfig.aboutTitleEn || siteConfig.aboutTitleHe;
  const aboutDesc = isHe
    ? siteConfig.aboutDescriptionHe
    : siteConfig.aboutDescriptionEn || siteConfig.aboutDescriptionHe;
  const aboutPhilosophy = isHe
    ? siteConfig.aboutPhilosophyHe
    : siteConfig.aboutPhilosophyEn || siteConfig.aboutPhilosophyHe;
  const devRole = isHe
    ? siteConfig.developerRoleHe
    : siteConfig.developerRoleEn || siteConfig.developerRoleHe;

  const handleCopyEmail = async () => {
    if (!siteConfig.developerEmail) return;
    try {
      await navigator.clipboard.writeText(siteConfig.developerEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      // Fallback ignored safely
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      onClick={() => setAboutOpen(false)}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#DCE8F5] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#DCE8F5] bg-[#FBFDFF] px-6 py-4">
          <div className="flex items-center gap-3">
            <BrandLogo
              alt={siteConfig.brandName}
              className="h-9 w-9 shrink-0 object-contain"
            />
            <div>
              <h2 className="font-display text-lg font-bold text-[#3730A3]">{aboutTitle}</h2>
              <p className="text-xs text-[#475569]">
                {isHe ? siteConfig.brandTaglineHe : siteConfig.brandTaglineEn || siteConfig.brandTaglineHe}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAboutOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE8F5] text-[#475569] hover:bg-[#F0F7FF]"
            aria-label={tr('סגור', 'Close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F766E]">
              <HeartHandshake className="h-4 w-4" />
              <span>{tr('חזון ודרך סומטית', 'Somatic Vision & Lineage')}</span>
            </div>
            <p className="text-sm leading-relaxed text-[#1E293B] whitespace-pre-line">{aboutDesc}</p>
          </section>

          {aboutPhilosophy && (
            <section className="rounded-xl border border-[#DCE8F5] bg-teal-50/50 p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F766E]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{tr('עקרון מלווה', 'Guiding Principle')}</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[#1E293B] whitespace-pre-line">
                {aboutPhilosophy}
              </p>
            </section>
          )}

          {/* Developer & Maintenance Contact Details */}
          <section className="rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-[#1D4ED8]">
              {tr('פרטי קשר לפיתוח ותחזוקה', 'Development & Support Contact')}
            </h3>
            <div className="space-y-1 text-xs text-[#475569]">
              <div className="text-sm font-semibold text-[#1E293B]">{siteConfig.developerName}</div>
              {devRole && <div>{devRole}</div>}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {siteConfig.developerEmail && (
                <>
                  <a
                    href={`mailto:${siteConfig.developerEmail}?subject=${encodeURIComponent(
                      `Contact Ways Feedback`,
                    )}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#4F46E5] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#3730A3] whitespace-nowrap"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>{siteConfig.developerEmail}</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE8F5] bg-white px-3 py-2 text-xs font-medium text-[#475569] hover:bg-[#F0F7FF] whitespace-nowrap"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#047857]" />
                        <span className="text-[#047857]">{tr('הועתק', 'Copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>{tr('העתק מייל', 'Copy Email')}</span>
                      </>
                    )}
                  </button>
                </>
              )}

              {siteConfig.developerWebsite && (
                <a
                  href={siteConfig.developerWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE8F5] bg-white px-3 py-2 text-xs font-medium text-[#2A82C5] hover:bg-[#F0F7FF] whitespace-nowrap"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>{tr('אתר / פרטים נוספים', 'Website')}</span>
                </a>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#DCE8F5] bg-[#FBFDFF] px-6 py-3.5">
          <button
            type="button"
            onClick={() => {
              setAboutOpen(false);
              setFeedbackOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#F36523] px-4 py-2 text-xs font-semibold text-white hover:bg-[#D95316] whitespace-nowrap"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span>{tr('שלח משוב לפיתוח', 'Send Feedback')}</span>
          </button>

          <button
            type="button"
            onClick={() => setAboutOpen(false)}
            className="rounded-xl border border-[#DCE8F5] bg-white px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#F0F7FF] whitespace-nowrap"
          >
            {tr('סגור', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
