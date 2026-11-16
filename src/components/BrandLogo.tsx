import React, { useState } from 'react';
import { BRAND_LOGO_DATA_URI } from '../assets/brandLogo';

interface BrandLogoProps {
  alt?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  alt = 'Contact Ways Logo',
  className = 'h-9 w-9 object-contain',
}) => {
  const [stage, setStage] = useState<'data' | 'file' | 'svg'>('data');

  if (stage === 'svg') {
    return (
      <svg
        viewBox="0 0 120 120"
        role="img"
        aria-label={alt}
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dynamic fluid spiral & two dancers in weight-sharing contact */}
        <circle cx="48" cy="24" r="8" fill="#1D70B8" />
        <circle cx="76" cy="30" r="7.5" fill="#F36523" />
        <path
          d="M28 62C30 40 48 32 64 42C76 50 74 68 58 78C44 86 28 80 24 68"
          stroke="#1D70B8"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M92 54C88 38 70 36 58 48C46 60 52 78 70 84C84 88 96 78 96 64"
          stroke="#F36523"
          strokeWidth="8.5"
          strokeLinecap="round"
        />
        <text
          x="60"
          y="110"
          textAnchor="middle"
          fill="#1E293B"
          fontFamily="Rubik, sans-serif"
          fontWeight="800"
          fontSize="24"
        >
          c-i
        </text>
      </svg>
    );
  }

  const src =
    stage === 'data'
      ? BRAND_LOGO_DATA_URI
      : `${import.meta.env.BASE_URL}assets/ci_logo_frameless.png`;

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setStage((prev) => (prev === 'data' ? 'file' : 'svg'))}
      className={className}
    />
  );
};

/**
 * Small emblem icon representing the 5-Axis Presence Radar Map ("לוגו קטן של מפת הצירים")
 */
export const MiniAxesMapLogo: React.FC<{ className?: string }> = ({
  className = 'h-4 w-4 shrink-0',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Outer 5-axis pentagon */}
    <polygon
      points="12,2.2 21.3,9 17.8,19.8 6.2,19.8 2.7,9"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.1"
    />
    {/* Inner Flow balance ring */}
    <polygon
      points="12,6.5 17.2,10.3 15.2,16.4 8.8,16.4 6.8,10.3"
      stroke="#0F766E"
      strokeWidth="1.3"
      strokeDasharray="2 1.5"
      fill="#10B981"
      fillOpacity="0.18"
    />
    {/* 5 Axis spokes from center */}
    <line x1="12" y1="12" x2="12" y2="2.2" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.65" />
    <line x1="12" y1="12" x2="21.3" y2="9" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.65" />
    <line x1="12" y1="12" x2="17.8" y2="19.8" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.65" />
    <line x1="12" y1="12" x2="6.2" y2="19.8" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.65" />
    <line x1="12" y1="12" x2="2.7" y2="9" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.65" />
    {/* 5 Vertex dots */}
    <circle cx="12" cy="2.2" r="1.5" fill="#2A82C5" />
    <circle cx="21.3" cy="9" r="1.5" fill="#0F766E" />
    <circle cx="17.8" cy="19.8" r="1.5" fill="#F36523" />
    <circle cx="6.2" cy="19.8" r="1.5" fill="#7C3AED" />
    <circle cx="2.7" cy="9" r="1.5" fill="#D97706" />
  </svg>
);
