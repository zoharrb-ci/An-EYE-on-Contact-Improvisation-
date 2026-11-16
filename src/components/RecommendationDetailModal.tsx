import React, { useEffect, useState } from 'react';
import { Info, Play, Plus, X } from 'lucide-react';
import { useContactWays } from '../context/ContactWaysContext';
import { getAxisMeta, mapLegacyAxisToV2 } from '../data/seedData';
import { GuidedScoreId, SomaticGuideTopicId } from '../types/contactWays';
import { MinimalDisclosureBox } from './MinimalDisclosureBox';

export const RecommendationDetailModal: React.FC = () => {
  const {
    selectedRecommendation,
    setSelectedRecommendation,
    openScoreTimer,
    openGuideTopic,
    personalJourney,
    language,
    tr,
  } = useContactWays();

  const [stepsOpen, setStepsOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [stepsVisible, setStepsVisible] = useState(3);

  useEffect(() => {
    setStepsOpen(false);
    setQuoteOpen(false);
    setStepsVisible(3);
  }, [selectedRecommendation?.id]);

  if (!selectedRecommendation) return null;

  const isHe = language === 'he';
  const meta = getAxisMeta(selectedRecommendation.axisType);

  const steps = isHe
    ? selectedRecommendation.practicalSteps
    : selectedRecommendation.practicalStepsEn.length
      ? selectedRecommendation.practicalStepsEn
      : selectedRecommendation.practicalSteps;

  const quote = isHe
    ? selectedRecommendation.quoteText
    : selectedRecommendation.quoteTextEn || selectedRecommendation.quoteText;

  const axisGuideId = `AXIS_${mapLegacyAxisToV2(selectedRecommendation.axisType).toUpperCase()}` as SomaticGuideTopicId;

  const resolveScoreId = (): GuidedScoreId => {
    if (selectedRecommendation.scoreId) return selectedRecommendation.scoreId;
    const axis = mapLegacyAxisToV2(selectedRecommendation.axisType);
    if (axis === 'mechanics') return 'small_dance';
    if (axis === 'perception') return 'sensory_tuning';
    if (axis === 'behavior') return 'lma_resiliency';
    if (axis === 'emotion') return 'keluf';
    return 'two_rivers';
  };

  const launchScore = () => {
    const scoreId = resolveScoreId();
    setSelectedRecommendation(null);
    openScoreTimer(scoreId, personalJourney.hereAndNowTone);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      onClick={() => setSelectedRecommendation(null)}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#DCE8F5] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Modal Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#DCE8F5] bg-[#FBFDFF] px-5 py-4">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-display truncate text-base font-bold sm:text-lg" style={{ color: meta.accentColor }}>
              {isHe
                ? selectedRecommendation.shortTitle
                : selectedRecommendation.shortTitleEn || selectedRecommendation.shortTitle}
            </h3>
            <button
              type="button"
              onClick={() => openGuideTopic(axisGuideId)}
              aria-label={tr('מדריך הציר', 'Axis guide')}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F0F7FF] hover:text-[#2A82C5]"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSelectedRecommendation(null)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#DCE8F5] bg-white text-[#475569] hover:bg-[#F0F7FF]"
            aria-label={tr('סגור', 'Close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          <p className="text-sm leading-relaxed text-[#1E293B]">
            {isHe
              ? selectedRecommendation.fullExplanation
              : selectedRecommendation.fullExplanationEn || selectedRecommendation.fullExplanation}
          </p>

          {steps.length > 0 && (
            <MinimalDisclosureBox
              title={tr('שלבי תרגול מעשיים', 'Practice Steps')}
              isOpen={stepsOpen}
              onToggle={() => setStepsOpen((o) => !o)}
              onInfoClick={() => openGuideTopic(axisGuideId)}
              accentColor="#1D4ED8"
              className="rounded-xl"
            >
              <ol className="space-y-2 text-xs sm:text-sm text-[#1E293B]">
                {steps.slice(0, stepsVisible).map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono-tabular font-semibold text-[#4F46E5]">{idx + 1}.</span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
              {stepsVisible < steps.length && (
                <button
                  type="button"
                  onClick={() => setStepsVisible((c) => Math.min(steps.length, c + 3))}
                  className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-[#4F46E5]/45 py-1.5 text-xs font-semibold text-[#4F46E5]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{tr('עוד (+3)', 'More (+3)')}</span>
                </button>
              )}
            </MinimalDisclosureBox>
          )}

          {quote && (
            <MinimalDisclosureBox
              title={tr('מקור והשראה', 'Quote & Inspiration')}
              isOpen={quoteOpen}
              onToggle={() => setQuoteOpen((o) => !o)}
              accentColor="#4F46E5"
              className="rounded-xl"
            >
              <p className="text-xs sm:text-sm font-medium italic text-[#1E293B]">“{quote}”</p>
              {(selectedRecommendation.quoteAuthor || selectedRecommendation.quoteAuthorEn) && (
                <p className="text-xs text-[#475569]">
                  —{' '}
                  {isHe
                    ? selectedRecommendation.quoteAuthor
                    : selectedRecommendation.quoteAuthorEn || selectedRecommendation.quoteAuthor}
                </p>
              )}
            </MinimalDisclosureBox>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#DCE8F5] bg-[#FBFDFF] px-5 py-3.5">
          {(selectedRecommendation.hasInteractivePractice || selectedRecommendation.scoreId) && (
            <button
              type="button"
              onClick={launchScore}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D9488] whitespace-nowrap"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{tr('הפעל תרגול', 'Launch Score')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSelectedRecommendation(null)}
            className="rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3730A3] whitespace-nowrap"
          >
            {tr('סיים', 'Done')}
          </button>
        </div>
      </div>
    </div>
  );
};
