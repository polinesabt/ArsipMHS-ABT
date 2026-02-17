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

/** Parent item: expandable container; optional path = direct link (e.g. Dashboard Admin → /admin) */
export type AdminNavItemParent = {
  id: string;
  label: string;
  icon: LucideIcon;
  index: number;
  path?: string;
  children: AdminNavItemLeaf[];
};

export type AdminNavItem = AdminNavItemLeaf | AdminNavItemParent;

export function isNavParent(item: AdminNavItem): item is AdminNavItemParent {
  return Array.isArray((item as AdminNavItemParent).children) && (item as AdminNavItemParent).children.length > 0;
}
