/* eslint-disable @typescript-eslint/no-explicit-any -- API overlays normalize several legacy response shapes. */
import type { SandboxJournalEntry, SandboxTombstone } from './sandbox-types';

type AnyRecord = Record<string, any>;

function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

function responseData(response: AnyRecord): AnyRecord {
  return response?.data && typeof response.data === 'object' ? response.data : response;
}

function createdPayloads(journal: SandboxJournalEntry[], resource: SandboxJournalEntry['resource']): AnyRecord[] {
  return journal
    .filter((entry) => entry.resource === resource && entry.operation === 'create' && entry.payload)
    .map((entry) => entry.payload as AnyRecord);
}

function incrementArrayRow(
  rows: AnyRecord[],
  key: string,
  keyValue: string | number,
  defaults: AnyRecord,
  countKey = 'count',
  amount = 1
): void {
  let row = rows.find((item) => item[key] === keyValue);
  if (!row) {
    row = { ...defaults, [key]: keyValue };
    rows.push(row);
  }
  row[countKey] = Number(row[countKey] || 0) + amount;
}

function chartRecordMatches(record: AnyRecord, section: string, params: AnyRecord): boolean {
  if (record.section !== section || !record.included_in_chart) return false;
  if (params?.year && Number(params.year) !== Number(record.tahun_pelaporan)) return false;

  const tab = String(params?.tab || '');
  const payload = record.payload || {};
  if (!tab || tab === 'all') return true;
  if (section === 'student_achievements') {
    return tab === 'academic'
      ? payload.achievement_type === 'academic'
      : payload.achievement_type !== 'academic';
  }
  if (section === 'publications') return payload.jenis_diseminasi === tab;
  if (section === 'work_coverage') return payload.career_status === tab;
  if (section === 'research_outputs') {
    const sub = String(payload.subcategory || '');
    const haki = ['trademark', 'patent', 'simple_patent', 'industrial_design', 'copyright', 'geographical_indication', 'trade_secret', 'circuit_layout'];
    const other = ['isbn_book', 'book_chapter'];
    if (tab === 'haki') return haki.includes(sub);
    if (tab === 'other') return other.includes(sub);
    if (tab === 'technology') return !haki.includes(sub) && !other.includes(sub);
  }
  return true;
}

export function overlayDemoInsightRecords(
  productionResponse: AnyRecord,
  journal: SandboxJournalEntry[],
  tombstones: SandboxTombstone[],
  params: AnyRecord = {}
): AnyRecord {
  const response = clone(productionResponse);
  const data = responseData(response);
  if (!Array.isArray(data.records)) return response;

  const section = String(params.section || data.section || '');
  const deleted = new Set(
    tombstones.filter((item) => item.resource === 'chart_records').map((item) => item.recordId)
  );
  const updates = new Map<string, AnyRecord>();
  for (const entry of journal) {
    if (entry.resource !== 'chart_records' || entry.operation !== 'update' || !entry.patch) continue;
    updates.set(entry.recordId, { ...(updates.get(entry.recordId) || {}), ...entry.patch });
  }

  const productionRecords = data.records
    .filter((item: AnyRecord) => !deleted.has(String(item.id)))
    .map((item: AnyRecord) => ({ ...item, ...(updates.get(String(item.id)) || {}) }));
  const created = createdPayloads(journal, 'chart_records')
    .filter((item) => !deleted.has(String(item.id)))
    .map((item) => ({ ...item, ...(updates.get(String(item.id)) || {}) }))
    .filter((item) => chartRecordMatches(item, section, params));

  const page = Math.max(1, Number(params.page || data.page || 1));
  const perPage = Math.max(1, Number(params.per_page || data.per_page || 20));
  data.records = page === 1 ? [...created, ...productionRecords].slice(0, perPage) : productionRecords;
  data.total = Number(data.total || productionRecords.length) + created.length;
  data.page = page;
  data.per_page = perPage;
  return response;
}

function applyStudyPeriod(data: AnyRecord, record: AnyRecord): void {
  data.by_year = Array.isArray(data.by_year) ? data.by_year : [];
  const masuk = Number(record.payload?.tahun_masuk);
  const lulus = Number(record.payload?.tahun_lulus);
  if (masuk) incrementArrayRow(data.by_year, 'year', masuk, { diterima: 0, lulus: 0 }, 'diterima');
  if (lulus) incrementArrayRow(data.by_year, 'year', lulus, { diterima: 0, lulus: 0 }, 'lulus');
  data.by_year.sort((a: AnyRecord, b: AnyRecord) => a.year - b.year);
  data.total_diterima = Number(data.total_diterima || 0) + (masuk ? 1 : 0);
  data.total_lulus = Number(data.total_lulus || 0) + (lulus ? 1 : 0);
}

function applyWaitingTime(data: AnyRecord, record: AnyRecord): void {
  data.by_year = Array.isArray(data.by_year) ? data.by_year : [];
  const bucket = String(record.payload?.bucket || 'moreThan6Months');
  const year = Number(record.tahun_pelaporan);
  let row = data.by_year.find((item: AnyRecord) => Number(item.year) === year);
  if (!row) {
    row = { year, lessThan3Months: 0, between3And6Months: 0, moreThan6Months: 0 };
    data.by_year.push(row);
  }
  row[bucket] = Number(row[bucket] || 0) + 1;
  data.by_year.sort((a: AnyRecord, b: AnyRecord) => a.year - b.year);
  data.total = Number(data.total || 0) + 1;
}

function applyWorkCoverage(data: AnyRecord, record: AnyRecord): void {
  const payload = record.payload || {};
  const status = String(payload.career_status || 'working');
  const scopeRaw = String(payload.work_scope || 'national');
  const scope = scopeRaw === 'local' || scopeRaw === 'regional' ? 'local'
    : ['multinational', 'international', 'internasional'].includes(scopeRaw) ? 'multinational' : 'national';
  const year = Number(record.tahun_pelaporan);
  const labels: AnyRecord = { working: 'Bekerja', entrepreneur: 'Wirausaha', further_study: 'Studi Lanjut', job_seeking: 'Mencari Kerja' };
  data.by_scope = Array.isArray(data.by_scope) ? data.by_scope : [];
  incrementArrayRow(data.by_scope, 'key', status, { label: labels[status] || status }, 'count');
  data.by_year = Array.isArray(data.by_year) ? data.by_year : [];
  incrementArrayRow(data.by_year, 'year', year, { local: 0, national: 0, multinational: 0 }, scope);
  data.by_year_by_status = data.by_year_by_status || { working: [], entrepreneur: [] };
  data.by_year_by_status[status] = Array.isArray(data.by_year_by_status[status]) ? data.by_year_by_status[status] : [];
  incrementArrayRow(data.by_year_by_status[status], 'year', year, { local: 0, national: 0, multinational: 0 }, scope);
  data.total_by_status = data.total_by_status || { working: 0, entrepreneur: 0 };
  data.total_by_status[status] = Number(data.total_by_status[status] || 0) + 1;
  data.total = Number(data.total || 0) + 1;
}

function applyUserSatisfaction(data: AnyRecord, record: AnyRecord): void {
  const ratings: number[] = Array.isArray(record.payload?.ratings) ? record.payload.ratings : [5];
  const names: string[] = Array.isArray(record.payload?.aspect_names) ? record.payload.aspect_names : [];
  data.aspects = Array.isArray(data.aspects) ? data.aspects : [];
  data.likert = Array.isArray(data.likert) ? data.likert : [];
  ratings.forEach((rating, index) => {
    const aspectName = names[index] || `Aspek ${index + 1}`;
    let aspect = data.aspects.find((item: AnyRecord) => item.aspect_name === aspectName);
    if (!aspect) {
      aspect = { aspect_name: aspectName, avg_score: 0, response_count: 0 };
      data.aspects.push(aspect);
    }
    const oldCount = Number(aspect.response_count || 0);
    aspect.avg_score = Number(((Number(aspect.avg_score || 0) * oldCount + rating) / (oldCount + 1)).toFixed(2));
    aspect.response_count = oldCount + 1;
    let likert = data.likert.find((item: AnyRecord) => item.indicator === aspectName);
    if (!likert) {
      likert = { indicator: aspectName, veryGood: 0, good: 0, fair: 0, poor: 0 };
      data.likert.push(likert);
    }
    const bucket = rating >= 5 ? 'veryGood' : rating >= 4 ? 'good' : rating >= 3 ? 'fair' : 'poor';
    likert[bucket] = Number(likert[bucket] || 0) + 1;
  });
  const scored = data.aspects.filter((item: AnyRecord) => Number(item.response_count) > 0);
  data.overall_avg = scored.length
    ? Number((scored.reduce((sum: number, item: AnyRecord) => sum + Number(item.avg_score || 0), 0) / scored.length).toFixed(2))
    : 0;
  data.total_responses = Number(data.total_responses || 0) + 1;
}

function applyPublications(data: AnyRecord, record: AnyRecord): void {
  const payload = record.payload || {};
  const tab = String(payload.jenis_diseminasi || 'jurnal');
  const year = Number(record.tahun_pelaporan);
  data[tab] = data[tab] || { by_year: [], total: 0 };
  data[tab].by_year = Array.isArray(data[tab].by_year) ? data[tab].by_year : [];
  const prefix = payload.jenis_perolehan === 'kolaborasi_dosen' ? 'kolaborasi' : 'mandiri';
  const level = String(payload.level_diseminasi || 'national');
  const suffixes: AnyRecord = tab === 'jurnal'
    ? { national_non_accredited: 'NationalNonAccredited', national_accredited: 'NationalAccredited', international: 'International', reputable_international: 'ReputableInternational' }
    : tab === 'pagelaran'
      ? { regional: 'Regional', national: 'National', international: 'International' }
      : { local: 'Local', national: 'National', international: 'International' };
  const defaults: AnyRecord = { year };
  for (const pre of ['mandiri', 'kolaborasi']) for (const suffix of Object.values(suffixes)) defaults[`${pre}${suffix}`] = 0;
  incrementArrayRow(data[tab].by_year, 'year', year, defaults, `${prefix}${suffixes[level] || Object.values(suffixes)[0]}`);
  data[tab].total = Number(data[tab].total || 0) + 1;
  data.journals = data.jurnal;
  data.seminars = data.seminar;
  data.performances = data.pagelaran;
}

function applyStudentProducts(data: AnyRecord, record: AnyRecord): void {
  const key = String(record.payload?.kategori_produk || record.payload?.subcategory || 'teknologi_bisnis');
  const labels: AnyRecord = { teknologi_bisnis: 'Teknologi Bisnis Terapan', pendidikan: 'Pendidikan', layanan_digital: 'Layanan Digital' };
  data.by_category = Array.isArray(data.by_category) ? data.by_category : [];
  incrementArrayRow(data.by_category, 'key', key, { label: labels[key] || key.replace(/_/g, ' ') }, 'count');
  data.total = Number(data.total || 0) + 1;
}

function applyResearchOutputs(data: AnyRecord, record: AnyRecord): void {
  const sub = String(record.payload?.subcategory || 'copyright');
  const haki = ['trademark', 'patent', 'simple_patent', 'industrial_design', 'copyright', 'geographical_indication', 'trade_secret', 'circuit_layout'];
  const other = ['isbn_book', 'book_chapter'];
  const names: AnyRecord = { copyright: 'Hak Cipta', technology_product: 'Produk Teknologi Tepat Guna', isbn_book: 'Buku ber-ISBN' };
  if (haki.includes(sub)) {
    data.intellectual_property = Array.isArray(data.intellectual_property) ? data.intellectual_property : [];
    incrementArrayRow(data.intellectual_property, 'key', sub, { name: names[sub] || sub }, 'count');
  } else if (other.includes(sub)) {
    data.other = Array.isArray(data.other) ? data.other : [];
    incrementArrayRow(data.other, 'key', sub, { name: names[sub] || sub }, 'count');
  } else {
    data.technology = data.technology || { softwareDevelopment: 0, products: 0, breakdown: [] };
    data.technology.breakdown = Array.isArray(data.technology.breakdown) ? data.technology.breakdown : [];
    incrementArrayRow(data.technology.breakdown, 'key', sub, { name: names[sub] || sub }, 'count');
    if (sub === 'software_development') data.technology.softwareDevelopment = Number(data.technology.softwareDevelopment || 0) + 1;
    else data.technology.products = Number(data.technology.products || 0) + 1;
  }
  data.total = Number(data.total || 0) + 1;
}

function applyStudentAchievement(data: AnyRecord, record: AnyRecord): void {
  const payload = record.payload || {};
  const category = String(payload.category || 'lomba');
  const type = payload.achievement_type === 'academic' ? 'academic' : 'non_academic';
  const level = payload.tingkat === 'internasional' ? 'international' : payload.tingkat === 'nasional' ? 'national' : 'local';
  const year = Number(payload.year || record.tahun_pelaporan);
  data.by_category = Array.isArray(data.by_category) ? data.by_category : [];
  incrementArrayRow(data.by_category, 'category', category, { label: category.replace(/_/g, ' ') }, 'count');
  data.by_type = Array.isArray(data.by_type) ? data.by_type : [];
  incrementArrayRow(data.by_type, 'type', type, { label: type === 'academic' ? 'Akademik' : 'Non Akademik' }, 'count');
  data.by_year = Array.isArray(data.by_year) ? data.by_year : [];
  incrementArrayRow(data.by_year, 'year', year, {}, 'count');
  const breakdownKey = type === 'academic' ? 'academic_breakdown' : 'non_academic_breakdown';
  data[breakdownKey] = data[breakdownKey] || { local: 0, national: 0, international: 0 };
  data[breakdownKey][level] = Number(data[breakdownKey][level] || 0) + 1;
  data.total = Number(data.total || 0) + 1;
}

export function overlayDemoInsightStats(
  productionResponse: AnyRecord,
  journal: SandboxJournalEntry[],
  params: AnyRecord = {}
): AnyRecord {
  const response = clone(productionResponse);
  const data = responseData(response);
  const section = String(params.section || '');
  const records = createdPayloads(journal, 'chart_records').filter((record) => chartRecordMatches(record, section, params));
  for (const record of records) {
    if (section === 'study_period') applyStudyPeriod(data, record);
    else if (section === 'waiting_time') applyWaitingTime(data, record);
    else if (section === 'work_coverage') applyWorkCoverage(data, record);
    else if (section === 'user_satisfaction') applyUserSatisfaction(data, record);
    else if (section === 'publications') applyPublications(data, record);
    else if (section === 'student_products') applyStudentProducts(data, record);
    else if (section === 'research_outputs') applyResearchOutputs(data, record);
    else if (section === 'student_achievements') applyStudentAchievement(data, record);
  }

  if (section === 'active_students') {
    overlayActiveStudentStatsData(data, journal, params);
  }
  if (response.meta) response.meta.last_synced_at = new Date().toISOString();
  return response;
}

export function overlayDemoAchievementStats(
  productionResponse: AnyRecord,
  journal: SandboxJournalEntry[],
  params: AnyRecord = {}
): AnyRecord {
  const response = clone(productionResponse);
  const data = responseData(response);
  const records = createdPayloads(journal, 'chart_records')
    .filter((record) => chartRecordMatches(record, 'student_achievements', { ...params, section: 'student_achievements' }));
  for (const record of records) applyStudentAchievement(data, record);
  return response;
}

function overlayActiveStudentStatsData(data: AnyRecord, journal: SandboxJournalEntry[], params: AnyRecord): void {
  const stats = createdPayloads(journal, 'active_students_stats')
    .filter((item) => !params?.year || Number(params.year) === Number(item.tahun));
  data.by_year = Array.isArray(data.by_year) ? data.by_year : [];
  for (const stat of stats) {
    const year = Number(stat.tahun);
    let row = data.by_year.find((item: AnyRecord) => Number(item.year) === year);
    if (!row) {
      row = { year, genap_aktif: 0, genap_pd_dikti: 0, ganjil_aktif: 0, ganjil_pd_dikti: 0 };
      data.by_year.push(row);
    }
    row[`${stat.semester}_aktif`] = Number(stat.aktif || 0);
    row[`${stat.semester}_pd_dikti`] = Number(stat.pd_dikti || 0);
  }
  data.by_year.sort((a: AnyRecord, b: AnyRecord) => a.year - b.year);
  data.total = data.by_year.reduce((sum: number, row: AnyRecord) => sum + Number(row.genap_aktif || 0) + Number(row.ganjil_aktif || 0), 0);
}

export function overlayDemoActiveStudentRows(
  productionResponse: AnyRecord,
  journal: SandboxJournalEntry[],
  params: AnyRecord = {}
): AnyRecord {
  const response = clone(productionResponse);
  const wrapper = responseData(response);
  const baseRows = Array.isArray(wrapper) ? wrapper : Array.isArray(wrapper.data) ? wrapper.data : [];
  const map = new Map(baseRows.map((item: AnyRecord) => [`${item.tahun}:${item.semester}`, item]));
  for (const stat of createdPayloads(journal, 'active_students_stats')) {
    if (!params?.year || Number(params.year) === Number(stat.tahun)) map.set(`${stat.tahun}:${stat.semester}`, stat);
  }
  const rows = Array.from(map.values()).sort((a, b) => Number(a.tahun) - Number(b.tahun));
  if (Array.isArray(wrapper)) {
    if (response.data) response.data = rows;
    else return rows as unknown as AnyRecord;
  } else wrapper.data = rows;
  return response;
}

export function overlayDemoDosenData(productionResponse: AnyRecord, journal: SandboxJournalEntry[]): AnyRecord {
  const response = clone(productionResponse);
  const data = responseData(response);
  if (!data || typeof data !== 'object') return response;

  const masters = createdPayloads(journal, 'dosen_master');
  const teaching = new Map(createdPayloads(journal, 'dosen_pengajaran').map((item) => [item.nidn, item]));
  const research = new Map(createdPayloads(journal, 'dosen_penelitian').map((item) => [item.nidn, item]));
  const service = new Map(createdPayloads(journal, 'dosen_pengabdian').map((item) => [item.nidn, item]));
  const workload = new Map(createdPayloads(journal, 'dosen_waktu_mengajar').map((item) => [item.nidn, item]));
  const outputs = new Map(createdPayloads(journal, 'dosen_luaran').map((item) => [item.nidn, item]));

  data.dosenList = [...masters, ...(Array.isArray(data.dosenList) ? data.dosenList : [])];
  data.kontribusiPengajaranList = [
    ...masters.map((master) => teaching.get(master.nidn) || ({ nidn: master.nidn, nama: master.nama, avatarColor: master.avatarColor, matkulABT: [], matkulPSLain: [], bahanAjar: [], bimbingan: { psABT: { ps: 0, ps1: 0, ps2: 0 }, psLain: { ps: 0, ps1: 0, ps2: 0 } }, rataBimbingan: 0, rekognisi: [] })),
    ...(Array.isArray(data.kontribusiPengajaranList) ? data.kontribusiPengajaranList : []),
  ];
  data.kontribusiPenelitianList = [
    ...masters.map((master) => research.get(master.nidn) || ({ nidn: master.nidn, nama: master.nama, avatarColor: master.avatarColor, penelitian: [], rekognisi: [] })),
    ...(Array.isArray(data.kontribusiPenelitianList) ? data.kontribusiPenelitianList : []),
  ];
  data.kontribusiPengabdianList = [
    ...masters.map((master) => service.get(master.nidn) || ({ nidn: master.nidn, nama: master.nama, avatarColor: master.avatarColor, pkm: [], rekognisi: [] })),
    ...(Array.isArray(data.kontribusiPengabdianList) ? data.kontribusiPengabdianList : []),
  ];
  data.waktuMengajarList = [
    ...masters.map((master) => workload.get(master.nidn) || ({ nidn: master.nidn, nama: master.nama, avatarColor: master.avatarColor, jabatan: master.jabatan, statusDosen: master.statusDosen, tahunAkademik: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`, sksPendidikanPS: 0, sksPendidikanPSLain: 0, sksPendidikanPTLain: 0, sksPenelitian: 0, sksPengabdian: 0, sksTugasTambahan: 0 })),
    ...(Array.isArray(data.waktuMengajarList) ? data.waktuMengajarList : []),
  ];
  data.luaranList = [
    ...masters.map((master) => outputs.get(master.nidn) || ({ nidn: master.nidn, nama: master.nama, avatarColor: master.avatarColor, luaran: [] })),
    ...(Array.isArray(data.luaranList) ? data.luaranList : []),
  ];
  data.tendikList = [...createdPayloads(journal, 'tendik'), ...(Array.isArray(data.tendikList) ? data.tendikList : [])];
  return response;
}
