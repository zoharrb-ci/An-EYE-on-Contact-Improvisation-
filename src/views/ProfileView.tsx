import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Cloud,
  Globe,
  Home,
  Info,
  LogOut,
  Mail,
  MessageSquarePlus,
  RotateCcw,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { useContactWays } from '../context/ContactWaysContext';
import { ConversationViewMode, RecordViewMode } from '../types/contactWays';
import { getLanguageMeta } from '../i18n/languages';
import { GoogleSignInButton } from '../components/StorageExplainerModal';
import { MinimalDisclosureBox } from '../components/MinimalDisclosureBox';

type ProfileSectionId = 'identity' | 'storage' | 'language' | 'preferences' | 'about';

export const ProfileView: React.FC = () => {
  const {
    dancerProfile,
    setActiveTab,
    updateDancerProfile,
    recordViewMode,
    setRecordViewMode,
    conversationViewMode,
    setConversationViewMode,
    storageMode,
    authUser,
    authBusy,
    authError,
    switchToLocalStorage,
    requestCloudStorageWithSignIn,
    signOutUser,
    setStorageExplainerOpen,
    language,
    locality,
    setLanguageSearchOpen,
    resetLocalSampleData,
    openGuideTopic,
    siteConfig,
    setFeedbackOpen,
    setAboutOpen,
    tr,
  } = useContactWays();

  const [openSection, setOpenSection] = useState<ProfileSectionId | null>(null);
  const [name, setName] = useState(dancerProfile.name);
  const [levelTitle, setLevelTitle] = useState(dancerProfile.levelTitle);
  const [bio, setBio] = useState(dancerProfile.bio);
  const [primaryRole, setPrimaryRole] = useState(dancerProfile.primaryRole);
  const [touchPreference, setTouchPreference] = useState(dancerProfile.touchPreference);
  const [intentionsText, setIntentionsText] = useState(dancerProfile.activeIntentions.join('\n'));
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setName(dancerProfile.name);
    setLevelTitle(dancerProfile.levelTitle);
    setBio(dancerProfile.bio);
    setPrimaryRole(dancerProfile.primaryRole);
    setTouchPreference(dancerProfile.touchPreference);
    setIntentionsText(dancerProfile.activeIntentions.join('\n'));
  }, [dancerProfile]);

  const langMeta = getLanguageMeta(language);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(null);
    try {
      await updateDancerProfile({
        name,
        levelTitle,
        bio,
        primaryRole,
        touchPreference,
        activeIntentions: intentionsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setSavedMsg(tr('פרטי הפרופיל והכוונות עודכנו.', 'Profile & intentions saved.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-3 pb-24">
      <section className="flex items-center justify-between gap-3 rounded-2xl border border-[#DCE8F5] bg-white px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="font-display truncate text-lg font-bold text-[#047857] sm:text-xl">
            {tr('פרופיל והגדרות', 'Profile & Settings')}
          </h1>
          <button
            type="button"
            onClick={() => openGuideTopic('GUIDE_PROFILE_INTENTIONS')}
            aria-label={tr('מדריך פרופיל', 'Profile guide')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F0F7FF] hover:text-[#2A82C5]"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </section>

      <MinimalDisclosureBox
        title={tr('פרטי רקדן וכוונות תנועה', 'Dancer Identity & Intentions')}
        isOpen={openSection === 'identity'}
        onToggle={() => setOpenSection((prev) => (prev === 'identity' ? null : 'identity'))}
        onInfoClick={() => openGuideTopic('GUIDE_PROFILE_INTENTIONS')}
        accentColor="#047857"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('שם מלא', 'Display Name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3.5 py-2 text-sm text-[#1E293B]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('תפקיד במרחב', 'Primary Role')}
              </label>
              <input
                type="text"
                value={primaryRole}
                onChange={(e) => setPrimaryRole(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3.5 py-2 text-sm text-[#1E293B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#475569]">
              {tr('העדפת מגע ותקשורת גבולות', 'Touch & Boundary Preference')}
            </label>
            <input
              type="text"
              value={touchPreference}
              onChange={(e) => setTouchPreference(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3.5 py-2 text-sm text-[#1E293B]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#475569]">
              {tr('רקע אישי', 'Bio')}
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-sm text-[#1E293B]"
            />
          </div>

          {savedMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{savedMsg}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3730A3] disabled:opacity-50 whitespace-nowrap"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{tr('שמור פרופיל', 'Save Profile')}</span>
            </button>
          </div>
        </form>
      </MinimalDisclosureBox>

      <MinimalDisclosureBox
        title={tr('אחסון נתונים: מקומי מול ענן', 'Storage: Local vs. Cloud')}
        isOpen={openSection === 'storage'}
        onToggle={() => setOpenSection((prev) => (prev === 'storage' ? null : 'storage'))}
        onInfoClick={() => setStorageExplainerOpen(true)}
        accentColor="#1D4ED8"
      >
        <div className="space-y-3">
          {authUser ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-xl border border-[#DCE8F5] bg-[#F0F7FF]/60 px-3 py-2 text-xs">
                <span className="flex items-center gap-1.5 truncate font-medium text-[#1E293B]">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#059669]" />
                  <span className="truncate">{authUser.email}</span>
                </span>
                <button
                  type="button"
                  onClick={signOutUser}
                  className="inline-flex items-center gap-1 font-medium text-red-600 hover:underline whitespace-nowrap"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {tr('התנתק', 'Sign out')}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={switchToLocalStorage}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium whitespace-nowrap ${
                    storageMode === 'local'
                      ? 'border-[#4EB8A6] bg-[#4EB8A6] text-white'
                      : 'border-[#DCE8F5] bg-white text-[#475569]'
                  }`}
                >
                  {tr('השתמש במקומי', 'Use Local')}
                </button>
                <button
                  type="button"
                  onClick={requestCloudStorageWithSignIn}
                  disabled={authBusy}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium whitespace-nowrap ${
                    storageMode === 'cloud'
                      ? 'border-[#4F46E5] bg-[#4F46E5] text-white'
                      : 'border-[#DCE8F5] bg-white text-[#475569]'
                  }`}
                >
                  {tr('השתמש בענן', 'Use Cloud')}
                </button>
              </div>
            </div>
          ) : (
            <GoogleSignInButton
              onClick={requestCloudStorageWithSignIn}
              disabled={authBusy}
              label={
                authBusy
                  ? tr('מתחבר...', 'Signing in...')
                  : tr('התחבר עם Google לענן', 'Sign in with Google')
              }
            />
          )}

          {authError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {authError}
            </p>
          )}

          <button
            type="button"
            onClick={() => setStorageExplainerOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:underline"
          >
            <Cloud className="h-3.5 w-3.5" />
            <span>{tr('הסבר מפורט על אחסון מקומי וענן', 'Compare Local & Cloud')}</span>
          </button>
        </div>
      </MinimalDisclosureBox>

      <MinimalDisclosureBox
        title={tr('שפה ומקומיות', 'Language & Locality')}
        isOpen={openSection === 'language'}
        onToggle={() => setOpenSection((prev) => (prev === 'language' ? null : 'language'))}
        onInfoClick={() => setLanguageSearchOpen(true)}
        accentColor="#2A82C5"
      >
        <p className="text-xs text-[#475569]">
          {langMeta.displayLabel} · {locality.countryCode}
        </p>
        <button
          type="button"
          onClick={() => setLanguageSearchOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8F5] bg-[#F0F7FF] px-4 py-2 text-xs font-semibold text-[#2A82C5] whitespace-nowrap"
        >
          <Globe className="h-4 w-4" />
          <span>{tr('בחר שפה', 'Change Language')}</span>
        </button>
      </MinimalDisclosureBox>

      <MinimalDisclosureBox
        title={tr('העדפות תצוגה ואיפוס נתונים', 'Display Preferences & Reset')}
        isOpen={openSection === 'preferences'}
        onToggle={() => setOpenSection((prev) => (prev === 'preferences' ? null : 'preferences'))}
        onInfoClick={() => openGuideTopic('GUIDE_RECORDS_MODES')}
        accentColor="#4338CA"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#475569]">
              {tr('תצוגת יומן', 'Default Journal View')}
            </label>
            <select
              value={recordViewMode}
              onChange={(e) => setRecordViewMode(e.target.value as RecordViewMode)}
              className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-xs text-[#1E293B]"
            >
              <option value="cards">{tr('כרטיסיות', 'Cards')}</option>
              <option value="timeline">{tr('ציר זמן', 'Timeline')}</option>
              <option value="categorized">{tr('לפי ציר', 'By Pillar')}</option>
              <option value="compact">{tr('טבלה', 'Compact List')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#475569]">
              {tr('תצוגת חקירות', 'Default Inquiry View')}
            </label>
            <select
              value={conversationViewMode}
              onChange={(e) => setConversationViewMode(e.target.value as ConversationViewMode)}
              className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-xs text-[#1E293B]"
            >
              <option value="chat">{tr('שיחה חיה', 'Chat')}</option>
              <option value="accordion">{tr('שאלות ותשובות', 'Q&A')}</option>
              <option value="insights">{tr('תובנות', 'Insights')}</option>
              <option value="flashcards">{tr('כרטיסייה', 'Flashcard')}</option>
            </select>
          </div>

          <div className="border-t border-[#DCE8F5] pt-3">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#475569] hover:text-red-600"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {tr('איפוס נתוני דוגמה', 'Reset Sample Data')}
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-medium text-red-700">{tr('לאפס?', 'Restore defaults?')}</span>
                <button
                  type="button"
                  onClick={() => {
                    resetLocalSampleData();
                    setConfirmReset(false);
                  }}
                  className="rounded-lg bg-red-600 px-2.5 py-1 font-semibold text-white"
                >
                  {tr('אשר', 'Confirm')}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="rounded-lg border border-[#DCE8F5] px-2.5 py-1 text-[#475569]"
                >
                  {tr('ביטול', 'Cancel')}
                </button>
              </div>
            )}
          </div>
        </div>
      </MinimalDisclosureBox>

      <MinimalDisclosureBox
        title={tr('אודות, משוב ופיתוח', 'About, Feedback & Contact')}
        isOpen={openSection === 'about'}
        onToggle={() => setOpenSection((prev) => (prev === 'about' ? null : 'about'))}
        onInfoClick={() => setAboutOpen(true)}
        accentColor="#0F766E"
      >
        <p className="text-xs text-[#475569]">
          {siteConfig.developerName} · {siteConfig.developerEmail}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3.5 py-2 text-xs font-semibold text-[#1E293B]"
          >
            <Mail className="h-3.5 w-3.5 text-[#0F766E]" />
            <span>{tr('אודות', 'About')}</span>
          </button>
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#F36523] px-3.5 py-2 text-xs font-semibold text-white"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span>{tr('משוב משתמש', 'Feedback')}</span>
          </button>
        </div>
      </MinimalDisclosureBox>

      <div className="sticky bottom-16 z-20 flex justify-end rounded-2xl border border-[#DCE8F5] bg-white/95 p-3 shadow-sm backdrop-blur-xs lg:bottom-4">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#047857] px-4 py-2 text-xs font-semibold text-white hover:bg-[#065F46] whitespace-nowrap"
        >
          <Home className="h-3.5 w-3.5" />
          <span>{tr('סיים וחזור לראשי', 'Finish & Home')}</span>
        </button>
      </div>
    </div>
  );
};
