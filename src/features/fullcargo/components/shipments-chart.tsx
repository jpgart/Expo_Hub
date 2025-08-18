'use client';

import { IconTrendingUp } from '@tabler/icons-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';

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
import { useEffect, useState } from 'react';
import { fullCargoApi } from '@/lib/fullcargo-api';
import { useDashboardFilters } from '@/contexts/dashboard-filters-context';

const chartConfig = {
  boxes: {
    label: 'Boxes',
    color: 'var(--primary)'
  },
  kilograms: {
    label: 'Kilograms',
    color: 'hsl(var(--primary))'
  }
} satisfies ChartConfig;

export function ShipmentsChart() {
  const { filters } = useDashboardFilters();
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMonthlyData() {
      try {
        let data;

        if (filters.season === 'all') {
          // For all seasons, aggregate data by month
          const allSeasons = [
            '2024_2025',
            '2023_2024',
            '2022_2023',
            '2021_2022'
          ];
          const seasonData = await Promise.all(
            allSeasons.map((season) => fullCargoApi.getWeeklyShipments(season))
          );

          // Aggregate by month across all seasons
          const monthlyAggregated: { [key: string]: any } = {};
          seasonData.forEach((seasonShipments) => {
            seasonShipments.forEach((shipment: any) => {
              // Extract month from week (assuming week format like "2024-W01")
              const monthKey = shipment.week.substring(0, 7); // "2024-01"
              if (!monthlyAggregated[monthKey]) {
                monthlyAggregated[monthKey] = {
                  month: monthKey,
                  boxes: 0,
                  kilograms: 0
                };
              }
              monthlyAggregated[monthKey].boxes += shipment.boxes || 0;
              monthlyAggregated[monthKey].kilograms += shipment.kilograms || 0;
            });
          });

          data = Object.values(monthlyAggregated).sort((a, b) =>
            a.month.localeCompare(b.month)
          );
        } else {
          data = await fullCargoApi.getWeeklyShipments(filters.season);
        }

        // Group weekly data by month for better visualization
        const monthlyGrouped: { [key: string]: any } = {};
        data.forEach((item: any) => {
          // Extract month from week (assuming week format like "2024-W01")
          const monthKey = item.week.substring(0, 7); // "2024-01"
          if (!monthlyGrouped[monthKey]) {
            monthlyGrouped[monthKey] = {
              month: monthKey,
              boxes: 0,
              kilograms: 0
            };
          }
          monthlyGrouped[monthKey].boxes += item.boxes || 0;
          monthlyGrouped[monthKey].kilograms += item.kilograms || 0;
        });

        // Convert to array and take last 12 months
        const monthlyData = Object.values(monthlyGrouped)
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-12)
          .map((item) => ({
            month: item.month,
            boxes: Math.round(item.boxes),
            kilograms: Math.round(item.kilograms / 1000) // Convert to tons
          }));

        setMonthlyData(monthlyData);
      } catch (error) {
        console.error('Error loading monthly data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadMonthlyData();
  }, [filters.season]);

  if (loading) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Monthly Shipments</CardTitle>
          <CardDescription>Loading shipment data...</CardDescription>
        </CardHeader>
        <CardContent className='flex h-[250px] items-center justify-center'>
          <div className='text-muted-foreground animate-pulse'>
            Loading chart...
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBoxes = monthlyData.reduce((sum, item) => sum + item.boxes, 0);
  const totalTons = monthlyData.reduce((sum, item) => sum + item.kilograms, 0);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Monthly Shipments</CardTitle>
        <CardDescription>
          Showing shipment volumes for the last 12 months{' '}
          {filters.season === 'all'
            ? '(All Seasons)'
            : `(Season ${filters.season.replace('_', '-')})`}
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <AreaChart
            data={monthlyData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
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
              dataKey='month'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}K`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator='dot'
                  labelFormatter={(value) => `Month ${value}`}
                  formatter={(value, name) => [
                    name === 'boxes'
                      ? `${value.toLocaleString()} boxes`
                      : `${value} tons`,
                    name === 'boxes' ? 'Boxes' : 'Weight (tons)'
                  ]}
                />
              }
            />
            <Area
              dataKey='boxes'
              type='natural'
              fill='url(#fillBoxes)'
              fillOpacity={0.4}
              stroke='var(--color-boxes)'
              stackId='a'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 leading-none font-medium'>
              Last 12 months: {totalBoxes.toLocaleString()} boxes,{' '}
              {totalTons.toLocaleString()} tons
              <IconTrendingUp className='h-4 w-4' />
            </div>
            <div className='text-muted-foreground flex items-center gap-2 leading-none'>
              Real data from FullCargo shipments
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
