export type DemoDummyTargetId =
  | 'student-manager'
  | 'student-achievements'
  | 'study-period'
  | 'waiting-time'
  | 'work-coverage'
  | 'user-satisfaction'
  | 'publications'
  | 'active-students'
  | 'student-products'
  | 'research-outputs'
  | 'evaluations'
  | 'dosen-management'
  | 'dosen-teaching'
  | 'dosen-research'
  | 'dosen-service'
  | 'dosen-workload'
  | 'tendik'
  | 'dosen-outputs';

export type DemoDummyVariant =
  | 'all'
  | 'academic'
  | 'nonAcademic'
  | 'working'
  | 'entrepreneur'
  | 'jurnal'
  | 'seminar'
  | 'pagelaran'
  | 'haki'
  | 'technology'
  | 'other';

export interface DemoDummyTarget {
  id: DemoDummyTargetId;
  label: string;
  description: string;
  defaultVariant?: DemoDummyVariant;
}

export interface DemoDummyGenerationResult {
  targetId: DemoDummyTargetId;
  createdIds: string[];
  primaryId: string;
  message: string;
}

export interface DemoDummyDataAddedDetail extends DemoDummyGenerationResult {
  variant?: DemoDummyVariant;
}

export const DEMO_DUMMY_DATA_ADDED_EVENT = 'demo:dummy-data-added';
