import React, { useState } from 'react';
import { CheckCircle2, Cloud, HardDrive, LogOut, ShieldCheck, Upload, X } from 'lucide-react';
import { useContactWays } from '../context/ContactWaysContext';

export const GoogleSignInButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}> = ({ onClick, disabled, label = 'Sign in with Google' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="gsi-material-button"
  >
    <div className="gsi-material-button-content-wrapper">
      <div className="gsi-material-button-icon">
        <svg viewBox="0 0 48 48" className="block h-full w-full">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
      </div>
      <span>{label}</span>
    </div>
  </button>
);

export const StorageExplainerModal: React.FC = () => {
  const {
    isStorageExplainerOpen,
    setStorageExplainerOpen,
    storageMode,
    authUser,
    authBusy,
    authError,
    pendingMigrationCount,
    switchToLocalStorage,
    requestCloudStorageWithSignIn,
    migrateLocalRecordsNow,
    dismissMigrationPrompt,
    signOutUser,
    tr,
  } = useContactWays();

  const [migrationMessage, setMigrationMessage] = useState<string | null>(null);

  if (!isStorageExplainerOpen) return null;

  const handleMigrate = async () => {
    const count = await migrateLocalRecordsNow();
    setMigrationMessage(
      tr(
        `${count} רשומות מקומיות גובו לחשבון הענן שלך.`,
        `${count} local reflection(s) synced to your cloud account.`,
      ),
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={tr('בחירה והסבר: אחסון מקומי מול אחסון ענן', 'Local vs. Cloud Storage Guide')}
      onClick={() => setStorageExplainerOpen(false)}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#DCE8F5] bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#1E293B]">
              {tr('איך תרצה לשמור את יומן התנועה שלך?', 'How Would You Like to Store Your Reflections?')}
            </h2>
            <p className="mt-1 text-sm text-[#475569]">
              {tr(
                'בחר בין שמירה פרטית במכשיר זה בלבד לבין סנכרון בענן על חשבון Google שלך.',
                'Choose between private device-only storage or encrypted Cloud Account sync across devices.',
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStorageExplainerOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE8F5] text-[#475569] hover:bg-[#F0F7FF]"
            aria-label={tr('סגור', 'Close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Side-by-side comparison */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {/* Local Storage Card */}
          <div
            className={`flex flex-col justify-between rounded-xl border p-5 transition-colors ${
              storageMode === 'local'
                ? 'border-[#4EB8A6] bg-[#F0F7FF]/55'
                : 'border-[#DCE8F5] bg-[#FBFDFF]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <HardDrive className="h-5 w-5 text-[#4EB8A6]" />
                  <h3 className="text-base font-semibold text-[#1E293B]">
                    {tr('אחסון מקומי (בדפדפן)', 'Local Browser Storage')}
                  </h3>
                </div>
                {storageMode === 'local' && (
                  <span className="text-xs font-semibold text-[#059669]">
                    {tr('פעיל כעת', 'Active')}
                  </span>
                )}
              </div>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[#475569]">
                <li>
                  • {tr('ללא צורך בהרשמה או התחברות — מוכן לשימוש מיידי.', 'Zero sign-in required — start reflecting immediately.')}
                </li>
                <li>
                  • {tr('הנתונים נשמרים אך ורק בזיכרון הדפדפן במכשיר הזה (localStorage).', 'Data stays strictly inside this browser on this device (localStorage).')}
                </li>
                <li>
                  • {tr('לא מסתנכרן למכשירים אחרים, ומחיקת נתוני דפדפן תמחק את היומן.', 'Does not sync across devices; clearing browser site data removes local entries.')}
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => {
                switchToLocalStorage();
                setStorageExplainerOpen(false);
              }}
              className={`mt-5 w-full rounded-lg border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                storageMode === 'local'
                  ? 'border-[#4EB8A6] bg-[#4EB8A6] text-white'
                  : 'border-[#DCE8F5] bg-white text-[#1E293B] hover:bg-[#F0F7FF]'
              }`}
            >
              {storageMode === 'local'
                ? tr('המשך באחסון מקומי', 'Continue with Local Storage')
                : tr('עבור לאחסון מקומי', 'Switch to Local Storage')}
            </button>
          </div>

          {/* Cloud Storage Card */}
          <div
            className={`flex flex-col justify-between rounded-xl border p-5 transition-colors ${
              storageMode === 'cloud'
                ? 'border-[#4F46E5] bg-[#F0F7FF]/75'
                : 'border-[#DCE8F5] bg-[#FBFDFF]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Cloud className="h-5 w-5 text-[#4F46E5]" />
                  <h3 className="text-base font-semibold text-[#1E293B]">
                    {tr('אחסון ענן (חשבון אישי)', 'Cloud Account Storage')}
                  </h3>
                </div>
                {storageMode === 'cloud' && (
                  <span className="text-xs font-semibold text-[#4F46E5]">
                    {tr('מסונכרן', 'Synced')}
                  </span>
                )}
              </div>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[#475569]">
                <li>
                  • {tr('דורש התחברות עם חשבון Google לצורך זיהוי מאובטח.', 'Requires Google Sign-In so only your verified account can access your records.')}
                </li>
                <li>
                  • {tr('מגבה ומסנכרן את כל הרשומות, הפרופיל והשיחות בין מחשב לנייד.', 'Backs up and syncs movement records, profile, and inquiries across all devices.')}
                </li>
                <li>
                  • {tr('מאפשר גישה לסטודיו המנהלים אם חשבונך מורשה לכך.', 'Unlocks the Manager Studio if your account holds Manager or Super Manager privileges.')}
                </li>
              </ul>
            </div>

            <div className="mt-5">
              {authUser ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between rounded-lg border border-[#DCE8F5] bg-white px-3 py-2 text-xs">
                    <span className="flex items-center gap-1.5 truncate font-medium text-[#1E293B]">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-[#059669]" />
                      <span className="truncate">{authUser.email}</span>
                    </span>
                    <button
                      type="button"
                      onClick={signOutUser}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#475569] hover:text-[#DC2626] whitespace-nowrap"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      {tr('התנתק', 'Sign out')}
                    </button>
                  </div>
                  {storageMode !== 'cloud' && (
                    <button
                      type="button"
                      onClick={requestCloudStorageWithSignIn}
                      disabled={authBusy}
                      className="w-full rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3730A3] whitespace-nowrap"
                    >
                      {tr('הפעל סנכרון ענן לחשבון זה', 'Enable Cloud Sync for This Account')}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-stretch gap-2">
                  <GoogleSignInButton
                    onClick={requestCloudStorageWithSignIn}
                    disabled={authBusy}
                    label={
                      authBusy
                        ? tr('מתחבר...', 'Signing in...')
                        : tr('התחבר עם Google לאחסון ענן', 'Sign in with Google for Cloud Sync')
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Local -> Cloud Migration Prompt */}
        {authUser && storageMode === 'cloud' && pendingMigrationCount > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCE8F5] bg-[#F0F7FF] p-4">
            <div className="text-xs text-[#1E293B]">
              <p className="font-semibold">
                {tr(
                  `נמצאו ${pendingMigrationCount} רשומות מקומיות בדפדפן זה`,
                  `Found ${pendingMigrationCount} local reflection(s) in this browser`,
                )}
              </p>
              <p className="mt-0.5 text-[#475569]">
                {tr(
                  'האם תרצה להעלות ולמזג אותן אל חשבון הענן שלך?',
                  'Would you like to merge them into your private Cloud Storage account?',
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={dismissMigrationPrompt}
                className="rounded-lg border border-[#DCE8F5] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:bg-slate-50 whitespace-nowrap"
              >
                {tr('דלג', 'Skip')}
              </button>
              <button
                type="button"
                onClick={handleMigrate}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#4F46E5] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#3730A3] whitespace-nowrap"
              >
                <Upload className="h-3.5 w-3.5" />
                {tr('העלה לענן', 'Merge to Cloud')}
              </button>
            </div>
          </div>
        )}

        {migrationMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{migrationMessage}</span>
          </div>
        )}

        {authError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {authError}
          </div>
        )}
      </div>
    </div>
  );
};
