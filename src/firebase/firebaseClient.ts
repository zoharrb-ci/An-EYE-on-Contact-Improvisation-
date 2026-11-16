import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  ConversationInquiry,
  ConversationViewMode,
  DancerProfile,
  FeedbackCategory,
  FeedbackStatus,
  HereAndNowTone,
  IntentionHorizon,
  ManagerAccount,
  ManagerPrivileges,
  MovementRecord,
  PersonalJourney,
  RecordViewMode,
  SiteContentConfig,
  SomaticGuideTopic,
  SomaticGuideTopicId,
  SomaticRecommendation,
  UserFeedback,
} from '../types/contactWays';
import { ROOT_SUPER_MANAGER_EMAIL } from '../i18n/languages';
import { INITIAL_PERSONAL_JOURNEY } from '../data/seedData';

const resolvedFirebaseConfig = {
  ...firebaseConfig,
  ...(import.meta.env.VITE_FIREBASE_API_KEY
    ? { apiKey: import.meta.env.VITE_FIREBASE_API_KEY }
    : {}),
  ...(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
    ? { authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN }
    : {}),
  ...(import.meta.env.VITE_FIREBASE_PROJECT_ID
    ? { projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID }
    : {}),
  ...(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
    ? { storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET }
    : {}),
  ...(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
    ? { messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID }
    : {}),
  ...(import.meta.env.VITE_FIREBASE_APP_ID
    ? { appId: import.meta.env.VITE_FIREBASE_APP_ID }
    : {}),
};

const resolvedDatabaseId =
  import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
  (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId ||
  '(default)';

const app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(resolvedFirebaseConfig);

export const db: Firestore = getFirestore(app, resolvedDatabaseId);
export const auth = getAuth(app);

// Workspace OAuth token cached strictly in memory (never localStorage/sessionStorage)
let cachedWorkspaceToken: string | null = null;

export const WORKSPACE_DOCS_SCOPES = [
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/documents.readonly',
];

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: Array<{ providerId?: string | null; email?: string | null }>;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) ?? [],
    },
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Boot connectivity verification per Firebase skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firebase configuration appears offline or unreachable.');
      return false;
    }
    return true;
  }
}

export function subscribeAuthState(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      cachedWorkspaceToken = null;
    }
    callback(user);
  });
}

export async function signInWithGoogleAccount(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function connectGoogleDocsOAuth(): Promise<{ user: User; accessToken: string }> {
  const provider = new GoogleAuthProvider();
  WORKSPACE_DOCS_SCOPES.forEach((scope) => provider.addScope(scope));
  provider.setCustomParameters({ prompt: 'consent select_account' });
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error('Could not obtain Google Docs & Drive access token from Google Sign-In.');
  }
  cachedWorkspaceToken = credential.accessToken;
  return { user: result.user, accessToken: cachedWorkspaceToken };
}

export function getCachedWorkspaceToken(): string | null {
  return cachedWorkspaceToken;
}

export function clearCachedWorkspaceToken(): void {
  cachedWorkspaceToken = null;
}

export async function signOutAccount(): Promise<void> {
  cachedWorkspaceToken = null;
  await signOut(auth);
}

// --- User Private Cloud Storage ---

const VALID_HORIZONS: IntentionHorizon[] = ['today', 'this_week', 'next_jams', 'open'];
const VALID_TONES: HereAndNowTone[] = ['calm', 'curious', 'tender', 'energized', 'grounded'];

export function sanitizePersonalJourney(j?: Partial<PersonalJourney> | null): PersonalJourney {
  const base = INITIAL_PERSONAL_JOURNEY;
  const horizon: IntentionHorizon =
    j?.horizon && VALID_HORIZONS.includes(j.horizon) ? j.horizon : base.horizon;
  const hereAndNowTone: HereAndNowTone =
    j?.hereAndNowTone && VALID_TONES.includes(j.hereAndNowTone)
      ? j.hereAndNowTone
      : base.hereAndNowTone;

  return {
    curiosityIds: Array.isArray(j?.curiosityIds)
      ? j.curiosityIds.filter((s): s is string => typeof s === 'string').slice(0, 10).map((s) => s.slice(0, 80))
      : base.curiosityIds,
    statement: typeof j?.statement === 'string' ? j.statement.slice(0, 400) : base.statement,
    horizon,
    supportNeeds: Array.isArray(j?.supportNeeds)
      ? j.supportNeeds.filter((s): s is string => typeof s === 'string').slice(0, 10).map((s) => s.slice(0, 160))
      : base.supportNeeds,
    hereAndNowTone,
    hereAndNowNote:
      typeof j?.hereAndNowNote === 'string' ? j.hereAndNowNote.slice(0, 500) : base.hereAndNowNote,
    supportMoments: Array.isArray(j?.supportMoments)
      ? j.supportMoments.slice(0, 30).map((m, idx) => ({
          id: String(m?.id || `sup-${idx}`).slice(0, 64),
          text: String(m?.text || '').slice(0, 300),
          dateStr: String(m?.dateStr || '').slice(0, 60),
        }))
      : base.supportMoments,
  };
}

export async function saveUserProfileCloud(
  uid: string,
  profile: DancerProfile,
  prefs: {
    recordMode: RecordViewMode;
    conversationMode: ConversationViewMode;
    language: string;
  },
): Promise<void> {
  const path = `users/${uid}/profile/main`;
  const ref = doc(db, 'users', uid, 'profile', 'main');
  try {
    const existingSnap = await getDoc(ref);
    const payload = {
      uid,
      name: profile.name.slice(0, 120) || 'Dancer',
      levelTitle: profile.levelTitle.slice(0, 160),
      bio: profile.bio.slice(0, 1200),
      yearsDanced: Number(profile.yearsDanced) || 0,
      primaryRole: profile.primaryRole.slice(0, 120),
      touchPreference: profile.touchPreference.slice(0, 240),
      activeIntentions: profile.activeIntentions.slice(0, 10).map((s) => s.slice(0, 160)),
      totalJamHours: Number(profile.totalJamHours) || 0,
      currentStreakWeeks: Math.max(0, Math.round(profile.currentStreakWeeks)),
      completedInquiriesCount: Math.max(0, Math.round(profile.completedInquiriesCount)),
      savedRecordsCount: Math.max(0, Math.round(profile.savedRecordsCount)),
      preferredRecordMode: prefs.recordMode,
      preferredConversationMode: prefs.conversationMode,
      preferredLanguage: prefs.language.slice(0, 10),
      personalJourney: sanitizePersonalJourney(profile.personalJourney),
      createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, payload, { merge: false });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveMovementRecordCloud(uid: string, record: MovementRecord): Promise<void> {
  const safeId = record.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `users/${uid}/records/${safeId}`;
  const ref = doc(db, 'users', uid, 'records', safeId);
  try {
    const existingSnap = await getDoc(ref);
    const payload: Record<string, unknown> = {
      uid,
      id: safeId,
      title: record.title.slice(0, 200) || 'Reflection',
      dateStr: record.dateStr.slice(0, 60) || 'Today',
      jamOrWorkshop: record.jamOrWorkshop.slice(0, 160),
      partner: record.partner.slice(0, 120),
      durationMinutes: Math.min(1440, Math.max(1, Math.round(record.durationMinutes))),
      pillarCategory: record.pillarCategory.slice(0, 80) || 'Perception',
      contactPoints: record.contactPoints.slice(0, 12),
      weightSharingLevel: Number(record.weightSharingLevel),
      attunementLevel: Number(record.attunementLevel),
      boundaryClarityLevel: Number(record.boundaryClarityLevel),
      fallingMomentumLevel: Number(record.fallingMomentumLevel),
      groundingLevel: Number(record.groundingLevel),
      tactileAttentionLevel: Number(record.tactileAttentionLevel),
      twoRiversState: record.twoRiversState.slice(0, 120) || 'Trust-based contact',
      reflectionNotes: record.reflectionNotes.slice(0, 4000),
      keyTakeaway: record.keyTakeaway.slice(0, 600),
      somaticSensations: record.somaticSensations.slice(0, 12),
      intentionCheckIn: (record.intentionCheckIn || '').slice(0, 200),
      timestampMs: Math.round(record.timestampMs),
      createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (record.reflectionMode === 'quick' || record.reflectionMode === 'deep') {
      payload.reflectionMode = record.reflectionMode;
    }
    if (record.axisBalances) {
      payload.axisBalances = {
        mechanics: Math.max(-5, Math.min(5, Number(record.axisBalances.mechanics) || 0)),
        perception: Math.max(-5, Math.min(5, Number(record.axisBalances.perception) || 0)),
        behavior: Math.max(-5, Math.min(5, Number(record.axisBalances.behavior) || 0)),
        emotion: Math.max(-5, Math.min(5, Number(record.axisBalances.emotion) || 0)),
        ethics: Math.max(-5, Math.min(5, Number(record.axisBalances.ethics) || 0)),
      };
    }
    if (Array.isArray(record.flaggedParameters)) {
      payload.flaggedParameters = record.flaggedParameters.slice(0, 30).map((fp) => ({
        paramId: String(fp.paramId).slice(0, 64),
        state: fp.state === 'under' || fp.state === 'over' ? fp.state : 'flow',
      }));
    }
    if (typeof record.kelufState === 'string') {
      payload.kelufState = record.kelufState.slice(0, 120);
    }
    await setDoc(ref, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMovementRecordCloud(uid: string, recordId: string): Promise<void> {
  const safeId = recordId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `users/${uid}/records/${safeId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'records', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveUserInquiryThreadCloud(
  uid: string,
  inquiryId: string,
  messages: ConversationInquiry['messages'],
  summaryInsights: string[],
): Promise<void> {
  const safeId = inquiryId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `users/${uid}/inquiries/${safeId}`;
  const ref = doc(db, 'users', uid, 'inquiries', safeId);
  try {
    const existingSnap = await getDoc(ref);
    await setDoc(ref, {
      uid,
      inquiryId: safeId,
      messages: messages.slice(-100),
      summaryInsights: summaryInsights.slice(0, 30),
      createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeUserCloudData(
  uid: string,
  handlers: {
    onProfile: (
      profile: DancerProfile | null,
      prefs?: { recordMode?: RecordViewMode; conversationMode?: ConversationViewMode; language?: string },
    ) => void;
    onRecords: (records: MovementRecord[]) => void;
    onError: (err: Error) => void;
  },
): Unsubscribe {
  const profileRef = doc(db, 'users', uid, 'profile', 'main');
  const unsubProfile = onSnapshot(
    profileRef,
    (snap) => {
      if (!snap.exists()) {
        handlers.onProfile(null);
        return;
      }
      const d = snap.data();
      handlers.onProfile(
        {
          name: d.name,
          levelTitle: d.levelTitle,
          bio: d.bio,
          yearsDanced: d.yearsDanced,
          primaryRole: d.primaryRole,
          touchPreference: d.touchPreference,
          activeIntentions: d.activeIntentions ?? [],
          totalJamHours: d.totalJamHours,
          currentStreakWeeks: d.currentStreakWeeks,
          completedInquiriesCount: d.completedInquiriesCount,
          savedRecordsCount: d.savedRecordsCount,
          personalJourney: d.personalJourney
            ? sanitizePersonalJourney(d.personalJourney)
            : INITIAL_PERSONAL_JOURNEY,
        },
        {
          recordMode: d.preferredRecordMode,
          conversationMode: d.preferredConversationMode,
          language: d.preferredLanguage,
        },
      );
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, `users/${uid}/profile/main`);
      } catch (wrapped) {
        handlers.onError(wrapped as Error);
      }
    },
  );

  const recordsQuery = query(
    collection(db, 'users', uid, 'records'),
    where('uid', '==', uid),
    orderBy('timestampMs', 'desc'),
  );
  const unsubRecords = onSnapshot(
    recordsQuery,
    (snap) => {
      const list: MovementRecord[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: d.id,
          title: d.title,
          dateStr: d.dateStr,
          jamOrWorkshop: d.jamOrWorkshop,
          partner: d.partner,
          durationMinutes: d.durationMinutes,
          pillarCategory: d.pillarCategory,
          contactPoints: d.contactPoints ?? [],
          weightSharingLevel: d.weightSharingLevel,
          attunementLevel: d.attunementLevel,
          boundaryClarityLevel: d.boundaryClarityLevel,
          fallingMomentumLevel: d.fallingMomentumLevel,
          groundingLevel: d.groundingLevel,
          tactileAttentionLevel: d.tactileAttentionLevel,
          reflectionMode: d.reflectionMode || undefined,
          axisBalances: d.axisBalances || undefined,
          flaggedParameters: Array.isArray(d.flaggedParameters) ? d.flaggedParameters : undefined,
          twoRiversState: d.twoRiversState,
          kelufState: d.kelufState || undefined,
          reflectionNotes: d.reflectionNotes,
          keyTakeaway: d.keyTakeaway,
          somaticSensations: d.somaticSensations ?? [],
          intentionCheckIn: d.intentionCheckIn || undefined,
          timestampMs: d.timestampMs,
        };
      });
      handlers.onRecords(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, `users/${uid}/records`);
      } catch (wrapped) {
        handlers.onError(wrapped as Error);
      }
    },
  );

  return () => {
    unsubProfile();
    unsubRecords();
  };
}

export async function migrateLocalDataToCloud(
  uid: string,
  localRecords: MovementRecord[],
  localProfile: DancerProfile,
  prefs: { recordMode: RecordViewMode; conversationMode: ConversationViewMode; language: string },
): Promise<number> {
  const existing = await getDocs(
    query(collection(db, 'users', uid, 'records'), where('uid', '==', uid)),
  );
  const existingIds = new Set(existing.docs.map((d) => d.id));

  let uploaded = 0;
  const batch = writeBatch(db);
  for (const rec of localRecords) {
    const safeId = rec.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
    if (!existingIds.has(safeId)) {
      const ref = doc(db, 'users', uid, 'records', safeId);
      const batchPayload: Record<string, unknown> = {
        uid,
        id: safeId,
        title: rec.title.slice(0, 200),
        dateStr: rec.dateStr.slice(0, 60),
        jamOrWorkshop: rec.jamOrWorkshop.slice(0, 160),
        partner: rec.partner.slice(0, 120),
        durationMinutes: Math.min(1440, Math.max(1, Math.round(rec.durationMinutes))),
        pillarCategory: rec.pillarCategory.slice(0, 80),
        contactPoints: rec.contactPoints.slice(0, 12),
        weightSharingLevel: Number(rec.weightSharingLevel),
        attunementLevel: Number(rec.attunementLevel),
        boundaryClarityLevel: Number(rec.boundaryClarityLevel),
        fallingMomentumLevel: Number(rec.fallingMomentumLevel),
        groundingLevel: Number(rec.groundingLevel),
        tactileAttentionLevel: Number(rec.tactileAttentionLevel),
        twoRiversState: rec.twoRiversState.slice(0, 120),
        reflectionNotes: rec.reflectionNotes.slice(0, 4000),
        keyTakeaway: rec.keyTakeaway.slice(0, 600),
        somaticSensations: rec.somaticSensations.slice(0, 12),
        intentionCheckIn: (rec.intentionCheckIn || '').slice(0, 200),
        timestampMs: Math.round(rec.timestampMs),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (rec.reflectionMode) batchPayload.reflectionMode = rec.reflectionMode;
      if (rec.axisBalances) batchPayload.axisBalances = rec.axisBalances;
      if (Array.isArray(rec.flaggedParameters)) batchPayload.flaggedParameters = rec.flaggedParameters.slice(0, 30);
      if (typeof rec.kelufState === 'string') batchPayload.kelufState = rec.kelufState.slice(0, 120);
      batch.set(ref, batchPayload);
      uploaded += 1;
    }
  }
  if (uploaded > 0) {
    await batch.commit();
  }
  const profileRef = doc(db, 'users', uid, 'profile', 'main');
  const profileSnap = await getDoc(profileRef);
  if (!profileSnap.exists()) {
    await saveUserProfileCloud(uid, localProfile, prefs);
  }
  return uploaded;
}

// --- Shared Live Catalog (Public Read, Verified Manager Write) ---

export function subscribeCuratedCatalog(handlers: {
  onRecommendations: (recs: SomaticRecommendation[]) => void;
  onInquiries: (inqs: ConversationInquiry[]) => void;
  onGuides?: (guides: Array<Partial<SomaticGuideTopic> & { id: SomaticGuideTopicId }>) => void;
}): Unsubscribe {
  const unsubRecs = onSnapshot(
    collection(db, 'curated_recommendations'),
    (snap) => {
      const list: SomaticRecommendation[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: d.id,
          shortTitle: d.shortTitle,
          shortTitleEn: d.shortTitleEn,
          subtitleTag: d.subtitleTag,
          subtitleTagEn: d.subtitleTagEn,
          axisType: d.axisType,
          summaryPreview: d.summaryPreview,
          fullExplanation: d.fullExplanation,
          fullExplanationEn: d.fullExplanationEn,
          practicalSteps: d.practicalSteps ?? [],
          practicalStepsEn: d.practicalStepsEn ?? [],
          quoteText: d.quoteText,
          quoteTextEn: d.quoteTextEn,
          quoteAuthor: d.quoteAuthor,
          quoteAuthorEn: d.quoteAuthorEn,
          hasInteractivePractice: Boolean(d.hasInteractivePractice),
          scoreId: d.scoreId || undefined,
          isCurated: true,
          sourceType: d.sourceType,
          sourceTitle: d.sourceTitle,
          authorEmail: d.authorEmail,
        };
      });
      handlers.onRecommendations(list);
    },
    (err) => {
      console.warn('Could not listen to curated_recommendations:', err);
    },
  );

  const unsubInqs = onSnapshot(
    collection(db, 'curated_inquiries'),
    (snap) => {
      const list: ConversationInquiry[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: d.id,
          title: d.title,
          titleEn: d.titleEn,
          category: d.category,
          categoryEn: d.categoryEn,
          subtitle: d.subtitle,
          subtitleEn: d.subtitleEn,
          dateStr: d.dateStr,
          relatedStudyQuestion: d.relatedStudyQuestion,
          relatedStudyQuestionEn: d.relatedStudyQuestionEn,
          somaticPrinciple: d.somaticPrinciple,
          somaticPrincipleEn: d.somaticPrincipleEn,
          authorReference: d.authorReference,
          summaryInsights: d.summaryInsights ?? [],
          summaryInsightsEn: d.summaryInsightsEn ?? [],
          messages: [
            {
              id: `${d.id}-m1`,
              senderName: 'מדריך סומטי (ci-eye)',
              isGuide: true,
              text: d.initialGuidePrompt || d.initialGuidePromptEn,
              timeStr: '09:00',
              contextTip: d.sourceTitle || d.authorReference,
            },
          ],
          isCurated: true,
          sourceType: d.sourceType,
          sourceTitle: d.sourceTitle,
          authorEmail: d.authorEmail,
        };
      });
      handlers.onInquiries(list);
    },
    (err) => {
      console.warn('Could not listen to curated_inquiries:', err);
    },
  );

  const unsubGuides = onSnapshot(
    collection(db, 'curated_guides'),
    (snap) => {
      if (!handlers.onGuides) return;
      const list = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: (d.topicKey || d.id) as SomaticGuideTopicId,
          titleHe: d.title,
          titleEn: d.titleEn,
          subtitleHe: d.subtitle,
          subtitleEn: d.subtitleEn,
          explanationHe: d.explanation,
          explanationEn: d.explanationEn,
          practicalTipsHe: d.practicalTips ?? [],
          practicalTipsEn: d.practicalTipsEn ?? [],
          reflectionQuestionHe: d.reflectionQuestion ?? '',
          reflectionQuestionEn: d.reflectionQuestionEn ?? '',
          isCurated: true,
          sourceType: d.sourceType,
          authorEmail: d.authorEmail,
        };
      });
      handlers.onGuides(list);
    },
    (err) => {
      console.warn('Could not listen to curated_guides:', err);
    },
  );

  return () => {
    unsubRecs();
    unsubInqs();
    unsubGuides();
  };
}

export async function publishCuratedRecommendation(
  rec: SomaticRecommendation,
  authorEmail: string,
): Promise<void> {
  const safeId = rec.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `curated_recommendations/${safeId}`;
  const ref = doc(db, 'curated_recommendations', safeId);
  try {
    const existingSnap = await getDoc(ref);
    await setDoc(ref, {
      id: safeId,
      shortTitle: rec.shortTitle.slice(0, 160),
      shortTitleEn: (rec.shortTitleEn || rec.shortTitle).slice(0, 160),
      subtitleTag: rec.subtitleTag.slice(0, 160),
      subtitleTagEn: (rec.subtitleTagEn || rec.subtitleTag).slice(0, 160),
      axisType: rec.axisType,
      summaryPreview: rec.summaryPreview.slice(0, 240),
      fullExplanation: rec.fullExplanation.slice(0, 4000),
      fullExplanationEn: (rec.fullExplanationEn || rec.fullExplanation).slice(0, 4000),
      practicalSteps: rec.practicalSteps.slice(0, 12),
      practicalStepsEn: (rec.practicalStepsEn.length ? rec.practicalStepsEn : rec.practicalSteps).slice(0, 12),
      quoteText: rec.quoteText.slice(0, 600),
      quoteTextEn: (rec.quoteTextEn || rec.quoteText).slice(0, 600),
      quoteAuthor: rec.quoteAuthor.slice(0, 140),
      quoteAuthorEn: (rec.quoteAuthorEn || rec.quoteAuthor).slice(0, 140),
      hasInteractivePractice: Boolean(rec.hasInteractivePractice),
      scoreId: (rec.scoreId || '').slice(0, 64),
      sourceType: rec.sourceType || 'manual',
      sourceTitle: (rec.sourceTitle || '').slice(0, 200),
      authorEmail: authorEmail.toLowerCase().slice(0, 128),
      createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCuratedRecommendation(recId: string): Promise<void> {
  const safeId = recId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `curated_recommendations/${safeId}`;
  try {
    await deleteDoc(doc(db, 'curated_recommendations', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function publishCuratedInquiry(
  inquiry: ConversationInquiry & { initialGuidePrompt?: string; initialGuidePromptEn?: string },
  authorEmail: string,
): Promise<void> {
  const safeId = inquiry.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `curated_inquiries/${safeId}`;
  const ref = doc(db, 'curated_inquiries', safeId);
  const firstPrompt = inquiry.initialGuidePrompt || inquiry.messages[0]?.text || inquiry.relatedStudyQuestion;
  const firstPromptEn =
    inquiry.initialGuidePromptEn || inquiry.relatedStudyQuestionEn || firstPrompt;

  try {
    const existingSnap = await getDoc(ref);
    await setDoc(ref, {
      id: safeId,
      title: inquiry.title.slice(0, 200),
      titleEn: (inquiry.titleEn || inquiry.title).slice(0, 200),
      category: inquiry.category.slice(0, 100),
      categoryEn: (inquiry.categoryEn || inquiry.category).slice(0, 100),
      subtitle: inquiry.subtitle.slice(0, 240),
      subtitleEn: (inquiry.subtitleEn || inquiry.subtitle).slice(0, 240),
      dateStr: inquiry.dateStr.slice(0, 60) || 'Today',
      relatedStudyQuestion: inquiry.relatedStudyQuestion.slice(0, 500),
      relatedStudyQuestionEn: (inquiry.relatedStudyQuestionEn || inquiry.relatedStudyQuestion).slice(0, 500),
      somaticPrinciple: inquiry.somaticPrinciple.slice(0, 800),
      somaticPrincipleEn: (inquiry.somaticPrincipleEn || inquiry.somaticPrinciple).slice(0, 800),
      authorReference: inquiry.authorReference.slice(0, 160),
      summaryInsights: inquiry.summaryInsights.slice(0, 12),
      summaryInsightsEn: (inquiry.summaryInsightsEn?.length
        ? inquiry.summaryInsightsEn
        : inquiry.summaryInsights
      ).slice(0, 12),
      initialGuidePrompt: firstPrompt.slice(0, 1200),
      initialGuidePromptEn: firstPromptEn.slice(0, 1200),
      sourceType: inquiry.sourceType || 'manual',
      sourceTitle: (inquiry.sourceTitle || '').slice(0, 200),
      authorEmail: authorEmail.toLowerCase().slice(0, 128),
      createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCuratedInquiry(inquiryId: string): Promise<void> {
  const safeId = inquiryId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `curated_inquiries/${safeId}`;
  try {
    await deleteDoc(doc(db, 'curated_inquiries', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function publishCuratedGuideTopic(
  topic: SomaticGuideTopic,
  authorEmail: string,
): Promise<void> {
  const safeId = topic.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `curated_guides/${safeId}`;
  const ref = doc(db, 'curated_guides', safeId);
  try {
    const existingSnap = await getDoc(ref);
    await setDoc(ref, {
      id: safeId,
      topicKey: topic.id.slice(0, 64),
      title: topic.titleHe.slice(0, 200),
      titleEn: (topic.titleEn || topic.titleHe).slice(0, 200),
      subtitle: topic.subtitleHe.slice(0, 240),
      subtitleEn: (topic.subtitleEn || topic.subtitleHe).slice(0, 240),
      explanation: topic.explanationHe.slice(0, 4000),
      explanationEn: (topic.explanationEn || topic.explanationHe).slice(0, 4000),
      practicalTips: topic.practicalTipsHe.slice(0, 10),
      practicalTipsEn: (topic.practicalTipsEn.length
        ? topic.practicalTipsEn
        : topic.practicalTipsHe
      ).slice(0, 10),
      reflectionQuestion: (topic.reflectionQuestionHe || '').slice(0, 400),
      reflectionQuestionEn: (topic.reflectionQuestionEn || '').slice(0, 400),
      sourceType: topic.sourceType || 'manual',
      authorEmail: authorEmail.toLowerCase().slice(0, 128),
      createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCuratedGuideTopic(topicId: string): Promise<void> {
  const safeId = topicId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `curated_guides/${safeId}`;
  try {
    await deleteDoc(doc(db, 'curated_guides', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Manager RBAC & Super Manager Roster ---

export const DEFAULT_SUPER_MANAGER: ManagerAccount = {
  email: ROOT_SUPER_MANAGER_EMAIL,
  displayName: 'Zohar Bar-On (Root Super Manager)',
  role: 'super_manager',
  active: true,
  privileges: {
    editRecommendationsAndGuides: true,
    editInquiriesAndFlashcards: true,
    importTextAndNotebookLM: true,
  },
  addedBy: 'system',
  isRoot: true,
};

export async function ensureRootSuperManagerDoc(): Promise<void> {
  const current = auth.currentUser;
  if (!current?.email || current.email.toLowerCase() !== ROOT_SUPER_MANAGER_EMAIL) return;
  const ref = doc(db, 'managers', ROOT_SUPER_MANAGER_EMAIL);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: ROOT_SUPER_MANAGER_EMAIL,
      displayName: current.displayName || 'Zohar Bar-On',
      role: 'super_manager',
      active: true,
      privileges: {
        editRecommendationsAndGuides: true,
        editInquiriesAndFlashcards: true,
        importTextAndNotebookLM: true,
      },
      addedBy: ROOT_SUPER_MANAGER_EMAIL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export function subscribeOwnManagerRole(
  userEmail: string,
  onChange: (account: ManagerAccount | null) => void,
): Unsubscribe {
  const lower = userEmail.toLowerCase();
  if (lower === ROOT_SUPER_MANAGER_EMAIL) {
    onChange(DEFAULT_SUPER_MANAGER);
    ensureRootSuperManagerDoc().catch((e) => console.warn('Root manager ensure skipped:', e));
  }

  return onSnapshot(
    doc(db, 'managers', lower),
    (snap) => {
      if (lower === ROOT_SUPER_MANAGER_EMAIL) {
        onChange(DEFAULT_SUPER_MANAGER);
        return;
      }
      if (!snap.exists()) {
        onChange(null);
        return;
      }
      const d = snap.data();
      onChange({
        email: d.email,
        displayName: d.displayName,
        role: d.role,
        active: Boolean(d.active),
        privileges: d.privileges,
        addedBy: d.addedBy,
      });
    },
    () => {
      onChange(lower === ROOT_SUPER_MANAGER_EMAIL ? DEFAULT_SUPER_MANAGER : null);
    },
  );
}

export function subscribeManagersRoster(
  onRoster: (managers: ManagerAccount[]) => void,
  onError: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, 'managers'),
    (snap) => {
      const list: ManagerAccount[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          email: d.email,
          displayName: d.displayName,
          role: d.role,
          active: Boolean(d.active),
          privileges: d.privileges,
          addedBy: d.addedBy,
          isRoot: d.email === ROOT_SUPER_MANAGER_EMAIL,
        };
      });
      if (!list.some((m) => m.email === ROOT_SUPER_MANAGER_EMAIL)) {
        list.unshift(DEFAULT_SUPER_MANAGER);
      }
      onRoster(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, 'managers');
      } catch (wrapped) {
        onError(wrapped as Error);
      }
    },
  );
}

export async function upsertManagerAccount(input: {
  email: string;
  displayName: string;
  role: 'manager' | 'super_manager';
  active: boolean;
  privileges: ManagerPrivileges;
  addedBy: string;
}): Promise<void> {
  const normalized = input.email.trim().toLowerCase();
  if (!/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(normalized)) {
    throw new Error('Please enter a valid email address.');
  }
  const path = `managers/${normalized}`;
  const ref = doc(db, 'managers', normalized);
  try {
    const existingSnap = await getDoc(ref);
    const isRoot = normalized === ROOT_SUPER_MANAGER_EMAIL;
    await setDoc(ref, {
      email: normalized,
      displayName: (input.displayName.trim() || normalized.split('@')[0]).slice(0, 120),
      role: isRoot ? 'super_manager' : input.role,
      active: isRoot ? true : Boolean(input.active),
      privileges: isRoot
        ? {
            editRecommendationsAndGuides: true,
            editInquiriesAndFlashcards: true,
            importTextAndNotebookLM: true,
          }
        : input.privileges,
      addedBy: existingSnap.exists()
        ? existingSnap.data().addedBy
        : input.addedBy.toLowerCase().slice(0, 128),
      createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeManagerAccount(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (normalized === ROOT_SUPER_MANAGER_EMAIL) {
    throw new Error('The root Super Manager cannot be removed.');
  }
  const path = `managers/${normalized}`;
  try {
    await deleteDoc(doc(db, 'managers', normalized));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Site Content, Titles & About Config ---

export function subscribeSiteConfig(onChange: (config: SiteContentConfig | null) => void): Unsubscribe {
  return onSnapshot(
    doc(db, 'site_config', 'main'),
    (snap) => {
      if (!snap.exists()) {
        onChange(null);
        return;
      }
      const d = snap.data();
      onChange({
        id: d.id || 'main',
        brandName: d.brandName || 'Contact Ways',
        brandTaglineHe: d.brandTaglineHe || '',
        brandTaglineEn: d.brandTaglineEn || '',
        homeKickerHe: d.homeKickerHe || '',
        homeKickerEn: d.homeKickerEn || '',
        homeTitleHe: d.homeTitleHe || '',
        homeTitleEn: d.homeTitleEn || '',
        homeSubtitleHe: d.homeSubtitleHe || '',
        homeSubtitleEn: d.homeSubtitleEn || '',
        practiceSectionTitleHe: d.practiceSectionTitleHe || '',
        practiceSectionTitleEn: d.practiceSectionTitleEn || '',
        aboutTitleHe: d.aboutTitleHe || '',
        aboutTitleEn: d.aboutTitleEn || '',
        aboutDescriptionHe: d.aboutDescriptionHe || '',
        aboutDescriptionEn: d.aboutDescriptionEn || '',
        aboutPhilosophyHe: d.aboutPhilosophyHe || '',
        aboutPhilosophyEn: d.aboutPhilosophyEn || '',
        developerName:
          d.developerName === 'Zohar Bar-On (זוהר בר-און)'
            ? 'Zohar R.'
            : d.developerName || 'Zohar R.',
        developerRoleHe: d.developerRoleHe || '',
        developerRoleEn: d.developerRoleEn || '',
        developerEmail: d.developerEmail || '',
        developerWebsite: d.developerWebsite || '',
        authorEmail: d.authorEmail || '',
      });
    },
    (err) => {
      console.warn('Could not subscribe to site_config/main:', err);
    },
  );
}

export async function publishSiteConfig(
  config: SiteContentConfig,
  authorEmail: string,
): Promise<void> {
  const path = 'site_config/main';
  const ref = doc(db, 'site_config', 'main');
  try {
    const existingSnap = await getDoc(ref);
    await setDoc(ref, {
      id: 'main',
      brandName: (config.brandName.trim() || 'Contact Ways').slice(0, 120),
      brandTaglineHe: config.brandTaglineHe.slice(0, 160),
      brandTaglineEn: config.brandTaglineEn.slice(0, 160),
      homeKickerHe: config.homeKickerHe.slice(0, 160),
      homeKickerEn: config.homeKickerEn.slice(0, 160),
      homeTitleHe: (config.homeTitleHe.trim() || 'Contact Ways').slice(0, 200),
      homeTitleEn: (config.homeTitleEn.trim() || 'Contact Ways').slice(0, 200),
      homeSubtitleHe: config.homeSubtitleHe.slice(0, 600),
      homeSubtitleEn: config.homeSubtitleEn.slice(0, 600),
      practiceSectionTitleHe: (config.practiceSectionTitleHe.trim() || 'כרטיסיות תרגול ופעילות מומלצת').slice(0, 160),
      practiceSectionTitleEn: (config.practiceSectionTitleEn.trim() || 'Practice Cards & Recommended Activities').slice(0, 160),
      aboutTitleHe: (config.aboutTitleHe.trim() || 'אודות Contact Ways').slice(0, 200),
      aboutTitleEn: (config.aboutTitleEn.trim() || 'About Contact Ways').slice(0, 200),
      aboutDescriptionHe: config.aboutDescriptionHe.slice(0, 3000),
      aboutDescriptionEn: config.aboutDescriptionEn.slice(0, 3000),
      aboutPhilosophyHe: config.aboutPhilosophyHe.slice(0, 1500),
      aboutPhilosophyEn: config.aboutPhilosophyEn.slice(0, 1500),
      developerName: (config.developerName.trim() || 'Zohar R.').slice(0, 120),
      developerRoleHe: config.developerRoleHe.slice(0, 160),
      developerRoleEn: config.developerRoleEn.slice(0, 160),
      developerEmail: config.developerEmail.slice(0, 160),
      developerWebsite: config.developerWebsite.slice(0, 300),
      authorEmail: authorEmail.toLowerCase().slice(0, 128),
      createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- User Feedback & Manager Inbox ---

function mapFeedbackDoc(docSnap: { id: string; data: () => Record<string, unknown> }): UserFeedback {
  const d = docSnap.data();
  return {
    id: String(d.id || docSnap.id),
    uid: String(d.uid || ''),
    senderName: String(d.senderName || 'User'),
    senderEmail: String(d.senderEmail || ''),
    category: (['idea', 'bug', 'content', 'general'].includes(String(d.category))
      ? String(d.category)
      : 'general') as FeedbackCategory,
    message: String(d.message || ''),
    rating: typeof d.rating === 'number' ? d.rating : 0,
    pageContext: String(d.pageContext || 'home'),
    status: (['new', 'reviewed', 'resolved'].includes(String(d.status))
      ? String(d.status)
      : 'new') as FeedbackStatus,
    managerNote: String(d.managerNote || ''),
    createdAtMs: typeof d.createdAtMs === 'number' ? d.createdAtMs : Date.now(),
  };
}

export async function submitUserFeedbackCloud(input: {
  uid: string;
  senderName: string;
  senderEmail: string;
  category: FeedbackCategory;
  message: string;
  rating: number;
  pageContext: string;
}): Promise<UserFeedback> {
  const safeId = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const path = `user_feedback/${safeId}`;
  const createdAtMs = Date.now();
  const safeRating = Math.min(5, Math.max(0, Math.round(input.rating || 0)));
  const item: UserFeedback = {
    id: safeId,
    uid: input.uid.slice(0, 128),
    senderName: (input.senderName.trim() || 'Dancer').slice(0, 120),
    senderEmail: input.senderEmail.trim().slice(0, 160),
    category: input.category,
    message: input.message.trim().slice(0, 3000),
    rating: safeRating,
    pageContext: (input.pageContext.trim() || 'home').slice(0, 80),
    status: 'new',
    managerNote: '',
    createdAtMs,
  };
  try {
    await setDoc(doc(db, 'user_feedback', safeId), {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return item;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeOwnFeedbacks(
  uid: string,
  onList: (items: UserFeedback[]) => void,
  onError: (err: Error) => void,
): Unsubscribe {
  const q = query(collection(db, 'user_feedback'), where('uid', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map(mapFeedbackDoc).sort((a, b) => b.createdAtMs - a.createdAtMs);
      onList(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, 'user_feedback');
      } catch (wrapped) {
        onError(wrapped as Error);
      }
    },
  );
}

export function subscribeAllFeedbacksManager(
  onList: (items: UserFeedback[]) => void,
  onError: (err: Error) => void,
): Unsubscribe {
  const q = query(collection(db, 'user_feedback'), orderBy('createdAtMs', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onList(snap.docs.map(mapFeedbackDoc));
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, 'user_feedback');
      } catch (wrapped) {
        onError(wrapped as Error);
      }
    },
  );
}

export async function updateUserFeedbackStatusCloud(
  feedbackId: string,
  status: FeedbackStatus,
  managerNote: string,
): Promise<void> {
  const safeId = feedbackId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `user_feedback/${safeId}`;
  try {
    await updateDoc(doc(db, 'user_feedback', safeId), {
      status,
      managerNote: managerNote.slice(0, 1200),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteUserFeedbackCloud(feedbackId: string): Promise<void> {
  const safeId = feedbackId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `user_feedback/${safeId}`;
  try {
    await deleteDoc(doc(db, 'user_feedback', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

