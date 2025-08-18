'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { fullCargoApi } from '@/lib/fullcargo-api';
import { useDashboardFilters } from '@/contexts/dashboard-filters-context';

const chartConfig = {
  kilograms: {
    label: 'Kilograms',
    color: 'var(--primary)'
  },
  boxes: {
    label: 'Boxes',
    color: 'hsl(var(--primary))'
  }
} satisfies ChartConfig;

export function CountriesBarChart() {
  const { filters } = useDashboardFilters();
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeChart, setActiveChart] = React.useState<'kilograms' | 'boxes'>(
    'kilograms'
  );
  const [selectedSpecies, setSelectedSpecies] = React.useState<string>('all');
  const [speciesList, setSpeciesList] = React.useState<
    Array<{ id: number; name: string }>
  >([]);

  // Load species list for filter
  React.useEffect(() => {
    async function loadSpecies() {
      try {
        const species = await fullCargoApi.getSpecies();
        setSpeciesList(species);
      } catch (error) {
        console.error('Error loading species:', error);
      }
    }
    loadSpecies();
  }, []);

  React.useEffect(() => {
    async function loadCountriesData() {
      try {
        setLoading(true);
        let analytics;

        if (filters.season === 'all') {
          // For all seasons, we'll need to aggregate data
          const allSeasons = [
            '2024_2025',
            '2023_2024',
            '2022_2023',
            '2021_2022'
          ];
          const seasonData = await Promise.all(
            allSeasons.map((season) =>
              fullCargoApi.getShipmentAnalytics(season)
            )
          );

          // Aggregate data across seasons
          const aggregatedCountries: { [key: string]: any } = {};
          seasonData.forEach((seasonAnalytics) => {
            seasonAnalytics.topCountries.forEach((country: any) => {
              if (!aggregatedCountries[country.name]) {
                aggregatedCountries[country.name] = {
                  name: country.name,
                  kilograms: 0,
                  boxes: 0,
                  shipments: 0
                };
              }
              aggregatedCountries[country.name].kilograms += country.kilograms;
              aggregatedCountries[country.name].boxes += country.boxes;
              aggregatedCountries[country.name].shipments += country.shipments;
            });
          });

          analytics = {
            topCountries: Object.values(aggregatedCountries).sort(
              (a: any, b: any) => b.kilograms - a.kilograms
            )
          };
        } else {
          analytics = await fullCargoApi.getShipmentAnalytics(filters.season);
        }

        // Filter by species if selected
        let filteredCountries = analytics.topCountries;
        if (selectedSpecies !== 'all') {
          // Note: This is a simplified filter. In a real implementation,
          // you'd want to filter at the database level for better performance
          filteredCountries = analytics.topCountries.filter(
            (country: any) =>
              country.species && country.species.includes(selectedSpecies)
          );
        }

        // Get top 8 countries for bar chart
        const topCountries = filteredCountries.slice(0, 8);

        const data = topCountries.map((country) => ({
          country:
            country.name.length > 12
              ? country.name.substring(0, 12) + '...'
              : country.name,
          kilograms: Math.round(country.kilograms / 1000), // Convert to tons
          boxes: country.boxes,
          shipments: country.shipments
        }));

        setChartData(data);
      } catch (error) {
        console.error('Error loading countries data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCountriesData();
  }, [filters.season, selectedSpecies]);

  const total = React.useMemo(
    () => ({
      kilograms: chartData.reduce((acc, curr) => acc + curr.kilograms, 0),
      boxes: chartData.reduce((acc, curr) => acc + curr.boxes, 0)
    }),
    [chartData]
  );

  if (loading) {
    return (
      <Card className='@container/card !pt-3'>
        <CardHeader>
          <CardTitle>Countries by Volume</CardTitle>
          <CardDescription>Loading countries data...</CardDescription>
        </CardHeader>
        <CardContent className='flex h-[250px] items-center justify-center'>
          <div className='text-muted-foreground animate-pulse'>
            Loading chart...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='@container/card !pt-3'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 !py-0'>
          <CardTitle>Countries by Volume</CardTitle>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>
              Top destination countries{' '}
              {filters.season === 'all'
                ? '(All Seasons)'
                : `(Season ${filters.season.replace('_', '-')})`}
            </span>
            <span className='@[540px]/card:hidden'>Top countries</span>
          </CardDescription>
        </div>
        <div className='flex flex-col gap-2 px-6 py-3'>
          {/* Species Filter */}
          <div className='flex items-center gap-2'>
            <label className='text-muted-foreground text-xs'>Species:</label>
            <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
              <SelectTrigger className='h-8 w-[120px] text-xs'>
                <SelectValue placeholder='All species' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Species</SelectItem>
                {speciesList.map((species) => (
                  <SelectItem key={species.id} value={species.name}>
                    {species.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chart Type Toggle */}
          <div className='flex'>
            {['kilograms', 'boxes'].map((key) => {
              const chart = key as keyof typeof chartConfig;
              return (
                <button
                  key={chart}
                  onClick={() => setActiveChart(chart)}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    activeChart === chart
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {chartConfig[chart].label}
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
            <XAxis
              dataKey='country'
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickMargin={8}
              tickFormatter={(value) =>
                activeChart === 'kilograms'
                  ? `${value}K`
                  : value.toLocaleString()
              }
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <ChartTooltipContent>
                      <div className='grid grid-cols-2 gap-2'>
                        <div className='flex flex-col'>
                          <span className='text-muted-foreground text-[0.70rem] uppercase'>
                            Country
                          </span>
                          <span className='text-muted-foreground font-bold'>
                            {payload[0].payload.country}
                          </span>
                        </div>
                        <div className='flex flex-col'>
                          <span className='text-muted-foreground text-[0.70rem] uppercase'>
                            {activeChart === 'kilograms' ? 'Tons' : 'Boxes'}
                          </span>
                          <span className='font-bold'>
                            {activeChart === 'kilograms'
                              ? `${payload[0].value}K`
                              : payload[0].value?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </ChartTooltipContent>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey={activeChart}
              fill='currentColor'
              radius={[4, 4, 0, 0]}
              className='fill-primary'
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
