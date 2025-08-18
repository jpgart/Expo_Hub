'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

export const description = 'Export trends over time';

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

interface BarGraphProps {
  data?: DashboardData;
}

export function BarGraph({ data }: BarGraphProps) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('kilograms');

  const chartData = React.useMemo(() => {
    if (!data?.trends) return [];
    return data.trends.slice(-12).map((trend) => ({
      period: trend.period,
      kilograms: Math.round(trend.kilograms / 1000), // Convert to thousands
      boxes: Math.round(trend.boxes / 1000) // Convert to thousands
    }));
  }, [data]);

  const total = React.useMemo(
    () => ({
      kilograms: chartData.reduce((acc, curr) => acc + curr.kilograms, 0),
      boxes: chartData.reduce((acc, curr) => acc + curr.boxes, 0)
    }),
    [chartData]
  );

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !data?.trends?.length) {
    return (
      <Card className='@container/card !pt-3'>
        <CardHeader>
          <CardTitle>Export Trends</CardTitle>
          <CardDescription>Loading export data...</CardDescription>
        </CardHeader>
        <CardContent className='flex h-[250px] items-center justify-center'>
          <div className='bg-muted h-full w-full animate-pulse rounded'></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='@container/card !pt-3'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 !py-0'>
          <CardTitle>Export Trends</CardTitle>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>
              Monthly export volumes (in thousands)
            </span>
            <span className='@[540px]/card:hidden'>Monthly volumes</span>
          </CardDescription>
        </div>
        <div className='flex'>
          {['kilograms', 'boxes'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            if (!chart || total[key as keyof typeof total] === 0) return null;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className='data-[active=true]:bg-primary/5 hover:bg-primary/5 relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left transition-colors duration-200 even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6'
                onClick={() => setActiveChart(chart)}
              >
                <span className='text-muted-foreground text-xs'>
                  {chartConfig[chart].label}
                </span>
                <span className='text-lg leading-none font-bold sm:text-3xl'>
                  {total[key as keyof typeof total]?.toLocaleString()}K
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <BarChart
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
              <linearGradient id='fillBar' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='0%'
                  stopColor='var(--primary)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='100%'
                  stopColor='var(--primary)'
                  stopOpacity={0.2}
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
              tickFormatter={(value) => {
                return value.split(' ')[0]; // Show just month part
              }}
            />
            <ChartTooltip
              cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  nameKey={activeChart}
                  labelFormatter={(value) => {
                    return value;
                  }}
                  formatter={(value) => [
                    `${value}K`,
                    chartConfig[activeChart].label
                  ]}
                />
              }
            />
            <Bar
              dataKey={activeChart}
              fill={chartConfig[activeChart].color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
