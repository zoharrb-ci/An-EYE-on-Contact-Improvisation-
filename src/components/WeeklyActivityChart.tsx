import React from 'react';
import { DaySessionData } from '../types/contactWays';
import { useContactWays } from '../context/ContactWaysContext';

export const WeeklyActivityChart: React.FC<{ weeklyData: DaySessionData[] }> = ({
  weeklyData,
}) => {
  const { language, tr } = useContactWays();
  const activeDays = weeklyData.filter((d) => d.hours > 0).length;
  const maxHours = Math.max(2.5, ...weeklyData.map((d) => d.hours));

  return (
    <div className="rounded-2xl border border-[#DCE8F5] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#1E293B]">
            {tr('מקצב תנועה ונשימה בשבוע האחרון', 'Recent Movement & Breath Rhythm')}
          </h3>
          <p className="mt-0.5 text-xs text-[#475569]">
            {tr(
              `${activeDays} ימים של שהייה, הקשבה או ג׳אם השבוע`,
              `${activeDays} mindful movement or breathing moments this week`,
            )}
          </p>
        </div>
      </div>

      <div className="mt-5 grid h-36 grid-cols-7 items-end gap-2.5">
        {weeklyData.map((day, idx) => {
          const pct = Math.max(8, Math.round((day.hours / maxHours) * 100));
          const isPresent = day.hours > 0;
          return (
            <div key={idx} className="flex h-full flex-col items-center justify-end gap-1.5">
              <span className="text-[11px] font-medium text-[#475569]">
                {isPresent ? (language === 'he' ? 'נכח/תי' : 'Moved') : '·'}
              </span>
              <div className="flex w-full flex-1 items-end justify-center">
                <div
                  className="w-full max-w-[30px] rounded-t-xl transition-all duration-200"
                  style={{
                    height: `${isPresent ? pct : 8}%`,
                    background: !isPresent
                      ? '#E2E8F0'
                      : 'linear-gradient(180deg, #4EB8A6 0%, #2A82C5 100%)',
                  }}
                  title={`${language === 'he' ? day.dayLabel : day.dayLabelEn}: ${day.hours}h`}
                />
              </div>
              <span className="text-xs font-medium text-[#475569]">
                {language === 'he' ? day.dayLabel : day.dayLabelEn}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
