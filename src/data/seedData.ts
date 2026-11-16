import {
  AppLanguageCode,
  AxisBalances,
  AxisRegulationState,
  ConversationInquiry,
  CuriosityCard,
  DancerProfile,
  DaySessionData,
  HereAndNowTone,
  IntentionHorizon,
  MovementRecord,
  PersonalJourney,
  ProgressMilestone,
  RecurringParameterTrend,
  ReflectionAxisId,
  SiteContentConfig,
  SomaticAxisType,
  SomaticGuideTopic,
  SomaticGuideTopicId,
  SomaticProgress,
  SomaticRecommendation,
} from '../types/contactWays';
import { trLang } from '../i18n/languages';
import { getMatrixParameterById } from './matrixData';

export interface SomaticAxisMeta {
  type: ReflectionAxisId;
  titleHe: string;
  titleEn: string;
  shortLabelHe: string;
  shortLabelEn: string;
  subtitleHe: string;
  subtitleEn: string;
  underLabelHe: string;
  underLabelEn: string;
  flowLabelHe: string;
  flowLabelEn: string;
  overLabelHe: string;
  overLabelEn: string;
  accentColor: string;
  guideTopicId: SomaticGuideTopicId;
}

export const SOMATIC_AXES: SomaticAxisMeta[] = [
  {
    type: 'mechanics',
    titleHe: 'מכניקה, פיזיקה ומורפולוגיה',
    titleEn: 'Mechanics, Physics & Morphology',
    shortLabelHe: 'מכניקה ושלד',
    shortLabelEn: 'Mechanics',
    subtitleHe: 'שיתוף משקל, טנסגריטי שלד, תנופה וסגנונות נפילה עם כבידה',
    subtitleEn: 'Weight sharing, skeletal tensegrity, spirals, and gravity flow',
    underLabelHe: 'החזקה שרירית / נוקשות',
    underLabelEn: 'Muscular holding / Bracing',
    flowLabelHe: 'Flow · זרימת מסה ואמון שלדי',
    flowLabelEn: 'Flow · Skeletal ease & buoyancy',
    overLabelHe: 'קריסת משקל / פזיזות',
    overLabelEn: 'Weight dumping / Unchecked drop',
    accentColor: '#F36523',
    guideTopicId: 'AXIS_MECHANICS',
  },
  {
    type: 'perception',
    titleHe: 'תפיסה, חישה וקשב עורי',
    titleEn: 'Perception & Sensory Listening',
    shortLabelHe: 'חישה וקשב',
    shortLabelEn: 'Perception',
    subtitleHe: 'העור כמוח השני, מסת נוזלים (90% מים), Soft Focus והפיכות המגע',
    subtitleEn: 'Skin as sensory organ, 90% fluid mass, Soft Focus & tactile reversibility',
    underLabelHe: 'קשב מפוזר / נסיגה מחישה',
    underLabelEn: 'Scattered / Narrow stare',
    flowLabelHe: 'Flow · הקשבה עורית 360°',
    flowLabelEn: 'Flow · 360° tactile openness',
    overLabelHe: 'הצפה חושית / מיזוג יתר',
    overLabelEn: 'Sensory flood / Blurred merger',
    accentColor: '#2A82C5',
    guideTopicId: 'AXIS_PERCEPTION',
  },
  {
    type: 'behavior',
    titleHe: 'תנועה, ביצוע וזיקות לאבאן',
    titleEn: 'Movement Behavior & LMA Flow',
    shortLabelHe: 'תנועה ולאבאן',
    shortLabelEn: 'Behavior',
    subtitleHe: 'הריקוד הקטן, גיוס נשימתי ודינמיקת עלייה/שקיעה/פתיחה (LMA)',
    subtitleEn: 'Small Dance reflexes, Effort/Shape regulation & fluid phrasing',
    underLabelHe: 'זרימה כבולה / קיפאון',
    underLabelEn: 'Bound flow / Hesitant freeze',
    flowLabelHe: 'Flow · זיקות לאבאן וקשב גמיש',
    flowLabelEn: 'Flow · Expressive LMA phrasing',
    overLabelHe: 'זרימה פרועה / תזזיתיות',
    overLabelEn: 'Wild uncontained momentum',
    accentColor: '#4F46E5',
    guideTopicId: 'AXIS_BEHAVIOR',
  },
  {
    type: 'emotion',
    titleHe: 'ויסות רגשי ודינמיקה בינאישית',
    titleEn: 'Emotional Regulation & Relating',
    shortLabelHe: 'רגש ויחסים',
    shortLabelEn: 'Emotion',
    subtitleHe: 'טווח הזהב של אמפתיה קינסטטית, נפרדות, תיקון רך וקילוף התפוז',
    subtitleEn: 'Kinesthetic empathy golden mean, self-other boundaries & soft repair',
    underLabelHe: 'ניתוק רגשי / ריצוי שקט',
    underLabelEn: 'Detachment / Quiet appeasement',
    flowLabelHe: 'Flow · אמפתיה ונפרדות בטוחה',
    flowLabelEn: 'Flow · Steady empathy & repair',
    overLabelHe: 'הצפה / האשמה / התפרקות',
    overLabelEn: 'Emotional flood / Spillover',
    accentColor: '#7C3AED',
    guideTopicId: 'AXIS_EMOTION',
  },
  {
    type: 'ethics',
    titleHe: 'אתיקה, הסכמה ומרקם קהילתי',
    titleEn: 'Ethics, Consent & Community',
    shortLabelHe: 'אתיקה והסכמה',
    shortLabelEn: 'Ethics',
    subtitleHe: 'הסכמה מתמשכת, שני הנהרות, ידית הדלת, פערי כוח ודמוקרטיה בג׳אם',
    subtitleEn: 'Continuous consent, Two Rivers, door handle ethics & jam democracy',
    underLabelHe: 'הסכמה שבשתיקה / ביטול עצמי',
    underLabelEn: 'Silent compliance / Deference',
    flowLabelHe: 'Flow · בהירות ב״לא״ ו״כן״ מלא',
    flowLabelEn: 'Flow · Clear "No" & mutual care',
    overLabelHe: 'משטור נוקשה / פטרונות',
    overLabelEn: 'Policing rigidity / Intrusion',
    accentColor: '#D97706',
    guideTopicId: 'AXIS_ETHICS',
  },
];

export const DEFAULT_AXIS_BALANCES: AxisBalances = {
  mechanics: 0,
  perception: 0,
  behavior: 0,
  emotion: 0,
  ethics: 0,
};

export function mapLegacyAxisToV2(axis: SomaticAxisType | string): ReflectionAxisId {
  switch (axis) {
    case 'mechanics':
    case 'WEIGHT_SHARING':
    case 'FALLING_MOMENTUM':
      return 'mechanics';
    case 'perception':
    case 'ATTUNEMENT':
    case 'TACTILE_ATTENTION':
      return 'perception';
    case 'behavior':
    case 'GROUNDING':
      return 'behavior';
    case 'emotion':
      return 'emotion';
    case 'ethics':
    case 'BOUNDARIES':
      return 'ethics';
    default:
      return 'perception';
  }
}

function clampBalance(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(-5, Math.min(5, Math.round(v * 2) / 2));
}

function legacyTenScaleToBalance(score1to10: number, invertedBias = false): number {
  // Legacy records stored high comfort as ~8..10 (closest to balanced Flow = 0)
  // Lower values (< 8) reflect slight Under-regulation (-1 to -4) or slight Over (-/+).
  const clamped = Math.max(1, Math.min(10, Number(score1to10) || 7));
  const deltaFromFlow = Math.max(0, 8.8 - clamped); // 0..7.8
  const mag = Math.min(4.5, deltaFromFlow * 0.6);
  return clampBalance(invertedBias ? mag : -mag);
}

export function normalizeRecordAxes(record: MovementRecord): AxisBalances {
  if (record.axisBalances) {
    return {
      mechanics: clampBalance(record.axisBalances.mechanics),
      perception: clampBalance(record.axisBalances.perception),
      behavior: clampBalance(record.axisBalances.behavior),
      emotion: clampBalance(record.axisBalances.emotion),
      ethics: clampBalance(record.axisBalances.ethics),
    };
  }

  const mechanicsRaw = ((record.weightSharingLevel || 8) + (record.fallingMomentumLevel || 8)) / 2;
  const perceptionRaw = ((record.attunementLevel || 8) + (record.tactileAttentionLevel || 8)) / 2;
  const behaviorRaw = ((record.groundingLevel || 8) + (record.fallingMomentumLevel || 8)) / 2;
  const emotionRaw = ((record.attunementLevel || 8) + (record.groundingLevel || 8)) / 2;
  const ethicsRaw = record.boundaryClarityLevel || 8;

  const isOverSignaled =
    (record.fallingMomentumLevel || 0) > (record.groundingLevel || 0) + 1.2 ||
    record.twoRiversState.includes('Over') ||
    record.twoRiversState.includes('יתר');

  return {
    mechanics: legacyTenScaleToBalance(mechanicsRaw, isOverSignaled),
    perception: legacyTenScaleToBalance(perceptionRaw, false),
    behavior: legacyTenScaleToBalance(behaviorRaw, isOverSignaled),
    emotion: legacyTenScaleToBalance(emotionRaw, false),
    ethics: legacyTenScaleToBalance(ethicsRaw, false),
  };
}

export function deriveLegacyLevelsFromBalances(b: AxisBalances): {
  weightSharingLevel: number;
  attunementLevel: number;
  boundaryClarityLevel: number;
  fallingMomentumLevel: number;
  groundingLevel: number;
  tactileAttentionLevel: number;
} {
  const balanceToTen = (val: number) => {
    const abs = Math.min(5, Math.abs(val));
    return Number((9.5 - abs * 0.9).toFixed(1));
  };
  return {
    weightSharingLevel: balanceToTen(b.mechanics),
    attunementLevel: balanceToTen(b.perception),
    boundaryClarityLevel: balanceToTen(b.ethics),
    fallingMomentumLevel: balanceToTen((b.mechanics + b.behavior) / 2),
    groundingLevel: balanceToTen((b.behavior + b.emotion) / 2),
    tactileAttentionLevel: balanceToTen(b.perception),
  };
}

export function getSoftBalanceLabel(balance: number, lang: AppLanguageCode): string {
  const abs = Math.abs(balance);
  if (abs <= 1.0) {
    return trLang(lang, 'אינטגרציה וזרימה (Flow)', 'Integrative Flow');
  }
  if (balance < -1.0 && balance >= -2.5) {
    return trLang(lang, 'נטייה קלה לתת-תגובה (Under)', 'Gentle Under-Response');
  }
  if (balance < -2.5) {
    return trLang(lang, 'תת-תגובה מוחזקת (Under)', 'Held Under-Response');
  }
  if (balance > 1.0 && balance <= 2.5) {
    return trLang(lang, 'נטייה קלה לתגובת יתר (Over)', 'Gentle Over-Response');
  }
  return trLang(lang, 'עוצמה או תגובת יתר (Over)', 'Strong Over-Response');
}

export const CURIOSITY_CARDS: CuriosityCard[] = [
  {
    id: 'curiosity-mechanics',
    titleHe: 'משקל, שלד ותנע רך',
    titleEn: 'Weight, Bones & Buoyant Flow',
    inviteHe: 'לתת לעצמות ולכבידה לשאת אותי לפני הפעלת כוח שרירי',
    inviteEn: 'Let bones and gravity share load smoothly before adding muscle effort',
    sampleIntentionHe: 'במפגשים הקרובים אבדוק איך מסת הגוף זורמת ברכות דרך האגן והגב בלי דחיפה.',
    sampleIntentionEn: 'In my next jams, I want weight to pour cleanly through hips and spine without pushing.',
    axisType: 'mechanics',
    accentColor: '#F36523',
  },
  {
    id: 'curiosity-perception',
    titleHe: 'עור פתוח ומבט פנורמי',
    titleEn: '360° Skin & Soft Focus',
    inviteHe: 'להרגיש את המרחב דרך מעטפת העור ומסת הנוזלים בגוף',
    inviteEn: 'Sense partner and room through warm fluid mass and Soft Focus vision',
    sampleIntentionHe: 'אתנסה בהשהיית מבט חד לטובת ראיית Soft Focus והקשבה דרך הגב והצלעות.',
    sampleIntentionEn: 'I want to practice Soft Focus sight and dorsal skin listening across the room.',
    axisType: 'perception',
    accentColor: '#2A82C5',
  },
  {
    id: 'curiosity-behavior',
    titleHe: 'הריקוד הקטן וויסות לאבאן',
    titleEn: 'Small Dance & LMA Tempo',
    inviteHe: 'לגלות מיקרו-תנודות קרקוע ולשחק בעלייה, שקיעה ופתיחה',
    inviteEn: 'Notice standing micro-sways and play with LMA rise, sink, and spread',
    sampleIntentionHe: 'אתחיל דקה של הריקוד הקטן לפני כניסה לדואט כדי לפגוש גמישות במעברים.',
    sampleIntentionEn: 'I want to begin with one Small Dance minute to unlock expressive phrasing.',
    axisType: 'behavior',
    accentColor: '#4F46E5',
  },
  {
    id: 'curiosity-emotion',
    titleHe: 'אמפתיה, קילוף ותיקון רך',
    titleEn: 'Empathy, Keluf & Gentle Repair',
    inviteHe: 'להישאר חמים ונגישים תוך שמירה על נפרדות ונשימה בטוחה',
    inviteEn: 'Stay warm and receptive while honoring personal separation and calm repair',
    sampleIntentionHe: 'אם תופיע מבוכה או עומס, אעצור ל"רגע" או "סליחה" ברוך לפני חזרה ל"שלום".',
    sampleIntentionEn: 'Whenever intensity spikes, I want to use a quiet Rega pause before returning smoothly.',
    axisType: 'emotion',
    accentColor: '#7C3AED',
  },
  {
    id: 'curiosity-ethics',
    titleHe: 'בהירות ב״לא״ וידית הדלת',
    titleEn: 'Clear "No" & Open Door Ethics',
    inviteHe: 'לסמן גבול פיזי שליו בידיעה שזה מה שמצמיח אמון ו״כן״ שלם',
    inviteEn: 'Trust calm physical boundaries so wholehearted mutual "Yes" can flourish',
    sampleIntentionHe: 'אזכור שתמיד קיימת ידית דלת זמינה ליציאה שלמה, האטה או עיצוב קצב הדדי.',
    sampleIntentionEn: 'I want to remember the open door handle is always available without guilt.',
    axisType: 'ethics',
    accentColor: '#D97706',
  },
];

export const HERE_AND_NOW_TONES: Array<{
  id: HereAndNowTone;
  labelHe: string;
  labelEn: string;
  hintHe: string;
  hintEn: string;
  color: string;
}> = [
  {
    id: 'calm',
    labelHe: 'שקט/ה וקשוב/ה',
    labelEn: 'Quiet & Attentive',
    hintHe: 'יש מרחב לנשום, להרגיש מים וגוף 360°',
    hintEn: 'Calm spaciousness for fluid sensing and Soft Focus',
    color: '#0F766E',
  },
  {
    id: 'curious',
    labelHe: 'סקרנ/ית ומתנסה',
    labelEn: 'Curious & Open',
    hintHe: 'רצון לשאול שאלה חיה ברקמות ולגלות כיוונים חדשים',
    hintEn: 'Ready to enter with an open question in the tissues',
    color: '#2A82C5',
  },
  {
    id: 'tender',
    labelHe: 'רך/ה ומבקש/ת עדינות',
    labelEn: 'Tender & Seeking Ease',
    hintHe: 'הגוף מעריך עלייה קלה, קצב איטי וקילוף עדין',
    hintEn: 'Appreciates gentle upward buoyancy, soft weight, and patience',
    color: '#7C3AED',
  },
  {
    id: 'energized',
    labelHe: 'בתנופה חיה',
    labelEn: 'Vivid & Flowing',
    hintHe: 'זמינות לתנועה ספירלית, פתיחה צדדית ומומנטום מודע',
    hintEn: 'Alive readiness for lateral spread, spirals, and elastic play',
    color: '#F36523',
  },
  {
    id: 'grounded',
    labelHe: 'זקוק/ה לקרקע וגבול',
    labelEn: 'Seeking Ground & Space',
    hintHe: 'נכון לי לשקוע מטה, להתכנס ולסמן גבולות בהירים',
    hintEn: 'Staying close to floor support with Sink/Enclose & clear borders',
    color: '#D97706',
  },
];

export const INTENTION_HORIZONS: Array<{
  id: IntentionHorizon;
  labelHe: string;
  labelEn: string;
}> = [
  { id: 'today', labelHe: 'להיום', labelEn: 'For Today' },
  { id: 'this_week', labelHe: 'לשבוע הקרוב', labelEn: 'This Week' },
  { id: 'next_jams', labelHe: 'למפגשים הקרובים', labelEn: 'Upcoming Sessions' },
  { id: 'open', labelHe: 'בקצב פתוח', labelEn: 'Open Rhythm' },
];

export const SUPPORT_NEED_OPTIONS: Array<{ he: string; en: string }> = [
  { he: '4 דקות כוונון סנסורי ונשימה לפני מגע', en: '4-minute Sensory Tuning & breath before contact' },
  { he: 'גבול שני הנהרות או סימון "רגע / סליחה"', en: 'Two Rivers cue or soft "Rega / Slicha" pause' },
  { he: 'זמינות "ידית הדלת" ליציאה שלווה בכל רגע', en: 'Open "Door Handle" freedom to exit calmly anytime' },
  { he: 'סקרנות פתוחה בלי מטרה אקרובטית', en: 'Open tissue curiosity without performance pressure' },
  { he: 'תנועת שקיעה (LMA Sink) וקרקוע קרוב לרצפה', en: 'Grounded Sink & close floor contact' },
];

export function getSoftQualityLabel(score0to100: number, lang: AppLanguageCode): string {
  if (score0to100 >= 85) {
    return trLang(lang, 'נוכחות וזרימת Flow חמה', 'Warm Integrative Flow');
  }
  if (score0to100 >= 70) {
    return trLang(lang, 'סקרנות מאוזנת ומתרקמת', 'Balanced curiosity in motion');
  }
  if (score0to100 >= 50) {
    return trLang(lang, 'התבוננות בקטבי קצה', 'Exploring gentle edge poles');
  }
  return trLang(lang, 'מרחב שקט לבירור ואיזון', 'Quiet ground for recalibration');
}

export const INITIAL_PERSONAL_JOURNEY: PersonalJourney = {
  curiosityIds: ['curiosity-mechanics', 'curiosity-ethics'],
  statement: 'במפגשים הקרובים ארצה לשים לב לזרימת המשקל דרך העצמות ולבהירות עדינה ב"לא" וב"רגע".',
  horizon: 'next_jams',
  supportNeeds: [
    '4 דקות כוונון סנסורי ונשימה לפני מגע',
    'סקרנות פתוחה בלי מטרה אקרובטית',
  ],
  hereAndNowTone: 'calm',
  hereAndNowNote: 'כשאני מדמיין/ת 90% מים בגוף לפני כניסה למגע, הכתפיים מתרככות והנשימה מתרחבת.',
  supportMoments: [
    {
      id: 'sup-1',
      text: 'עצירה של שתי נשימות של "רגע" באמצע גלגול איפשרה לנו למצוא קשת חדשה בלי מאמץ.',
      dateStr: 'השבוע',
    },
    {
      id: 'sup-2',
      text: 'סימון ידית דלת פתוחה בדואט יצר תחושת אמון מרגיעה שאיפשרה להעמיק בביטחון.',
      dateStr: 'לפני מספר ימים',
    },
  ],
};

export function getAxisMeta(axis: SomaticAxisType | string): SomaticAxisMeta {
  const canonical = mapLegacyAxisToV2(axis);
  return SOMATIC_AXES.find((a) => a.type === canonical) || SOMATIC_AXES[0];
}

export function getAxisTitle(axis: SomaticAxisType | string, lang: AppLanguageCode): string {
  const m = getAxisMeta(axis);
  return trLang(lang, m.titleHe, m.titleEn);
}

export function getAxisShortLabel(axis: SomaticAxisType | string, lang: AppLanguageCode): string {
  const m = getAxisMeta(axis);
  return trLang(lang, m.shortLabelHe, m.shortLabelEn);
}

export function getPillarColor(pillar: string): string {
  const p = pillar.toLowerCase();
  if (p.includes('מכניק') || p.includes('משקל') || p.includes('נפילה') || p.includes('mechan') || p.includes('weight') || p.includes('fall')) return '#F36523';
  if (p.includes('אתיק') || p.includes('גבול') || p.includes('הסכמה') || p.includes('ethic') || p.includes('bound') || p.includes('consent')) return '#D97706';
  if (p.includes('רגש') || p.includes('קילוף') || p.includes('אמפתיה') || p.includes('emot') || p.includes('keluf')) return '#7C3AED';
  if (p.includes('תנועה') || p.includes('לאבאן') || p.includes('ריקוד קטן') || p.includes('קרקוע') || p.includes('behav') || p.includes('lma') || p.includes('small dance')) return '#4F46E5';
  return '#2A82C5';
}

export function mapPillarToAxis(pillar: string): ReflectionAxisId {
  const p = pillar.toLowerCase();
  if (p.includes('מכניק') || p.includes('משקל') || p.includes('נפילה') || p.includes('mechan') || p.includes('weight') || p.includes('fall')) return 'mechanics';
  if (p.includes('אתיק') || p.includes('גבול') || p.includes('הסכמה') || p.includes('ethic') || p.includes('bound') || p.includes('consent')) return 'ethics';
  if (p.includes('רגש') || p.includes('קילוף') || p.includes('אמפתיה') || p.includes('emot') || p.includes('keluf')) return 'emotion';
  if (p.includes('תנועה') || p.includes('לאבאן') || p.includes('ריקוד קטן') || p.includes('קרקוע') || p.includes('behav') || p.includes('lma') || p.includes('small dance')) return 'behavior';
  return 'perception';
}

export const INITIAL_DANCER_PROFILE: DancerProfile = {
  name: 'זוהר בר-און',
  levelTitle: 'בהקשבה פתוחה לכאן ועכשיו',
  bio: 'רקדן/ית ומתרגל/ת אימפרוביזציה במגע (CI). חוקר/ת את הדיאלוג בין מרכז הכובד, 5 צירי ויסות Under↔Flow↔Over וגבולות בהירים.',
  yearsDanced: 3.5,
  primaryRole: 'מתרגל/ת ומטפח/ת מרחב ג׳אם',
  touchPreference: 'מגע הדרגתי וקשוב, שימוש בהרמת אמה ("המתן") ובקילוף עדין',
  activeIntentions: [
    'בדיקת איכות Flow בציר המכניקה (הקלה שרירית מול קריסה)',
    'שימוש במודל שני הנהרות ו״ידית הדלת״ במעברים',
    'תרגול Soft Focus ועור 360° לפני ג׳אמים',
  ],
  totalJamHours: 142.5,
  currentStreakWeeks: 6,
  completedInquiriesCount: 14,
  savedRecordsCount: 4,
  personalJourney: INITIAL_PERSONAL_JOURNEY,
};

const NOW_REF = Date.now();
const DAY_MS = 24 * 60 * 60 * 1000;

export const INITIAL_RECORDS: MovementRecord[] = [
  {
    id: 'rec-1',
    title: 'ג׳אם סופשבוע בירושלים: הריקוד הקטן וטנסגריטי בעמוד השדרה',
    dateStr: 'לפני יומיים',
    jamOrWorkshop: 'ג׳אם ירושלמי פתוח',
    partner: 'יונתן ר.',
    durationMinutes: 90,
    pillarCategory: 'מכניקה, פיזיקה ומורפולוגיה',
    contactPoints: ['אגן ומרכז', 'גב אל גב', 'שכמות וכתפיים'],
    weightSharingLevel: 9.0,
    attunementLevel: 9.2,
    boundaryClarityLevel: 9.5,
    fallingMomentumLevel: 8.8,
    groundingLevel: 9.6,
    tactileAttentionLevel: 9.1,
    reflectionMode: 'deep',
    axisBalances: { mechanics: 0, perception: 0.5, behavior: 0, emotion: -0.5, ethics: 0 },
    flaggedParameters: [
      { paramId: 'mechanics-01', state: 'flow' },
      { paramId: 'perception-05', state: 'flow' },
      { paramId: 'behavior-01', state: 'flow' },
    ],
    twoRiversState: 'יד פתוחה — "כן / העמק" (אמון מלא)',
    kelufState: 'שלום (חזרה נינוחה למגע ולעצמי)',
    reflectionNotes:
      'התחלנו בארבע דקות של כוונון סנסורי והריקוד הקטן. כשהמגע הגיע לעמוד השדרה המסה זרמה ממרכז למרכז בטנסגריטי נקי ללא דחיפה.',
    keyTakeaway: 'מתי שהשאלה נותרת חיה ברקמות, ההרמות קורות ללא מאמץ והגב אינו מאוים.',
    somaticSensations: ['חמימות בעמוד השדרה', 'מסת מים גמישה', 'היענות לקרקע'],
    timestampMs: NOW_REF - 2 * DAY_MS,
  },
  {
    id: 'rec-2',
    title: 'סדנת "101 דרכים לומר לא" — תרגול שני הנהרות וקילוף התפוז',
    dateStr: 'לפני 4 ימים',
    jamOrWorkshop: 'סדנת עומק אתיקה והסכמה',
    partner: 'שירה ל.',
    durationMinutes: 120,
    pillarCategory: 'אתיקה, הסכמה ומרקם קהילתי',
    contactPoints: ['כפות ידיים', 'אמות הידיים', 'כתף'],
    weightSharingLevel: 7.4,
    attunementLevel: 9.3,
    boundaryClarityLevel: 9.5,
    fallingMomentumLevel: 7.8,
    groundingLevel: 8.9,
    tactileAttentionLevel: 9.0,
    reflectionMode: 'deep',
    axisBalances: { mechanics: -1.5, perception: 0, behavior: -0.5, emotion: 0.5, ethics: 0 },
    flaggedParameters: [
      { paramId: 'ethics-02', state: 'flow' },
      { paramId: 'emotion-19', state: 'flow' },
      { paramId: 'mechanics-01', state: 'under' },
    ],
    twoRiversState: 'הרמת אמה — "המתן / האט"',
    kelufState: 'סליחה (עצירה וויסות עדין ללא בושה)',
    reflectionNotes:
      'תרגול שלושת אותות הזרוע בשני הנהרות וצירוף פעימות "רגע / סליחה / שלום". כשהרשיתי לעצמי להאט עם הרמת אמה, גיליתי איפה החזקתי משקל מיותר מתוך ריצוי.',
    keyTakeaway: 'ללא זכות ברורה ומכבדת לומר "לא", ה"כן" נותר מפוחד.',
    somaticSensations: ['בהירות שקטה בגבול', 'שחרור לסת', 'ידית דלת פתוחה'],
    timestampMs: NOW_REF - 4 * DAY_MS,
  },
  {
    id: 'rec-3',
    title: 'ג׳אם תל אביב: לאבאן שקיעה, ספירלות רצפה ו־Following Through',
    dateStr: 'לפני 6 ימים',
    jamOrWorkshop: 'ג׳אם ערב סטודיו נעים',
    partner: 'דניאל ק.',
    durationMinutes: 80,
    pillarCategory: 'תנועה, ביצוע וזיקות לאבאן',
    contactPoints: ['צלעות', 'ירכיים', 'משטח הרצפה'],
    weightSharingLevel: 8.2,
    attunementLevel: 8.6,
    boundaryClarityLevel: 8.4,
    fallingMomentumLevel: 7.5,
    groundingLevel: 8.0,
    tactileAttentionLevel: 8.5,
    reflectionMode: 'quick',
    axisBalances: { mechanics: 2.0, perception: 0.5, behavior: 2.0, emotion: 0, ethics: -0.5 },
    flaggedParameters: [
      { paramId: 'mechanics-05', state: 'over' },
      { paramId: 'perception-05', state: 'flow' },
      { paramId: 'emotion-19', state: 'under' },
    ],
    twoRiversState: 'יד פתוחה — "כן / העמק" (תנופה חיה)',
    kelufState: 'רגע (המתנה שקטה לפני האצה)',
    reflectionNotes:
      'נכנסתי לקצב מהיר ומפוזר מדי בשלב ההאצה, עד שחיבור לשקיעה והארכת שטח הפנים על הרצפה החזיר סנכרון אל הספירלה.',
    keyTakeaway: 'Following through עם רכיב שקיעה (Sink) עוצר התרסקות ומחזיר ריבאונד נעים.',
    somaticSensations: ['תנופה ספירלית', 'פיזור עומס לקרקע', 'אנרגיה ערה'],
    timestampMs: NOW_REF - 6 * DAY_MS,
  },
  {
    id: 'rec-4',
    title: 'מעבדת מחקר 1:1 — הקרום המשתנה וראיית Soft Focus',
    dateStr: 'לפני שבועיים',
    jamOrWorkshop: 'מרפאת מחקר סומטי 1:1',
    partner: 'נועה מ.',
    durationMinutes: 60,
    pillarCategory: 'תפיסה, חישה וקשב עורי',
    contactPoints: ['ראש אל כתף', 'צלעות', 'כפות רגליים'],
    weightSharingLevel: 8.4,
    attunementLevel: 9.4,
    boundaryClarityLevel: 9.0,
    fallingMomentumLevel: 8.5,
    groundingLevel: 9.1,
    tactileAttentionLevel: 9.6,
    reflectionMode: 'deep',
    axisBalances: { mechanics: -0.5, perception: 0, behavior: 0, emotion: 0, ethics: 0 },
    flaggedParameters: [
      { paramId: 'perception-05', state: 'flow' },
      { paramId: 'ethics-02', state: 'flow' },
      { paramId: 'mechanics-05', state: 'flow' },
    ],
    twoRiversState: 'יד פתוחה — "כן / העמק"',
    kelufState: 'קילוף ופלחים (קריאת טונוס הדרגתית)',
    reflectionNotes:
      'עבדנו במודל מרפאת ה־20 דקות (5 שאלה וחוזה / 10 חקירה / 5 אינטגרציה). חוויית הקרום המשתנה של דימוק: הגבול בינינו הרגיש כנקודת שמיעה משותפת.',
    keyTakeaway: 'העור אינו קו גבול מפריד, אלא מוח שני הקורא כוונות עוד לפני תנועה גלויה.',
    somaticSensations: ['ראייה היקפית 180°', 'קרום עורי נושם', 'חמימות בינאישית'],
    timestampMs: NOW_REF - 13 * DAY_MS,
  },
];

export const INITIAL_RECOMMENDATIONS: SomaticRecommendation[] = [
  {
    id: 'rec-tip-1',
    shortTitle: 'הריקוד הקטן (Small Dance)',
    shortTitleEn: 'The Small Dance',
    subtitleTag: 'מכניקה · עמוד השדרה והאדמה',
    subtitleTagEn: 'Mechanics · Spine & Gravity Reflexes',
    axisType: 'mechanics',
    summaryPreview: '4 שלבי עמידה קשובה לגיוס תמיכה שלדית',
    fullExplanation:
      'סטיב פקסטון פיתח את "הריקוד הקטן" כדי להזכיר לרקדן שגם בעמידה שקטה הגוף מפעיל אינסטינקט חכם ומיקרו-התאמות מול כוח המשיכה.',
    fullExplanationEn:
      'Steve Paxton introduced "The Small Dance" so dancers sense the spine’s gentle anti-gravity reflexes in quiet standing before entering contact.',
    practicalSteps: [
      'עמוד בפיסוק נוח ברוחב האגן, ברכיים רכות.',
      'שחרר את הכתפיים והלסת וחוש את חלוקת המשקל בכפות הרגליים.',
      'הבחן במיקרו-נדנוד של השלד ובחיוניות של הנשימה.',
    ],
    practicalStepsEn: [
      'Stand comfortably hip-width apart with unlocked knees.',
      'Soften jaw and shoulders and notice weight spread across feet.',
      'Sense skeletal micro-adjustments swaying gently with breath.',
    ],
    quoteText: 'הריקוד הקטן הוא מצב של אמון בגוף ובאדמה, ללא כוריאוגרפיה מוכתבת מראש.',
    quoteTextEn: 'The Small Dance is trust in the body and earth without preset choreography.',
    quoteAuthor: 'סטיב פקסטון (1972)',
    quoteAuthorEn: 'Steve Paxton (1972)',
    hasInteractivePractice: true,
    scoreId: 'small_dance',
  },
  {
    id: 'rec-tip-2',
    shortTitle: 'כוונון סנסורי 4 דקות (Tuning In)',
    shortTitleEn: '4-Min Sensory Tuning Checklist',
    subtitleTag: 'חישה · 90% מים ועור 360°',
    subtitleTagEn: 'Perception · Fluid Mass & 360° Skin',
    axisType: 'perception',
    summaryPreview: 'כבידה → נוזלים → עור 360° → Soft Focus',
    fullExplanation:
      'סריקה מהירה וממוקדת לפני כניסה לג׳אם המעבירה את המוח מראייה ממוקדת ומתוחה אל תודעת עור נושמת ומסת נוזלים זורמת (BMC / Deane Juhan).',
    fullExplanationEn:
      'A 4-stage pre-jam transition shifting out of narrow analytical stare into fluid body mass awareness and panoramic Soft Focus vision.',
    practicalSteps: [
      'דקה 1: שקוע לרצפה וחוש כוח משיכה.',
      'דקה 2: דמיין את הגוף כשק של 90% מים נעים.',
      'דקה 3: הער את כל מעטפת העור 360°.',
      'דקה 4: פקח עיניים למבט Soft Focus רחב.',
    ],
    practicalStepsEn: [
      'Min 1: Pour weight smoothly into the floor.',
      'Min 2: Imagine internal 90% fluid body mass.',
      'Min 3: Awaken full 360° dorsal & frontal skin.',
      'Min 4: Open into effortless Soft Focus.',
    ],
    quoteText: 'העור אינו קצה שמפריד אותנו מהעולם, אלא המשך שטוח של המוח החש את העולם.',
    quoteTextEn: 'Skin is not our separation wall—it is the outer surface of our brain listening.',
    quoteAuthor: 'דין ג׳והאן / BMC',
    quoteAuthorEn: 'Deane Juhan / BMC',
    hasInteractivePractice: true,
    scoreId: 'sensory_tuning',
  },
  {
    id: 'rec-tip-3',
    shortTitle: 'שני הנהרות: ״לא״ המאפשר ״כן״',
    shortTitleEn: 'Two Rivers Consent Practice',
    subtitleTag: 'אתיקה · הסכמה לא-מילולית ברורה',
    subtitleTagEn: 'Ethics · 3 Arm Consent Signals',
    axisType: 'ethics',
    summaryPreview: 'יד פתוחה · הרמת אמה · כף יד מושטת',
    fullExplanation:
      'בשיטתו של מרטין קיו ("101 דרכים לומר לא"), מקבל המגע מתרגל את הזכות לסמן כן / האטה / עצור בזרוע ובמרכז כובד ברור — כדי לבסס אמון מלא.',
    fullExplanationEn:
      'Rooted in Martin Keogh’s "101 Ways to Say No", dancers use 3 clear arm positions so boundary clarity nurtures fearless, wholehearted trust.',
    practicalSteps: [
      'יד פתוחה — "כן / העמק": אישור לקרבה ולהישענות הדרגתית.',
      'הרמת אמה — "המתן / האט": קביעת קצב נינוח לבדיקה.',
      'כף יד מושטת — "לא / עצור": עצירה בהירה ללא אשמה והכרת תודה.',
    ],
    practicalStepsEn: [
      'Open Palm — "Yes / Deepen": clear availability for weight contact.',
      'Raised Forearm — "Wait / Slow": smooth deceleration without guilt.',
      'Extended Palm — "No / Stop": clean halt received with warm gratitude.',
    ],
    quoteText: 'עד שלאדם יש את הביטחון לומר "לא", לא יהיה לו האמון לומר "כן" מלא.',
    quoteTextEn: 'Until a dancer trusts their "No", they cannot offer a full "Yes".',
    quoteAuthor: 'מרטין קיו',
    quoteAuthorEn: 'Martin Keogh',
    hasInteractivePractice: true,
    scoreId: 'two_rivers',
  },
  {
    id: 'rec-tip-4',
    shortTitle: 'קילוף התפוז: רגע, סליחה, שלום',
    shortTitleEn: 'Orange Peeling: Rega, Slicha, Shalom',
    subtitleTag: 'רגש ויחסים · תיקון רך וניקוי מניירות',
    subtitleTagEn: 'Emotion · Soft Regulation & Repair',
    axisType: 'emotion',
    summaryPreview: '5 פעימות לקריאת פלחים וויסות עדין',
    fullExplanation:
      'תרגול של Zohar R.: קילוף דפוסי ה"רקדנות" המאולצים, קריאת מרקמי הטונוס כמו פלחי תפוז עדינים, המתנת "רגע", בקשת מרחב ב"סליחה" ושיבה רגועה ל"שלום".',
    fullExplanationEn:
      'Developed by Zohar R.: peel away performative habits, sense delicate tissue segments, pause in "Rega", honor "Slicha" regulation, and land safely in "Shalom".',
    practicalSteps: [
      'קלף מניירות של הרגלי הופעה ומגע מוכתב.',
      'חוש את הפלחים השונים בשרירים ובנשימה של השותף.',
      'תן מקום ל"רגע", ל"סליחה" מווסתת בעומס, ולחזרה ל"שלום".',
    ],
    practicalStepsEn: [
      'Peel away performative stylistic tension.',
      'Sense varied muscle tone segments like orange slices.',
      'Weave in "Rega" (wait), "Slicha" (repair pause), and "Shalom" (return).',
    ],
    quoteText: 'כשאיננו מפשיטים בכוח את ההגנות אלא מקשיבים לפלחים ברכות, הקירבה נשארת שלמה.',
    quoteTextEn: 'Honoring each protective peel lets authentic intimacy stay safe and unforced.',
    quoteAuthor: 'זוהר ר. (Zohar R.)',
    quoteAuthorEn: 'Zohar R.',
    hasInteractivePractice: true,
    scoreId: 'keluf',
  },
  {
    id: 'rec-tip-5',
    shortTitle: 'זיקות לאבאן לוויסות רגשי (LMA)',
    shortTitleEn: 'LMA Emotional Resiliency Score',
    subtitleTag: 'תנועה · מותאם אוטומטית לטון כאן ועכשיו',
    subtitleTagEn: 'Behavior · Adapts Live to Your Tone',
    axisType: 'behavior',
    summaryPreview: 'עלייה, שקיעה או פתיחה לפי הרגשתך כעת',
    fullExplanation:
      'רצף התנועתי המבוסס על מחקרם של צחור ושפיר (LMA): המערכת בוחרת עבורך את האיכות הנדרשת לוויסות כרגע — עלייה קלה, שקיעה מגינה או פתיחה עקיפה.',
    fullExplanationEn:
      'Grounded in Tsachor & Shafir’s Laban Movement Analysis research: automatically adapts between Light/Rise, Grounded Sink/Enclose, and Side-Open/Spread based on your current tone.',
    practicalSteps: [
      'סמן את מצב הכאן ועכשיו שלך בלשונית הנוכחות.',
      'הפעל את התרגול וקבל הנחיה המותאמת במדויק לגוף שלך כעת.',
      'העבר את האיכות החדשה בעדינות אל נקודת המגע עם פרטנר.',
    ],
    practicalStepsEn: [
      'Select your Here & Now tone cleanly.',
      'Launch the score to receive tailored Laban Effort/Shape cues.',
      'Bring this balanced tone gently into partner touch.',
    ],
    quoteText: 'הבחירה האישית במאמץ ובצורה הופכת את הוויסות הרגשי לשער יצירתי ולא לתיקון כפוי.',
    quoteTextEn: 'Expressive Laban affinities turn emotional regulation into creative movement freedom.',
    quoteAuthor: 'צחור ושפיר (Tsachor & Shafir)',
    quoteAuthorEn: 'Tsachor & Shafir',
    hasInteractivePractice: true,
    scoreId: 'lma_resiliency',
  },
  {
    id: 'rec-tip-6',
    shortTitle: 'מרפאת מחקר 1:1 (20 דקות)',
    shortTitleEn: '1:1 Embodied Research Clinic',
    subtitleTag: 'חישה ומעבדה · חוזה, חקירה ואינטגרציה',
    subtitleTagEn: 'Perception · 5m / 10m / 5m Lab Timer',
    axisType: 'perception',
    summaryPreview: 'טיימר מובנה 5/10/5 עם פעמון רך',
    fullExplanation:
      'כלי זוגי מובנה למחקר גופני ממוקד: 5 דקות ניסוח שאלה ברקמות וחוזה גבולות, 10 דקות חקירה גופנית מודרכת, ו־5 דקות אינטגרציה ותובנת מפתח.',
    fullExplanationEn:
      'Structured 20-minute somatic lab container: 5 min Research Question & Boundary Contract, 10 min Guided Inquiry, and 5 min Integration & Key Takeaway.',
    practicalSteps: [
      'הגדירו יחד שאלה סומטית אחת וחוזה בטיחות ל־5 דקות.',
      'חקרו בתנועה איטית ומרוכזת ל־10 דקות בלי להסביר.',
      'חתמו ב־5 דקות עצירה, נשימה ותיעוד ב־+תעוד.',
    ],
    practicalStepsEn: [
      '5 min: Define one question in the tissues and clear boundary contract.',
      '10 min: Continuous movement exploration without lecturing.',
      '5 min: Pause together, integrate breath, and record Deep Research takeaways.',
    ],
    quoteText: 'כשמתחילים משאלה חיה ברקמות ולא מחיקוי צורות, הגוף ממציא תשובות מפתיעות.',
    quoteTextEn: 'When inquiry starts as a question in the tissues, movement finds fresh intelligence.',
    quoteAuthor: 'פדגוגיית מחקר Contact Ways',
    quoteAuthorEn: 'Contact Ways Lab',
    hasInteractivePractice: true,
    scoreId: 'clinic_1on1',
  },
];

export const INITIAL_INQUIRIES: ConversationInquiry[] = [
  {
    id: 'inq-v2-1',
    title: 'הבינה החייתית ושאלה ברקמות (פקסטון ולפקוף)',
    titleEn: 'Animal Intelligence & Question in the Tissues',
    category: 'מכניקה ותנועה',
    categoryEn: 'Mechanics & Behavior',
    subtitle: 'סטיב פקסטון ודניאל לפקוף: איך מפעילים רפלקס מהיר בלי פקודת מוח מודעת',
    subtitleEn: 'Steve Paxton & Daniel Lepkoff: survival reflexes vs. habitual planning',
    dateStr: 'מעודכן · v2.0',
    relatedStudyQuestion: 'כיצד כניסה למגע מתוך "שאלה חיה ברקמות" משחררת תגובה מהירה ומוגנת?',
    relatedStudyQuestionEn: 'How does entering contact with a "question in the tissues" awaken safer reflexes?',
    somaticPrinciple: 'כשהתודעה שואלת דרך הרקמה במקום לשלוט מראש, הרפלקסים המגינים של האדם־חיה מתעוררים בטבעיות.',
    somaticPrincipleEn: 'When inquiry originates in the tissues instead of choreographed plans, fast animal-like survival reflexes stay awake.',
    authorReference: 'סטיב פקסטון ודניאל לפקוף',
    summaryInsights: [
      'גופנו יודע להסתגל לשינוי משקל מהיר מהר יותר ממחשבה מילולית מתכננת.',
      'כניסה עם "שאלה ברקמות" במקום צורה קבועה מראש מונעת היתקעות בהרגלי עבר.',
      'הריקוד הקטן מאמן את הרפלקסים העצביים לסמוך על הקרקע בזמן אמת.',
    ],
    summaryInsightsEn: [
      'Bodily reflexes recalibrate under shifting gravity faster than conscious verbal thought.',
      'Entering contact with a live tissue question interrupts rigid habitual recipes.',
      'The Small Dance trains quiet nervous system readiness before explosive weight transfer.',
    ],
    messages: [
      {
        id: 'mv2-1-1',
        senderName: 'מדריך סומטי (ci-eye)',
        isGuide: true,
        text: 'לפי סטיב פקסטון ודניאל לפקוף, אימפרוביזציה במגע מעירה את ה״בינה החייתית״ שבנו. מה היה הרגע שבו חשת שהרקמות בגוף הגיבו חכם יותר מהראש המתכנן?',
        timeStr: '09:30',
        contextTip: 'נושא ליבה v2.0 · מכניקה ובינה חייתית',
      },
      {
        id: 'mv2-1-2',
        senderName: 'זוהר בר-און',
        isGuide: false,
        text: 'כשנפלתי לאחור מעבר לכתף השותף ולא הספקתי לתכנן צעד — הצלעות התגלגלו ספירלית אל הרצפה ברכות מפתיעה.',
        timeStr: '09:34',
      },
    ],
  },
  {
    id: 'inq-v2-2',
    title: 'מסת הנוזלים, שלד והברית בין עור למוח',
    titleEn: 'Fluid Mass, Skeletal Support & the Skin-Brain Alliance',
    category: 'תפיסה וחישה',
    categoryEn: 'Perception & Sensory',
    subtitle: 'גישת BMC ודין ג׳והאן: הגוף כ־90% מים נעים והעור כשלוחה של מערכת העצבים',
    subtitleEn: 'BMC & Deane Juhan: sensing 90% fluid body weight & skin as outer brain',
    dateStr: 'מעודכן · v2.0',
    relatedStudyQuestion: 'מה משתנה באיכות ההישענות כשמדמיינים שהגוף הוא שק נוזלים נושם ולא פסל מוצק?',
    relatedStudyQuestionEn: 'How does imagining the body as fluid inside living skin transform shared counterbalance?',
    somaticPrinciple: 'דימוי הגוף כמסת מים בתוך מעטפת עור רגישה מרכך כיווצי הגנה ומחדד קליטת לחץ.',
    somaticPrincipleEn: 'Perceiving mass as buoyant fluid wrapped in tactile skin softens protective gripping and sharpens directional clarity.',
    authorReference: 'Body-Mind Centering & דין ג׳והאן',
    summaryInsights: [
      'העור מכיל חיישני לחץ, תאוצה וכיוון המהווים שלוחה חיצונית של המוח.',
      'תודעת 90% מים מאפשרת למסת הגוף להישפך דרך שלד נינוח בלי קריסה פתאומית.',
      'פקיחת מבט Soft Focus מסייעת לתפיסת עור 360° לעבוד יחד עם המרחב.',
    ],
    summaryInsightsEn: [
      'Cutaneous mechanoreceptors act as an outer neural boundary reading vectors instantaneously.',
      'Fluid awareness encourages mass to pour seamlessly through skeletal arches.',
      'Soft Focus frees cognitive bandwidth for 360-degree skin awareness.',
    ],
    messages: [
      {
        id: 'mv2-2-1',
        senderName: 'מדריך סומטי (ci-eye)',
        isGuide: true,
        text: 'דין ג׳והאן מתאר את העור כשטח הפנים החיצוני של המוח. איך הורגשה שיחת המגע כשעברת מהקשבה שרירית להקשבה של נוזלים ועור?',
        timeStr: '11:00',
        contextTip: 'נושא ליבה v2.0 · BMC & Deane Juhan',
      },
    ],
  },
  {
    id: 'inq-v2-3',
    title: 'תיאוריית הקרום המשתנה — העצמי, הבין-אישי והמטאפיזי (דימוק)',
    titleEn: 'Variable Membrane Theory: Self, Interpersonal & Metaphysical',
    category: 'תפיסה ויחסים',
    categoryEn: 'Perception & Emotion',
    subtitle: 'דימוק (Dimock): היכולת לווסת חדירות הגבול משער סגור לקשב פתוח',
    subtitleEn: 'Dimock’s 3-dimension membrane model regulating permeability without losing self',
    dateStr: 'מעודכן · v2.0',
    relatedStudyQuestion: 'מתי כדאי לעבות את "הקרום המשתנה" שלך ומתי ניתן לפתוח חדירות חמה למפגש?',
    relatedStudyQuestionEn: 'How do you dynamically adjust membrane permeability between self, duet, and space?',
    somaticPrinciple: 'בריאות סומטית אינה "פתיחות תמידית" אלא כוונון חכם של חדירות הקרום לפי עומס ובטיחות.',
    somaticPrincipleEn: 'Somatic resilience is not permanent wide openness—it is adaptive membrane porosity tuned to safety and context.',
    authorReference: 'דימוק (Dimock)',
    summaryInsights: [
      'הקרום העצמי שומר על תחושת אינדיבידואליות פנימית גם בתוך דואט צפוף.',
      'הקרום הבין-אישי מתאם טמפרטורה, מרחק ומגע לפי הסכמה הדדית.',
      'קשיחות יתר סוגרת את הקרום (Under); מחיקתו גורמת להצפה ומיזוג (Over).',
    ],
    summaryInsightsEn: [
      'Self-membrane preserves internal anchor even inside full-weight aerial duets.',
      'Interpersonal membrane tunes warmth and tempo continuously.',
      'Too thick isolates connection (Under); absent boundaries flood and dissolve distinction (Over).',
    ],
    messages: [
      {
        id: 'mv2-3-1',
        senderName: 'מדריך סומטי (ci-eye)',
        isGuide: true,
        text: 'לפי תיאוריית הקרום המשתנה של דימוק, מתי לאחרונה הרגשת צורך לצופף לרגע את הקרום האישי שלך כדי להישאר נוכח/ת, וכיצד זה שיפר את הריקוד?',
        timeStr: '12:15',
        contextTip: 'נושא ליבה v2.0 · Dimock Variable Membrane',
      },
    ],
  },
  {
    id: 'inq-v2-4',
    title: 'סנכרון מוחי, עצבי מראה ואמפתיה קינסטטית',
    titleEn: 'Neural Synchrony, Mirror Neurons & Kinesthetic Empathy',
    category: 'ויסות רגשי ומדע',
    categoryEn: 'Emotion & Neuroscience',
    subtitle: 'ממצאי Dual-Brain EEG, ויטוריו גאלזה ואנטוניו דמאסיו על תנועה משותפת',
    subtitleEn: 'Dual-Brain EEG synchrony, Gallese embodied simulation & Damasio somatic markers',
    dateStr: 'מעודכן · v2.0',
    relatedStudyQuestion: 'כיצד הדהוד גופני יוצר אמפתיה קינסטטית חמה מבלי ליפול למיזוג רגשי מציף?',
    relatedStudyQuestionEn: 'How do mirror networks nurture kinesthetic empathy while keeping self-other clarity?',
    somaticPrinciple: 'טווח הזהב של אמפתיה קינסטטית מאפשר לקרוא את סימני הגוף של הפרטנר תוך עוגן נפרד ויציב.',
    somaticPrincipleEn: 'The golden mean of kinesthetic empathy reads partner somatic markers vividly while remaining rooted in personal ground.',
    authorReference: 'Gallese, Damasio & Dual-Brain EEG',
    summaryInsights: [
      'במחקרי Dual-Brain EEG נצפה סנכרון גלי מוח מובהק ברגעי זרימת משקל מאולתרת.',
      'סמנים סומטיים (Damasio) מספקים מצפן פנימי מהיר לזיהוי נינוחות או סיכון.',
      'ההבדל בין אמפתיה בריאה (Flow) להצפה (Over) תלוי בשמירה על עמוד שדרה עצמי.',
    ],
    summaryInsightsEn: [
      'Hyperscanning Dual-Brain EEG shows coupled neural rhythms during co-improvised movement.',
      'Somatic markers guide fast real-time navigation of safety and joy.',
      'Maintaining distinct grounding differentiates resonance (Flow) from enmeshment (Over).',
    ],
    messages: [
      {
        id: 'mv2-4-1',
        senderName: 'מדריך סומטי (ci-eye)',
        isGuide: true,
        text: 'גאלזה ודמאסיו מתארים כיצד הגוף חש את כוונת האחר מבפנים. איזה סמן סומטי בגופך מאותת לך מתי אתם מסונכרנים ומתי את/ה סופג/ת עומס שאינו שלך?',
        timeStr: '14:00',
        contextTip: 'נושא ליבה v2.0 · Gallese & Damasio',
      },
    ],
  },
  {
    id: 'inq-v2-5',
    title: 'פרדוקס ההסכמה, ידית הדלת ואנשים מקולפים',
    titleEn: 'Consent Paradox, the Door Handle & Peeled People',
    category: 'אתיקה וקילוף',
    categoryEn: 'Ethics & Keluf',
    subtitle: 'מרטין קיו, רוברט בליי ותרגיל קילוף התפוז של זוהר ר.',
    subtitleEn: 'Martin Keogh, Robert Bly, and Zohar R.’s Orange Peeling (Rega / Slicha / Shalom)',
    dateStr: 'מעודכן · v2.0',
    relatedStudyQuestion: 'מדוע שמירה על קליפות ההגנה הטבעיות ("אנשים מקולפים") ועל ידית הדלת הפתוחה מחזקות אינטימיות אמיתית?',
    relatedStudyQuestionEn: 'Why do honoring protective peels and keeping the exit "door handle" clear deepen authentic trust?',
    somaticPrinciple: 'זמינות מתמדת של יציאה ב״לא״ (ידית הדלת) וכבוד לקצב קילוף הדרגתי ("רגע / סליחה / שלום") הופכות את הקירבה לבחירה חופשית.',
    somaticPrincipleEn: 'Keeping an unobstructed "door handle" to exit plus honoring unhurried "Rega / Slicha / Shalom" regulation keeps closeness genuinely voluntary.',
    authorReference: 'מרטין קיו, רוברט בליי וזוהר ר.',
    summaryInsights: [
      'מרטין קיו: "לא" בהיר אינו סגירות אלא התנאי היחיד להיווצרות "כן" מלא.',
      'רוברט בליי: הלחץ לקלף את כולם ("אנשים מקולפים") באבחה גורם לנסיגה ופגיעות לא מוגנת.',
      'תרגיל קילוף התפוז מעניק מילים ושלבים פשוטים — רגע, סליחה, שלום — לוויסות עדין.',
    ],
    summaryInsightsEn: [
      'Martin Keogh: clear refusal unlocks authentic availability.',
      'Robert Bly critique: forced instant openness strips healthy protective skin.',
      'Keluf steps (Rega, Slicha, Shalom) turn micro-repair into everyday jam fluency.',
    ],
    messages: [
      {
        id: 'mv2-5-1',
        senderName: 'מדריך סומטי (ci-eye)',
        isGuide: true,
        text: 'בג׳אם הבא, נסה/י לשים לב אם תחושה של "ידית דלת פתוחה" וקיומה של מילת "רגע" או "סליחה" משנים את אומץ הסקרנות שלך.',
        timeStr: '16:40',
        contextTip: 'נושא ליבה v2.0 · Keogh · Bly · Zohar R.',
      },
    ],
  },
  {
    id: 'inq-v2-6',
    title: 'הג׳אם כדמוקרטיה תנועתית ו״טבעות בעץ״',
    titleEn: 'The Jam as Movement Democracy & "Rings in a Tree"',
    category: 'קהילה וזיקנה',
    categoryEn: 'Community & Aging',
    subtitle: 'חנה ארנדט על כוח בתיאום (Power-With), מלטשת הסלעים וקבלת גופים מגוונים',
    subtitleEn: 'Hannah Arendt’s Power-With, the community Rock Polisher & honoring aging wisdom',
    dateStr: 'מעודכן · v2.0',
    relatedStudyQuestion: 'איך הופכים חדר ג׳אם לדמוקרטיה תנועתית שמוקירה קצבים איטיים, בגרות ושונות גופנית?',
    relatedStudyQuestionEn: 'How can open jams embody democratic Power-With while cherishing aging bodies and slow tempos?',
    somaticPrinciple: 'כוח אמיתי ב־CI הוא Power-With (פעולה משותפת במרחב ציבורי שווה) המכבדת כל שכבת ניסיון וגיל כ"טבעות בעץ".',
    somaticPrincipleEn: 'Authentic power in CI is Arendt’s Power-With—democratic co-creation honoring every season and age like rings in a living tree.',
    authorReference: 'חנה ארנדט וקהילת הג׳אמים',
    summaryInsights: [
      'הג׳אם הוא "מלטשת סלעים" חברתית שמלטשת חיכוכים לקראת כבוד הדדי וזרימה.',
      'כוח משותף (Power-With) מפרק פערי ותק, מגדר והיררכיה סמויה של אקרובטיקה.',
      'דימוי "טבעות בעץ" מזמין חגיגה של איטיות, חוכמת פרקים ובגרות גופנית על המזרן.',
    ],
    summaryInsightsEn: [
      'A jam community functions like a gentle rock polisher smoothing ego edges into care.',
      'Power-With softens veteran-newcomer imbalances and performative pressure.',
      '"Rings in a Tree" welcomes mature joints and varied physical tempos equally.',
    ],
    messages: [
      {
        id: 'mv2-6-1',
        senderName: 'מדריך סומטי (ci-eye)',
        isGuide: true,
        text: 'לפי חנה ארנדט, כוח נולד רק כשאנשים פועלים יחד בהסכמה. כיצד תרמת לאחרונה לקצב שמכבד גם גופים מבוגרים, איטיים או זהירים בחדר?',
        timeStr: '18:20',
        contextTip: 'נושא ליבה v2.0 · Hannah Arendt · Rings in a Tree',
      },
    ],
  },
];

export const WEEKLY_SESSIONS_BASELINE: DaySessionData[] = [
  { dayLabel: 'א׳', dayLabelEn: 'Sun', hours: 1.5, depthRating: 4.5 },
  { dayLabel: 'ב׳', dayLabelEn: 'Mon', hours: 0.5, depthRating: 3.8 },
  { dayLabel: 'ג׳', dayLabelEn: 'Tue', hours: 2.0, depthRating: 4.9 },
  { dayLabel: 'ד׳', dayLabelEn: 'Wed', hours: 0.0, depthRating: 0.0 },
  { dayLabel: 'ה׳', dayLabelEn: 'Thu', hours: 1.8, depthRating: 4.6 },
  { dayLabel: 'ו׳', dayLabelEn: 'Fri', hours: 2.5, depthRating: 5.0 },
  { dayLabel: 'ש׳', dayLabelEn: 'Sat', hours: 1.2, depthRating: 4.2 },
];

export const BASELINE_MILESTONES: ProgressMilestone[] = [
  {
    id: 'm1',
    title: 'חוקר/ת הריקוד הקטן',
    titleEn: 'Small Dance Explorer',
    description: 'עמידה קשובה והבחנה במיקרו-התאמות השלד מול כוח המשיכה',
    descriptionEn: 'Practiced quiet standing and skeletal micro-adjustments with gravity',
    isUnlocked: true,
    unlockedDate: 'פעיל בגוף',
    unlockedDateEn: 'Embodied',
    category: 'מכניקה ותנועה',
    categoryEn: 'Mechanics & Behavior',
  },
  {
    id: 'm2',
    title: 'בהירות שני הנהרות וקילוף',
    titleEn: 'Two Rivers & Keluf Clarity',
    description: 'סימון 3 מצבי הזרוע ופעימות רגע / סליחה / שלום בחופשיות',
    descriptionEn: 'Practiced 3-arm non-verbal consent and Rega / Slicha / Shalom',
    isUnlocked: true,
    unlockedDate: 'פעיל בגוף',
    unlockedDateEn: 'Embodied',
    category: 'אתיקה ורגש',
    categoryEn: 'Ethics & Emotion',
  },
  {
    id: 'm3',
    title: 'טנסגריטי וספירלות קרקע',
    titleEn: 'Tensegrity & Floor Spirals',
    description: 'פיזור עומס רך לאדמה והמשכת תנופה במעבר משקל',
    descriptionEn: 'Spiraled weight cleanly into floor rebound without bracing',
    isUnlocked: true,
    unlockedDate: 'פעיל בגוף',
    unlockedDateEn: 'Embodied',
    category: 'מכניקה',
    categoryEn: 'Mechanics',
  },
  {
    id: 'm4',
    title: 'מבט Soft Focus ו־360°',
    titleEn: 'Soft Focus & 360° Skin',
    description: 'שמירת קשב היקפי פתוח דרך העור גם בתנועה מורכבת',
    descriptionEn: 'Sustained 360° dorsal skin listening across full room tempo',
    isUnlocked: false,
    category: 'תפיסה',
    categoryEn: 'Perception',
  },
];

const DAY_LABELS_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
const DAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildRollingWeeklySessions(records: MovementRecord[]): DaySessionData[] {
  const now = new Date();
  const days: DaySessionData[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - offset);
    const startMs = d.getTime();
    const endMs = startMs + 24 * 60 * 60 * 1000;
    const dayRecords = records.filter((r) => r.timestampMs >= startMs && r.timestampMs < endMs);
    const hours = Number(
      dayRecords.reduce((sum, r) => sum + (r.durationMinutes || 0) / 60, 0).toFixed(1),
    );
    const depthRating = dayRecords.length
      ? Number(
          (
            dayRecords.reduce((sum, r) => {
              const bal = normalizeRecordAxes(r);
              const avgDev =
                (Math.abs(bal.mechanics) +
                  Math.abs(bal.perception) +
                  Math.abs(bal.behavior) +
                  Math.abs(bal.emotion) +
                  Math.abs(bal.ethics)) /
                5;
              return sum + Math.max(1.5, Math.min(5, 5 - avgDev * 0.65));
            }, 0) / dayRecords.length
          ).toFixed(1),
        )
      : 0;
    const weekday = d.getDay();
    days.push({
      dayLabel: DAY_LABELS_HE[weekday],
      dayLabelEn: DAY_LABELS_EN[weekday],
      hours,
      depthRating,
    });
  }
  return days;
}

function computeTopRecurringParameters(records: MovementRecord[]): RecurringParameterTrend[] {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentWithFlags = records.filter(
    (r) => r.timestampMs >= cutoff && Array.isArray(r.flaggedParameters) && r.flaggedParameters.length > 0,
  );
  const source = recentWithFlags.length
    ? recentWithFlags
    : records.filter((r) => Array.isArray(r.flaggedParameters) && r.flaggedParameters.length > 0);

  const counts = new Map<
    string,
    { total: number; states: Record<AxisRegulationState, number> }
  >();

  source.forEach((rec) => {
    rec.flaggedParameters?.forEach((fp) => {
      const existing = counts.get(fp.paramId) || {
        total: 0,
        states: { under: 0, flow: 0, over: 0 },
      };
      existing.total += 1;
      existing.states[fp.state] = (existing.states[fp.state] || 0) + 1;
      counts.set(fp.paramId, existing);
    });
  });

  const ranked: RecurringParameterTrend[] = [];
  counts.forEach((stats, paramId) => {
    const param = getMatrixParameterById(paramId);
    if (!param) return;
    let dominantState: AxisRegulationState = 'flow';
    if (stats.states.under > stats.states.flow && stats.states.under >= stats.states.over) {
      dominantState = 'under';
    } else if (stats.states.over > stats.states.flow && stats.states.over > stats.states.under) {
      dominantState = 'over';
    }
    ranked.push({
      param,
      count: stats.total,
      dominantState,
    });
  });

  return ranked.sort((a, b) => b.count - a.count).slice(0, 3);
}

export function calculateSomaticProgress(
  records: MovementRecord[],
  profile: DancerProfile,
): SomaticProgress {
  const count = Math.max(records.length, 1);
  const avg = (getter: (r: MovementRecord) => number, fallback: number) =>
    records.length === 0
      ? fallback
      : Math.min(100, Math.max(0, (records.reduce((s, r) => s + getter(r), 0) / count) * 10));

  const normalizedList = records.map(normalizeRecordAxes);
  const avgBal = (axis: ReflectionAxisId): number =>
    normalizedList.length === 0
      ? 0
      : clampBalance(normalizedList.reduce((sum, b) => sum + b[axis], 0) / normalizedList.length);

  const axisBalances: AxisBalances = {
    mechanics: avgBal('mechanics'),
    perception: avgBal('perception'),
    behavior: avgBal('behavior'),
    emotion: avgBal('emotion'),
    ethics: avgBal('ethics'),
  };

  const attunementScore = avg((r) => r.attunementLevel, 88);
  const weightShareScore = avg((r) => r.weightSharingLevel, 84);
  const boundaryScore = avg((r) => r.boundaryClarityLevel, 92);
  const fallingMomentumScore = avg((r) => r.fallingMomentumLevel, 86);
  const groundingScore = avg((r) => r.groundingLevel, 90);
  const nonVerbalScore = avg((r) => r.tactileAttentionLevel, 90);

  const overallIndex =
    (attunementScore +
      weightShareScore +
      boundaryScore +
      fallingMomentumScore +
      groundingScore +
      nonVerbalScore) /
    6;

  return {
    attunementScore,
    weightShareScore,
    boundaryScore,
    fallingMomentumScore,
    groundingScore,
    nonVerbalScore,
    overallIndex,
    axisBalances,
    topRecurringParameters: computeTopRecurringParameters(records),
    levelTitle: profile.levelTitle,
    levelTitleEn: 'Integrative Presence — Here & Now Flow',
    nextLevelTitle: 'הקשבה רב-שכבתית ומחקר סומטי עמוק',
    nextLevelTitleEn: 'Multi-Axis Embodied Research',
    levelProgressPct: Math.min(99, Math.round(54 + records.length * 6.5)),
    textualNarrative:
      'מפת הנוכחות מראה יציבות שלדית נעימה בציר האתיקה והתפיסה, לצד סקרנות פעילה בדינמיקת המשקל והתנופה (Under ↔ Flow ↔ Over).',
    textualNarrativeEn:
      'Presence map highlights grounded clarity across Ethics and Perception, with lively curiosity tuning Mechanics and LMA dynamics.',
    weeklySessions: buildRollingWeeklySessions(records),
    milestones: BASELINE_MILESTONES.map((m) =>
      m.id === 'm4' && records.length >= 5
        ? { ...m, isUnlocked: true, unlockedDate: 'פעיל לאחרונה', unlockedDateEn: 'Recently active' }
        : m,
    ),
  };
}

export const SOMATIC_GUIDE_TOPICS: SomaticGuideTopic[] = [
  // LENS 1: Philosophy & Architecture
  {
    id: 'GUIDE_APP_OVERVIEW',
    guideSection: 'philosophy',
    titleHe: 'מדריך EYE-on-CI · תפיסה ומבנה',
    titleEn: 'EYE-on-CI v2.0 · Philosophy & Architecture',
    subtitleHe: 'חיבור בין נוכחות רכה כאן ועכשיו לבין מודל ויסות Under ↔ Flow ↔ Over',
    subtitleEn: 'Uniting non-numeric Here & Now presence with Under ↔ Flow ↔ Over regulation',
    goalHe: 'להעניק לרקדנים ומדריכים מצפן שפתי ותחושתי רך המבחין בין קושי של תת-ויסות (Under) לקושי של עודף (Over), בלי ציונים הישגיים.',
    goalEn: 'Offer dancers and teachers a compassionate qualitative compass distinguishing Under-response from Over-response without competitive grading.',
    mechanismHe: 'מערכת תלת-קוטבית: קוטב שמאלי Under (-5) · מרכז שיא Flow (0) · קוטב ימני Over (+5) על פני 5 צירי עומק ו-150 פרמטרים.',
    mechanismEn: 'Tri-polar regulation model: Under (-5) ↔ integrative Flow (0 center ring) ↔ Over (+5) across 5 macro-axes and 150 diagnostic parameters.',
    explanationHe:
      'במקום לדרוש מרקדן "ציון 1 עד 10", EYE-on-CI מבחינה שכל קושי בתנועה נובע מאחת משתי נטיות קוטביות: תת-תגובה (החזקה, נוקשות, קפיאה, ריצוי שבשתיקה) או תגובת יתר (קריסה, הצפה, פזיזות, משטור נוקשה). שיא האינטגרציה אינו "10" גבוה אלא השקיעה הערנית אל מרכז ה־Flow (0).',
    explanationEn:
      'Rather than grading movement 1–10, EYE-on-CI recognizes that imbalance occurs at two poles: Under-regulation (bracing, freeze, silent compliance) or Over-regulation (weight dumping, sensory flood, rigid policing). Mastery lives at the poised central Flow ring (0).',
    ratingLevels: [],
    practicalTipsHe: [
      'עבור בין 4 עדשות המדריך למעלה: פילוסופיה ומבנה, 5 הצירים ו-150 הפרמטרים, ספריית התרגולים (Scores), וסטודיו מנהל.',
      'לחץ על כל כפתור פעולה חי כדי לפתוח ישירות טיימר תרגול, מסך +תעוד מהיר/עמוק או יומן תנועה.',
    ],
    practicalTipsEn: [
      'Switch between the 4 lenses above: Philosophy, 5 Axes & 150 Matrix, 6 Guided Scores, and Manager CMS.',
      'Click any live Deep Link below each card to launch interactive score timers, reflection modes, or journal views.',
    ],
    quickActions: [
      { labelHe: 'כאן ועכשיו + תרגול מותאם', labelEn: 'Here & Now + Smart Score', target: 'progress', accentColor: '#0F766E' },
      { labelHe: 'פתח +תעוד מהיר (3 דק׳)', labelEn: 'Open Quick +Log (3m)', target: 'reflection', reflectionMode: 'quick', accentColor: '#F36523' },
      { labelHe: 'פתח אבחון עומק (150 פרמטרים)', labelEn: 'Open Deep Matrix (150)', target: 'reflection', reflectionMode: 'deep', accentColor: '#4F46E5' },
      { labelHe: 'השוואת אחסון (מקומי / ענן)', labelEn: 'Storage Options', target: 'storage', accentColor: '#047857' },
    ],
  },
  {
    id: 'GUIDE_STRUCTURE_MAP',
    guideSection: 'philosophy',
    titleHe: '4 מסלולי השימוש באפליקציה (User Tracks)',
    titleEn: 'The 4 Guided User Tracks in v2.0',
    subtitleHe: 'מסלול 1: כאן ועכשיו · מסלול 2: +תעוד דואלי · מסלול 3: יומן ומגמות · מסלול 4: חקירות 6 נושאים',
    subtitleEn: 'Track 1: Here & Now · Track 2: Dual +Log · Track 3: Journal Trends · Track 4: 6 Literature Inquiries',
    explanationHe:
      '• מסלול 1 (כאן ועכשיו): צ׳ק-אין רגשי-תחושתי שמציג מיד כרטיס תרגול מותאם לטון הגוף (Tone-Matched Score).\n• מסלול 2 (+תעוד דואלי): מצב מהיר (5 מחווני Flow מילוליים ב־3 דק׳) או מחקר עומק (סריקת 150 פרמטרים + הצעה לתיקון מידי).\n• מסלול 3 (יומן ו-3 טבעות): מכ״ם 5 טבעות חוזר אוטומטית + חישוב 3 פרמטרים חוזרים ב־30 הימים האחרונים.\n• מסלול 4 (חקירות ו-Flashcards): 6 דיאלוגים מבוססי מחקר (פקסטון, BMC, דימוק, דמאסיו/גאלזה, קיו/בליי/זוהר ר., ארנדט).',
    explanationEn:
      '• Track 1 (Here & Now): somatic check-in that recommends and launches a Tone-Matched Guided Score directly.\n• Track 2 (Dual +Log): Quick 3-min mode (5 tri-polar qualitative sliders) or Deep Research & 1:1 Clinic (150 searchable parameters).\n• Track 3 (Journal & 3-Ring Radar): Pentagon Flow radar + Top 3 Recurring Parameters from the past 30 days.\n• Track 4 (6 Updated Inquiries): Literature-grounded AI dialogues and flip cards across Paxton, BMC, Dimock, Gallese/Damasio, Keogh/Bly/Zohar R., and Arendt.',
    ratingLevels: [],
    practicalTipsHe: [
      'במחקר עומק, תיוג של פרמטר כ-Under או Over מקפיץ שאלה מנחה וכפתור הפעלה ישיר לתרגול המתאים.',
    ],
    practicalTipsEn: [
      'In Deep Research, tagging any parameter as Under or Over reveals its reflection question and instant corrective Score launcher.',
    ],
    quickActions: [
      { labelHe: 'יומן התנועה ומגמות 30 יום', labelEn: 'Journal & 30-Day Trends', target: 'records', accentColor: '#1D4ED8' },
      { labelHe: 'פתח 6 חקירות עומק', labelEn: 'Open 6 v2.0 Inquiries', target: 'inquiries', accentColor: '#6D28D9' },
    ],
  },

  // LENS 2: 5 Macro-Axes & 150 Parameters Matrix
  {
    id: 'AXIS_MECHANICS',
    guideSection: 'axes_matrix',
    titleHe: 'ציר 1: מכניקה, פיזיקה ומורפולוגיה (30 פרמטרים)',
    titleEn: 'Axis 1: Mechanics, Physics & Morphology (30 Parameters)',
    subtitleHe: 'שיתוף משקל, טנסגריטי, נקודה מתגלגלת, Following Through וסגנונות נפילה',
    subtitleEn: 'Weight sharing, tensegrity, rolling contact point & falling spirals',
    axisType: 'mechanics',
    explanationHe:
      'חוקר כיצד המסה פוגשת כבידה ואת גוף הפרטנר. באיזון Flow, עצמות נושאות את העומס בטנסגריטי קפיצי והמשקל זורם בקשת; ב־Under נשמרת החזקה שרירית נמנעת; ב־Over מתרחשת קריסת משקל או האצה ללא קרקוע.',
    explanationEn:
      'Examines how mass interacts with gravity and partner structure. In Flow, skeletal tensegrity carries weight smoothly in counterbalance; Under shows defensive bracing; Over shows abrupt dumping or ungrounded speed.',
    ratingLevels: [
      { range: 'Under (-5..-1)', labelHe: 'החזקה ונוקשות שרירית', labelEn: 'Muscular Bracing & Holding', descriptionHe: 'הימנעות מהישענות, בלימה בשורשי כף יד ונעילת מפרקים.', descriptionEn: 'Holding own weight tightly, locked knees, and rigid braking.', color: '#D97706' },
      { range: 'Flow (0)', labelHe: 'זרימת מסה וטנסגריטי', labelEn: 'Skeletal Ease & Counterbalance', descriptionHe: 'נקודת מגע מתגלגלת, קשת משותפת וריבאונד ספירלי לרצפה.', descriptionEn: 'Effortless rolling mass transfer and elastic ground spirals.', color: '#0F766E' },
      { range: 'Over (+1..+5)', labelHe: 'קריסת משקל ואקרובטיקה מאולצת', labelEn: 'Weight Dumping & Reckless Force', descriptionHe: 'זריקת מסה פתאומית על השותף או התרסקות מפרקית.', descriptionEn: 'Dumping sudden unchecked load onto partner neck or back.', color: '#F36523' },
    ],
    practicalTipsHe: [
      'תרגלו שיתוף משקל מגב אל גב והקפידו שהנפילות ייפרסו ספירלית דרך הצלעות.',
    ],
    practicalTipsEn: [
      'Explore counterbalance back-to-back first and let falls widen spirally along ribs.',
    ],
    quickActions: [
      { labelHe: 'פתח טיימר הריקוד הקטן', labelEn: 'Launch Small Dance', target: 'score', scoreId: 'small_dance', accentColor: '#0F766E' },
      { labelHe: 'פתח 30 פרמטרי מכניקה ב־+תעוד', labelEn: 'Open Mechanics Matrix', target: 'reflection', reflectionMode: 'deep', accentColor: '#F36523' },
    ],
  },
  {
    id: 'AXIS_PERCEPTION',
    guideSection: 'axes_matrix',
    titleHe: 'ציר 2: תפיסה, חישה וקשב עורי (30 פרמטרים)',
    titleEn: 'Axis 2: Perception & Sensory Listening (30 Parameters)',
    subtitleHe: 'מסת נוזלים (90% מים), עור כמוח שני, Soft Focus והקרום המשתנה של דימוק',
    subtitleEn: '90% Fluid Mass, Skin-Brain Alliance, Soft Focus & Dimock Variable Membrane',
    axisType: 'perception',
    explanationHe:
      'ממפה את ערוצי הקלט החושי: ממגבלת מבט אנליטי ממוקד (Under) ועד חשיפה חושית מציפה ומטושטשת (Over). איכות Flow חיה בראייה פנורמית 180°, עור 360° קולט והפיכות חמימה של המגע.',
    explanationEn:
      'Maps sensory input bandwidth: from narrow staring and numbing (Under) to sensory flooding and blurred boundaries (Over). Flow unfolds through Soft Focus 180°, 360° skin listening, and calm porosity.',
    ratingLevels: [
      { range: 'Under (-5..-1)', labelHe: 'ראייה ממוקדת ונסיגה מחישה', labelEn: 'Tunnel Vision & Numbing', descriptionHe: 'הסתמכות בלעדית על מראה והתעלמות ממגע גב ושכמות.', descriptionEn: 'Staring rigidly forward while dorsal skin stays numb.', color: '#D97706' },
      { range: 'Flow (0)', labelHe: 'עור נושם ו־Soft Focus', labelEn: '360° Skin & Soft Focus', descriptionHe: 'תפיסה היקפית של תנועה, אוויר ושינוי טונוס עדין.', descriptionEn: 'Panoramic intake reading tiny pressure and breath cues.', color: '#0F766E' },
      { range: 'Over (+1..+5)', labelHe: 'הצפה וחוסר סינון', labelEn: 'Sensory Overload & Merging', descriptionHe: 'קליטת יתר רועשת המטשטשת בין גופי לגוף הפרטנר.', descriptionEn: 'Dizziness and losing clarity of your own bodily edge.', color: '#2A82C5' },
    ],
    practicalTipsHe: [
      'בצעו 4 דקות של Sensory Tuning לפני מפגש כדי לעבור לתודעת 90% מים.',
    ],
    practicalTipsEn: [
      'Run 4-min Sensory Tuning pre-jam to shift smoothly into fluid awareness.',
    ],
    quickActions: [
      { labelHe: 'הפעל כוונון סנסורי 4 דק׳', labelEn: 'Launch 4-Min Tuning', target: 'score', scoreId: 'sensory_tuning', accentColor: '#2A82C5' },
      { labelHe: 'הפעל מרפאת מחקר 1:1 (20 דק׳)', labelEn: 'Launch 20-Min Clinic Timer', target: 'score', scoreId: 'clinic_1on1', accentColor: '#6D28D9' },
    ],
  },
  {
    id: 'AXIS_BEHAVIOR',
    guideSection: 'axes_matrix',
    titleHe: 'ציר 3: תנועה, ביצוע וזיקות לאבאן (30 פרמטרים)',
    titleEn: 'Axis 3: Movement Behavior & LMA Dynamics (30 Parameters)',
    subtitleHe: 'בינה חייתית, הריקוד הקטן, גמישות זרימה ועלייה/שקיעה/פתיחה (Tsachor & Shafir)',
    subtitleEn: 'Animal Intelligence, Small Dance & LMA Effort/Shape versatility',
    axisType: 'behavior',
    explanationHe:
      'מבטא את אופן הפקת הפעולה והמקצב בגוף. תת-ויסות מתבטא בזרימה כבולה (Bound) והססנות קטועה; ויסות-יתר בתזזית פרועה וללא מרווחי נשימה; Flow מאזן בין קפיציות, עצירה ופיסוק תנועתי יצירתי.',
    explanationEn:
      'Captures active phrasing and adaptive momentum. Under reads as bound hesitant repetition; Over reads as relentless chaotic pacing; Flow weaves bound precision, free spirals, and calm transitions.',
    ratingLevels: [
      { range: 'Under (-5..-1)', labelHe: 'זרימה כבולה וקיפאון הרגלי', labelEn: 'Bound Flow & Hesitation', descriptionHe: 'בלימת תנופה חפוזה ומעברים קטועים.', descriptionEn: 'Chopping movement phrases short out of caution.', color: '#D97706' },
      { range: 'Flow (0)', labelHe: 'זיקות לאבאן גמישות', labelEn: 'Adaptive LMA Phrasing', descriptionHe: 'השמטת תנופה רכה, מעברי גובה חלקים והומור בחיפוש.', descriptionEn: 'Seamless level changes and spontaneous animal reflexes.', color: '#0F766E' },
      { range: 'Over (+1..+5)', labelHe: 'תזזית פרועה והפגנת ראווה', labelEn: 'Runaway Momentum & Spectacle', descriptionHe: 'רצף תנועה אינסופי בלי נשימה והרמות למען רושם.', descriptionEn: 'Non-stop unpaced energy chasing flashy aerial tricks.', color: '#4F46E5' },
    ],
    practicalTipsHe: [
      'בדקו ב־LMA Resiliency איך עלייה, שקיעה או פתיחה צדדית מרחיבות את קשת התגובות שלכם.',
    ],
    practicalTipsEn: [
      'Use the LMA Resiliency score matched to your current mood to diversify phrasing.',
    ],
    quickActions: [
      { labelHe: 'הפעל רצף לאבאן (LMA)', labelEn: 'Launch LMA Resiliency', target: 'score', scoreId: 'lma_resiliency', accentColor: '#4F46E5' },
      { labelHe: 'פתח 30 פרמטרי תנועה', labelEn: 'Open Behavior Matrix', target: 'reflection', reflectionMode: 'deep', accentColor: '#4F46E5' },
    ],
  },
  {
    id: 'AXIS_EMOTION',
    guideSection: 'axes_matrix',
    titleHe: 'ציר 4: ויסות רגשי ודינמיקה בינאישית (30 פרמטרים)',
    titleEn: 'Axis 4: Emotional Regulation & Relating (30 Parameters)',
    subtitleHe: 'אמפתיה קינסטטית (Gallese / Damasio), שבירה ותיקון, קילוף התפוז (Zohar R.)',
    subtitleEn: 'Kinesthetic empathy golden mean, Rupture/Repair & Keluf (Zohar R.)',
    axisType: 'emotion',
    explanationHe:
      'מלווה את עולם הרגש במגע: הימנעות מבושה וניתוק קר בקוטב Under, מול מיזוג והצפה רגשית בקוטב Over. תרגול קילוף התפוז ("רגע / סליחה / שלום") שומר על חום וקרבה נטולי אשמה.',
    explanationEn:
      'Tracks relational resilience: cold detachment or silent appeasement on the Under pole vs. emotional spillover and enmeshment on Over. Keluf (Rega / Slicha / Shalom) fosters calm repair.',
    ratingLevels: [
      { range: 'Under (-5..-1)', labelHe: 'ניתוק שריוני או קפיאה מבושה', labelEn: 'Armoring or Shame-Freeze', descriptionHe: 'הימנעות מקירבה והסתרת אי-נחת מאחורי שקט מרוחק.', descriptionEn: 'Shutting down warmth or hiding awkwardness silently.', color: '#D97706' },
      { range: 'Flow (0)', labelHe: 'טווח הזהב — הדהוד ונפרדות', labelEn: 'Golden Mean Empathy & Repair', descriptionHe: 'אמפתיה חמה שמחזיקה שני עצמיים שלמים ותיקון זריז.', descriptionEn: 'Warm kinesthetic resonance anchored in distinct personal ground.', color: '#0F766E' },
      { range: 'Over (+1..+5)', labelHe: 'מיזוג מציף והאשמה', labelEn: 'Enmeshment & Spillover', descriptionHe: 'ספיגת מצוקת השותף או התפרצות מבוהלת בחוסר סנכרון.', descriptionEn: 'Taking on partner stress as your own or sharp blaming.', color: '#7C3AED' },
    ],
    practicalTipsHe: [
      'העזו לומר "רגע" או "סליחה" באמצע דואט כדי לאפשר למערכת העצבים לנחות.',
    ],
    practicalTipsEn: [
      'Offer a friendly "Rega" pause mid-duet whenever intensity swells.',
    ],
    quickActions: [
      { labelHe: 'הפעל תרגול קילוף התפוז', labelEn: 'Launch Keluf Score', target: 'score', scoreId: 'keluf', accentColor: '#F36523' },
      { labelHe: 'תעד ב־+תעוד', labelEn: 'Log Emotion Balance', target: 'reflection', reflectionMode: 'quick', accentColor: '#7C3AED' },
    ],
  },
  {
    id: 'AXIS_ETHICS',
    guideSection: 'axes_matrix',
    titleHe: 'ציר 5: אתיקה, הסכמה ומרקם קהילתי (30 פרמטרים)',
    titleEn: 'Axis 5: Ethics, Consent & Community (30 Parameters)',
    subtitleHe: 'שני הנהרות (Keogh), ידית הדלת, פערי כוח, דמוקרטיה בג׳אם ו״טבעות בעץ״',
    subtitleEn: 'Two Rivers (Keogh), Door Handle, Power-With (Arendt) & "Rings in a Tree"',
    axisType: 'ethics',
    explanationHe:
      'מביא את האתיקה לתוך הגוף: תת-הסכמה מתבטאת בהיגררות של "לא נעים לומר לא"; עודף מתבטא בפטרונות או בהערות הוראה לא מבוקשות. איכות Flow מצמיחה קהילה שוויונית וחומלת.',
    explanationEn:
      'Brings community ethics into motion: Under appears as mute compliance or hierarchy deference; Over appears as patronizing unsolicited teaching or anxious policing. Flow cultivates Power-With and open door agency.',
    ratingLevels: [
      { range: 'Under (-5..-1)', labelHe: 'הסכמה שבשתיקה וויתור עצמי', labelEn: 'Silent Compliance & Deference', descriptionHe: 'התמדה בתנוחה כואבת מתוך חוסר נוחות לסמן עצירה.', descriptionEn: 'Enduring unwanted lifts to avoid upsetting a veteran dancer.', color: '#D97706' },
      { range: 'Flow (0)', labelHe: '״לא״ בהיר ודמוקרטיה במרחב', labelEn: 'Clear "No" & Jam Democracy', descriptionHe: 'ידית דלת זמינה, איזון פערי כוח ואחריות שמורה לכולם.', descriptionEn: 'Unobstructed door handle and shared floor safety across ages.', color: '#0F766E' },
      { range: 'Over (+1..+5)', labelHe: 'משטור, הטפה והדרה סמויה', labelEn: 'Unsolicited Teaching & Gatekeeping', descriptionHe: 'שימוש בוותק לשליטה בדואט או שיפוטיות כלפי קצב איטי.', descriptionEn: 'Fixing partner posture unasked or pushing intense pace.', color: '#DC2626' },
    ],
    practicalTipsHe: [
      'זכרו: הג׳אם הוא "מלטשת סלעים" שוויונית — הימנעו מהעברת שיעורים לא מבוקשים באמצע ריקוד.',
    ],
    practicalTipsEn: [
      'Remember: keep jams free of unsolicited lecturing and full of free choice.',
    ],
    quickActions: [
      { labelHe: 'סימולטור שני הנהרות', labelEn: 'Two Rivers Simulator', target: 'score', scoreId: 'two_rivers', accentColor: '#D97706' },
      { labelHe: 'חקירת פרדוקס ההסכמה', labelEn: 'Consent Inquiry', target: 'inquiries', accentColor: '#6D28D9' },
    ],
  },

  // LENS 3: Interactive Guided Scores Library
  {
    id: 'SCORE_SMALL_DANCE',
    guideSection: 'scores',
    titleHe: '1. הריקוד הקטן (The Small Dance · פקסטון)',
    titleEn: '1. The Small Dance (Steve Paxton)',
    subtitleHe: 'טיימר מודרך בן 4 שלבים עם מדריך נשימה ופעמון עדין',
    subtitleEn: '4-stage guided standing score with breathing aura & soft chimes',
    explanationHe:
      'מכוונן את השלד בעמידה שקטה לחישת המיקרו-רפלקסים מול כוח המשיכה לפני תחילת מגע.',
    explanationEn:
      'Calibrates skeletal reflexes in quiet standing so you feel earth support before initiating weight contact.',
    ratingLevels: [],
    practicalTipsHe: ['הפעל בכל פתיחת בוקר או בכניסה לג׳אם ערב.'],
    practicalTipsEn: ['Run whenever entering a quiet morning warm-up or studio jam.'],
    quickActions: [
      { labelHe: 'הפעל את הריקוד הקטן עכשיו', labelEn: 'Launch Small Dance Timer', target: 'score', scoreId: 'small_dance', accentColor: '#0F766E' },
    ],
  },
  {
    id: 'SCORE_SENSORY_TUNING',
    guideSection: 'scores',
    titleHe: '2. צ׳ק-ליסט כוונון סנסורי 4 דקות',
    titleEn: '2. Sensory Tuning-In Checklist (4 Min)',
    subtitleHe: 'כבידה (1m) → 90% מים (1m) → עור 360° (1m) → ראיית Soft Focus (1m)',
    subtitleEn: 'Gravity (1m) → 90% Water (1m) → 360° Skin (1m) → Soft Focus (1m)',
    explanationHe:
      'ארבע דקות של מעבר שיטתי מתודעת משימות צרה להקשבה נוזלית והיקפית.',
    explanationEn:
      'Four continuous minutes shifting deliberately from narrow task focus into fluid panoramic perception.',
    ratingLevels: [],
    practicalTipsHe: ['שימושי במיוחד כשהגענו לג׳אם ישר מיום עבודה מנטלי.'],
    practicalTipsEn: ['Ideal when arriving straight from analytical desk work onto mats.'],
    quickActions: [
      { labelHe: 'הפעל כוונון 4 דקות', labelEn: 'Launch Sensory Tuning', target: 'score', scoreId: 'sensory_tuning', accentColor: '#2A82C5' },
    ],
  },
  {
    id: 'SCORE_TWO_RIVERS',
    guideSection: 'scores',
    titleHe: '3. תרגול "שני הנהרות" ו־3 מצבי הזרוע (קיו)',
    titleEn: '3. Two Rivers Non-Verbal Consent Trainer',
    subtitleHe: 'סימולטור והנחיה זוגית ליד פתוחה (כן) · אמה מורמת (המתן) · כף יד מושטת (לא)',
    subtitleEn: 'Interactive Open Palm (Yes) · Raised Forearm (Wait) · Extended Palm (No)',
    explanationHe:
      'מאמן תקשורת הסכמה מהירה, מכובדת ונטולת מבוכה דרך שלושה אותות גוף מוסכמים.',
    explanationEn:
      'Builds instant fluency across three clean arm signals so boundary changes require zero apology.',
    ratingLevels: [],
    practicalTipsHe: ['לחץ על שלושת הכרטיסים האינטראקטיביים בתוך הטיימר לתרגול מהיר בזוגות.'],
    practicalTipsEn: ['Tap through the 3 interactive arm cards inside the modal while practicing in pairs.'],
    quickActions: [
      { labelHe: 'פתח סימולטור שני הנהרות', labelEn: 'Launch Two Rivers Trainer', target: 'score', scoreId: 'two_rivers', accentColor: '#D97706' },
    ],
  },
  {
    id: 'SCORE_KELUF',
    guideSection: 'scores',
    titleHe: '4. "קילוף התפוז" (Keluf · Zohar R.)',
    titleEn: '4. Orange Peeling (Keluf · Zohar R.)',
    subtitleHe: '5 פעימות: קילוף מניירות · חישת פלחים · רגע · סליחה · שלום',
    subtitleEn: '5 Pulses: Peel · Segments · Rega · Slicha · Shalom',
    explanationHe:
      'מסגרת רכה לחשיפת מגע אותנטי ללא צורך ב"רקדנות" מרשימה, תוך מתן מקום ברור להפסקת ויסות.',
    explanationEn:
      'A gentle partner score peeling performative pressure and welcoming clear Rega/Slicha recovery pauses.',
    ratingLevels: [],
    practicalTipsHe: ['תעד בסיום איזה שלב מקילוף התפוז ליווה את המפגש בתוך +תעוד.'],
    practicalTipsEn: ['Log which Keluf pulse colored your duet inside +Log afterward.'],
    quickActions: [
      { labelHe: 'הפעל תרגול קילוף התפוז', labelEn: 'Launch Keluf Score', target: 'score', scoreId: 'keluf', accentColor: '#F36523' },
    ],
  },
  {
    id: 'SCORE_LMA_RESILIENCY',
    guideSection: 'scores',
    titleHe: '5. זיקות לאבאן לוויסות רגשי (Tsachor & Shafir)',
    titleEn: '5. LMA Emotional Resiliency (Dynamic)',
    subtitleHe: 'מתאים את הרצף חי לפי הטון שלך ב"כאן ועכשיו"',
    subtitleEn: 'Automatically tailored to your active Here & Now tone',
    explanationHe:
      '• טון רך/שקט ← עלייה, התרוממות וקלילות (Rise / Light).\n• טון מבקש קרקע ← שקיעה והתכנסות (Sink / Enclose).\n• טון סקרן/חי ← פתיחה צדדית ועקיפות (Side-Open / Spread / Indirect).',
    explanationEn:
      '• Tender/Calm → Upwards/Rise/Light.\n• Ground-seeking → Downwards/Sink/Enclose.\n• Curious/Energized → Side-Open/Spread/Indirect.',
    ratingLevels: [],
    practicalTipsHe: ['שנה טון בכאן ועכשיו וצפה בהנחיה המדויקת בטיימר משתנה עבורך מיד.'],
    practicalTipsEn: ['Change your Here & Now tone and watch this score re-adapt immediately.'],
    quickActions: [
      { labelHe: 'הפעל LMA לפי הטון שלי', labelEn: 'Launch Tone-Matched LMA', target: 'score', scoreId: 'lma_resiliency', accentColor: '#4F46E5' },
      { labelHe: 'החלף טון בכאן ועכשיו', labelEn: 'Switch Tone in Here & Now', target: 'progress', accentColor: '#0F766E' },
    ],
  },
  {
    id: 'SCORE_CLINIC_1ON1',
    guideSection: 'scores',
    titleHe: '6. מרפאת מחקר 1:1 (20 דקות אוטומטי)',
    titleEn: '6. 1:1 Embodied Clinic Timer (20 Min)',
    subtitleHe: '5 דק׳ שאלה וחוזה → 10 דק׳ חקירה → 5 דק׳ עצירה ואינטגרציה',
    subtitleEn: '5m Contract → 10m Guided Inquiry → 5m Stop & Integration',
    explanationHe:
      'טיימר אוטומטי מלא למחקר 1:1 עם צליל פעמון רך במעבר בין שלבים וחיבור ישיר למטריצת 150 הפרמטרים ב־+תעוד.',
    explanationEn:
      'Automated 20-minute duet laboratory with gentle bells between chapters and direct handoff to 150-parameter Deep Research logging.',
    ratingLevels: [],
    practicalTipsHe: ['הניחו את המכשיר בצד המזרן והיעזרו בפעמונים לסימון המעבר לשלב האינטגרציה.'],
    practicalTipsEn: ['Set the screen softly at mat edge and let chimes guide phase shifts hands-free.'],
    quickActions: [
      { labelHe: 'הפעל טיימר מרפאת 20 דקות', labelEn: 'Start 20-Min Clinic Timer', target: 'score', scoreId: 'clinic_1on1', accentColor: '#6D28D9' },
      { labelHe: 'תעד ממצאים באבחון עומק', labelEn: 'Log Deep Research', target: 'reflection', reflectionMode: 'deep', accentColor: '#4F46E5' },
    ],
  },

  // LENS 4: Manager & CMS Operations
  {
    id: 'GUIDE_MANAGER_WORKFLOW',
    guideSection: 'manager',
    titleHe: 'סטודיו מנהל v2.0 — כותרות, תרגולים ומטריצה',
    titleEn: 'Manager Studio v2.0 — CMS, Scores & Matrix Notes',
    subtitleHe: 'ניהול כותרות, חיבור Score לכרטיסיות תרגול, הדגשת פרמטרים ומשוב קהילתי',
    subtitleEn: 'Manage titles, link Scores to Practice Cards, highlight Matrix parameters & reply to feedback',
    explanationHe:
      'בסטודיו מנהל החדש ניתן לשייך כל כרטיסיית תרגול לאחד מ־5 הצירים החדשים ולקשר לה תרגול אינטראקטיבי מתוך 6 ה־Scores, לייבא טקסטים מ־Google Docs / NotebookLM עם AI, לצפות במשובי משתמשים ולסמן פרמטרים מומלצים במטריצת 150 הפרמטרים.',
    explanationEn:
      'In Manager Studio v2.0, assign Practice Cards to the 5 canonical axes, link any of the 6 Interactive Scores directly, import Google Docs / NotebookLM materials via Gemini, reply to user feedback, and annotate Matrix parameters.',
    ratingLevels: [],
    practicalTipsHe: [
      'בדוק את לשונית "הדגשות במטריצה" בסטודיו כדי להצמיד הערת הנחיה לפרמטרים מסוימים.',
    ],
    practicalTipsEn: [
      'Use Matrix Highlights in Studio to pin teaching notes onto specific study parameters.',
    ],
    quickActions: [
      { labelHe: 'עבור לסטודיו מנהל', labelEn: 'Open Manager Studio', target: 'manager', accentColor: '#3730A3' },
      { labelHe: 'שלח משוב / הצעה', labelEn: 'Send Feedback', target: 'feedback', accentColor: '#F36523' },
      { labelHe: 'אודות ופרטי פיתוח (Zohar R.)', labelEn: 'About & Developer Contact', target: 'about', accentColor: '#0F766E' },
    ],
  },
];

const LEGACY_TOPIC_ALIAS: Record<string, SomaticGuideTopicId> = {
  AXIS_WEIGHT_SHARING: 'AXIS_MECHANICS',
  AXIS_FALLING_MOMENTUM: 'AXIS_MECHANICS',
  AXIS_ATTUNEMENT: 'AXIS_PERCEPTION',
  AXIS_TACTILE_ATTENTION: 'AXIS_PERCEPTION',
  AXIS_GROUNDING: 'AXIS_BEHAVIOR',
  AXIS_BOUNDARIES: 'AXIS_ETHICS',
};

export function getGuideTopicById(id: SomaticGuideTopicId): SomaticGuideTopic {
  const mappedId = LEGACY_TOPIC_ALIAS[id] || id;
  return SOMATIC_GUIDE_TOPICS.find((t) => t.id === mappedId) || SOMATIC_GUIDE_TOPICS[0];
}

export const DEFAULT_SITE_CONFIG: SiteContentConfig = {
  id: 'main',
  brandName: 'EYE-on-CI',
  brandTaglineHe: 'מצפן סומטי לקונטקט אימפרוביזציה',
  brandTaglineEn: 'Somatic Compass for Contact Improvisation',
  homeKickerHe: 'כאן ועכשיו ב־EYE-on-CI',
  homeKickerEn: 'EYE-on-CI · Here & Now',
  homeTitleHe: 'מרחב רך להקשבה, תנועה ואימפרוביזציה במגע',
  homeTitleEn: 'A Soft Space for Listening, Movement & Contact',
  homeSubtitleHe:
    'רפלקציה תלת-קוטבית (Under ↔ Flow ↔ Over) על פני 5 צירים ו־150 פרמטרים, 6 תרגולי Scores מודרכים ונוכחות עדינה.',
  homeSubtitleEn:
    'Tri-polar reflection (Under ↔ Flow ↔ Over) across 5 somatic axes & 150 parameters, 6 guided Scores, and mindful presence.',
  practiceSectionTitleHe: 'כרטיסיות תרגול ו־6 ה־Scores המודרכים',
  practiceSectionTitleEn: 'Practice Cards & 6 Interactive Scores',
  aboutTitleHe: 'אודות EYE-on-CI',
  aboutTitleEn: 'About EYE-on-CI',
  aboutDescriptionHe:
    'EYE-on-CI היא סביבת מחקר, תרגול ורפלקציה לרקדני אימפרוביזציה במגע. המערכת מחברת את מסורת פקסטון, לפקוף, BMC/ג׳והאן, דימוק, דמאסיו/גאלזה, קיו, בליי וארנדט אל מצפן תלת-קוטבי מכיל (Under ↔ Flow ↔ Over), תרגול קילוף התפוז (Zohar R.) ומחקר עומק של 150 פרמטרים.',
  aboutDescriptionEn:
    'EYE-on-CI is a somatic reflection lab for Contact Improvisation dancers. It weaves Paxton, Lepkoff, BMC/Juhan, Dimock, Damasio/Gallese, Keogh, Bly, and Arendt into a humane tri-polar compass (Under ↔ Flow ↔ Over), Keluf practice (Zohar R.), and 150 study parameters.',
  aboutPhilosophyHe:
    'ללא דירוגי הישגיות וללא מבחן: שיא הבשלות היא איכות Flow מאוזנת וקשובה בין תת-תגובה לעודף, עם זכות תמידית להאט ולפגוש "ידית דלת" פתוחה.',
  aboutPhilosophyEn:
    'Beyond numeric performance scores: seeking living Flow between Under-holding and Over-intensity, with an always-open door handle to pause with grace.',
  developerName: 'Zohar R.',
  developerRoleHe: 'יוזם, עיצוב סומטי ופיתוח אפליקציה',
  developerRoleEn: 'Creator, Somatic Design & App Engineering',
  developerEmail: 'zoharrb@gmail.com',
  developerWebsite: 'https://contactways.app',
  authorEmail: 'zoharrb@gmail.com',
};
