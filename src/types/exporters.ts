export type Filters = {
  seasonIds?: number[];
  exporterIds?: number[];
  speciesIds?: number[];
  varietyIds?: number[];
  marketIds?: number[];
  countryIds?: number[];
  regionIds?: number[];
  transportTypeIds?: number[];
  arrivalPortIds?: number[];
  weekFrom?: string; // "2024-W01"
  weekTo?: string; // "2025-W20"
  granularity?: 'week' | 'month' | 'season';
  metric?: 'kilograms' | 'boxes';
};

export type Kpi = {
  kilograms: number;
  boxes: number;
  kgPerBox: number | null;
  yoyKg: number | null;
  yoyBoxes: number | null;
  importersActive: number;
  importersRetention: number | null;
  varietiesActive: number;
};

export type ExporterKpi = Kpi & {
  exporterId: number;
  exporterName: string;
};

export type TimePoint = {
  period: string;
  kilograms: number;
  boxes: number;
  exporterId?: number;
  exporterName?: string;
};

export type Timeseries = TimePoint[];

export type TopItem = {
  id: number;
  name: string;
  kilograms: number;
  boxes: number;
  sharePct: number;
  exporterId?: number;
  exporterName?: string;
};

export type ExporterRanking = {
  exporterId: number;
  exporterName: string;
  seasonId: number;
  seasonName: string;
  kilograms: number;
  boxes: number;
  rank: number;
};

export type ExporterProfile = {
  id: number;
  name: string;
  totalKilograms: number;
  totalBoxes: number;
  avgKgPerBox: number | null;
  seasonsActive: number;
  topMarkets: TopItem[];
  topCountries: TopItem[];
  topSpecies: TopItem[];
  topVarieties: TopItem[];
  topImporters: TopItem[];
  topArrivalPorts: TopItem[];
  transportSplit: TopItem[];
};

export type ChartData = {
  timeseries: Timeseries;
  topImporters: TopItem[];
  topMarkets: TopItem[];
  topCountries: TopItem[];
  topVarieties: TopItem[];
  transportSplit: TopItem[];
  arrivalPorts: TopItem[];
  rankings: ExporterRanking[];
};

export type ExporterComparison = {
  exporterId: number;
  exporterName: string;
  normalizedData: TimePoint[];
  totalKilograms: number;
  totalBoxes: number;
  growthRate: number;
};
