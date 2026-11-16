import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Home,
  Info,
  Play,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { useContactWays } from '../context/ContactWaysContext';
import {
  DEFAULT_AXIS_BALANCES,
  SOMATIC_AXES,
  getAxisTitle,
  getSoftBalanceLabel,
} from '../data/seedData';
import {
  GUIDED_SCORES,
  getAxisPoleFeedback,
  getMatrixParametersByAxis,
} from '../data/matrixData';
import {
  AxisBalances,
  AxisRegulationState,
  FlaggedParameter,
  ReflectionAxisId,
} from '../types/contactWays';
import { SomaticRadarChart } from '../components/SomaticRadarChart';
import { MinimalDisclosureBox } from '../components/MinimalDisclosureBox';

type ReflectionSectionKey =
  | ReflectionAxisId
  | 'radar'
  | 'session'
  | 'boundaries'
  | 'notes';

const AXIS_ORDER: ReflectionAxisId[] = [
  'mechanics',
  'perception',
  'behavior',
  'emotion',
  'ethics',
];

const PILLAR_OPTIONS = [
  { he: 'מכניקה, פיזיקה ומורפולוגיה', en: 'Mechanics, Physics & Morphology' },
  { he: 'תפיסה, חישה וקשב עורי', en: 'Perception & Sensory Listening' },
  { he: 'תנועה, ביצוע וזיקות לאבאן', en: 'Movement Behavior & LMA Flow' },
  { he: 'ויסות רגשי ודינמיקה בינאישית', en: 'Emotional Regulation & Relating' },
  { he: 'אתיקה, הסכמה ומרקם קהילתי', en: 'Ethics, Consent & Community' },
];

const CONTACT_POINT_OPTIONS = [
  { he: 'אגן ומרכז', en: 'Pelvis & Center' },
  { he: 'גב אל גב', en: 'Back-to-Back' },
  { he: 'שכמות וכתפיים', en: 'Shoulders & Scapulae' },
  { he: 'צלעות', en: 'Ribs' },
  { he: 'כפות ידיים', en: 'Hands' },
  { he: 'אמות הידיים', en: 'Forearms' },
  { he: 'ראש אל כתף', en: 'Head to Shoulder' },
  { he: 'ירכיים', en: 'Thighs' },
  { he: 'משטח הרצפה', en: 'Floor Surface' },
  { he: 'כפות רגליים', en: 'Soles of Feet' },
];

const TWO_RIVERS_OPTIONS = [
  { he: 'יד פתוחה — "כן / העמק"', en: 'Open Palm — "Yes / Deepen"' },
  { he: 'הרמת אמה — "המתן / האט"', en: 'Raised Forearm — "Wait / Slow"' },
  { he: 'כף יד מושטת — "לא / עצור"', en: 'Extended Palm — "No / Stop"' },
  { he: 'גמישות הדדית ו״ידית הדלת״ פתוחה', en: 'Fluid pacing & Open "Door Handle"' },
];

const KELUF_OPTIONS = [
  { he: 'קילוף מניירות (Peel)', en: 'Peel — Shed performative habits' },
  { he: 'חישת הפלחים (Segments)', en: 'Sense Segments — Read tissue tone' },
  { he: 'רגע (המתנה שקטה)', en: 'Rega — Quiet wait before steering' },
  { he: 'סליחה (עצירה וויסות)', en: 'Slicha — Pause safely to regulate' },
  { he: 'שלום (חזרה נינוחה)', en: 'Shalom — Peaceful return to anchor' },
];

const INTENTION_CHECKIN_OPTIONS = [
  { he: 'הרגשתי תמיכה נעימה', en: 'Felt gentle support' },
  { he: 'חקרתי בסקרנות', en: 'Explored with curiosity' },
  { he: 'נתתי לעצמי להאט', en: 'Gave myself space to slow down' },
  { he: 'כיבדתי גבול ברור', en: 'Honored a clear boundary' },
  { he: 'פשוט נכחתי בלי מאמץ', en: 'Stayed present without forcing' },
];

export const NewReflectionView: React.FC = () => {
  const {
    saveNewRecord,
    personalJourney,
    reflectionModePreset,
    setReflectionModePreset,
    openScoreTimer,
    openGuideTopic,
    setActiveTab,
    curatedParamNotes,
    language,
    tr,
  } = useContactWays();

  const isHe = language === 'he';

  const [mode, setMode] = useState<'quick' | 'deep'>(reflectionModePreset);
  useEffect(() => {
    setMode(reflectionModePreset);
  }, [reflectionModePreset]);

  const handleModeSwitch = (nextMode: 'quick' | 'deep') => {
    setMode(nextMode);
    setReflectionModePreset(nextMode);
  };

  // Start collapsed to zero clutter (Title + Info icon only)
  const [openSection, setOpenSection] = useState<ReflectionSectionKey | null>(null);
  const [touchedAxes, setTouchedAxes] = useState<Record<ReflectionAxisId, boolean>>({
    mechanics: false,
    perception: false,
    behavior: false,
    emotion: false,
    ethics: false,
  });

  // 3 primary parameters shown per axis, +3 per "More" click
  const [visibleCountByAxis, setVisibleCountByAxis] = useState<Record<ReflectionAxisId, number>>({
    mechanics: 3,
    perception: 3,
    behavior: 3,
    emotion: 3,
    ethics: 3,
  });

  // Only one parameter expanded at a time inside an axis
  const [expandedParamId, setExpandedParamId] = useState<string | null>(null);
  const [paramInfoOpenId, setParamInfoOpenId] = useState<string | null>(null);
  const [axisSearchByAxis, setAxisSearchByAxis] = useState<Record<ReflectionAxisId, string>>({
    mechanics: '',
    perception: '',
    behavior: '',
    emotion: '',
    ethics: '',
  });
  const [showAxisSearch, setShowAxisSearch] = useState(false);

  const [title, setTitle] = useState('');
  const [partner, setPartner] = useState('');
  const [jamName, setJamName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [pillarCategory, setPillarCategory] = useState(
    isHe ? PILLAR_OPTIONS[0].he : PILLAR_OPTIONS[0].en,
  );
  const [contactPoints, setContactPoints] = useState<string[]>([
    isHe ? 'אגן ומרכז' : 'Pelvis & Center',
    isHe ? 'גב אל גב' : 'Back-to-Back',
  ]);
  const [twoRiversState, setTwoRiversState] = useState(
    isHe ? TWO_RIVERS_OPTIONS[0].he : TWO_RIVERS_OPTIONS[0].en,
  );
  const [kelufState, setKelufState] = useState('');

  const [axisBalances, setAxisBalances] = useState<AxisBalances>({ ...DEFAULT_AXIS_BALANCES });
  const [flaggedMap, setFlaggedMap] = useState<Record<string, AxisRegulationState>>({});

  const [reflectionNotes, setReflectionNotes] = useState('');
  const [keyTakeaway, setKeyTakeaway] = useState('');
  const [intentionCheckIn, setIntentionCheckIn] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const toggleSection = (key: ReflectionSectionKey) => {
    setOpenSection((prev) => (prev === key ? null : key));
    setExpandedParamId(null);
    setParamInfoOpenId(null);
    setShowAxisSearch(false);
  };

  const updateBalance = (axisId: ReflectionAxisId, val: number) => {
    setAxisBalances((prev) => ({
      ...prev,
      [axisId]: Math.max(-5, Math.min(5, val)),
    }));
    setTouchedAxes((prev) => ({ ...prev, [axisId]: true }));
  };

  const toggleContactPoint = (label: string) => {
    setContactPoints((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label],
    );
  };

  const toggleFlagParameter = (paramId: string, axisId: ReflectionAxisId, state: AxisRegulationState) => {
    setFlaggedMap((prev) => {
      const next = { ...prev };
      if (next[paramId] === state) {
        delete next[paramId];
      } else {
        next[paramId] = state;
      }
      return next;
    });
    setTouchedAxes((prev) => ({ ...prev, [axisId]: true }));
  };

  const flaggedList: FlaggedParameter[] = useMemo(
    () =>
      Object.entries(flaggedMap).map(([paramId, state]) => ({
        paramId,
        state,
      })),
    [flaggedMap],
  );

  const handleRevealMoreParams = (axisId: ReflectionAxisId, totalCount: number) => {
    setVisibleCountByAxis((prev) => ({
      ...prev,
      [axisId]: Math.min(totalCount, (prev[axisId] || 3) + 3),
    }));
  };

  const getNextAxisId = (current?: ReflectionSectionKey | null): ReflectionAxisId => {
    if (!current || !AXIS_ORDER.includes(current as ReflectionAxisId)) {
      return AXIS_ORDER[0];
    }
    const idx = AXIS_ORDER.indexOf(current as ReflectionAxisId);
    return AXIS_ORDER[(idx + 1) % AXIS_ORDER.length];
  };

  const handleContinueToAnotherAxis = () => {
    const nextAxis = getNextAxisId(openSection);
    setOpenSection(nextAxis);
    setExpandedParamId(null);
    setParamInfoOpenId(null);
    setShowAxisSearch(false);
  };

  const handleSave = async (navigateToRecords: boolean) => {
    setSaving(true);
    setSavedBanner(null);
    try {
      const saved = await saveNewRecord({
        title,
        partner,
        jamName,
        durationMinutes,
        pillarCategory,
        contactPoints,
        reflectionMode: mode,
        axisBalances,
        flaggedParameters: flaggedList,
        twoRiversState,
        kelufState: kelufState || undefined,
        reflectionNotes,
        keyTakeaway,
        intentionCheckIn,
        navigateToRecords,
      });
      if (!navigateToRecords) {
        setSavedBanner(
          tr(`הרשומה "${saved.title}" נשמרה ביומן.`, `Saved "${saved.title}" to your journal.`),
        );
        setTitle('');
        setReflectionNotes('');
        setKeyTakeaway('');
        setIntentionCheckIn('');
        setFlaggedMap({});
        setOpenSection(null);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-3 pb-24">
      {/* Compact Header (Title + Info icon + Quick/Deep switch) */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DCE8F5] bg-white px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="font-display truncate text-lg font-bold text-[#3730A3] sm:text-xl">
            {tr('תיעוד וחקירת צירים', 'Session Reflection')}
          </h1>
          <button
            type="button"
            onClick={() => openGuideTopic('GUIDE_TRACKING_TYPES')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F0F7FF] hover:text-[#2A82C5]"
            aria-label={tr('מדריך תיעוד', 'Tracking guide')}
          >
            <Info className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-1">
            <button
              type="button"
              onClick={() => handleModeSwitch('quick')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'quick'
                  ? 'bg-[#F36523] text-white'
                  : 'text-[#475569] hover:bg-white hover:text-[#1E293B]'
              }`}
            >
              {tr('מהיר', 'Quick')}
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('deep')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'deep'
                  ? 'bg-[#4F46E5] text-white'
                  : 'text-[#475569] hover:bg-white hover:text-[#1E293B]'
              }`}
            >
              {tr('עומק (150)', 'Deep (150)')}
            </button>
          </div>

          {mode === 'deep' && (
            <button
              type="button"
              onClick={() => openScoreTimer('clinic_1on1', personalJourney.hereAndNowTone)}
              className="inline-flex items-center gap-1 rounded-xl bg-[#6D28D9] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#5B21B6] whitespace-nowrap"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{tr('טיימר 20 דק׳', '20m Clinic')}</span>
            </button>
          )}
        </div>
      </section>

      {savedBanner && (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{savedBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedBanner(null)}
            className="text-emerald-700 hover:text-emerald-900"
            aria-label={tr('סגור', 'Dismiss')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 5 Collapsed Axis Boxes — Each shows ONLY Title + Info Icon until clicked */}
      {SOMATIC_AXES.map((axis) => {
        const isOpen = openSection === axis.type;
        const val = axisBalances[axis.type];
        const pole = getAxisPoleFeedback(axis.type, val, language);
        const allParams = getMatrixParametersByAxis(axis.type);
        const query = (axisSearchByAxis[axis.type] || '').trim().toLowerCase();
        const filteredParams = query
          ? allParams.filter((p) =>
              `${p.title.he} ${p.title.en} ${p.underDesc.he} ${p.flowDesc.he} ${p.overDesc.he}`
                .toLowerCase()
                .includes(query),
            )
          : allParams;
        const visibleCount = visibleCountByAxis[axis.type] || 3;
        const shownParams = query ? filteredParams.slice(0, visibleCount) : filteredParams.slice(0, visibleCount);
        const hasMore = shownParams.length < filteredParams.length;
        const axisTaggedCount = allParams.filter((p) => Boolean(flaggedMap[p.id])).length;
        const isDone = touchedAxes[axis.type] || axisTaggedCount > 0 || val !== 0;

        return (
          <MinimalDisclosureBox
            key={axis.type}
            title={getAxisTitle(axis.type, language)}
            isOpen={isOpen}
            onToggle={() => toggleSection(axis.type)}
            onInfoClick={() => openGuideTopic(axis.guideTopicId)}
            infoAriaLabel={tr(`מידע על ${axis.titleHe}`, `Info about ${axis.titleEn}`)}
            accentColor={axis.accentColor}
            isDone={isDone}
            footerActions={
              <>
                <button
                  type="button"
                  onClick={handleContinueToAnotherAxis}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#4F46E5]/30 bg-[#F0F7FF] px-3.5 py-2 text-xs font-semibold text-[#3730A3] hover:bg-[#DCE8F5]/70 whitespace-nowrap"
                >
                  <span>{tr('המשך לציר הבא', 'Continue to Next Axis')}</span>
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D5F58] disabled:opacity-50 whitespace-nowrap"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{tr('סיים ושמור', 'Finish & Save')}</span>
                </button>
              </>
            }
          >
            {/* Tri-Polar Balance Slider (zero numeric ratings) */}
            <div className="rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className="text-xs font-semibold"
                  style={{ color: pole.state === 'flow' ? '#0F766E' : axis.accentColor }}
                >
                  {getSoftBalanceLabel(val, language)}
                </span>
                {val !== 0 && (
                  <button
                    type="button"
                    onClick={() => updateBalance(axis.type, 0)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#64748B] hover:text-[#0F766E]"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{tr('אפס למרכז Flow', 'Center Flow')}</span>
                  </button>
                )}
              </div>

              <input
                type="range"
                min={-5}
                max={5}
                step={0.5}
                value={val}
                onChange={(e) => updateBalance(axis.type, Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-[#0F766E]"
              />

              <div className="flex items-center justify-between gap-2 text-[11px] text-[#64748B]">
                <span className="truncate">{isHe ? axis.underLabelHe : axis.underLabelEn}</span>
                <span className="shrink-0 font-semibold text-[#0F766E]">Flow</span>
                <span className="truncate text-end">{isHe ? axis.overLabelHe : axis.overLabelEn}</span>
              </div>

              <p className="text-xs text-[#334155]">{pole.description}</p>
            </div>

            {/* 3 Primary Parameters per Axis + "More (+3)" Progressive Reveal */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-semibold text-[#475569]">
                  {tr(
                    `פרמטרים בציר (${shownParams.length} מתוך ${filteredParams.length})`,
                    `Axis Parameters (${shownParams.length} of ${filteredParams.length})`,
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAxisSearch((s) => !s)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-[#2A82C5] hover:bg-[#F0F7FF]"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>{tr('חיפוש', 'Search')}</span>
                </button>
              </div>

              {showAxisSearch && (
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 start-3 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={axisSearchByAxis[axis.type] || ''}
                    onChange={(e) =>
                      setAxisSearchByAxis((prev) => ({ ...prev, [axis.type]: e.target.value }))
                    }
                    placeholder={tr('סנן פרמטרים בציר זה...', 'Filter parameters in this axis...')}
                    className="w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] py-2 ps-8 pe-8 text-xs text-[#1E293B] focus:border-[#4F46E5] focus:bg-white focus:outline-none"
                  />
                  {axisSearchByAxis[axis.type] && (
                    <button
                      type="button"
                      onClick={() =>
                        setAxisSearchByAxis((prev) => ({ ...prev, [axis.type]: '' }))
                      }
                      className="absolute top-1/2 end-2.5 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {shownParams.map((p) => {
                  const isParamOpen = expandedParamId === p.id;
                  const isParamInfoOpen = paramInfoOpenId === p.id;
                  const currentTag = flaggedMap[p.id];
                  const note = curatedParamNotes[p.id];

                  return (
                    <MinimalDisclosureBox
                      key={p.id}
                      title={`${isHe ? p.title.he : p.title.en}${note?.highlighted ? ' ★' : ''}`}
                      isOpen={isParamOpen}
                      onToggle={() => {
                        setExpandedParamId(isParamOpen ? null : p.id);
                        setParamInfoOpenId(null);
                      }}
                      onInfoClick={() =>
                        setParamInfoOpenId((prev) => (prev === p.id ? null : p.id))
                      }
                      infoAriaLabel={tr('הסבר ושאלת התבוננות לפרמטר', 'Parameter info')}
                      accentColor={axis.accentColor}
                      isDone={Boolean(currentTag)}
                      className="rounded-xl"
                    >
                      {isParamInfoOpen && (
                        <div className="rounded-lg border border-[#DCE8F5] bg-[#F0F7FF]/70 p-3 text-xs text-[#1E293B] space-y-1">
                          <div className="font-semibold text-[#1D4ED8]">
                            {tr('שאלת התבוננות:', 'Reflection prompt:')}
                          </div>
                          <p className="italic">
                            “{isHe ? p.reflectionPrompt.he : p.reflectionPrompt.en}”
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-1.5">
                        {(['under', 'flow', 'over'] as AxisRegulationState[]).map((st) => {
                          const active = currentTag === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => toggleFlagParameter(p.id, axis.type, st)}
                              className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                                active
                                  ? st === 'flow'
                                    ? 'border-[#0F766E] bg-[#0F766E] text-white'
                                    : st === 'under'
                                      ? 'border-[#2A82C5] bg-[#2A82C5] text-white'
                                      : 'border-[#D97706] bg-[#D97706] text-white'
                                  : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#475569] hover:bg-[#F0F7FF]'
                              }`}
                            >
                              {st === 'under' ? 'Under' : st === 'flow' ? 'Flow' : 'Over'}
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid gap-1.5 text-xs text-[#475569] sm:grid-cols-3">
                        <div className="rounded-lg bg-[#FBFDFF] p-2">
                          <strong className="text-[#2A82C5]">Under:</strong>{' '}
                          {isHe ? p.underDesc.he : p.underDesc.en}
                        </div>
                        <div className="rounded-lg bg-[#FBFDFF] p-2">
                          <strong className="text-[#0F766E]">Flow:</strong>{' '}
                          {isHe ? p.flowDesc.he : p.flowDesc.en}
                        </div>
                        <div className="rounded-lg bg-[#FBFDFF] p-2">
                          <strong className="text-[#D97706]">Over:</strong>{' '}
                          {isHe ? p.overDesc.he : p.overDesc.en}
                        </div>
                      </div>

                      {note && (isHe ? note.noteHe : note.noteEn) && (
                        <p className="text-xs italic text-[#92400E]">
                          {isHe ? note.noteHe : note.noteEn}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span className="text-xs italic text-[#312E81]">
                          “{isHe ? p.reflectionPrompt.he : p.reflectionPrompt.en}”
                        </span>
                        {p.suggestedScoreId && (
                          <button
                            type="button"
                            onClick={() =>
                              openScoreTimer(p.suggestedScoreId!, personalJourney.hereAndNowTone)
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-[#0F766E] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#0D9488] whitespace-nowrap"
                          >
                            <Play className="h-3 w-3" />
                            <span>
                              {isHe
                                ? GUIDED_SCORES[p.suggestedScoreId].titleHe
                                : GUIDED_SCORES[p.suggestedScoreId].titleEn}
                            </span>
                          </button>
                        )}
                      </div>
                    </MinimalDisclosureBox>
                  );
                })}
              </div>

              {hasMore && (
                <button
                  type="button"
                  onClick={() => handleRevealMoreParams(axis.type, filteredParams.length)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#2A82C5]/50 bg-[#F0F7FF]/50 py-2.5 text-xs font-semibold text-[#1D4ED8] hover:bg-[#F0F7FF]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>
                    {tr(
                      `עוד (+3) · מוצגים ${shownParams.length} מתוך ${filteredParams.length}`,
                      `More (+3) · Showing ${shownParams.length} of ${filteredParams.length}`,
                    )}
                  </span>
                </button>
              )}
            </div>
          </MinimalDisclosureBox>
        );
      })}

      {/* Collapsed Optional Sections (Title + Info icon until clicked) */}
      <MinimalDisclosureBox
        title={tr('מפת נוכחות חיה (5 צירים)', 'Live 5-Axis Presence Map')}
        isOpen={openSection === 'radar'}
        onToggle={() => toggleSection('radar')}
        onInfoClick={() => openGuideTopic('GUIDE_APP_OVERVIEW')}
        infoAriaLabel={tr('מידע על מפת הנוכחות', 'Presence map info')}
        accentColor="#0F766E"
      >
        <SomaticRadarChart liveAxisBalances={axisBalances} />
      </MinimalDisclosureBox>

      <MinimalDisclosureBox
        title={tr('פרטי המפגש ונקודות מגע', 'Session Details & Contact Surfaces')}
        isOpen={openSection === 'session'}
        onToggle={() => toggleSection('session')}
        onInfoClick={() => openGuideTopic('AXIS_MECHANICS')}
        infoAriaLabel={tr('מידע על נקודות מגע', 'Contact surfaces info')}
        accentColor="#1D4ED8"
        isDone={Boolean(title.trim() || partner.trim())}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#475569]">
              {tr('כותרת הרפלקציה', 'Reflection Title')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={tr('למשל: חקירת טנסגריטי בעמוד השדרה', 'e.g. Spine tensegrity duet')}
              className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3.5 py-2 text-sm text-[#1E293B] focus:border-[#4F46E5] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('שם שותף/ה (או סולו)', 'Partner (or Solo)')}
              </label>
              <input
                type="text"
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                placeholder={tr('למשל: מאיה כ.', 'e.g. Maya K.')}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3.5 py-2 text-sm text-[#1E293B] focus:border-[#4F46E5] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('משך בדקות', 'Duration (min)')}
              </label>
              <input
                type="number"
                min={10}
                max={480}
                step={5}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value) || 60)}
                className="font-mono-tabular mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3.5 py-2 text-sm text-[#1E293B] focus:border-[#4F46E5] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('מיקום / מסגרת', 'Jam, Clinic, or Workshop')}
              </label>
              <input
                type="text"
                value={jamName}
                onChange={(e) => setJamName(e.target.value)}
                placeholder={tr('למשל: ג׳אם שישי', 'e.g. Friday Open Jam')}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3.5 py-2 text-sm text-[#1E293B] focus:border-[#4F46E5] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('ציר מאקרו מרכזי', 'Primary Macro-Axis Focus')}
              </label>
              <select
                value={pillarCategory}
                onChange={(e) => setPillarCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3.5 py-2 text-sm text-[#1E293B] focus:border-[#4F46E5] focus:bg-white focus:outline-none"
              >
                {PILLAR_OPTIONS.map((opt) => {
                  const val = isHe ? opt.he : opt.en;
                  return (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-[#475569]">
              {tr('נקודות מגע עיקריות', 'Primary Contact Surfaces')}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {CONTACT_POINT_OPTIONS.map((cp) => {
                const label = isHe ? cp.he : cp.en;
                const active = contactPoints.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleContactPoint(label)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'border-[#4F46E5] bg-[#4F46E5] text-white'
                        : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#475569] hover:bg-[#F0F7FF]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </MinimalDisclosureBox>

      <MinimalDisclosureBox
        title={tr('שני הנהרות, קילוף התפוז וכוונה', 'Two Rivers, Keluf & Intention')}
        isOpen={openSection === 'boundaries'}
        onToggle={() => toggleSection('boundaries')}
        onInfoClick={() => openGuideTopic('SCORE_TWO_RIVERS')}
        infoAriaLabel={tr('מידע על שני הנהרות וקילוף התפוז', 'Two Rivers & Keluf info')}
        accentColor="#B45309"
        isDone={Boolean(kelufState || intentionCheckIn)}
      >
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#B45309]">
                {tr('שני הנהרות (תקשורת והסכמה)', 'Two Rivers Consent Cue')}
              </span>
              <button
                type="button"
                onClick={() => openScoreTimer('two_rivers', personalJourney.hereAndNowTone)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#D97706] hover:underline whitespace-nowrap"
              >
                <Play className="h-3 w-3" />
                <span>{tr('תרגול מונחה', 'Practice Cue')}</span>
              </button>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {TWO_RIVERS_OPTIONS.map((opt) => {
                const label = isHe ? opt.he : opt.en;
                const selected = twoRiversState === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setTwoRiversState(label)}
                    className={`rounded-xl border px-3.5 py-2 text-start text-xs font-medium transition-colors ${
                      selected
                        ? 'border-[#D97706] bg-amber-50 text-[#92400E]'
                        : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#475569] hover:bg-[#F0F7FF]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#DCE8F5] pt-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#7C3AED]">
                {tr('קילוף התפוז (Keluf)', 'Orange Peeling (Keluf)')}
              </span>
              <button
                type="button"
                onClick={() => openScoreTimer('keluf', personalJourney.hereAndNowTone)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:underline whitespace-nowrap"
              >
                <Play className="h-3 w-3" />
                <span>{tr('הפעל קילוף', 'Open Keluf')}</span>
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {KELUF_OPTIONS.map((opt) => {
                const label = isHe ? opt.he : opt.en;
                const selected = kelufState === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setKelufState(selected ? '' : label)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                      selected
                        ? 'border-[#7C3AED] bg-[#7C3AED] text-white'
                        : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#475569] hover:bg-[#F0F7FF]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#DCE8F5] pt-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F766E]">
              <HeartHandshake className="h-3.5 w-3.5" />
              <span>{tr('צ׳ק-אין רך מול הכוונה', 'Gentle Intention Check-In')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTENTION_CHECKIN_OPTIONS.map((opt) => {
                const label = isHe ? opt.he : opt.en;
                const selected = intentionCheckIn === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setIntentionCheckIn(selected ? '' : label)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                      selected
                        ? 'border-[#0F766E] bg-[#0F766E] text-white'
                        : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#475569] hover:bg-[#F0F7FF]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </MinimalDisclosureBox>

      <MinimalDisclosureBox
        title={tr('יומן תחושות ותובנת מפתח', 'Somatic Notes & Key Takeaway')}
        isOpen={openSection === 'notes'}
        onToggle={() => toggleSection('notes')}
        onInfoClick={() => openGuideTopic('PARAM_REFLECTION_NOTES')}
        infoAriaLabel={tr('מדריך לתיעוד תחושות', 'Notes guide')}
        accentColor="#3730A3"
        isDone={Boolean(reflectionNotes.trim() || keyTakeaway.trim())}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#475569]">
              {tr('מה הרגשתי בגוף, בנשימה ובמפגש?', 'Sensations, breath & partner dialogue')}
            </label>
            <textarea
              rows={3}
              value={reflectionNotes}
              onChange={(e) => setReflectionNotes(e.target.value)}
              placeholder={tr(
                'תאר בקצרה תחושות בגוף, העברת משקל או גבול...',
                'Briefly note sensations, weight transfer, or boundaries...',
              )}
              className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-sm text-[#1E293B] focus:border-[#4F46E5] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#475569]">
              {tr('תובנת מפתח אחת', 'One Key Takeaway')}
            </label>
            <input
              type="text"
              value={keyTakeaway}
              onChange={(e) => setKeyTakeaway(e.target.value)}
              placeholder={tr(
                'משפט קצר לזכור לג׳אם הבא...',
                'A short sentence to carry to the next jam...',
              )}
              className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3.5 py-2 text-sm text-[#1E293B] focus:border-[#4F46E5] focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </MinimalDisclosureBox>

      {/* Always-Visible Step Navigation Bar: Continue to Another Axis OR Finish */}
      <div className="sticky bottom-16 z-20 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#DCE8F5] bg-white/95 p-3 shadow-sm backdrop-blur-xs lg:bottom-4">
        <button
          type="button"
          onClick={handleContinueToAnotherAxis}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#4F46E5]/35 bg-[#F0F7FF] px-3.5 py-2 text-xs font-semibold text-[#3730A3] hover:bg-[#DCE8F5]/70 whitespace-nowrap"
        >
          <span>{tr('המשך לציר אחר', 'Next / Another Axis')}</span>
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE8F5] bg-white px-3 py-2 text-xs font-medium text-[#475569] hover:bg-[#F0F7FF] whitespace-nowrap"
          >
            <Home className="h-3.5 w-3.5" />
            <span>{tr('סיים וחזור לראשי', 'Finish & Home')}</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3730A3] disabled:opacity-50 whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{tr('סיים ושמור ביומן', 'Finish & Save Log')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
