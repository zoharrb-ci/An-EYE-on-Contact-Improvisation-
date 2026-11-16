import React, { useMemo, useState } from 'react';
import {
  Home,
  Info,
  Layers,
  LayoutGrid,
  List,
  Play,
  Plus,
  PlusCircle,
  Search,
  StretchHorizontal,
  X,
} from 'lucide-react';
import { useContactWays } from '../context/ContactWaysContext';
import { RecordViewMode } from '../types/contactWays';
import {
  getAxisShortLabel,
  getPillarColor,
  getSoftBalanceLabel,
  normalizeRecordAxes,
} from '../data/seedData';
import { MinimalDisclosureBox } from '../components/MinimalDisclosureBox';

export const RecordsView: React.FC = () => {
  const {
    records,
    filteredRecords,
    recordViewMode,
    setRecordViewMode,
    pillarFilter,
    setPillarFilter,
    searchQuery,
    setSearchQuery,
    setSelectedRecord,
    setActiveTab,
    openGuideTopic,
    openScoreTimer,
    personalJourney,
    somaticProgress,
    language,
    tr,
  } = useContactWays();

  const isHe = language === 'he';

  // Everything collapsed cleanly to Title + Info icon initially
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [trendsOpen, setTrendsOpen] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(3);

  const distinctPillars = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(r.pillarCategory));
    return ['ALL', ...Array.from(set)];
  }, [records]);

  const modes: Array<{
    id: RecordViewMode;
    labelHe: string;
    labelEn: string;
    Icon: React.FC<{ className?: string }>;
  }> = [
    { id: 'cards', labelHe: 'כרטיסיות', labelEn: 'Cards', Icon: LayoutGrid },
    { id: 'timeline', labelHe: 'ציר זמן', labelEn: 'Timeline', Icon: StretchHorizontal },
    { id: 'categorized', labelHe: 'לפי ציר', labelEn: 'Pillars', Icon: Layers },
    { id: 'compact', labelHe: 'טבלה', labelEn: 'List', Icon: List },
  ];

  const getSoftPresenceSummary = (rec: (typeof records)[number]) => {
    const balances = normalizeRecordAxes(rec);
    const values = Object.values(balances);
    const avg = values.reduce((a, b) => a + b, 0) / Math.max(1, values.length);
    return getSoftBalanceLabel(avg, language);
  };

  const recurringTrends = somaticProgress.topRecurringParameters || [];
  const visibleRecords = filteredRecords.slice(0, visibleCount);

  return (
    <div className="mx-auto max-w-3xl space-y-3 pb-24">
      {/* Compact Header */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DCE8F5] bg-white px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="font-display truncate text-lg font-bold text-[#1D4ED8] sm:text-xl">
            {tr('יומן התנועה', 'Movement Journal')}
          </h1>
          <button
            type="button"
            onClick={() => openGuideTopic('GUIDE_RECORDS_MODES')}
            aria-label={tr('מדריך היומן', 'Journal guide')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F0F7FF] hover:text-[#2A82C5]"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('reflection')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#4F46E5] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#3730A3] whitespace-nowrap"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>{tr('תיעוד חדש', 'New Log')}</span>
        </button>
      </section>

      {/* Collapsed Search, Filter & View Mode Box */}
      <MinimalDisclosureBox
        title={tr('חיפוש, סינון ומצבי תצוגה', 'Search, Filter & View Mode')}
        isOpen={filtersOpen}
        onToggle={() => setFiltersOpen((o) => !o)}
        onInfoClick={() => openGuideTopic('GUIDE_RECORDS_MODES')}
        accentColor="#1D4ED8"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tr('חפש כותרת, פרטנר או ג׳אם...', 'Search title, partner, or jam...')}
            className="w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] py-2 ps-9 pe-8 text-sm text-[#1E293B] focus:border-[#4F46E5] focus:bg-white focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute top-1/2 end-2.5 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-1 w-fit">
          {modes.map(({ id, labelHe, labelEn, Icon }) => {
            const active = recordViewMode === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setRecordViewMode(id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  active ? 'bg-[#4F46E5] text-white' : 'text-[#475569] hover:bg-white hover:text-[#1E293B]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tr(labelHe, labelEn)}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {distinctPillars.map((pillar) => {
            const active = pillarFilter === pillar;
            return (
              <button
                key={pillar}
                type="button"
                onClick={() => setPillarFilter(pillar)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'border-[#4F46E5] bg-[#4F46E5] text-white'
                    : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#475569] hover:bg-[#F0F7FF]'
                }`}
              >
                {pillar === 'ALL' ? tr('הכל', 'All') : pillar}
              </button>
            );
          })}
        </div>
      </MinimalDisclosureBox>

      {/* Collapsed Top 3 Recurring Trends Box */}
      {recurringTrends.length > 0 && (
        <MinimalDisclosureBox
          title={tr('3 מגמות חוזרות ב־30 הימים האחרונים', 'Top 3 Recurring Trends (30 Days)')}
          isOpen={trendsOpen}
          onToggle={() => setTrendsOpen((o) => !o)}
          onInfoClick={() => openGuideTopic('GUIDE_TRACKING_TYPES')}
          accentColor="#3730A3"
        >
          <div className="space-y-2">
            {recurringTrends.map((trend) => {
              const param = trend.param;
              return (
                <div
                  key={param.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#1E293B]">
                      {isHe ? param.title.he : param.title.en}
                    </div>
                    <div className="text-[11px] text-[#475569]">
                      {getAxisShortLabel(param.axisId, language)} · {trend.dominantState.toUpperCase()}
                    </div>
                  </div>
                  {param.suggestedScoreId && (
                    <button
                      type="button"
                      onClick={() =>
                        openScoreTimer(param.suggestedScoreId!, personalJourney.hereAndNowTone)
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-[#0F766E] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#0D9488] whitespace-nowrap"
                    >
                      <Play className="h-3 w-3" />
                      <span>{tr('תרגול מאזן', 'Score')}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </MinimalDisclosureBox>
      )}

      {/* Records List: 3 Primary Items Initially + "More (+3)" */}
      {filteredRecords.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DCE8F5] bg-white p-8 text-center">
          <p className="text-xs font-medium text-[#475569]">
            {tr('לא נמצאו רשומות תואמות.', 'No matching reflections.')}
          </p>
        </div>
      ) : recordViewMode === 'compact' ? (
        <div className="overflow-x-auto rounded-2xl border border-[#DCE8F5] bg-white">
          <table className="w-full text-start text-sm">
            <tbody className="divide-y divide-[#DCE8F5]">
              {visibleRecords.map((rec) => (
                <tr
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className="cursor-pointer hover:bg-[#F0F7FF]/45"
                >
                  <td className="px-4 py-3 text-xs font-semibold text-[#1E293B]">{rec.title}</td>
                  <td className="px-4 py-3 text-xs text-[#475569] whitespace-nowrap">{rec.dateStr}</td>
                  <td className="px-4 py-3 text-end text-xs font-semibold text-[#0F766E]">
                    {getSoftPresenceSummary(rec)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleRecords.map((rec) => {
            const isOpen = expandedRecordId === rec.id;
            return (
              <MinimalDisclosureBox
                key={rec.id}
                title={rec.title}
                isOpen={isOpen}
                onToggle={() => setExpandedRecordId(isOpen ? null : rec.id)}
                onInfoClick={() => setSelectedRecord(rec)}
                infoAriaLabel={tr('פתח פרטים מלאים', 'Open full record')}
                accentColor={getPillarColor(rec.pillarCategory)}
              >
                <div className="text-xs text-[#475569]">
                  {rec.dateStr} · {rec.partner} · {getSoftPresenceSummary(rec)}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-[#1E293B]">
                  {rec.reflectionNotes}
                </p>
                {rec.keyTakeaway && (
                  <p className="text-xs italic text-[#3730A3]">“{rec.keyTakeaway}”</p>
                )}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(rec)}
                    className="rounded-xl bg-[#1D4ED8] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1E40AF] whitespace-nowrap"
                  >
                    {tr('פתח מפה מלאה', 'Open Full Details')}
                  </button>
                </div>
              </MinimalDisclosureBox>
            );
          })}
        </div>
      )}

      {visibleCount < filteredRecords.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((c) => Math.min(filteredRecords.length, c + 3))}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[#1D4ED8]/45 bg-white py-3 text-xs font-semibold text-[#1D4ED8] hover:bg-[#F0F7FF]"
        >
          <Plus className="h-4 w-4" />
          <span>{tr('עוד רשומות (+3)', 'More Records (+3)')}</span>
        </button>
      )}

      {/* Always-Visible Action Bar */}
      <div className="sticky bottom-16 z-20 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#DCE8F5] bg-white/95 p-3 shadow-sm backdrop-blur-xs lg:bottom-4">
        <button
          type="button"
          onClick={() => setActiveTab('reflection')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3730A3] whitespace-nowrap"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>{tr('הוסף תיעוד', 'New Log')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE8F5] bg-white px-4 py-2 text-xs font-medium text-[#1E293B] hover:bg-[#F0F7FF] whitespace-nowrap"
        >
          <Home className="h-3.5 w-3.5" />
          <span>{tr('סיים וחזור לראשי', 'Finish & Home')}</span>
        </button>
      </div>
    </div>
  );
};
