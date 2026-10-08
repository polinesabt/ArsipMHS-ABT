import { InsightDashboardProvider, useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { ActiveStudentsInputProvider } from '@/contexts/ActiveStudentsInputContext';
import { Header } from '@/components/insight/layout/Header';
import { ChartRecordsTableEmbedded } from '@/components/insight/ChartRecordsTableEmbedded';
import { Overview } from '@/components/insight/sections/Overview';
import { StudentAchievements } from '@/components/insight/sections/StudentAchievements';
import { StudyPeriod } from '@/components/insight/sections/StudyPeriod';
import { WaitingTime } from '@/components/insight/sections/WaitingTime';
import { WorkCoverage } from '@/components/insight/sections/WorkCoverage';
import { UserSatisfaction } from '@/components/insight/sections/UserSatisfaction';
import { Publications } from '@/components/insight/sections/Publications';
import { ActiveStudents } from '@/components/insight/sections/ActiveStudents';
import { StudentProducts } from '@/components/insight/sections/StudentProducts';
import { ResearchOutputs } from '@/components/insight/sections/ResearchOutputs';
import { useCallback, useEffect, type ComponentType, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  coerceTabForSection,
  getDefaultTabForSection,
  isTabbedDashboardSection,
  type DashboardSectionTab,
  type PublicationsTab,
  type ResearchOutputsTab,
  type StudentAchievementsTab,
  type WorkCoverageTab,
} from '@/types/insight-tabs';
import { useOptionalDemoDummyData } from '@/contexts/DemoDummyDataContext';
import { DEMO_DUMMY_DATA_ADDED_EVENT, type DemoDummyTargetId, type DemoDummyVariant } from '@/lib/sandbox';

export type DashboardSectionId =
  | 'all'
  | 'overview'
  | 'student-achievements'
  | 'study-period'
  | 'waiting-time'
  | 'work-coverage'
  | 'user-satisfaction'
  | 'publications'
  | 'active-students'
  | 'student-products'
  | 'research-outputs';

const DUMMY_TARGET_BY_SECTION: Partial<Record<DashboardSectionId, DemoDummyTargetId>> = {
  'student-achievements': 'student-achievements',
  'study-period': 'study-period',
  'waiting-time': 'waiting-time',
  'work-coverage': 'work-coverage',
  'user-satisfaction': 'user-satisfaction',
  publications: 'publications',
  'active-students': 'active-students',
  'student-products': 'student-products',
  'research-outputs': 'research-outputs',
};

interface InsightDashboardEmbeddedProps {
  topOffset?: number;
  /** When set, only this section is rendered; otherwise all sections (Presentasi) */
  section?: DashboardSectionId | null;
}

function AllSections() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <Overview />
      <div className="section-divider" />
      <div>
        <StudentAchievements />
      </div>
      <div className="section-divider" />
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="h-full">
          <StudyPeriod />
        </div>
        <div className="h-full">
          <WaitingTime />
        </div>
      </div>
      <div className="section-divider" />
      <div className="h-full">
        <WorkCoverage />
      </div>
      <div className="section-divider" />
      <div>
        <UserSatisfaction showRespondents={false} />
      </div>
      <div className="section-divider" />
      <div>
        <Publications />
      </div>
      <div className="section-divider" />
      <div>
        <ActiveStudents />
      </div>
      <div className="section-divider" />
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="h-full">
          <StudentProducts />
        </div>
        <div className="h-full">
          <ResearchOutputs />
        </div>
      </div>
    </div>
  );
}

const SECTION_COMPONENTS: Record<DashboardSectionId, ComponentType<object>> = {
  all: AllSections,
  overview: Overview,
  'student-achievements': StudentAchievements,
  'study-period': StudyPeriod,
  'waiting-time': WaitingTime,
  'work-coverage': WorkCoverage,
  'user-satisfaction': UserSatisfaction,
  publications: Publications,
  'active-students': ActiveStudents,
  'student-products': StudentProducts,
  'research-outputs': ResearchOutputs,
};

function SingleSection({ section }: { section: DashboardSectionId }) {
  const { selectedYear, invalidateCache } = useInsightDashboard();
  const Component = SECTION_COMPONENTS[section];
  const showTable = section && section !== 'all' && section !== 'overview' && ADVANCED_SETTINGS_SECTION_IDS.includes(section);
  const [activeTab, setActiveTab] = useState<DashboardSectionTab | null>(() =>
    isTabbedDashboardSection(section) ? getDefaultTabForSection(section) : null
  );
  const demoDummy = useOptionalDemoDummyData();
  const setDemoDummyTargetVariant = demoDummy?.setTargetVariant;
  const setDemoDummyTargetYear = demoDummy?.setTargetYear;

  useEffect(() => {
    if (isTabbedDashboardSection(section)) {
      setActiveTab(getDefaultTabForSection(section));
      return;
    }
    setActiveTab(null);
  }, [section]);

  const handleRecordsChanged = useCallback(() => {
    invalidateCache();
  }, [invalidateCache]);

  useEffect(() => {
    const refresh = () => handleRecordsChanged();
    window.addEventListener(DEMO_DUMMY_DATA_ADDED_EVENT, refresh);
    return () => window.removeEventListener(DEMO_DUMMY_DATA_ADDED_EVENT, refresh);
  }, [handleRecordsChanged]);

  const resolvedActiveTab = isTabbedDashboardSection(section)
    ? coerceTabForSection(section, activeTab)
    : null;

  useEffect(() => {
    if (!resolvedActiveTab || !setDemoDummyTargetVariant) return;
    if (section === 'publications' && resolvedActiveTab === 'sinta') return;
    const targetId = DUMMY_TARGET_BY_SECTION[section];
    if (targetId) setDemoDummyTargetVariant(targetId, resolvedActiveTab as DemoDummyVariant);
  }, [resolvedActiveTab, section, setDemoDummyTargetVariant]);

  useEffect(() => {
    if (!setDemoDummyTargetYear) return;
    const targetId = DUMMY_TARGET_BY_SECTION[section];
    if (targetId) setDemoDummyTargetYear(targetId, selectedYear === 'all' ? undefined : Number(selectedYear));
  }, [section, selectedYear, setDemoDummyTargetYear]);

  const sectionContent = (() => {
    if (section === 'student-achievements') {
      return (
        <StudentAchievements
          activeTab={resolvedActiveTab as StudentAchievementsTab}
          onActiveTabChange={(tab) => setActiveTab(tab)}
        />
      );
    }
    if (section === 'publications') {
      return (
        <Publications
          activeTab={resolvedActiveTab as PublicationsTab}
          onActiveTabChange={(tab) => setActiveTab(tab)}
        />
      );
    }
    if (section === 'work-coverage') {
      return (
        <WorkCoverage
          activeTab={resolvedActiveTab as WorkCoverageTab}
          onActiveTabChange={(tab) => setActiveTab(tab)}
        />
      );
    }
    if (section === 'research-outputs') {
      return (
        <ResearchOutputs
          activeTab={resolvedActiveTab as ResearchOutputsTab}
          onActiveTabChange={(tab) => setActiveTab(tab)}
        />
      );
    }
    return Component ? <Component /> : null;
  })();

  return (
    <>
      {sectionContent}
      {showTable && !(section === 'publications' && resolvedActiveTab === 'sinta') && (
        <ChartRecordsTableEmbedded
          section={section}
          activeTab={resolvedActiveTab}
          onRecordsChanged={handleRecordsChanged}
        />
      )}
    </>
  );
}

// Modul Kepuasan Pengguna tidak menampilkan tabel Pengaturan Lanjutan.
const ADVANCED_SETTINGS_SECTION_IDS: DashboardSectionId[] = [
  'student-achievements', 'study-period', 'waiting-time', 'work-coverage',
  'publications', 'student-products', 'research-outputs',
];

export function InsightDashboardEmbedded({ topOffset = 0, section }: InsightDashboardEmbeddedProps) {
  return (
    <InsightDashboardProvider initialPresentationMode>
      <ActiveStudentsInputProvider>
        <div className={cn('min-h-screen w-full presentation-mode')}>
          <Header topOffset={topOffset} section={section ?? undefined} />
          <main className="px-3 py-4 sm:px-4 sm:py-5 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
              {!section || section === 'all' ? <AllSections /> : <SingleSection section={section} />}
            </div>
          </main>
        </div>
      </ActiveStudentsInputProvider>
    </InsightDashboardProvider>
  );
}
