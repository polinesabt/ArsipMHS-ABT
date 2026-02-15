import { InsightDashboardProvider } from '@/contexts/InsightDashboardContext';
import { Header } from '@/components/insight/layout/Header';
import { Overview } from '@/components/insight/sections/Overview';
import { StudentAchievements } from '@/components/insight/sections/StudentAchievements';
import { StudyPeriod } from '@/components/insight/sections/StudyPeriod';
import { WaitingTime } from '@/components/insight/sections/WaitingTime';
import { JobRelevance } from '@/components/insight/sections/JobRelevance';
import { WorkCoverage } from '@/components/insight/sections/WorkCoverage';
import { UserSatisfaction } from '@/components/insight/sections/UserSatisfaction';
import { Publications } from '@/components/insight/sections/Publications';
import { ActiveStudents } from '@/components/insight/sections/ActiveStudents';
import { StudentProducts } from '@/components/insight/sections/StudentProducts';
import { ResearchOutputs } from '@/components/insight/sections/ResearchOutputs';
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';

export type DashboardSectionId =
  | 'overview'
  | 'student-achievements'
  | 'study-period'
  | 'waiting-time'
  | 'job-relevance'
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
    <div className="space-y-8">
      <Overview />
      <div className="section-divider" />
      <StudentAchievements />
      <div className="section-divider" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudyPeriod />
        <WaitingTime />
      </div>
      <div className="section-divider" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <JobRelevance />
        <WorkCoverage />
      </div>
      <div className="section-divider" />
      <UserSatisfaction />
      <div className="section-divider" />
      <Publications />
      <div className="section-divider" />
      <ActiveStudents />
      <div className="section-divider" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudentProducts />
        <ResearchOutputs />
      </div>
    </div>
  );
}

const SECTION_COMPONENTS: Record<DashboardSectionId, ComponentType<object>> = {
  overview: Overview,
  'student-achievements': StudentAchievements,
  'study-period': StudyPeriod,
  'waiting-time': WaitingTime,
  'job-relevance': JobRelevance,
  'work-coverage': WorkCoverage,
  'user-satisfaction': UserSatisfaction,
  publications: Publications,
  'active-students': ActiveStudents,
  'student-products': StudentProducts,
  'research-outputs': ResearchOutputs,
};

function SingleSection({ section }: { section: DashboardSectionId }) {
  const Component = SECTION_COMPONENTS[section];
  return Component ? <Component /> : null;
}

export function InsightDashboardEmbedded({ topOffset = 0, section }: InsightDashboardEmbeddedProps) {
  return (
    <InsightDashboardProvider initialPresentationMode>
      <div className={cn('min-h-screen w-full presentation-mode')}>
        <Header topOffset={topOffset} />
        <main className="p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {section ? <SingleSection section={section} /> : <AllSections />}
          </div>
        </main>
      </div>
    </InsightDashboardProvider>
  );
}
