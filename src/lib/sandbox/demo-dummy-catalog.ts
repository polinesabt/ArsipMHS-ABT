import type { DemoDummyTarget, DemoDummyTargetId } from './demo-dummy-types';

export const DEMO_DUMMY_TARGETS: Record<DemoDummyTargetId, DemoDummyTarget> = {
  'student-manager': {
    id: 'student-manager',
    label: 'Pengelola Mahasiswa',
    description: 'Satu akun mahasiswa dummy baru akan ditambahkan.',
  },
  'student-achievements': {
    id: 'student-achievements',
    label: 'Prestasi Mahasiswa',
    description: 'Satu mahasiswa dan satu prestasi dummy sesuai tab aktif akan ditambahkan.',
    defaultVariant: 'all',
  },
  'study-period': {
    id: 'study-period',
    label: 'Masa Studi',
    description: 'Satu mahasiswa alumni dengan data masa studi lengkap akan ditambahkan.',
  },
  'waiting-time': {
    id: 'waiting-time',
    label: 'Waktu Tunggu',
    description: 'Satu mahasiswa alumni dan satu riwayat karier dummy akan ditambahkan.',
  },
  'work-coverage': {
    id: 'work-coverage',
    label: 'Cakupan Kerja',
    description: 'Satu mahasiswa alumni dan data karier sesuai tab aktif akan ditambahkan.',
    defaultVariant: 'working',
  },
  'user-satisfaction': {
    id: 'user-satisfaction',
    label: 'Kepuasan Pengguna',
    description: 'Satu mahasiswa, evaluasi, dan respons kepuasan dummy akan ditambahkan.',
  },
  publications: {
    id: 'publications',
    label: 'Diseminasi Ilmiah Mahasiswa',
    description: 'Satu mahasiswa dan satu karya diseminasi sesuai tab aktif akan ditambahkan.',
    defaultVariant: 'jurnal',
  },
  'active-students': {
    id: 'active-students',
    label: 'Mahasiswa Aktif',
    description: 'Satu statistik semester mahasiswa aktif dummy akan ditambahkan.',
  },
  'student-products': {
    id: 'student-products',
    label: 'Produk Mahasiswa',
    description: 'Satu mahasiswa dan satu produk terapan dummy akan ditambahkan.',
  },
  'research-outputs': {
    id: 'research-outputs',
    label: 'Luaran Penelitian',
    description: 'Satu mahasiswa dan satu luaran penelitian sesuai tab aktif akan ditambahkan.',
    defaultVariant: 'haki',
  },
  evaluations: {
    id: 'evaluations',
    label: 'Evaluasi Lulusan',
    description: 'Satu kampanye evaluasi lulusan dummy yang aktif akan ditambahkan.',
  },
  'dosen-management': {
    id: 'dosen-management',
    label: 'Pengelolaan Dosen',
    description: 'Satu profil dosen dummy baru akan ditambahkan ke seluruh master modul.',
  },
  'dosen-teaching': {
    id: 'dosen-teaching',
    label: 'Kontribusi Pengajaran',
    description: 'Satu dosen dan satu data kontribusi pengajaran dummy akan ditambahkan.',
  },
  'dosen-research': {
    id: 'dosen-research',
    label: 'Kontribusi Penelitian',
    description: 'Satu dosen dan satu penelitian dummy akan ditambahkan.',
  },
  'dosen-service': {
    id: 'dosen-service',
    label: 'Kontribusi Pengabdian',
    description: 'Satu dosen dan satu kegiatan pengabdian dummy akan ditambahkan.',
  },
  'dosen-workload': {
    id: 'dosen-workload',
    label: 'Waktu Mengajar',
    description: 'Satu dosen dan satu periode EWMP dummy akan ditambahkan.',
  },
  tendik: {
    id: 'tendik',
    label: 'Tenaga Kependidikan',
    description: 'Satu profil tenaga kependidikan dummy akan ditambahkan.',
  },
  'dosen-outputs': {
    id: 'dosen-outputs',
    label: 'Luaran Penelitian/PKM',
    description: 'Satu dosen dan satu luaran penelitian/PKM dummy akan ditambahkan.',
  },
};

const EXACT_ROUTE_TARGETS: Record<string, DemoDummyTargetId> = {
  '/admin/mahasiswa/pengelola': 'student-manager',
  '/admin/mahasiswa/dashboard/student-achievements': 'student-achievements',
  '/admin/mahasiswa/dashboard/study-period': 'study-period',
  '/admin/mahasiswa/dashboard/waiting-time': 'waiting-time',
  '/admin/mahasiswa/dashboard/work-coverage': 'work-coverage',
  '/admin/mahasiswa/dashboard/user-satisfaction': 'user-satisfaction',
  '/admin/mahasiswa/dashboard/publications': 'publications',
  '/admin/mahasiswa/dashboard/active-students': 'active-students',
  '/admin/mahasiswa/dashboard/student-products': 'student-products',
  '/admin/mahasiswa/dashboard/research-outputs': 'research-outputs',
  '/admin/mahasiswa/evaluasi': 'evaluations',
  '/admin/dosen/pengelolaan': 'dosen-management',
  '/admin/dosen/kontribusi': 'dosen-teaching',
  '/admin/dosen/kontribusi/pengajaran': 'dosen-teaching',
  '/admin/dosen/kontribusi/penelitian': 'dosen-research',
  '/admin/dosen/kontribusi/pengabdian': 'dosen-service',
  '/admin/dosen/waktu-mengajar': 'dosen-workload',
  '/admin/dosen/tenaga-kependidikan': 'tendik',
  '/admin/dosen/luaran-penelitian-pkm': 'dosen-outputs',
};

export function resolveDemoDummyTarget(pathname: string): DemoDummyTarget | null {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const targetId = EXACT_ROUTE_TARGETS[normalized];
  return targetId ? DEMO_DUMMY_TARGETS[targetId] : null;
}
