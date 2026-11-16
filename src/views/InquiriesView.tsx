import React, { useState } from 'react';
import {
  ArrowRight,
  FlipHorizontal2,
  Home,
  Info,
  Lightbulb,
  ListChecks,
  MessageSquare,
  Plus,
  Send,
} from 'lucide-react';
import { useContactWays } from '../context/ContactWaysContext';
import { ConversationViewMode } from '../types/contactWays';
import { MinimalDisclosureBox } from '../components/MinimalDisclosureBox';

export const InquiriesView: React.FC = () => {
  const {
    inquiries,
    selectedInquiry,
    setSelectedInquiry,
    conversationViewMode,
    setConversationViewMode,
    sendInquiryMessage,
    sendingInquiryId,
    openGuideTopic,
    setActiveTab,
    language,
    tr,
  } = useContactWays();

  const isHe = language === 'he';

  // Collapsed by default to avoid overwhelm
  const [openInquiryId, setOpenInquiryId] = useState<string | null>(null);
  const [visibleInquiriesCount, setVisibleInquiriesCount] = useState(3);
  const [visibleItemsCount, setVisibleItemsCount] = useState(3);
  const [openAccordionIdx, setOpenAccordionIdx] = useState<number | null>(null);
  const [flippedCard, setFlippedCard] = useState(false);
  const [draft, setDraft] = useState('');

  const modes: Array<{
    id: ConversationViewMode;
    labelHe: string;
    labelEn: string;
    Icon: React.FC<{ className?: string }>;
  }> = [
    { id: 'chat', labelHe: 'שיחה חיה', labelEn: 'Chat', Icon: MessageSquare },
    { id: 'accordion', labelHe: 'שאלות', labelEn: 'Q&A', Icon: ListChecks },
    { id: 'insights', labelHe: 'תובנות', labelEn: 'Insights', Icon: Lightbulb },
    { id: 'flashcards', labelHe: 'כרטיסייה', labelEn: 'Card', Icon: FlipHorizontal2 },
  ];

  const handleToggleInquiry = (inqId: string) => {
    const found = inquiries.find((i) => i.id === inqId);
    if (found) setSelectedInquiry(found);
    setOpenInquiryId((prev) => (prev === inqId ? null : inqId));
    setVisibleItemsCount(3);
    setOpenAccordionIdx(null);
    setFlippedCard(false);
  };

  const handleNextInquiry = () => {
    if (inquiries.length === 0) return;
    const currentIdx = openInquiryId
      ? inquiries.findIndex((i) => i.id === openInquiryId)
      : -1;
    const nextIdx = (currentIdx + 1) % inquiries.length;
    if (nextIdx + 1 > visibleInquiriesCount) {
      setVisibleInquiriesCount(nextIdx + 1);
    }
    const nextInq = inquiries[nextIdx];
    setSelectedInquiry(nextInq);
    setOpenInquiryId(nextInq.id);
    setVisibleItemsCount(3);
    setOpenAccordionIdx(null);
    setFlippedCard(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !draft.trim() || sendingInquiryId) return;
    const text = draft;
    setDraft('');
    await sendInquiryMessage(selectedInquiry.id, text);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-3 pb-24">
      {/* Compact Header */}
      <section className="flex items-center justify-between gap-3 rounded-2xl border border-[#DCE8F5] bg-white px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="font-display truncate text-lg font-bold text-[#6D28D9] sm:text-xl">
            {tr('חקר ודיאלוגים סומטיים', 'Somatic Inquiries')}
          </h1>
          <button
            type="button"
            onClick={() => openGuideTopic('GUIDE_INQUIRIES_MODES')}
            aria-label={tr('מדריך מצבי חקר', 'Inquiries guide')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F0F7FF] hover:text-[#2A82C5]"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* 3 Primary Inquiries Initially + "More (+3)" */}
      {inquiries.slice(0, visibleInquiriesCount).map((inq) => {
        const isOpen = openInquiryId === inq.id;
        const title = isHe ? inq.title : inq.titleEn || inq.title;
        const studyQuestion = isHe
          ? inq.relatedStudyQuestion
          : inq.relatedStudyQuestionEn || inq.relatedStudyQuestion;
        const principle = isHe
          ? inq.somaticPrinciple
          : inq.somaticPrincipleEn || inq.somaticPrinciple;
        const insights = isHe
          ? inq.summaryInsights
          : inq.summaryInsightsEn?.length
            ? inq.summaryInsightsEn
            : inq.summaryInsights;

        return (
          <MinimalDisclosureBox
            key={inq.id}
            title={title}
            isOpen={isOpen}
            onToggle={() => handleToggleInquiry(inq.id)}
            onInfoClick={() => openGuideTopic('GUIDE_INQUIRIES_MODES')}
            accentColor="#5B21B6"
            footerActions={
              <>
                <button
                  type="button"
                  onClick={handleNextInquiry}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#4F46E5]/30 bg-[#F0F7FF] px-3.5 py-2 text-xs font-semibold text-[#3730A3] hover:bg-[#DCE8F5]/70 whitespace-nowrap"
                >
                  <span>{tr('המשך לחקירה הבאה', 'Next Inquiry')}</span>
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE8F5] bg-white px-3.5 py-2 text-xs font-medium text-[#475569] hover:bg-[#F0F7FF] whitespace-nowrap"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>{tr('סיים וחזור לראשי', 'Finish & Home')}</span>
                </button>
              </>
            }
          >
            {/* Mode Switcher */}
            <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-1 w-fit">
              {modes.map(({ id, labelHe, labelEn, Icon }) => {
                const active = conversationViewMode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setConversationViewMode(id);
                      setVisibleItemsCount(3);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-[#4F46E5] text-white'
                        : 'text-[#475569] hover:bg-white hover:text-[#1E293B]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tr(labelHe, labelEn)}</span>
                  </button>
                );
              })}
            </div>

            {conversationViewMode === 'chat' && (
              <div className="space-y-3">
                <div className="max-h-72 space-y-2.5 overflow-y-auto pe-1">
                  {inq.messages.slice(-visibleItemsCount).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.isGuide ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl border px-3.5 py-2.5 text-xs sm:text-sm ${
                          msg.isGuide
                            ? 'border-[#DCE8F5] bg-[#FBFDFF] text-[#1E293B]'
                            : 'border-[#4F46E5] bg-[#4F46E5] text-white'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {visibleItemsCount < inq.messages.length && (
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleItemsCount((c) => Math.min(inq.messages.length, c + 3))
                    }
                    className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-[#6D28D9]/45 py-1.5 text-xs font-semibold text-[#6D28D9]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{tr('עוד הודעות (+3)', 'More (+3)')}</span>
                  </button>
                )}
                <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-[#DCE8F5] pt-3">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={Boolean(sendingInquiryId)}
                    placeholder={tr('שתף מחשבה או שאל...', 'Share or ask...')}
                    className="flex-1 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-3.5 py-2 text-sm text-[#1E293B] focus:border-[#4F46E5] focus:bg-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || Boolean(sendingInquiryId)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3730A3] disabled:opacity-50 whitespace-nowrap"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{tr('שלח', 'Send')}</span>
                  </button>
                </form>
              </div>
            )}

            {conversationViewMode === 'accordion' && (
              <div className="space-y-2">
                {inq.messages.slice(0, visibleItemsCount).map((msg, idx) => (
                  <MinimalDisclosureBox
                    key={msg.id}
                    title={msg.senderName}
                    isOpen={openAccordionIdx === idx}
                    onToggle={() => setOpenAccordionIdx(openAccordionIdx === idx ? null : idx)}
                    className="rounded-xl"
                  >
                    <p className="text-xs sm:text-sm leading-relaxed text-[#475569]">{msg.text}</p>
                  </MinimalDisclosureBox>
                ))}
                {visibleItemsCount < inq.messages.length && (
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleItemsCount((c) => Math.min(inq.messages.length, c + 3))
                    }
                    className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-[#6D28D9]/45 py-2 text-xs font-semibold text-[#6D28D9]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{tr('עוד (+3)', 'More (+3)')}</span>
                  </button>
                )}
              </div>
            )}

            {conversationViewMode === 'insights' && (
              <div className="space-y-3">
                <p className="rounded-xl border border-[#DCE8F5] bg-[#F0F7FF]/65 p-3.5 text-sm font-semibold text-[#1E293B]">
                  {principle}
                </p>
                <ul className="space-y-2">
                  {insights.slice(0, visibleItemsCount).map((ins, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-xs sm:text-sm text-[#1E293B]"
                    >
                      {ins}
                    </li>
                  ))}
                </ul>
                {visibleItemsCount < insights.length && (
                  <button
                    type="button"
                    onClick={() => setVisibleItemsCount((c) => Math.min(insights.length, c + 3))}
                    className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-[#6D28D9]/45 py-2 text-xs font-semibold text-[#6D28D9]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{tr('עוד (+3)', 'More (+3)')}</span>
                  </button>
                )}
              </div>
            )}

            {conversationViewMode === 'flashcards' && (
              <button
                type="button"
                onClick={() => setFlippedCard((f) => !f)}
                className={`flex min-h-[180px] w-full flex-col items-center justify-center rounded-2xl border p-6 text-center transition-all ${
                  flippedCard
                    ? 'border-[#4EB8A6] bg-[#F0F7FF]'
                    : 'border-[#DCE8F5] bg-[#FBFDFF] hover:border-[#4F46E5]/50'
                }`}
              >
                <p className="text-sm sm:text-base font-semibold leading-relaxed text-[#1E293B]">
                  {flippedCard ? principle : studyQuestion}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs text-[#475569]">
                  <FlipHorizontal2 className="h-3.5 w-3.5" />
                  {tr('לחץ להפיכה', 'Flip')}
                </span>
              </button>
            )}
          </MinimalDisclosureBox>
        );
      })}

      {visibleInquiriesCount < inquiries.length && (
        <button
          type="button"
          onClick={() =>
            setVisibleInquiriesCount((c) => Math.min(inquiries.length, c + 3))
          }
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[#6D28D9]/45 bg-white py-3 text-xs font-semibold text-[#6D28D9] hover:bg-violet-50/40"
        >
          <Plus className="h-4 w-4" />
          <span>{tr('עוד נושאי חקר (+3)', 'More Inquiries (+3)')}</span>
        </button>
      )}

      {/* Always-Visible Step Navigation Bar */}
      <div className="sticky bottom-16 z-20 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#DCE8F5] bg-white/95 p-3 shadow-sm backdrop-blur-xs lg:bottom-4">
        <button
          type="button"
          onClick={handleNextInquiry}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#4F46E5]/35 bg-[#F0F7FF] px-3.5 py-2 text-xs font-semibold text-[#3730A3] hover:bg-[#DCE8F5]/70 whitespace-nowrap"
        >
          <span>{tr('המשך לנושא החקר הבא', 'Continue to Next Inquiry')}</span>
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#6D28D9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5B21B6] whitespace-nowrap"
        >
          <Home className="h-3.5 w-3.5" />
          <span>{tr('סיים וחזור לראשי', 'Finish & Home')}</span>
        </button>
      </div>
    </div>
  );
};
