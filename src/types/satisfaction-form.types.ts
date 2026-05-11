/**
 * Custom Form Kepuasan Pengguna - template and form definition types
 */

export type SatisfactionSectionType = 'open' | 'multiple_choice' | 'scale' | 'file_upload';

export interface SatisfactionSectionBase {
  id: string;
  title: string;
  required: boolean;
  type: SatisfactionSectionType;
}

export interface SatisfactionSectionOpen extends SatisfactionSectionBase {
  type: 'open';
  placeholder?: string;
  prefillFrom?: 'student.nama' | 'student.tahun_lulus' | 'student.prodi';
  inputType?: 'text' | 'number';
}

export interface SatisfactionSectionMultipleChoice extends SatisfactionSectionBase {
  type: 'multiple_choice';
  options: string[];
  allowMultiple?: boolean;
  allowOther?: boolean;
}

export interface SatisfactionScaleQuestion {
  id: string;
  title: string;
}

export interface SatisfactionSectionScale extends SatisfactionSectionBase {
  type: 'scale';
  scaleMin: number;
  scaleMax: number;
  questions: SatisfactionScaleQuestion[];
  questionSource?: 'template' | 'evaluation_aspects';
}

export interface SatisfactionSectionFileUpload extends SatisfactionSectionBase {
  type: 'file_upload';
}

export type SatisfactionSection =
  | SatisfactionSectionOpen
  | SatisfactionSectionMultipleChoice
  | SatisfactionSectionScale
  | SatisfactionSectionFileUpload;

export interface SatisfactionFormDefinition {
  sections: SatisfactionSection[];
}

export interface SatisfactionFormTemplate {
  id: string;
  title: string;
  definition: SatisfactionFormDefinition;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SatisfactionTemplateRecycleRecord {
  id: string;
  title: string;
  is_default: boolean;
  deleted_at: string;
  deleted_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SatisfactionRecycleBinPayload {
  records: SatisfactionTemplateRecycleRecord[];
  total: number;
  page: number;
  per_page: number;
}
