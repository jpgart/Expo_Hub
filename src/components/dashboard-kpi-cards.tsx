'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IconBuilding,
  IconShip,
  IconLeaf,
  IconTruck
} from '@tabler/icons-react';
import { fullCargoApi } from '@/lib/fullcargo-api';
import { useDashboardFilters } from '@/contexts/dashboard-filters-context';

interface DashboardKPIs {
  exporters: number;
  importers: number;
  species: number;
  varieties: number;
  shipments: number;
}

export function DashboardKPICards() {
  const { filters } = useDashboardFilters();
  const [kpis, setKpis] = React.useState<DashboardKPIs>({
    exporters: 0,
    importers: 0,
    species: 0,
    varieties: 0,
    shipments: 0
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadKPIs() {
      try {
        setLoading(true);
        const data = await fullCargoApi.getDashboardKPIs(filters.season);
        setKpis(data);
      } catch (error) {
        console.error('Error loading dashboard KPIs:', error);
      } finally {
        setLoading(false);
      }
    }

    loadKPIs();
  }, [filters.season]);

  if (loading) {
    return (
      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} data-slot='card'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>...</div>
              <p className='text-muted-foreground text-xs'>Loading data...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
      {/* Top Left: Exporters */}
      <Card data-slot='card'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Exporters</CardTitle>
          <IconBuilding className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-primary text-2xl font-bold'>
            {kpis.exporters.toLocaleString()}
          </div>
          <p className='text-muted-foreground text-xs'>
            Active export companies
          </p>
        </CardContent>
      </Card>

      {/* Mid Left: Importers */}
      <Card data-slot='card'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Importers</CardTitle>
          <IconShip className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-green-600'>
            {kpis.importers.toLocaleString()}
          </div>
          <p className='text-muted-foreground text-xs'>
            Active import companies
          </p>
        </CardContent>
      </Card>

      {/* Mid Right: Species */}
      <Card data-slot='card'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Species</CardTitle>
          <IconLeaf className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-blue-600'>
            {kpis.species.toLocaleString()}
          </div>
          <p className='text-muted-foreground text-xs'>
            {kpis.varieties.toLocaleString()} varieties available
          </p>
        </CardContent>
      </Card>

      {/* Top Right: Shipments */}
      <Card data-slot='card'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Shipments</CardTitle>
          <IconTruck className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-orange-600'>
            {kpis.shipments.toLocaleString()}
          </div>
          <p className='text-muted-foreground text-xs'>
            Season {filters.season.replace('_', '-')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
