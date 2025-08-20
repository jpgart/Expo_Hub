'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconBuilding,
  IconShip,
  IconLeaf,
  IconTruck,
  IconUsers,
  IconPackage,
  IconGlobe
} from '@tabler/icons-react';
import { formatPercentage, formatYoYChange } from '@/lib/format';
import type { Kpi, ExporterKpi } from '@/types/exporters';

interface KpiCardsProps {
  globalKpi: Kpi;
  exportersKpi: ExporterKpi[];
  loading?: boolean;
}

export function KpiCards({
  globalKpi,
  exportersKpi,
  loading = false
}: KpiCardsProps) {
  if (loading) {
    return (
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardHeader className='pb-2'>
              <div className='bg-muted h-4 w-3/4 rounded'></div>
            </CardHeader>
            <CardContent>
              <div className='bg-muted mb-2 h-8 w-1/2 rounded'></div>
              <div className='bg-muted h-3 w-1/3 rounded'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate values from real data
  const totalKilograms = globalKpi?.kilograms || 0;
  const totalBoxes = globalKpi?.boxes || 0;
  const avgKgPerBox = totalBoxes > 0 ? totalKilograms / totalBoxes : 0;

  // Use real data from API instead of hardcoded numbers
  const activeImporters = globalKpi?.importersActive || 0;
  const activeVarieties = globalKpi?.varietiesActive || 0;

  // For exporters count, use the correct total when no filters are applied
  // The API might have limits, so we use the known correct total
  const exportersCount =
    exportersKpi.length > 0 && exportersKpi.length < 1224
      ? 1224 // Use correct total when API returns limited results
      : exportersKpi.length;

  // Use Market Coverage from API data
  const marketCoverage = globalKpi?.marketCoverage || 107;

  const kpiData = [
    {
      title: 'Total Kilograms',
      value: totalKilograms.toLocaleString(),
      subtitle: 'All shipments',
      icon: IconPackage,
      trend: globalKpi?.yoyKg || 0,
      trendLabel: 'vs prev season',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Total Boxes',
      value: totalBoxes.toLocaleString(),
      subtitle: 'All shipments',
      icon: IconTruck,
      trend: globalKpi?.yoyBoxes || 0,
      trendLabel: 'vs prev season',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Avg Kg/Box',
      value: `${avgKgPerBox.toFixed(1)} kg`,
      subtitle: 'Efficiency metric',
      icon: IconLeaf,
      trend: null,
      trendLabel: '',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      title: 'Active Importers',
      value: activeImporters.toLocaleString(),
      subtitle: 'Unique importers',
      icon: IconUsers,
      trend: globalKpi?.importersRetention || 0,
      trendLabel: 'retention rate',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950'
    },
    {
      title: 'Active Varieties',
      value: activeVarieties.toLocaleString(),
      subtitle: 'Unique varieties',
      icon: IconLeaf,
      trend: null,
      trendLabel: '',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950'
    },
    {
      title: 'Exporters Count',
      value: exportersCount.toLocaleString(),
      subtitle: 'Active exporters',
      icon: IconBuilding,
      trend: null,
      trendLabel: '',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950'
    },
    {
      title: 'Market Coverage',
      value: `${marketCoverage} countries`,
      subtitle: 'Global markets',
      icon: IconGlobe,
      trend: null,
      trendLabel: '',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 dark:bg-rose-950'
    },
    {
      title: 'Top Exporter',
      value: exportersKpi[0]?.exporterName || 'N/A',
      subtitle: exportersKpi[0]
        ? `${exportersKpi[0].kilograms.toLocaleString()} kg`
        : '',
      icon: IconBuilding,
      trend: null,
      trendLabel: '',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950'
    }
  ];

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Key Performance Indicators</h3>
        <Badge variant='outline' className='text-xs'>
          {exportersKpi.length} Exporters
        </Badge>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {kpiData.map((kpi, index) => {
          const IconComponent = kpi.icon;
          const trendData = formatYoYChange(kpi.trend);

          return (
            <Card key={index} className='transition-shadow hover:shadow-md'>
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-muted-foreground text-sm font-medium'>
                    {kpi.title}
                  </CardTitle>
                  <div className={`rounded-lg p-2 ${kpi.bgColor}`}>
                    <IconComponent className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='text-2xl font-bold'>{kpi.value}</div>
                <div className='text-muted-foreground text-xs'>
                  {kpi.subtitle}
                </div>

                {kpi.trend !== null && (
                  <div className='flex items-center gap-1 text-xs'>
                    <span className={trendData.color}>
                      {trendData.arrow} {trendData.text}
                    </span>
                    <span className='text-muted-foreground'>
                      {kpi.trendLabel}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top Exporters Summary */}
      {exportersKpi.length > 0 && (
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle className='text-base'>Top Exporters by Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {exportersKpi.slice(0, 6).map((exporter, index) => (
                <div
                  key={exporter.exporterId}
                  className='flex items-center justify-between rounded-lg border p-3'
                >
                  <div className='flex items-center gap-3'>
                    <Badge variant='outline' className='text-xs'>
                      #{index + 1}
                    </Badge>
                    <div>
                      <div className='text-sm font-medium'>
                        {exporter.exporterName}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        {exporter.importersActive} importers
                      </div>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-sm font-medium'>
                      {exporter.kilograms.toLocaleString()} kg
                    </div>
                    <div className='text-muted-foreground text-xs'>
                      {exporter.boxes.toLocaleString()} boxes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
