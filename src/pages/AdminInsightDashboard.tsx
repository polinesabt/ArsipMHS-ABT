import { useParams } from 'react-router-dom';
import { InsightDashboardEmbedded, type DashboardSectionId } from '@/components/insight/InsightDashboardEmbedded';

const VALID_SECTIONS: DashboardSectionId[] = [
  'overview', 'student-achievements', 'study-period', 'waiting-time',
  'job-relevance', 'work-coverage', 'user-satisfaction', 'publications',
  'active-students', 'student-products', 'research-outputs',
];

export default function AdminInsightDashboard() {
  const { section: sectionParam } = useParams<{ section: string }>();
  const section = sectionParam && VALID_SECTIONS.includes(sectionParam as DashboardSectionId)
    ? (sectionParam as DashboardSectionId)
    : undefined;
  return <InsightDashboardEmbedded section={section} />;
}