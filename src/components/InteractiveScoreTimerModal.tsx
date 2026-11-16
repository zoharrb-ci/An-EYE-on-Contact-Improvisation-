import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flower2,
  Hand,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useContactWays } from '../context/ContactWaysContext';
import { getGuidedScoreForTone } from '../data/matrixData';
import { getAxisShortLabel } from '../data/seedData';

function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export const InteractiveScoreTimerModal: React.FC = () => {
  const {
    activeScoreId,
    activeScoreTone,
    closeScoreTimer,
    personalJourney,
    setReflectionModePreset,
    setActiveTab,
    language,
    tr,
  } = useContactWays();

  const isHe = language === 'he';
  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(45);
  const [isRunning, setIsRunning] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [inhaling, setInhaling] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const scoreConfig = useMemo(() => {
    if (!activeScoreId) return null;
    return getGuidedScoreForTone(
      activeScoreId,
      activeScoreTone || personalJourney.hereAndNowTone,
    );
  }, [activeScoreId, activeScoreTone, personalJourney.hereAndNowTone]);

  const playSoftBell = useCallback(
    (doubleStrike = false) => {
      if (isMuted) return;
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }

        const triggerTone = (offsetSec: number, freq: number) => {
          const t0 = ctx.currentTime + offsetSec;
          const oscPrimary = ctx.createOscillator();
          const oscHarmonic = ctx.createOscillator();
          const gain = ctx.createGain();

          oscPrimary.type = 'sine';
          oscPrimary.frequency.setValueAtTime(freq, t0);

          oscHarmonic.type = 'sine';
          oscHarmonic.frequency.setValueAtTime(freq * 1.5, t0);

          const harmonicGain = ctx.createGain();
          harmonicGain.gain.setValueAtTime(0.28, t0);

          gain.gain.setValueAtTime(0.0001, t0);
          gain.gain.exponentialRampToValueAtTime(0.11, t0 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.55);

          oscPrimary.connect(gain);
          oscHarmonic.connect(harmonicGain);
          harmonicGain.connect(gain);
          gain.connect(ctx.destination);

          oscPrimary.start(t0);
          oscHarmonic.start(t0);
          oscPrimary.stop(t0 + 1.6);
          oscHarmonic.stop(t0 + 1.6);
        };

        triggerTone(0, 528);
        if (doubleStrike) {
          triggerTone(0.45, 660);
        }
      } catch {
        // Ignore audio restrictions if browser blocks autoplay
      }
    },
    [isMuted],
  );

  // Reset state whenever a new score opens
  useEffect(() => {
    if (!scoreConfig) return;
    setStepIndex(0);
    setSecondsLeft(scoreConfig.steps[0]?.durationSec ?? 45);
    setIsRunning(true);
    setIsCompleted(false);
    setInhaling(true);
    playSoftBell(false);
    // Intentionally reset only when scoreId / tone opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScoreId, activeScoreTone]);

  // Breathing pulse cycle
  useEffect(() => {
    if (!scoreConfig?.hasBreathingGuide || !activeScoreId) return;
    const interval = window.setInterval(() => {
      setInhaling((prev) => !prev);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [activeScoreId, scoreConfig?.hasBreathingGuide]);

  // Close on Escape
  useEffect(() => {
    if (!activeScoreId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeScoreTimer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeScoreId, closeScoreTimer]);

  // Step Countdown Timer
  useEffect(() => {
    if (!scoreConfig || !isRunning || isCompleted) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (stepIndex < scoreConfig.steps.length - 1) {
            const nextIdx = stepIndex + 1;
            setStepIndex(nextIdx);
            playSoftBell(false);
            return scoreConfig.steps[nextIdx]?.durationSec ?? 45;
          }
          setIsRunning(false);
          setIsCompleted(true);
          playSoftBell(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isCompleted, isRunning, playSoftBell, scoreConfig, stepIndex]);

  if (!activeScoreId || !scoreConfig) return null;

  const steps = scoreConfig.steps;
  const activeStep = steps[stepIndex] || steps[0];
  const totalSec = steps.reduce((sum, s) => sum + s.durationSec, 0);
  const completedSec =
    steps.slice(0, stepIndex).reduce((sum, s) => sum + s.durationSec, 0) +
    Math.max(0, (activeStep?.durationSec ?? 0) - secondsLeft);
  const progressPct = totalSec > 0 ? Math.min(100, Math.round((completedSec / totalSec) * 100)) : 0;

  const goToStep = (idx: number) => {
    const safeIdx = Math.max(0, Math.min(steps.length - 1, idx));
    setStepIndex(safeIdx);
    setSecondsLeft(steps[safeIdx]?.durationSec ?? 45);
    setIsCompleted(false);
    playSoftBell(false);
  };

  const resetScore = () => {
    setStepIndex(0);
    setSecondsLeft(steps[0]?.durationSec ?? 45);
    setIsCompleted(false);
    setIsRunning(false);
  };

  const openDeepClinicLog = () => {
    closeScoreTimer();
    setReflectionModePreset('deep');
    setActiveTab('reflection');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={isHe ? scoreConfig.titleHe : scoreConfig.titleEn}
      onClick={closeScoreTimer}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#DCE8F5] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#DCE8F5] bg-[#FBFDFF] px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#475569]">
              <span
                className="inline-flex items-center gap-1 font-semibold"
                style={{ color: scoreConfig.accentColor }}
              >
                <Flower2 className="h-3.5 w-3.5" />
                {getAxisShortLabel(scoreConfig.axisId, language)}
              </span>
              <span aria-hidden="true">·</span>
              <span>{isHe ? scoreConfig.authorHe : scoreConfig.authorEn}</span>
            </div>
            <h2 className="font-display mt-1 text-base font-bold text-[#1E293B] sm:text-lg">
              {isHe ? scoreConfig.titleHe : scoreConfig.titleEn}
            </h2>
            <p className="mt-0.5 text-xs text-[#475569]">
              {isHe ? scoreConfig.subtitleHe : scoreConfig.subtitleEn}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMuted((m) => !m)}
              className={`flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition-colors whitespace-nowrap ${
                isMuted
                  ? 'border-[#DCE8F5] bg-white text-[#64748B]'
                  : 'border-[#4EB8A6]/40 bg-[#4EB8A6]/10 text-[#0F766E]'
              }`}
              aria-label={isMuted ? tr('הפעל צליל פעמון', 'Unmute chime') : tr('השתק פעמון', 'Mute chime')}
              title={isMuted ? tr('הפעל צליל פעמון', 'Unmute chime') : tr('השתק פעמון', 'Mute chime')}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">
                {isMuted ? tr('מושתק', 'Muted') : tr('פעמון רך', 'Bell')}
              </span>
            </button>

            <button
              type="button"
              onClick={closeScoreTimer}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE8F5] bg-white text-[#475569] hover:bg-[#F0F7FF]"
              aria-label={tr('סגור', 'Close')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Interactive Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Clinic 20-Min Phase Strip */}
          {scoreConfig.isClinic20Min && (
            <div className="grid grid-cols-3 gap-2">
              {steps.map((st, idx) => {
                const active = idx === stepIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goToStep(idx)}
                    className={`rounded-xl border px-3 py-2 text-start text-xs transition-colors ${
                      active
                        ? 'border-[#6D28D9] bg-[#6D28D9]/8 font-semibold text-[#5B21B6]'
                        : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#475569] hover:bg-[#F0F7FF]'
                    }`}
                  >
                    <div className="font-mono-tabular text-[11px] opacity-80">
                      {Math.round(st.durationSec / 60)} {tr('דק׳', 'min')}
                    </div>
                    <div className="mt-0.5 truncate">
                      {idx === 0
                        ? tr('שאלה וחוזה', 'Contract')
                        : idx === 1
                          ? tr('חקירת גוף', 'Inquiry')
                          : tr('אינטגרציה', 'Integrate')}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Interactive Two Rivers 3-Signal Selector */}
          {scoreConfig.isTwoRiversInteractive && (
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                {
                  idx: 0,
                  color: '#059669',
                  labelHe: 'יד פתוחה — כן / העמק',
                  labelEn: 'Open Palm — Yes / Deepen',
                  iconDescHe: 'אמון, קבלה ונדיבות הדדית',
                  iconDescEn: 'Inviting clear contact & weight',
                },
                {
                  idx: 1,
                  color: '#D97706',
                  labelHe: 'הרמת אמה — המתן / האט',
                  labelEn: 'Raised Forearm — Slow / Wait',
                  iconDescHe: 'קצב נשימה והשהיית מעבר',
                  iconDescEn: 'Modulate speed cleanly',
                },
                {
                  idx: 2,
                  color: '#DC2626',
                  labelHe: 'כף יד מושטת — לא / עצור',
                  labelEn: 'Extended Palm — No / Stop',
                  iconDescHe: 'עצירה בטוחה עם הוקרה',
                  iconDescEn: 'Clear boundary & respectful exit',
                },
              ].map((sig) => {
                const active = stepIndex === sig.idx;
                return (
                  <button
                    key={sig.idx}
                    type="button"
                    onClick={() => goToStep(sig.idx)}
                    style={
                      active
                        ? { borderColor: sig.color, backgroundColor: `${sig.color}12` }
                        : undefined
                    }
                    className={`rounded-xl border p-3 text-start transition-colors ${
                      active
                        ? 'font-semibold'
                        : 'border-[#DCE8F5] bg-[#FBFDFF] hover:bg-[#F0F7FF]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: sig.color }}>
                      <Hand className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{isHe ? sig.labelHe : sig.labelEn}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#475569]">
                      {isHe ? sig.iconDescHe : sig.iconDescEn}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Central Timer & Visual Anchor */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#DCE8F5] bg-[#FBFDFF] p-5 text-center">
            {scoreConfig.hasBreathingGuide ? (
              <div className="relative flex h-36 w-36 items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full transition-transform duration-[4000ms] ease-in-out"
                  style={{
                    transform: inhaling ? 'scale(1.12)' : 'scale(0.84)',
                    background: `radial-gradient(circle, ${scoreConfig.accentColor}38 0%, rgba(79,70,229,0.10) 68%, transparent 100%)`,
                  }}
                />
                <div
                  className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full border bg-white/85"
                  style={{ borderColor: `${scoreConfig.accentColor}55` }}
                >
                  <span
                    className="font-mono-tabular text-xl font-bold"
                    style={{ color: scoreConfig.accentColor }}
                  >
                    {formatClock(secondsLeft)}
                  </span>
                  <span className="text-[11px] font-medium text-[#475569]">
                    {isCompleted
                      ? tr('הושלם', 'Done')
                      : inhaling
                        ? tr('שאיפה', 'Inhale')
                        : tr('נשיפה', 'Exhale')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 py-2">
                <Clock className="h-6 w-6" style={{ color: scoreConfig.accentColor }} />
                <span
                  className="font-mono-tabular text-3xl font-extrabold"
                  style={{ color: scoreConfig.accentColor }}
                >
                  {formatClock(secondsLeft)}
                </span>
              </div>
            )}

            {/* Total Progress Bar */}
            <div className="mt-4 w-full max-w-sm">
              <div className="flex items-center justify-between text-[11px] font-medium text-[#475569]">
                <span className="font-mono-tabular">
                  {tr(`פעימה ${stepIndex + 1} מתוך ${steps.length}`, `Step ${stepIndex + 1} of ${steps.length}`)}
                </span>
                <span className="font-mono-tabular">
                  {formatClock(completedSec)} / {formatClock(totalSec)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#DCE8F5]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%`, backgroundColor: scoreConfig.accentColor }}
                />
              </div>
            </div>
          </div>

          {/* Active Step Card */}
          <div className="rounded-xl border border-[#DCE8F5] bg-white p-4">
            <h3 className="text-sm font-semibold text-[#1E293B]">
              {isHe ? activeStep.titleHe : activeStep.titleEn}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#334155]">
              {isHe ? activeStep.instructionHe : activeStep.instructionEn}
            </p>
            {(isHe ? activeStep.cuePromptHe : activeStep.cuePromptEn) && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#F0F7FF] p-3 text-xs text-[#1E293B]">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4F46E5]" />
                <span>{isHe ? activeStep.cuePromptHe : activeStep.cuePromptEn}</span>
              </div>
            )}
          </div>

          {isCompleted && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>
                  {tr('זמן התרגול הושלם — קחו נשימה של הטמעה.', 'Score time complete — pause to integrate.')}
                </span>
              </div>
              {scoreConfig.isClinic20Min && (
                <button
                  type="button"
                  onClick={openDeepClinicLog}
                  className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 whitespace-nowrap"
                >
                  {tr('תעד במרפאה', 'Log Clinic')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#DCE8F5] bg-[#FBFDFF] px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsRunning((r) => !r)}
              style={{ backgroundColor: scoreConfig.accentColor }}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white hover:opacity-90 whitespace-nowrap"
            >
              {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isRunning ? tr('השהה', 'Pause') : tr('הפעל', 'Start')}</span>
            </button>

            <button
              type="button"
              onClick={resetScore}
              className="inline-flex items-center gap-1 rounded-xl border border-[#DCE8F5] bg-white px-3 py-2 text-xs font-medium text-[#475569] hover:bg-[#F0F7FF] whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{tr('אפס', 'Reset')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={stepIndex === 0}
              onClick={() => goToStep(stepIndex - 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-[#DCE8F5] bg-white px-3 py-2 text-xs font-medium text-[#475569] hover:bg-[#F0F7FF] disabled:opacity-40 whitespace-nowrap"
            >
              <ChevronRight className="h-3.5 w-3.5 ltr:rotate-180" />
              <span>{tr('הקודם', 'Prev')}</span>
            </button>

            {stepIndex < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => goToStep(stepIndex + 1)}
                className="inline-flex items-center gap-1 rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3730A3] whitespace-nowrap"
              >
                <span>{tr('השלב הבא', 'Next')}</span>
                <ChevronLeft className="h-3.5 w-3.5 ltr:rotate-180" />
              </button>
            ) : (
              <button
                type="button"
                onClick={closeScoreTimer}
                className="rounded-xl bg-[#059669] px-4 py-2 text-xs font-semibold text-white hover:bg-[#047857] whitespace-nowrap"
              >
                {tr('סיום וחזרה', 'Finish')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
