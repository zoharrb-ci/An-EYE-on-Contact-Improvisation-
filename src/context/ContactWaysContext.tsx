import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  AppLanguageCode,
  AppNavTab,
  AxisBalances,
  ConversationInquiry,
  ConversationViewMode,
  CuratedParameterNote,
  DancerProfile,
  DeviceLocalityInfo,
  FeedbackCategory,
  FlaggedParameter,
  GuideQuickAction,
  GuidedScoreId,
  HereAndNowTone,
  ManagerAccount,
  ManagerPrivileges,
  MovementRecord,
  PersonalJourney,
  RecordViewMode,
  SiteContentConfig,
  SomaticGuideTopic,
  SomaticGuideTopicId,
  SomaticProgress,
  SomaticRecommendation,
  StorageMode,
  UserFeedback,
} from '../types/contactWays';
import {
  detectBrowserLocality,
  detectInitialLanguage,
  getLanguageMeta,
  ROOT_SUPER_MANAGER_EMAIL,
  trLang,
} from '../i18n/languages';
import {
  calculateSomaticProgress,
  DEFAULT_SITE_CONFIG,
  deriveLegacyLevelsFromBalances,
  getGuideTopicById,
  INITIAL_DANCER_PROFILE,
  INITIAL_INQUIRIES,
  INITIAL_PERSONAL_JOURNEY,
  INITIAL_RECOMMENDATIONS,
  INITIAL_RECORDS,
  SOMATIC_GUIDE_TOPICS,
} from '../data/seedData';
import {
  clearCachedWorkspaceToken,
  connectGoogleDocsOAuth,
  deleteMovementRecordCloud,
  getCachedWorkspaceToken,
  migrateLocalDataToCloud,
  saveMovementRecordCloud,
  saveUserInquiryThreadCloud,
  saveUserProfileCloud,
  signInWithGoogleAccount,
  signOutAccount,
  subscribeAllFeedbacksManager,
  subscribeAuthState,
  subscribeCuratedCatalog,
  subscribeManagersRoster,
  subscribeOwnFeedbacks,
  subscribeOwnManagerRole,
  subscribeSiteConfig,
  subscribeUserCloudData,
  submitUserFeedbackCloud,
  testFirestoreConnection,
} from '../firebase/firebaseClient';

const LS_KEYS = {
  records: 'ci_web_records_v1',
  profile: 'ci_web_profile_v1',
  inquiryAdds: 'ci_web_inquiry_adds_v1',
  prefs: 'ci_web_prefs_v1',
  storageMode: 'ci_web_storage_mode_v1',
  storageExplained: 'ci_web_storage_explained_v1',
  paramNotes: 'ci_web_param_notes_v1',
};

interface StoredPrefs {
  language?: AppLanguageCode;
  recordMode?: RecordViewMode;
  conversationMode?: ConversationViewMode;
  hasDismissedIntro?: boolean;
}

function readJsonStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

interface InquiryAddons {
  messages: ConversationInquiry['messages'];
  summaryInsights: string[];
}

interface ContactWaysContextValue {
  // Navigation & UI
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  showIntro: boolean;
  dismissIntro: () => void;
  replayIntro: () => void;
  activeGuideTopic: SomaticGuideTopicId | null;
  openGuideTopic: (id: SomaticGuideTopicId) => void;
  closeGuideTopic: () => void;
  executeGuideAction: (action: GuideQuickAction) => void;
  activeScoreId: GuidedScoreId | null;
  activeScoreTone: HereAndNowTone | undefined;
  openScoreTimer: (scoreId: GuidedScoreId, tone?: HereAndNowTone) => void;
  closeScoreTimer: () => void;
  isSmallDanceOpen: boolean;
  setSmallDanceOpen: (open: boolean) => void;
  reflectionModePreset: 'quick' | 'deep';
  setReflectionModePreset: (mode: 'quick' | 'deep') => void;
  isLanguageSearchOpen: boolean;
  setLanguageSearchOpen: (open: boolean) => void;
  isStorageExplainerOpen: boolean;
  setStorageExplainerOpen: (open: boolean) => void;
  isFeedbackOpen: boolean;
  setFeedbackOpen: (open: boolean) => void;
  isAboutOpen: boolean;
  setAboutOpen: (open: boolean) => void;

  // Localization & Locality
  language: AppLanguageCode;
  dir: 'rtl' | 'ltr';
  setLanguage: (lang: AppLanguageCode) => void;
  locality: DeviceLocalityInfo;
  setLocalityIsraelOverride: (isIsrael: boolean) => void;
  tr: (he: string, en: string) => string;

  // Storage & Auth
  storageMode: StorageMode;
  authUser: User | null;
  authBusy: boolean;
  authError: string | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  pendingMigrationCount: number;
  switchToLocalStorage: () => void;
  requestCloudStorageWithSignIn: () => Promise<void>;
  migrateLocalRecordsNow: () => Promise<number>;
  dismissMigrationPrompt: () => void;
  signOutUser: () => Promise<void>;
  resetLocalSampleData: () => void;

  // Google Docs Workspace OAuth (for Managers)
  workspaceToken: string | null;
  connectWorkspaceDocs: () => Promise<string | null>;

  // Core Data
  dancerProfile: DancerProfile;
  personalJourney: PersonalJourney;
  records: MovementRecord[];
  filteredRecords: MovementRecord[];
  selectedRecord: MovementRecord | null;
  setSelectedRecord: (rec: MovementRecord | null) => void;
  recordViewMode: RecordViewMode;
  setRecordViewMode: (mode: RecordViewMode) => void;
  pillarFilter: string;
  setPillarFilter: (pillar: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  recommendations: SomaticRecommendation[];
  selectedRecommendation: SomaticRecommendation | null;
  setSelectedRecommendation: (rec: SomaticRecommendation | null) => void;
  guideTopics: SomaticGuideTopic[];
  inquiries: ConversationInquiry[];
  selectedInquiry: ConversationInquiry | null;
  setSelectedInquiry: (inq: ConversationInquiry | null) => void;
  conversationViewMode: ConversationViewMode;
  setConversationViewMode: (mode: ConversationViewMode) => void;
  somaticProgress: SomaticProgress;
  sendingInquiryId: string | null;

  // Mutations
  saveNewRecord: (input: {
    title: string;
    partner: string;
    jamName: string;
    durationMinutes: number;
    pillarCategory: string;
    contactPoints: string[];
    reflectionMode?: 'quick' | 'deep';
    axisBalances?: AxisBalances;
    flaggedParameters?: FlaggedParameter[];
    weightSharingLevel?: number;
    attunementLevel?: number;
    boundaryClarityLevel?: number;
    fallingMomentumLevel?: number;
    groundingLevel?: number;
    tactileAttentionLevel?: number;
    twoRiversState: string;
    kelufState?: string;
    reflectionNotes: string;
    keyTakeaway: string;
    intentionCheckIn?: string;
    navigateToRecords?: boolean;
  }) => Promise<MovementRecord>;
  deleteRecord: (id: string) => Promise<void>;
  updateDancerProfile: (input: {
    name: string;
    bio: string;
    primaryRole: string;
    touchPreference: string;
    activeIntentions: string[];
    levelTitle?: string;
  }) => Promise<void>;
  updatePersonalJourney: (patch: Partial<PersonalJourney>) => Promise<void>;
  sendInquiryMessage: (inquiryId: string, text: string) => Promise<void>;

  // Site Config, Feedback & Manager/Super Manager RBAC
  siteConfig: SiteContentConfig;
  ownFeedbacks: UserFeedback[];
  allFeedbacks: UserFeedback[];
  submitUserFeedback: (input: {
    category: FeedbackCategory;
    message: string;
    rating: number;
    senderName?: string;
  }) => Promise<UserFeedback>;
  signInOnlyWithGoogle: () => Promise<User | null>;
  curatedParamNotes: Record<string, CuratedParameterNote>;
  saveParamNote: (note: CuratedParameterNote) => void;
  managerAccount: ManagerAccount | null;
  isActiveManager: boolean;
  isSuperManager: boolean;
  managerPrivileges: ManagerPrivileges;
  managersRoster: ManagerAccount[];
}

const ContactWaysContext = createContext<ContactWaysContextValue | null>(null);

export const ContactWaysProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialLocality = useMemo(() => detectBrowserLocality(), []);
  const savedPrefs = useMemo(() => readJsonStorage<StoredPrefs>(LS_KEYS.prefs, {}), []);

  const [locality, setLocality] = useState<DeviceLocalityInfo>(initialLocality);
  const [language, setLanguageState] = useState<AppLanguageCode>(
    savedPrefs.language || detectInitialLanguage(initialLocality),
  );
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<AppNavTab>('home');
  const [activeGuideTopic, setActiveGuideTopic] = useState<SomaticGuideTopicId | null>(null);
  const [activeScoreId, setActiveScoreId] = useState<GuidedScoreId | null>(null);
  const [activeScoreTone, setActiveScoreTone] = useState<HereAndNowTone | undefined>(undefined);
  const [reflectionModePreset, setReflectionModePreset] = useState<'quick' | 'deep'>('quick');
  const [curatedParamNotes, setCuratedParamNotes] = useState<Record<string, CuratedParameterNote>>(
    () => readJsonStorage<Record<string, CuratedParameterNote>>(LS_KEYS.paramNotes, {}),
  );
  const [isLanguageSearchOpen, setLanguageSearchOpen] = useState(false);
  const [isStorageExplainerOpen, setStorageExplainerOpen] = useState(false);
  const [isFeedbackOpen, setFeedbackOpen] = useState(false);
  const [isAboutOpen, setAboutOpen] = useState(false);

  // Storage & Auth
  const [storageMode, setStorageMode] = useState<StorageMode>(() =>
    readJsonStorage<StorageMode>(LS_KEYS.storageMode, 'local'),
  );
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [pendingMigrationCount, setPendingMigrationCount] = useState(0);
  const [workspaceToken, setWorkspaceToken] = useState<string | null>(null);

  // Local Data
  const [localRecords, setLocalRecords] = useState<MovementRecord[]>(() =>
    readJsonStorage<MovementRecord[]>(LS_KEYS.records, INITIAL_RECORDS),
  );
  const [localProfile, setLocalProfile] = useState<DancerProfile>(() =>
    readJsonStorage<DancerProfile>(LS_KEYS.profile, INITIAL_DANCER_PROFILE),
  );
  const [localInquiryAddons, setLocalInquiryAddons] = useState<Record<string, InquiryAddons>>(() =>
    readJsonStorage<Record<string, InquiryAddons>>(LS_KEYS.inquiryAdds, {}),
  );

  // Cloud Data
  const [cloudRecords, setCloudRecords] = useState<MovementRecord[] | null>(null);
  const [cloudProfile, setCloudProfile] = useState<DancerProfile | null>(null);

  // Shared Curated Content from Firestore
  const [curatedRecommendations, setCuratedRecommendations] = useState<SomaticRecommendation[]>([]);
  const [curatedInquiries, setCuratedInquiries] = useState<ConversationInquiry[]>([]);
  const [curatedGuideOverrides, setCuratedGuideOverrides] = useState<
    Array<Partial<SomaticGuideTopic> & { id: SomaticGuideTopicId }>
  >([]);

  // Site Config & User Feedback
  const [remoteSiteConfig, setRemoteSiteConfig] = useState<SiteContentConfig | null>(null);
  const [ownFeedbacks, setOwnFeedbacks] = useState<UserFeedback[]>([]);
  const [allFeedbacks, setAllFeedbacks] = useState<UserFeedback[]>([]);

  // Manager RBAC
  const [managerAccount, setManagerAccount] = useState<ManagerAccount | null>(null);
  const [managersRoster, setManagersRoster] = useState<ManagerAccount[]>([]);

  // View Filters & Selections
  const [recordViewMode, setRecordViewModeState] = useState<RecordViewMode>(
    savedPrefs.recordMode || 'cards',
  );
  const [conversationViewMode, setConversationViewModeState] = useState<ConversationViewMode>(
    savedPrefs.conversationMode || 'chat',
  );
  const [pillarFilter, setPillarFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<SomaticRecommendation | null>(null);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>('inq-v2-1');
  const [sendingInquiryId, setSendingInquiryId] = useState<string | null>(null);

  const dir = useMemo(() => getLanguageMeta(language).dir, [language]);

  // Sync HTML dir & lang attributes
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  // Persist prefs locally
  const persistPrefs = useCallback(
    (patch: Partial<StoredPrefs>) => {
      const current = readJsonStorage<StoredPrefs>(LS_KEYS.prefs, {});
      localStorage.setItem(LS_KEYS.prefs, JSON.stringify({ ...current, ...patch }));
    },
    [],
  );

  // Server locality check (/api/locality) + Firestore boot connectivity check
  useEffect(() => {
    testFirestoreConnection();
    fetch('/api/locality')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { headerCountryCode?: string | null; isHeaderIsrael?: boolean } | null) => {
        if (!data) return;
        setLocality((prev) => {
          const isIsrael = prev.isIsraelDeviceLocality || Boolean(data.isHeaderIsrael);
          const nextCountry =
            data.headerCountryCode || prev.countryCode;
          const next: DeviceLocalityInfo = {
            ...prev,
            countryCode: nextCountry,
            isIsraelDeviceLocality: isIsrael,
            source: data.isHeaderIsrael ? 'server_header' : prev.source,
          };
          if (!savedPrefs.language && isIsrael && !prev.isIsraelDeviceLocality) {
            setLanguageState('he');
          }
          return next;
        });
      })
      .catch(() => {
        // Offline or local dev without proxy headers — browser detection suffices
      });
  }, [savedPrefs.language]);

  // Subscribe to shared curated catalog & global site_config in Firestore
  useEffect(() => {
    const unsubCatalog = subscribeCuratedCatalog({
      onRecommendations: setCuratedRecommendations,
      onInquiries: setCuratedInquiries,
      onGuides: setCuratedGuideOverrides,
    });
    const unsubConfig = subscribeSiteConfig(setRemoteSiteConfig);
    return () => {
      unsubCatalog();
      unsubConfig();
    };
  }, []);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsub = subscribeAuthState((user) => {
      setAuthUser(user);
      if (!user) {
        setWorkspaceToken(null);
        setCloudRecords(null);
        setCloudProfile(null);
        setManagerAccount(null);
        setManagersRoster([]);
        setStorageMode('local');
      }
    });
    return unsub;
  }, []);

  // Subscribe to Manager role & Super Manager roster
  useEffect(() => {
    if (!authUser?.email || !authUser.emailVerified) {
      setManagerAccount(null);
      setManagersRoster([]);
      return;
    }
    const unsubOwn = subscribeOwnManagerRole(authUser.email, (acct) => {
      setManagerAccount(acct);
    });
    const isRootSuper = authUser.email.toLowerCase() === ROOT_SUPER_MANAGER_EMAIL;
    let unsubRoster: (() => void) | null = null;
    if (isRootSuper) {
      unsubRoster = subscribeManagersRoster(
        setManagersRoster,
        (err) => console.warn('Managers roster listener notice:', err.message),
      );
    }
    return () => {
      unsubOwn();
      if (unsubRoster) unsubRoster();
    };
  }, [authUser]);

  // Subscribe to own submitted feedbacks + manager feedback inbox
  useEffect(() => {
    if (!authUser?.uid || !authUser.emailVerified) {
      setOwnFeedbacks([]);
      return;
    }
    const unsub = subscribeOwnFeedbacks(
      authUser.uid,
      setOwnFeedbacks,
      (err) => console.warn('Own feedback listener notice:', err.message),
    );
    return unsub;
  }, [authUser]);

  // Subscribe to private user Cloud Storage when Cloud mode is active & user signed in
  useEffect(() => {
    if (storageMode !== 'cloud' || !authUser) {
      setSyncStatus('idle');
      return;
    }
    setSyncStatus('syncing');
    const unsub = subscribeUserCloudData(authUser.uid, {
      onProfile: (prof, prefs) => {
        setCloudProfile(prof);
        if (prefs?.recordMode) setRecordViewModeState(prefs.recordMode);
        if (prefs?.conversationMode) setConversationViewModeState(prefs.conversationMode);
        setSyncStatus('synced');
      },
      onRecords: (recs) => {
        setCloudRecords(recs);
        setSyncStatus('synced');
      },
      onError: () => {
        setSyncStatus('error');
      },
    });
    return unsub;
  }, [storageMode, authUser]);

  // Sync local storage states
  useEffect(() => {
    localStorage.setItem(LS_KEYS.records, JSON.stringify(localRecords));
  }, [localRecords]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.profile, JSON.stringify(localProfile));
  }, [localProfile]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.inquiryAdds, JSON.stringify(localInquiryAddons));
  }, [localInquiryAddons]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.storageMode, JSON.stringify(storageMode));
  }, [storageMode]);

  // Effective Records & Profile based on storage mode
  const effectiveStorageMode: StorageMode = storageMode === 'cloud' && authUser ? 'cloud' : 'local';

  const records = useMemo(() => {
    if (effectiveStorageMode === 'cloud') {
      return cloudRecords ?? [];
    }
    return localRecords;
  }, [effectiveStorageMode, cloudRecords, localRecords]);

  const dancerProfile = useMemo(() => {
    const base =
      effectiveStorageMode === 'cloud' && cloudProfile
        ? cloudProfile
        : effectiveStorageMode === 'cloud' && authUser
          ? {
              ...localProfile,
              name: authUser.displayName || localProfile.name,
              savedRecordsCount: records.length,
            }
          : localProfile;
    return {
      ...base,
      personalJourney: base.personalJourney || INITIAL_PERSONAL_JOURNEY,
    };
  }, [effectiveStorageMode, cloudProfile, authUser, localProfile, records.length]);

  const personalJourney = useMemo(
    () => dancerProfile.personalJourney || INITIAL_PERSONAL_JOURNEY,
    [dancerProfile],
  );

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((rec) => {
      const matchesPillar = pillarFilter === 'ALL' || rec.pillarCategory === pillarFilter;
      const matchesSearch =
        !q ||
        rec.title.toLowerCase().includes(q) ||
        rec.partner.toLowerCase().includes(q) ||
        rec.jamOrWorkshop.toLowerCase().includes(q) ||
        rec.reflectionNotes.toLowerCase().includes(q) ||
        rec.contactPoints.some((cp) => cp.toLowerCase().includes(q));
      return matchesPillar && matchesSearch;
    });
  }, [records, pillarFilter, searchQuery]);

  const recommendations = useMemo(() => {
    const curatedMap = new Map(curatedRecommendations.map((r) => [r.id, r]));
    const baseMerged = INITIAL_RECOMMENDATIONS.map((b) => curatedMap.get(b.id) ?? b);
    const baseIds = new Set(INITIAL_RECOMMENDATIONS.map((b) => b.id));
    const extras = curatedRecommendations.filter((r) => !baseIds.has(r.id));
    return [...extras, ...baseMerged];
  }, [curatedRecommendations]);

  const guideTopics = useMemo<SomaticGuideTopic[]>(() => {
    const overrideMap = new Map(curatedGuideOverrides.map((g) => [g.id, g]));
    return SOMATIC_GUIDE_TOPICS.map((base) => {
      const ov = overrideMap.get(base.id);
      if (!ov) return base;
      return {
        ...base,
        ...ov,
        id: base.id,
        guideSection: base.guideSection,
        goalHe: base.goalHe,
        goalEn: base.goalEn,
        mechanismHe: base.mechanismHe,
        mechanismEn: base.mechanismEn,
        quickActions: base.quickActions,
        ratingLevels: base.ratingLevels,
        axisType: base.axisType,
      };
    });
  }, [curatedGuideOverrides]);

  const inquiries = useMemo(() => {
    const curatedMap = new Map(curatedInquiries.map((i) => [i.id, i]));
    const baseMerged = INITIAL_INQUIRIES.map((b) => curatedMap.get(b.id) ?? b);
    const baseIds = new Set(INITIAL_INQUIRIES.map((b) => b.id));
    const extras = curatedInquiries.filter((i) => !baseIds.has(i.id));
    return [...extras, ...baseMerged].map((inq) => {
      const addons = localInquiryAddons[inq.id];
      if (!addons) return inq;
      return {
        ...inq,
        messages: [...inq.messages, ...addons.messages],
        summaryInsights: [...inq.summaryInsights, ...addons.summaryInsights],
      };
    });
  }, [curatedInquiries, localInquiryAddons]);

  const selectedRecord = useMemo(
    () => records.find((r) => r.id === selectedRecordId) ?? null,
    [records, selectedRecordId],
  );

  const selectedInquiry = useMemo(
    () => inquiries.find((i) => i.id === selectedInquiryId) ?? inquiries[0] ?? null,
    [inquiries, selectedInquiryId],
  );

  const somaticProgress = useMemo(
    () => calculateSomaticProgress(records, dancerProfile),
    [records, dancerProfile],
  );

  // Manager RBAC flags
  const isSuperManager = useMemo(() => {
    if (!authUser?.email || !authUser.emailVerified) return false;
    if (authUser.email.toLowerCase() === ROOT_SUPER_MANAGER_EMAIL) return true;
    return Boolean(managerAccount?.active && managerAccount.role === 'super_manager');
  }, [authUser, managerAccount]);

  const isActiveManager = useMemo(() => {
    if (!authUser?.email || !authUser.emailVerified) return false;
    return isSuperManager || Boolean(managerAccount?.active);
  }, [authUser, isSuperManager, managerAccount]);

  const managerPrivileges = useMemo<ManagerPrivileges>(() => {
    if (isSuperManager) {
      return {
        editRecommendationsAndGuides: true,
        editInquiriesAndFlashcards: true,
        importTextAndNotebookLM: true,
      };
    }
    if (managerAccount?.active) {
      return managerAccount.privileges;
    }
    return {
      editRecommendationsAndGuides: false,
      editInquiriesAndFlashcards: false,
      importTextAndNotebookLM: false,
    };
  }, [isSuperManager, managerAccount]);

  const siteConfig = useMemo<SiteContentConfig>(
    () => ({
      ...DEFAULT_SITE_CONFIG,
      ...(remoteSiteConfig ?? {}),
      id: 'main',
    }),
    [remoteSiteConfig],
  );

  // Manager feedback inbox real-time subscription
  useEffect(() => {
    if (!isActiveManager || !authUser?.emailVerified) {
      setAllFeedbacks([]);
      return;
    }
    const unsub = subscribeAllFeedbacksManager(
      setAllFeedbacks,
      (err) => console.warn('Manager feedback inbox listener notice:', err.message),
    );
    return unsub;
  }, [isActiveManager, authUser]);

  // Actions
  const setLanguage = useCallback(
    (lang: AppLanguageCode) => {
      setLanguageState(lang);
      persistPrefs({ language: lang });
    },
    [persistPrefs],
  );

  const setLocalityIsraelOverride = useCallback(
    (isIsrael: boolean) => {
      setLocality((prev) => ({
        ...prev,
        countryCode: isIsrael ? 'IL' : 'INTL',
        isIsraelDeviceLocality: isIsrael,
        source: 'override',
      }));
      if (!isIsrael && language === 'he') {
        setLanguage('en');
      } else if (isIsrael && language === 'en') {
        setLanguage('he');
      }
    },
    [language, setLanguage],
  );

  const setRecordViewMode = useCallback(
    (mode: RecordViewMode) => {
      setRecordViewModeState(mode);
      persistPrefs({ recordMode: mode });
    },
    [persistPrefs],
  );

  const setConversationViewMode = useCallback(
    (mode: ConversationViewMode) => {
      setConversationViewModeState(mode);
      persistPrefs({ conversationMode: mode });
    },
    [persistPrefs],
  );

  const dismissIntro = useCallback(() => {
    setShowIntro(false);
    persistPrefs({ hasDismissedIntro: true });
  }, [persistPrefs]);

  const replayIntro = useCallback(() => {
    setShowIntro(true);
  }, []);

  const tr = useCallback((he: string, en: string) => trLang(language, he, en), [language]);

  const switchToLocalStorage = useCallback(() => {
    setStorageMode('local');
    setAuthError(null);
    setPendingMigrationCount(0);
  }, []);

  const requestCloudStorageWithSignIn = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const user = authUser ?? (await signInWithGoogleAccount());
      setStorageMode('cloud');
      if (localRecords.length > 0) {
        setPendingMigrationCount(localRecords.length);
      }
      if (user && !cloudProfile) {
        await saveUserProfileCloud(
          user.uid,
          { ...localProfile, name: user.displayName || localProfile.name },
          { recordMode: recordViewMode, conversationMode: conversationViewMode, language },
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed or was cancelled.';
      setAuthError(msg);
    } finally {
      setAuthBusy(false);
    }
  }, [authUser, cloudProfile, conversationViewMode, language, localProfile, localRecords.length, recordViewMode]);

  const signInOnlyWithGoogle = useCallback(async (): Promise<User | null> => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const user = authUser ?? (await signInWithGoogleAccount());
      return user;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed or was cancelled.';
      setAuthError(msg);
      return null;
    } finally {
      setAuthBusy(false);
    }
  }, [authUser]);

  const submitUserFeedback = useCallback(
    async (input: {
      category: FeedbackCategory;
      message: string;
      rating: number;
      senderName?: string;
    }): Promise<UserFeedback> => {
      if (!authUser?.uid || !authUser.emailVerified) {
        throw new Error('Please sign in with Google to submit verified feedback.');
      }
      return submitUserFeedbackCloud({
        uid: authUser.uid,
        senderName: input.senderName?.trim() || authUser.displayName || dancerProfile.name,
        senderEmail: authUser.email || '',
        category: input.category,
        message: input.message,
        rating: input.rating,
        pageContext: activeTab,
      });
    },
    [activeTab, authUser, dancerProfile.name],
  );

  const migrateLocalRecordsNow = useCallback(async () => {
    if (!authUser) return 0;
    const count = await migrateLocalDataToCloud(authUser.uid, localRecords, localProfile, {
      recordMode: recordViewMode,
      conversationMode: conversationViewMode,
      language,
    });
    setPendingMigrationCount(0);
    return count;
  }, [authUser, conversationViewMode, language, localProfile, localRecords, recordViewMode]);

  const dismissMigrationPrompt = useCallback(() => {
    setPendingMigrationCount(0);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOutAccount();
    clearCachedWorkspaceToken();
    setWorkspaceToken(null);
    setStorageMode('local');
    setPendingMigrationCount(0);
    if (activeTab === 'manager') {
      setActiveTab('home');
    }
  }, [activeTab]);

  const resetLocalSampleData = useCallback(() => {
    setLocalRecords(INITIAL_RECORDS);
    setLocalProfile(INITIAL_DANCER_PROFILE);
    setLocalInquiryAddons({});
    setSelectedRecordId(null);
  }, []);

  const connectWorkspaceDocs = useCallback(async (): Promise<string | null> => {
    const existing = getCachedWorkspaceToken();
    if (existing) {
      setWorkspaceToken(existing);
      return existing;
    }
    setAuthBusy(true);
    setAuthError(null);
    try {
      const { accessToken } = await connectGoogleDocsOAuth();
      setWorkspaceToken(accessToken);
      return accessToken;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not connect Google Docs.';
      setAuthError(msg);
      return null;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const saveParamNote = useCallback((note: CuratedParameterNote) => {
    setCuratedParamNotes((prev) => {
      const next = { ...prev, [note.paramId]: note };
      localStorage.setItem(LS_KEYS.paramNotes, JSON.stringify(next));
      return next;
    });
  }, []);

  const openScoreTimer = useCallback((scoreId: GuidedScoreId, tone?: HereAndNowTone) => {
    setActiveScoreTone(tone);
    setActiveScoreId(scoreId);
  }, []);

  const closeScoreTimer = useCallback(() => {
    setActiveScoreId(null);
  }, []);

  const setSmallDanceOpen = useCallback(
    (open: boolean) => {
      if (open) {
        openScoreTimer('small_dance');
      } else {
        closeScoreTimer();
      }
    },
    [closeScoreTimer, openScoreTimer],
  );

  const openGuideTopic = useCallback((id: SomaticGuideTopicId) => {
    const resolved = getGuideTopicById(id);
    setActiveGuideTopic(resolved.id);
  }, []);

  const saveNewRecord = useCallback(
    async (input: {
      title: string;
      partner: string;
      jamName: string;
      durationMinutes: number;
      pillarCategory: string;
      contactPoints: string[];
      reflectionMode?: 'quick' | 'deep';
      axisBalances?: AxisBalances;
      flaggedParameters?: FlaggedParameter[];
      weightSharingLevel?: number;
      attunementLevel?: number;
      boundaryClarityLevel?: number;
      fallingMomentumLevel?: number;
      groundingLevel?: number;
      tactileAttentionLevel?: number;
      twoRiversState: string;
      kelufState?: string;
      reflectionNotes: string;
      keyTakeaway: string;
      intentionCheckIn?: string;
      navigateToRecords?: boolean;
    }): Promise<MovementRecord> => {
      const now = Date.now();
      const legacyDerived = input.axisBalances
        ? deriveLegacyLevelsFromBalances(input.axisBalances)
        : null;
      const newRec: MovementRecord = {
        id: `rec-${now}`,
        title: input.title.trim() || tr('רפלקציית תנועה חדשה', 'New Movement Reflection'),
        dateStr: new Date(now).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        jamOrWorkshop: input.jamName.trim() || tr('ג׳אם מקומי', 'Local Jam'),
        partner: input.partner.trim() || tr('סולו / שותף', 'Solo / Partner'),
        durationMinutes: Math.max(15, Math.round(input.durationMinutes || 60)),
        pillarCategory: input.pillarCategory,
        contactPoints: input.contactPoints.length
          ? input.contactPoints
          : ['אגן ומרכז', 'גב אל גב'],
        weightSharingLevel: legacyDerived?.weightSharingLevel ?? input.weightSharingLevel ?? 8.5,
        attunementLevel: legacyDerived?.attunementLevel ?? input.attunementLevel ?? 8.5,
        boundaryClarityLevel: legacyDerived?.boundaryClarityLevel ?? input.boundaryClarityLevel ?? 8.5,
        fallingMomentumLevel: legacyDerived?.fallingMomentumLevel ?? input.fallingMomentumLevel ?? 8.5,
        groundingLevel: legacyDerived?.groundingLevel ?? input.groundingLevel ?? 8.5,
        tactileAttentionLevel: legacyDerived?.tactileAttentionLevel ?? input.tactileAttentionLevel ?? 8.5,
        reflectionMode: input.reflectionMode,
        axisBalances: input.axisBalances,
        flaggedParameters:
          input.flaggedParameters && input.flaggedParameters.length > 0
            ? input.flaggedParameters
            : undefined,
        twoRiversState: input.twoRiversState,
        kelufState: input.kelufState?.trim() || undefined,
        reflectionNotes:
          input.reflectionNotes.trim() ||
          tr('תיעוד מתוך התבוננות ב־5 צירי הוויסות הסומטיים.', 'Logged across the 5 somatic regulation axes.'),
        keyTakeaway:
          input.keyTakeaway.trim() ||
          tr('שמירה על קשב פתוח ומרכז כובד משוחרר.', 'Keeping open attention and a relaxed center.'),
        somaticSensations: ['התמסרות לכוח המשיכה', 'מרחב נשימה פתוח'],
        intentionCheckIn: input.intentionCheckIn?.trim() || undefined,
        timestampMs: now,
      };

      if (effectiveStorageMode === 'cloud' && authUser) {
        await saveMovementRecordCloud(authUser.uid, newRec);
        const updatedProfile: DancerProfile = {
          ...dancerProfile,
          savedRecordsCount: records.length + 1,
          totalJamHours: Number((dancerProfile.totalJamHours + newRec.durationMinutes / 60).toFixed(1)),
        };
        await saveUserProfileCloud(authUser.uid, updatedProfile, {
          recordMode: recordViewMode,
          conversationMode: conversationViewMode,
          language,
        });
      } else {
        setLocalRecords((prev) => [newRec, ...prev]);
        setLocalProfile((prev) => ({
          ...prev,
          savedRecordsCount: prev.savedRecordsCount + 1,
          totalJamHours: Number((prev.totalJamHours + newRec.durationMinutes / 60).toFixed(1)),
        }));
      }

      if (input.navigateToRecords) {
        setSelectedRecordId(newRec.id);
        setActiveTab('records');
      }
      return newRec;
    },
    [
      authUser,
      conversationViewMode,
      dancerProfile,
      effectiveStorageMode,
      language,
      recordViewMode,
      records.length,
      tr,
    ],
  );

  const deleteRecord = useCallback(
    async (id: string) => {
      if (effectiveStorageMode === 'cloud' && authUser) {
        await deleteMovementRecordCloud(authUser.uid, id);
      } else {
        setLocalRecords((prev) => prev.filter((r) => r.id !== id));
      }
      if (selectedRecordId === id) {
        setSelectedRecordId(null);
      }
    },
    [authUser, effectiveStorageMode, selectedRecordId],
  );

  const updateDancerProfile = useCallback(
    async (input: {
      name: string;
      bio: string;
      primaryRole: string;
      touchPreference: string;
      activeIntentions: string[];
      levelTitle?: string;
    }) => {
      const updated: DancerProfile = {
        ...dancerProfile,
        name: input.name.trim() || dancerProfile.name,
        bio: input.bio.trim(),
        primaryRole: input.primaryRole.trim(),
        touchPreference: input.touchPreference.trim(),
        activeIntentions: input.activeIntentions.filter(Boolean),
        levelTitle: input.levelTitle !== undefined ? input.levelTitle.trim() : dancerProfile.levelTitle,
      };
      if (effectiveStorageMode === 'cloud' && authUser) {
        await saveUserProfileCloud(authUser.uid, updated, {
          recordMode: recordViewMode,
          conversationMode: conversationViewMode,
          language,
        });
      } else {
        setLocalProfile(updated);
      }
    },
    [authUser, conversationViewMode, dancerProfile, effectiveStorageMode, language, recordViewMode],
  );

  const updatePersonalJourney = useCallback(
    async (patch: Partial<PersonalJourney>) => {
      const current = dancerProfile.personalJourney || INITIAL_PERSONAL_JOURNEY;
      const nextJourney: PersonalJourney = {
        ...current,
        ...patch,
      };
      const updatedProfile: DancerProfile = {
        ...dancerProfile,
        personalJourney: nextJourney,
      };
      if (effectiveStorageMode === 'cloud' && authUser) {
        await saveUserProfileCloud(authUser.uid, updatedProfile, {
          recordMode: recordViewMode,
          conversationMode: conversationViewMode,
          language,
        });
      } else {
        setLocalProfile(updatedProfile);
      }
    },
    [authUser, conversationViewMode, dancerProfile, effectiveStorageMode, language, recordViewMode],
  );

  const sendInquiryMessage = useCallback(
    async (inquiryId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const inq = inquiries.find((i) => i.id === inquiryId);
      if (!inq) return;

      const userMsg: ConversationInquiry['messages'][number] = {
        id: `msg-${Date.now()}-u`,
        senderName: dancerProfile.name,
        isGuide: false,
        text: trimmed,
        timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setLocalInquiryAddons((prev) => {
        const cur = prev[inquiryId] || { messages: [], summaryInsights: [] };
        return {
          ...prev,
          [inquiryId]: { ...cur, messages: [...cur.messages, userMsg] },
        };
      });

      setSendingInquiryId(inquiryId);
      try {
        let replyText = '';
        let insightText = '';
        try {
          const res = await fetch(`${import.meta.env.BASE_URL}api/somatic-guide`.replace('//api', '/api'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              inquiryTitle: language === 'he' ? inq.title : inq.titleEn || inq.title,
              category: language === 'he' ? inq.category : inq.categoryEn || inq.category,
              somaticPrinciple:
                language === 'he' ? inq.somaticPrinciple : inq.somaticPrincipleEn || inq.somaticPrinciple,
              authorReference: inq.authorReference,
              language,
              history: [...inq.messages, userMsg].slice(-6),
              message: trimmed,
            }),
          });
          if (res.ok) {
            const data = (await res.json()) as { reply?: string; insight?: string };
            replyText = data.reply || '';
            insightText = data.insight || '';
          }
        } catch {
          // Static host (e.g. GitHub Pages) fallback
        }

        const guideMsg: ConversationInquiry['messages'][number] = {
          id: `msg-${Date.now()}-g`,
          senderName: tr('מדריך סומטי (ci-eye)', 'Somatic Guide (ci-eye)'),
          isGuide: true,
          text:
            replyText ||
            tr(
              'תודה על ההתבוננות הסומטית. נסה/י להבחין כיצד הנשימה והמשקל מתארגנים בין Under, Flow ו־Over ברגע זה.',
              'Thank you for noticing that sensation. Feel how your breath and weight organize between Under, Flow, and Over in this moment.',
            ),
          timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        const newInsight = insightText || `${trimmed.slice(0, 60)}`;

        setLocalInquiryAddons((prev) => {
          const cur = prev[inquiryId] || { messages: [], summaryInsights: [] };
          const nextAddons = {
            messages: [...cur.messages, guideMsg],
            summaryInsights: [...cur.summaryInsights, newInsight],
          };
          if (effectiveStorageMode === 'cloud' && authUser) {
            saveUserInquiryThreadCloud(
              authUser.uid,
              inquiryId,
              nextAddons.messages,
              nextAddons.summaryInsights,
            ).catch((e) => console.warn('Cloud inquiry sync failed:', e));
          }
          return { ...prev, [inquiryId]: nextAddons };
        });
      } finally {
        setSendingInquiryId(null);
      }
    },
    [authUser, dancerProfile.name, effectiveStorageMode, inquiries, language, tr],
  );

  const executeGuideAction = useCallback(
    (action: GuideQuickAction) => {
      setActiveGuideTopic(null);
      switch (action.target) {
        case 'score':
          openScoreTimer(action.scoreId || 'small_dance', personalJourney.hereAndNowTone);
          break;
        case 'small_dance':
          openScoreTimer('small_dance', personalJourney.hereAndNowTone);
          break;
        case 'storage':
          setStorageExplainerOpen(true);
          break;
        case 'feedback':
          setFeedbackOpen(true);
          break;
        case 'about':
          setAboutOpen(true);
          break;
        case 'reflection':
          if (action.reflectionMode) {
            setReflectionModePreset(action.reflectionMode);
          }
          setActiveTab('reflection');
          break;
        case 'open_practice': {
          const rec =
            (action.sampleRecommendationId &&
              recommendations.find((r) => r.id === action.sampleRecommendationId)) ||
            recommendations[0] ||
            null;
          if (rec) setSelectedRecommendation(rec);
          break;
        }
        default:
          setActiveTab(action.target);
          break;
      }
    },
    [openScoreTimer, personalJourney.hereAndNowTone, recommendations],
  );

  const value: ContactWaysContextValue = {
    activeTab,
    setActiveTab,
    showIntro,
    dismissIntro,
    replayIntro,
    activeGuideTopic,
    openGuideTopic,
    closeGuideTopic: () => setActiveGuideTopic(null),
    executeGuideAction,
    activeScoreId,
    activeScoreTone,
    openScoreTimer,
    closeScoreTimer,
    isSmallDanceOpen: activeScoreId === 'small_dance',
    setSmallDanceOpen,
    reflectionModePreset,
    setReflectionModePreset,
    isLanguageSearchOpen,
    setLanguageSearchOpen,
    isStorageExplainerOpen,
    setStorageExplainerOpen,
    isFeedbackOpen,
    setFeedbackOpen,
    isAboutOpen,
    setAboutOpen,
    language,
    dir,
    setLanguage,
    locality,
    setLocalityIsraelOverride,
    tr,
    storageMode: effectiveStorageMode,
    authUser,
    authBusy,
    authError,
    syncStatus,
    pendingMigrationCount,
    switchToLocalStorage,
    requestCloudStorageWithSignIn,
    migrateLocalRecordsNow,
    dismissMigrationPrompt,
    signOutUser,
    resetLocalSampleData,
    workspaceToken,
    connectWorkspaceDocs,
    dancerProfile,
    personalJourney,
    records,
    filteredRecords,
    selectedRecord,
    setSelectedRecord: (rec) => setSelectedRecordId(rec?.id ?? null),
    recordViewMode,
    setRecordViewMode,
    pillarFilter,
    setPillarFilter,
    searchQuery,
    setSearchQuery,
    recommendations,
    selectedRecommendation,
    setSelectedRecommendation,
    guideTopics,
    inquiries,
    selectedInquiry,
    setSelectedInquiry: (inq) => setSelectedInquiryId(inq?.id ?? null),
    conversationViewMode,
    setConversationViewMode,
    somaticProgress,
    sendingInquiryId,
    saveNewRecord,
    deleteRecord,
    updateDancerProfile,
    updatePersonalJourney,
    sendInquiryMessage,
    siteConfig,
    ownFeedbacks,
    allFeedbacks,
    submitUserFeedback,
    signInOnlyWithGoogle,
    curatedParamNotes,
    saveParamNote,
    managerAccount,
    isActiveManager,
    isSuperManager,
    managerPrivileges,
    managersRoster,
  };

  return <ContactWaysContext.Provider value={value}>{children}</ContactWaysContext.Provider>;
};

export function useContactWays(): ContactWaysContextValue {
  const ctx = useContext(ContactWaysContext);
  if (!ctx) throw new Error('useContactWays must be used inside ContactWaysProvider');
  return ctx;
}
