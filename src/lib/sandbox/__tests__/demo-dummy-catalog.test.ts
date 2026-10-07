import { describe, expect, it } from 'vitest';
import { resolveDemoDummyTarget } from '../demo-dummy-catalog';

describe('resolveDemoDummyTarget', () => {
  it('maps supported student and lecturer modules', () => {
    expect(resolveDemoDummyTarget('/admin/mahasiswa/pengelola')?.id).toBe('student-manager');
    expect(resolveDemoDummyTarget('/admin/mahasiswa/dashboard/publications')?.id).toBe('publications');
    expect(resolveDemoDummyTarget('/admin/dosen/kontribusi/penelitian')?.id).toBe('dosen-research');
    expect(resolveDemoDummyTarget('/admin/dosen/tenaga-kependidikan/')?.id).toBe('tendik');
  });

  it('does not expose the action on aggregate or read-only routes', () => {
    expect(resolveDemoDummyTarget('/admin/mahasiswa/dashboard/all')).toBeNull();
    expect(resolveDemoDummyTarget('/admin/dosen/dashboard')).toBeNull();
    expect(resolveDemoDummyTarget('/admin/mahasiswa/ai-insight')).toBeNull();
    expect(resolveDemoDummyTarget('/admin/mahasiswa/history-logbook')).toBeNull();
    expect(resolveDemoDummyTarget('/admin/select-dashboard')).toBeNull();
  });
});
