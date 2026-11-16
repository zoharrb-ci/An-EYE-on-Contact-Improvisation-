import React, { useState } from 'react';
import { Calendar, Clock, Layers, Sparkles, Trash2, UserCheck, X } from 'lucide-react';
import { MovementRecord } from '../types/contactWays';
import {
  SOMATIC_AXES,
  getAxisShortLabel,
  getPillarColor,
  getSoftBalanceLabel,
  normalizeRecordAxes,
} from '../data/seedData';
import { getAxisPoleFeedback, getMatrixParameterById } from '../data/matrixData';
import { useContactWays } from '../context/ContactWaysContext';

export const RecordDetailModal: React.FC<{
  record: MovementRecord;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}> = ({ record, onClose, onDelete }) => {
  const { language, tr } = useContactWays();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isHe = language === 'he';
  const normalizedBalances = normalizeRecordAxes(record);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(record.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#DCE8F5] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#DCE8F5] bg-[#FBFDFF] px-6 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#475569]">
              <span
                className="font-semibold"
                style={{ color: getPillarColor(record.pillarCategory) }}
              >
                {record.pillarCategory}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {record.dateStr}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-mono-tabular">
                <Clock className="h-3.5 w-3.5" />
                {record.durationMinutes} min
              </span>
              {record.reflectionMode && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 font-medium text-[#4F46E5]">
                    <Layers className="h-3.5 w-3.5" />
                    {record.reflectionMode === 'deep'
                      ? tr('אבחון עומק / מרפאה', 'Deep Matrix')
                      : tr('רפלקציה מהירה', 'Quick Log')}
                  </span>
                </>
              )}
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#1E293B]">{record.title}</h2>
            <p className="mt-0.5 text-xs text-[#475569]">
              {record.jamOrWorkshop} · {tr('שותף/ה:', 'Partner:')} {record.partner}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#DCE8F5] text-[#475569] hover:bg-[#F0F7FF]"
            aria-label={tr('סגור', 'Close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {/* 5 Tri-Polar Regulation Axes (Under <-> Flow <-> Over) */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold text-[#475569]">
                {tr('מפת הוויסות ב־5 צירים (Under ↔ Flow ↔ Over)', '5-Axis Regulation Map (Under ↔ Flow ↔ Over)')}
              </h3>
              <span className="text-[11px] text-[#0F766E]">
                {tr('נקודת אמצע = זרימת Flow', 'Center = Flow')}
              </span>
            </div>

            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
              {SOMATIC_AXES.map((axis) => {
                const val = normalizedBalances[axis.type];
                const pct = ((val + 5) / 10) * 100;
                const pole = getAxisPoleFeedback(axis.type, val, language);
                return (
                  <div key={axis.type} className="rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#1E293B]">
                        {getAxisShortLabel(axis.type, language)}
                      </span>
                      <span className="text-[11px] font-medium" style={{ color: axis.accentColor }}>
                        {getSoftBalanceLabel(val, language)}
                      </span>
                    </div>

                    {/* Tri-polar visual track with Flow center tick */}
                    <div className="relative mt-2.5 h-2 w-full rounded-full bg-[#E2ECF7]">
                      <div className="absolute inset-y-0 start-1/2 w-0.5 -translate-x-1/2 bg-[#0F766E]/45" />
                      <div
                        className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-xs"
                        style={{
                          left: `${Math.max(4, Math.min(96, pct))}%`,
                          backgroundColor: Math.abs(val) <= 1 ? '#0F766E' : axis.accentColor,
                        }}
                      />
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#64748B]">
                      <span>Under</span>
                      <span className="font-semibold text-[#0F766E]">Flow</span>
                      <span>Over</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-[#475569]">{pole.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Flagged Matrix Parameters (if any) */}
          {record.flaggedParameters && record.flaggedParameters.length > 0 && (
            <div>
              <h3 className="flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5]">
                <Sparkles className="h-3.5 w-3.5" />
                {tr(
                  `פרמטרים ממופים מהמטריצה (${record.flaggedParameters.length})`,
                  `Mapped Matrix Parameters (${record.flaggedParameters.length})`,
                )}
              </h3>
              <div className="mt-2 space-y-2">
                {record.flaggedParameters.map((fp) => {
                  const param = getMatrixParameterById(fp.paramId);
                  if (!param) return null;
                  const stateDesc =
                    fp.state === 'under'
                      ? param.underDesc
                      : fp.state === 'over'
                        ? param.overDesc
                        : param.flowDesc;
                  const stateLabel =
                    fp.state === 'under'
                      ? tr('תת-ויסות (Under)', 'Under')
                      : fp.state === 'over'
                        ? tr('יתר-ויסות (Over)', 'Over')
                        : tr('זרימה (Flow)', 'Flow');
                  const stateColor =
                    fp.state === 'flow'
                      ? '#0F766E'
                      : fp.state === 'under'
                        ? '#2A82C5'
                        : '#D97706';

                  return (
                    <div
                      key={fp.paramId}
                      className="rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3.5 py-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-[#1E293B]">
                          {isHe ? param.title.he : param.title.en}
                        </span>
                        <span className="font-semibold" style={{ color: stateColor }}>
                          {stateLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#475569]">
                        {isHe ? stateDesc.he : stateDesc.en}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Two Rivers, Keluf & Contact Points */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D97706]">
                <UserCheck className="h-4 w-4" />
                {tr('שני הנהרות וקילוף התפוז', 'Two Rivers & Keluf State')}
              </div>
              <p className="text-sm font-medium text-[#1E293B]">{record.twoRiversState}</p>
              {record.kelufState && (
                <p className="text-xs text-[#7C3AED]">
                  {tr('קילוף התפוז:', 'Orange Peeling:')} {record.kelufState}
                </p>
              )}
            </div>
            <div className="rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-4">
              <div className="text-xs font-semibold text-[#2A82C5]">
                {tr('נקודות מגע עיקריות', 'Contact Points')}
              </div>
              <p className="mt-1.5 text-sm text-[#1E293B]">{record.contactPoints.join(' · ')}</p>
            </div>
          </div>

          {/* Reflection Notes & Key Takeaway */}
          <div>
            <h3 className="text-xs font-semibold text-[#475569]">
              {tr('התבוננות ותיעוד תנועתי', 'Reflection Notes')}
            </h3>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-[#1E293B]">
              {record.reflectionNotes}
            </p>
          </div>

          <div className="rounded-xl border border-[#DCE8F5] bg-[#F0F7FF]/60 p-4">
            <div className="text-xs font-semibold text-[#4F46E5]">
              {tr('תובנת מפתח', 'Key Takeaway')}
            </div>
            <p className="mt-1 text-sm font-medium italic text-[#1E293B]">
              “{record.keyTakeaway}”
            </p>
          </div>

          {record.intentionCheckIn && (
            <div className="rounded-xl border border-[#DCE8F5] bg-teal-50/60 p-4">
              <div className="text-xs font-semibold text-[#0F766E]">
                {tr('צ׳ק-אין רך מול הכוונה הקרובה', 'Gentle Intention Check-In')}
              </div>
              <p className="mt-1 text-sm font-medium text-[#1E293B]">{record.intentionCheckIn}</p>
            </div>
          )}

          {record.somaticSensations.length > 0 && (
            <div className="text-xs text-[#475569]">
              <span className="font-semibold text-[#1E293B]">
                {tr('תחושות בגוף:', 'Somatic Sensations:')}{' '}
              </span>
              {record.somaticSensations.join(' · ')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#DCE8F5] bg-[#FBFDFF] px-6 py-3.5">
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {tr('מחק רשומה', 'Delete Record')}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-red-700">
                {tr('למחוק לצמיתות?', 'Delete permanently?')}
              </span>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
              >
                {tr('אשר מחיקה', 'Confirm')}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-[#DCE8F5] bg-white px-3 py-1 text-xs font-medium text-[#475569]"
              >
                {tr('ביטול', 'Cancel')}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#4F46E5] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#3730A3]"
          >
            {tr('סגור', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
