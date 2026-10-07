import { describe, expect, it } from 'vitest';
import type { SandboxJournalEntry } from '../sandbox-types';
import {
  overlayDemoAchievementStats,
  overlayDemoInsightRecords,
  overlayDemoInsightStats,
} from '../demo-dummy-overlays';

function chartEntry(id: string, section: string, payload: Record<string, unknown>, year = 2026): SandboxJournalEntry {
  return {
    id: `op-${id}`,
    operation: 'create',
    resource: 'chart_records',
    recordId: id,
    createdAt: 1,
    payload: {
      id,
      section,
      source_table: 'students',
      source_id: id,
      snapshot_nim: '99001',
      snapshot_nama: 'Data Dummy',
      snapshot_prodi: 'Administrasi Bisnis Terapan',
      snapshot_fakultas: 'Administrasi Bisnis',
      tahun_pelaporan: year,
      included_in_chart: 1,
      payload,
    },
  };
}

describe('demo dummy chart overlays', () => {
  it('adds a study-period record to table and aggregate stats', () => {
    const journal = [chartEntry('demo-rec-1', 'study_period', { tahun_masuk: 2022, tahun_lulus: 2026 })];
    const records = overlayDemoInsightRecords(
      { success: true, data: { section: 'study_period', records: [], total: 0, page: 1, per_page: 20 } },
      journal,
      [],
      { section: 'study_period', page: 1, per_page: 20 }
    );
    expect(records.data.records).toHaveLength(1);
    expect(records.data.total).toBe(1);

    const stats = overlayDemoInsightStats(
      { success: true, data: { by_year: [], total_diterima: 0, total_lulus: 0 } },
      journal,
      { section: 'study_period' }
    );
    expect(stats.data.by_year).toEqual([
      { year: 2022, diterima: 1, lulus: 0 },
      { year: 2026, diterima: 0, lulus: 1 },
    ]);
    expect(stats.data.total_diterima).toBe(1);
    expect(stats.data.total_lulus).toBe(1);
  });

  it('honors the active publication tab', () => {
    const journal = [
      chartEntry('jurnal', 'publications', { jenis_diseminasi: 'jurnal', jenis_perolehan: 'mandiri', level_diseminasi: 'national_accredited' }),
      chartEntry('seminar', 'publications', { jenis_diseminasi: 'seminar', jenis_perolehan: 'mandiri', level_diseminasi: 'national' }),
    ];
    const response = overlayDemoInsightRecords(
      { success: true, data: { section: 'publications', records: [], total: 0, page: 1, per_page: 20 } },
      journal,
      [],
      { section: 'publications', tab: 'seminar' }
    );
    expect(response.data.records.map((item: { id: string }) => item.id)).toEqual(['seminar']);
  });

  it('updates achievement totals and the selected breakdown', () => {
    const journal = [chartEntry('achievement', 'student_achievements', {
      category: 'organisasi',
      achievement_type: 'non_academic',
      tingkat: 'nasional',
      year: 2026,
    })];
    const response = overlayDemoAchievementStats({
      success: true,
      data: {
        by_category: [],
        by_type: [],
        by_year: [],
        total: 0,
        academic_breakdown: { local: 0, national: 0, international: 0 },
        non_academic_breakdown: { local: 0, national: 0, international: 0 },
      },
    }, journal, { tab: 'all' });
    expect(response.data.total).toBe(1);
    expect(response.data.non_academic_breakdown.national).toBe(1);
  });
});
