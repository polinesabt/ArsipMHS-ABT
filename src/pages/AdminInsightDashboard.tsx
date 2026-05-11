import { useParams, Navigate } from 'react-router-dom';
import { InsightDashboardEmbedded, type DashboardSectionId } from '@/components/insight/InsightDashboardEmbedded';

const VALID_SECTIONS: DashboardSectionId[] = [
  'all', 'overview', 'student-achievements', 'study-period', 'waiting-time',
  'work-coverage', 'user-satisfaction', 'publications',
  'active-students', 'student-products', 'research-outputs',
];

export default function AdminInsightDashboard() {
  const { section: sectionParam } = useParams<{ section: string }>();
  if (sectionParam === 'job-relevance') {
    return <Navigate to="/admin/dashboard/all" replace />;
  }
  const section = sectionParam && VALID_SECTIONS.includes(sectionParam as DashboardSectionId)
    ? (sectionParam as DashboardSectionId)
    : undefined;
  return <InsightDashboardEmbedded section={section} />;
}
