import React, { useEffect } from 'react';
import {
  BookOpen,
  Cloud,
  Compass,
  HeartHandshake,
  Home,
  Info,
  MessageSquare,
  MessageSquarePlus,
  PlusCircle,
  Shield,
  User,
} from 'lucide-react';
import { ContactWaysProvider, useContactWays } from './context/ContactWaysContext';
import { BRAND_LOGO_DATA_URI } from './assets/brandLogo';
import { BrandLogo } from './components/BrandLogo';
import { AppNavTab } from './types/contactWays';
import { getLanguageMeta } from './i18n/languages';
import { HomeView } from './views/HomeView';
import { NewReflectionView } from './views/NewReflectionView';
import { RecordsView } from './views/RecordsView';
import { InquiriesView } from './views/InquiriesView';
import { ProgressView } from './views/ProgressView';
import { ProfileView } from './views/ProfileView';
import { ManagerStudioView } from './views/ManagerStudioView';
import { LanguageSearchModal } from './components/LanguageSearchModal';
import { StorageExplainerModal } from './components/StorageExplainerModal';
import { SmallDanceMeditationDialog } from './components/SmallDanceMeditationDialog';
import { RecommendationDetailModal } from './components/RecommendationDetailModal';
import { SomaticInfoGuideModal } from './components/SomaticInfoGuideModal';
import { RecordDetailModal } from './components/RecordDetailModal';
import { UserFeedbackModal } from './components/UserFeedbackModal';
import { AboutContactModal } from './components/AboutContactModal';

const AppShell: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isActiveManager,
    isSuperManager,
    storageMode,
    setStorageExplainerOpen,
    language,
    setLanguageSearchOpen,
    openGuideTopic,
    selectedRecord,
    setSelectedRecord,
    deleteRecord,
    siteConfig,
    setFeedbackOpen,
    setAboutOpen,
    tr,
  } = useContactWays();

  const langMeta = getLanguageMeta(language);

  const navItems: Array<{
    id: AppNavTab;
    labelHe: string;
    labelEn: string;
    headingColor: string;
    Icon: React.FC<{ className?: string }>;
  }> = [
    { id: 'home', labelHe: 'ראשי', labelEn: 'Home', headingColor: '#3730A3', Icon: Home },
    { id: 'reflection', labelHe: '+תעוד', labelEn: '+Log', headingColor: '#F36523', Icon: PlusCircle },
    { id: 'records', labelHe: 'יומן תנועה', labelEn: 'Records', headingColor: '#1D4ED8', Icon: BookOpen },
    { id: 'inquiries', labelHe: 'חקר', labelEn: 'Inquiries', headingColor: '#6D28D9', Icon: MessageSquare },
    { id: 'progress', labelHe: 'כאן ועכשיו', labelEn: 'Here & Now', headingColor: '#0F766E', Icon: Compass },
    { id: 'profile', labelHe: 'פרופיל', labelEn: 'Profile', headingColor: '#047857', Icon: User },
  ];

  if (isActiveManager) {
    navItems.push({
      id: 'manager',
      labelHe: isSuperManager ? 'סופר-מנהל' : 'סטודיו מנהל',
      labelEn: 'Manager Studio',
      headingColor: '#3730A3',
      Icon: Shield,
    });
  }

  const activeNav = navItems.find((n) => n.id === activeTab) || navItems[0];

  useEffect(() => {
    let iconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!iconLink) {
      iconLink = document.createElement('link');
      iconLink.rel = 'icon';
      document.head.appendChild(iconLink);
    }
    iconLink.href = BRAND_LOGO_DATA_URI;
  }, []);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#FBFDFF] text-[#1E293B]">
      {/* Desktop Sidebar Rail + Main Content */}
      <div className="mx-auto flex min-h-dvh max-w-[1440px]">
        {/* Persistent Desktop Sidebar (240px) */}
        <aside className="hidden w-60 shrink-0 flex-col justify-between border-e border-[#DCE8F5] bg-white p-5 lg:flex">
          <div>
            <div className="flex items-center gap-3 px-2 py-1">
              <BrandLogo alt="Eye-on-CI Logo" className="h-9 w-9 object-contain" />
              <div>
                <div className="font-display text-base font-extrabold tracking-tight text-[#3730A3]">
                  {siteConfig.brandName}
                </div>
                <div className="text-[11px] font-medium text-[#475569]">
                  {tr(siteConfig.brandTaglineHe, siteConfig.brandTaglineEn || siteConfig.brandTaglineHe)}
                </div>
              </div>
            </div>

            <nav className="mt-6 space-y-1">
              {navItems.map(({ id, labelHe, labelEn, Icon }) => {
                const active = activeTab === id;
                const isReflectionBtn = id === 'reflection';
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                      isReflectionBtn
                        ? active
                          ? 'bg-[#D95316] text-white ring-2 ring-[#F36523]/35'
                          : 'bg-[#F36523] text-white hover:bg-[#D95316]'
                        : active
                          ? 'bg-[#4F46E5] text-white'
                          : 'text-[#475569] hover:bg-[#F0F7FF] hover:text-[#1E293B]'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{tr(labelHe, labelEn)}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3 border-t border-[#DCE8F5] pt-4">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAboutOpen(true)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-2.5 py-2 text-xs font-medium text-[#475569] hover:bg-[#F0F7FF] hover:text-[#1E293B] whitespace-nowrap"
              >
                <HeartHandshake className="h-3.5 w-3.5 text-[#0F766E]" />
                <span>{tr('אודות וקשר', 'About')}</span>
              </button>
              <button
                type="button"
                onClick={() => setFeedbackOpen(true)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] px-2.5 py-2 text-xs font-medium text-[#475569] hover:bg-[#F0F7FF] hover:text-[#3730A3] whitespace-nowrap"
              >
                <MessageSquarePlus className="h-3.5 w-3.5 text-[#F36523]" />
                <span>{tr('משוב', 'Feedback')}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setStorageExplainerOpen(true)}
                aria-label={tr('אחסון מקומי וענן', 'Cloud & Local Storage')}
                title={tr('אחסון מקומי וענן', 'Cloud & Local Storage')}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] text-[#475569] hover:bg-[#F0F7FF]"
              >
                <Cloud
                  className={`h-4 w-4 ${
                    storageMode === 'cloud' ? 'text-[#4F46E5]' : 'text-[#475569]'
                  }`}
                />
                {storageMode === 'cloud' && (
                  <span className="absolute top-1.5 end-1.5 h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setLanguageSearchOpen(true)}
                aria-label={tr('בחירת שפה', 'Select Language')}
                title={langMeta.displayLabel}
                className="font-mono-tabular inline-flex h-9 items-center justify-center rounded-xl border border-[#DCE8F5] bg-[#F0F7FF] px-3 text-xs font-bold tracking-wider text-[#2A82C5] hover:bg-[#DCE8F5]/60"
              >
                {langMeta.toggleBadge}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Viewport Column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile-Friendly Top Header: Title on one side, compact icon buttons on the other */}
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-[#DCE8F5] bg-white/95 px-3.5 backdrop-blur-xs sm:h-16 sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex shrink-0 items-center lg:hidden">
                <BrandLogo alt="Eye-on-CI" className="h-7 w-7 object-contain" />
              </div>
              <span
                className="font-display truncate text-base font-bold sm:text-lg"
                style={{ color: activeNav.headingColor }}
              >
                {tr(activeNav.labelHe, activeNav.labelEn)}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {/* User Feedback Icon Button */}
              <button
                type="button"
                onClick={() => setFeedbackOpen(true)}
                aria-label={tr('שלח משוב משתמש', 'Send User Feedback')}
                title={tr('שלח משוב משתמש', 'Send User Feedback')}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE8F5] bg-[#FBFDFF] text-[#F36523] hover:bg-orange-50"
              >
                <MessageSquarePlus className="h-4 w-4" />
              </button>

              {/* Cloud Icon Button */}
              <button
                type="button"
                onClick={() => setStorageExplainerOpen(true)}
                aria-label={tr('אחסון מקומי וענן', 'Cloud & Local Storage')}
                title={tr('אחסון מקומי וענן', 'Cloud & Local Storage')}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE8F5] bg-[#FBFDFF] text-[#475569] hover:bg-[#F0F7FF]"
              >
                <Cloud
                  className={`h-4 w-4 ${
                    storageMode === 'cloud' ? 'text-[#4F46E5]' : 'text-[#475569]'
                  }`}
                />
                {storageMode === 'cloud' && (
                  <span className="absolute top-1 end-1 h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                )}
              </button>

              {/* Language 2-Letter Shortcut Button (e.g. GB / IL) */}
              <button
                type="button"
                onClick={() => setLanguageSearchOpen(true)}
                aria-label={tr('בחירת שפה', 'Select Language')}
                title={langMeta.displayLabel}
                className="font-mono-tabular inline-flex h-8 items-center justify-center rounded-lg border border-[#DCE8F5] bg-[#F0F7FF] px-2.5 text-xs font-bold tracking-wider text-[#2A82C5] hover:bg-[#DCE8F5]/60"
              >
                {langMeta.toggleBadge}
              </button>

              {/* Guide Info Icon Button */}
              <button
                type="button"
                onClick={() => openGuideTopic('GUIDE_APP_OVERVIEW')}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE8F5] bg-white text-[#475569] hover:bg-[#F0F7FF] hover:text-[#2A82C5]"
                aria-label={tr('מדריך סומטי', 'Somatic Guide')}
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-3.5 pb-24 sm:p-6 lg:pb-8">
            {activeTab === 'home' && <HomeView />}
            {activeTab === 'reflection' && <NewReflectionView />}
            {activeTab === 'records' && <RecordsView />}
            {activeTab === 'inquiries' && <InquiriesView />}
            {activeTab === 'progress' && <ProgressView />}
            {activeTab === 'profile' && <ProfileView />}
            {activeTab === 'manager' && <ManagerStudioView />}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-[#DCE8F5] bg-white px-1 py-1.5 lg:hidden">
        {navItems.slice(0, 6).map(({ id, labelHe, labelEn, Icon }) => {
          const active = activeTab === id;
          const isReflectionBtn = id === 'reflection';
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors ${
                isReflectionBtn
                  ? 'bg-[#F36523] text-white hover:bg-[#D95316]'
                  : active
                    ? 'text-[#4F46E5]'
                    : 'text-[#475569]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate max-w-[54px]">{tr(labelHe, labelEn)}</span>
            </button>
          );
        })}
        {isActiveManager && (
          <button
            type="button"
            onClick={() => setActiveTab('manager')}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-medium ${
              activeTab === 'manager' ? 'text-[#4F46E5]' : 'text-[#475569]'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span className="truncate max-w-[54px]">{tr('ניהול', 'Studio')}</span>
          </button>
        )}
      </nav>

      {/* Global Modals */}
      <LanguageSearchModal />
      <StorageExplainerModal />
      <SmallDanceMeditationDialog />
      <RecommendationDetailModal />
      <SomaticInfoGuideModal />
      <UserFeedbackModal />
      <AboutContactModal />
      {selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onDelete={deleteRecord}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ContactWaysProvider>
      <AppShell />
    </ContactWaysProvider>
  );
}
