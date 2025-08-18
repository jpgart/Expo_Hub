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
  IconShip,
  IconLeaf,
  IconTruck,
  IconPackage
} from '@tabler/icons-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { formatKilograms, formatBoxes, formatPercentage } from '@/lib/format';
import type { TopItem } from '@/types/exporters';

interface MixChartsProps {
  transportSplit: TopItem[];
  topVarieties: TopItem[];
  metric: 'kilograms' | 'boxes';
  loading?: boolean;
}

const COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#F97316',
  '#06B6D4',
  '#84CC16',
  '#EC4899',
  '#6366F1'
];

export function MixCharts({
  transportSplit,
  topVarieties,
  metric,
  loading = false
}: MixChartsProps) {
  const [selectedMetric, setSelectedMetric] = React.useState<
    'kilograms' | 'boxes'
  >(metric);

  // Prepare transport data
  const transportData = React.useMemo(() => {
    return transportSplit
      .slice(0, 8)
      .map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b[selectedMetric] - a[selectedMetric]);
  }, [transportSplit, selectedMetric]);

  // Prepare varieties data
  const varietiesData = React.useMemo(() => {
    return topVarieties
      .slice(0, 8)
      .map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b[selectedMetric] - a[selectedMetric]);
  }, [topVarieties, selectedMetric]);

  if (loading) {
    return (
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardHeader>
              <div className='bg-muted mb-2 h-6 w-1/3 rounded'></div>
              <div className='bg-muted h-4 w-1/2 rounded'></div>
            </CardHeader>
            <CardContent>
              <div className='bg-muted h-[250px] rounded'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Custom tooltip for pie charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-background rounded-lg border p-3 shadow-lg'>
          <p className='font-medium'>{data.name}</p>
          <p className='text-sm'>
            {selectedMetric === 'kilograms'
              ? formatKilograms(data.kilograms)
              : formatBoxes(data.boxes)}
          </p>
          <p className='text-muted-foreground text-xs'>
            {formatPercentage(data.sharePct)} of total
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className='mt-4 flex flex-wrap gap-2'>
        {payload?.map((entry: any, index: number) => (
          <div key={index} className='flex items-center gap-2 text-sm'>
            <div
              className='h-3 w-3 rounded-full'
              style={{ backgroundColor: entry.color }}
            />
            <span className='font-medium'>{entry.value}</span>
            <span className='text-muted-foreground'>
              {formatPercentage(entry.payload.sharePct)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Controls */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Distribution Analysis</h3>
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

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Transport Split Chart */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <IconShip className='h-5 w-5 text-blue-600' />
                  Transport Distribution
                </CardTitle>
                <p className='text-muted-foreground text-sm'>
                  Volume distribution by transport type
                </p>
              </div>
              <div className='text-right'>
                <div className='text-2xl font-bold'>
                  {selectedMetric === 'kilograms'
                    ? formatKilograms(
                        transportSplit.reduce(
                          (sum, item) => sum + item.kilograms,
                          0
                        )
                      )
                    : formatBoxes(
                        transportSplit.reduce(
                          (sum, item) => sum + item.boxes,
                          0
                        )
                      )}
                </div>
                <div className='text-muted-foreground text-xs'>
                  Total volume
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className='h-[250px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={transportData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey={selectedMetric}
                    label={({ name, sharePct }) =>
                      `${name} (${formatPercentage(sharePct)})`
                    }
                    labelLine={false}
                  >
                    {transportData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Table */}
            <div className='mt-4 space-y-2'>
              {transportData.slice(0, 4).map((item, index) => (
                <div
                  key={item.id}
                  className='flex items-center justify-between rounded-lg border p-2'
                >
                  <div className='flex items-center gap-2'>
                    <div
                      className='h-3 w-3 rounded-full'
                      style={{ backgroundColor: item.color }}
                    />
                    <span className='text-sm font-medium'>{item.name}</span>
                  </div>
                  <div className='text-right'>
                    <div className='text-sm font-medium'>
                      {selectedMetric === 'kilograms'
                        ? formatKilograms(item.kilograms)
                        : formatBoxes(item.boxes)}
                    </div>
                    <div className='text-muted-foreground text-xs'>
                      {formatPercentage(item.sharePct)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Varieties Distribution Chart */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <IconLeaf className='h-5 w-5 text-green-600' />
                  Varieties Distribution
                </CardTitle>
                <p className='text-muted-foreground text-sm'>
                  Volume distribution by variety
                </p>
              </div>
              <div className='text-right'>
                <div className='text-2xl font-bold'>
                  {selectedMetric === 'kilograms'
                    ? formatKilograms(
                        topVarieties.reduce(
                          (sum, item) => sum + item.kilograms,
                          0
                        )
                      )
                    : formatBoxes(
                        topVarieties.reduce((sum, item) => sum + item.boxes, 0)
                      )}
                </div>
                <div className='text-muted-foreground text-xs'>
                  Total volume
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className='h-[250px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={varietiesData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey={selectedMetric}
                    label={({ name, sharePct }) =>
                      `${name} (${formatPercentage(sharePct)})`
                    }
                    labelLine={false}
                  >
                    {varietiesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Table */}
            <div className='mt-4 space-y-2'>
              {varietiesData.slice(0, 4).map((item, index) => (
                <div
                  key={item.id}
                  className='flex items-center justify-between rounded-lg border p-2'
                >
                  <div className='flex items-center gap-2'>
                    <div
                      className='h-3 w-3 rounded-full'
                      style={{ backgroundColor: item.color }}
                    />
                    <span className='text-sm font-medium'>{item.name}</span>
                  </div>
                  <div className='text-right'>
                    <div className='text-sm font-medium'>
                      {selectedMetric === 'kilograms'
                        ? formatKilograms(item.kilograms)
                        : formatBoxes(item.boxes)}
                    </div>
                    <div className='text-muted-foreground text-xs'>
                      {formatPercentage(item.sharePct)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Combined Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Distribution Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Transport Summary */}
            <div>
              <h4 className='mb-3 flex items-center gap-2 font-medium'>
                <IconShip className='h-4 w-4 text-blue-600' />
                Transport Types
              </h4>
              <div className='space-y-2'>
                {transportData.map((item, index) => (
                  <div
                    key={item.id}
                    className='flex items-center justify-between text-sm'
                  >
                    <div className='flex items-center gap-2'>
                      <div
                        className='h-2 w-2 rounded-full'
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>
                        {selectedMetric === 'kilograms'
                          ? formatKilograms(item.kilograms)
                          : formatBoxes(item.boxes)}
                      </span>
                      <span className='text-muted-foreground text-xs'>
                        ({formatPercentage(item.sharePct)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Varieties Summary */}
            <div>
              <h4 className='mb-3 flex items-center gap-2 font-medium'>
                <IconLeaf className='h-4 w-4 text-green-600' />
                Top Varieties
              </h4>
              <div className='space-y-2'>
                {varietiesData.map((item, index) => (
                  <div
                    key={item.id}
                    className='flex items-center justify-between text-sm'
                  >
                    <div className='flex items-center gap-2'>
                      <div
                        className='h-2 w-2 rounded-full'
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>
                        {selectedMetric === 'kilograms'
                          ? formatKilograms(item.kilograms)
                          : formatBoxes(item.boxes)}
                      </span>
                      <span className='text-muted-foreground text-xs'>
                        ({formatPercentage(item.sharePct)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
