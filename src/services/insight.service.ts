/**
 * Insight Service
 * AI-powered analytics and insight generation
 * 
 * ARCHITECTURE NOTE:
 * In production, this could integrate with OpenAI, Claude, or other AI APIs
 * via Next.js API routes. Currently uses local analysis logic.
 */

import type { AlumniData, AlumniMaster } from '@/types';
import * as alumniRepository from '@/repositories/alumni.repository';

// ============ Types ============

export interface InsightResult {
  insights: string[];
  generatedAt: Date;
  dataPointsAnalyzed: number;
}

export interface AnalyticsMetrics {
  employmentRate: number;
  entrepreneurshipRate: number;
  topIndustry: { name: string; count: number } | null;
  topLocation: { name: string; count: number } | null;
  topDepartment: { name: string; count: number } | null;
  studyCount: number;
  jobSeekingCount: number;
}

// ============ Analytics Operations ============

/**
 * Calculate core analytics metrics
 */
export const calculateMetrics = async (): Promise<AnalyticsMetrics> => {
  const [masterData, filledData] = await Promise.all([
    alumniRepository.getAllMasterData(),
    alumniRepository.getAllFilledData(),
  ]);

  const total = filledData.length;
  const employed = filledData.filter((d) => d.status === 'bekerja');
  const entrepreneurs = filledData.filter((d) => d.status === 'wirausaha');
  const studying = filledData.filter((d) => d.status === 'studi');
  const jobSeeking = filledData.filter((d) => d.status === 'mencari');

  // Industry analysis
  const industryCount: Record<string, number> = {};
  employed.forEach((d) => {
    if (d.bidangIndustri) {
      industryCount[d.bidangIndustri] = (industryCount[d.bidangIndustri] || 0) + 1;
    }
  });
  const topIndustryEntry = Object.entries(industryCount).sort(
    (a, b) => b[1] - a[1]
  )[0];

  // Location analysis
  const locationCount: Record<string, number> = {};
  employed.forEach((d) => {
    if (d.lokasiPerusahaan) {
      locationCount[d.lokasiPerusahaan] =
        (locationCount[d.lokasiPerusahaan] || 0) + 1;
    }
  });
  const topLocationEntry = Object.entries(locationCount).sort(
    (a, b) => b[1] - a[1]
  )[0];

  // Department analysis
  const departmentCount: Record<string, number> = {};
  employed.forEach((d) => {
    const master = masterData.find((m) => m.id === d.alumniMasterId);
    if (master) {
      departmentCount[master.jurusan] =
        (departmentCount[master.jurusan] || 0) + 1;
    }
  });
  const topDepartmentEntry = Object.entries(departmentCount).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return {
    employmentRate: total ? Math.round((employed.length / total) * 100) : 0,
    entrepreneurshipRate: total
      ? Math.round((entrepreneurs.length / total) * 100)
      : 0,
    topIndustry: topIndustryEntry
      ? { name: topIndustryEntry[0], count: topIndustryEntry[1] }
      : null,
    topLocation: topLocationEntry
      ? { name: topLocationEntry[0], count: topLocationEntry[1] }
      : null,
    topDepartment: topDepartmentEntry
      ? { name: topDepartmentEntry[0], count: topDepartmentEntry[1] }
      : null,
    studyCount: studying.length,
    jobSeekingCount: jobSeeking.length,
  };
};

// ============ Insight Generation ============

/**
 * Generate AI-powered insights from alumni data
 * In production, this could call an AI API
 */
export const generateInsights = async (): Promise<InsightResult> => {
  const metrics = await calculateMetrics();
  const filledData = await alumniRepository.getAllFilledData();

  const insights: string[] = [];

  // Employment rate insight
  const employmentQuality =
    metrics.employmentRate >= 70
      ? 'sangat baik'
      : metrics.employmentRate >= 50
      ? 'cukup baik'
      : 'perlu ditingkatkan';

  insights.push(
    `**Tingkat Keterserapan Kerja**: ${metrics.employmentRate}% alumni saat ini berstatus bekerja, menunjukkan tingkat employability yang ${employmentQuality}.`
  );

  // Entrepreneurship insight
  const entrepreneurInsight =
    metrics.entrepreneurshipRate >= 20
      ? 'Ini menunjukkan jiwa entrepreneurship yang tinggi di kalangan alumni Polines.'
      : 'Kampus dapat mempertimbangkan program inkubasi bisnis untuk mendorong lebih banyak wirausaha.';

  insights.push(
    `**Tren Kewirausahaan**: ${metrics.entrepreneurshipRate}% alumni memilih jalur wirausaha. ${entrepreneurInsight}`
  );

  // Industry insight
  if (metrics.topIndustry) {
    insights.push(
      `**Industri Dominan**: Sektor ${metrics.topIndustry.name} menjadi pilihan terbanyak dengan ${metrics.topIndustry.count} alumni, menunjukkan kesesuaian kurikulum dengan kebutuhan industri tersebut.`
    );
  }

  // Location insight
  if (metrics.topLocation) {
    insights.push(
      `**Persebaran Lokasi Kerja**: ${metrics.topLocation.name} menjadi lokasi kerja terfavorit dengan ${metrics.topLocation.count} alumni. Hal ini dapat menjadi acuan untuk program kerjasama industri.`
    );
  }

  // Department insight
  if (metrics.topDepartment) {
    insights.push(
      `**Jurusan Unggulan**: Alumni dari jurusan ${metrics.topDepartment.name} menunjukkan tingkat keterserapan kerja tertinggi dengan ${metrics.topDepartment.count} alumni bekerja.`
    );
  }

  // Study continuation insight
  if (metrics.studyCount > 0) {
    insights.push(
      `**Minat Studi Lanjut**: ${metrics.studyCount} alumni melanjutkan pendidikan ke jenjang yang lebih tinggi, menunjukkan komitmen untuk pengembangan akademik.`
    );
  }

  // Job seeking insight
  if (metrics.jobSeekingCount > 0) {
    insights.push(
      `**Alumni Mencari Kerja**: Terdapat ${metrics.jobSeekingCount} alumni yang sedang aktif mencari pekerjaan. Kampus dapat membantu dengan program job fair atau career counseling.`
    );
  }

  // Recommendation
  insights.push(
    `**Rekomendasi Strategis**: Berdasarkan analisis data, disarankan untuk memperkuat kerjasama dengan industri ${
      metrics.topIndustry?.name || 'unggulan'
    } dan mengembangkan program magang yang lebih intensif.`
  );

  return {
    insights,
    generatedAt: new Date(),
    dataPointsAnalyzed: filledData.length,
  };
};
