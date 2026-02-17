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
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  const colSpan = columns.length + (selectionMode ? 1 : 0);

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
                    column.hideOnMobile && "hidden md:table-cell",
                    column.sortable && "cursor-pointer hover:bg-muted/50",
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
                    className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50')}
                    onClick={() => onRowClick?.(row)}
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
                          column.hideOnMobile && "hidden md:table-cell",
                          column.className
                        )}
                      >
                        {column.accessor
                          ? column.accessor(row)
                          : String(row[column.key as keyof T] ?? '-')}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!isExternal && totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-2">
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
