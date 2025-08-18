'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { fullCargoApi } from '@/lib/fullcargo-api';
import { useDashboardFilters } from '@/contexts/dashboard-filters-context';

export function ShipmentsOverview() {
  const { filters } = useDashboardFilters();
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await fullCargoApi.getShipmentAnalytics(filters.season);
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [filters.season]);

  if (loading) {
    return (
      <Card className='h-full'>
        <CardHeader>
          <CardTitle>Recent Shipments</CardTitle>
          <CardDescription>Loading shipment data...</CardDescription>
        </CardHeader>
        <CardContent className='flex h-[300px] items-center justify-center'>
          <div className='text-muted-foreground animate-pulse'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className='h-full'>
        <CardHeader>
          <CardTitle>Recent Shipments</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className='flex h-[300px] items-center justify-center'>
          <div className='text-muted-foreground'>No shipment data found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Shipments</CardTitle>
        <CardDescription>
          Top shipments from season {filters.season.replace('_', '-')} (
          {analytics.totals.shipments.toLocaleString()} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {/* Summary Stats */}
          <div className='grid grid-cols-3 gap-4 text-center'>
            <div>
              <div className='text-primary text-2xl font-bold'>
                {analytics.totals.shipments.toLocaleString()}
              </div>
              <div className='text-muted-foreground text-xs'>Shipments</div>
            </div>
            <div>
              <div className='text-2xl font-bold text-green-600'>
                {analytics.totals.boxes.toLocaleString()}
              </div>
              <div className='text-muted-foreground text-xs'>Boxes</div>
            </div>
            <div>
              <div className='text-2xl font-bold text-blue-600'>
                {(analytics.totals.kilograms / 1000).toFixed(1)}K
              </div>
              <div className='text-muted-foreground text-xs'>Kilograms</div>
            </div>
          </div>

          {/* Top Species */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium'>Top Species by Volume</h4>
            {analytics.topSpecies
              .slice(0, 5)
              .map((species: any, index: number) => (
                <div key={species.name} className='flex items-center'>
                  <Avatar className='h-9 w-9'>
                    <AvatarFallback className='bg-primary/10 text-primary'>
                      {species.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='ml-4 space-y-1'>
                    <p className='text-sm leading-none font-medium'>
                      {species.name}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {species.shipments} shipments
                    </p>
                  </div>
                  <div className='ml-auto text-right'>
                    <div className='text-sm font-medium'>
                      {(species.kilograms / 1000).toFixed(1)}K kg
                    </div>
                    <div className='text-muted-foreground text-xs'>
                      {species.boxes.toLocaleString()} boxes
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
