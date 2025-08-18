'use client';

import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  IconBuilding,
  IconDownload,
  IconEye,
  IconCopy,
  IconFilter
} from '@tabler/icons-react';
import {
  formatKilograms,
  formatBoxes,
  formatPercentage,
  formatYoYChange
} from '@/lib/format';
import type { ExporterKpi } from '@/types/exporters';

interface ExportersTableProps {
  data: ExporterKpi[];
  loading?: boolean;
  onExporterSelect?: (exporterId: number) => void;
}

export function ExportersTable({
  data,
  loading = false,
  onExporterSelect
}: ExportersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [expandedSeasons, setExpandedSeasons] = React.useState(false);

  // Define columns
  const columns: ColumnDef<ExporterKpi>[] = React.useMemo(
    () => [
      {
        accessorKey: 'exporterName',
        header: 'Exporter',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconBuilding className='text-muted-foreground h-4 w-4' />
            <span className='font-medium'>{row.getValue('exporterName')}</span>
          </div>
        )
      },
      {
        accessorKey: 'kilograms',
        header: 'Kilograms',
        cell: ({ row }) => (
          <div className='text-right'>
            <div className='font-medium'>
              {formatKilograms(row.getValue('kilograms'))}
            </div>
            <div className='text-muted-foreground text-xs'>
              {formatBoxes(row.original.boxes)}
            </div>
          </div>
        )
      },
      {
        accessorKey: 'kgPerBox',
        header: 'Kg/Box',
        cell: ({ row }) => {
          const value = row.getValue('kgPerBox') as number | null;
          return (
            <div className='text-right'>
              {value ? `${value.toFixed(1)} kg` : 'N/A'}
            </div>
          );
        }
      },
      {
        accessorKey: 'importersActive',
        header: 'Importers',
        cell: ({ row }) => (
          <div className='text-center'>
            <Badge variant='outline'>{row.getValue('importersActive')}</Badge>
          </div>
        )
      },
      {
        accessorKey: 'varietiesActive',
        header: 'Varieties',
        cell: ({ row }) => (
          <div className='text-center'>
            <Badge variant='outline'>{row.getValue('varietiesActive')}</Badge>
          </div>
        )
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onExporterSelect?.(row.original.exporterId)}
            >
              <IconEye className='mr-1 h-4 w-4' />
              View
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                navigator.clipboard.writeText(
                  row.original.exporterId.toString()
                )
              }
            >
              <IconCopy className='h-4 w-4' />
            </Button>
          </div>
        )
      }
    ],
    [onExporterSelect]
  );

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter
    }
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = columns.map((col) => col.header as string).filter(Boolean);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        [
          row.exporterName,
          row.kilograms,
          row.boxes,
          row.kgPerBox || 'N/A',
          row.importersActive,
          row.varietiesActive
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exporters-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <div className='bg-muted mb-2 h-6 w-1/3 rounded'></div>
          <div className='bg-muted h-4 w-1/2 rounded'></div>
        </CardHeader>
        <CardContent>
          <div className='bg-muted h-[400px] animate-pulse rounded'></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-lg'>Exporters Analysis</CardTitle>
            <p className='text-muted-foreground text-sm'>
              Detailed breakdown of exporter performance
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setExpandedSeasons(!expandedSeasons)}
            >
              <IconFilter className='mr-1 h-4 w-4' />
              {expandedSeasons ? 'Collapse' : 'Expand'} by Season
            </Button>
            <Button variant='outline' size='sm' onClick={exportToCSV}>
              <IconDownload className='mr-1 h-4 w-4' />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Filters */}
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <IconFilter className='text-muted-foreground h-4 w-4' />
            <Input
              placeholder='Search exporters...'
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className='w-[300px]'
            />
          </div>

          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className='w-[100px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='10'>10</SelectItem>
              <SelectItem value='20'>20</SelectItem>
              <SelectItem value='50'>50</SelectItem>
              <SelectItem value='100'>100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className='rounded-md border'>
          <table className='w-full'>
            <thead className='bg-muted/50'>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className='text-muted-foreground px-4 py-3 text-left text-sm font-medium'
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none'
                              : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽'
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className='hover:bg-muted/50 border-b transition-colors'
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className='px-4 py-3 text-sm'>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className='text-muted-foreground h-24 text-center'
                  >
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='flex items-center justify-between'>
          <div className='text-muted-foreground text-sm'>
            Showing {table.getFilteredRowModel().rows.length} of {data.length}{' '}
            results
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <div className='flex items-center gap-1'>
              {table.getPageCount() > 0 && (
                <>
                  <span className='text-muted-foreground text-sm'>Page</span>
                  <strong className='text-sm'>
                    {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
                  </strong>
                </>
              )}
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className='grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold'>{data.length}</div>
            <div className='text-muted-foreground text-sm'>Total Exporters</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold'>
              {formatKilograms(
                data.reduce((sum, item) => sum + item.kilograms, 0)
              )}
            </div>
            <div className='text-muted-foreground text-sm'>Total Kilograms</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold'>
              {formatBoxes(data.reduce((sum, item) => sum + item.boxes, 0))}
            </div>
            <div className='text-muted-foreground text-sm'>Total Boxes</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold'>
              {data.reduce((sum, item) => sum + item.importersActive, 0)}
            </div>
            <div className='text-muted-foreground text-sm'>Total Importers</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
