import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  FolderOpen,
  Heading,
  Inbox,
  Info,
  Plus,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { useContactWays } from '../context/ContactWaysContext';
import {
  ConversationInquiry,
  FeedbackStatus,
  GoogleDocFileSummary,
  GuidedScoreId,
  ManagerAccount,
  ManagerPrivileges,
  ReflectionAxisId,
  SiteContentConfig,
  SomaticAxisType,
  SomaticGuideTopic,
  SomaticRecommendation,
} from '../types/contactWays';
import {
  deleteCuratedInquiry,
  deleteCuratedRecommendation,
  deleteUserFeedbackCloud,
  publishCuratedGuideTopic,
  publishCuratedInquiry,
  publishCuratedRecommendation,
  publishSiteConfig,
  removeManagerAccount,
  updateUserFeedbackStatusCloud,
  upsertManagerAccount,
} from '../firebase/firebaseClient';
import { listGoogleDocs, readGoogleDocContent } from '../services/googleDocsService';
import { ROOT_SUPER_MANAGER_EMAIL } from '../i18n/languages';
import { DEFAULT_SITE_CONFIG, SOMATIC_AXES, getAxisShortLabel } from '../data/seedData';
import { GUIDED_SCORES, MATRIX_PARAMETERS } from '../data/matrixData';

type StudioTab = 'content' | 'titles' | 'feedback' | 'import' | 'roster';

export const ManagerStudioView: React.FC = () => {
  const {
    authUser,
    isActiveManager,
    isSuperManager,
    managerPrivileges,
    managersRoster,
    recommendations,
    inquiries,
    guideTopics,
    siteConfig,
    allFeedbacks,
    workspaceToken,
    connectWorkspaceDocs,
    openGuideTopic,
    curatedParamNotes,
    saveParamNote,
    language,
    tr,
  } = useContactWays();

  const isHe = language === 'he';
  const [tab, setTab] = useState<StudioTab>('content');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Content editing state
  const [contentKind, setContentKind] = useState<'recommendation' | 'inquiry' | 'guide' | 'matrix'>('recommendation');
  const [onlyRecommendedFilter, setOnlyRecommendedFilter] = useState(false);
  const [matrixFilterAxis, setMatrixFilterAxis] = useState<'all' | ReflectionAxisId>('all');
  const [matrixSearchQuery, setMatrixSearchQuery] = useState('');
  const [selectedParamId, setSelectedParamId] = useState<string>(MATRIX_PARAMETERS[0]?.id || 'mechanics-01');
  const [paramHighlightedDraft, setParamHighlightedDraft] = useState(false);
  const [paramNoteHeDraft, setParamNoteHeDraft] = useState('');
  const [paramNoteEnDraft, setParamNoteEnDraft] = useState('');
  const [siteDraft, setSiteDraft] = useState<SiteContentConfig>(siteConfig);
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | FeedbackStatus>('all');
  const [feedbackNotes, setFeedbackNotes] = useState<Record<string, string>>({});
  const [confirmDeleteFeedbackId, setConfirmDeleteFeedbackId] = useState<string | null>(null);

  useEffect(() => {
    setSiteDraft(siteConfig);
  }, [siteConfig]);
  const [recForm, setRecForm] = useState<SomaticRecommendation>({
    id: `rec-custom-${Date.now()}`,
    shortTitle: '',
    shortTitleEn: '',
    subtitleTag: '',
    subtitleTagEn: '',
    axisType: 'perception',
    summaryPreview: '',
    fullExplanation: '',
    fullExplanationEn: '',
    practicalSteps: [''],
    practicalStepsEn: [''],
    quoteText: '',
    quoteTextEn: '',
    quoteAuthor: '',
    quoteAuthorEn: '',
    hasInteractivePractice: false,
    scoreId: undefined,
    sourceType: 'manual',
    sourceTitle: '',
  });

  const [inqForm, setInqForm] = useState<
    ConversationInquiry & { initialGuidePrompt?: string; initialGuidePromptEn?: string }
  >({
    id: `inq-custom-${Date.now()}`,
    title: '',
    titleEn: '',
    category: 'מחקר סומטי',
    categoryEn: 'Somatic Study',
    subtitle: '',
    subtitleEn: '',
    dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    messages: [],
    summaryInsights: [''],
    summaryInsightsEn: [''],
    relatedStudyQuestion: '',
    relatedStudyQuestionEn: '',
    somaticPrinciple: '',
    somaticPrincipleEn: '',
    authorReference: '',
    initialGuidePrompt: '',
    initialGuidePromptEn: '',
    sourceType: 'manual',
    sourceTitle: '',
  });

  const [selectedGuideId, setSelectedGuideId] = useState(guideTopics[0]?.id ?? 'AXIS_MECHANICS');
  const activeGuideBase = guideTopics.find((g) => g.id === selectedGuideId) || guideTopics[0];
  const [guideDraft, setGuideDraft] = useState<SomaticGuideTopic>(activeGuideBase);

  const filteredMatrixParams = useMemo(() => {
    const q = matrixSearchQuery.trim().toLowerCase();
    return MATRIX_PARAMETERS.filter((p) => {
      if (matrixFilterAxis !== 'all' && p.axisId !== matrixFilterAxis) return false;
      if (!q) return true;
      return `${p.title.he} ${p.title.en} ${p.underDesc.he} ${p.flowDesc.he} ${p.overDesc.he}`
        .toLowerCase()
        .includes(q);
    });
  }, [matrixFilterAxis, matrixSearchQuery]);

  const activeMatrixParam =
    MATRIX_PARAMETERS.find((p) => p.id === selectedParamId) || MATRIX_PARAMETERS[0];

  useEffect(() => {
    const existing = curatedParamNotes[selectedParamId];
    setParamHighlightedDraft(Boolean(existing?.highlighted));
    setParamNoteHeDraft(existing?.noteHe || '');
    setParamNoteEnDraft(existing?.noteEn || '');
  }, [curatedParamNotes, selectedParamId]);

  // Import state (Google Docs + NotebookLM Text Upload)
  const [docSearch, setDocSearch] = useState('');
  const [googleDocs, setGoogleDocs] = useState<GoogleDocFileSummary[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [rawSourceTitle, setRawSourceTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [importTargetKind, setImportTargetKind] = useState<'recommendation' | 'inquiry'>('recommendation');
  const [importSourceType, setImportSourceType] = useState<'text_upload' | 'google_doc' | 'notebooklm'>('notebooklm');

  // Super Manager Roster state
  const [newMgrEmail, setNewMgrEmail] = useState('');
  const [newMgrName, setNewMgrName] = useState('');
  const [newMgrRole, setNewMgrRole] = useState<'manager' | 'super_manager'>('manager');
  const [newMgrPrivs, setNewMgrPrivs] = useState<ManagerPrivileges>({
    editRecommendationsAndGuides: true,
    editInquiriesAndFlashcards: true,
    importTextAndNotebookLM: true,
  });
  const [confirmRemoveEmail, setConfirmRemoveEmail] = useState<string | null>(null);
  const [confirmDeleteContent, setConfirmDeleteContent] = useState<{
    kind: 'recommendation' | 'inquiry';
    id: string;
    label: string;
  } | null>(null);

  if (!isActiveManager || !authUser?.email) {
    return (
      <div className="rounded-2xl border border-[#DCE8F5] bg-white p-8 text-center">
        <Shield className="mx-auto h-8 w-8 text-[#94A3B8]" />
        <h1 className="mt-3 text-base font-semibold text-[#1E293B]">
          {tr('גישה למנהלים מורשים בלבד', 'Authorized Manager Access Required')}
        </h1>
        <p className="mt-1 text-sm text-[#475569]">
          {tr(
            'התחבר עם חשבון Google המופיע ברשימת המנהלים כדי לערוך תוכן או לייבא מקורות מ-NotebookLM ו-Google Docs.',
            'Sign in with an authorized Manager or Super Manager Google account to publish curated content.',
          )}
        </p>
      </div>
    );
  }

  const authorEmail = authUser.email.toLowerCase();

  const handleLoadGuideIntoDraft = (topic: SomaticGuideTopic) => {
    setSelectedGuideId(topic.id);
    setGuideDraft({ ...topic });
  };

  const handlePublishRec = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      await publishCuratedRecommendation(
        {
          ...recForm,
          summaryPreview:
            recForm.summaryPreview.trim() || recForm.fullExplanation.slice(0, 120) || recForm.shortTitle,
          practicalSteps: recForm.practicalSteps.filter((s) => s.trim()),
          practicalStepsEn: recForm.practicalStepsEn.filter((s) => s.trim()),
        },
        authorEmail,
      );
      setStatusMsg(tr('כרטיסיית התרגול פורסמה מיידית לכל המשתמשים.', 'Practice card published live to all users.'));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to publish recommendation.');
    } finally {
      setBusy(false);
    }
  };

  const handlePublishInq = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      await publishCuratedInquiry(
        {
          ...inqForm,
          summaryInsights: inqForm.summaryInsights.filter((s) => s.trim()),
          summaryInsightsEn: (inqForm.summaryInsightsEn ?? []).filter((s) => s.trim()),
        },
        authorEmail,
      );
      setStatusMsg(tr('הדיאלוג וכרטיסיית הלימוד פורסמו לכל המשתמשים.', 'Inquiry & flashcard published live to all users.'));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to publish inquiry.');
    } finally {
      setBusy(false);
    }
  };

  const handlePublishGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      await publishCuratedGuideTopic(
        {
          ...guideDraft,
          sourceType: 'manual',
        },
        authorEmail,
      );
      setStatusMsg(tr('מדריך הנושא עודכן ופורסם לכל המשתמשים.', 'Guide topic updated live for all users.'));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to publish guide topic.');
    } finally {
      setBusy(false);
    }
  };

  const handlePublishSiteConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      await publishSiteConfig(siteDraft, authorEmail);
      setStatusMsg(
        tr(
          'כותרות האתר, דף הבית, אודות ופרטי הקשר פורסמו מיידית לכל המשתמשים.',
          'Site titles, home headings, About copy, and developer contact updated live for all users.',
        ),
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to publish site titles & config.');
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateFeedback = async (feedbackId: string, status: FeedbackStatus, fallbackNote: string) => {
    setBusy(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      const note = feedbackNotes[feedbackId] ?? fallbackNote;
      await updateUserFeedbackStatusCloud(feedbackId, status, note);
      setStatusMsg(tr('סטטוס המשוב והתגובה נשמרו.', 'Feedback status and manager reply saved.'));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update feedback.');
    } finally {
      setBusy(false);
    }
  };

  const handleFetchDocs = async () => {
    setErrorMsg(null);
    setLoadingDocs(true);
    try {
      const token = workspaceToken || (await connectWorkspaceDocs());
      if (!token) return;
      const files = await listGoogleDocs(token, docSearch);
      setGoogleDocs(files);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not fetch Google Docs.');
    } finally {
      setLoadingDocs(false);
    }
  };

  const handlePickGoogleDoc = async (docSummary: GoogleDocFileSummary) => {
    setErrorMsg(null);
    setLoadingDocs(true);
    try {
      const token = workspaceToken || (await connectWorkspaceDocs());
      if (!token) return;
      const loaded = await readGoogleDocContent(token, docSummary.id);
      setRawSourceTitle(loaded.title);
      setRawText(loaded.text);
      setImportSourceType('google_doc');
      setStatusMsg(tr(`המסמך "${loaded.title}" נטען מ-Google Docs.`, `Loaded "${loaded.title}" from Google Docs.`));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not read Google Doc content.');
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleUploadTextFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setRawSourceTitle(file.name.replace(/\.(txt|md)$/i, ''));
    setRawText(text);
    setImportSourceType('notebooklm');
    setStatusMsg(tr(`הקובץ "${file.name}" נטען בהצלחה.`, `Loaded file "${file.name}".`));
  };

  const handleStructureWithAI = async () => {
    setBusy(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/manager/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          sourceTitle: rawSourceTitle || 'NotebookLM Study Note',
          targetKind: importTargetKind,
        }),
      });
      const data = (await res.json()) as { structured?: Record<string, unknown>; error?: string };
      if (!res.ok || !data.structured) {
        throw new Error(data.error || 'Could not structure source text.');
      }

      const s = data.structured;
      if (importTargetKind === 'recommendation') {
        setRecForm({
          id: `rec-imp-${Date.now()}`,
          shortTitle: String(s.shortTitle || rawSourceTitle || 'תרגול סומטי'),
          shortTitleEn: String(s.shortTitleEn || rawSourceTitle || 'Somatic Practice'),
          subtitleTag: String(s.subtitleTag || 'מקור NotebookLM / Docs'),
          subtitleTagEn: String(s.subtitleTagEn || 'Imported Study Source'),
          axisType: ([
            'mechanics',
            'perception',
            'behavior',
            'emotion',
            'ethics',
            'ATTUNEMENT',
            'WEIGHT_SHARING',
            'BOUNDARIES',
            'FALLING_MOMENTUM',
            'GROUNDING',
            'TACTILE_ATTENTION',
          ].includes(String(s.axisType))
            ? s.axisType
            : 'perception') as SomaticAxisType,
          summaryPreview: String(s.summaryPreview || ''),
          fullExplanation: String(s.fullExplanation || ''),
          fullExplanationEn: String(s.fullExplanationEn || ''),
          practicalSteps: Array.isArray(s.practicalSteps) ? (s.practicalSteps as string[]) : [],
          practicalStepsEn: Array.isArray(s.practicalStepsEn) ? (s.practicalStepsEn as string[]) : [],
          quoteText: String(s.quoteText || ''),
          quoteTextEn: String(s.quoteTextEn || ''),
          quoteAuthor: String(s.quoteAuthor || rawSourceTitle),
          quoteAuthorEn: String(s.quoteAuthorEn || rawSourceTitle),
          hasInteractivePractice: false,
          scoreId: undefined,
          sourceType: importSourceType,
          sourceTitle: rawSourceTitle,
        });
        setContentKind('recommendation');
      } else {
        setInqForm({
          id: `inq-imp-${Date.now()}`,
          title: String(s.title || rawSourceTitle || 'חקירה סומטית'),
          titleEn: String(s.titleEn || rawSourceTitle || 'Somatic Inquiry'),
          category: String(s.category || 'מחקר סומטי'),
          categoryEn: String(s.categoryEn || 'Somatic Study'),
          subtitle: String(s.subtitle || ''),
          subtitleEn: String(s.subtitleEn || ''),
          dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          messages: [],
          summaryInsights: Array.isArray(s.summaryInsights) ? (s.summaryInsights as string[]) : [],
          summaryInsightsEn: Array.isArray(s.summaryInsightsEn) ? (s.summaryInsightsEn as string[]) : [],
          relatedStudyQuestion: String(s.relatedStudyQuestion || ''),
          relatedStudyQuestionEn: String(s.relatedStudyQuestionEn || ''),
          somaticPrinciple: String(s.somaticPrinciple || ''),
          somaticPrincipleEn: String(s.somaticPrincipleEn || ''),
          authorReference: String(s.authorReference || rawSourceTitle || 'NotebookLM'),
          initialGuidePrompt: String(s.initialGuidePrompt || ''),
          initialGuidePromptEn: String(s.initialGuidePromptEn || ''),
          sourceType: importSourceType,
          sourceTitle: rawSourceTitle,
        });
        setContentKind('inquiry');
      }
      setTab('content');
      setStatusMsg(
        tr(
          'התוכן עובד לשדות דו-לשוניים. בדוק וערוך לפני פרסום לכל המשתמשים.',
          'Source text structured into bilingual fields! Review and click Publish Live.',
        ),
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to structure source text.');
    } finally {
      setBusy(false);
    }
  };

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      await upsertManagerAccount({
        email: newMgrEmail,
        displayName: newMgrName,
        role: newMgrRole,
        active: true,
        privileges: newMgrPrivs,
        addedBy: authorEmail,
      });
      setNewMgrEmail('');
      setNewMgrName('');
      setStatusMsg(tr('המנהל נוסף/עודכן בהצלחה.', 'Manager saved to roster.'));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save manager.');
    } finally {
      setBusy(false);
    }
  };

  const toggleExistingPrivilege = async (
    mgr: ManagerAccount,
    key: keyof ManagerPrivileges,
  ) => {
    if (mgr.email === ROOT_SUPER_MANAGER_EMAIL) return;
    await upsertManagerAccount({
      email: mgr.email,
      displayName: mgr.displayName,
      role: mgr.role,
      active: mgr.active,
      privileges: { ...mgr.privileges, [key]: !mgr.privileges[key] },
      addedBy: authorEmail,
    });
  };

  const toggleExistingRoleOrActive = async (
    mgr: ManagerAccount,
    patch: Partial<Pick<ManagerAccount, 'role' | 'active'>>,
  ) => {
    if (mgr.email === ROOT_SUPER_MANAGER_EMAIL) return;
    await upsertManagerAccount({
      email: mgr.email,
      displayName: mgr.displayName,
      role: patch.role ?? mgr.role,
      active: patch.active ?? mgr.active,
      privileges: mgr.privileges,
      addedBy: authorEmail,
    });
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <section className="rounded-2xl border border-[#DCE8F5] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#4F46E5]">
              {isSuperManager
                ? tr('סופר-מנהל (Super Manager)', 'Super Manager Console')
                : tr('מנהל תוכן (Content Manager)', 'Content Manager Studio')}
              {' · '}
              <span>{authorEmail}</span>
            </div>
            <h1 className="font-display mt-1 text-xl font-bold text-[#3730A3]">
              {tr('סטודיו ניהול התוכן והמקורות', 'Manager Content & NotebookLM Studio')}
            </h1>
            <p className="mt-0.5 text-xs text-[#475569]">
              {tr(
                'כל פרסום מתעדכן מיידית בקטלוג המשותף לכל משתמשי האפליקציה.',
                'Published recommendations, guides, inquiries, and flashcards go live immediately for all users.',
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openGuideTopic('GUIDE_MANAGER_WORKFLOW')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE8F5] bg-[#F0F7FF] px-3 py-1.5 text-xs font-semibold text-[#2A82C5] hover:bg-[#DCE8F5]/60 whitespace-nowrap"
            >
              <Info className="h-3.5 w-3.5" />
              <span>{tr('מדריך למנהל תוכן', 'Manager Guide')}</span>
            </button>

            <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-1">
            <button
              type="button"
              onClick={() => setTab('content')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                tab === 'content' ? 'bg-[#4F46E5] text-white' : 'text-[#475569] hover:bg-white'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              {tr('תוכן וכרטיסיות', 'Cards & Content')}
            </button>

            {managerPrivileges.editRecommendationsAndGuides && (
              <button
                type="button"
                onClick={() => setTab('titles')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                  tab === 'titles' ? 'bg-[#4F46E5] text-white' : 'text-[#475569] hover:bg-white'
                }`}
              >
                <Heading className="h-3.5 w-3.5" />
                {tr('כותרות ואודות', 'Titles & About')}
              </button>
            )}

            <button
              type="button"
              onClick={() => setTab('feedback')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                tab === 'feedback' ? 'bg-[#4F46E5] text-white' : 'text-[#475569] hover:bg-white'
              }`}
            >
              <Inbox className="h-3.5 w-3.5" />
              <span>{tr('משובי משתמשים', 'User Feedback')}</span>
              <span className="font-mono-tabular opacity-85">
                ({allFeedbacks.filter((f) => f.status === 'new').length})
              </span>
            </button>

            {managerPrivileges.importTextAndNotebookLM && (
              <button
                type="button"
                onClick={() => setTab('import')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                  tab === 'import' ? 'bg-[#4F46E5] text-white' : 'text-[#475569] hover:bg-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                {tr('NotebookLM ו-Docs', 'NotebookLM & Docs')}
              </button>
            )}

            {isSuperManager && (
              <button
                type="button"
                onClick={() => setTab('roster')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                  tab === 'roster' ? 'bg-[#4F46E5] text-white' : 'text-[#475569] hover:bg-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                {tr('מנהלים והרשאות', 'Managers & Roles')}
              </button>
            )}
            </div>
          </div>
        </div>

        {statusMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
            {errorMsg}
          </div>
        )}
      </section>

      {/* TAB 1: Curated Content Editor */}
      {tab === 'content' && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Selector */}
          <aside className="space-y-4 rounded-2xl border border-[#DCE8F5] bg-white p-5 lg:col-span-4">
            <div className="flex flex-wrap gap-1.5">
              {managerPrivileges.editRecommendationsAndGuides && (
                <>
                  <button
                    type="button"
                    onClick={() => setContentKind('recommendation')}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap ${
                      contentKind === 'recommendation'
                        ? 'border-[#4F46E5] bg-[#4F46E5] text-white'
                        : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#475569]'
                    }`}
                  >
                    {tr('כרטיסיות תרגול', 'Practice Cards')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentKind('guide')}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap ${
                      contentKind === 'guide'
                        ? 'border-[#4F46E5] bg-[#4F46E5] text-white'
                        : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#475569]'
                    }`}
                  >
                    {tr('מדריכי ⓘ', 'Guide Topics')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentKind('matrix')}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap ${
                      contentKind === 'matrix'
                        ? 'border-[#4F46E5] bg-[#4F46E5] text-white'
                        : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#475569]'
                    }`}
                  >
                    {tr('דגשי מטריצה (150)', 'Matrix Highlights')}
                  </button>
                </>
              )}
              {managerPrivileges.editInquiriesAndFlashcards && (
                <button
                  type="button"
                  onClick={() => setContentKind('inquiry')}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap ${
                    contentKind === 'inquiry'
                      ? 'border-[#4F46E5] bg-[#4F46E5] text-white'
                      : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#475569]'
                  }`}
                >
                  {tr('דיאלוגים וכרטיסיות לימוד', 'Inquiries & Flashcards')}
                </button>
              )}
            </div>

            {contentKind === 'recommendation' && (
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setRecForm({
                      id: `rec-custom-${Date.now()}`,
                      shortTitle: '',
                      shortTitleEn: '',
                      subtitleTag: '',
                      subtitleTagEn: '',
                      axisType: 'perception',
                      summaryPreview: '',
                      fullExplanation: '',
                      fullExplanationEn: '',
                      practicalSteps: [''],
                      practicalStepsEn: [''],
                      quoteText: '',
                      quoteTextEn: '',
                      quoteAuthor: '',
                      quoteAuthorEn: '',
                      hasInteractivePractice: true,
                      scoreId: 'small_dance',
                      sourceType: 'manual',
                    })
                  }
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#4F46E5] py-2 text-xs font-semibold text-[#4F46E5] hover:bg-[#F0F7FF]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {tr('כרטיסיית תרגול ופעילות חדשה', 'New Practice Card')}
                </button>

                <label className="flex items-center gap-2 text-xs text-[#475569]">
                  <input
                    type="checkbox"
                    checked={onlyRecommendedFilter}
                    onChange={(e) => setOnlyRecommendedFilter(e.target.checked)}
                  />
                  <span>{tr('סנן לכרטיסיות עם פעילות מומלצת', 'Show interactive activity cards only')}</span>
                </label>

                <div className="max-h-96 space-y-1.5 overflow-y-auto">
                  {recommendations
                    .filter((r) => !onlyRecommendedFilter || r.hasInteractivePractice)
                    .map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2"
                    >
                      <button
                        type="button"
                        onClick={() => setRecForm({ ...r })}
                        className="min-w-0 flex-1 text-start"
                      >
                        <div className="truncate text-xs font-medium text-[#1E293B]">{r.shortTitle}</div>
                        <div className="truncate text-[11px] text-[#475569]">
                          {r.hasInteractivePractice
                            ? tr('כולל פעילות מומלצת מודרכת', 'Interactive Guided Practice')
                            : r.subtitleTag}
                        </div>
                      </button>
                      {isSuperManager && r.isCurated && (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDeleteContent({
                              kind: 'recommendation',
                              id: r.id,
                              label: r.shortTitle,
                            })
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contentKind === 'inquiry' && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setInqForm({
                      id: `inq-custom-${Date.now()}`,
                      title: '',
                      titleEn: '',
                      category: 'מחקר סומטי',
                      categoryEn: 'Somatic Study',
                      subtitle: '',
                      subtitleEn: '',
                      dateStr: 'Today',
                      messages: [],
                      summaryInsights: [''],
                      summaryInsightsEn: [''],
                      relatedStudyQuestion: '',
                      relatedStudyQuestionEn: '',
                      somaticPrinciple: '',
                      somaticPrincipleEn: '',
                      authorReference: '',
                      initialGuidePrompt: '',
                      initialGuidePromptEn: '',
                      sourceType: 'manual',
                    })
                  }
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#4F46E5] py-2 text-xs font-semibold text-[#4F46E5] hover:bg-[#F0F7FF]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {tr('דיאלוג / כרטיסיית לימוד חדשה', 'New Inquiry & Flashcard')}
                </button>
                <div className="max-h-96 space-y-1.5 overflow-y-auto">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setInqForm({
                            ...inq,
                            initialGuidePrompt: inq.messages[0]?.text || '',
                            initialGuidePromptEn: inq.messages[0]?.text || '',
                          })
                        }
                        className="min-w-0 flex-1 text-start text-xs font-medium text-[#1E293B] truncate"
                      >
                        {inq.title}
                      </button>
                      {isSuperManager && inq.isCurated && (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDeleteContent({
                              kind: 'inquiry',
                              id: inq.id,
                              label: inq.title,
                            })
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contentKind === 'guide' && (
              <div className="max-h-96 space-y-1.5 overflow-y-auto">
                {guideTopics.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleLoadGuideIntoDraft(g)}
                    className={`w-full rounded-xl border px-3 py-2 text-start text-xs font-medium ${
                      guideDraft.id === g.id
                        ? 'border-[#4F46E5] bg-[#F0F7FF] text-[#4F46E5]'
                        : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#1E293B]'
                    }`}
                  >
                    {isHe ? g.titleHe : g.titleEn}
                  </button>
                ))}
              </div>
            )}

            {contentKind === 'matrix' && (
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 start-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={matrixSearchQuery}
                    onChange={(e) => setMatrixSearchQuery(e.target.value)}
                    placeholder={tr('חפש מתוך 150 פרמטרים...', 'Search 150 parameters...')}
                    className="w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] py-1.5 ps-8 pe-7 text-xs"
                  />
                  {matrixSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMatrixSearchQuery('')}
                      className="absolute top-1/2 end-2 -translate-y-1/2 text-[#94A3B8]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={matrixFilterAxis}
                  onChange={(e) => setMatrixFilterAxis(e.target.value as 'all' | ReflectionAxisId)}
                  className="w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-1.5 text-xs"
                >
                  <option value="all">{tr('כל 5 הצירים (150)', 'All 5 Axes (150)')}</option>
                  {SOMATIC_AXES.map((a) => (
                    <option key={a.type} value={a.type}>
                      {isHe ? a.titleHe : a.titleEn}
                    </option>
                  ))}
                </select>

                <div className="max-h-96 space-y-1.5 overflow-y-auto">
                  {filteredMatrixParams.map((p) => {
                    const note = curatedParamNotes[p.id];
                    const active = selectedParamId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedParamId(p.id)}
                        className={`w-full rounded-xl border px-3 py-2 text-start text-xs ${
                          active
                            ? 'border-[#4F46E5] bg-[#F0F7FF] font-semibold text-[#312E81]'
                            : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#1E293B]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">
                            #{p.index} {isHe ? p.title.he : p.title.en}
                          </span>
                          {note?.highlighted && <span className="text-[#D97706]">★</span>}
                        </div>
                        <div className="mt-0.5 text-[10px] text-[#64748B]">
                          {getAxisShortLabel(p.axisId, language)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          {/* Right Form Editor */}
          <section className="rounded-2xl border border-[#DCE8F5] bg-white p-6 lg:col-span-8">
            {contentKind === 'recommendation' && (
              <form onSubmit={handlePublishRec} className="space-y-4">
                <h2 className="text-base font-semibold text-[#1E293B]">
                  {tr('עריכת כרטיסיית תרגול סומטית', 'Edit Somatic Practice Card')}
                </h2>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Title (עברית)</label>
                    <input
                      required
                      type="text"
                      value={recForm.shortTitle}
                      onChange={(e) => setRecForm({ ...recForm, shortTitle: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Title (English)</label>
                    <input
                      required
                      type="text"
                      value={recForm.shortTitleEn}
                      onChange={(e) => setRecForm({ ...recForm, shortTitleEn: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Tag (עברית)</label>
                    <input
                      required
                      type="text"
                      value={recForm.subtitleTag}
                      onChange={(e) => setRecForm({ ...recForm, subtitleTag: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Tag (English)</label>
                    <input
                      required
                      type="text"
                      value={recForm.subtitleTagEn}
                      onChange={(e) => setRecForm({ ...recForm, subtitleTagEn: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Axis</label>
                    <select
                      value={recForm.axisType}
                      onChange={(e) =>
                        setRecForm({ ...recForm, axisType: e.target.value as SomaticAxisType })
                      }
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                    >
                      {!SOMATIC_AXES.some((a) => a.type === recForm.axisType) && (
                        <option value={recForm.axisType}>{recForm.axisType} (Legacy)</option>
                      )}
                      {SOMATIC_AXES.map((a) => (
                        <option key={a.type} value={a.type}>
                          {isHe ? a.titleHe : a.titleEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">
                      {tr('תקציר קצר / משפט פעילות מומלצת', 'Short Summary & Activity Hook')}
                    </label>
                    <input
                      type="text"
                      maxLength={240}
                      value={recForm.summaryPreview}
                      onChange={(e) => setRecForm({ ...recForm, summaryPreview: e.target.value })}
                      placeholder={tr('למשל: 4 דקות כוונון סנסורי לפני ג׳אם', 'e.g. 4-min sensory tuning before jam')}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">
                      {tr('טיימר / Score מקושר', 'Linked Guided Score Timer')}
                    </label>
                    <select
                      value={recForm.scoreId || ''}
                      onChange={(e) =>
                        setRecForm({
                          ...recForm,
                          scoreId: (e.target.value || undefined) as GuidedScoreId | undefined,
                          hasInteractivePractice: Boolean(e.target.value) || recForm.hasInteractivePractice,
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                    >
                      <option value="">{tr('אוטומטי לפי ציר', 'Auto by Axis')}</option>
                      {Object.values(GUIDED_SCORES).map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {isHe ? sc.titleHe : sc.titleEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-2.5 rounded-xl border border-[#DCE8F5] bg-teal-50/50 px-3.5 py-2.5 text-xs font-medium text-[#0F766E]">
                    <input
                      type="checkbox"
                      checked={Boolean(recForm.hasInteractivePractice)}
                      onChange={(e) =>
                        setRecForm({ ...recForm, hasInteractivePractice: e.target.checked })
                      }
                    />
                    <span>
                      {tr(
                        'כלול כפתור פעילות מודרכת',
                        'Enable Guided Timer button',
                      )}
                    </span>
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Explanation (עברית)</label>
                    <textarea
                      required
                      rows={4}
                      value={recForm.fullExplanation}
                      onChange={(e) => setRecForm({ ...recForm, fullExplanation: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Explanation (English)</label>
                    <textarea
                      required
                      rows={4}
                      value={recForm.fullExplanationEn}
                      onChange={(e) => setRecForm({ ...recForm, fullExplanationEn: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">
                      Steps (עברית · שורה לכל שלב)
                    </label>
                    <textarea
                      rows={3}
                      value={recForm.practicalSteps.join('\n')}
                      onChange={(e) =>
                        setRecForm({ ...recForm, practicalSteps: e.target.value.split('\n') })
                      }
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">
                      Steps (English · one per line)
                    </label>
                    <textarea
                      rows={3}
                      value={recForm.practicalStepsEn.join('\n')}
                      onChange={(e) =>
                        setRecForm({ ...recForm, practicalStepsEn: e.target.value.split('\n') })
                      }
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-xs"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Quote & Author (עברית)</label>
                    <input
                      type="text"
                      value={recForm.quoteText}
                      onChange={(e) => setRecForm({ ...recForm, quoteText: e.target.value })}
                      placeholder="Quote text"
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      value={recForm.quoteAuthor}
                      onChange={(e) => setRecForm({ ...recForm, quoteAuthor: e.target.value })}
                      placeholder="Author"
                      className="mt-1.5 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Quote & Author (English)</label>
                    <input
                      type="text"
                      value={recForm.quoteTextEn}
                      onChange={(e) => setRecForm({ ...recForm, quoteTextEn: e.target.value })}
                      placeholder="Quote text (EN)"
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      value={recForm.quoteAuthorEn}
                      onChange={(e) => setRecForm({ ...recForm, quoteAuthorEn: e.target.value })}
                      placeholder="Author (EN)"
                      className="mt-1.5 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-xl bg-[#4F46E5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3730A3] disabled:opacity-50"
                  >
                    {tr('פרסם לכל המשתמשים', 'Publish Practice Card Live')}
                  </button>
                </div>
              </form>
            )}

            {contentKind === 'inquiry' && (
              <form onSubmit={handlePublishInq} className="space-y-4">
                <h2 className="text-base font-semibold text-[#1E293B]">
                  {tr('עריכת דיאלוג סומטי וכרטיסיית לימוד', 'Edit Inquiry & Study Flashcard')}
                </h2>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Title (עברית)</label>
                    <input
                      required
                      type="text"
                      value={inqForm.title}
                      onChange={(e) => setInqForm({ ...inqForm, title: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Title (English)</label>
                    <input
                      required
                      type="text"
                      value={inqForm.titleEn || ''}
                      onChange={(e) => setInqForm({ ...inqForm, titleEn: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Flashcard Question (עברית)</label>
                    <textarea
                      required
                      rows={2}
                      value={inqForm.relatedStudyQuestion}
                      onChange={(e) => setInqForm({ ...inqForm, relatedStudyQuestion: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Flashcard Question (English)</label>
                    <textarea
                      required
                      rows={2}
                      value={inqForm.relatedStudyQuestionEn || ''}
                      onChange={(e) => setInqForm({ ...inqForm, relatedStudyQuestionEn: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-xs"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Somatic Principle (עברית)</label>
                    <textarea
                      required
                      rows={2}
                      value={inqForm.somaticPrinciple}
                      onChange={(e) => setInqForm({ ...inqForm, somaticPrinciple: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Somatic Principle (English)</label>
                    <textarea
                      required
                      rows={2}
                      value={inqForm.somaticPrincipleEn || ''}
                      onChange={(e) => setInqForm({ ...inqForm, somaticPrincipleEn: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-xs"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Opening Prompt (עברית)</label>
                    <textarea
                      required
                      rows={2}
                      value={inqForm.initialGuidePrompt || ''}
                      onChange={(e) => setInqForm({ ...inqForm, initialGuidePrompt: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Author Reference</label>
                    <input
                      type="text"
                      value={inqForm.authorReference}
                      onChange={(e) => setInqForm({ ...inqForm, authorReference: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-xl bg-[#4F46E5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3730A3] disabled:opacity-50"
                  >
                    {tr('פרסם דיאלוג לכל המשתמשים', 'Publish Inquiry & Flashcard Live')}
                  </button>
                </div>
              </form>
            )}

            {contentKind === 'guide' && (
              <form onSubmit={handlePublishGuide} className="space-y-4">
                <h2 className="text-base font-semibold text-[#1E293B]">
                  {tr('עריכת מדריך ⓘ:', 'Edit Somatic Guide Topic:')} {guideDraft.id}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Title (עברית)</label>
                    <input
                      required
                      type="text"
                      value={guideDraft.titleHe}
                      onChange={(e) => setGuideDraft({ ...guideDraft, titleHe: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Title (English)</label>
                    <input
                      required
                      type="text"
                      value={guideDraft.titleEn}
                      onChange={(e) => setGuideDraft({ ...guideDraft, titleEn: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Explanation (עברית)</label>
                    <textarea
                      required
                      rows={4}
                      value={guideDraft.explanationHe}
                      onChange={(e) => setGuideDraft({ ...guideDraft, explanationHe: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">Explanation (English)</label>
                    <textarea
                      required
                      rows={4}
                      value={guideDraft.explanationEn}
                      onChange={(e) => setGuideDraft({ ...guideDraft, explanationEn: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-xl bg-[#4F46E5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3730A3] disabled:opacity-50"
                  >
                    {tr('פרסם עדכון מדריך', 'Publish Guide Topic Live')}
                  </button>
                </div>
              </form>
            )}

            {contentKind === 'matrix' && activeMatrixParam && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-[#4F46E5]">
                    {getAxisShortLabel(activeMatrixParam.axisId, language)} · #{activeMatrixParam.index}
                  </div>
                  <h2 className="mt-0.5 text-base font-bold text-[#1E293B]">
                    {isHe ? activeMatrixParam.title.he : activeMatrixParam.title.en}
                  </h2>
                </div>

                <div className="grid gap-2.5 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-4 text-xs sm:grid-cols-3">
                  <div>
                    <div className="font-semibold text-[#2A82C5]">Under</div>
                    <p className="mt-1 text-[#475569]">
                      {isHe ? activeMatrixParam.underDesc.he : activeMatrixParam.underDesc.en}
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold text-[#0F766E]">Flow</div>
                    <p className="mt-1 text-[#475569]">
                      {isHe ? activeMatrixParam.flowDesc.he : activeMatrixParam.flowDesc.en}
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold text-[#D97706]">Over</div>
                    <p className="mt-1 text-[#475569]">
                      {isHe ? activeMatrixParam.overDesc.he : activeMatrixParam.overDesc.en}
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 rounded-xl border border-[#DCE8F5] bg-amber-50/50 px-3.5 py-2.5 text-xs font-semibold text-[#92400E]">
                  <input
                    type="checkbox"
                    checked={paramHighlightedDraft}
                    onChange={(e) => setParamHighlightedDraft(e.target.checked)}
                  />
                  <span>
                    {tr(
                      'סמן פרמטר זה כדגש מנחה (★) בתוך אבחון העומק ב־+תעוד',
                      'Mark parameter as Spotlight Highlight (★) in Deep Research',
                    )}
                  </span>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">
                      {tr('הערת הנחיה להוראה (עברית)', 'Teaching Note (HE)')}
                    </label>
                    <textarea
                      rows={3}
                      value={paramNoteHeDraft}
                      onChange={(e) => setParamNoteHeDraft(e.target.value)}
                      placeholder={tr('הוסף דגש או תרגיל לסדנה סביב פרמטר זה...', 'Optional note for students/dancers...')}
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#475569]">
                      {tr('הערת הנחיה להוראה (English)', 'Teaching Note (EN)')}
                    </label>
                    <textarea
                      rows={3}
                      value={paramNoteEnDraft}
                      onChange={(e) => setParamNoteEnDraft(e.target.value)}
                      placeholder="Optional note for dancers..."
                      className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      saveParamNote({
                        paramId: activeMatrixParam.id,
                        highlighted: paramHighlightedDraft,
                        noteHe: paramNoteHeDraft.trim(),
                        noteEn: paramNoteEnDraft.trim(),
                        authorEmail,
                      });
                      setStatusMsg(
                        tr(
                          `דגש המטריצה עבור "${activeMatrixParam.title.he}" נשמר בהצלחה.`,
                          `Saved matrix highlight note for "${activeMatrixParam.title.en}".`,
                        ),
                      );
                    }}
                    className="rounded-xl bg-[#4F46E5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3730A3]"
                  >
                    {tr('שמור דגש והערת פרמטר', 'Save Parameter Highlight')}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB: Global Titles, Headings, About & Developer Contact */}
      {tab === 'titles' && managerPrivileges.editRecommendationsAndGuides && (
        <form onSubmit={handlePublishSiteConfig} className="space-y-6 rounded-2xl border border-[#DCE8F5] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE8F5] pb-4">
            <div>
              <h2 className="font-display text-base font-bold text-[#3730A3]">
                {tr('ניהול כותרות האפליקציה, דף הבית, אודות ופרטי קשר לפיתוח', 'Manage App Headings, Home Copy, About & Developer Contact')}
              </h2>
              <p className="mt-0.5 text-xs text-[#475569]">
                {tr(
                  'השינויים כאן מתעדכנים מיידית בסרגל הניווט, במסך הבית ובחלון אודות ופרטי קשר לכלל המשתמשים.',
                  'Changes published here update navigation, Home headings, and the About & Developer Contact modal live for all users.',
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSiteDraft({ ...DEFAULT_SITE_CONFIG })}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-1.5 text-xs font-medium text-[#475569] hover:bg-[#F0F7FF] whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{tr('שחזר ברירת מחדל בטיוטה', 'Reset Draft to Defaults')}</span>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('שם המותג הראשי (Brand Name)', 'Brand Name')}
              </label>
              <input
                required
                type="text"
                maxLength={120}
                value={siteDraft.brandName}
                onChange={(e) => setSiteDraft({ ...siteDraft, brandName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('שורת משנה בסרגל (עברית)', 'Sidebar Tagline (HE)')}
              </label>
              <input
                type="text"
                maxLength={160}
                value={siteDraft.brandTaglineHe}
                onChange={(e) => setSiteDraft({ ...siteDraft, brandTaglineHe: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('שורת משנה בסרגל (English)', 'Sidebar Tagline (EN)')}
              </label>
              <input
                type="text"
                maxLength={160}
                value={siteDraft.brandTaglineEn}
                onChange={(e) => setSiteDraft({ ...siteDraft, brandTaglineEn: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('כותרת קיקר בדף הבית (עברית)', 'Home Kicker (HE)')}
              </label>
              <input
                type="text"
                maxLength={160}
                value={siteDraft.homeKickerHe}
                onChange={(e) => setSiteDraft({ ...siteDraft, homeKickerHe: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('כותרת קיקר בדף הבית (English)', 'Home Kicker (EN)')}
              </label>
              <input
                type="text"
                maxLength={160}
                value={siteDraft.homeKickerEn}
                onChange={(e) => setSiteDraft({ ...siteDraft, homeKickerEn: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('כותרת ראשית בדף הבית (עברית)', 'Home Hero Title (HE)')}
              </label>
              <input
                required
                type="text"
                maxLength={200}
                value={siteDraft.homeTitleHe}
                onChange={(e) => setSiteDraft({ ...siteDraft, homeTitleHe: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('כותרת ראשית בדף הבית (English)', 'Home Hero Title (EN)')}
              </label>
              <input
                required
                type="text"
                maxLength={200}
                value={siteDraft.homeTitleEn}
                onChange={(e) => setSiteDraft({ ...siteDraft, homeTitleEn: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('תת-כותרת בדף הבית (עברית)', 'Home Subtitle (HE)')}
              </label>
              <textarea
                rows={2}
                maxLength={600}
                value={siteDraft.homeSubtitleHe}
                onChange={(e) => setSiteDraft({ ...siteDraft, homeSubtitleHe: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('תת-כותרת בדף הבית (English)', 'Home Subtitle (EN)')}
              </label>
              <textarea
                rows={2}
                maxLength={600}
                value={siteDraft.homeSubtitleEn}
                onChange={(e) => setSiteDraft({ ...siteDraft, homeSubtitleEn: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('כותרת אזור כרטיסיות התרגול (עברית)', 'Practice Cards Section Title (HE)')}
              </label>
              <input
                required
                type="text"
                maxLength={160}
                value={siteDraft.practiceSectionTitleHe}
                onChange={(e) => setSiteDraft({ ...siteDraft, practiceSectionTitleHe: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('כותרת אזור כרטיסיות התרגול (English)', 'Practice Cards Section Title (EN)')}
              </label>
              <input
                required
                type="text"
                maxLength={160}
                value={siteDraft.practiceSectionTitleEn}
                onChange={(e) => setSiteDraft({ ...siteDraft, practiceSectionTitleEn: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="border-t border-[#DCE8F5] pt-5 space-y-4">
            <h3 className="font-display text-sm font-bold text-[#0F766E]">
              {tr('תוכן אודות (About) ופרטי קשר לפיתוח', 'About Copy & Developer Contact')}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#475569]">
                  {tr('כותרת אודות (עברית)', 'About Title (HE)')}
                </label>
                <input
                  required
                  type="text"
                  maxLength={200}
                  value={siteDraft.aboutTitleHe}
                  onChange={(e) => setSiteDraft({ ...siteDraft, aboutTitleHe: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569]">
                  {tr('כותרת אודות (English)', 'About Title (EN)')}
                </label>
                <input
                  required
                  type="text"
                  maxLength={200}
                  value={siteDraft.aboutTitleEn}
                  onChange={(e) => setSiteDraft({ ...siteDraft, aboutTitleEn: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569]">
                  {tr('תיאור אודות (עברית)', 'About Description (HE)')}
                </label>
                <textarea
                  rows={4}
                  maxLength={3000}
                  value={siteDraft.aboutDescriptionHe}
                  onChange={(e) => setSiteDraft({ ...siteDraft, aboutDescriptionHe: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569]">
                  {tr('תיאור אודות (English)', 'About Description (EN)')}
                </label>
                <textarea
                  rows={4}
                  maxLength={3000}
                  value={siteDraft.aboutDescriptionEn}
                  onChange={(e) => setSiteDraft({ ...siteDraft, aboutDescriptionEn: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569]">
                  {tr('פילוסופיה מלווה (עברית)', 'Guiding Philosophy (HE)')}
                </label>
                <textarea
                  rows={2}
                  maxLength={1500}
                  value={siteDraft.aboutPhilosophyHe}
                  onChange={(e) => setSiteDraft({ ...siteDraft, aboutPhilosophyHe: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569]">
                  {tr('פילוסופיה מלווה (English)', 'Guiding Philosophy (EN)')}
                </label>
                <textarea
                  rows={2}
                  maxLength={1500}
                  value={siteDraft.aboutPhilosophyEn}
                  onChange={(e) => setSiteDraft({ ...siteDraft, aboutPhilosophyEn: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-[#475569]">
                  {tr('שם מפתח/ת / איש קשר לפיתוח', 'Developer / Maintainer Name')}
                </label>
                <input
                  required
                  type="text"
                  maxLength={120}
                  value={siteDraft.developerName}
                  onChange={(e) => setSiteDraft({ ...siteDraft, developerName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569]">
                  {tr('אימייל לפיתוח ותמיכה', 'Developer Email')}
                </label>
                <input
                  type="email"
                  maxLength={160}
                  value={siteDraft.developerEmail}
                  onChange={(e) => setSiteDraft({ ...siteDraft, developerEmail: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569]">
                  {tr('אתר / קישור פיתוח', 'Developer / App Website')}
                </label>
                <input
                  type="url"
                  maxLength={300}
                  value={siteDraft.developerWebsite}
                  onChange={(e) => setSiteDraft({ ...siteDraft, developerWebsite: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569]">
                  {tr('תפקיד פיתוח (עברית)', 'Developer Role (HE)')}
                </label>
                <input
                  type="text"
                  maxLength={160}
                  value={siteDraft.developerRoleHe}
                  onChange={(e) => setSiteDraft({ ...siteDraft, developerRoleHe: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569]">
                  {tr('תפקיד פיתוח (English)', 'Developer Role (EN)')}
                </label>
                <input
                  type="text"
                  maxLength={160}
                  value={siteDraft.developerRoleEn}
                  onChange={(e) => setSiteDraft({ ...siteDraft, developerRoleEn: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-[#4F46E5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3730A3] disabled:opacity-50"
            >
              {tr('פרסם כותרות ואודות לכל המשתמשים', 'Publish Headings & About Live')}
            </button>
          </div>
        </form>
      )}

      {/* TAB: User Feedback Inbox */}
      {tab === 'feedback' && (
        <section className="space-y-4 rounded-2xl border border-[#DCE8F5] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE8F5] pb-4">
            <div>
              <h2 className="font-display text-base font-bold text-[#3730A3]">
                {tr('תיבת משובי משתמשים', 'User Feedback Inbox')}
              </h2>
              <p className="mt-0.5 text-xs text-[#475569]">
                {tr(
                  'צפייה בפניות, רעיונות ודיווחי משתמשים, הוספת תגובת מנהל ועדכון סטטוס טיפול.',
                  'Review user suggestions, bug reports, and content requests, update status, and leave a visible manager reply.',
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-1">
              {(['all', 'new', 'reviewed', 'resolved'] as const).map((st) => {
                const count =
                  st === 'all'
                    ? allFeedbacks.length
                    : allFeedbacks.filter((f) => f.status === st).length;
                const label =
                  st === 'all'
                    ? tr('הכל', 'All')
                    : st === 'new'
                      ? tr('חדש', 'New')
                      : st === 'reviewed'
                        ? tr('בטיפול', 'Reviewed')
                        : tr('טופל', 'Resolved');
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFeedbackFilter(st)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium whitespace-nowrap ${
                      feedbackFilter === st
                        ? 'bg-[#4F46E5] text-white'
                        : 'text-[#475569] hover:bg-white'
                    }`}
                  >
                    {label} <span className="font-mono-tabular">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {allFeedbacks.filter((f) => feedbackFilter === 'all' || f.status === feedbackFilter).length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#DCE8F5] p-8 text-center text-sm text-[#475569]">
              {tr('אין משובים להצגה בסינון הנוכחי.', 'No user feedback entries match this filter yet.')}
            </div>
          ) : (
            <div className="divide-y divide-[#DCE8F5]">
              {allFeedbacks
                .filter((f) => feedbackFilter === 'all' || f.status === feedbackFilter)
                .map((fb) => {
                  const draftNote = feedbackNotes[fb.id] ?? fb.managerNote;
                  const catLabel =
                    fb.category === 'idea'
                      ? tr('רעיון לשיפור', 'Idea')
                      : fb.category === 'content'
                        ? tr('תוכן וכרטיסיות', 'Content')
                        : fb.category === 'bug'
                          ? tr('תקלה', 'Bug')
                          : tr('כללי', 'General');
                  const statusColor =
                    fb.status === 'resolved'
                      ? '#047857'
                      : fb.status === 'reviewed'
                        ? '#1D4ED8'
                        : '#C2410C';
                  return (
                    <div key={fb.id} className="py-5 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-bold text-[#1E293B]">{fb.senderName}</span>
                            {fb.senderEmail && (
                              <span className="font-mono-tabular text-[#475569]">{fb.senderEmail}</span>
                            )}
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-[#4F46E5]">{catLabel}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#475569]">{fb.pageContext}</span>
                            {fb.rating > 0 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="inline-flex items-center gap-0.5 text-[#F36523] font-mono-tabular">
                                  <Star className="h-3.5 w-3.5 fill-[#F36523]" />
                                  {fb.rating}/5
                                </span>
                              </>
                            )}
                          </div>
                          <div className="font-mono-tabular text-[11px] text-[#64748B]">
                            {new Date(fb.createdAtMs).toLocaleString()} ·{' '}
                            <span className="font-semibold" style={{ color: statusColor }}>
                              {fb.status === 'resolved'
                                ? tr('טופל', 'Resolved')
                                : fb.status === 'reviewed'
                                  ? tr('בטיפול', 'Reviewed')
                                  : tr('חדש', 'New')}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {(['new', 'reviewed', 'resolved'] as const).map((nextStatus) => (
                            <button
                              key={nextStatus}
                              type="button"
                              disabled={busy}
                              onClick={() => handleUpdateFeedback(fb.id, nextStatus, fb.managerNote)}
                              className={`rounded-lg border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
                                fb.status === nextStatus
                                  ? 'border-[#4F46E5] bg-[#4F46E5] text-white'
                                  : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#475569] hover:bg-[#F0F7FF]'
                              }`}
                            >
                              {nextStatus === 'new'
                                ? tr('חדש', 'New')
                                : nextStatus === 'reviewed'
                                  ? tr('בטיפול', 'Reviewed')
                                  : tr('טופל', 'Resolved')}
                            </button>
                          ))}
                          {isSuperManager && (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteFeedbackId(fb.id)}
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                              aria-label={tr('מחק משוב', 'Delete feedback')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3.5 text-sm leading-relaxed text-[#1E293B]">
                        {fb.message}
                      </p>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          type="text"
                          maxLength={1200}
                          value={draftNote}
                          onChange={(e) =>
                            setFeedbackNotes((prev) => ({ ...prev, [fb.id]: e.target.value }))
                          }
                          placeholder={tr(
                            'הוסף הערת מנהל / תגובה שתוצג למשתמש...',
                            'Add manager note or reply visible to the user...',
                          )}
                          className="flex-1 rounded-xl border border-[#DCE8F5] bg-white px-3 py-2 text-xs text-[#1E293B]"
                        />
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleUpdateFeedback(fb.id, fb.status, fb.managerNote)}
                          className="rounded-xl bg-[#0F766E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D5F58] disabled:opacity-50 whitespace-nowrap"
                        >
                          {tr('שמור תגובה', 'Save Reply')}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: NotebookLM & Google Docs Importer */}
      {tab === 'import' && managerPrivileges.importTextAndNotebookLM && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Google Docs Picker & Text File Upload */}
          <section className="space-y-4 rounded-2xl border border-[#DCE8F5] bg-white p-6 lg:col-span-5">
            <h2 className="text-base font-semibold text-[#1E293B]">
              {tr('1. חבר Google Docs או העלה טקסט NotebookLM', '1. Connect Google Docs or Upload NotebookLM Text')}
            </h2>

            <div className="rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-4 space-y-3">
              <div className="text-xs font-semibold text-[#2A82C5]">
                Google Drive & Google Docs OAuth
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  placeholder={tr('סנן לפי שם מסמך...', 'Filter Google Docs by name...')}
                  className="flex-1 rounded-lg border border-[#DCE8F5] bg-white px-3 py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={handleFetchDocs}
                  disabled={loadingDocs}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#4F46E5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3730A3] whitespace-nowrap"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  {workspaceToken
                    ? tr('טען מסמכים', 'Load Docs')
                    : tr('חבר Google Docs', 'Connect Google Docs')}
                </button>
              </div>

              {googleDocs.length > 0 && (
                <div className="max-h-48 space-y-1.5 overflow-y-auto pt-1">
                  {googleDocs.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handlePickGoogleDoc(d)}
                      className="flex w-full items-center justify-between rounded-lg border border-[#DCE8F5] bg-white px-3 py-2 text-start text-xs hover:bg-[#F0F7FF]"
                    >
                      <span className="truncate font-medium text-[#1E293B]">{d.name}</span>
                      <span className="text-[#4F46E5] shrink-0">{tr('טען', 'Import')}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-dashed border-[#DCE8F5] bg-[#FBFDFF] p-4 space-y-2">
              <div className="text-xs font-semibold text-[#1E293B]">
                {tr('העלאת קובץ טקסט / NotebookLM (.txt, .md)', 'Upload NotebookLM Export (.txt, .md)')}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#DCE8F5] bg-white px-3.5 py-2 text-xs font-medium text-[#475569] hover:bg-[#F0F7FF]">
                <Upload className="h-3.5 w-3.5 text-[#4F46E5]" />
                <span>{tr('בחר קובץ מהמכשיר', 'Choose .txt or .md file')}</span>
                <input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={handleUploadTextFile} className="hidden" />
              </label>
            </div>
          </section>

          {/* Right: Raw Text Editor & AI Structure Trigger */}
          <section className="space-y-4 rounded-2xl border border-[#DCE8F5] bg-white p-6 lg:col-span-7">
            <h2 className="text-base font-semibold text-[#1E293B]">
              {tr('2. עבד תוכן עם AI ופרסם לקטלוג', '2. Structure Source Text with AI')}
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#475569]">
                  {tr('שם המקור / מחבר', 'Source Title')}
                </label>
                <input
                  type="text"
                  value={rawSourceTitle}
                  onChange={(e) => setRawSourceTitle(e.target.value)}
                  placeholder="NotebookLM: Steve Paxton Archive"
                  className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569]">
                  {tr('סוג פרסום יעד', 'Target Resource Type')}
                </label>
                <select
                  value={importTargetKind}
                  onChange={(e) =>
                    setImportTargetKind(e.target.value as 'recommendation' | 'inquiry')
                  }
                  className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                >
                  <option value="recommendation">{tr('כרטיסיית תרגול סומטית', 'Somatic Practice Card')}</option>
                  <option value="inquiry">{tr('דיאלוג וכרטיסיית לימוד', 'Inquiry & Study Flashcard')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('הדבק סיכום מ-NotebookLM או טקסט ממסמך Google Doc', 'Source Text (NotebookLM briefing, study notes, or Google Doc text)')}
              </label>
              <textarea
                rows={8}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={tr(
                  'הדבק כאן הערות סדנה, סיכום NotebookLM או מסמך מקור...',
                  'Paste NotebookLM study guide text or load a Google Doc from the left panel...',
                )}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3.5 text-sm"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={busy || rawText.trim().length < 10}
                onClick={handleStructureWithAI}
                className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3730A3] disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {busy
                  ? tr('מעבד לשדות דו-לשוניים...', 'Structuring with AI...')
                  : tr('עבד שדות עם AI והעבר לעריכה', 'Structure with AI & Review')}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: Super Manager Roster & Privileges */}
      {tab === 'roster' && isSuperManager && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Add Manager Form */}
          <form
            onSubmit={handleAddManager}
            className="space-y-4 rounded-2xl border border-[#DCE8F5] bg-white p-6 lg:col-span-5"
          >
            <h2 className="text-base font-semibold text-[#1E293B]">
              {tr('הוספת מנהל או סופר-מנהל', 'Add Manager or Super Manager')}
            </h2>

            <div>
              <label className="block text-xs font-medium text-[#475569]">Email</label>
              <input
                required
                type="email"
                value={newMgrEmail}
                onChange={(e) => setNewMgrEmail(e.target.value)}
                placeholder="teacher@example.com"
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#475569]">
                  {tr('שם תצוגה', 'Display Name')}
                </label>
                <input
                  type="text"
                  value={newMgrName}
                  onChange={(e) => setNewMgrName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569]">{tr('תפקיד', 'Role')}</label>
                <select
                  value={newMgrRole}
                  onChange={(e) => setNewMgrRole(e.target.value as 'manager' | 'super_manager')}
                  className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm"
                >
                  <option value="manager">Manager</option>
                  <option value="super_manager">Super Manager</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3.5 text-xs">
              <div className="font-semibold text-[#1E293B]">
                {tr('הרשאות פרטניות:', 'Privileges:')}
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newMgrPrivs.editRecommendationsAndGuides}
                  onChange={(e) =>
                    setNewMgrPrivs({ ...newMgrPrivs, editRecommendationsAndGuides: e.target.checked })
                  }
                />
                <span>{tr('עריכת כרטיסיות תרגול ומדריכים', 'Edit somatic recommendations and guides')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newMgrPrivs.editInquiriesAndFlashcards}
                  onChange={(e) =>
                    setNewMgrPrivs({ ...newMgrPrivs, editInquiriesAndFlashcards: e.target.checked })
                  }
                />
                <span>{tr('עריכת דיאלוגים וכרטיסיות לימוד', 'Edit inquiries and study flashcards')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newMgrPrivs.importTextAndNotebookLM}
                  onChange={(e) =>
                    setNewMgrPrivs({ ...newMgrPrivs, importTextAndNotebookLM: e.target.checked })
                  }
                />
                <span>{tr('ייבוא טקסט וחיבור NotebookLM / Docs', 'Import text and NotebookLM sources')}</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-[#4F46E5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3730A3] disabled:opacity-50"
            >
              {tr('שמור ברשימת המנהלים', 'Save Manager')}
            </button>
          </form>

          {/* Existing Roster */}
          <section className="space-y-3 rounded-2xl border border-[#DCE8F5] bg-white p-6 lg:col-span-7">
            <h2 className="text-base font-semibold text-[#1E293B]">
              {tr('רשימת המנהלים וההרשאות', 'Managers & Privileges Roster')}
            </h2>

            <div className="divide-y divide-[#DCE8F5]">
              {managersRoster.map((mgr) => {
                const isRoot = mgr.email.toLowerCase() === ROOT_SUPER_MANAGER_EMAIL;
                return (
                  <div key={mgr.email} className="py-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-[#1E293B]">
                          {mgr.displayName} ·{' '}
                          <span className="font-mono-tabular text-xs font-normal text-[#475569]">
                            {mgr.email}
                          </span>
                        </div>
                        <div className="text-xs text-[#4F46E5] font-medium">
                          {isRoot
                            ? tr('סופר-מנהל ראשי (קבוע)', 'Root Super Manager (Immutable)')
                            : mgr.role === 'super_manager'
                              ? 'Super Manager'
                              : 'Manager'}
                          {!mgr.active && ' · Suspended'}
                        </div>
                      </div>

                      {!isRoot && (
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={mgr.role}
                            onChange={(e) =>
                              toggleExistingRoleOrActive(mgr, {
                                role: e.target.value as 'manager' | 'super_manager',
                              })
                            }
                            className="rounded-lg border border-[#DCE8F5] bg-[#FBFDFF] px-2 py-1 text-xs"
                          >
                            <option value="manager">Manager</option>
                            <option value="super_manager">Super Manager</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => toggleExistingRoleOrActive(mgr, { active: !mgr.active })}
                            className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                              mgr.active
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-amber-200 bg-amber-50 text-amber-800'
                            }`}
                          >
                            {mgr.active ? tr('פעיל', 'Active') : tr('מושהה', 'Inactive')}
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfirmRemoveEmail(mgr.email)}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                            aria-label="Remove manager"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-2 text-xs sm:grid-cols-3">
                      <label className="flex items-center gap-1.5 rounded-lg border border-[#DCE8F5] bg-[#FBFDFF] px-2.5 py-1.5">
                        <input
                          type="checkbox"
                          disabled={isRoot}
                          checked={mgr.privileges.editRecommendationsAndGuides}
                          onChange={() =>
                            toggleExistingPrivilege(mgr, 'editRecommendationsAndGuides')
                          }
                        />
                        <span>{tr('כרטיסיות ומדריכים', 'Recs & Guides')}</span>
                      </label>
                      <label className="flex items-center gap-1.5 rounded-lg border border-[#DCE8F5] bg-[#FBFDFF] px-2.5 py-1.5">
                        <input
                          type="checkbox"
                          disabled={isRoot}
                          checked={mgr.privileges.editInquiriesAndFlashcards}
                          onChange={() =>
                            toggleExistingPrivilege(mgr, 'editInquiriesAndFlashcards')
                          }
                        />
                        <span>{tr('דיאלוגים וכרטיסיות לימוד', 'Inquiries & Cards')}</span>
                      </label>
                      <label className="flex items-center gap-1.5 rounded-lg border border-[#DCE8F5] bg-[#FBFDFF] px-2.5 py-1.5">
                        <input
                          type="checkbox"
                          disabled={isRoot}
                          checked={mgr.privileges.importTextAndNotebookLM}
                          onChange={() => toggleExistingPrivilege(mgr, 'importTextAndNotebookLM')}
                        />
                        <span>{tr('NotebookLM ו-Docs', 'Import & Docs')}</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* Custom In-Page Confirmation Modals (Never window.confirm) */}
      {confirmRemoveEmail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
          onClick={() => setConfirmRemoveEmail(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[#DCE8F5] bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-[#1E293B]">
              {tr('הסרת מנהל מהרשימה', 'Remove Manager')}
            </h3>
            <p className="mt-2 text-xs text-[#475569]">
              {tr(
                `להסיר את ${confirmRemoveEmail} מרשימת המנהלים המורשים?`,
                `Remove ${confirmRemoveEmail} from the Manager Roster?`,
              )}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmRemoveEmail(null)}
                className="rounded-lg border border-[#DCE8F5] px-3 py-1.5 text-xs font-medium text-[#475569]"
              >
                {tr('ביטול', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = confirmRemoveEmail;
                  setConfirmRemoveEmail(null);
                  await removeManagerAccount(target);
                }}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                {tr('הסר מנהל', 'Confirm Remove')}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteContent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
          onClick={() => setConfirmDeleteContent(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[#DCE8F5] bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-[#1E293B]">
              {tr('מחיקת תוכן ערוך', 'Delete Curated Item')}
            </h3>
            <p className="mt-2 text-xs text-[#475569]">
              {tr(
                `למחוק לצמיתות את "${confirmDeleteContent.label}" מהקטלוג המשותף?`,
                `Permanently delete "${confirmDeleteContent.label}" from the live shared catalog?`,
              )}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteContent(null)}
                className="rounded-lg border border-[#DCE8F5] px-3 py-1.5 text-xs font-medium text-[#475569]"
              >
                {tr('ביטול', 'Cancel')}
              </button>
                <button
                  type="button"
                  onClick={async () => {
                    const target = confirmDeleteContent;
                    setConfirmDeleteContent(null);
                    if (target.kind === 'recommendation') {
                      await deleteCuratedRecommendation(target.id);
                    } else {
                      await deleteCuratedInquiry(target.id);
                    }
                  }}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  {tr('מחק לצמיתות', 'Delete')}
                </button>
              </div>
            </div>
          </div>
        )}

      {confirmDeleteFeedbackId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
          onClick={() => setConfirmDeleteFeedbackId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[#DCE8F5] bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-[#1E293B]">
              {tr('מחיקת משוב משתמש', 'Delete User Feedback')}
            </h3>
            <p className="mt-2 text-xs text-[#475569]">
              {tr(
                'האם למחוק לצמיתות את פניית המשוב הזו?',
                'Permanently delete this user feedback submission?',
              )}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteFeedbackId(null)}
                className="rounded-lg border border-[#DCE8F5] px-3 py-1.5 text-xs font-medium text-[#475569]"
              >
                {tr('ביטול', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = confirmDeleteFeedbackId;
                  setConfirmDeleteFeedbackId(null);
                  await deleteUserFeedbackCloud(id);
                }}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                {tr('מחק', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
