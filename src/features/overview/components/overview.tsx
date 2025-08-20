'use client';

import * as React from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction
} from '@/components/ui/card';

import { AreaGraph } from './area-graph';
import { BarGraph } from './bar-graph';
import { PieGraph } from './pie-graph';

import {
  IconTrendingUp,
  IconTrendingDown,
  IconBuilding,
  IconPackage,
  IconUsers,
  IconTruck
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { ThemeSelector } from '@/components/theme-selector';
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';

interface DashboardData {
  kpis: {
    totalExporters: number;
    totalKilograms: number;
    totalBoxes: number;
    totalImporters: number; // Changed from averagePerExporter
  };
  topExporters: Array<{
    name: string;
    kilograms: number;
    boxes: number;
  }>;
  trends: Array<{
    period: string;
    kilograms: number;
    boxes: number;
  }>;
  distribution: {
    species: Array<{ name: string; value: number }>;
    markets: Array<{ name: string; value: number }>;
  };
}

export default function OverViewPage() {
  const [data, setData] = React.useState<DashboardData | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load dashboard data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex flex-col items-center justify-center space-y-6'>
          <h1 className='text-center text-4xl font-bold tracking-tight'>
            Data Hub Platform
          </h1>
          <div className='flex items-center space-x-2'>
            <ThemeSelector />
            <ModeToggle />
            <Button>Download</Button>
          </div>
        </div>
        <div className='space-y-8'>
          <div className='space-y-4'>
            {loading ? (
              <div className='grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className='@container/card animate-pulse'>
                    <CardHeader>
                      <CardDescription>Loading...</CardDescription>
                      <div className='bg-muted h-8 w-24 rounded'></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className='mx-4 lg:mx-6'>
                <CardContent className='flex h-32 items-center justify-center'>
                  <p className='text-destructive'>Error: {error}</p>
                </CardContent>
              </Card>
            ) : data ? (
              <div className='grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6'>
                <Card className='@container/card'>
                  <CardHeader>
                    <CardDescription>Total Exporters</CardDescription>
                    <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                      {formatNumber(data.kpis.totalExporters)}
                    </CardTitle>
                    <CardAction>
                      <Badge variant='outline' className='whitespace-nowrap'>
                        <IconBuilding className='mr-1 h-3 w-3' />
                        Active
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                    <div className='line-clamp-1 flex gap-2 font-medium'>
                      Chilean fruit exporters{' '}
                      <IconBuilding className='size-4' />
                    </div>
                    <div className='text-muted-foreground'>
                      Total registered companies
                    </div>
                  </CardFooter>
                </Card>
                <Card className='@container/card'>
                  <CardHeader>
                    <CardDescription>Total Volume (Kg)</CardDescription>
                    <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                      {formatNumber(data.kpis.totalKilograms)}
                    </CardTitle>
                    <CardAction>
                      <Badge variant='outline' className='whitespace-nowrap'>
                        <IconPackage className='mr-1 h-3 w-3' />
                        Kg
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                    <div className='line-clamp-1 flex gap-2 font-medium'>
                      Total exported volume <IconPackage className='size-4' />
                    </div>
                    <div className='text-muted-foreground'>
                      All seasons combined
                    </div>
                  </CardFooter>
                </Card>
                <Card className='@container/card'>
                  <CardHeader>
                    <CardDescription>Total Boxes</CardDescription>
                    <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                      {formatNumber(data.kpis.totalBoxes)}
                    </CardTitle>
                    <CardAction>
                      <Badge variant='outline' className='whitespace-nowrap'>
                        <IconTruck className='mr-1 h-3 w-3' />
                        Units
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                    <div className='line-clamp-1 flex gap-2 font-medium'>
                      Total shipped boxes <IconTruck className='size-4' />
                    </div>
                    <div className='text-muted-foreground'>
                      Export packaging units
                    </div>
                  </CardFooter>
                </Card>
                <Card className='@container/card'>
                  <CardHeader>
                    <CardDescription>Total Importers</CardDescription>
                    <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                      {formatNumber(data.kpis.totalImporters)}
                    </CardTitle>
                    <CardAction>
                      <Badge variant='outline' className='whitespace-nowrap'>
                        <IconUsers className='mr-1 h-3 w-3' />
                        Importers
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                    <div className='line-clamp-1 flex gap-2 font-medium'>
                      Active importers <IconUsers className='size-4' />
                    </div>
                    <div className='text-muted-foreground'>
                      Total active import companies
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ) : null}
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
              <div className='lg:col-span-2'>
                <BarGraph data={data} />
              </div>
              <div className='lg:col-span-1'>
                <AreaGraph data={data} />
              </div>
              <div className='lg:col-span-1'>
                <PieGraph data={data} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
