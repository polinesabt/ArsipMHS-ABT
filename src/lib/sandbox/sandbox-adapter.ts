/**
 * Demo Sandbox Adapter
 * Intercepts mutations in Demo Mode, produces realistic simulated responses,
 * maintains local journal entries and tombstones, and applies overlays to GET responses.
 */

import { generateDemoId, isDemoId } from './sandbox-id';
import {
  addJournalEntry,
  addTombstone,
  clearJournal,
  getBlob,
  getJournal,
  getMetadata,
  getSnapshot,
  getTombstoneSet,
  removeJournalEntriesForRecord,
  removeJournalEntry,
  removeTombstone,
  saveBlob,
  saveSnapshot,
  setMetadata,
} from './sandbox-db';
import type {
  SandboxJournalEntry,
  SandboxResource,
} from './sandbox-types';
import { sandboxSession } from './sandbox-session';

export interface SimulatedApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  [key: string]: any;
}

export async function isDemoModeActive(): Promise<boolean> {
  return sandboxSession.isDemoActive();
}

// ================= Mutation Interceptor =================

export async function handleSandboxMutation(
  endpoint: string,
  body: any,
  options?: any
): Promise<SimulatedApiResponse> {
  const sid = sandboxSession.getSid();
  if (!sid) {
    return {
      success: false,
      error: 'Sesi Demo Mode tidak aktif.',
      code: 'DEMO_SESSION_INACTIVE',
    };
  }

  const cleanEndpoint = endpoint.replace(/^\/+/, '').split('?')[0];

  try {
    // 1. STUDENTS
    if (cleanEndpoint === 'students/create.php') {
      return await handleStudentCreate(sid, body);
    }
    if (cleanEndpoint === 'students/update.php') {
      return await handleStudentUpdate(sid, body);
    }
    if (cleanEndpoint === 'students/delete.php') {
      return await handleStudentDelete(sid, body);
    }
    if (cleanEndpoint === 'students/delete_batch.php') {
      return await handleStudentDeleteBatch(sid, body);
    }
    if (cleanEndpoint === 'students/recover.php') {
      return await handleStudentRecover(sid, body);
    }
    if (cleanEndpoint === 'students/recover_batch.php') {
      return await handleStudentRecoverBatch(sid, body);
    }
    if (cleanEndpoint === 'students/permanent_delete.php') {
      return await handleStudentPermanentDelete(sid, body);
    }
    if (cleanEndpoint === 'students/permanent_delete_batch.php') {
      return await handleStudentPermanentDeleteBatch(sid, body);
    }
    if (cleanEndpoint === 'students/reset_password.php' || cleanEndpoint === 'students/reset_password_batch.php') {
      return { success: true, message: 'Password berhasil direset (simulasi Demo Mode)' };
    }

    // 2. TRACER STUDY
    if (cleanEndpoint === 'tracer/create.php') {
      return await handleTracerCreate(sid, body);
    }
    if (cleanEndpoint === 'tracer/update.php') {
      return await handleTracerUpdate(sid, body);
    }
    if (cleanEndpoint === 'tracer/delete.php') {
      return await handleTracerDelete(sid, body);
    }

    // 3. ACHIEVEMENTS
    if (cleanEndpoint === 'achievements/create.php') {
      return await handleAchievementCreate(sid, body);
    }
    if (cleanEndpoint === 'achievements/update.php') {
      return await handleAchievementUpdate(sid, body);
    }
    if (cleanEndpoint === 'achievements/delete.php') {
      return await handleAchievementDelete(sid, body);
    }
    if (cleanEndpoint === 'achievements/attachments/delete.php') {
      return await handleAttachmentDelete(sid, body, options);
    }
    if (cleanEndpoint === 'achievements/attachments/recover.php') {
      return await handleAttachmentRecover(sid, body);
    }
    if (cleanEndpoint === 'achievements/attachments/permanent_delete.php') {
      return await handleAttachmentPermanentDelete(sid, body);
    }
    if (cleanEndpoint === 'achievements/import/upload.php') {
      return await handleAchievementImportUpload(sid, body);
    }

    // 4. CHART RECORDS
    if (cleanEndpoint === 'chart-records/update.php') {
      return await handleChartRecordUpdate(sid, body);
    }
    if (cleanEndpoint === 'chart-records/delete.php') {
      return await handleChartRecordDelete(sid, body);
    }
    if (cleanEndpoint === 'chart-records/recovery.php') {
      return await handleChartRecordRecovery(sid, body);
    }
    if (cleanEndpoint === 'chart-records/permanent-delete.php') {
      return await handleChartRecordPermanentDelete(sid, body);
    }

    // 5. ACTIVE STUDENTS STATS & INSIGHT SYNC
    if (cleanEndpoint === 'insight/active_students_semester.php') {
      return await handleActiveStudentsSemesterMutation(sid, body, options);
    }
    if (cleanEndpoint === 'insight/sync.php') {
      return await handleInsightSync(sid, body);
    }

    // 6. EVALUATIONS
    if (cleanEndpoint === 'evaluations/create.php') {
      return await handleEvaluationCreate(sid, body);
    }
    if (cleanEndpoint === 'evaluations/close.php') {
      return await handleEvaluationClose(sid, body);
    }
    if (cleanEndpoint === 'evaluations/delete.php') {
      return await handleEvaluationDelete(sid, body);
    }
    if (cleanEndpoint === 'evaluations/recover.php') {
      return await handleEvaluationRecover(sid, body);
    }
    if (cleanEndpoint === 'evaluations/permanent_delete.php') {
      return await handleEvaluationPermanentDelete(sid, body);
    }
    if (cleanEndpoint === 'evaluations/send_notifications.php') {
      return { success: true, count: 5, sent_emails: 5, message: 'Simulasi notifikasi berhasil dikirim (Demo Mode)' };
    }

    // 7. SATISFACTION FORMS
    if (cleanEndpoint === 'satisfaction-forms/create.php') {
      return await handleSatisfactionFormCreate(sid, body);
    }
    if (cleanEndpoint === 'satisfaction-forms/update.php') {
      return await handleSatisfactionFormUpdate(sid, body);
    }
    if (cleanEndpoint === 'satisfaction-forms/delete.php') {
      return await handleSatisfactionFormDelete(sid, body);
    }
    if (cleanEndpoint === 'satisfaction-forms/recover.php') {
      return await handleSatisfactionFormRecover(sid, body);
    }
    if (cleanEndpoint === 'satisfaction-forms/permanent_delete.php') {
      return await handleSatisfactionFormPermanentDelete(sid, body);
    }
    if (cleanEndpoint === 'satisfaction-forms/set_active.php') {
      return await handleSatisfactionFormSetActive(sid, body);
    }

    // 8. DOSEN & TENDIK
    if (cleanEndpoint === 'dosen/save.php') {
      return await handleDosenSave(sid, body);
    }
    if (cleanEndpoint === 'dosen/import/upload.php') {
      return { success: true, summary: { total_rows: 3, inserted: 3, skipped: 0, failed: 0, affected_dosen: 3, details: [] } };
    }

    // 9. ADMINS & SETTINGS & LOGS
    if (cleanEndpoint === 'admins/create.php') {
      return await handleAdminCreate(sid, body);
    }
    if (cleanEndpoint === 'admins/update_permissions.php') {
      return await handleAdminUpdatePermissions(sid, body);
    }
    if (cleanEndpoint === 'admins/delete.php') {
      return await handleAdminDelete(sid, body, options);
    }
    if (cleanEndpoint === 'settings/update_setting.php') {
      return await handleSettingsUpdate(sid, body);
    }
    if (cleanEndpoint === 'logs/clear_error_logs.php') {
      await setMetadata(sid, 'error_logs_cleared', true);
      return { success: true, message: 'Semua riwayat log error berhasil dibersihkan (Demo Mode)' };
    }
    if (cleanEndpoint === 'logs/log_error.php') {
      return { success: true, message: 'Error log disimulasikan (Demo Mode)' };
    }

    // Default simulated success
    return { success: true, message: 'Operasi disimulasikan di cache Demo Mode.' };
  } catch (err: any) {
    const errorMsg = err?.message || 'Gagal menyimpan perubahan ke cache demo';
    return {
      success: false,
      error: errorMsg,
      code: err?.code || 'DEMO_CACHE_ERROR',
    };
  }
}

// ================= File Upload Interceptor =================

export async function handleSandboxFileUpload(
  endpoint: string,
  formData: FormData
): Promise<SimulatedApiResponse> {
  const sid = sandboxSession.getSid();
  if (!sid) {
    return { success: false, error: 'Sesi Demo Mode tidak aktif.', code: 'DEMO_SESSION_INACTIVE' };
  }

  const cleanEndpoint = endpoint.replace(/^\/+/, '').split('?')[0];

  try {
    if (cleanEndpoint === 'achievements/attachments/upload.php') {
      const file = formData.get('file') as File | null;
      const achievementId = String(formData.get('achievement_id') || '');
      if (!file || !achievementId) {
        return { success: false, error: 'File dan achievement_id wajib diisi.' };
      }

      const id = generateDemoId('att');
      await saveBlob(sid, id, file, file.name, file.type);

      const attachmentItem = {
        id,
        achievement_id: achievementId,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        file_path: `demo-blob://${id}`,
        file_url: URL.createObjectURL(file),
        uploaded_by_role: 'demo',
        created_at: new Date().toISOString(),
      };

      await addJournalEntry(sid, {
        operation: 'create',
        resource: 'attachments',
        recordId: id,
        payload: attachmentItem,
      });

      return {
        success: true,
        data: attachmentItem,
        message: 'Lampiran berhasil diunggah (Demo Mode)',
      };
    }

    if (cleanEndpoint === 'achievements/import/upload.php') {
      return await handleAchievementImportUpload(sid, formData);
    }

    if (cleanEndpoint === 'evaluations/upload_attachment.php') {
      const file = formData.get('file') as File | null;
      const token = String(formData.get('token') || '');
      const id = generateDemoId('ev-att');
      if (file) {
        await saveBlob(sid, id, file, file.name, file.type);
      }
      return { success: true, message: 'Lampiran berhasil diunggah (Demo Mode)', data: { id, token } };
    }

    if (cleanEndpoint === 'dosen/import/upload.php') {
      return { success: true, summary: { total_rows: 3, inserted: 3, skipped: 0, failed: 0, affected_dosen: 3, details: [] } };
    }

    return { success: true, message: 'Upload disimulasikan di Demo Mode.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal menyimpan file ke cache demo', code: 'DEMO_CACHE_ERROR' };
  }
}

// ================= Individual Handlers =================

async function handleStudentCreate(sid: string, body: any): Promise<SimulatedApiResponse> {
  const nim = String(body.nim || '').trim();
  const nama = String(body.nama || '').trim();
  if (!nim || !nama) {
    return { success: false, error: 'NIM dan nama wajib diisi.' };
  }

  // Check unique key collision in local journal
  const journal = await getJournal(sid, 'students');
  const existingInJournal = journal.find(
    (j) => j.operation === 'create' && (j.uniqueKeys?.nim === nim || j.payload?.nim === nim)
  );
  if (existingInJournal) {
    return { success: false, error: 'NIM sudah terdaftar di cache sesi demo.' };
  }

  const id = generateDemoId('stu');
  const student = {
    id,
    nim,
    nama,
    jurusan: body.jurusan || 'Administrasi Bisnis',
    prodi: body.prodi || 'Administrasi Bisnis Terapan',
    status: body.status || 'active',
    status_mode: body.status_mode || 'auto',
    status_effective: body.status || 'active',
    tahun_masuk: Number(body.tahun_masuk) || new Date().getFullYear(),
    tahun_lulus: body.tahun_lulus ? Number(body.tahun_lulus) : null,
    email: body.email || null,
    no_hp: body.no_hp || null,
    alamat: body.alamat || null,
    has_credentials: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await addJournalEntry(sid, {
    operation: 'create',
    resource: 'students',
    recordId: id,
    payload: student,
    uniqueKeys: { nim },
  });

  return {
    success: true,
    id,
    data: student,
    message: 'Mahasiswa berhasil ditambahkan (Demo Mode)',
  };
}

async function handleStudentUpdate(sid: string, body: any): Promise<SimulatedApiResponse> {
  const studentId = String(body.id || '').trim();
  if (!studentId) {
    return { success: false, error: 'id diperlukan' };
  }

  await addJournalEntry(sid, {
    operation: 'update',
    resource: 'students',
    recordId: studentId,
    patch: { ...body, updated_at: new Date().toISOString() },
  });

  return {
    success: true,
    message: 'Data mahasiswa berhasil diperbarui (Demo Mode)',
    data: body,
  };
}

async function handleStudentDelete(sid: string, body: any): Promise<SimulatedApiResponse> {
  const studentId = String(body.id || '').trim();
  if (!studentId) return { success: false, error: 'id diperlukan' };

  if (isDemoId(studentId)) {
    await removeJournalEntriesForRecord(sid, 'students', studentId);
  } else {
    await addTombstone(sid, { resource: 'students', recordId: studentId, isPermanent: false });
    await addJournalEntry(sid, {
      operation: 'delete',
      resource: 'students',
      recordId: studentId,
    });
  }

  return { success: true, message: 'Mahasiswa berhasil dipindahkan ke Recycle Bin (Demo Mode)' };
}

async function handleStudentDeleteBatch(sid: string, body: any): Promise<SimulatedApiResponse> {
  const ids: string[] = Array.isArray(body.ids) ? body.ids : [];
  for (const id of ids) {
    await handleStudentDelete(sid, { id });
  }
  return { success: true, message: `Berhasil memindahkan ${ids.length} mahasiswa ke Recycle Bin (Demo Mode)` };
}

async function handleStudentRecover(sid: string, body: any): Promise<SimulatedApiResponse> {
  const studentId = String(body.id || '').trim();
  if (!studentId) return { success: false, error: 'id diperlukan' };

  await removeTombstone(sid, 'students', studentId);
  await addJournalEntry(sid, {
    operation: 'recover',
    resource: 'students',
    recordId: studentId,
  });

  return { success: true, message: 'Mahasiswa berhasil dipulihkan (Demo Mode)' };
}

async function handleStudentRecoverBatch(sid: string, body: any): Promise<SimulatedApiResponse> {
  const ids: string[] = Array.isArray(body.ids) ? body.ids : [];
  for (const id of ids) {
    await handleStudentRecover(sid, { id });
  }
  return { success: true, message: `Berhasil memulihkan ${ids.length} mahasiswa (Demo Mode)` };
}

async function handleStudentPermanentDelete(sid: string, body: any): Promise<SimulatedApiResponse> {
  const studentId = String(body.id || '').trim();
  if (!studentId) return { success: false, error: 'id diperlukan' };

  if (isDemoId(studentId)) {
    await removeJournalEntriesForRecord(sid, 'students', studentId);
  } else {
    await addTombstone(sid, { resource: 'students', recordId: studentId, isPermanent: true });
    await addJournalEntry(sid, {
      operation: 'permanent_delete',
      resource: 'students',
      recordId: studentId,
    });
  }

  return { success: true, message: 'Mahasiswa berhasil dihapus permanen (Demo Mode)' };
}

async function handleStudentPermanentDeleteBatch(sid: string, body: any): Promise<SimulatedApiResponse> {
  const ids: string[] = Array.isArray(body.ids) ? body.ids : [];
  for (const id of ids) {
    await handleStudentPermanentDelete(sid, { id });
  }
  return { success: true, message: `Berhasil menghapus permanen ${ids.length} mahasiswa (Demo Mode)` };
}

async function handleTracerCreate(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = generateDemoId('trc');
  const tracerItem = {
    id,
    ...body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await addJournalEntry(sid, {
    operation: 'create',
    resource: 'tracer',
    recordId: id,
    payload: tracerItem,
  });

  return { success: true, id, data: tracerItem, message: 'Tracer study berhasil dibuat (Demo Mode)' };
}

async function handleTracerUpdate(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = String(body.id || '').trim();
  if (!id) return { success: false, error: 'id diperlukan' };

  await addJournalEntry(sid, {
    operation: 'update',
    resource: 'tracer',
    recordId: id,
    patch: { ...body, updated_at: new Date().toISOString() },
  });

  return { success: true, message: 'Tracer study berhasil diperbarui (Demo Mode)' };
}

async function handleTracerDelete(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = String(body.id || '').trim();
  if (!id) return { success: false, error: 'id diperlukan' };

  if (isDemoId(id)) {
    await removeJournalEntriesForRecord(sid, 'tracer', id);
  } else {
    await addTombstone(sid, { resource: 'tracer', recordId: id, isPermanent: false });
  }

  return { success: true, message: 'Tracer study berhasil dihapus (Demo Mode)' };
}

async function handleAchievementCreate(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = generateDemoId('ach');
  const achievementItem = {
    id,
    ...body,
    verified: body.verified ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await addJournalEntry(sid, {
    operation: 'create',
    resource: 'achievements',
    recordId: id,
    payload: achievementItem,
  });

  return {
    success: true,
    data: achievementItem,
    message: 'Prestasi berhasil ditambahkan (Demo Mode)',
  };
}

async function handleAchievementUpdate(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = String(body.id || '').trim();
  if (!id) return { success: false, error: 'id diperlukan' };

  await addJournalEntry(sid, {
    operation: 'update',
    resource: 'achievements',
    recordId: id,
    patch: { ...body, updated_at: new Date().toISOString() },
  });

  return { success: true, data: body, message: 'Prestasi berhasil diperbarui (Demo Mode)' };
}

async function handleAchievementDelete(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = String(body.id || '').trim();
  if (!id) return { success: false, error: 'id diperlukan' };

  if (isDemoId(id)) {
    await removeJournalEntriesForRecord(sid, 'achievements', id);
  } else {
    await addTombstone(sid, { resource: 'achievements', recordId: id, isPermanent: false });
  }

  return { success: true, message: 'Prestasi berhasil dipindahkan ke Recycle Bin (Demo Mode)' };
}

async function handleAttachmentDelete(sid: string, body: any, options?: any): Promise<SimulatedApiResponse> {
  const id = String(body?.attachment_id || options?.params?.id || '').trim();
  if (!id) return { success: false, error: 'attachment_id diperlukan' };

  if (isDemoId(id)) {
    await removeJournalEntriesForRecord(sid, 'attachments', id);
  } else {
    await addTombstone(sid, { resource: 'attachments', recordId: id, isPermanent: false });
  }
  return { success: true, message: 'Lampiran berhasil dihapus (Demo Mode)' };
}

async function handleAttachmentRecover(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = String(body?.id || body?.attachment_id || '').trim();
  if (!id) return { success: false, error: 'id diperlukan' };

  await removeTombstone(sid, 'attachments', id);
  return { success: true, message: 'Lampiran berhasil dipulihkan (Demo Mode)' };
}

async function handleAttachmentPermanentDelete(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = String(body?.id || body?.attachment_id || '').trim();
  if (!id) return { success: false, error: 'id diperlukan' };

  if (isDemoId(id)) {
    await removeJournalEntriesForRecord(sid, 'attachments', id);
  } else {
    await addTombstone(sid, { resource: 'attachments', recordId: id, isPermanent: true });
  }
  return { success: true, message: 'Lampiran berhasil dihapus permanen (Demo Mode)' };
}

async function handleAchievementImportUpload(sid: string, bodyOrFormData: any): Promise<SimulatedApiResponse> {
  // Simulate 3 imported records locally
  const dummyImports = [
    {
      id: generateDemoId('ach-imp'),
      student_id: 'mock-stu-1',
      title: 'Juara 1 Lomba Bisnis Nasional (Impor Demo)',
      category: 'kompetisi',
      subcategory: 'nasional',
      level: 'nasional',
      peringkat: 'Juara 1',
      tanggal: new Date().toISOString().split('T')[0],
      tahun: new Date().getFullYear(),
      verified: true,
      created_at: new Date().toISOString(),
    },
    {
      id: generateDemoId('ach-imp'),
      student_id: 'mock-stu-2',
      title: 'Publikasi Jurnal Sinta 2 (Impor Demo)',
      category: 'rekognisi',
      subcategory: 'publikasi_jurnal',
      level: 'nasional',
      peringkat: 'Author',
      tanggal: new Date().toISOString().split('T')[0],
      tahun: new Date().getFullYear(),
      verified: true,
      created_at: new Date().toISOString(),
    },
  ];

  for (const item of dummyImports) {
    await addJournalEntry(sid, {
      operation: 'create',
      resource: 'achievements',
      recordId: item.id,
      payload: item,
    });
  }

  return {
    success: true,
    summary: {
      total_rows: dummyImports.length,
      inserted: dummyImports.length,
      skipped: 0,
      failed: 0,
      details: dummyImports.map((item, idx) => ({
        row_number: idx + 2,
        identity_raw: item.title,
        status: 'inserted',
        message: 'Baris berhasil diimpor ke cache demo',
      })),
    },
  };
}

async function handleChartRecordUpdate(sid: string, body: any): Promise<SimulatedApiResponse> {
  const recordId = String(body.record_id || '').trim();
  const section = String(body.section || '').trim();
  if (!recordId || !section) {
    return { success: false, error: 'record_id dan section wajib diisi.' };
  }

  await addJournalEntry(sid, {
    operation: 'update',
    resource: 'chart_records',
    recordId,
    patch: { ...body, updated_at: new Date().toISOString() },
  });

  return { success: true, message: 'Chart record berhasil diperbarui (Demo Mode)' };
}

async function handleChartRecordDelete(sid: string, body: any): Promise<SimulatedApiResponse> {
  const recordId = String(body.record_id || '').trim();
  if (!recordId) return { success: false, error: 'record_id diperlukan' };

  if (isDemoId(recordId)) {
    await removeJournalEntriesForRecord(sid, 'chart_records', recordId);
  } else {
    await addTombstone(sid, { resource: 'chart_records', recordId, isPermanent: false });
  }

  return { success: true, message: 'Record dipindahkan ke Recycle Bin (Demo Mode)' };
}

async function handleChartRecordRecovery(sid: string, body: any): Promise<SimulatedApiResponse> {
  const recordId = String(body.record_id || '').trim();
  if (!recordId) return { success: false, error: 'record_id diperlukan' };

  await removeTombstone(sid, 'chart_records', recordId);
  return { success: true, message: 'Record berhasil dipulihkan (Demo Mode)' };
}

async function handleChartRecordPermanentDelete(sid: string, body: any): Promise<SimulatedApiResponse> {
  const recordId = String(body.record_id || '').trim();
  if (!recordId) return { success: false, error: 'record_id diperlukan' };

  if (isDemoId(recordId)) {
    await removeJournalEntriesForRecord(sid, 'chart_records', recordId);
  } else {
    await addTombstone(sid, { resource: 'chart_records', recordId, isPermanent: true });
  }

  return { success: true, message: 'Record berhasil dihapus permanen (Demo Mode)' };
}

async function handleActiveStudentsSemesterMutation(sid: string, body: any, options?: any): Promise<SimulatedApiResponse> {
  const tahun = Number(body?.tahun || options?.params?.tahun);
  const semester = String(body?.semester || options?.params?.semester || '');
  const id = `stat-${tahun}-${semester}`;

  if (options?.method === 'DELETE') {
    await addTombstone(sid, { resource: 'active_students_stats', recordId: id, isPermanent: false });
    return { success: true, deleted: true, message: 'Statistik semester dihapus (Demo Mode)' };
  }

  const item = {
    tahun,
    semester,
    pd_dikti: Number(body.pd_dikti) || 0,
    aktif: body.aktif !== undefined ? Number(body.aktif) : 100,
  };

  await addJournalEntry(sid, {
    operation: 'create',
    resource: 'active_students_stats',
    recordId: id,
    payload: item,
  });

  return { success: true, data: item, message: 'Statistik semester berhasil disimpan (Demo Mode)' };
}

async function handleInsightSync(sid: string, body: any): Promise<SimulatedApiResponse> {
  await setMetadata(sid, 'last_synced_at', Date.now());
  return { success: true, message: 'Sinkronisasi data grafik berhasil disimulasikan (Demo Mode)' };
}

async function handleEvaluationCreate(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = generateDemoId('eval');
  const evaluation = {
    id,
    ...body,
    status: body.status || 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await addJournalEntry(sid, {
    operation: 'create',
    resource: 'evaluations',
    recordId: id,
    payload: evaluation,
  });

  return { success: true, data: evaluation, message: 'Evaluasi berhasil dibuat (Demo Mode)' };
}

async function handleEvaluationClose(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = String(body.id || '').trim();
  if (!id) return { success: false, error: 'id diperlukan' };

  await addJournalEntry(sid, {
    operation: 'update',
    resource: 'evaluations',
    recordId: id,
    patch: { status: 'closed', updated_at: new Date().toISOString() },
  });

  return { success: true, message: 'Evaluasi berhasil ditutup (Demo Mode)' };
}

async function handleEvaluationDelete(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = String(body.id || '').trim();
  if (!id) return { success: false, error: 'id diperlukan' };

  if (isDemoId(id)) {
    await removeJournalEntriesForRecord(sid, 'evaluations', id);
  } else {
    await addTombstone(sid, { resource: 'evaluations', recordId: id, isPermanent: false });
  }

  return { success: true, message: 'Evaluasi dipindahkan ke Recycle Bin (Demo Mode)' };
}

async function handleEvaluationRecover(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = String(body.id || '').trim();
  if (!id) return { success: false, error: 'id diperlukan' };

  await removeTombstone(sid, 'evaluations', id);
  return { success: true, message: 'Evaluasi berhasil dipulihkan (Demo Mode)' };
}

async function handleEvaluationPermanentDelete(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = String(body.id || '').trim();
  if (!id) return { success: false, error: 'id diperlukan' };

  if (isDemoId(id)) {
    await removeJournalEntriesForRecord(sid, 'evaluations', id);
  } else {
    await addTombstone(sid, { resource: 'evaluations', recordId: id, isPermanent: true });
  }

  return { success: true, message: 'Evaluasi berhasil dihapus permanen (Demo Mode)' };
}

async function handleSatisfactionFormCreate(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = generateDemoId('form');
  const item = {
    id,
    ...body,
    is_active: false,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await addJournalEntry(sid, {
    operation: 'create',
    resource: 'satisfaction_forms',
    recordId: id,
    payload: item,
  });

  return { success: true, data: item, message: 'Template formulir berhasil dibuat (Demo Mode)' };
}

async function handleSatisfactionFormUpdate(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = String(body.id || '').trim();
  if (!id) return { success: false, error: 'id diperlukan' };

  await addJournalEntry(sid, {
    operation: 'update',
    resource: 'satisfaction_forms',
    recordId: id,
    patch: { ...body, updated_at: new Date().toISOString() },
  });

  return { success: true, message: 'Template formulir berhasil diperbarui (Demo Mode)' };
}

async function handleSatisfactionFormDelete(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = String(body.id || '').trim();
  if (!id) return { success: false, error: 'id diperlukan' };

  if (isDemoId(id)) {
    await removeJournalEntriesForRecord(sid, 'satisfaction_forms', id);
  } else {
    await addTombstone(sid, { resource: 'satisfaction_forms', recordId: id, isPermanent: false });
  }

  return { success: true, message: 'Template formulir berhasil dihapus (Demo Mode)' };
}

async function handleSatisfactionFormRecover(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = String(body.id || '').trim();
  if (!id) return { success: false, error: 'id diperlukan' };

  await removeTombstone(sid, 'satisfaction_forms', id);
  return { success: true, message: 'Template formulir berhasil dipulihkan (Demo Mode)' };
}

async function handleSatisfactionFormPermanentDelete(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = String(body.id || '').trim();
  if (!id) return { success: false, error: 'id diperlukan' };

  if (isDemoId(id)) {
    await removeJournalEntriesForRecord(sid, 'satisfaction_forms', id);
  } else {
    await addTombstone(sid, { resource: 'satisfaction_forms', recordId: id, isPermanent: true });
  }

  return { success: true, message: 'Template formulir berhasil dihapus permanen (Demo Mode)' };
}

async function handleSatisfactionFormSetActive(sid: string, body: any): Promise<SimulatedApiResponse> {
  const templateId = String(body.template_id || '').trim();
  if (!templateId) return { success: false, error: 'template_id diperlukan' };

  await addJournalEntry(sid, {
    operation: 'update',
    resource: 'satisfaction_forms',
    recordId: templateId,
    patch: { is_active: true, updated_at: new Date().toISOString() },
  });

  return { success: true, message: 'Template aktif berhasil diatur (Demo Mode)' };
}

async function handleDosenSave(sid: string, body: any): Promise<SimulatedApiResponse> {
  const action = body.action || 'update';
  const nidn = body.nidn || body.data?.nidn || 'dosen-item';

  await addJournalEntry(sid, {
    operation: action === 'create' ? 'create' : 'update',
    resource: 'dosen',
    recordId: nidn,
    payload: body.data || body,
    patch: body.data || body,
  });

  return { success: true, message: 'Data dosen berhasil disimpan (Demo Mode)' };
}

async function handleAdminCreate(sid: string, body: any): Promise<SimulatedApiResponse> {
  const username = String(body.username || '').trim();
  const nama = String(body.nama || body.name || '').trim();
  if (!username || !nama) return { success: false, error: 'Username dan nama wajib diisi' };

  const id = generateDemoId('adm');
  const adminItem = {
    id,
    username,
    nama,
    role: 'admin',
    is_active: true,
    can_edit_dosen: body.can_edit_dosen ?? true,
    can_edit_mahasiswa: body.can_edit_mahasiswa ?? true,
    created_at: new Date().toISOString(),
  };

  await addJournalEntry(sid, {
    operation: 'create',
    resource: 'admins',
    recordId: id,
    payload: adminItem,
    uniqueKeys: { username },
  });

  return { success: true, data: adminItem, message: 'Akun admin berhasil dibuat (Demo Mode)' };
}

async function handleAdminUpdatePermissions(sid: string, body: any): Promise<SimulatedApiResponse> {
  const id = String(body.id || '').trim();
  if (!id) return { success: false, error: 'ID admin wajib diisi' };

  await addJournalEntry(sid, {
    operation: 'update',
    resource: 'admins',
    recordId: id,
    patch: {
      can_edit_dosen: body.can_edit_dosen,
      can_edit_mahasiswa: body.can_edit_mahasiswa,
      updated_at: new Date().toISOString(),
    },
  });

  return { success: true, message: 'Perizinan admin berhasil diperbarui (Demo Mode)' };
}

async function handleAdminDelete(sid: string, body: any, options?: any): Promise<SimulatedApiResponse> {
  const id = String(body?.id || options?.params?.id || '').trim();
  if (!id) return { success: false, error: 'ID admin wajib diisi' };

  if (isDemoId(id)) {
    await removeJournalEntriesForRecord(sid, 'admins', id);
  } else {
    await addTombstone(sid, { resource: 'admins', recordId: id, isPermanent: true });
  }

  return { success: true, message: 'Akun admin berhasil dihapus (Demo Mode)' };
}

async function handleSettingsUpdate(sid: string, body: any): Promise<SimulatedApiResponse> {
  const key = String(body.key || '').trim();
  const value = String(body.value || '');
  if (!key) return { success: false, error: 'Key diperlukan' };

  await setMetadata(sid, `setting_${key}`, value);
  await addJournalEntry(sid, {
    operation: 'update',
    resource: 'settings',
    recordId: key,
    patch: { [key]: value },
  });

  return { success: true, message: 'Pengaturan berhasil diperbarui (Demo Mode)' };
}

// ================= GET Overlay Applier =================

export async function applySandboxOverlay<T = any>(
  endpoint: string,
  productionData: T,
  options?: any
): Promise<T> {
  const sid = sandboxSession.getSid();
  if (!sid || !productionData) return productionData;

  const cleanEndpoint = endpoint.replace(/^\/+/, '').split('?')[0];

  try {
    // 1. STUDENTS
    if (cleanEndpoint === 'students/list.php' || cleanEndpoint === 'students/all.php') {
      return (await overlayStudentsList(sid, productionData)) as unknown as T;
    }
    if (cleanEndpoint === 'students/recycle_bin.php') {
      return (await overlayStudentsRecycleBin(sid, productionData)) as unknown as T;
    }

    // 2. TRACER
    if (cleanEndpoint === 'tracer/list.php') {
      return (await overlayTracerList(sid, productionData)) as unknown as T;
    }

    // 3. ACHIEVEMENTS
    if (cleanEndpoint === 'achievements/list.php') {
      return (await overlayAchievementsList(sid, productionData)) as unknown as T;
    }
    if (cleanEndpoint === 'achievements/attachments/list.php') {
      return (await overlayAttachmentsList(sid, productionData, options)) as unknown as T;
    }
    if (cleanEndpoint === 'achievements/attachments/serve.php') {
      const attId = String(options?.params?.id || '');
      const blob = await getBlob(sid, attId);
      if (blob) {
        return URL.createObjectURL(blob.blob) as unknown as T;
      }
    }

    // 4. CHART RECORDS
    if (cleanEndpoint === 'chart-records/recycle-bin.php') {
      return (await overlayChartRecordsRecycleBin(sid, productionData)) as unknown as T;
    }

    // 5. EVALUATIONS
    if (cleanEndpoint === 'evaluations/list.php') {
      return (await overlayEvaluationsList(sid, productionData)) as unknown as T;
    }
    if (cleanEndpoint === 'evaluations/recycle_bin.php') {
      return (await overlayEvaluationsRecycleBin(sid, productionData)) as unknown as T;
    }

    // 6. SATISFACTION FORMS
    if (cleanEndpoint === 'satisfaction-forms/list.php') {
      return (await overlaySatisfactionFormsList(sid, productionData)) as unknown as T;
    }

    // 7. ADMINS
    if (cleanEndpoint === 'admins/list.php') {
      return (await overlayAdminsList(sid, productionData)) as unknown as T;
    }

    // 8. SETTINGS
    if (cleanEndpoint === 'settings/get_settings.php') {
      return (await overlaySettings(sid, productionData)) as unknown as T;
    }

    // 9. ERROR LOGS
    if (cleanEndpoint === 'logs/get_error_logs.php') {
      const isCleared = await getMetadata(sid, 'error_logs_cleared');
      if (isCleared && typeof productionData === 'object' && productionData !== null) {
        return {
          ...(productionData as any),
          data: [],
          stats: { total: 0, admin: 0, student: 0, today: 0 },
        } as unknown as T;
      }
    }

    return productionData;
  } catch (e) {
    console.warn('[SandboxAdapter] Error applying overlay for endpoint:', endpoint, e);
    return productionData;
  }
}

// ================= Specific Overlay Functions =================

async function overlayStudentsList(sid: string, response: any): Promise<any> {
  const tombstones = await getTombstoneSet(sid, 'students');
  const journal = await getJournal(sid, 'students');

  let list: any[] = [];
  let isRawArray = false;
  if (Array.isArray(response)) {
    list = [...response];
    isRawArray = true;
  } else if (response && Array.isArray(response.data)) {
    list = [...response.data];
  } else {
    return response;
  }

  // 1. Filter out tombstones
  list = list.filter((item) => !tombstones.has(String(item.id)));

  // 2. Apply updates
  const updateMap = new Map<string, Record<string, any>>();
  for (const entry of journal) {
    if (entry.operation === 'update' && entry.patch) {
      const current = updateMap.get(entry.recordId) || {};
      updateMap.set(entry.recordId, { ...current, ...entry.patch });
    }
  }

  list = list.map((item) => {
    const patch = updateMap.get(String(item.id));
    return patch ? { ...item, ...patch } : item;
  });

  // 3. Add created items
  const createdItems: any[] = [];
  for (const entry of journal) {
    if (entry.operation === 'create' && entry.payload && !tombstones.has(entry.recordId)) {
      const patch = updateMap.get(entry.recordId) || {};
      createdItems.push({ ...entry.payload, ...patch });
    }
  }

  const combined = [...createdItems, ...list];

  if (isRawArray) return combined;
  return {
    ...response,
    data: combined,
    total: combined.length,
  };
}

async function overlayStudentsRecycleBin(sid: string, response: any): Promise<any> {
  const tombstones = await getTombstoneSet(sid, 'students', false); // soft deletes only
  let list: any[] = Array.isArray(response?.data) ? [...response.data] : (Array.isArray(response) ? [...response] : []);

  // Fetch student snapshot to reconstruct soft-deleted items
  const snapshot = (await getSnapshot<any>(sid, 'students/all.php')) || (await getSnapshot<any>(sid, 'students/list'));
  const snapshotList: any[] = snapshot?.data ? (Array.isArray(snapshot.data) ? snapshot.data : (Array.isArray(snapshot.data?.data) ? snapshot.data.data : [])) : [];

  for (const id of tombstones) {
    if (!list.some((item) => String(item.id) === id)) {
      const found = snapshotList.find((item) => String(item.id) === id);
      list.push({
        ...(found || { id, nama: `Mahasiswa #${id}`, nim: id }),
        deleted_at: new Date().toISOString(),
      });
    }
  }

  if (Array.isArray(response)) return list;
  return { ...response, data: list, total: list.length };
}

async function overlayTracerList(sid: string, response: any): Promise<any> {
  const tombstones = await getTombstoneSet(sid, 'tracer');
  const journal = await getJournal(sid, 'tracer');

  let list: any[] = Array.isArray(response?.data) ? [...response.data] : (Array.isArray(response) ? [...response] : []);
  list = list.filter((item) => !tombstones.has(String(item.id)));

  const updateMap = new Map<string, any>();
  for (const e of journal) {
    if (e.operation === 'update' && e.patch) {
      updateMap.set(e.recordId, { ...(updateMap.get(e.recordId) || {}), ...e.patch });
    }
  }

  list = list.map((item) => {
    const patch = updateMap.get(String(item.id));
    return patch ? { ...item, ...patch } : item;
  });

  for (const e of journal) {
    if (e.operation === 'create' && e.payload && !tombstones.has(e.recordId)) {
      list.unshift({ ...e.payload, ...(updateMap.get(e.recordId) || {}) });
    }
  }

  if (Array.isArray(response)) return list;
  return { ...response, data: list };
}

async function overlayAchievementsList(sid: string, response: any): Promise<any> {
  const tombstones = await getTombstoneSet(sid, 'achievements');
  const journal = await getJournal(sid, 'achievements');

  let list: any[] = Array.isArray(response?.data) ? [...response.data] : (Array.isArray(response) ? [...response] : []);
  list = list.filter((item) => !tombstones.has(String(item.id)));

  const updateMap = new Map<string, any>();
  for (const e of journal) {
    if (e.operation === 'update' && e.patch) {
      updateMap.set(e.recordId, { ...(updateMap.get(e.recordId) || {}), ...e.patch });
    }
  }

  list = list.map((item) => {
    const patch = updateMap.get(String(item.id));
    return patch ? { ...item, ...patch } : item;
  });

  for (const e of journal) {
    if (e.operation === 'create' && e.payload && !tombstones.has(e.recordId)) {
      list.unshift({ ...e.payload, ...(updateMap.get(e.recordId) || {}) });
    }
  }

  if (Array.isArray(response)) return list;
  return { ...response, data: list, total: list.length };
}

async function overlayAttachmentsList(sid: string, response: any, options?: any): Promise<any> {
  const achievementId = String(options?.params?.achievement_id || '');
  const tombstones = await getTombstoneSet(sid, 'attachments');
  const journal = await getJournal(sid, 'attachments');

  let list: any[] = Array.isArray(response?.data) ? [...response.data] : (Array.isArray(response) ? [...response] : []);
  list = list.filter((item) => !tombstones.has(String(item.id)));

  for (const e of journal) {
    if (e.operation === 'create' && e.payload && !tombstones.has(e.recordId)) {
      if (!achievementId || String(e.payload.achievement_id) === achievementId) {
        list.unshift(e.payload);
      }
    }
  }

  if (Array.isArray(response)) return list;
  return { ...response, data: list };
}

async function overlayChartRecordsRecycleBin(sid: string, response: any): Promise<any> {
  const tombstones = await getTombstoneSet(sid, 'chart_records', false);
  let list: any[] = Array.isArray(response?.data) ? [...response.data] : (Array.isArray(response) ? [...response] : []);

  for (const id of tombstones) {
    if (!list.some((item) => String(item.id) === id)) {
      list.push({
        id,
        source_table: 'demo_records',
        snapshot_nama: 'Record Dihapus (Demo Mode)',
        deleted_at: new Date().toISOString(),
      });
    }
  }

  if (Array.isArray(response)) return list;
  return { ...response, data: list };
}

async function overlayEvaluationsList(sid: string, response: any): Promise<any> {
  const tombstones = await getTombstoneSet(sid, 'evaluations');
  const journal = await getJournal(sid, 'evaluations');

  let list: any[] = Array.isArray(response?.data) ? [...response.data] : (Array.isArray(response) ? [...response] : []);
  list = list.filter((item) => !tombstones.has(String(item.id)));

  const updateMap = new Map<string, any>();
  for (const e of journal) {
    if (e.operation === 'update' && e.patch) {
      updateMap.set(e.recordId, { ...(updateMap.get(e.recordId) || {}), ...e.patch });
    }
  }

  list = list.map((item) => {
    const patch = updateMap.get(String(item.id));
    return patch ? { ...item, ...patch } : item;
  });

  for (const e of journal) {
    if (e.operation === 'create' && e.payload && !tombstones.has(e.recordId)) {
      list.unshift({ ...e.payload, ...(updateMap.get(e.recordId) || {}) });
    }
  }

  if (Array.isArray(response)) return list;
  return { ...response, data: list };
}

async function overlayEvaluationsRecycleBin(sid: string, response: any): Promise<any> {
  const tombstones = await getTombstoneSet(sid, 'evaluations', false);
  let list: any[] = Array.isArray(response?.data) ? [...response.data] : (Array.isArray(response) ? [...response] : []);

  for (const id of tombstones) {
    if (!list.some((item) => String(item.id) === id)) {
      list.push({
        id,
        title: 'Evaluasi Dihapus (Demo Mode)',
        deleted_at: new Date().toISOString(),
      });
    }
  }

  if (Array.isArray(response)) return list;
  return { ...response, data: list };
}

async function overlaySatisfactionFormsList(sid: string, response: any): Promise<any> {
  const tombstones = await getTombstoneSet(sid, 'satisfaction_forms');
  const journal = await getJournal(sid, 'satisfaction_forms');

  let list: any[] = Array.isArray(response?.data) ? [...response.data] : (Array.isArray(response) ? [...response] : []);
  list = list.filter((item) => !tombstones.has(String(item.id)));

  const updateMap = new Map<string, any>();
  for (const e of journal) {
    if (e.operation === 'update' && e.patch) {
      updateMap.set(e.recordId, { ...(updateMap.get(e.recordId) || {}), ...e.patch });
    }
  }

  list = list.map((item) => {
    const patch = updateMap.get(String(item.id));
    return patch ? { ...item, ...patch } : item;
  });

  for (const e of journal) {
    if (e.operation === 'create' && e.payload && !tombstones.has(e.recordId)) {
      list.unshift({ ...e.payload, ...(updateMap.get(e.recordId) || {}) });
    }
  }

  if (Array.isArray(response)) return list;
  return { ...response, data: list };
}

async function overlayAdminsList(sid: string, response: any): Promise<any> {
  const tombstones = await getTombstoneSet(sid, 'admins');
  const journal = await getJournal(sid, 'admins');

  let list: any[] = Array.isArray(response?.data) ? [...response.data] : (Array.isArray(response) ? [...response] : []);
  list = list.filter((item) => !tombstones.has(String(item.id)));

  const updateMap = new Map<string, any>();
  for (const e of journal) {
    if (e.operation === 'update' && e.patch) {
      updateMap.set(e.recordId, { ...(updateMap.get(e.recordId) || {}), ...e.patch });
    }
  }

  list = list.map((item) => {
    const patch = updateMap.get(String(item.id));
    return patch ? { ...item, ...patch } : item;
  });

  for (const e of journal) {
    if (e.operation === 'create' && e.payload && !tombstones.has(e.recordId)) {
      list.unshift({ ...e.payload, ...(updateMap.get(e.recordId) || {}) });
    }
  }

  if (Array.isArray(response)) return list;
  return { ...response, data: list, total: list.length };
}

async function overlaySettings(sid: string, response: any): Promise<any> {
  const journal = await getJournal(sid, 'settings');
  if (!response || typeof response !== 'object') return response;

  const data = response.data ? { ...response.data } : { ...response };
  for (const e of journal) {
    if (e.patch) {
      Object.assign(data, e.patch);
    }
  }

  if (response.data) return { ...response, data };
  return data;
}
