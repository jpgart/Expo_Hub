'use client';

import * as React from 'react';
import { IconTrendingUp } from '@tabler/icons-react';
import { Label, Pie, PieChart } from 'recharts';

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
  distribution: {
    species: Array<{ name: string; value: number }>;
    markets: Array<{ name: string; value: number }>;
  };
  topExporters: Array<{
    name: string;
    kilograms: number;
    boxes: number;
  }>;
}

const chartConfig = {
  value: {
    label: 'Value'
  },
  exporter1: {
    label: 'Top Exporter',
    color: 'hsl(var(--chart-1))'
  },
  exporter2: {
    label: '2nd Exporter',
    color: 'hsl(var(--chart-2))'
  },
  exporter3: {
    label: '3rd Exporter',
    color: 'hsl(var(--chart-3))'
  },
  exporter4: {
    label: '4th Exporter',
    color: 'hsl(var(--chart-4))'
  },
  other: {
    label: 'Others',
    color: 'hsl(var(--chart-5))'
  }
} satisfies ChartConfig;

interface PieGraphProps {
  data?: DashboardData;
}

export function PieGraph({ data }: PieGraphProps) {
  const chartData = React.useMemo(() => {
    if (!data?.topExporters?.length) return [];
    const top4 = data.topExporters.slice(0, 4);
    const totalTop4 = top4.reduce((acc, exp) => acc + exp.kilograms, 0);
    const totalAll = data.topExporters.reduce(
      (acc, exp) => acc + exp.kilograms,
      0
    );
    const others = totalAll - totalTop4;

    const result = [
      ...top4.map((exp, idx) => ({
        name: exp.name.split(' ')[0], // First word only
        value: Math.round(exp.kilograms / 1000), // Convert to thousands
        fill: `hsl(var(--chart-${idx + 1}))`
      }))
    ];

    if (others > 0) {
      result.push({
        name: 'Others',
        value: Math.round(others / 1000),
        fill: 'hsl(var(--chart-5))'
      });
    }

    return result;
  }, [data]);

  const totalValue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  if (!data?.topExporters?.length) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Top Exporters</CardTitle>
          <CardDescription>Loading exporter data...</CardDescription>
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
        <CardTitle>Top Exporters Distribution</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Export volume distribution by top exporters (in thousands kg)
          </span>
          <span className='@[540px]/card:hidden'>Exporter distribution</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-[250px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey='value'
              nameKey='name'
              innerRadius={60}
              strokeWidth={2}
              stroke='var(--background)'
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalValue}K
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Total Kg
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 leading-none font-medium'>
          {chartData[0]?.name} leads with{' '}
          {chartData.length > 0
            ? ((chartData[0].value / totalValue) * 100).toFixed(1)
            : 0}
          % <IconTrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>
          Based on total export volumes
        </div>
      </CardFooter>
    </Card>
  );
}
