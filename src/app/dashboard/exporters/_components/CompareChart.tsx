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
import {
  IconBuilding,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus
} from '@tabler/icons-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  formatKilograms,
  formatBoxes,
  formatWeek,
  formatMonth,
  getExporterColor
} from '@/lib/format';
import type { Timeseries, ExporterKpi } from '@/types/exporters';

interface CompareChartProps {
  data: Timeseries[];
  exporters: ExporterKpi[];
  granularity: 'week' | 'month' | 'season';
  metric: 'kilograms' | 'boxes';
  loading?: boolean;
}

export function CompareChart({
  data,
  exporters,
  granularity,
  metric,
  loading = false
}: CompareChartProps) {
  const [selectedMetric, setSelectedMetric] = React.useState<
    'kilograms' | 'boxes'
  >(metric);
  const [selectedExporters, setSelectedExporters] = React.useState<number[]>(
    []
  );

  // Initialize with first 3 exporters if none selected
  React.useEffect(() => {
    if (exporters.length > 0 && selectedExporters.length === 0) {
      setSelectedExporters(exporters.slice(0, 3).map((e) => e.exporterId));
    }
  }, [exporters, selectedExporters.length]);

  // Prepare chart data with normalized values
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Get unique periods from all data
    const allPeriods = new Set<string>();
    data.forEach((series) => {
      series.forEach((point) => allPeriods.add(point.period));
    });

    const sortedPeriods = Array.from(allPeriods).sort();

    return sortedPeriods.map((period) => {
      const point: any = { period };

      selectedExporters.forEach((exporterId) => {
        const exporter = exporters.find((e) => e.exporterId === exporterId);
        if (exporter) {
          const seriesData = data.find((series) =>
            series.some((p) => p.exporterId === exporterId)
          );

          if (seriesData) {
            const periodData = seriesData.find((p) => p.period === period);
            if (periodData) {
              point[`exporter_${exporterId}`] = periodData[selectedMetric];
            }
          }
        }
      });

      return point;
    });
  }, [data, selectedExporters, exporters, selectedMetric]);

  // Calculate growth rates for selected exporters
  const growthRates = React.useMemo(() => {
    return selectedExporters
      .map((exporterId) => {
        const exporter = exporters.find((e) => e.exporterId === exporterId);
        if (!exporter) return null;

        const seriesData = data.find((series) =>
          series.some((p) => p.exporterId === exporterId)
        );

        if (!seriesData || seriesData.length < 2) return null;

        const values = seriesData.map((p) => p[selectedMetric]);
        const first = values[0];
        const last = values[values.length - 1];
        const growth = first !== 0 ? ((last - first) / first) * 100 : 0;

        return {
          exporterId,
          exporterName: exporter.exporterName,
          growth,
          total: exporter[selectedMetric]
        };
      })
      .filter(Boolean);
  }, [selectedExporters, exporters, data, selectedMetric]);

  if (loading) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <div className='bg-muted mb-2 h-6 w-1/3 rounded'></div>
          <div className='bg-muted h-4 w-1/2 rounded'></div>
        </CardHeader>
        <CardContent>
          <div className='bg-muted h-[300px] animate-pulse rounded'></div>
        </CardContent>
      </Card>
    );
  }

  if (!exporters || exporters.length === 0) {
    return (
      <Card className='w-full'>
        <CardContent className='flex h-[300px] items-center justify-center'>
          <div className='text-muted-foreground text-center'>
            <p>No exporters available for comparison</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-background rounded-lg border p-3 shadow-lg'>
          <p className='font-medium'>
            {granularity === 'week'
              ? formatWeek(label)
              : granularity === 'month'
                ? formatMonth(label)
                : label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className='text-sm' style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(1) || 0}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleExporterToggle = (exporterId: number) => {
    setSelectedExporters((prev) => {
      if (prev.includes(exporterId)) {
        return prev.filter((id) => id !== exporterId);
      } else if (prev.length < 5) {
        return [...prev, exporterId];
      }
      return prev;
    });
  };

  return (
    <Card className='w-full'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-lg'>Exporter Comparison</CardTitle>
            <p className='text-muted-foreground text-sm'>
              Normalized growth comparison (index 100)
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Select
              value={selectedMetric}
              onValueChange={(value: 'kilograms' | 'boxes') =>
                setSelectedMetric(value)
              }
            >
              <SelectTrigger className='w-[120px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='kilograms'>Kilograms</SelectItem>
                <SelectItem value='boxes'>Boxes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Exporter Selection */}
        <div className='flex flex-wrap gap-2'>
          {exporters.map((exporter) => (
            <Badge
              key={exporter.exporterId}
              variant={
                selectedExporters.includes(exporter.exporterId)
                  ? 'default'
                  : 'outline'
              }
              className='cursor-pointer hover:opacity-80'
              onClick={() => handleExporterToggle(exporter.exporterId)}
            >
              <IconBuilding className='mr-1 h-3 w-3' />
              {exporter.exporterName}
            </Badge>
          ))}
        </div>

        {/* Growth Rate Summary */}
        {growthRates.length > 0 && (
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
            {growthRates.map((rate) => {
              if (!rate) return null;

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
              );
            })}
          </div>
        )}

        {/* Chart */}
        <div className='h-[300px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
              <XAxis
                dataKey='period'
                tickFormatter={(value) =>
                  granularity === 'week'
                    ? formatWeek(value)
                    : granularity === 'month'
                      ? formatMonth(value)
                      : value
                }
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {selectedExporters.map((exporterId) => {
                const exporter = exporters.find(
                  (e) => e.exporterId === exporterId
                );
                if (!exporter) return null;

                return (
                  <Line
                    key={exporterId}
                    type='monotone'
                    dataKey={`exporter_${exporterId}`}
                    name={exporter.exporterName}
                    stroke={getExporterColor(exporterId)}
                    strokeWidth={2}
                    dot={{
                      fill: getExporterColor(exporterId),
                      strokeWidth: 2,
                      r: 4
                    }}
                    activeDot={{
                      r: 6,
                      stroke: getExporterColor(exporterId),
                      strokeWidth: 2
                    }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Info */}
        <div className='text-muted-foreground text-center text-xs'>
          <p>
            Chart shows normalized growth starting at 100% for each exporter
          </p>
          <p>Values above 100% indicate growth, below 100% indicate decline</p>
        </div>
      </CardContent>
    </Card>
  );
}
