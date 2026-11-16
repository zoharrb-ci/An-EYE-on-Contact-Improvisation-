import React from 'react';
import { Check, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface MinimalDisclosureBoxProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  onInfoClick?: () => void;
  infoAriaLabel?: string;
  accentColor?: string;
  isDone?: boolean;
  children?: React.ReactNode;
  footerActions?: React.ReactNode;
  className?: string;
}

export const MinimalDisclosureBox: React.FC<MinimalDisclosureBoxProps> = ({
  title,
  isOpen,
  onToggle,
  onInfoClick,
  infoAriaLabel = 'מידע והסבר',
  accentColor = '#1E293B',
  isDone = false,
  children,
  footerActions,
  className = '',
}) => {
  return (
    <section
      className={`rounded-2xl border transition-colors ${
        isOpen ? 'border-[#2A82C5]/45 bg-white shadow-xs' : 'border-[#DCE8F5] bg-white hover:bg-[#FBFDFF]'
      } ${className}`}
    >
      <div className="flex min-h-[52px] items-center justify-between gap-2 px-4 py-2.5 sm:px-5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="flex min-h-[40px] min-w-0 flex-1 items-center gap-2.5 text-start"
        >
          {isDone && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[#0F766E]">
              <Check className="h-3.5 w-3.5" />
            </span>
          )}
          <span
            className="font-display truncate text-sm font-bold sm:text-base"
            style={{ color: isOpen ? accentColor : '#1E293B' }}
          >
            {title}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          {onInfoClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onInfoClick();
              }}
              aria-label={infoAriaLabel}
              title={infoAriaLabel}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#64748B] transition-colors hover:bg-[#F0F7FF] hover:text-[#2A82C5]"
            >
              <Info className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-label={title}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#64748B] transition-colors hover:bg-[#F0F7FF] hover:text-[#1E293B]"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-[#DCE8F5] px-4 py-4 sm:px-5 space-y-4">
          {children}
          {footerActions && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#DCE8F5] pt-3">
              {footerActions}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
