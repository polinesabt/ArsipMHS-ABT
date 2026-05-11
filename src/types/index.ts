/**
 * Types Index
 * Central export point for all type definitions
 */

// Legacy types (for backward compatibility during migration)
export * from './alumni.types';
export * from './common.types';
export * from './evaluation.types';

// New student-centric types - namespaced to avoid conflicts
export type {
  StudentStatus,
  StudentStatusMode,
  CareerStatus,
  AchievementCategory,
  AchievementSubcategory,
  StudentProfile,
  StudentProfileInput,
  TracerContactInfo,
  TracerStudyData,
  TracerStudyInput,
  NonAcademicAchievement,
  AchievementInput,
  StudentCompleteView,
  StudentSummaryView,
  StudentFilterCriteria,
  AchievementFilterCriteria,
  StudentStatistics,
  TracerStatistics,
  AchievementStatistics,
  ChartDataPoint,
  TrendData,
} from './student.types';

// Re-export with prefixes for conflicting types
export type {
  EducationLevel as StudentEducationLevel,
  EmploymentData as StudentEmploymentData,
  JobSeekingData as StudentJobSeekingData,
  EntrepreneurshipData as StudentEntrepreneurshipData,
  FurtherStudyData as StudentFurtherStudyData,
} from './student.types';
