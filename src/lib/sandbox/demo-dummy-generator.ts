import { addJournalEntries, getJournal } from './sandbox-db';
import { generateDemoId, generateDemoUuid } from './sandbox-id';
import { sandboxSession } from './sandbox-session';
import type { SandboxJournalEntry, SandboxResource } from './sandbox-types';
import type {
  DemoDummyGenerationResult,
  DemoDummyTarget,
  DemoDummyVariant,
} from './demo-dummy-types';

type PendingEntry = Omit<SandboxJournalEntry, 'id' | 'createdAt'>;

const STUDENT_NAMES = ['Raka Pratama', 'Nadia Permata', 'Arif Nugraha', 'Salsa Maharani', 'Dimas Saputra'];
const LECTURER_NAMES = ['Dr. Rendra Saputra, M.M.', 'Dewi Anggraini, S.E., M.Si.', 'Dr. Bagas Nugroho, M.Kom.'];
const STAFF_NAMES = ['Alya Wulandari, S.Tr.A.P.', 'Fajar Ramadhan, A.Md.Kom.', 'Intan Lestari, S.E.'];

function journal(resource: SandboxResource, recordId: string, payload: unknown, uniqueKeys?: Record<string, string>): PendingEntry {
  return { operation: 'create', resource, recordId, payload, uniqueKeys };
}

function pick<T>(values: T[], seed: number): T {
  return values[seed % values.length];
}

function numericIdentity(length: number): string {
  const raw = `${Date.now()}${Math.floor(Math.random() * 100000)}`;
  return raw.slice(-length).padStart(length, '9');
}

function makeStudent(token: string, now: string, year: number, alumni = false) {
  const id = generateDemoId('stu');
  const nim = `9${numericIdentity(11)}`;
  const baseName = pick(STUDENT_NAMES, token.charCodeAt(0));
  const student = {
    id,
    nim,
    nama: `Data Dummy – ${baseName} [${token}]`,
    jurusan: 'Administrasi Bisnis',
    prodi: 'Administrasi Bisnis Terapan',
    status: alumni ? 'alumni' : 'active',
    status_mode: 'manual',
    status_effective: alumni ? 'alumni' : 'active',
    tahun_masuk: alumni ? year - 4 : year,
    tahun_lulus: alumni ? year : null,
    email: `dummy.${token.toLowerCase()}@example.test`,
    no_hp: `08${numericIdentity(10)}`,
    alamat: 'Alamat data dummy Demo Mode',
    has_credentials: true,
    created_at: now,
    updated_at: now,
  };
  return { id, nim, student, entry: journal('students', id, student, { nim }) };
}

function makeChartRecord(
  section: string,
  sourceTable: string,
  sourceId: string,
  student: ReturnType<typeof makeStudent>['student'],
  payload: Record<string, unknown>,
  year: number,
  now: string
) {
  const id = generateDemoId('rec');
  const record = {
    id,
    section,
    source_table: sourceTable,
    source_id: sourceId,
    snapshot_nim: student.nim,
    snapshot_nama: student.nama,
    snapshot_prodi: student.prodi,
    snapshot_fakultas: student.jurusan,
    tahun_pelaporan: year,
    payload,
    included_in_chart: 1,
    created_at: now,
    updated_at: now,
    attachments: [],
  };
  return { id, record, entry: journal('chart_records', id, record) };
}

function makeAchievement(
  studentId: string,
  token: string,
  now: string,
  fields: Record<string, unknown>
) {
  const id = generateDemoId('ach');
  const item = {
    id,
    student_id: studentId,
    description: 'Data dibuat otomatis khusus untuk simulasi Demo Mode.',
    lokasi: 'Semarang',
    penyelenggara: 'Pusat Kegiatan Demo',
    verified: true,
    created_at: now,
    updated_at: now,
    ...fields,
    title: `${String(fields.title || 'Data Prestasi Dummy')} [${token}]`,
  };
  return { id, item, entry: journal('achievements', id, item) };
}

function makeDosen(token: string, now: string) {
  const nidn = numericIdentity(10);
  const name = `Data Dummy – ${pick(LECTURER_NAMES, token.charCodeAt(0))} [${token}]`;
  const item = {
    nidn,
    nama: name,
    statusDosen: 'Tetap',
    jabatan: 'Asisten Ahli',
    peran: 'Akademisi',
    institusi: 'Politeknik Negeri Semarang',
    pendidikanPascaSarjana: ['Magister (S2)'],
    bidangKeahlian: 'Administrasi Bisnis Digital',
    sertifikatPendidik: `DUMMY-${token}`,
    sertifikatKompetensi: 'Sertifikasi Kompetensi Data Dummy',
    email: `dosen.dummy.${token.toLowerCase()}@example.test`,
    telepon: `08${numericIdentity(10)}`,
    pengajaran: 0,
    penelitian: 0,
    pengabdian: 0,
    avatarColor: 'from-blue-600 to-indigo-600',
    created_at: now,
  };
  return { nidn, name, item, entry: journal('dosen_master', nidn, item, { nidn }) };
}

function result(target: DemoDummyTarget, primaryId: string, entries: PendingEntry[]): DemoDummyGenerationResult {
  return {
    targetId: target.id,
    primaryId,
    createdIds: entries.map((entry) => entry.recordId),
    message: `Data dummy untuk ${target.label} berhasil ditambahkan.`,
  };
}

function buildStudentEntries(target: DemoDummyTarget, variant: DemoDummyVariant | undefined, token: string, now: string, year: number) {
  const alumni = !['student-manager', 'student-achievements', 'student-products', 'research-outputs', 'publications'].includes(target.id);
  const student = makeStudent(token, now, year, alumni);
  const entries: PendingEntry[] = [student.entry];

  if (target.id === 'student-manager') return { primaryId: student.id, entries };

  if (target.id === 'study-period') {
    const chart = makeChartRecord('study_period', 'students', student.id, student.student, {
      tahun_masuk: year - 4,
      tahun_lulus: year,
    }, year, now);
    entries.push(chart.entry);
    return { primaryId: chart.id, entries };
  }

  if (target.id === 'waiting-time' || target.id === 'work-coverage') {
    const careerStatus = target.id === 'work-coverage' && variant === 'entrepreneur' ? 'entrepreneur' : 'working';
    const tracerId = generateDemoId('trc');
    const employment = careerStatus === 'working'
      ? { nama_perusahaan: `PT Demo Nusantara ${token}`, posisi: 'Business Analyst', tahun_mulai_kerja: year, bulan_mulai_kerja: 8, work_scope: 'national' }
      : null;
    const entrepreneurship = careerStatus === 'entrepreneur'
      ? { nama_usaha: `Usaha Demo ${token}`, bidang_usaha: 'Layanan Digital', tahun_mulai_usaha: year, bulan_mulai_usaha: 8, work_scope: 'local' }
      : null;
    const tracer = {
      id: tracerId,
      student_id: student.id,
      career_status: careerStatus,
      email: student.student.email,
      no_hp: student.student.no_hp,
      tahun_pengisian: year,
      employment_data: employment,
      entrepreneurship_data: entrepreneurship,
      bersedia_dihubungi: true,
      ringkasan_karir: 'Riwayat karier otomatis untuk Demo Mode.',
      created_at: now,
      updated_at: now,
    };
    entries.push(journal('tracer', tracerId, tracer));
    const chartPayload = target.id === 'waiting-time'
      ? { tahun_lulus: year, bucket: 'lessThan3Months', tahun_mulai_kerja: year }
      : { career_status: careerStatus, tahun_lulus: year, work_scope: careerStatus === 'working' ? 'national' : 'local' };
    const chart = makeChartRecord(target.id === 'waiting-time' ? 'waiting_time' : 'work_coverage', 'tracer_study', tracerId, student.student, chartPayload, year, now);
    entries.push(chart.entry);
    return { primaryId: chart.id, entries };
  }

  if (target.id === 'user-satisfaction') {
    const evaluationId = generateDemoId('eval');
    const responseId = generateDemoId('eval-response');
    entries.push(journal('evaluations', evaluationId, {
      id: evaluationId,
      title: `Evaluasi Kepuasan Dummy [${token}]`,
      short_message: 'Evaluasi otomatis untuk Demo Mode.',
      status: 'active',
      start_at: now.slice(0, 10),
      end_at: null,
      reminder_enabled: true,
      reminder_interval_days: 7,
      created_by: 'demo',
      created_at: now,
      updated_at: now,
    }));
    const chart = makeChartRecord('user_satisfaction', 'evaluation_responses', responseId, student.student, {
      evaluation_id: evaluationId,
      submitted_at: now,
      ratings: [5, 4, 5, 4, 5],
      aspect_names: ['Integritas', 'Profesionalisme', 'Komunikasi', 'Kerja Sama', 'Penguasaan Teknologi'],
    }, year, now);
    entries.push(chart.entry);
    return { primaryId: chart.id, entries };
  }

  let achievementFields: Record<string, unknown>;
  let chartSection: string;
  if (target.id === 'student-achievements') {
    const academic = variant !== 'nonAcademic';
    achievementFields = {
      title: academic ? 'Juara Kompetisi Analisis Bisnis Nasional' : 'Penghargaan Kepemimpinan Organisasi',
      category: academic ? 'lomba' : 'organisasi',
      subcategory: academic ? 'business_case' : 'student_organization',
      achievement_type: academic ? 'academic' : 'non_academic',
      tanggal: `${year}-08-17`,
      tingkat: 'nasional',
      peringkat: academic ? 'Juara 1' : 'Ketua Terbaik',
    };
    chartSection = 'student_achievements';
  } else if (target.id === 'publications') {
    const active = variant === 'seminar' || variant === 'pagelaran' ? variant : 'jurnal';
    achievementFields = {
      title: active === 'jurnal' ? 'Transformasi Digital UMKM Vokasi' : active === 'seminar' ? 'Presentasi Riset Bisnis Terapan' : 'Pagelaran Inovasi Mahasiswa',
      category: active === 'jurnal' ? 'scientific_work' : active === 'seminar' ? 'seminar' : 'event_participation',
      subcategory: active === 'jurnal' ? 'journal_publication' : active === 'seminar' ? 'seminar_publication' : 'performance',
      achievement_type: 'academic',
      tanggal: `${year}-07-12`,
      tingkat: active === 'pagelaran' ? 'regional' : 'nasional',
      jenis_perolehan: 'mandiri',
      jenis_diseminasi: active,
      level_diseminasi: active === 'jurnal' ? 'national_accredited' : active === 'pagelaran' ? 'regional' : 'national',
      judul_publikasi: active === 'seminar' ? `Presentasi Riset Bisnis Terapan [${token}]` : null,
      level_seminar: active === 'seminar' ? 'nasional' : null,
      tanggal_publikasi: `${year}-07-12`,
      nama_seminar_konferensi: active === 'seminar' ? 'Seminar Nasional Demo' : null,
      url_publikasi: `https://example.test/demo/${token.toLowerCase()}`,
      is_valid_publication_seminar: true,
    };
    chartSection = 'publications';
  } else if (target.id === 'student-products') {
    achievementFields = {
      title: 'Aplikasi Inventori UMKM Demo',
      category: 'applied_academic',
      subcategory: 'teknologi_bisnis',
      achievement_type: 'academic',
      tanggal: `${year}-06-15`,
      tingkat: 'nasional',
      link_produk: `https://example.test/product/${token.toLowerCase()}`,
    };
    chartSection = 'student_products';
  } else {
    const active = variant === 'technology' || variant === 'other' ? variant : 'haki';
    achievementFields = {
      title: active === 'haki' ? 'Hak Cipta Sistem Administrasi Digital' : active === 'technology' ? 'Perangkat Otomasi Arsip Cerdas' : 'Buku Transformasi Administrasi Bisnis',
      category: active === 'haki' ? 'intellectual_property' : active === 'technology' ? 'applied_academic' : 'scientific_work',
      subcategory: active === 'haki' ? 'copyright' : active === 'technology' ? 'technology_product' : 'isbn_book',
      achievement_type: 'academic',
      tanggal: `${year}-05-20`,
      tingkat: 'nasional',
    };
    chartSection = 'research_outputs';
  }

  const achievement = makeAchievement(student.id, token, now, achievementFields);
  entries.push(achievement.entry);
  const chartPayload = { ...achievement.item, year };
  const chart = makeChartRecord(chartSection, 'achievements', achievement.id, student.student, chartPayload, year, now);
  entries.push(chart.entry);
  return { primaryId: achievement.id, entries };
}

function buildDosenEntries(target: DemoDummyTarget, token: string, now: string, year: number) {
  if (target.id === 'tendik') {
    const id = generateDemoId('tendik');
    const nip = numericIdentity(18);
    const item = {
      id,
      nip,
      nama: `Data Dummy – ${pick(STAFF_NAMES, token.charCodeAt(0))} [${token}]`,
      status: 'Tetap',
      jabatan: 'Pranata Administrasi Digital',
      golongan: 'Gol. III/a',
      pendidikanD3: '-',
      pendidikanS1: 'S1 Administrasi Bisnis',
      pendidikanS2: '-',
      pendidikanS3: '-',
      sertifikatKompetensi: ['Pengelolaan Arsip Digital Demo'],
      created_at: now,
    };
    return { primaryId: id, entries: [journal('tendik', id, item, { nip })] };
  }

  const dosen = makeDosen(token, now);
  const entries: PendingEntry[] = [dosen.entry];
  if (target.id === 'dosen-management') return { primaryId: dosen.nidn, entries };

  if (target.id === 'dosen-teaching') {
    const item = {
      nidn: dosen.nidn,
      nama: dosen.name,
      avatarColor: dosen.item.avatarColor,
      matkulABT: [{ id: generateDemoId('mk'), kode: `ABT-${token}`, nama: 'Otomasi Administrasi Bisnis', sks: 3 }],
      matkulPSLain: [],
      bahanAjar: [`Modul Pembelajaran Digital Dummy [${token}]`],
      bimbingan: { psABT: { ps: 3, ps1: 2, ps2: 1 }, psLain: { ps: 0, ps1: 0, ps2: 0 } },
      rataBimbingan: 2,
      rekognisi: [`Narasumber Workshop Demo ${year}`],
    };
    entries.push(journal('dosen_pengajaran', dosen.nidn, item));
  } else if (target.id === 'dosen-research') {
    const item = {
      nidn: dosen.nidn,
      nama: dosen.name,
      avatarColor: dosen.item.avatarColor,
      penelitian: [{ id: generateDemoId('lit'), judul: `Riset Transformasi Bisnis Digital Dummy [${token}]`, kerjasamaInstansi: 'Mitra Industri Demo', tahun: String(year), skema: 'Riset Terapan' }],
      rekognisi: [],
    };
    entries.push(journal('dosen_penelitian', dosen.nidn, item));
  } else if (target.id === 'dosen-service') {
    const item = {
      nidn: dosen.nidn,
      nama: dosen.name,
      avatarColor: dosen.item.avatarColor,
      pkm: [{ id: generateDemoId('pkm'), namaKegiatan: `Pendampingan UMKM Digital Dummy [${token}]`, kerjasamaInstansi: 'Komunitas UMKM Demo', tahun: String(year), skema: 'Pemberdayaan Masyarakat' }],
      rekognisi: [],
    };
    entries.push(journal('dosen_pengabdian', dosen.nidn, item));
  } else if (target.id === 'dosen-workload') {
    const item = {
      nidn: dosen.nidn,
      nama: dosen.name,
      avatarColor: dosen.item.avatarColor,
      jabatan: dosen.item.jabatan,
      statusDosen: dosen.item.statusDosen,
      tahunAkademik: `${year}/${year + 1}`,
      sksPendidikanPS: 8,
      sksPendidikanPSLain: 2,
      sksPendidikanPTLain: 0,
      sksPenelitian: 3,
      sksPengabdian: 2,
      sksTugasTambahan: 1,
    };
    entries.push(journal('dosen_waktu_mengajar', `${dosen.nidn}:${year}/${year + 1}`, item));
  } else if (target.id === 'dosen-outputs') {
    const item = {
      nidn: dosen.nidn,
      nama: dosen.name,
      avatarColor: dosen.item.avatarColor,
      luaran: [{
        id: generateDemoId('luaran'),
        kategori: 'Penelitian',
        judul: `Publikasi Riset Terapan Dummy [${token}]`,
        tahun: String(year),
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
        urlLuaran: `https://example.test/luaran/${token.toLowerCase()}`,
      }],
    };
    entries.push(journal('dosen_luaran', dosen.nidn, item));
  }
  return { primaryId: entries[entries.length - 1].recordId, entries };
}

export async function generateDemoDummyData(
  target: DemoDummyTarget,
  variant?: DemoDummyVariant,
  selectedYear?: number
): Promise<DemoDummyGenerationResult> {
  const sid = sandboxSession.getSid();
  if (!sid || !sandboxSession.isDemoActive()) throw new Error('Sesi Demo Mode tidak aktif.');

  const uuid = generateDemoUuid();
  const token = uuid.replace(/-/g, '').slice(0, 4).toUpperCase();
  const now = new Date().toISOString();
  const year = selectedYear || new Date().getFullYear();
  const existingJournal = await getJournal(sid);

  let built: { primaryId: string; entries: PendingEntry[] };
  if (target.id === 'active-students') {
    const existingStats = existingJournal.filter((entry) => entry.resource === 'active_students_stats' && entry.operation === 'create');
    const semester = existingStats.length % 2 === 0 ? 'ganjil' : 'genap';
    const statYear = selectedYear || year + Math.floor(existingStats.length / 2) + 1;
    const id = `stat-${statYear}-${semester}`;
    built = {
      primaryId: id,
      entries: [journal('active_students_stats', id, { tahun: statYear, semester, pd_dikti: 120, aktif: 116 })],
    };
  } else if (target.id === 'evaluations') {
    const id = generateDemoId('eval');
    built = {
      primaryId: id,
      entries: [journal('evaluations', id, {
        id,
        title: `Evaluasi Lulusan Dummy [${token}]`,
        short_message: 'Kampanye evaluasi otomatis untuk Demo Mode.',
        status: 'active',
        start_at: now.slice(0, 10),
        end_at: null,
        reminder_enabled: true,
        reminder_interval_days: 7,
        created_by: 'demo',
        created_at: now,
        updated_at: now,
        total_targets: 0,
        total_sent: 0,
        total_submitted: 0,
        response_rate: 0,
      })],
    };
  } else if (target.id.startsWith('dosen-') || target.id === 'tendik') {
    built = buildDosenEntries(target, token, now, year);
  } else {
    built = buildStudentEntries(target, variant ?? target.defaultVariant, token, now, year);
  }

  await addJournalEntries(sid, built.entries);
  sandboxSession.setPendingOperationsCount((await getJournal(sid)).length);
  return result(target, built.primaryId, built.entries);
}
