'use client';

import * as React from 'react';
import { DashboardFilters } from '@/components/dashboard-filters';

interface DashboardFiltersContextType {
  filters: DashboardFilters;
  setFilters: (filters: DashboardFilters) => void;
}

const DashboardFiltersContext = React.createContext<
  DashboardFiltersContextType | undefined
>(undefined);

export function DashboardFiltersProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [filters, setFilters] = React.useState<DashboardFilters>({
    season: 'all'
  });

  return (
    <DashboardFiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </DashboardFiltersContext.Provider>
  );
}

export function useDashboardFilters() {
  const context = React.useContext(DashboardFiltersContext);
  if (context === undefined) {
    throw new Error(
      'useDashboardFilters must be used within a DashboardFiltersProvider'
    );
  }
  return context;
}
