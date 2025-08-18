'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { IconCalendar, IconFilter } from '@tabler/icons-react';

export interface DashboardFilters {
  season: string;
}

interface DashboardFiltersProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

const AVAILABLE_SEASONS = [
  { value: 'all', label: 'All Seasons', isActive: true },
  { value: '2024_2025', label: '2024-2025', isActive: true },
  { value: '2023_2024', label: '2023-2024', isActive: true },
  { value: '2022_2023', label: '2022-2023', isActive: true },
  { value: '2021_2022', label: '2021-2022', isActive: true }
];

export function DashboardFilters({
  filters,
  onFiltersChange
}: DashboardFiltersProps) {
  const handleSeasonChange = (season: string) => {
    onFiltersChange({
      ...filters,
      season
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      season: 'all'
    });
  };

  const hasActiveFilters = filters.season !== 'all';

  return (
    <Card className='mb-6'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <IconFilter className='h-5 w-5' />
          Dashboard Filters
          {hasActiveFilters && (
            <Badge variant='secondary' className='ml-2'>
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-wrap items-center gap-4'>
          {/* Season Filter */}
          <div className='flex min-w-[200px] items-center gap-2'>
            <IconCalendar className='text-muted-foreground h-4 w-4' />
            <label className='text-sm font-medium'>Season:</label>
            <Select value={filters.season} onValueChange={handleSeasonChange}>
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Select season' />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_SEASONS.map((season) => (
                  <SelectItem
                    key={season.value}
                    value={season.value}
                    disabled={!season.isActive}
                  >
                    {season.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className='text-muted-foreground hover:text-foreground text-sm transition-colors'
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className='mt-3 border-t pt-3'>
            <div className='text-muted-foreground flex items-center gap-2 text-sm'>
              <span>Active filters:</span>
              <Badge variant='outline'>
                Season:{' '}
                {
                  AVAILABLE_SEASONS.find((s) => s.value === filters.season)
                    ?.label
                }
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
