export type TabbedDashboardSectionId =
  | 'student-achievements'
  | 'publications'
  | 'research-outputs';

export type StudentAchievementsTab = 'all' | 'academic' | 'nonAcademic';
export type PublicationsTab = 'jurnal' | 'seminar' | 'pagelaran';
export type ResearchOutputsTab = 'haki' | 'technology' | 'other';

export type DashboardSectionTab =
  | StudentAchievementsTab
  | PublicationsTab
  | ResearchOutputsTab;

export const TABBED_SECTION_DEFAULT_TAB = {
  'student-achievements': 'all',
  publications: 'jurnal',
  'research-outputs': 'haki',
} as const;

export const TABBED_SECTION_ALLOWED_TABS = {
  'student-achievements': ['all', 'academic', 'nonAcademic'],
  publications: ['jurnal', 'seminar', 'pagelaran'],
  'research-outputs': ['haki', 'technology', 'other'],
} as const;

export function isTabbedDashboardSection(section: string): section is TabbedDashboardSectionId {
  return Object.prototype.hasOwnProperty.call(TABBED_SECTION_ALLOWED_TABS, section);
}

export function getDefaultTabForSection<S extends TabbedDashboardSectionId>(
  section: S
): (typeof TABBED_SECTION_DEFAULT_TAB)[S] {
  return TABBED_SECTION_DEFAULT_TAB[section];
}

export function isValidTabForSection<S extends TabbedDashboardSectionId>(
  section: S,
  tab: string
): tab is (typeof TABBED_SECTION_ALLOWED_TABS)[S][number] {
  return (TABBED_SECTION_ALLOWED_TABS[section] as readonly string[]).includes(tab);
}

export function coerceTabForSection<S extends TabbedDashboardSectionId>(
  section: S,
  tab: string | null | undefined
): (typeof TABBED_SECTION_ALLOWED_TABS)[S][number] {
  const fallback = getDefaultTabForSection(section);
  if (!tab) return fallback;
  return isValidTabForSection(section, tab) ? tab : fallback;
}

export function isStudentAchievementsTab(tab: string): tab is StudentAchievementsTab {
  return (TABBED_SECTION_ALLOWED_TABS['student-achievements'] as readonly string[]).includes(tab);
}

export function isPublicationsTab(tab: string): tab is PublicationsTab {
  return (TABBED_SECTION_ALLOWED_TABS.publications as readonly string[]).includes(tab);
}

export function isResearchOutputsTab(tab: string): tab is ResearchOutputsTab {
  return (TABBED_SECTION_ALLOWED_TABS['research-outputs'] as readonly string[]).includes(tab);
}
