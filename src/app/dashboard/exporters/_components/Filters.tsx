'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { IconFilter, IconRefresh, IconShare, IconX } from '@tabler/icons-react';
import { MultiSearchSelect } from '@/components/ui/multi-search-select';
import {
  formFiltersSchema,
  defaultFilters,
  filtersToUrlParams,
  urlParamsToFilters
} from '@/lib/schemas/exporters';
import type { z } from 'zod';

type FormData = z.infer<typeof formFiltersSchema>;

interface FiltersProps {
  onFiltersChange: (filters: FormData) => void;
  loading?: boolean;
}

interface FilterOptions {
  seasons: Array<{ id: number; name: string }>;
  exporters: Array<{ id: number; name: string }>;
  species: Array<{ id: number; name: string }>;
  varieties: Array<{ id: number; name: string }>;
  markets: Array<{ id: number; name: string }>;
  countries: Array<{ id: number; name: string }>;
  regions: Array<{ id: number; name: string }>;
  transportTypes: Array<{ id: number; name: string }>;
  arrivalPorts: Array<{ id: number; name: string }>;
}

export function Filters({ onFiltersChange, loading = false }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterOptions, setFilterOptions] = React.useState<FilterOptions>({
    seasons: [],
    exporters: [],
    species: [],
    varieties: [],
    markets: [],
    countries: [],
    regions: [],
    transportTypes: [],
    arrivalPorts: []
  });
  const [optionsLoading, setOptionsLoading] = React.useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formFiltersSchema),
    defaultValues: defaultFilters
  });

  // Load filter options on component mount
  React.useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const response = await fetch('/api/exporters/options');
        if (response.ok) {
          const data = await response.json();
          setFilterOptions(data);
        }
      } catch (error) {
        console.error('Error loading filter options:', error);
      } finally {
        setOptionsLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  // Initialize form with URL params
  React.useEffect(() => {
    try {
      const params = Object.fromEntries(searchParams.entries());
      const filters = urlParamsToFilters(params);
      form.reset(filters);
    } catch (error) {
      console.error('Error parsing URL params:', error);
      form.reset(defaultFilters);
    }
  }, [searchParams, form]);

  const onSubmit = (data: FormData) => {
    const params = filtersToUrlParams(data);
    const newSearchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) newSearchParams.set(key, value);
    });

    router.push(`/exporters?${newSearchParams.toString()}`);
    onFiltersChange(data);
  };

  const resetFilters = () => {
    form.reset(defaultFilters);
    router.push('/exporters');
    onFiltersChange(defaultFilters);
  };

  const shareFilters = () => {
    const params = filtersToUrlParams(form.getValues());
    const url = `${window.location.origin}/exporters?${new URLSearchParams(params).toString()}`;
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

  const hasActiveFilters = () => {
    const values = form.getValues();
    return Object.values(values).some((value) =>
      Array.isArray(value) ? value.length > 0 : Boolean(value)
    );
  };

  const removeFilter = (key: keyof FormData, value: number | string) => {
    const currentValues = form.getValues(key);
    if (Array.isArray(currentValues)) {
      const newValues = currentValues.filter((v) => v !== value);
      form.setValue(key, newValues);
    } else {
      form.setValue(key, undefined);
    }
  };

  return (
    <Card className='w-full'>
      <CardHeader className='pb-4'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <IconFilter className='h-5 w-5' />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* All Filters in 4 columns grid */}
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4'>
            {/* Seasons - Simple Select (few options) */}
            <div className='space-y-1'>
              <Label htmlFor='seasons' className='text-sm font-medium'>
                Seasons
              </Label>
              <Select
                value={form.watch('seasonIds')?.join(',') || ''}
                onValueChange={(value) => {
                  const ids =
                    value && value !== 'all'
                      ? value.split(',').map(Number)
                      : [];
                  form.setValue('seasonIds', ids);
                }}
                disabled={optionsLoading}
              >
                <SelectTrigger className='h-9'>
                  <SelectValue placeholder='All seasons' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All seasons</SelectItem>
                  {filterOptions.seasons.map((season) => (
                    <SelectItem key={season.id} value={season.id.toString()}>
                      {season.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exporters - MultiSearchSelect (many options) */}
            <div className='space-y-1'>
              <Label htmlFor='exporters' className='text-sm font-medium'>
                Exporters
              </Label>
              <MultiSearchSelect
                options={filterOptions.exporters}
                value={form.watch('exporterIds') || []}
                onValueChange={(value) => form.setValue('exporterIds', value)}
                placeholder='All exporters'
                searchPlaceholder='Search exporters...'
                disabled={optionsLoading}
              />
            </div>

            {/* Species - MultiSearchSelect (many options) */}
            <div className='space-y-1'>
              <Label htmlFor='species' className='text-sm font-medium'>
                Species
              </Label>
              <MultiSearchSelect
                options={filterOptions.species}
                value={form.watch('speciesIds') || []}
                onValueChange={(value) => form.setValue('speciesIds', value)}
                placeholder='All species'
                searchPlaceholder='Search species...'
                disabled={optionsLoading}
              />
            </div>

            {/* Varieties - MultiSearchSelect (many options) */}
            <div className='space-y-1'>
              <Label htmlFor='varieties' className='text-sm font-medium'>
                Varieties
              </Label>
              <MultiSearchSelect
                options={filterOptions.varieties}
                value={form.watch('varietyIds') || []}
                onValueChange={(value) => form.setValue('varietyIds', value)}
                placeholder='All varieties'
                searchPlaceholder='Search varieties...'
                disabled={optionsLoading}
              />
            </div>

            {/* Markets - MultiSearchSelect (many options) */}
            <div className='space-y-1'>
              <Label htmlFor='markets' className='text-sm font-medium'>
                Markets
              </Label>
              <MultiSearchSelect
                options={filterOptions.markets}
                value={form.watch('marketIds') || []}
                onValueChange={(value) => form.setValue('marketIds', value)}
                placeholder='All markets'
                searchPlaceholder='Search markets...'
                disabled={optionsLoading}
              />
            </div>

            {/* Countries - MultiSearchSelect (many options) */}
            <div className='space-y-1'>
              <Label htmlFor='countries' className='text-sm font-medium'>
                Countries
              </Label>
              <MultiSearchSelect
                options={filterOptions.countries}
                value={form.watch('countryIds') || []}
                onValueChange={(value) => form.setValue('countryIds', value)}
                placeholder='All countries'
                searchPlaceholder='Search countries...'
                disabled={optionsLoading}
              />
            </div>

            {/* Regions - Simple Select (few options) */}
            <div className='space-y-1'>
              <Label htmlFor='regions' className='text-sm font-medium'>
                Regions
              </Label>
              <Select
                value={form.watch('regionIds')?.join(',') || ''}
                onValueChange={(value) => {
                  const ids =
                    value && value !== 'all'
                      ? value.split(',').map(Number)
                      : [];
                  form.setValue('regionIds', ids);
                }}
                disabled={optionsLoading}
              >
                <SelectTrigger className='h-9'>
                  <SelectValue placeholder='All regions' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All regions</SelectItem>
                  {filterOptions.regions.map((region) => (
                    <SelectItem key={region.id} value={region.id.toString()}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transport Types - Simple Select (few options) */}
            <div className='space-y-1'>
              <Label htmlFor='transportTypes' className='text-sm font-medium'>
                Transport
              </Label>
              <Select
                value={form.watch('transportTypeIds')?.join(',') || ''}
                onValueChange={(value) => {
                  const ids =
                    value && value !== 'all'
                      ? value.split(',').map(Number)
                      : [];
                  form.setValue('transportTypeIds', ids);
                }}
                disabled={optionsLoading}
              >
                <SelectTrigger className='h-9'>
                  <SelectValue placeholder='All transport' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All transport</SelectItem>
                  {filterOptions.transportTypes.map((transport) => (
                    <SelectItem
                      key={transport.id}
                      value={transport.id.toString()}
                    >
                      {transport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Arrival Ports - MultiSearchSelect (many options) */}
            <div className='space-y-1'>
              <Label htmlFor='arrivalPorts' className='text-sm font-medium'>
                Arrival Ports
              </Label>
              <MultiSearchSelect
                options={filterOptions.arrivalPorts}
                value={form.watch('arrivalPortIds') || []}
                onValueChange={(value) =>
                  form.setValue('arrivalPortIds', value)
                }
                placeholder='All ports'
                searchPlaceholder='Search ports...'
                disabled={optionsLoading}
              />
            </div>

            {/* Week From */}
            <div className='space-y-1'>
              <Label htmlFor='weekFrom' className='text-sm font-medium'>
                Week From
              </Label>
              <Input
                id='weekFrom'
                type='text'
                placeholder='2024-W01'
                className='h-9'
                {...form.register('weekFrom')}
              />
            </div>

            {/* Week To */}
            <div className='space-y-1'>
              <Label htmlFor='weekTo' className='text-sm font-medium'>
                Week To
              </Label>
              <Input
                id='weekTo'
                type='text'
                placeholder='2024-W52'
                className='h-9'
                {...form.register('weekTo')}
              />
            </div>

            {/* Granularity */}
            <div className='space-y-1'>
              <Label htmlFor='granularity' className='text-sm font-medium'>
                Granularity
              </Label>
              <Select
                value={form.watch('granularity')}
                onValueChange={(value: 'week' | 'month' | 'season') =>
                  form.setValue('granularity', value)
                }
              >
                <SelectTrigger className='h-9'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='week'>Week</SelectItem>
                  <SelectItem value='month'>Month</SelectItem>
                  <SelectItem value='season'>Season</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Metric */}
            <div className='space-y-1'>
              <Label htmlFor='metric' className='text-sm font-medium'>
                Metric
              </Label>
              <Select
                value={form.watch('metric')}
                onValueChange={(value: 'kilograms' | 'boxes') =>
                  form.setValue('metric', value)
                }
              >
                <SelectTrigger className='h-9'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='kilograms'>Kilograms</SelectItem>
                  <SelectItem value='boxes'>Boxes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap items-center gap-3 pt-2'>
            <Button
              type='submit'
              disabled={loading || optionsLoading}
              size='sm'
            >
              Apply Filters
            </Button>

            <Button
              type='button'
              variant='outline'
              onClick={resetFilters}
              disabled={loading || optionsLoading}
              size='sm'
            >
              <IconRefresh className='mr-2 h-4 w-4' />
              Reset
            </Button>

            <Button
              type='button'
              variant='outline'
              onClick={shareFilters}
              disabled={!hasActiveFilters() || loading || optionsLoading}
              size='sm'
            >
              <IconShare className='mr-2 h-4 w-4' />
              Share
            </Button>
          </div>
        </form>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className='space-y-3'>
            <Separator />
            <div className='flex items-center gap-2'>
              <Label className='text-sm font-medium'>Active Filters:</Label>
            </div>
            <div className='flex flex-wrap gap-2'>
              {Object.entries(form.getValues()).map(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0))
                  return null;

                if (Array.isArray(value)) {
                  return value.map((v) => (
                    <Badge
                      key={`${key}-${v}`}
                      variant='secondary'
                      className='flex items-center gap-1 text-xs'
                    >
                      {key}: {v}
                      <Button
                        variant='ghost'
                        size='sm'
                        className='ml-1 h-auto p-0'
                        onClick={() => removeFilter(key as keyof FormData, v)}
                      >
                        <IconX className='h-3 w-3' />
                      </Button>
                    </Badge>
                  ));
                }

                return (
                  <Badge
                    key={key}
                    variant='secondary'
                    className='flex items-center gap-1 text-xs'
                  >
                    {key}: {value}
                    <Button
                      variant='ghost'
                      size='sm'
                      className='ml-1 h-auto p-0'
                      onClick={() => removeFilter(key as keyof FormData, value)}
                    >
                      <IconX className='h-3 w-3' />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
