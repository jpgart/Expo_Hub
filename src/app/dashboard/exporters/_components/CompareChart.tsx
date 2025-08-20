'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { MultiSearchSelect } from '@/components/ui/multi-search-select';
import {
  IconBuilding,
  IconPackage,
  IconGlobe,
  IconLeaf,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus
} from '@tabler/icons-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatKilograms, formatBoxes, getExporterColor } from '@/lib/format';
import type { ExporterKpi, Timeseries } from '@/types/exporters';

interface CompareChartProps {
  data: Timeseries[];
  exporters: ExporterKpi[];
  granularity: 'week' | 'month' | 'season';
  metric: 'kilograms' | 'boxes';
  loading?: boolean;
  // Add options for the selectors
  exporterOptions: { id: number; name: string }[];
}

export function CompareChart({
  data,
  exporters,
  granularity,
  metric,
  loading = false,
  exporterOptions
}: CompareChartProps) {
  const [selectedExporters, setSelectedExporters] = React.useState<number[]>(
    []
  );
  const [selectedMetric, setSelectedMetric] = React.useState<
    'kilograms' | 'boxes'
  >(metric);

  // Initialize with first 4 exporters if none selected
  React.useEffect(() => {
    if (exporters.length > 0 && selectedExporters.length === 0) {
      setSelectedExporters(exporters.slice(0, 4).map((e) => e.exporterId));
    }
  }, [exporters, selectedExporters.length]);

  // Get selected exporter data
  const selectedExporterData = React.useMemo(() => {
    return selectedExporters
      .map((id) => exporters.find((e) => e.exporterId === id))
      .filter(Boolean) as ExporterKpi[];
  }, [selectedExporters, exporters]);

  // Prepare volume comparison data
  const volumeData = React.useMemo(() => {
    return selectedExporterData.map((exporter) => ({
      name: exporter.exporterName,
      kilograms: exporter.kilograms,
      boxes: exporter.boxes,
      kgPerBox: exporter.kgPerBox,
      color: getExporterColor(exporter.exporterId)
    }));
  }, [selectedExporterData]);

  // Prepare species comparison data (simplified - using varieties_active as proxy)
  const speciesData = React.useMemo(() => {
    return selectedExporterData.map((exporter) => ({
      name: exporter.exporterName,
      varieties: exporter.varietiesActive,
      color: getExporterColor(exporter.exporterId)
    }));
  }, [selectedExporterData]);

  // Prepare markets comparison data (simplified - using importers_active as proxy)
  const marketsData = React.useMemo(() => {
    return selectedExporterData.map((exporter) => ({
      name: exporter.exporterName,
      markets: exporter.importersActive,
      color: getExporterColor(exporter.exporterId)
    }));
  }, [selectedExporterData]);

  // Calculate growth rates
  const growthRates = React.useMemo(() => {
    return selectedExporterData.map((exporter) => {
      const seriesData = data.find((series) =>
        series.some((p) => p.exporterId === exporter.exporterId)
      );

      if (!seriesData || seriesData.length < 2) {
        return {
          exporterId: exporter.exporterId,
          exporterName: exporter.exporterName,
          growth: 0,
          total: exporter[selectedMetric]
        };
      }

      const values = seriesData.map((p) => p[selectedMetric]);
      const first = values[0];
      const last = values[values.length - 1];
      const growth = first !== 0 ? ((last - first) / first) * 100 : 0;

      return {
        exporterId: exporter.exporterId,
        exporterName: exporter.exporterName,
        growth,
        total: exporter[selectedMetric]
      };
    });
  }, [selectedExporterData, data, selectedMetric]);

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

  if (!exporters || exporters.length === 0) {
    return (
      <Card className='w-full'>
        <CardContent className='flex h-[400px] items-center justify-center'>
          <div className='text-muted-foreground text-center'>
            <p>No exporters available for comparison</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleExporterChange = (exporterIds: number[]) => {
    setSelectedExporters(exporterIds.slice(0, 4)); // Limit to 4 exporters
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0)
      return <IconTrendingUp className='h-4 w-4 text-green-600' />;
    if (growth < 0)
      return <IconTrendingDown className='h-4 w-4 text-red-600' />;
    return <IconMinus className='h-4 w-4 text-amber-600' />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-amber-600';
  };

  return (
    <Card className='w-full'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-lg'>Exporter Comparison</CardTitle>
            <p className='text-muted-foreground text-sm'>
              Compare volumes, species, and markets across selected exporters
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Exporter Selection - 4 equal filter boxes */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className='space-y-2'>
              <Label
                htmlFor={`exporter-${index}`}
                className='text-sm font-medium'
              >
                Exporter {index}
              </Label>
              <MultiSearchSelect
                options={exporterOptions}
                value={
                  selectedExporters[index - 1]
                    ? [selectedExporters[index - 1]]
                    : []
                }
                onValueChange={(value) => {
                  const newSelected = [...selectedExporters];
                  if (value.length > 0) {
                    newSelected[index - 1] = value[0];
                  } else {
                    newSelected.splice(index - 1, 1);
                  }
                  handleExporterChange(newSelected.filter(Boolean));
                }}
                placeholder={`Select exporter ${index}`}
                searchPlaceholder='Search exporters...'
                disabled={loading}
                maxDisplay={1}
              />
            </div>
          ))}
        </div>

        {/* Growth Rate Summary */}
        {growthRates.length > 0 && (
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4'>
            {growthRates.map((rate) => (
              <div
                key={rate.exporterId}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <div className='flex items-center gap-2'>
                  <div
                    className='h-3 w-3 rounded-full'
                    style={{
                      backgroundColor: getExporterColor(rate.exporterId)
                    }}
                  />
                  <div>
                    <div className='text-sm font-medium'>
                      {rate.exporterName}
                    </div>
                    <div className='text-muted-foreground text-xs'>
                      {selectedMetric === 'kilograms'
                        ? formatKilograms(rate.total)
                        : formatBoxes(rate.total)}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  {getGrowthIcon(rate.growth)}
                  <span
                    className={`text-sm font-medium ${getGrowthColor(rate.growth)}`}
                  >
                    {rate.growth > 0 ? '+' : ''}
                    {rate.growth.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Volume Comparison Chart */}
        {volumeData.length > 0 && (
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <IconPackage className='h-5 w-5 text-blue-600' />
              <h3 className='font-semibold'>Volume Comparison</h3>
            </div>
            <div className='h-[300px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={volumeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    className='stroke-muted'
                  />
                  <XAxis
                    dataKey='name'
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor='end'
                    height={80}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      selectedMetric === 'kilograms'
                        ? formatKilograms(value)
                        : formatBoxes(value)
                    }
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      selectedMetric === 'kilograms'
                        ? formatKilograms(value)
                        : formatBoxes(value),
                      selectedMetric === 'kilograms' ? 'Kilograms' : 'Boxes'
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey={selectedMetric}
                    fill='#3b82f6'
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Species and Markets Comparison */}
        {selectedExporterData.length > 0 && (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Species Comparison */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <IconLeaf className='h-5 w-5 text-green-600' />
                <h3 className='font-semibold'>Species/Varieties</h3>
              </div>
              <div className='h-[250px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={speciesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      className='stroke-muted'
                    />
                    <XAxis
                      dataKey='name'
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor='end'
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar
                      dataKey='varieties'
                      fill='#10b981'
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Markets Comparison */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <IconGlobe className='h-5 w-5 text-purple-600' />
                <h3 className='font-semibold'>Markets/Destinations</h3>
              </div>
              <div className='h-[250px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={marketsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      className='stroke-muted'
                    />
                    <XAxis
                      dataKey='name'
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor='end'
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar
                      dataKey='markets'
                      fill='#8b5cf6'
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Info about filters */}
        <div className='text-muted-foreground border-t pt-4 text-center text-xs'>
          <p>
            <IconBuilding className='mr-1 inline h-3 w-3' />
            Comparison respects applied filters (season, species, etc.)
          </p>
          <p>Select up to 4 exporters to compare their performance metrics</p>
        </div>
      </CardContent>
    </Card>
  );
}
