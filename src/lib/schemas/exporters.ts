import { z } from 'zod';

// Base schema for filters
export const exportersFiltersSchema = z.object({
  seasonIds: z.array(z.number()).optional(),
  exporterIds: z.array(z.number()).optional(),
  speciesIds: z.array(z.number()).optional(),
  varietyIds: z.array(z.number()).optional(),
  marketIds: z.array(z.number()).optional(),
  countryIds: z.array(z.number()).optional(),
  regionIds: z.array(z.number()).optional(),
  transportTypeIds: z.array(z.number()).optional(),
  arrivalPortIds: z.array(z.number()).optional(),
  weekFrom: z
    .string()
    .regex(/^\d{4}-W\d{2}$/)
    .optional(),
  weekTo: z
    .string()
    .regex(/^\d{4}-W\d{2}$/)
    .optional(),
  granularity: z.enum(['week', 'month', 'season']).default('week'),
  metric: z.enum(['kilograms', 'boxes']).default('kilograms')
});

// Schema for URL query parameters
export const urlFiltersSchema = z.object({
  seasons: z.string().optional(),
  exporters: z.string().optional(),
  species: z.string().optional(),
  varieties: z.string().optional(),
  markets: z.string().optional(),
  countries: z.string().optional(),
  regions: z.string().optional(),
  transport: z.string().optional(),
  arrivalPorts: z.string().optional(),
  weekFrom: z.string().optional(),
  weekTo: z.string().optional(),
  granularity: z.enum(['week', 'month', 'season']).optional(),
  metric: z.enum(['kilograms', 'boxes']).optional()
});

// Schema for form submission
export const formFiltersSchema = z.object({
  seasonIds: z.array(z.number()).default([]),
  exporterIds: z.array(z.number()).default([]),
  speciesIds: z.array(z.number()).default([]),
  varietyIds: z.array(z.number()).default([]),
  marketIds: z.array(z.number()).default([]),
  countryIds: z.array(z.number()).default([]),
  regionIds: z.array(z.number()).default([]),
  transportTypeIds: z.array(z.number()).default([]),
  arrivalPortIds: z.array(z.number()).default([]),
  weekFrom: z.string().optional(),
  weekTo: z.string().optional(),
  granularity: z.enum(['week', 'month', 'season']).default('week'),
  metric: z.enum(['kilograms', 'boxes']).default('kilograms')
});

// Schema for exporter comparison
export const exporterComparisonSchema = z.object({
  exporterIds: z
    .array(z.number())
    .min(2, 'Select at least 2 exporters to compare')
    .max(5, 'Maximum 5 exporters for comparison'),
  metric: z.enum(['kilograms', 'boxes']).default('kilograms'),
  granularity: z.enum(['week', 'month', 'season']).default('week')
});

// Schema for date range
export const dateRangeSchema = z
  .object({
    weekFrom: z
      .string()
      .regex(/^\d{4}-W\d{2}$/, 'Invalid week format. Use YYYY-Www'),
    weekTo: z
      .string()
      .regex(/^\d{4}-W\d{2}$/, 'Invalid week format. Use YYYY-Www')
  })
  .refine(
    (data) => {
      if (!data.weekFrom || !data.weekTo) return true;

      const [yearFrom, weekFrom] = data.weekFrom.split('-W');
      const [yearTo, weekTo] = data.weekTo.split('-W');

      if (parseInt(yearFrom) > parseInt(yearTo)) return false;
      if (
        parseInt(yearFrom) === parseInt(yearTo) &&
        parseInt(weekFrom) > parseInt(weekTo)
      )
        return false;

      return true;
    },
    {
      message: 'Start week must be before or equal to end week',
      path: ['weekTo']
    }
  );

// Schema for search
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query too long'),
  type: z
    .enum([
      'exporters',
      'importers',
      'species',
      'varieties',
      'markets',
      'countries'
    ])
    .default('exporters'),
  limit: z.number().min(1).max(100).default(20)
});

// Schema for export
export const exportSchema = z.object({
  format: z.enum(['csv', 'xlsx']).default('csv'),
  includeDetails: z.boolean().default(false),
  dateRange: dateRangeSchema.optional()
});

// Helper function to parse comma-separated string to array of numbers
export function parseCommaSeparatedNumbers(
  value: string | undefined
): number[] {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => parseInt(v.trim()))
    .filter((n) => !isNaN(n));
}

// Helper function to convert filters to URL params
export function filtersToUrlParams(
  filters: z.infer<typeof formFiltersSchema>
): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.seasonIds.length > 0)
    params.seasons = filters.seasonIds.join(',');
  if (filters.exporterIds.length > 0)
    params.exporters = filters.exporterIds.join(',');
  if (filters.speciesIds.length > 0)
    params.species = filters.speciesIds.join(',');
  if (filters.varietyIds.length > 0)
    params.varieties = filters.varietyIds.join(',');
  if (filters.marketIds.length > 0)
    params.markets = filters.marketIds.join(',');
  if (filters.countryIds.length > 0)
    params.countries = filters.countryIds.join(',');
  if (filters.regionIds.length > 0)
    params.regions = filters.regionIds.join(',');
  if (filters.transportTypeIds.length > 0)
    params.transport = filters.transportTypeIds.join(',');
  if (filters.arrivalPortIds.length > 0)
    params.arrivalPorts = filters.arrivalPortIds.join(',');
  if (filters.weekFrom) params.weekFrom = filters.weekFrom;
  if (filters.weekTo) params.weekTo = filters.weekTo;
  if (filters.granularity !== 'week') params.granularity = filters.granularity;
  if (filters.metric !== 'kilograms') params.metric = filters.metric;

  return params;
}

// Helper function to convert URL params to filters
export function urlParamsToFilters(
  params: Record<string, string>
): z.infer<typeof formFiltersSchema> {
  return {
    seasonIds: parseCommaSeparatedNumbers(params.seasons),
    exporterIds: parseCommaSeparatedNumbers(params.exporters),
    speciesIds: parseCommaSeparatedNumbers(params.species),
    varietyIds: parseCommaSeparatedNumbers(params.varieties),
    marketIds: parseCommaSeparatedNumbers(params.markets),
    countryIds: parseCommaSeparatedNumbers(params.countries),
    regionIds: parseCommaSeparatedNumbers(params.regions),
    transportTypeIds: parseCommaSeparatedNumbers(params.transport),
    arrivalPortIds: parseCommaSeparatedNumbers(params.arrivalPorts),
    weekFrom: params.weekFrom,
    weekTo: params.weekTo,
    granularity: (params.granularity as 'week' | 'month' | 'season') || 'week',
    metric: (params.metric as 'kilograms' | 'boxes') || 'kilograms'
  };
}

// Default filters
export const defaultFilters: z.infer<typeof formFiltersSchema> = {
  seasonIds: [],
  exporterIds: [],
  speciesIds: [],
  varietyIds: [],
  marketIds: [],
  countryIds: [],
  regionIds: [],
  transportTypeIds: [],
  arrivalPortIds: [],
  weekFrom: undefined,
  weekTo: undefined,
  granularity: 'week',
  metric: 'kilograms'
};

// Validation error messages
export const validationMessages = {
  required: 'This field is required',
  invalidWeek: 'Invalid week format. Use YYYY-Www (e.g., 2024-W01)',
  invalidDateRange: 'Start date must be before end date',
  maxExporters: 'Maximum 5 exporters for comparison',
  minExporters: 'Select at least 2 exporters to compare'
} as const;
