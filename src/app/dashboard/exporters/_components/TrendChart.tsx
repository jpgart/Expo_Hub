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
  formatMonth
} from '@/lib/format';
import type { Timeseries } from '@/types/exporters';

interface TrendChartProps {
  data: Timeseries;
  granularity: 'week' | 'month' | 'season';
  metric: 'kilograms' | 'boxes';
  loading?: boolean;
}

export function TrendChart({
  data,
  granularity,
  metric,
  loading = false
}: TrendChartProps) {
  const [selectedMetric, setSelectedMetric] = React.useState<
    'kilograms' | 'boxes'
  >(metric);

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

  if (!data || data.length === 0) {
    return (
      <Card className='w-full'>
        <CardContent className='flex h-[300px] items-center justify-center'>
          <div className='text-muted-foreground text-center'>
            <p>No data available for the selected filters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate trends
  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return { trend: 0, percentage: 0 };

    const first = values[0];
    const last = values[values.length - 1];
    const trend = last - first;
    const percentage = first !== 0 ? (trend / first) * 100 : 0;

    return { trend, percentage };
  };

  const values = data.map((d) => d[selectedMetric]);
  const { trend, percentage } = calculateTrend(values);

  const getTrendIcon = (percentage: number) => {
    if (percentage > 0)
      return <IconTrendingUp className='h-4 w-4 text-green-600' />;
    if (percentage < 0)
      return <IconTrendingDown className='h-4 w-4 text-red-600' />;
    return <IconMinus className='h-4 w-4 text-amber-600' />;
  };

  const getTrendColor = (percentage: number) => {
    if (percentage > 0) return 'text-green-600';
    if (percentage < 0) return 'text-red-600';
    return 'text-amber-600';
  };

  // Format X-axis labels based on granularity
  const formatXAxis = (value: string) => {
    switch (granularity) {
      case 'week':
        return formatWeek(value);
      case 'month':
        return formatMonth(value);
      case 'season':
        return value;
      default:
        return value;
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-background rounded-lg border p-3 shadow-lg'>
          <p className='font-medium'>{formatXAxis(label)}</p>
          <p className='text-sm'>
            {selectedMetric === 'kilograms'
              ? formatKilograms(data.kilograms)
              : formatBoxes(data.boxes)}
          </p>
          <p className='text-muted-foreground text-xs'>
            {selectedMetric === 'kilograms'
              ? formatBoxes(data.boxes)
              : formatKilograms(data.kilograms)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Chart configuration
  const chartData = data.map((item) => ({
    period: item.period,
    kilograms: item.kilograms,
    boxes: item.boxes,
    [selectedMetric]: item[selectedMetric]
  }));

  const yAxisFormatter = (value: number) => {
    if (selectedMetric === 'kilograms') {
      return formatKilograms(value);
    }
    return formatBoxes(value);
  };

  return (
    <Card className='w-full'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-lg'>Trend Analysis</CardTitle>
            <p className='text-muted-foreground text-sm'>
              {granularity.charAt(0).toUpperCase() + granularity.slice(1)}ly
              trends over time
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

            <Badge variant='outline' className='flex items-center gap-1'>
              {getTrendIcon(percentage)}
              <span className={getTrendColor(percentage)}>
                {percentage > 0 ? '+' : ''}
                {percentage.toFixed(1)}%
              </span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className='h-[300px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
              <XAxis
                dataKey='period'
                tickFormatter={formatXAxis}
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis
                tickFormatter={yAxisFormatter}
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type='monotone'
                dataKey={selectedMetric}
                stroke='#3B82F6'
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className='mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
          <div className='text-center'>
            <div className='font-medium'>Total</div>
            <div className='text-muted-foreground'>
              {selectedMetric === 'kilograms'
                ? formatKilograms(data.reduce((sum, d) => sum + d.kilograms, 0))
                : formatBoxes(data.reduce((sum, d) => sum + d.boxes, 0))}
            </div>
          </div>
          <div className='text-center'>
            <div className='font-medium'>Average</div>
            <div className='text-muted-foreground'>
              {selectedMetric === 'kilograms'
                ? formatKilograms(
                    data.reduce((sum, d) => sum + d.kilograms, 0) / data.length
                  )
                : formatBoxes(
                    data.reduce((sum, d) => sum + d.boxes, 0) / data.length
                  )}
            </div>
          </div>
          <div className='text-center'>
            <div className='font-medium'>Peak</div>
            <div className='text-muted-foreground'>
              {selectedMetric === 'kilograms'
                ? formatKilograms(Math.max(...data.map((d) => d.kilograms)))
                : formatBoxes(Math.max(...data.map((d) => d.boxes)))}
            </div>
          </div>
          <div className='text-center'>
            <div className='font-medium'>Periods</div>
            <div className='text-muted-foreground'>{data.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
