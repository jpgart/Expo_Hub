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
  IconGlobe,
  IconLeaf,
  IconUsers
} from '@tabler/icons-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { formatKilograms, formatBoxes, formatPercentage } from '@/lib/format';
import type { TopItem } from '@/types/exporters';

interface TopBarsProps {
  topImporters: TopItem[];
  topMarkets: TopItem[];
  topCountries: TopItem[];
  topVarieties: TopItem[];
  metric: 'kilograms' | 'boxes';
  loading?: boolean;
}

type TopType = 'importers' | 'markets' | 'countries' | 'varieties';

const topTypeConfig = {
  importers: {
    title: 'Top Importers',
    icon: IconUsers,
    color: '#3B82F6',
    description: 'Top importers by volume'
  },
  markets: {
    title: 'Top Markets',
    icon: IconGlobe,
    color: '#10B981',
    description: 'Top markets by volume'
  },
  countries: {
    title: 'Top Countries',
    icon: IconGlobe,
    color: '#F59E0B',
    description: 'Top countries by volume'
  },
  varieties: {
    title: 'Top Varieties',
    icon: IconLeaf,
    color: '#8B5CF6',
    description: 'Top varieties by volume'
  }
};

export function TopBars({
  topImporters,
  topMarkets,
  topCountries,
  topVarieties,
  metric,
  loading = false
}: TopBarsProps) {
  const [selectedType, setSelectedType] = React.useState<TopType>('importers');
  const [selectedMetric, setSelectedMetric] = React.useState<
    'kilograms' | 'boxes'
  >(metric);

  const getTopData = (type: TopType): TopItem[] => {
    switch (type) {
      case 'importers':
        return topImporters;
      case 'markets':
        return topMarkets;
      case 'countries':
        return topCountries;
      case 'varieties':
        return topVarieties;
      default:
        return [];
    }
  };

  const topData = getTopData(selectedType);
  const config = topTypeConfig[selectedType];
  const IconComponent = config.icon;

  // Prepare chart data
  const chartData = React.useMemo(() => {
    return topData
      .slice(0, 10)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        value: item[selectedMetric],
        percentage: item.sharePct
      }))
      .sort((a, b) => b.value - a.value);
  }, [topData, selectedMetric]);

  // Generate colors for bars
  const colors = [
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

  if (loading) {
    return (
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardHeader>
              <div className='bg-muted mb-2 h-6 w-1/3 rounded'></div>
              <div className='bg-muted h-4 w-1/2 rounded'></div>
            </CardHeader>
            <CardContent>
              <div className='bg-muted h-[200px] rounded'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
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

  return (
    <div className='space-y-6'>
      {/* Controls */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Select
            value={selectedType}
            onValueChange={(value: TopType) => setSelectedType(value)}
          >
            <SelectTrigger className='w-[140px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='importers'>Importers</SelectItem>
              <SelectItem value='markets'>Markets</SelectItem>
              <SelectItem value='countries'>Countries</SelectItem>
              <SelectItem value='varieties'>Varieties</SelectItem>
            </SelectContent>
          </Select>

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

        <Badge variant='outline' className='flex items-center gap-1'>
          <IconComponent className='h-3 w-3' />
          {topData.length} items
        </Badge>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <IconComponent
                  className='h-5 w-5'
                  style={{ color: config.color }}
                />
                {config.title}
              </CardTitle>
              <p className='text-muted-foreground text-sm'>
                {config.description}
              </p>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold'>
                {selectedMetric === 'kilograms'
                  ? formatKilograms(
                      topData.reduce((sum, item) => sum + item.kilograms, 0)
                    )
                  : formatBoxes(
                      topData.reduce((sum, item) => sum + item.boxes, 0)
                    )}
              </div>
              <div className='text-muted-foreground text-xs'>Total volume</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className='h-[300px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={chartData}
                layout='horizontal'
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                <XAxis
                  type='number'
                  tickFormatter={(value) =>
                    selectedMetric === 'kilograms'
                      ? formatKilograms(value)
                      : formatBoxes(value)
                  }
                  tick={{ fontSize: 12 }}
                  tickMargin={8}
                />
                <YAxis
                  type='category'
                  dataKey='name'
                  tick={{ fontSize: 12 }}
                  tickMargin={8}
                  width={90}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey='value' radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {chartData.slice(0, 4).map((item, index) => (
          <Card key={item.id} className='transition-shadow hover:shadow-md'>
            <CardContent className='p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <Badge variant='outline' className='text-xs'>
                  #{item.rank}
                </Badge>
                <div
                  className='h-3 w-3 rounded-full'
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
              </div>
              <div className='mb-1 line-clamp-2 text-sm font-medium'>
                {item.name}
              </div>
              <div className='text-lg font-bold'>
                {selectedMetric === 'kilograms'
                  ? formatKilograms(item.kilograms)
                  : formatBoxes(item.boxes)}
              </div>
              <div className='text-muted-foreground text-xs'>
                {formatPercentage(item.sharePct)} of total
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {chartData.map((item, index) => (
              <div
                key={item.id}
                className='hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3'
              >
                <div className='flex items-center gap-3'>
                  <Badge variant='outline' className='w-8 text-center text-xs'>
                    #{item.rank}
                  </Badge>
                  <div>
                    <div className='font-medium'>{item.name}</div>
                    <div className='text-muted-foreground text-xs'>
                      ID: {item.id}
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-medium'>
                    {selectedMetric === 'kilograms'
                      ? formatKilograms(item.kilograms)
                      : formatBoxes(item.boxes)}
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    {formatPercentage(item.sharePct)} of total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
