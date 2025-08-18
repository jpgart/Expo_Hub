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
  IconPackage
} from '@tabler/icons-react';
import {
  formatKilograms,
  formatBoxes,
  formatPercentage,
  formatYoYChange
} from '@/lib/format';
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

  const kpiData = [
    {
      title: 'Total Kilograms',
      value: globalKpi ? formatKilograms(globalKpi.kilograms) : 'Loading...',
      subtitle: 'All shipments',
      icon: IconPackage,
      trend: globalKpi?.yoyKg || 0,
      trendLabel: 'vs prev season',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Total Boxes',
      value: globalKpi ? formatBoxes(globalKpi.boxes) : 'Loading...',
      subtitle: 'All shipments',
      icon: IconTruck,
      trend: globalKpi?.yoyBoxes || 0,
      trendLabel: 'vs prev season',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Avg Kg/Box',
      value: globalKpi.kgPerBox ? `${globalKpi.kgPerBox.toFixed(1)} kg` : 'N/A',
      subtitle: 'Efficiency metric',
      icon: IconLeaf,
      trend: null,
      trendLabel: '',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      title: 'Active Importers',
      value: globalKpi
        ? globalKpi.importersActive.toLocaleString()
        : 'Loading...',
      subtitle: 'Unique importers',
      icon: IconUsers,
      trend: globalKpi?.importersRetention || 0,
      trendLabel: 'retention rate',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950'
    },
    {
      title: 'Active Varieties',
      value: globalKpi
        ? globalKpi.varietiesActive.toLocaleString()
        : 'Loading...',
      subtitle: 'Unique varieties',
      icon: IconLeaf,
      trend: null,
      trendLabel: '',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950'
    },
    {
      title: 'Top Exporter',
      value: exportersKpi[0]?.exporterName || 'N/A',
      subtitle: exportersKpi[0]
        ? formatKilograms(exportersKpi[0].kilograms)
        : '',
      icon: IconBuilding,
      trend: null,
      trendLabel: '',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950'
    },
    {
      title: 'Exporters Count',
      value: exportersKpi.length.toString(),
      subtitle: 'Active exporters',
      icon: IconBuilding,
      trend: null,
      trendLabel: '',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950'
    },
    {
      title: 'Market Coverage',
      value: 'Global',
      subtitle: 'Multiple markets',
      icon: IconShip,
      trend: null,
      trendLabel: '',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 dark:bg-rose-950'
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
                      {formatKilograms(exporter.kilograms)}
                    </div>
                    <div className='text-muted-foreground text-xs'>
                      {formatBoxes(exporter.boxes)}
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
