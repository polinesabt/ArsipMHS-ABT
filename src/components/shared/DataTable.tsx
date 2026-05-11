import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Search, Download, SortAsc, SortDesc } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface Column<T> {
  key: keyof T | string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  hideOnMobile?: boolean;
}

export interface SelectionMode<T> {
  rowIdKey: keyof T;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  onRowClick?: (row: T) => void;
  pageSize?: number;
  exportable?: boolean;
  onExport?: () => void;
  emptyMessage?: string;
  /** When 'external', data is already one page; no internal pagination or count displayed */
  paginationMode?: 'internal' | 'external';
  /** When set, adds checkbox column and Select All; selection is per current page */
  selectionMode?: SelectionMode<T>;
  /** When paginationMode is external, hide the built-in search toolbar */
  hideToolbar?: boolean;
  mobileRenderMode?: 'auto' | 'table' | 'cards';
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchPlaceholder = 'Cari...',
  searchKeys = [],
  onRowClick,
  pageSize = 10,
  exportable = true,
  onExport,
  emptyMessage = 'Tidak ada data ditemukan',
  paginationMode = 'internal',
  selectionMode,
  hideToolbar = false,
  mobileRenderMode = 'auto',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const isMobile = useIsMobile();

  const isExternal = paginationMode === 'external';
  const showToolbar = !hideToolbar && !isExternal;

  const filteredData = useMemo(() => {
    if (isExternal) return data;
    if (!search) return data;
    const searchLower = search.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(searchLower))
    );
  }, [data, search, searchKeys, isExternal]);

  const sortedData = useMemo(() => {
    if (!sortKey) return [...filteredData];
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey as keyof T];
      const bVal = b[sortKey as keyof T];
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  const totalPages = isExternal ? 1 : Math.ceil(sortedData.length / pageSize);
  const paginatedData = isExternal
    ? sortedData
    : sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const rowIdKey = selectionMode?.rowIdKey;
  const selectedIds = selectionMode?.selectedIds ?? [];
  const onSelectionChange = selectionMode?.onSelectionChange;

  const pageIds = useMemo(
    () => paginatedData.map((row) => String(row[rowIdKey as keyof T] ?? '')),
    [paginatedData, rowIdKey]
  );
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const somePageSelected = pageIds.some((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (!onSelectionChange) return;
    const otherIds = selectedIds.filter((id) => !pageIds.includes(id));
    if (allPageSelected) {
      onSelectionChange(otherIds);
    } else {
      onSelectionChange([...new Set([...otherIds, ...pageIds])]);
    }
  };

  const toggleRow = (rowId: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(rowId)) {
      onSelectionChange(selectedIds.filter((id) => id !== rowId));
    } else {
      onSelectionChange([...selectedIds, rowId]);
    }
  };

  const shouldIgnoreRowClick = (target: EventTarget | null): boolean => {
    if (!(target instanceof Element)) return false;
    return Boolean(
      target.closest(
        'button, a, input, select, textarea, [role="checkbox"], [data-row-click-ignore="true"]'
      )
    );
  };

  const colSpan = columns.length + (selectionMode ? 1 : 0);
  const cardColumns = useMemo(() => {
    const visibleOnMobile = columns.filter((column) => !column.hideOnMobile);
    return visibleOnMobile.length > 0 ? visibleOnMobile : columns;
  }, [columns]);
  const primaryCardColumn = cardColumns[0] ?? columns[0];
  const secondaryCardColumns = cardColumns.slice(1);
  const shouldUseCardLayout =
    mobileRenderMode === 'cards' || (mobileRenderMode === 'auto' && isMobile);

  const renderCellContent = (row: T, column: Column<T>) =>
    column.accessor
      ? column.accessor(row)
      : String(row[column.key as keyof T] ?? '-');

  return (
    <div className="data-table">
      {showToolbar && (
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-10 w-full sm:w-72 rounded-lg"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-sm text-muted-foreground">
              {sortedData.length} data
            </span>
            {exportable && onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      )}

      {shouldUseCardLayout ? (
        paginatedData.length === 0 ? (
          <div className="flex h-32 items-center justify-center px-4 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedData.map((row, index) => {
              const rowId = String(row[rowIdKey as keyof T] ?? index);
              return (
                <div
                  key={rowId}
                  className={cn(
                    'space-y-3 p-4',
                    (onRowClick || selectionMode) && 'cursor-pointer transition-colors hover:bg-muted/30'
                  )}
                  onClick={(event) => {
                    if (shouldIgnoreRowClick(event.target)) return;
                    if (selectionMode) {
                      toggleRow(rowId);
                      return;
                    }
                    onRowClick?.(row);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      {primaryCardColumn && (
                        <>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            {primaryCardColumn.header}
                          </p>
                          <div className="break-words text-sm font-semibold text-foreground">
                            {renderCellContent(row, primaryCardColumn)}
                          </div>
                        </>
                      )}
                    </div>
                    {selectionMode && (
                      <div className="shrink-0" onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.includes(rowId)}
                          onCheckedChange={() => toggleRow(rowId)}
                          aria-label={`Select row ${rowId}`}
                        />
                      </div>
                    )}
                  </div>

                  {secondaryCardColumns.length > 0 && (
                    <div className="space-y-2">
                      {secondaryCardColumns.map((column) => (
                        <div
                          key={String(column.key)}
                          className="flex items-start justify-between gap-3"
                        >
                          <span className="max-w-[40%] text-xs text-muted-foreground">
                            {column.header}
                          </span>
                          <div className="min-w-0 flex-1 break-words text-right text-sm text-foreground">
                            {renderCellContent(row, column)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {selectionMode && (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allPageSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all on page"
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className={cn(
                      column.hideOnMobile && 'hidden md:table-cell',
                      column.sortable && 'cursor-pointer hover:bg-muted/50',
                      column.className
                    )}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {column.sortable && sortKey === String(column.key) && (
                        sortDirection === 'asc' ? (
                          <SortAsc className="w-3 h-3" />
                        ) : (
                          <SortDesc className="w-3 h-3" />
                        )
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colSpan} className="h-32 text-center text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => {
                  const rowId = String(row[rowIdKey as keyof T] ?? index);
                  return (
                    <TableRow
                      key={rowId}
                      className={cn(
                        (onRowClick || selectionMode) && 'cursor-pointer hover:bg-muted/50'
                      )}
                      onClick={(event) => {
                        if (shouldIgnoreRowClick(event.target)) return;
                        if (selectionMode) {
                          toggleRow(rowId);
                          return;
                        }
                        onRowClick?.(row);
                      }}
                    >
                      {selectionMode && (
                        <TableCell
                          className="w-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedIds.includes(rowId)}
                            onCheckedChange={() => toggleRow(rowId)}
                            aria-label={`Select row ${rowId}`}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell
                          key={String(column.key)}
                          className={cn(
                            column.hideOnMobile && 'hidden md:table-cell',
                            column.className
                          )}
                        >
                          {renderCellContent(row, column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {!isExternal && totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Select
              value={String(currentPage)}
              onValueChange={(v) => setCurrentPage(Number(v))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalPages }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
