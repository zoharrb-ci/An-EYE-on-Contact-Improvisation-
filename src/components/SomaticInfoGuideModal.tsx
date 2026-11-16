import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Compass,
  Info,
  Layers,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { useContactWays } from '../context/ContactWaysContext';
import { AppNavTab, GuideSectionKey } from '../types/contactWays';
import { SomaticAxisVisual } from './SomaticAxisVisual';

type SectionFilter = 'all' | GuideSectionKey;

const SECTION_TABS: Array<{
  id: SectionFilter;
  labelHe: string;
  labelEn: string;
}> = [
  { id: 'all', labelHe: 'הכל', labelEn: 'All' },
  { id: 'philosophy', labelHe: 'פילוסופיה ומבנה', labelEn: 'Philosophy & Structure' },
  { id: 'axes_matrix', labelHe: '5 צירים ו-150 פרמטרים', labelEn: '5 Axes & 150 Matrix' },
  { id: 'scores', labelHe: 'ספריית התרגולים (Scores)', labelEn: 'Guided Scores' },
  { id: 'manager', labelHe: 'סטודיו מנהל', labelEn: 'Manager Studio' },
];

const TAB_LABELS: Record<AppNavTab, { he: string; en: string }> = {
  home: { he: 'ראשי', en: 'Home' },
  reflection: { he: '+תעוד', en: '+Log' },
  records: { he: 'יומן תנועה', en: 'Journal' },
  inquiries: { he: 'חקר', en: 'Inquiries' },
  progress: { he: 'כאן ועכשיו', en: 'Here & Now' },
  profile: { he: 'פרופיל', en: 'Profile' },
  manager: { he: 'סטודיו מנהל', en: 'Manager Studio' },
};

export const SomaticInfoGuideModal: React.FC = () => {
  const {
    activeGuideTopic,
    openGuideTopic,
    closeGuideTopic,
    executeGuideAction,
    guideTopics,
    activeTab,
    isActiveManager,
    language,
    tr,
  } = useContactWays();

  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isHe = language === 'he';

  useEffect(() => {
    if (!activeGuideTopic) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeGuideTopic();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeGuideTopic, closeGuideTopic]);

  const filteredTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return guideTopics.filter((t) => {
      const section = t.guideSection || 'philosophy';
      const matchesSection = sectionFilter === 'all' || section === sectionFilter;
      if (!matchesSection) return false;
      if (!q) return true;
      const haystack = [
        t.titleHe,
        t.titleEn,
        t.subtitleHe,
        t.subtitleEn,
        t.goalHe || '',
        t.goalEn || '',
        t.mechanismHe || '',
        t.mechanismEn || '',
        t.explanationHe,
        t.explanationEn,
        ...t.practicalTipsHe,
        ...t.practicalTipsEn,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [guideTopics, searchQuery, sectionFilter]);

  // Ensure an externally requested topic is never hidden by stale modal filters
  useEffect(() => {
    if (!activeGuideTopic) return;
    const targetExists = filteredTopics.some((t) => t.id === activeGuideTopic);
    if (!targetExists) {
      setSectionFilter('all');
      setSearchQuery('');
    }
    // Intentionally run only when activeGuideTopic changes so typing in search doesn't reset itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGuideTopic]);

  if (!activeGuideTopic) return null;

  const topic = guideTopics.find((t) => t.id === activeGuideTopic) || guideTopics[0];
  const activeScreenLabel = isHe ? TAB_LABELS[activeTab].he : TAB_LABELS[activeTab].en;
  const activeSectionMeta =
    SECTION_TABS.find((s) => s.id === (topic.guideSection || 'philosophy')) || SECTION_TABS[1];

  const getSectionCount = (id: SectionFilter) =>
    id === 'all'
      ? guideTopics.length
      : guideTopics.filter((t) => (t.guideSection || 'philosophy') === id).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-3 sm:p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={isHe ? topic.titleHe : topic.titleEn}
      onClick={closeGuideTopic}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#DCE8F5] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Hub Header */}
        <div className="border-b border-[#DCE8F5] bg-[#FBFDFF] px-5 py-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DCE8F5] bg-white text-[#4F46E5]">
                <Compass className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#475569]">
                  <span className="font-semibold text-[#4F46E5]">
                    {tr('מרכז המדריך והאדריכלות', 'Interactive Somatic & Architecture Guide')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {tr('מסך נוכחי:', 'Current view:')} <strong className="text-[#1E293B]">{activeScreenLabel}</strong>
                  </span>
                </div>
                <h2 className="font-display truncate text-base font-bold text-[#1E293B] sm:text-lg">
                  {tr(
                    'מדריך שלם: 5 צירים, 150 פרמטרים, תרגולי Scores ומבנה האפליקציה',
                    'Complete Guide: 5 Axes, 150 Matrix Parameters, Guided Scores & Flow',
                  )}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={closeGuideTopic}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#DCE8F5] bg-white text-[#475569] hover:bg-[#F0F7FF]"
              aria-label={tr('סגור', 'Close')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search & Section Lens Filter */}
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-[220px] lg:w-72">
              <Search className="pointer-events-none absolute top-1/2 start-3 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tr('חיפוש במדריך (מעקבים, כרטיסיות, מנהל)...', 'Search guide topics...')}
                className="w-full rounded-xl border border-[#DCE8F5] bg-white py-1.5 ps-8 pe-7 text-xs text-[#1E293B] focus:border-[#4F46E5] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute top-1/2 end-2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B]"
                  aria-label={tr('נקה חיפוש', 'Clear search')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {SECTION_TABS.map((sec) => {
                const active = sectionFilter === sec.id;
                const count = getSectionCount(sec.id);
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setSectionFilter(sec.id)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'border-[#4F46E5] bg-[#4F46E5] text-white'
                        : 'border-[#DCE8F5] bg-white text-[#475569] hover:bg-[#F0F7FF]'
                    }`}
                  >
                    <span>{isHe ? sec.labelHe : sec.labelEn}</span>
                    <span className="font-mono-tabular text-[11px] opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Body: Master-Detail Layout */}
        <div className="grid flex-1 min-h-0 md:grid-cols-12">
          {/* Mobile Compact Topic Switcher */}
          <div className="border-b border-[#DCE8F5] bg-[#FBFDFF] px-4 py-2.5 md:hidden">
            <label className="sr-only" htmlFor="mobile-guide-topic-select">
              {tr('בחר פרק במדריך', 'Select guide topic')}
            </label>
            <select
              id="mobile-guide-topic-select"
              value={topic.id}
              onChange={(e) => openGuideTopic(e.target.value as typeof topic.id)}
              className="w-full rounded-xl border border-[#DCE8F5] bg-white px-3 py-2 text-xs font-semibold text-[#1E293B]"
            >
              {(filteredTopics.length > 0 ? filteredTopics : guideTopics).map((t) => (
                <option key={t.id} value={t.id}>
                  {isHe ? t.titleHe : t.titleEn}
                </option>
              ))}
            </select>
          </div>

          {/* Left Index Pane (Desktop / Tablet) */}
          <aside className="hidden md:flex md:col-span-4 flex-col border-e border-[#DCE8F5] bg-[#FBFDFF] overflow-y-auto">
            {filteredTopics.length === 0 ? (
              <div className="p-6 text-center space-y-3">
                <p className="text-xs font-medium text-[#475569]">
                  {tr('לא נמצאו נושאים התואמים לחיפוש.', 'No guide topics match your search.')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSectionFilter('all');
                  }}
                  className="rounded-lg border border-[#DCE8F5] bg-white px-3 py-1.5 text-xs font-semibold text-[#4F46E5] hover:bg-[#F0F7FF]"
                >
                  {tr('נקה חיפוש', 'Clear Search')}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#DCE8F5]">
                {filteredTopics.map((t) => {
                  const active = t.id === topic.id;
                  const secMeta =
                    SECTION_TABS.find((s) => s.id === (t.guideSection || 'philosophy')) ||
                    SECTION_TABS[1];
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => openGuideTopic(t.id)}
                      className={`w-full px-4 py-3 text-start transition-colors ${
                        active
                          ? 'bg-[#EEF2FF] border-s-4 border-s-[#4F46E5]'
                          : 'hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-[#475569]">
                        <span className={active ? 'text-[#4F46E5] font-semibold' : ''}>
                          {isHe ? secMeta.labelHe : secMeta.labelEn}
                        </span>
                        {t.quickActions && t.quickActions.length > 0 && (
                          <span className="font-mono-tabular text-[10px] text-[#0F766E]">
                            {t.quickActions.length} {tr('קישורים', 'links')}
                          </span>
                        )}
                      </div>
                      <div
                        className={`mt-0.5 text-xs font-semibold leading-snug ${
                          active ? 'text-[#312E81]' : 'text-[#1E293B]'
                        }`}
                      >
                        {isHe ? t.titleHe : t.titleEn}
                      </div>
                      <div className="mt-0.5 line-clamp-1 text-[11px] text-[#64748B]">
                        {isHe ? t.subtitleHe : t.subtitleEn}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          {/* Right Detail Pane */}
          <main className="md:col-span-8 overflow-y-auto p-5 sm:p-6 space-y-5 bg-white">
            {/* Topic Heading */}
            <div className="flex items-start gap-3.5 border-b border-[#DCE8F5] pb-4">
              {topic.axisType ? (
                <SomaticAxisVisual axisType={topic.axisType} size={46} />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#DCE8F5] bg-[#F0F7FF] text-[#4F46E5]">
                  <BookOpen className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#475569]">
                  <span className="inline-flex items-center gap-1 text-[#4F46E5]">
                    <Layers className="h-3.5 w-3.5" />
                    {isHe ? activeSectionMeta.labelHe : activeSectionMeta.labelEn}
                  </span>
                  {topic.isCurated && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#0F766E] font-semibold">
                        {tr('מעודכן מסטודיו המנהל', 'Curated Studio Topic')}
                      </span>
                    </>
                  )}
                </div>
                <h3 className="font-display mt-1 text-lg font-bold text-[#1E293B] sm:text-xl">
                  {isHe ? topic.titleHe : topic.titleEn}
                </h3>
                <p className="mt-0.5 text-xs text-[#475569]">
                  {isHe ? topic.subtitleHe : topic.subtitleEn}
                </p>
              </div>
            </div>

            {/* Goal -> Mechanism Rationale Strip */}
            {((isHe ? topic.goalHe : topic.goalEn) || (isHe ? topic.mechanismHe : topic.mechanismEn)) && (
              <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-4">
                {(isHe ? topic.goalHe : topic.goalEn) && (
                  <div>
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F766E]">
                      <Sparkles className="h-3.5 w-3.5" />
                      {tr('המטרה והרעיון', 'Goal & Rationale')}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#1E293B]">
                      {isHe ? topic.goalHe : topic.goalEn}
                    </p>
                  </div>
                )}
                {(isHe ? topic.mechanismHe : topic.mechanismEn) && (
                  <div className="sm:border-s sm:border-[#DCE8F5] sm:ps-3">
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#2A82C5]">
                      <Info className="h-3.5 w-3.5" />
                      {tr('איך זה בנוי באפליקציה', 'How It Works Here')}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#1E293B]">
                      {isHe ? topic.mechanismHe : topic.mechanismEn}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Main Explanation */}
            <div className="text-sm leading-relaxed text-[#1E293B] whitespace-pre-line">
              {isHe ? topic.explanationHe : topic.explanationEn}
            </div>

            {/* Tri-Polar Regulation Guide */}
            {topic.ratingLevels.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-[#475569]">
                  {tr('מודל ויסות תלת-קוטבי (Under ↔ Flow ↔ Over)', 'Tri-Polar Regulation Model (Under ↔ Flow ↔ Over)')}
                </h4>
                <div className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
                  {topic.ratingLevels.map((lvl) => (
                    <div
                      key={lvl.range}
                      className="rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3"
                    >
                      <span
                        className="font-mono-tabular text-xs font-bold"
                        style={{ color: lvl.color }}
                      >
                        {lvl.range}
                      </span>
                      <div className="mt-1 text-xs font-semibold text-[#1E293B]">
                        {isHe ? lvl.labelHe : lvl.labelEn}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[#475569]">
                        {isHe ? lvl.descriptionHe : lvl.descriptionEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Practical Prompts */}
            {(isHe ? topic.practicalTipsHe : topic.practicalTipsEn).length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-[#475569]">
                  {tr('עקרונות ונקודות מפתח לעבודה', 'Practical Prompts & Key Notes')}
                </h4>
                <ul className="mt-2 space-y-1.5 text-sm text-[#1E293B]">
                  {(isHe ? topic.practicalTipsHe : topic.practicalTipsEn).map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4EB8A6]" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reflection Question */}
            {(isHe ? topic.reflectionQuestionHe : topic.reflectionQuestionEn) && (
              <div className="rounded-xl border border-[#DCE8F5] bg-[#F0F7FF]/60 p-4">
                <div className="text-xs font-semibold text-[#2A82C5]">
                  {tr('שאלת התבוננות', 'Reflection Question')}
                </div>
                <p className="mt-1 text-sm font-medium text-[#1E293B]">
                  {isHe ? topic.reflectionQuestionHe : topic.reflectionQuestionEn}
                </p>
              </div>
            )}

            {/* Live Deep-Link Jump Actions */}
            {topic.quickActions && topic.quickActions.length > 0 && (
              <div className="rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#1E293B]">
                    {tr('מעבר ישיר למסכים ולכלים הרלוונטיים', 'Live Deep Links to Relevant Screens')}
                  </span>
                  {topic.quickActions.some((a) => a.target === 'manager') && !isActiveManager && (
                    <span className="text-[11px] text-[#64748B]">
                      {tr(
                        'סטודיו המנהל דורש התחברות כחשבון מנהל מורשה',
                        'Manager Studio requires an authorized manager account',
                      )}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {topic.quickActions.map((action, idx) => (
                    <button
                      key={`${action.target}-${idx}`}
                      type="button"
                      onClick={() => executeGuideAction(action)}
                      style={
                        action.accentColor
                          ? { backgroundColor: action.accentColor, borderColor: action.accentColor }
                          : undefined
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#4F46E5] bg-[#4F46E5] px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
                    >
                      <span>{isHe ? action.labelHe : action.labelEn}</span>
                      <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
