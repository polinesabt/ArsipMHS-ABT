import { useMemo } from 'react';
import { Trophy, GraduationCap, Briefcase, BookOpen, Users, TrendingUp } from 'lucide-react';
import { useInsightDashboard } from '@/contexts/InsightDashboardContext';
import { 
  achievementsByYear, 
  graduationData, 
  jobRelevanceData, 
  publicationsData, 
  activeStudentsData,
  waitingTimeData,
  years, 
  Year 
} from '@/data/insightMockData';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, color }: StatCardProps) {
  return (
    <div className="dashboard-card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              changeType === 'positive' && 'text-chart-success',
              changeType === 'negative' && 'text-destructive',
              changeType === 'neutral' && 'text-muted-foreground'
            )}>
              <TrendingUp className={cn('w-3 h-3', changeType === 'negative' && 'rotate-180')} />
              {change}
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', color)}>
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
}

export function Overview() {
  const { selectedYear } = useInsightDashboard();

  const stats = useMemo(() => {
    const calculateStats = (year: Year | 'all') => {
      if (year === 'all') {
        const totalAchievements = years.reduce((sum, y) => {
          const data = achievementsByYear[y];
          return sum + data.academic.total + data.nonAcademic.total;
        }, 0);

        const totalGraduates = years.reduce((sum, y) => sum + graduationData[y].graduated, 0);
        
        const totalRelevant = years.reduce((sum, y) => sum + jobRelevanceData[y].relevant, 0);
        const totalTracked = years.reduce((sum, y) => sum + jobRelevanceData[y].tracked, 0);
        const relevanceRate = ((totalRelevant / totalTracked) * 100).toFixed(1);

        const totalPublications = years.reduce((sum, y) => {
          const d = publicationsData[y];
          return sum + d.nationalNonAccredited + d.nationalAccredited + d.international + d.reputableInternational;
        }, 0);

        const latestStudents = activeStudentsData[2026].oddSemester;

        const totalQuickHire = years.reduce((sum, y) => sum + waitingTimeData[y].lessThan3Months, 0);
        const totalWaitingTracked = years.reduce((sum, y) => sum + waitingTimeData[y].tracked, 0);
        const quickHireRate = ((totalQuickHire / totalWaitingTracked) * 100).toFixed(1);

        return {
          achievements: totalAchievements.toLocaleString(),
          graduates: totalGraduates.toLocaleString(),
          relevanceRate: `${relevanceRate}%`,
          publications: totalPublications.toLocaleString(),
          activeStudents: latestStudents.toLocaleString(),
          quickHireRate: `${quickHireRate}%`,
        };
      }

      const achievementData = achievementsByYear[year];
      const totalAchievements = achievementData.academic.total + achievementData.nonAcademic.total;
      const graduates = graduationData[year].graduated;
      const relevance = jobRelevanceData[year];
      const relevanceRate = ((relevance.relevant / relevance.tracked) * 100).toFixed(1);
      const pubs = publicationsData[year];
      const totalPubs = pubs.nationalNonAccredited + pubs.nationalAccredited + pubs.international + pubs.reputableInternational;
      const students = activeStudentsData[year].oddSemester;
      const waiting = waitingTimeData[year];
      const quickHireRate = ((waiting.lessThan3Months / waiting.tracked) * 100).toFixed(1);

      return {
        achievements: totalAchievements.toLocaleString(),
        graduates: graduates.toLocaleString(),
        relevanceRate: `${relevanceRate}%`,
        publications: totalPubs.toLocaleString(),
        activeStudents: students.toLocaleString(),
        quickHireRate: `${quickHireRate}%`,
      };
    };

    return calculateStats(selectedYear);
  }, [selectedYear]);

  const yearLabel = selectedYear === 'all' ? '2021-2026' : selectedYear.toString();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Ringkasan Dasbor</h2>
        <p className="text-muted-foreground mt-1">
          Indikator kunci arsip dan hasil survei mahasiswa ABT ({yearLabel})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Prestasi"
          value={stats.achievements}
          change="+12.5% dari periode sebelumnya"
          changeType="positive"
          icon={Trophy}
          color="bg-primary"
        />
        <StatCard
          title="Total Lulusan"
          value={stats.graduates}
          change="+8.2% tingkat kelulusan"
          changeType="positive"
          icon={GraduationCap}
          color="bg-chart-academic"
        />
        <StatCard
          title="Tingkat Kesesuaian Kerja"
          value={stats.relevanceRate}
          change="Kesesuaian industri"
          changeType="positive"
          icon={Briefcase}
          color="bg-chart-success"
        />
        <StatCard
          title="Kerja Cepat (<3 bln)"
          value={stats.quickHireRate}
          change="Daya serap lulusan"
          changeType="positive"
          icon={TrendingUp}
          color="bg-chart-warning"
        />
        <StatCard
          title="Publikasi"
          value={stats.publications}
          change="+15.3% output akademik"
          changeType="positive"
          icon={BookOpen}
          color="bg-chart-nonacademic"
        />
        <StatCard
          title="Mahasiswa Aktif"
          value={stats.activeStudents}
          change="Jumlah terkini"
          changeType="neutral"
          icon={Users}
          color="bg-chart-neutral"
        />
      </div>

      <div className="dashboard-card p-6">
        <h3 className="dashboard-card-title mb-4">Ringkasan Arsip</h3>
        <div className="interpretation-text !mt-0">
          <strong>Ringkasan Eksekutif:</strong> Arsip Mahasiswa ABT menunjukkan kinerja kuat pada indikator utama. 
          Prestasi mahasiswa tumbuh konsisten dengan pengakuan internasional yang signifikan. Hasil lulusan mencerminkan daya serap tinggi 
          dengan {stats.relevanceRate} kesesuaian bidang kerja dan {stats.quickHireRate} memperoleh pekerjaan dalam 3 bulan. 
          Produktivitas akademik tercermin dari {stats.publications} publikasi. Dengan {stats.activeStudents} mahasiswa aktif, 
          program menjaga minat yang sehat dan kesinambungan layanan pendidikan.
        </div>
      </div>
    </div>
  );
}

