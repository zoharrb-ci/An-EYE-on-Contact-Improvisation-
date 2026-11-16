import React from 'react';
import { Info } from 'lucide-react';
import {
  DEFAULT_AXIS_BALANCES,
  SOMATIC_AXES,
  getAxisShortLabel,
} from '../data/seedData';
import { getAxisPoleFeedback } from '../data/matrixData';
import { useContactWays } from '../context/ContactWaysContext';
import { AxisBalances, SomaticProgress } from '../types/contactWays';

interface SomaticRadarChartProps {
  progress?: SomaticProgress;
  /** Optional -5..+5 tri-polar axis balances for live preview in New Reflection */
  liveAxisBalances?: AxisBalances;
  compact?: boolean;
}

export const SomaticRadarChart: React.FC<SomaticRadarChartProps> = ({
  progress,
  liveAxisBalances,
  compact = false,
}) => {
  const { language, tr, openGuideTopic } = useContactWays();

  const sourceBalances = liveAxisBalances || progress?.axisBalances || DEFAULT_AXIS_BALANCES;

  const balances = SOMATIC_AXES.map((axis) => {
    const raw = sourceBalances[axis.type] ?? 0;
    return Math.max(-5, Math.min(5, raw));
  });

  // Map -5..+5 -> 0.28 (Under inner ring), 0 -> 0.64 (Flow golden ring), +5 -> 1.0 (Over outer ring)
  const balanceToFactor = (val: number) => 0.28 + ((val + 5) / 10) * 0.72;

  const cx = 160;
  const cy = 152;
  const radius = compact ? 82 : 94;
  const ringUnder = 0.28;
  const ringFlow = 0.64;
  const ringOver = 1.0;

  const getPoint = (index: number, factor: number) => {
    const angle = -Math.PI / 2 + (index * (2 * Math.PI)) / 5;
    return {
      x: cx + Math.cos(angle) * radius * factor,
      y: cy + Math.sin(angle) * radius * factor,
    };
  };

  const makePentagon = (factor: number) =>
    SOMATIC_AXES.map((_, i) => {
      const p = getPoint(i, factor);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');

  const polygonPoints = balances
    .map((val, i) => {
      const pt = getPoint(i, balanceToFactor(val));
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="rounded-2xl border border-[#DCE8F5] bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-[#1E293B]">
            {liveAxisBalances
              ? tr('מצפן הוויסות בסשן זה (5 צירים)', 'Session Regulation Compass (5 Axes)')
              : tr('מפת הנוכחות כאן ועכשיו (Under ↔ Flow ↔ Over)', 'Here & Now Presence Map')}
          </h3>
          <p className="text-xs text-[#475569]">
            {tr(
              'הטבעת המודגשת באמצע מייצגת איזון וזרימת Flow · פנים = Under · חוץ = Over',
              'Highlighted middle ring = Integrative Flow · Inner = Under · Outer = Over',
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            openGuideTopic(liveAxisBalances ? 'GUIDE_TRACKING_TYPES' : 'GUIDE_APP_OVERVIEW')
          }
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#DCE8F5] bg-[#F0F7FF] px-2.5 py-1 text-xs font-medium text-[#2A82C5] hover:bg-[#DCE8F5]/50 whitespace-nowrap"
        >
          <Info className="h-3.5 w-3.5" />
          {tr('הסבר', 'Guide')}
        </button>
      </div>

      <div className="mt-3 flex justify-center">
        <svg viewBox="0 0 320 304" className="h-auto w-full max-w-[320px]">
          <defs>
            <linearGradient id="radarFillV2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4EB8A6" stopOpacity="0.28" />
              <stop offset="55%" stopColor="#2A82C5" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.26" />
            </linearGradient>
          </defs>

          {/* Outer Over Ring */}
          <polygon
            points={makePentagon(ringOver)}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Middle Highlighted Flow Golden Ring */}
          <polygon
            points={makePentagon(ringFlow)}
            fill="#0F766E"
            fillOpacity="0.04"
            stroke="#0F766E"
            strokeOpacity="0.55"
            strokeWidth="1.8"
          />

          {/* Inner Under Ring */}
          <polygon
            points={makePentagon(ringUnder)}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* 5 Axis Spokes */}
          {SOMATIC_AXES.map((axis, i) => {
            const outer = getPoint(i, 1);
            return (
              <line
                key={axis.type}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke="#DCE8F5"
                strokeWidth="1"
              />
            );
          })}

          {/* Data Polygon */}
          <polygon
            points={polygonPoints}
            fill="url(#radarFillV2)"
            stroke="#4F46E5"
            strokeWidth="2.2"
            strokeLinejoin="round"
            style={{ transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          />

          {/* Vertices & Labels */}
          {SOMATIC_AXES.map((axis, i) => {
            const pt = getPoint(i, balanceToFactor(balances[i]));
            const labelPt = getPoint(i, 1.24);
            const shortLabel = getAxisShortLabel(axis.type, language);
            return (
              <g key={axis.type}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill={axis.accentColor}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
                <text
                  x={labelPt.x}
                  y={labelPt.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#1E293B"
                  fontSize="11"
                  fontWeight="600"
                >
                  {shortLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Soft Qualitative Axis Summary Grid (zero numbers or percentages) */}
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SOMATIC_AXES.map((axis, idx) => {
          const pole = getAxisPoleFeedback(axis.type, balances[idx], language);
          return (
            <div
              key={axis.type}
              className="flex flex-col gap-0.5 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2"
            >
              <button
                type="button"
                onClick={() => openGuideTopic(axis.guideTopicId)}
                className="flex items-center justify-between gap-1 text-start text-xs font-semibold text-[#1E293B] hover:text-[#2A82C5]"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: axis.accentColor }}
                  />
                  <span className="truncate">{getAxisShortLabel(axis.type, language)}</span>
                </span>
                <Info className="h-3 w-3 shrink-0 text-[#94A3B8]" />
              </button>
              <span className="text-[11px] font-medium text-[#0F766E]">{pole.label}</span>
              <span className="line-clamp-1 text-[11px] text-[#475569]">{pole.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
