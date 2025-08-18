'use client';

import { IconTrendingUp } from '@tabler/icons-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import * as React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

interface DashboardData {
  trends: Array<{
    period: string;
    kilograms: number;
    boxes: number;
  }>;
  topExporters: Array<{
    name: string;
    kilograms: number;
    boxes: number;
  }>;
}

const chartConfig = {
  kilograms: {
    label: 'Kilograms',
    color: 'hsl(var(--chart-1))'
  },
  boxes: {
    label: 'Boxes',
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig;

interface AreaGraphProps {
  data?: DashboardData;
}

export function AreaGraph({ data }: AreaGraphProps) {
  const chartData = React.useMemo(() => {
    if (!data?.trends) return [];
    return data.trends.slice(-6).map((trend) => ({
      period: trend.period.split(' ')[0], // Just the month
      kilograms: Math.round(trend.kilograms / 1000), // Convert to thousands
      boxes: Math.round(trend.boxes / 1000) // Convert to thousands
    }));
  }, [data]);

  const totalKg = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.kilograms, 0);
  }, [chartData]);

  const totalBoxes = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.boxes, 0);
  }, [chartData]);

  if (!data?.trends?.length) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Export Volumes</CardTitle>
          <CardDescription>Loading volume data...</CardDescription>
        </CardHeader>
        <CardContent className='flex h-[250px] items-center justify-center'>
          <div className='bg-muted h-full w-full animate-pulse rounded'></div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Export Volumes - Stacked</CardTitle>
        <CardDescription>
          Showing kilograms and boxes for the last 6 months (in thousands)
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
              <linearGradient id='fillKilograms' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-kilograms)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-kilograms)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillBoxes' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-boxes)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-boxes)'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='period'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dot' />}
            />
            <Area
              dataKey='boxes'
              type='natural'
              fill='url(#fillBoxes)'
              stroke='var(--color-boxes)'
              stackId='a'
            />
            <Area
              dataKey='kilograms'
              type='natural'
              fill='url(#fillKilograms)'
              stroke='var(--color-kilograms)'
              stackId='a'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 leading-none font-medium'>
              Total: {totalKg}K kg, {totalBoxes}K boxes{' '}
              <IconTrendingUp className='h-4 w-4' />
            </div>
            <div className='text-muted-foreground flex items-center gap-2 leading-none'>
              Last 6 months of export data
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
