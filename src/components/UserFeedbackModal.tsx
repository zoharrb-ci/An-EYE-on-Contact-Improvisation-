import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  MessageSquarePlus,
  Send,
  Star,
  X,
} from 'lucide-react';
import { useContactWays } from '../context/ContactWaysContext';
import { FeedbackCategory, FeedbackStatus } from '../types/contactWays';
import { GoogleSignInButton } from './StorageExplainerModal';

const CATEGORY_OPTIONS: Array<{
  id: FeedbackCategory;
  labelHe: string;
  labelEn: string;
}> = [
  { id: 'idea', labelHe: 'רעיון לשיפור', labelEn: 'Idea' },
  { id: 'content', labelHe: 'תוכן וכרטיסיות', labelEn: 'Content / Cards' },
  { id: 'bug', labelHe: 'דיווח תקלה', labelEn: 'Issue / Bug' },
  { id: 'general', labelHe: 'שיתוף כללי', labelEn: 'General' },
];

function getStatusMeta(status: FeedbackStatus, tr: (he: string, en: string) => string) {
  if (status === 'resolved') {
    return { label: tr('טופל', 'Resolved'), color: '#047857' };
  }
  if (status === 'reviewed') {
    return { label: tr('בטיפול', 'Reviewed'), color: '#1D4ED8' };
  }
  return { label: tr('נשלח · חדש', 'New'), color: '#C2410C' };
}

export const UserFeedbackModal: React.FC = () => {
  const {
    isFeedbackOpen,
    setFeedbackOpen,
    authUser,
    authBusy,
    authError,
    signInOnlyWithGoogle,
    dancerProfile,
    activeTab,
    ownFeedbacks,
    submitUserFeedback,
    siteConfig,
    tr,
  } = useContactWays();

  const [senderName, setSenderName] = useState(dancerProfile.name);
  const [category, setCategory] = useState<FeedbackCategory>('idea');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isFeedbackOpen) {
      setSenderName(authUser?.displayName || dancerProfile.name);
      setSubmittedMsg(null);
      setErrorMsg(null);
    }
  }, [isFeedbackOpen, authUser?.displayName, dancerProfile.name]);

  if (!isFeedbackOpen) return null;

  const isVerified = Boolean(authUser?.uid && authUser.emailVerified);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 3) {
      setErrorMsg(tr('אנא כתוב לפחות 3 תווים במשוב.', 'Please write at least 3 characters.'));
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    setSubmittedMsg(null);
    try {
      await submitUserFeedback({
        category,
        message,
        rating,
        senderName,
      });
      setMessage('');
      setSubmittedMsg(
        tr(
          'תודה רבה! המשוב שלך התקבל ונשמר לצפייה בסטודיו המנהל.',
          'Thank you! Your feedback was delivered to the Manager Studio.',
        ),
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : tr('שליחת המשוב נכשלה, נסה שוב.', 'Could not submit feedback. Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      onClick={() => setFeedbackOpen(false)}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#DCE8F5] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#DCE8F5] bg-[#FBFDFF] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DCE8F5] bg-[#F0F7FF] text-[#4F46E5]">
              <MessageSquarePlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[#3730A3]">
                {tr('משוב משתמש והצעות לפיתוח', 'User Feedback & Suggestions')}
              </h2>
              <p className="text-xs text-[#475569]">
                {siteConfig.brandName} · {tr('מסך נוכחי:', 'Screen:')} {activeTab}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE8F5] text-[#475569] hover:bg-[#F0F7FF]"
            aria-label={tr('סגור', 'Close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {!isVerified ? (
            <div className="space-y-3 rounded-xl border border-[#DCE8F5] bg-[#F0F7FF]/60 p-4">
              <p className="text-xs leading-relaxed text-[#1E293B]">
                {tr(
                  'כדי לשמור את המשוב בענן בצורה מאובטחת ולאפשר לצוות להגיב אליך, יש להתחבר תחילה עם חשבון Google (הנתונים המקומיים שלך יישארו כפי שהם).',
                  'To securely deliver feedback to the Manager Studio and receive responses, please sign in with Google first (your local journal remains untouched).',
                )}
              </p>
              <GoogleSignInButton
                onClick={signInOnlyWithGoogle}
                disabled={authBusy}
                label={
                  authBusy
                    ? tr('מתחבר...', 'Signing in...')
                    : tr('התחבר עם Google לשליחת משוב', 'Sign in with Google to Send Feedback')
                }
              />
              {authError && <p className="text-xs text-red-600">{authError}</p>}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#475569]">
                  {tr('שמך', 'Your Name')}
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3 py-2 text-sm text-[#1E293B] focus:border-[#4F46E5] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#475569]">
                  {tr('חוויית שימוש (לא חובה)', 'Experience Rating (Optional)')}
                </label>
                <div className="mt-1.5 flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(rating === star ? 0 : star)}
                      aria-label={`${star} stars`}
                      className="rounded-lg p-1 transition-colors hover:bg-[#F0F7FF]"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= rating
                            ? 'fill-[#F36523] text-[#F36523]'
                            : 'text-[#CBD5E1]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('נושא המשוב', 'Feedback Category')}
              </label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {CATEGORY_OPTIONS.map((opt) => {
                  const active = category === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCategory(opt.id)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                        active
                          ? 'border-[#4F46E5] bg-[#4F46E5] text-white'
                          : 'border-[#DCE8F5] bg-[#FBFDFF] text-[#475569] hover:bg-[#F0F7FF]'
                      }`}
                    >
                      {tr(opt.labelHe, opt.labelEn)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#475569]">
                {tr('תוכן המשוב / בקשה / הצעה', 'Your Message')}
              </label>
              <textarea
                rows={4}
                required
                minLength={3}
                maxLength={3000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={tr(
                  'ספר/י לנו מה עובד לך היטב, מה חסר, איזו כרטיסיית תרגול תרצה/י לראות או על תקלה שנתקלת בה...',
                  'Share what feels helpful, ideas for new practice cards, or any bug you noticed...',
                )}
                className="mt-1 w-full rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-sm text-[#1E293B] focus:border-[#4F46E5] focus:bg-white focus:outline-none"
              />
            </div>

            {submittedMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{submittedMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFeedbackOpen(false)}
                className="rounded-xl border border-[#DCE8F5] px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#F0F7FF] whitespace-nowrap"
              >
                {tr('סגור', 'Close')}
              </button>
              <button
                type="submit"
                disabled={submitting || !isVerified}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#F36523] px-4 py-2 text-xs font-semibold text-white hover:bg-[#D95316] disabled:opacity-50 whitespace-nowrap"
              >
                <Send className="h-3.5 w-3.5" />
                <span>
                  {submitting
                    ? tr('שולח...', 'Sending...')
                    : tr('שלח משוב', 'Send Feedback')}
                </span>
              </button>
            </div>
          </form>

          {/* User's own feedback history */}
          {isVerified && ownFeedbacks.length > 0 && (
            <div className="border-t border-[#DCE8F5] pt-4 space-y-2.5">
              <h3 className="font-display text-xs font-bold text-[#1E293B]">
                {tr('המשובים ששלחת לאחרונה', 'Your Submitted Feedback')} ({ownFeedbacks.length})
              </h3>
              <div className="divide-y divide-[#DCE8F5] rounded-xl border border-[#DCE8F5] bg-[#FBFDFF]">
                {ownFeedbacks.slice(0, 5).map((fb) => {
                  const st = getStatusMeta(fb.status, tr);
                  return (
                    <div key={fb.id} className="p-3 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#475569]">
                        <span className="font-semibold" style={{ color: st.color }}>
                          {st.label}
                        </span>
                        <span className="font-mono-tabular">
                          {new Date(fb.createdAtMs).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#1E293B]">{fb.message}</p>
                      {fb.managerNote && (
                        <div className="rounded-lg border border-[#DCE8F5] bg-white px-3 py-2 text-xs text-[#3730A3]">
                          <strong className="font-semibold">
                            {tr('תגובת מנהל:', 'Manager Reply:')}{' '}
                          </strong>
                          {fb.managerNote}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
