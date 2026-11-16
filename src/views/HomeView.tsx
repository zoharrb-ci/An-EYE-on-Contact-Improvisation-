import React, { useEffect, useState } from 'react';
import { Info, PlusCircle } from 'lucide-react';
import { useContactWays } from '../context/ContactWaysContext';
import { BrandLogo } from '../components/BrandLogo';

interface HereAndNowQuote {
  titleHe: string;
  titleEn: string;
  quoteHe: string;
  quoteEn: string;
}

const HERE_AND_NOW_QUOTES: HereAndNowQuote[] = [
  {
    titleHe: 'כבידה ונשיפה',
    titleEn: 'Gravity & Exhale',
    quoteHe: 'הקרקע כבר מחזיקה אותך — אפשר לתת לכתפיים להרפות אל תוך המשקל.',
    quoteEn: 'The floor already holds you — let the shoulders soften into gravity.',
  },
  {
    titleHe: 'הריקוד הקטן (Small Dance)',
    titleEn: 'The Small Dance',
    quoteHe: 'גם בעמידה שקטה הגוף רוקד מיקרו-תנועות של איזון — אין צורך להוסיף מאמץ.',
    quoteEn: 'Even in quiet standing, micro-adjustments are already dancing without effort.',
  },
  {
    titleHe: 'חישת העור 360°',
    titleEn: '360° Skin Listening',
    quoteHe: 'נקודת המגע אינה שולטת ואינה נעלמת — היא רק מקשיבה לכל הכיוונים בו־זמנית.',
    quoteEn: 'The point of contact neither steers nor vanishes — it simply listens in every direction.',
  },
  {
    titleHe: 'רגע (מתוך קילוף התפוז)',
    titleEn: 'Rega — Quiet Pause',
    quoteHe: 'בין קבלת המגע לתגובה יש מרחב של נשימה; שם נולדת בחירה חופשית.',
    quoteEn: 'Between receiving touch and answering it lives a breath; that is where choice begins.',
  },
  {
    titleHe: 'שני הנהרות ובהירות',
    titleEn: 'Two Rivers & Clarity',
    quoteHe: 'גבול ברור ועדין הוא הזמנה לאמון עמוק יותר — הן לעצמך והן לפרטנר.',
    quoteEn: 'A clear, gentle boundary is an invitation to deeper trust for both partners.',
  },
  {
    titleHe: 'סקרנות על פני ביצוע',
    titleEn: 'Curiosity Over Performance',
    quoteHe: 'כשאין יעד להרשים אליו, התנועה מוצאת את הכנות והחיוניות הפשוטות שלה.',
    quoteEn: 'When there is nothing to prove, movement finds its simplest honesty.',
  },
  {
    titleHe: 'שלום — חזרה אל המרכז',
    titleEn: 'Shalom — Return to Center',
    quoteHe: 'תמיד מותר להאט, לפגוש את הקרקע מחדש, ולהתחיל מתוך שקט נעים.',
    quoteEn: 'You may always slow down, meet the ground again, and begin from quiet ease.',
  },
  {
    titleHe: 'הפסקת הסתרה והחזקה',
    titleEn: 'Unwinding Effort',
    quoteHe: 'מקומות שבהם מתעוררת החזקה מבקשים סקרנות רכה, לא תיקון מהיר.',
    quoteEn: 'Places of holding ask for gentle curiosity rather than a quick fix.',
  },
];

export const HomeView: React.FC = () => {
  const {
    setActiveTab,
    setReflectionModePreset,
    openGuideTopic,
    siteConfig,
    language,
    tr,
  } = useContactWays();

  const isHe = language === 'he';

  const [quoteIndex, setQuoteIndex] = useState<number>(
    () => Math.floor(Date.now() / 60000) % HERE_AND_NOW_QUOTES.length,
  );

  // Rotate Here & Now quote cleanly once every 60 seconds
  useEffect(() => {
    const timer = window.setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % HERE_AND_NOW_QUOTES.length);
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const currentQuote = HERE_AND_NOW_QUOTES[quoteIndex] || HERE_AND_NOW_QUOTES[0];

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-11rem)] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center sm:py-20">
      {/* Large Enlarged Logo with Generous Breathing Space */}
      <div className="flex flex-col items-center gap-4">
        <BrandLogo
          alt={siteConfig.brandName || 'Eye-on-CI'}
          className="h-28 w-28 object-contain sm:h-36 sm:w-36"
        />
        <span className="font-display text-sm font-semibold tracking-wide text-[#475569]/80">
          {siteConfig.brandName}
        </span>
      </div>

      {/* Rotating Every-Minute "Here & Now" Topic + Soft Quote */}
      <div className="my-12 max-w-xl space-y-4 sm:my-16">
        <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#0F766E]">
          <span>{tr('כאן ועכשיו', 'Here & Now')}</span>
          <button
            type="button"
            onClick={() => openGuideTopic('GUIDE_APP_OVERVIEW')}
            aria-label={tr('מידע והסבר', 'Guide info')}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F0F7FF] hover:text-[#2A82C5]"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>

        <h1 className="font-display text-lg font-medium text-[#0F766E] sm:text-xl">
          {isHe ? currentQuote.titleHe : currentQuote.titleEn}
        </h1>

        <blockquote className="text-xl font-light italic leading-relaxed text-[#334155] sm:text-2xl">
          “{isHe ? currentQuote.quoteHe : currentQuote.quoteEn}”
        </blockquote>
      </div>

      {/* Calm Invitation to Add a Log */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setReflectionModePreset('quick');
            setActiveTab('reflection');
          }}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#F36523] px-7 py-3.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#D95316] whitespace-nowrap"
        >
          <PlusCircle className="h-4 w-4" />
          <span>{tr('הזמנה להוספת תיעוד', 'Add Movement Reflection')}</span>
        </button>
      </div>
    </div>
  );
};
