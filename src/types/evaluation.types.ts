/**
 * Evaluation & Notification Types
 */

export type EvaluationStatus = 'active' | 'closed';

export type InvitationStatus = 'not_sent' | 'sent' | 'submitted';

export type MajorJobMatch = 'ya' | 'tidak';

export type NotificationType = 'invitation' | 'reminder';

export type SurveyRatingScore = 1 | 2 | 3 | 4 | 5;

export interface Evaluation {
  id: string;
  title: string;
  short_message?: string | null;
  status: EvaluationStatus;
  start_at: string;
  end_at?: string | null;
  reminder_enabled: boolean | number;
  reminder_interval_days: number;
  created_by: string;
  closed_by?: string | null;
  closed_at?: string | null;
  created_at: string;
  updated_at: string;
  total_targets?: number;
  total_sent?: number;
  total_submitted?: number;
  response_rate?: number;
}

export interface EvaluationAspect {
  id: string;
  code: string;
  name: string;
  sort_order: number;
}

export interface EvaluationStudentTarget {
  id: string;
  nim: string;
  nama: string;
  jurusan: string;
  prodi: string;
  status: string;
  career_status?: 'working';
  has_active_account?: boolean;
  tahun_masuk: number;
  tahun_lulus?: number | null;
  email?: string | null;
  no_hp?: string | null;
  invitation_id?: string | null;
  access_token?: string | null;
  first_sent_at?: string | null;
  last_sent_at?: string | null;
  send_count: number;
  submitted_at?: string | null;
  evaluation_status: InvitationStatus;
}

export interface SurveyFormPayload {
  token: string;
  company_name: string;
  company_address: string;
  employee_name: string;
  graduation_year: number;
  study_program: string;
  current_work_division: string;
  major_job_match: MajorJobMatch;
  ratings: Record<string, SurveyRatingScore>;
}

export interface SurveyDataResponse {
  status: 'pending' | 'submitted';
  invitation: {
    id: string;
    evaluation_id: string;
    token: string;
    submitted_at?: string | null;
  };
  evaluation: {
    id: string;
    title: string;
    short_message?: string | null;
    status: EvaluationStatus;
    start_at: string;
    end_at?: string | null;
  };
  student: {
    id: string;
    nim: string;
    nama: string;
    tahun_lulus?: number | null;
    prodi: string;
  };
  response?: Record<string, unknown> | null;
  ratings: Record<string, number>;
  aspects: EvaluationAspect[];
}

export interface EvaluationResultRow {
  response_id: string;
  evaluation_id: string;
  evaluation_title: string;
  student_id: string;
  nim: string;
  nama: string;
  company_name: string;
  employee_name: string;
  major_job_match: MajorJobMatch;
  submitted_at: string;
}

export interface EvaluationResultDetail {
  header: Record<string, unknown>;
  ratings: Array<{
    aspect_id: string;
    aspect_code: string;
    aspect_name: string;
    sort_order: number;
    score: number;
  }>;
}

export interface EvaluationChartProgress {
  total_targets: number;
  total_sent: number;
  total_submitted: number;
  response_rate: number;
}

export interface EvaluationChartData {
  scope: 'all' | 'single';
  evaluation?: {
    id: string;
    title: string;
    status: EvaluationStatus;
    start_at: string;
    end_at?: string | null;
  } | null;
  progress: EvaluationChartProgress;
  job_match: Array<{
    key: MajorJobMatch;
    label: string;
    value: number;
  }>;
  aspect_distribution: Array<{
    aspect_id: string;
    aspect_code: string;
    aspect_name: string;
    sort_order: number;
    sangat_baik: number;
    baik: number;
    cukup_baik: number;
    kurang_baik: number;
    tidak_baik: number;
    total: number;
  }>;
}

export interface StudentNotification {
  id: string;
  student_id: string;
  evaluation_id?: string | null;
  invitation_id?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  link_path: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface NotificationListPayload {
  items: StudentNotification[];
  total: number;
  unread: number;
}
