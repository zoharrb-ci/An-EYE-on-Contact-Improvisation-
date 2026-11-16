import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  HeartHandshake,
  Home,
  Info,
  Play,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useContactWays } from '../context/ContactWaysContext';
import {
  CURIOSITY_CARDS,
  HERE_AND_NOW_TONES,
  INTENTION_HORIZONS,
  SUPPORT_NEED_OPTIONS,
} from '../data/seedData';
import { GUIDED_SCORES, getToneMatchedPracticeSuggestion } from '../data/matrixData';
import { GuidedScoreId, SomaticGuideTopicId } from '../types/contactWays';
import { SomaticRadarChart } from '../components/SomaticRadarChart';
import { WeeklyActivityChart } from '../components/WeeklyActivityChart';
import { MinimalDisclosureBox } from '../components/MinimalDisclosureBox';

type ProgressSectionId =
  | 'tone'
  | 'scores'
  | 'curiosity'
  | 'intention'
  | 'map'
  | 'moments';

const SECTION_ORDER: ProgressSectionId[] = [
  'tone',
  'scores',
  'curiosity',
  'intention',
  'map',
  'moments',
];

const QUICK_SCORE_IDS: GuidedScoreId[] = [
  'small_dance',
  'sensory_tuning',
  'two_rivers',
  'keluf',
  'lma_resiliency',
  'clinic_1on1',
];

export const ProgressView: React.FC = () => {
  const {
    personalJourney,
    updatePersonalJourney,
    somaticProgress,
    recommendations,
    setSelectedRecommendation,
    openScoreTimer,
    openGuideTopic,
    setActiveTab,
    language,
    tr,
  } = useContactWays();

  const isHe = language === 'he';

  // Collapsed by default to prevent cognitive overload
  const [openSection, setOpenSection] = useState<ProgressSectionId | null>(null);
  const [scoresVisible, setScoresVisible] = useState(3);
  const [expandedScoreId, setExpandedScoreId] = useState<GuidedScoreId | null>(null);
  const [curiosityVisible, setCuriosityVisible] = useState(3);
  const [expandedCuriosityId, setExpandedCuriosityId] = useState<string | null>(null);
  const [matchedRecsVisible, setMatchedRecsVisible] = useState(3);
  const [momentsVisible, setMomentsVisible] = useState(3);

  const [hereAndNowNoteDraft, setHereAndNowNoteDraft] = useState(personalJourney.hereAndNowNote);
  const [statementDraft, setStatementDraft] = useState(personalJourney.statement);
  const [newMomentText, setNewMomentText] = useState('');
  const [savingSection, setSavingSection] = useState<'note' | 'intention' | null>(null);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  useEffect(() => {
    setHereAndNowNoteDraft(personalJourney.hereAndNowNote);
    setStatementDraft(personalJourney.statement);
  }, [personalJourney.hereAndNowNote, personalJourney.statement]);

  const activeTone =
    HERE_AND_NOW_TONES.find((t) => t.id === personalJourney.hereAndNowTone) || HERE_AND_NOW_TONES[0];
  const toneSuggestion = getToneMatchedPracticeSuggestion(personalJourney.hereAndNowTone);

  const selectedCuriosities = CURIOSITY_CARDS.filter((c) =>
    personalJourney.curiosityIds.includes(c.id),
  );
  const matchedRecommendations = recommendations.filter((rec) =>
    selectedCuriosities.some((c) => c.axisType === rec.axisType),
  );
  const supportRecommendations =
    matchedRecommendations.length > 0 ? matchedRecommendations : recommendations;

  const showToast = (msg: string) => {
    setSavedFeedback(msg);
    setTimeout(() => setSavedFeedback(null), 2600);
  };

  const toggleSection = (id: ProgressSectionId) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const handleNextSection = () => {
    if (!openSection) {
      setOpenSection(SECTION_ORDER[0]);
      return;
    }
    const idx = SECTION_ORDER.indexOf(openSection);
    setOpenSection(SECTION_ORDER[(idx + 1) % SECTION_ORDER.length]);
  };

  const handleSelectTone = async (toneId: (typeof HERE_AND_NOW_TONES)[number]['id']) => {
    await updatePersonalJourney({ hereAndNowTone: toneId });
  };

  const handleSaveHereAndNowNote = async () => {
    setSavingSection('note');
    try {
      await updatePersonalJourney({ hereAndNowNote: hereAndNowNoteDraft.trim() });
      showToast(tr('תמונת הכאן ועכשיו נשמרה ברכות.', 'Here & Now check-in saved.'));
    } finally {
      setSavingSection(null);
    }
  };

  const handleToggleCuriosity = async (cardId: string) => {
    const exists = personalJourney.curiosityIds.includes(cardId);
    const nextIds = exists
      ? personalJourney.curiosityIds.filter((id) => id !== cardId)
      : [...personalJourney.curiosityIds, cardId];
    await updatePersonalJourney({ curiosityIds: nextIds });
  };

  const handleAdoptCuriositySeed = async (seedText: string, cardId: string) => {
    const nextIds = personalJourney.curiosityIds.includes(cardId)
      ? personalJourney.curiosityIds
      : [...personalJourney.curiosityIds, cardId];
    setStatementDraft(seedText);
    await updatePersonalJourney({ curiosityIds: nextIds, statement: seedText });
    showToast(tr('ההשראה אומצה ככוונה הקרובה שלך.', 'Adopted as your near-term intention.'));
  };

  const handleToggleSupportNeed = async (needText: string) => {
    const exists = personalJourney.supportNeeds.includes(needText);
    const nextNeeds = exists
      ? personalJourney.supportNeeds.filter((n) => n !== needText)
      : [...personalJourney.supportNeeds, needText];
    await updatePersonalJourney({ supportNeeds: nextNeeds });
  };

  const handleSaveIntention = async () => {
    setSavingSection('intention');
    try {
      await updatePersonalJourney({ statement: statementDraft.trim() });
      showToast(tr('הכוונה הקרובה והתמיכה נשמרו.', 'Near-term intention & support saved.'));
    } finally {
      setSavingSection(null);
    }
  };

  const handleAddSupportMoment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMomentText.trim();
    if (!trimmed) return;
    const todayStr = new Date().toLocaleDateString(isHe ? 'he-IL' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
    const nextMoments = [
      { id: `sup-${Date.now()}`, text: trimmed, dateStr: todayStr },
      ...personalJourney.supportMoments,
    ].slice(0, 30);
    await updatePersonalJourney({ supportMoments: nextMoments });
    setNewMomentText('');
    showToast(tr('נוסף רגע תומך למסע שלך.', 'Supportive moment added.'));
  };

  const handleRemoveSupportMoment = async (id: string) => {
    const nextMoments = personalJourney.supportMoments.filter((m) => m.id !== id);
    await updatePersonalJourney({ supportMoments: nextMoments });
  };

  const renderSectionFooter = () => (
    <>
      <button
        type="button"
        onClick={handleNextSection}
        className="inline-flex items-center gap-1.5 rounded-xl border border-[#4F46E5]/30 bg-[#F0F7FF] px-3.5 py-2 text-xs font-semibold text-[#3730A3] hover:bg-[#DCE8F5]/70 whitespace-nowrap"
      >
        <span>{tr('המשך לנושא הבא', 'Continue to Next')}</span>
        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('home')}
        className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE8F5] bg-white px-3.5 py-2 text-xs font-medium text-[#475569] hover:bg-[#F0F7FF] whitespace-nowrap"
      >
        <Home className="h-3.5 w-3.5" />
        <span>{tr('סיים וחזור לראשי', 'Finish & Home')}</span>
      </button>
    </>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-3 pb-24">
      {/* Compact Header */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DCE8F5] bg-white px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0">
            <h1 className="font-display truncate text-lg font-bold text-[#0F766E] sm:text-xl">
              {tr('כאן ועכשיו · תרגול וסקרנות', 'Here & Now · Practice & Curiosity')}
            </h1>
            <p className="text-xs font-semibold" style={{ color: activeTone.color }}>
              {isHe ? activeTone.labelHe : activeTone.labelEn}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openGuideTopic('GUIDE_PROGRESS_RADAR')}
            aria-label={tr('מדריך כאן ועכשיו', 'Here & Now guide')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F0F7FF] hover:text-[#2A82C5]"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => openScoreTimer(toneSuggestion.scoreId, personalJourney.hereAndNowTone)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0D5F58] whitespace-nowrap"
        >
          <Play className="h-3.5 w-3.5" />
          <span>{tr('תרגול מותאם עכשיו', 'Matched Score')}</span>
        </button>
      </section>

      {savedFeedback && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{savedFeedback}</span>
        </div>
      )}

      {/* 1. Here & Now Tone */}
      <MinimalDisclosureBox
        title={tr('איך הגוף והתחושה פוגשים את הרגע הזה?', 'Here & Now Presence Tone')}
        isOpen={openSection === 'tone'}
        onToggle={() => toggleSection('tone')}
        onInfoClick={() => openGuideTopic('GUIDE_PROGRESS_RADAR')}
        accentColor="#0F766E"
        footerActions={renderSectionFooter()}
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {HERE_AND_NOW_TONES.map((tone) => {
            const selected = personalJourney.hereAndNowTone === tone.id;
            return (
              <button
                key={tone.id}
                type="button"
                onClick={() => handleSelectTone(tone.id)}
                className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-start transition-colors ${
                  selected
                    ? 'border-[#0F766E] bg-[#F0F7FF]'
                    : 'border-[#DCE8F5] bg-[#FBFDFF] hover:bg-[#F0F7FF]/60'
                }`}
              >
                <span className="text-xs font-bold" style={{ color: tone.color }}>
                  {isHe ? tone.labelHe : tone.labelEn}
                </span>
                {selected && <Check className="h-3.5 w-3.5 shrink-0" style={{ color: tone.color }} />}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3.5">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-[#1E293B]">
              {isHe ? toneSuggestion.titleHe : toneSuggestion.titleEn}
            </div>
            <p className="mt-0.5 text-xs text-[#475569]">
              {isHe ? toneSuggestion.reasonHe : toneSuggestion.reasonEn}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openScoreTimer(toneSuggestion.scoreId, personalJourney.hereAndNowTone)}
            style={{ backgroundColor: toneSuggestion.accentColor }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white hover:opacity-90 whitespace-nowrap"
          >
            <Play className="h-3.5 w-3.5" />
            <span>{tr('הפעל תרגול', 'Launch Score')}</span>
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={hereAndNowNoteDraft}
            onChange={(e) => setHereAndNowNoteDraft(e.target.value)}
            placeholder={tr('מילה או תחושה מהרגע הזה...', 'A brief word from this moment...')}
            className="flex-1 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3.5 py-2 text-sm text-[#1E293B] focus:border-[#0F766E] focus:bg-white focus:outline-none"
          />
          <button
            type="button"
            disabled={savingSection === 'note'}
            onClick={handleSaveHereAndNowNote}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0F766E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D5F58] disabled:opacity-50 whitespace-nowrap"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{tr('עדכן', 'Save')}</span>
          </button>
        </div>
      </MinimalDisclosureBox>

      {/* 2. Guided Scores Library (3 initially + More (+3)) */}
      <MinimalDisclosureBox
        title={tr('הצעות תרגול מונחות (Scores)', 'Guided Practice Scores')}
        isOpen={openSection === 'scores'}
        onToggle={() => toggleSection('scores')}
        onInfoClick={() => openGuideTopic('SCORE_SMALL_DANCE')}
        accentColor="#3730A3"
        footerActions={renderSectionFooter()}
      >
        <div className="space-y-2">
          {QUICK_SCORE_IDS.slice(0, scoresVisible).map((sid) => {
            const sc = GUIDED_SCORES[sid];
            const scoreGuideId = `SCORE_${sid.toUpperCase()}` as SomaticGuideTopicId;
            return (
              <MinimalDisclosureBox
                key={sid}
                title={isHe ? sc.titleHe : sc.titleEn}
                isOpen={expandedScoreId === sid}
                onToggle={() => setExpandedScoreId((prev) => (prev === sid ? null : sid))}
                onInfoClick={() => openGuideTopic(scoreGuideId)}
                accentColor={sc.accentColor}
                className="rounded-xl"
              >
                <p className="text-xs leading-relaxed text-[#475569]">
                  {isHe ? sc.subtitleHe : sc.subtitleEn}
                </p>
                <button
                  type="button"
                  onClick={() => openScoreTimer(sid, personalJourney.hereAndNowTone)}
                  style={{ backgroundColor: sc.accentColor }}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white hover:opacity-90 whitespace-nowrap"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>{tr('הפעל טיימר תרגול', 'Launch Score Timer')}</span>
                </button>
              </MinimalDisclosureBox>
            );
          })}
        </div>

        {scoresVisible < QUICK_SCORE_IDS.length && (
          <button
            type="button"
            onClick={() => setScoresVisible((c) => Math.min(QUICK_SCORE_IDS.length, c + 3))}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#4F46E5]/45 py-2 text-xs font-semibold text-[#4F46E5] hover:bg-[#F0F7FF]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{tr('עוד (+3)', 'More (+3)')}</span>
          </button>
        )}
      </MinimalDisclosureBox>

      {/* 3. Curiosity Cards (3 initially + More (+3)) */}
      <MinimalDisclosureBox
        title={tr('כרטיסיות סקרנות — מה מזמין אותי?', 'Curiosity Cards')}
        isOpen={openSection === 'curiosity'}
        onToggle={() => toggleSection('curiosity')}
        onInfoClick={() => openGuideTopic('AXIS_MECHANICS')}
        accentColor="#1D4ED8"
        isDone={personalJourney.curiosityIds.length > 0}
        footerActions={renderSectionFooter()}
      >
        <div className="space-y-2">
          {CURIOSITY_CARDS.slice(0, curiosityVisible).map((card) => {
            const isSelected = personalJourney.curiosityIds.includes(card.id);
            const seed = isHe ? card.sampleIntentionHe : card.sampleIntentionEn;
            const axisGuide = `AXIS_${card.axisType.toUpperCase()}` as SomaticGuideTopicId;
            return (
              <MinimalDisclosureBox
                key={card.id}
                title={isHe ? card.titleHe : card.titleEn}
                isOpen={expandedCuriosityId === card.id}
                onToggle={() =>
                  setExpandedCuriosityId((prev) => (prev === card.id ? null : card.id))
                }
                onInfoClick={() => openGuideTopic(axisGuide)}
                accentColor={card.accentColor}
                isDone={isSelected}
                className="rounded-xl"
              >
                <p className="text-xs leading-relaxed text-[#475569]">
                  {isHe ? card.inviteHe : card.inviteEn}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleCuriosity(card.id)}
                    className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'border-[#2A82C5] bg-[#2A82C5] text-white'
                        : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#1E293B] hover:bg-[#F0F7FF]'
                    }`}
                  >
                    {isSelected ? tr('מסומן כסקרנות פעילה', 'Selected') : tr('סמן כסקרנות', 'Select Interest')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdoptCuriositySeed(seed, card.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] hover:underline whitespace-nowrap"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{tr('אמץ לכוונה', 'Use as Intention')}</span>
                  </button>
                </div>
              </MinimalDisclosureBox>
            );
          })}
        </div>

        {curiosityVisible < CURIOSITY_CARDS.length && (
          <button
            type="button"
            onClick={() => setCuriosityVisible((c) => Math.min(CURIOSITY_CARDS.length, c + 3))}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#2A82C5]/45 py-2 text-xs font-semibold text-[#1D4ED8] hover:bg-[#F0F7FF]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{tr('עוד (+3)', 'More (+3)')}</span>
          </button>
        )}
      </MinimalDisclosureBox>

      {/* 4. Near-Term Intention & Tailored Practices (3 initially + More (+3)) */}
      <MinimalDisclosureBox
        title={tr('הכוונה הקרובה ותמיכה מותאמת', 'Near-Term Intention & Matched Practices')}
        isOpen={openSection === 'intention'}
        onToggle={() => toggleSection('intention')}
        onInfoClick={() => openGuideTopic('GUIDE_PROFILE_INTENTIONS')}
        accentColor="#4338CA"
        isDone={Boolean(personalJourney.statement.trim())}
        footerActions={renderSectionFooter()}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {INTENTION_HORIZONS.map((h) => {
              const active = personalJourney.horizon === h.id;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => updatePersonalJourney({ horizon: h.id })}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'border-[#4F46E5] bg-[#4F46E5] text-white'
                      : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#475569] hover:bg-[#F0F7FF]'
                  }`}
                >
                  {isHe ? h.labelHe : h.labelEn}
                </button>
              );
            })}
          </div>

          <textarea
            rows={2}
            value={statementDraft}
            onChange={(e) => setStatementDraft(e.target.value)}
            placeholder={tr('ניסוח קצר ורך לכוונה הקרובה...', 'Short gentle intention...')}
            className="w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-sm text-[#1E293B] focus:border-[#4F46E5] focus:bg-white focus:outline-none"
          />

          <div className="flex flex-wrap gap-2">
            {SUPPORT_NEED_OPTIONS.map((opt) => {
              const label = isHe ? opt.he : opt.en;
              const active = personalJourney.supportNeeds.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleToggleSupportNeed(label)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors text-start ${
                    active
                      ? 'border-[#0F766E] bg-[#0F766E] text-white'
                      : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#475569] hover:bg-[#F0F7FF]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={savingSection === 'intention'}
              onClick={handleSaveIntention}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3730A3] disabled:opacity-50 whitespace-nowrap"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{tr('שמור כוונה', 'Save Intention')}</span>
            </button>
          </div>

          <div className="border-t border-[#DCE8F5] pt-3 space-y-2">
            <div className="text-xs font-semibold text-[#C2410C]">
              {tr('הצעות תרגול מותאמות', 'Matched Practice Suggestions')}
            </div>
            {supportRecommendations.slice(0, matchedRecsVisible).map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3.5 py-2.5"
              >
                <button
                  type="button"
                  onClick={() => setSelectedRecommendation(rec)}
                  className="min-w-0 flex-1 text-start text-xs font-semibold text-[#9A3412] hover:underline truncate"
                >
                  {isHe ? rec.shortTitle : rec.shortTitleEn || rec.shortTitle}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRecommendation(rec)}
                  aria-label={tr('פרטי ההצעה', 'Details')}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F0F7FF] hover:text-[#2A82C5]"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
            ))}
            {matchedRecsVisible < supportRecommendations.length && (
              <button
                type="button"
                onClick={() =>
                  setMatchedRecsVisible((c) => Math.min(supportRecommendations.length, c + 3))
                }
                className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-[#C2410C]/45 py-2 text-xs font-semibold text-[#C2410C] hover:bg-orange-50/40"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{tr('עוד (+3)', 'More (+3)')}</span>
              </button>
            )}
          </div>
        </div>
      </MinimalDisclosureBox>

      {/* 5. Presence Pentagon & Weekly Rhythm */}
      <MinimalDisclosureBox
        title={tr('מפת הנוכחות (5 צירים) וקצב שבועי', '5-Axis Presence Map & Weekly Rhythm')}
        isOpen={openSection === 'map'}
        onToggle={() => toggleSection('map')}
        onInfoClick={() => openGuideTopic('GUIDE_PROGRESS_WEEKLY')}
        accentColor="#2A82C5"
        footerActions={renderSectionFooter()}
      >
        <div className="space-y-4">
          <SomaticRadarChart progress={somaticProgress} />
          <WeeklyActivityChart weeklyData={somaticProgress.weeklySessions} />
        </div>
      </MinimalDisclosureBox>

      {/* 6. Supportive Moments (3 initially + More (+3)) */}
      <MinimalDisclosureBox
        title={tr('רגעים שתמכו בי בדרך', 'Supportive Moments')}
        isOpen={openSection === 'moments'}
        onToggle={() => toggleSection('moments')}
        onInfoClick={() => openGuideTopic('GUIDE_APP_OVERVIEW')}
        accentColor="#0F766E"
        footerActions={renderSectionFooter()}
      >
        <form onSubmit={handleAddSupportMoment} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={newMomentText}
            onChange={(e) => setNewMomentText(e.target.value)}
            placeholder={tr('הוסף רגע קטן שתמך בך...', 'Add a small supportive moment...')}
            className="flex-1 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3.5 py-2 text-sm text-[#1E293B] focus:border-[#0F766E] focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newMomentText.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0F766E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D5F58] disabled:opacity-45 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{tr('הוסף', 'Add')}</span>
          </button>
        </form>

        <div className="space-y-2">
          {personalJourney.supportMoments.slice(0, momentsVisible).map((moment) => (
            <div
              key={moment.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3"
            >
              <div className="flex items-start gap-2 min-w-0">
                <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-[#0F766E]" />
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-[#2A82C5]">{moment.dateStr}</div>
                  <p className="text-xs leading-relaxed text-[#1E293B]">{moment.text}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSupportMoment(moment.id)}
                className="shrink-0 rounded-lg p-1 text-[#94A3B8] hover:bg-red-50 hover:text-red-600"
                aria-label={tr('הסר', 'Remove')}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {momentsVisible < personalJourney.supportMoments.length && (
          <button
            type="button"
            onClick={() =>
              setMomentsVisible((c) => Math.min(personalJourney.supportMoments.length, c + 3))
            }
            className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-[#0F766E]/45 py-2 text-xs font-semibold text-[#0F766E] hover:bg-teal-50/40"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{tr('עוד (+3)', 'More (+3)')}</span>
          </button>
        )}
      </MinimalDisclosureBox>

      {/* Always-Visible Step Navigation Bar */}
      <div className="sticky bottom-16 z-20 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#DCE8F5] bg-white/95 p-3 shadow-sm backdrop-blur-xs lg:bottom-4">
        <button
          type="button"
          onClick={handleNextSection}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#4F46E5]/35 bg-[#F0F7FF] px-3.5 py-2 text-xs font-semibold text-[#3730A3] hover:bg-[#DCE8F5]/70 whitespace-nowrap"
        >
          <span>{tr('המשך לנושא הבא', 'Continue to Next')}</span>
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D5F58] whitespace-nowrap"
        >
          <Home className="h-3.5 w-3.5" />
          <span>{tr('סיים וחזור לראשי', 'Finish & Home')}</span>
        </button>
      </div>
    </div>
  );
};
