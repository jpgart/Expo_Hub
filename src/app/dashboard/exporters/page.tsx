'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IconBuilding,
  IconTrendingUp,
  IconPackage,
  IconShip
} from '@tabler/icons-react';
import { Filters } from './_components/Filters';
import { KpiCards } from './_components/KpiCards';
import { TrendChart } from './_components/TrendChart';
import { CompareChart } from './_components/CompareChart';
import { TopBars } from './_components/TopBars';
import { MixCharts } from './_components/MixCharts';
import { ExportersTable } from './_components/ExportersTable';

import { urlParamsToFilters, defaultFilters } from '@/lib/schemas/exporters';
import type {
  Filters as FiltersType,
  Kpi,
  ExporterKpi,
  ChartData
} from '@/types/exporters';

export default function ExportersPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = React.useState<FiltersType>(defaultFilters);
  const [loading, setLoading] = React.useState(true);
  const [kpiData, setKpiData] = React.useState<{
    global: Kpi;
    exporters: ExporterKpi[];
  } | null>(null);
  const [chartData, setChartData] = React.useState<ChartData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [filterOptions, setFilterOptions] = React.useState<{
    exporters: Array<{ id: number; name: string }>;
  }>({ exporters: [] });
  // Initialize filters from URL params
  React.useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    const urlFilters = urlParamsToFilters(params);
    setFilters(urlFilters);
  }, [searchParams]);

  // Load filter options
  React.useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const response = await fetch('/api/exporters/options');
        if (response.ok) {
          const data = await response.json();
          setFilterOptions({ exporters: data.exporters || [] });
        }
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };

    loadFilterOptions();
  }, []);

  // Load data when filters change
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/exporters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(filters)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setKpiData(data.kpis);
        setChartData(data.charts);
      } catch (err) {
        console.error('Error loading exporters data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  const handleFiltersChange = (newFilters: FiltersType) => {
    setFilters(newFilters);
  };

  const handleExporterSelect = (exporterId: number) => {
    // Navigate to exporter detail page or open modal
    console.log('Selected exporter:', exporterId);
  };

  if (error) {
    return (
      <div className='container mx-auto p-6'>
        <Card className='w-full'>
          <CardContent className='flex h-[400px] items-center justify-center'>
            <div className='text-center'>
              <IconBuilding className='text-muted-foreground mx-auto mb-4 h-16 w-16' />
              <h2 className='mb-2 text-xl font-semibold'>Error Loading Data</h2>
              <p className='text-muted-foreground mb-4'>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2'
              >
                Try Again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Exporters Analytics
          </h1>
          <p className='text-muted-foreground'>
            Comprehensive analysis of Chilean fruit exporters performance
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='flex items-center gap-1'>
            <IconPackage className='h-3 w-3' />
            Volume Analysis
          </Badge>
          <Badge variant='outline' className='flex items-center gap-1'>
            <IconShip className='h-3 w-3' />
            Global Markets
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Filters onFiltersChange={handleFiltersChange} loading={loading} />

      {/* KPI Cards */}
      <KpiCards
        globalKpi={
          kpiData?.global || {
            kilograms: 0,
            boxes: 0,
            kgPerBox: 0,
            yoyKg: 0,
            yoyBoxes: 0,
            importersActive: 0,
            importersRetention: 0,
            varietiesActive: 0,
            marketCoverage: 0
          }
        }
        exportersKpi={kpiData?.exporters || []}
        loading={loading}
      />

      {/* Main Charts Grid */}
      <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
        {/* Trend Chart */}
        <div className='xl:col-span-2'>
          <TrendChart
            data={chartData?.timeseries || []}
            granularity={filters.granularity || 'month'}
            metric={filters.metric || 'kilograms'}
            loading={loading}
          />
        </div>

        {/* Comparison Chart */}
        <div className='xl:col-span-2'>
          <CompareChart
            data={chartData?.timeseries ? [chartData.timeseries] : []}
            exporters={kpiData?.exporters || []}
            granularity={filters.granularity || 'month'}
            metric={filters.metric || 'kilograms'}
            loading={loading}
            exporterOptions={filterOptions?.exporters || []}
          />
        </div>
      </div>

      {/* Top Charts */}
      <TopBars
        topImporters={chartData?.topImporters || []}
        topMarkets={chartData?.topMarkets || []}
        topCountries={chartData?.topCountries || []}
        topVarieties={chartData?.topVarieties || []}
        metric={filters.metric || 'kilograms'}
        loading={loading}
      />

      {/* Distribution Charts */}
      <MixCharts
        transportSplit={chartData?.transportSplit || []}
        topVarieties={chartData?.topVarieties || []}
        metric={filters.metric || 'kilograms'}
        loading={loading}
      />

      {/* Exporters Table */}
      <ExportersTable
        data={kpiData?.exporters || []}
        loading={loading}
        onExporterSelect={handleExporterSelect}
      />

      {/* Footer Info */}
      <Card className='bg-muted/50'>
        <CardContent className='p-6'>
          <div className='grid grid-cols-1 gap-6 text-center md:grid-cols-3'>
            <div>
              <IconBuilding className='text-primary mx-auto mb-2 h-8 w-8' />
              <h3 className='mb-1 font-semibold'>Exporters</h3>
              <p className='text-muted-foreground text-sm'>
                Analysis of Chilean fruit exporters
              </p>
            </div>
            <div>
              <IconTrendingUp className='mx-auto mb-2 h-8 w-8 text-green-600' />
              <h3 className='mb-1 font-semibold'>Performance</h3>
              <p className='text-muted-foreground text-sm'>
                Volume trends and growth metrics
              </p>
            </div>
            <div>
              <IconPackage className='mx-auto mb-2 h-8 w-8 text-blue-600' />
              <h3 className='mb-1 font-semibold'>Markets</h3>
              <p className='text-muted-foreground text-sm'>
                Global market distribution
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Restored original functionality
