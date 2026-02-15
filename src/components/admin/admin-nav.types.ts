import type { LucideIcon } from 'lucide-react';

/** Leaf item: navigates to a path */
export type AdminNavItemLeaf = {
  id: string;
  label: string;
  icon?: LucideIcon;
  index: number;
  path: string;
  children?: never;
};

/** Parent item: expandable container, no path; click toggles expand/collapse */
export type AdminNavItemParent = {
  id: string;
  label: string;
  icon: LucideIcon;
  index: number;
  path?: never;
  children: AdminNavItemLeaf[];
};

export type AdminNavItem = AdminNavItemLeaf | AdminNavItemParent;

export function isNavParent(item: AdminNavItem): item is AdminNavItemParent {
  return Array.isArray((item as AdminNavItemParent).children) && (item as AdminNavItemParent).children.length > 0;
}
