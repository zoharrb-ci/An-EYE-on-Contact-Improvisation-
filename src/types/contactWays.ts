export type AppLanguageCode =
  | 'he'
  | 'en'
  | 'it'
  | 'de'
  | 'es'
  | 'uk'
  | 'pt'
  | 'ru'
  | 'ko'
  | 'ja';

export interface LanguageMeta {
  code: AppLanguageCode;
  displayLabel: string;
  englishName: string;
  nativeCountry: string;
  toggleBadge: string;
  flagEmoji: string;
  dir: 'rtl' | 'ltr';
  israelOnlyByDefault: boolean;
}

export interface DeviceLocalityInfo {
  languageCode: string;
  countryCode: string;
  timeZoneId: string;
  localeTag: string;
  isIsraelDeviceLocality: boolean;
  source: 'browser' | 'server_header' | 'override';
}

export type ReflectionAxisId =
  | 'mechanics'
  | 'perception'
  | 'behavior'
  | 'emotion'
  | 'ethics';

export type LegacySomaticAxisType =
  | 'ATTUNEMENT'
  | 'WEIGHT_SHARING'
  | 'BOUNDARIES'
  | 'FALLING_MOMENTUM'
  | 'GROUNDING'
  | 'TACTILE_ATTENTION';

export type SomaticAxisType = ReflectionAxisId | LegacySomaticAxisType;

export type AxisRegulationState = 'under' | 'flow' | 'over';

export type AxisBalances = Record<ReflectionAxisId, number>; // -5 .. +5 (0 = Flow)

export interface FlaggedParameter {
  paramId: string;
  state: AxisRegulationState;
}

export interface LocalizedText {
  he: string;
  en: string;
}

export type GuidedScoreId =
  | 'small_dance'
  | 'sensory_tuning'
  | 'two_rivers'
  | 'keluf'
  | 'lma_resiliency'
  | 'clinic_1on1';

export interface GuidedScoreStep {
  titleHe: string;
  titleEn: string;
  durationSec: number;
  instructionHe: string;
  instructionEn: string;
  cuePromptHe?: string;
  cuePromptEn?: string;
}

export interface GuidedScoreConfig {
  id: GuidedScoreId;
  titleHe: string;
  titleEn: string;
  subtitleHe: string;
  subtitleEn: string;
  authorHe: string;
  authorEn: string;
  accentColor: string;
  axisId: ReflectionAxisId;
  hasBreathingGuide?: boolean;
  isTwoRiversInteractive?: boolean;
  isClinic20Min?: boolean;
  steps: GuidedScoreStep[];
}

export interface MatrixParameter {
  id: string;
  axisId: ReflectionAxisId;
  index: number; // 1..30
  title: LocalizedText;
  underDesc: LocalizedText;
  flowDesc: LocalizedText;
  overDesc: LocalizedText;
  reflectionPrompt: LocalizedText;
  suggestedScoreId?: GuidedScoreId;
}

export interface CuratedParameterNote {
  paramId: string;
  highlighted: boolean;
  noteHe: string;
  noteEn: string;
  authorEmail?: string;
}

export type HereAndNowTone = 'calm' | 'curious' | 'tender' | 'energized' | 'grounded';
export type IntentionHorizon = 'today' | 'this_week' | 'next_jams' | 'open';

export interface SupportMoment {
  id: string;
  text: string;
  dateStr: string;
}

export interface PersonalJourney {
  curiosityIds: string[];
  statement: string;
  horizon: IntentionHorizon;
  supportNeeds: string[];
  hereAndNowTone: HereAndNowTone;
  hereAndNowNote: string;
  supportMoments: SupportMoment[];
}

export interface CuriosityCard {
  id: string;
  titleHe: string;
  titleEn: string;
  inviteHe: string;
  inviteEn: string;
  sampleIntentionHe: string;
  sampleIntentionEn: string;
  axisType: ReflectionAxisId;
  accentColor: string;
}

export type RecordViewMode = 'cards' | 'timeline' | 'categorized' | 'compact';
export type ConversationViewMode = 'chat' | 'accordion' | 'insights' | 'flashcards';
export type AppNavTab =
  | 'home'
  | 'reflection'
  | 'records'
  | 'inquiries'
  | 'progress'
  | 'profile'
  | 'manager';

export type StorageMode = 'local' | 'cloud';

export interface MovementRecord {
  id: string;
  title: string;
  dateStr: string;
  jamOrWorkshop: string;
  partner: string;
  durationMinutes: number;
  pillarCategory: string;
  contactPoints: string[];
  // Legacy numeric 1..10 axes retained for backward compatibility & radar fallback
  weightSharingLevel: number;
  attunementLevel: number;
  boundaryClarityLevel: number;
  fallingMomentumLevel: number;
  groundingLevel: number;
  tactileAttentionLevel: number;
  // v2.0 tri-polar Under (-5) <-> Flow (0) <-> Over (+5) fields
  reflectionMode?: 'quick' | 'deep';
  axisBalances?: AxisBalances;
  flaggedParameters?: FlaggedParameter[];
  twoRiversState: string;
  kelufState?: string;
  reflectionNotes: string;
  keyTakeaway: string;
  somaticSensations: string[];
  intentionCheckIn?: string;
  timestampMs: number;
}

export interface SomaticRecommendation {
  id: string;
  shortTitle: string;
  shortTitleEn: string;
  subtitleTag: string;
  subtitleTagEn: string;
  axisType: SomaticAxisType;
  summaryPreview: string;
  fullExplanation: string;
  fullExplanationEn: string;
  practicalSteps: string[];
  practicalStepsEn: string[];
  quoteText: string;
  quoteTextEn: string;
  quoteAuthor: string;
  quoteAuthorEn: string;
  hasInteractivePractice?: boolean;
  scoreId?: GuidedScoreId;
  isCurated?: boolean;
  sourceType?: 'manual' | 'text_upload' | 'google_doc' | 'notebooklm';
  sourceTitle?: string;
  authorEmail?: string;
}

export interface InquiryMessage {
  id: string;
  senderName: string;
  isGuide: boolean;
  text: string;
  timeStr: string;
  contextTip?: string;
}

export interface ConversationInquiry {
  id: string;
  title: string;
  titleEn?: string;
  category: string;
  categoryEn?: string;
  subtitle: string;
  subtitleEn?: string;
  dateStr: string;
  messages: InquiryMessage[];
  summaryInsights: string[];
  summaryInsightsEn?: string[];
  relatedStudyQuestion: string;
  relatedStudyQuestionEn?: string;
  somaticPrinciple: string;
  somaticPrincipleEn?: string;
  authorReference: string;
  isCurated?: boolean;
  sourceType?: 'manual' | 'text_upload' | 'google_doc' | 'notebooklm';
  sourceTitle?: string;
  authorEmail?: string;
}

export interface DancerProfile {
  name: string;
  levelTitle: string;
  bio: string;
  yearsDanced: number;
  primaryRole: string;
  touchPreference: string;
  activeIntentions: string[];
  totalJamHours: number;
  currentStreakWeeks: number;
  completedInquiriesCount: number;
  savedRecordsCount: number;
  personalJourney?: PersonalJourney;
}

export interface ProgressMilestone {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  isUnlocked: boolean;
  unlockedDate?: string;
  unlockedDateEn?: string;
  category: string;
  categoryEn: string;
}

export interface DaySessionData {
  dayLabel: string;
  dayLabelEn: string;
  hours: number;
  depthRating: number; // 1..5
}

export interface RecurringParameterTrend {
  param: MatrixParameter;
  count: number;
  dominantState: AxisRegulationState;
}

export interface SomaticProgress {
  attunementScore: number; // 0..100
  weightShareScore: number;
  boundaryScore: number;
  fallingMomentumScore: number;
  groundingScore: number;
  nonVerbalScore: number;
  overallIndex: number;
  axisBalances: AxisBalances;
  topRecurringParameters: RecurringParameterTrend[];
  levelTitle: string;
  levelTitleEn: string;
  nextLevelTitle: string;
  nextLevelTitleEn: string;
  levelProgressPct: number;
  textualNarrative: string;
  textualNarrativeEn: string;
  weeklySessions: DaySessionData[];
  milestones: ProgressMilestone[];
}

export type SomaticGuideTopicId =
  | 'AXIS_MECHANICS'
  | 'AXIS_PERCEPTION'
  | 'AXIS_BEHAVIOR'
  | 'AXIS_EMOTION'
  | 'AXIS_ETHICS'
  | 'AXIS_ATTUNEMENT'
  | 'AXIS_WEIGHT_SHARING'
  | 'AXIS_BOUNDARIES'
  | 'AXIS_FALLING_MOMENTUM'
  | 'AXIS_GROUNDING'
  | 'AXIS_TACTILE_ATTENTION'
  | 'PARAM_LIVE_RADAR'
  | 'PARAM_TWO_RIVERS'
  | 'PARAM_KELUF'
  | 'PARAM_CONTACT_POINTS'
  | 'PARAM_REFLECTION_NOTES'
  | 'SCORE_SMALL_DANCE'
  | 'SCORE_SENSORY_TUNING'
  | 'SCORE_TWO_RIVERS'
  | 'SCORE_KELUF'
  | 'SCORE_LMA_RESILIENCY'
  | 'SCORE_CLINIC_1ON1'
  | 'GUIDE_APP_OVERVIEW'
  | 'GUIDE_STRUCTURE_MAP'
  | 'GUIDE_TRACKING_TYPES'
  | 'GUIDE_CARDS_SUGGESTIONS'
  | 'GUIDE_MANAGER_WORKFLOW'
  | 'GUIDE_HOME_DASHBOARD'
  | 'GUIDE_HOME_RECOMMENDATIONS'
  | 'GUIDE_RECORDS_MODES'
  | 'GUIDE_INQUIRIES_MODES'
  | 'GUIDE_PROGRESS_RADAR'
  | 'GUIDE_PROGRESS_WEEKLY'
  | 'GUIDE_PROFILE_INTENTIONS';

export type GuideSectionKey =
  | 'philosophy'
  | 'axes_matrix'
  | 'scores'
  | 'manager';

export type GuideQuickActionTarget =
  | AppNavTab
  | 'score'
  | 'small_dance'
  | 'open_practice'
  | 'storage'
  | 'feedback'
  | 'about';

export interface GuideQuickAction {
  labelHe: string;
  labelEn: string;
  target: GuideQuickActionTarget;
  accentColor?: string;
  sampleRecommendationId?: string;
  scoreId?: GuidedScoreId;
  reflectionMode?: 'quick' | 'deep';
}

export interface RatingLevelGuide {
  range: string;
  labelHe: string;
  labelEn: string;
  descriptionHe: string;
  descriptionEn: string;
  color: string;
}

export interface SomaticGuideTopic {
  id: SomaticGuideTopicId;
  guideSection?: GuideSectionKey;
  titleHe: string;
  titleEn: string;
  subtitleHe: string;
  subtitleEn: string;
  axisType?: SomaticAxisType;
  goalHe?: string;
  goalEn?: string;
  mechanismHe?: string;
  mechanismEn?: string;
  explanationHe: string;
  explanationEn: string;
  ratingLevels: RatingLevelGuide[];
  practicalTipsHe: string[];
  practicalTipsEn: string[];
  reflectionQuestionHe?: string;
  reflectionQuestionEn?: string;
  quickActions?: GuideQuickAction[];
  isCurated?: boolean;
  sourceType?: 'manual' | 'text_upload' | 'google_doc' | 'notebooklm';
  authorEmail?: string;
}

export interface ManagerPrivileges {
  editRecommendationsAndGuides: boolean;
  editInquiriesAndFlashcards: boolean;
  importTextAndNotebookLM: boolean;
}

export interface ManagerAccount {
  email: string;
  displayName: string;
  role: 'manager' | 'super_manager';
  active: boolean;
  privileges: ManagerPrivileges;
  addedBy: string;
  isRoot?: boolean;
}

export interface GoogleDocFileSummary {
  id: string;
  name: string;
  modifiedTime?: string;
}

export interface SiteContentConfig {
  id: string;
  brandName: string;
  brandTaglineHe: string;
  brandTaglineEn: string;
  homeKickerHe: string;
  homeKickerEn: string;
  homeTitleHe: string;
  homeTitleEn: string;
  homeSubtitleHe: string;
  homeSubtitleEn: string;
  practiceSectionTitleHe: string;
  practiceSectionTitleEn: string;
  aboutTitleHe: string;
  aboutTitleEn: string;
  aboutDescriptionHe: string;
  aboutDescriptionEn: string;
  aboutPhilosophyHe: string;
  aboutPhilosophyEn: string;
  developerName: string;
  developerRoleHe: string;
  developerRoleEn: string;
  developerEmail: string;
  developerWebsite: string;
  authorEmail?: string;
}

export type FeedbackCategory = 'idea' | 'bug' | 'content' | 'general';
export type FeedbackStatus = 'new' | 'reviewed' | 'resolved';

export interface UserFeedback {
  id: string;
  uid: string;
  senderName: string;
  senderEmail: string;
  category: FeedbackCategory;
  message: string;
  rating: number; // 0 (unrated) or 1..5
  pageContext: string;
  status: FeedbackStatus;
  managerNote: string;
  createdAtMs: number;
}
