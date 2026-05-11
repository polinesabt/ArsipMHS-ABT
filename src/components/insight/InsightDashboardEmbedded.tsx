import { InsightDashboardProvider } from '@/contexts/InsightDashboardContext';
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
} from '@/types/insight-tabs';

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
        <UserSatisfaction />
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
  const Component = SECTION_COMPONENTS[section];
  const showTable = section && section !== 'all' && section !== 'overview' && ADVANCED_SETTINGS_SECTION_IDS.includes(section);
  const [chartRefreshKey, setChartRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<DashboardSectionTab | null>(() =>
    isTabbedDashboardSection(section) ? getDefaultTabForSection(section) : null
  );

  useEffect(() => {
    if (isTabbedDashboardSection(section)) {
      setActiveTab(getDefaultTabForSection(section));
      return;
    }
    setActiveTab(null);
  }, [section]);

  const handleRecordsChanged = useCallback(() => {
    setChartRefreshKey((prev) => prev + 1);
  }, []);

  const resolvedActiveTab = isTabbedDashboardSection(section)
    ? coerceTabForSection(section, activeTab)
    : null;

  const sectionContent = (() => {
    if (section === 'student-achievements') {
      return (
        <StudentAchievements
          key={`${section}-${chartRefreshKey}`}
          activeTab={resolvedActiveTab as StudentAchievementsTab}
          onActiveTabChange={(tab) => setActiveTab(tab)}
        />
      );
    }
    if (section === 'publications') {
      return (
        <Publications
          key={`${section}-${chartRefreshKey}`}
          activeTab={resolvedActiveTab as PublicationsTab}
          onActiveTabChange={(tab) => setActiveTab(tab)}
        />
      );
    }
    if (section === 'research-outputs') {
      return (
        <ResearchOutputs
          key={`${section}-${chartRefreshKey}`}
          activeTab={resolvedActiveTab as ResearchOutputsTab}
          onActiveTabChange={(tab) => setActiveTab(tab)}
        />
      );
    }
    return Component ? <Component key={`${section}-${chartRefreshKey}`} /> : null;
  })();

  return (
    <>
      {sectionContent}
      {showTable && (
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
