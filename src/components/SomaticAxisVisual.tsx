import React from 'react';
import { SomaticAxisType } from '../types/contactWays';
import { mapLegacyAxisToV2 } from '../data/seedData';

export const SomaticAxisVisual: React.FC<{
  axisType: SomaticAxisType;
  size?: number;
}> = ({ axisType, size = 40 }) => {
  const canonical = mapLegacyAxisToV2(axisType);
  const teal = '#0F766E';
  const softTeal = '#4EB8A6';
  const blue = '#2A82C5';
  const orange = '#F36523';
  const amber = '#D97706';
  const indigo = '#4F46E5';
  const violet = '#7C3AED';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      className="shrink-0 rounded-xl border border-[#E2ECF7] bg-[#FBFDFF]"
    >
      {/* Subtle Clean Floor Line */}
      <line x1="10" y1="46" x2="46" y2="46" stroke="#DCE8F5" strokeWidth="2" strokeLinecap="round" />

      {canonical === 'mechanics' && (
        <>
          {/* Mutual counterbalance arch & skeletal tensegrity */}
          <circle cx="28" cy="24" r="11" fill={softTeal} fillOpacity="0.14" />
          <circle cx="19" cy="16" r="4.2" fill="#FCE0C8" stroke={blue} strokeWidth="2" />
          <path
            d="M20 21 C24 26, 25 33, 18 44 M22 24 L29 22"
            stroke={blue}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <circle cx="36" cy="14" r="4.2" fill="#FCE0C8" stroke={orange} strokeWidth="2" />
          <path
            d="M35 19 C30 23, 28 29, 39 36 M32 22 L25 25"
            stroke={orange}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <circle cx="28" cy="23" r="2.8" fill={orange} />
        </>
      )}

      {canonical === 'perception' && (
        <>
          {/* 360-degree skin & Soft Focus panoramic listening */}
          <circle
            cx="28"
            cy="26"
            r="14"
            stroke={softTeal}
            strokeWidth="1.8"
            strokeDasharray="3 3"
          />
          <circle cx="23" cy="17" r="4" fill="#FCE0C8" stroke={blue} strokeWidth="2" />
          <path
            d="M23 22 C24 29, 24 35, 21 43 M24 25 L30 25"
            stroke={blue}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx="34" cy="18" r="4" fill="#FCE0C8" stroke={orange} strokeWidth="2" />
          <path
            d="M34 23 C32 30, 32 35, 35 43"
            stroke={orange}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx="28" cy="25" r="2.8" fill={blue} />
        </>
      )}

      {canonical === 'behavior' && (
        <>
          {/* LMA Effort/Shape spiral arc & Small Dance upright poise */}
          <path
            d="M14 16 C25 14, 29 31, 42 36"
            stroke={indigo}
            strokeWidth="2.4"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />
          <ellipse cx="26" cy="45" rx="12" ry="2.2" fill={softTeal} fillOpacity="0.25" />
          <circle cx="22" cy="18" r="4" fill="#FCE0C8" stroke={teal} strokeWidth="2" />
          <path
            d="M22 23 C24 29, 25 36, 20 44 M23 26 L31 24"
            stroke={teal}
            strokeWidth="3.3"
            strokeLinecap="round"
          />
          <circle cx="36" cy="22" r="3.8" fill="#FCE0C8" stroke={indigo} strokeWidth="2" />
          <path
            d="M35 27 C33 32, 33 38, 37 44"
            stroke={indigo}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </>
      )}

      {canonical === 'emotion' && (
        <>
          {/* Warm empathetic resonance & peaceful self-anchor ("Keluf") */}
          <circle cx="28" cy="25" r="11" fill={violet} fillOpacity="0.12" />
          <circle cx="22" cy="16" r="4" fill="#FCE0C8" stroke={violet} strokeWidth="2" />
          <path
            d="M22 21 C23 28, 23 35, 20 44 M23 25 L27 27"
            stroke={violet}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx="34" cy="16" r="4" fill="#FCE0C8" stroke={orange} strokeWidth="2" />
          <path
            d="M34 21 C33 28, 33 35, 36 44 M33 25 L29 27"
            stroke={orange}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx="28" cy="26" r="2.7" fill={violet} />
        </>
      )}

      {canonical === 'ethics' && (
        <>
          {/* Two Rivers: autonomous grounded clarity & clear door handle */}
          <path
            d="M28 11 C26 22, 30 33, 28 44"
            stroke="#94A3B8"
            strokeWidth="1.8"
            strokeDasharray="3 3"
            strokeLinecap="round"
          />
          <circle cx="17" cy="16" r="4" fill="#FCE0C8" stroke={indigo} strokeWidth="2" />
          <path
            d="M17 21 L17 34 L14 44 M17 34 L21 44 M17 25 L23 23"
            stroke={indigo}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="39" cy="16" r="4" fill="#FCE0C8" stroke={amber} strokeWidth="2" />
          <path
            d="M39 21 L39 34 L35 44 M39 34 L42 44 M39 25 L33 23"
            stroke={amber}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
};
