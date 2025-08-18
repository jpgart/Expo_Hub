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
import { fullCargoApi } from '@/lib/fullcargo-api';
import { useDashboardFilters } from '@/contexts/dashboard-filters-context';

// Dynamic colors for species - improved contrast and visibility
const colors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16' // Lime
];

export function SpeciesPieChart() {
  const { filters } = useDashboardFilters();
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [chartConfig, setChartConfig] = React.useState<ChartConfig>({});
  const [loading, setLoading] = React.useState(true);
  const [totalKilograms, setTotalKilograms] = React.useState(0);

  React.useEffect(() => {
    async function loadSpeciesData() {
      try {
        const analytics = await fullCargoApi.getShipmentAnalytics(
          filters.season
        );

        // Get top 6 species for pie chart
        const topSpecies = analytics.topSpecies.slice(0, 6);

        // Prepare chart data
        const data = topSpecies.map((species, index) => ({
          species: species.name,
          kilograms: Math.round(species.kilograms),
          fill: colors[index % colors.length]
        }));

        // Create chart config
        const config: ChartConfig = {
          kilograms: {
            label: 'Kilograms'
          }
        };

        topSpecies.forEach((species, index) => {
          config[species.name.toLowerCase().replace(/\s+/g, '_')] = {
            label: species.name,
            color: colors[index % colors.length]
          };
        });

        setChartData(data);
        setChartConfig(config);
        setTotalKilograms(analytics.totals.kilograms);
      } catch (error) {
        console.error('Error loading species data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSpeciesData();
  }, [filters.season]);

  const totalSpeciesShown = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.kilograms, 0);
  }, [chartData]);

  if (loading) {
    return (
      <Card className='flex flex-col'>
        <CardHeader className='items-center pb-0'>
          <CardTitle>Species Distribution</CardTitle>
          <CardDescription>Loading species data...</CardDescription>
        </CardHeader>
        <CardContent className='flex-1 pb-0'>
          <div className='mx-auto flex aspect-square max-h-[250px] items-center justify-center'>
            <div className='text-muted-foreground animate-pulse'>
              Loading chart...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Species Distribution</CardTitle>
        <CardDescription>
          Top species by volume (Season 2024-2025)
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[250px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => [
                    `${Number(value).toLocaleString()} kg`,
                    name
                  ]}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey='kilograms'
              nameKey='species'
              innerRadius={60}
              strokeWidth={5}
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
                          {(totalSpeciesShown / 1000000).toFixed(1)}M
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'
                        >
                          Kilograms
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
          Top 6 species representing{' '}
          {((totalSpeciesShown / totalKilograms) * 100).toFixed(1)}% of total
          volume
          <IconTrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>
          Data from {chartData.length} species in season 2024-2025
        </div>
      </CardFooter>
    </Card>
  );
}
