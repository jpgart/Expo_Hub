-- ========================================
-- EXPORTERS ANALYTICS - SUPABASE SETUP
-- ========================================
-- This file contains the SQL setup for the Exporters Analytics page
-- Run this in your Supabase SQL editor

-- ========================================
-- 1. CREATE UNIFIED SHIPMENTS VIEW
-- ========================================

CREATE OR REPLACE VIEW unified_shipments AS
SELECT 
    id, 
    season_id, 
    etd_week, 
    region_id, 
    market_id, 
    country_id,
    transport_type_id, 
    species_id, 
    variety_id, 
    importer_id,
    exporter_id, 
    arrival_port_id, 
    boxes, 
    kilograms, 
    created_at, 
    updated_at
FROM shipments_2024_2025
UNION ALL
SELECT 
    id, 
    season_id, 
    etd_week, 
    region_id, 
    market_id, 
    country_id,
    transport_type_id, 
    species_id, 
    variety_id, 
    importer_id,
    exporter_id, 
    arrival_port_id, 
    boxes, 
    kilograms, 
    created_at, 
    updated_at
FROM shipments_2023_2024
UNION ALL
SELECT 
    id, 
    season_id, 
    etd_week, 
    region_id, 
    market_id, 
    country_id,
    transport_type_id, 
    species_id, 
    variety_id, 
    importer_id,
    exporter_id, 
    arrival_port_id, 
    boxes, 
    kilograms, 
    created_at, 
    updated_at
FROM shipments_2022_2023
UNION ALL
SELECT 
    id, 
    season_id, 
    etd_week, 
    region_id, 
    market_id, 
    country_id,
    transport_type_id, 
    species_id, 
    variety_id, 
    importer_id,
    exporter_id, 
    arrival_port_id, 
    boxes, 
    kilograms, 
    created_at, 
    updated_at
FROM shipments_2021_2022;

-- ========================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- Create indexes on the unified view for better performance
CREATE INDEX IF NOT EXISTS idx_unified_shipments_exporter_id ON unified_shipments(exporter_id);
CREATE INDEX IF NOT EXISTS idx_unified_shipments_season_id ON unified_shipments(season_id);
CREATE INDEX IF NOT EXISTS idx_unified_shipments_etd_week ON unified_shipments(etd_week);
CREATE INDEX IF NOT EXISTS idx_unified_shipments_market_id ON unified_shipments(market_id);
CREATE INDEX IF NOT EXISTS idx_unified_shipments_country_id ON unified_shipments(country_id);
CREATE INDEX IF NOT EXISTS idx_unified_shipments_variety_id ON unified_shipments(variety_id);
CREATE INDEX IF NOT EXISTS idx_unified_shipments_importer_id ON unified_shipments(importer_id);
CREATE INDEX IF NOT EXISTS idx_unified_shipments_transport_type_id ON unified_shipments(transport_type_id);
CREATE INDEX IF NOT EXISTS idx_unified_shipments_arrival_port_id ON unified_shipments(arrival_port_id);

-- ========================================
-- 3. CREATE RPC FUNCTIONS
-- ========================================

-- Function to execute dynamic SQL (if not exists)
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    EXECUTE sql_query INTO result;
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Function to get exporter KPIs
CREATE OR REPLACE FUNCTION get_exporter_kpis(
    p_season_ids INTEGER[] DEFAULT NULL,
    p_exporter_ids INTEGER[] DEFAULT NULL,
    p_species_ids INTEGER[] DEFAULT NULL,
    p_variety_ids INTEGER[] DEFAULT NULL,
    p_market_ids INTEGER[] DEFAULT NULL,
    p_country_ids INTEGER[] DEFAULT NULL,
    p_region_ids INTEGER[] DEFAULT NULL,
    p_transport_type_ids INTEGER[] DEFAULT NULL,
    p_week_from TEXT DEFAULT NULL,
    p_week_to TEXT DEFAULT NULL
)
RETURNS TABLE(
    exporter_id INTEGER,
    exporter_name TEXT,
    total_kilograms NUMERIC,
    total_boxes INTEGER,
    importers_active INTEGER,
    varieties_active INTEGER,
    kg_per_box NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id as exporter_id,
        e.name as exporter_name,
        COALESCE(SUM(s.kilograms), 0) as total_kilograms,
        COALESCE(SUM(s.boxes), 0) as total_boxes,
        COUNT(DISTINCT s.importer_id) as importers_active,
        COUNT(DISTINCT s.variety_id) as varieties_active,
        CASE 
            WHEN SUM(s.boxes) > 0 THEN SUM(s.kilograms) / SUM(s.boxes)
            ELSE NULL
        END as kg_per_box
    FROM exporters e
    LEFT JOIN unified_shipments s ON e.id = s.exporter_id
    WHERE (p_season_ids IS NULL OR s.season_id = ANY(p_season_ids))
        AND (p_exporter_ids IS NULL OR s.exporter_id = ANY(p_exporter_ids))
        AND (p_species_ids IS NULL OR s.species_id = ANY(p_species_ids))
        AND (p_variety_ids IS NULL OR s.variety_id = ANY(p_variety_ids))
        AND (p_market_ids IS NULL OR s.market_id = ANY(p_market_ids))
        AND (p_country_ids IS NULL OR s.country_id = ANY(p_country_ids))
        AND (p_region_ids IS NULL OR s.region_id = ANY(p_region_ids))
        AND (p_transport_type_ids IS NULL OR s.transport_type_id = ANY(p_transport_type_ids))
        AND (p_week_from IS NULL OR s.etd_week >= p_week_from)
        AND (p_week_to IS NULL OR s.etd_week <= p_week_to)
    GROUP BY e.id, e.name
    ORDER BY total_kilograms DESC;
END;
$$;

-- Function to get timeseries data
CREATE OR REPLACE FUNCTION get_exporter_timeseries(
    p_granularity TEXT DEFAULT 'week',
    p_season_ids INTEGER[] DEFAULT NULL,
    p_exporter_ids INTEGER[] DEFAULT NULL,
    p_species_ids INTEGER[] DEFAULT NULL,
    p_variety_ids INTEGER[] DEFAULT NULL,
    p_market_ids INTEGER[] DEFAULT NULL,
    p_country_ids INTEGER[] DEFAULT NULL,
    p_region_ids INTEGER[] DEFAULT NULL,
    p_transport_type_ids INTEGER[] DEFAULT NULL,
    p_week_from TEXT DEFAULT NULL,
    p_week_to TEXT DEFAULT NULL
)
RETURNS TABLE(
    period TEXT,
    kilograms NUMERIC,
    boxes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN p_granularity = 'week' THEN s.etd_week
            WHEN p_granularity = 'month' THEN SUBSTRING(s.etd_week, 1, 7)
            WHEN p_granularity = 'season' THEN se.name
            ELSE s.etd_week
        END as period,
        COALESCE(SUM(s.kilograms), 0) as kilograms,
        COALESCE(SUM(s.boxes), 0) as boxes
    FROM unified_shipments s
    LEFT JOIN seasons se ON s.season_id = se.id
    WHERE (p_season_ids IS NULL OR s.season_id = ANY(p_season_ids))
        AND (p_exporter_ids IS NULL OR s.exporter_id = ANY(p_exporter_ids))
        AND (p_species_ids IS NULL OR s.species_id = ANY(p_species_ids))
        AND (p_variety_ids IS NULL OR s.variety_id = ANY(p_variety_ids))
        AND (p_market_ids IS NULL OR s.market_id = ANY(p_market_ids))
        AND (p_country_ids IS NULL OR s.country_id = ANY(p_country_ids))
        AND (p_region_ids IS NULL OR s.region_id = ANY(p_region_ids))
        AND (p_transport_type_ids IS NULL OR s.transport_type_id = ANY(p_transport_type_ids))
        AND (p_week_from IS NULL OR s.etd_week >= p_week_from)
        AND (p_week_to IS NULL OR s.etd_week <= p_week_to)
    GROUP BY 
        CASE 
            WHEN p_granularity = 'week' THEN s.etd_week
            WHEN p_granularity = 'month' THEN SUBSTRING(s.etd_week, 1, 7)
            WHEN p_granularity = 'season' THEN se.name
            ELSE s.etd_week
        END
    ORDER BY period;
END;
$$;

-- Function to get top items by category
CREATE OR REPLACE FUNCTION get_exporter_tops(
    p_top_type TEXT,
    p_season_ids INTEGER[] DEFAULT NULL,
    p_exporter_ids INTEGER[] DEFAULT NULL,
    p_species_ids INTEGER[] DEFAULT NULL,
    p_variety_ids INTEGER[] DEFAULT NULL,
    p_market_ids INTEGER[] DEFAULT NULL,
    p_country_ids INTEGER[] DEFAULT NULL,
    p_region_ids INTEGER[] DEFAULT NULL,
    p_transport_type_ids INTEGER[] DEFAULT NULL,
    p_week_from TEXT DEFAULT NULL,
    p_week_to TEXT DEFAULT NULL
)
RETURNS TABLE(
    id INTEGER,
    name TEXT,
    kilograms NUMERIC,
    boxes INTEGER,
    share_pct NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_kg NUMERIC;
BEGIN
    -- Get total kilograms for percentage calculation
    SELECT COALESCE(SUM(kilograms), 0) INTO total_kg
    FROM unified_shipments s
    WHERE (p_season_ids IS NULL OR s.season_id = ANY(p_season_ids))
        AND (p_exporter_ids IS NULL OR s.exporter_id = ANY(p_exporter_ids))
        AND (p_species_ids IS NULL OR s.species_id = ANY(p_species_ids))
        AND (p_variety_ids IS NULL OR s.variety_id = ANY(p_variety_ids))
        AND (p_market_ids IS NULL OR s.market_id = ANY(p_market_ids))
        AND (p_country_ids IS NULL OR s.country_id = ANY(p_country_ids))
        AND (p_region_ids IS NULL OR s.region_id = ANY(p_region_ids))
        AND (p_transport_type_ids IS NULL OR s.transport_type_id = ANY(p_transport_type_ids))
        AND (p_week_from IS NULL OR s.etd_week >= p_week_from)
        AND (p_week_to IS NULL OR s.etd_week <= p_week_to);

    RETURN QUERY
    SELECT 
        CASE 
            WHEN p_top_type = 'importers' THEN i.id
            WHEN p_top_type = 'markets' THEN m.id
            WHEN p_top_type = 'countries' THEN c.id
            WHEN p_top_type = 'varieties' THEN v.id
            WHEN p_top_type = 'arrival_ports' THEN ap.id
            ELSE 0
        END as id,
        CASE 
            WHEN p_top_type = 'importers' THEN i.name
            WHEN p_top_type = 'markets' THEN m.name
            WHEN p_top_type = 'countries' THEN c.name
            WHEN p_top_type = 'varieties' THEN v.name
            WHEN p_top_type = 'arrival_ports' THEN ap.name
            ELSE ''
        END as name,
        COALESCE(SUM(s.kilograms), 0) as kilograms,
        COALESCE(SUM(s.boxes), 0) as boxes,
        CASE 
            WHEN total_kg > 0 THEN (SUM(s.kilograms) / total_kg) * 100
            ELSE 0
        END as share_pct
    FROM unified_shipments s
    LEFT JOIN importers i ON p_top_type = 'importers' AND s.importer_id = i.id
    LEFT JOIN markets m ON p_top_type = 'markets' AND s.market_id = m.id
    LEFT JOIN countries c ON p_top_type = 'countries' AND s.country_id = c.id
    LEFT JOIN varieties v ON p_top_type = 'varieties' AND s.variety_id = v.id
    LEFT JOIN arrival_ports ap ON p_top_type = 'arrival_ports' AND s.arrival_port_id = ap.id
    WHERE (p_season_ids IS NULL OR s.season_id = ANY(p_season_ids))
        AND (p_exporter_ids IS NULL OR s.exporter_id = ANY(p_exporter_ids))
        AND (p_species_ids IS NULL OR s.species_id = ANY(p_species_ids))
        AND (p_variety_ids IS NULL OR s.variety_id = ANY(p_variety_ids))
        AND (p_market_ids IS NULL OR s.market_id = ANY(p_market_ids))
        AND (p_country_ids IS NULL OR s.country_id = ANY(p_country_ids))
        AND (p_region_ids IS NULL OR s.region_id = ANY(p_region_ids))
        AND (p_transport_type_ids IS NULL OR s.transport_type_id = ANY(p_transport_type_ids))
        AND (p_week_from IS NULL OR s.etd_week >= p_week_from)
        AND (p_week_to IS NULL OR s.etd_week <= p_week_to)
    GROUP BY 
        CASE 
            WHEN p_top_type = 'importers' THEN i.id
            WHEN p_top_type = 'markets' THEN m.id
            WHEN p_top_type = 'countries' THEN c.id
            WHEN p_top_type = 'varieties' THEN v.id
            WHEN p_top_type = 'arrival_ports' THEN ap.id
            ELSE 0
        END,
        CASE 
            WHEN p_top_type = 'importers' THEN i.name
            WHEN p_top_type = 'markets' THEN m.name
            WHEN p_top_type = 'countries' THEN c.name
            WHEN p_top_type = 'varieties' THEN v.name
            WHEN p_top_type = 'arrival_ports' THEN ap.name
            ELSE ''
        END
    ORDER BY kilograms DESC
    LIMIT 10;
END;
$$;

-- Function to get exporter rankings by season
CREATE OR REPLACE FUNCTION get_exporter_rankings(
    p_season_ids INTEGER[] DEFAULT NULL,
    p_species_ids INTEGER[] DEFAULT NULL,
    p_variety_ids INTEGER[] DEFAULT NULL,
    p_market_ids INTEGER[] DEFAULT NULL,
    p_country_ids INTEGER[] DEFAULT NULL,
    p_region_ids INTEGER[] DEFAULT NULL,
    p_transport_type_ids INTEGER[] DEFAULT NULL,
    p_week_from TEXT DEFAULT NULL,
    p_week_to TEXT DEFAULT NULL
)
RETURNS TABLE(
    exporter_id INTEGER,
    exporter_name TEXT,
    season_id INTEGER,
    season_name TEXT,
    kilograms NUMERIC,
    boxes INTEGER,
    rank INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id as exporter_id,
        e.name as exporter_name,
        s.season_id,
        se.name as season_name,
        COALESCE(SUM(s.kilograms), 0) as kilograms,
        COALESCE(SUM(s.boxes), 0) as boxes,
        RANK() OVER (PARTITION BY s.season_id ORDER BY SUM(s.kilograms) DESC) as rank
    FROM exporters e
    JOIN unified_shipments s ON e.id = s.exporter_id
    JOIN seasons se ON s.season_id = se.id
    WHERE (p_season_ids IS NULL OR s.season_id = ANY(p_season_ids))
        AND (p_species_ids IS NULL OR s.species_id = ANY(p_species_ids))
        AND (p_variety_ids IS NULL OR s.variety_id = ANY(p_variety_ids))
        AND (p_market_ids IS NULL OR s.market_id = ANY(p_market_ids))
        AND (p_country_ids IS NULL OR s.country_id = ANY(p_country_ids))
        AND (p_region_ids IS NULL OR s.region_id = ANY(p_region_ids))
        AND (p_transport_type_ids IS NULL OR s.transport_type_id = ANY(p_transport_type_ids))
        AND (p_week_from IS NULL OR s.etd_week >= p_week_from)
        AND (p_week_to IS NULL OR s.etd_week <= p_week_to)
    GROUP BY e.id, e.name, s.season_id, se.name
    ORDER BY s.season_id, rank;
END;
$$;

-- ========================================
-- 4. GRANT PERMISSIONS
-- ========================================

-- Grant access to the view and functions
GRANT SELECT ON unified_shipments TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_exporter_kpis TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_exporter_timeseries TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_exporter_tops TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_exporter_rankings TO anon, authenticated;
GRANT EXECUTE ON FUNCTION exec_sql TO anon, authenticated;

-- ========================================
-- 5. CREATE MATERIALIZED VIEWS (OPTIONAL)
-- ========================================

-- Create materialized view for frequently accessed data
CREATE MATERIALIZED VIEW IF NOT EXISTS exporter_summary_stats AS
SELECT 
    e.id as exporter_id,
    e.name as exporter_name,
    COUNT(DISTINCT s.season_id) as seasons_active,
    COUNT(DISTINCT s.importer_id) as total_importers,
    COUNT(DISTINCT s.variety_id) as total_varieties,
    COUNT(DISTINCT s.market_id) as total_markets,
    COUNT(DISTINCT s.country_id) as total_countries,
    SUM(s.kilograms) as total_kilograms,
    SUM(s.boxes) as total_boxes,
    AVG(s.kilograms) as avg_kilograms_per_shipment,
    AVG(s.boxes) as avg_boxes_per_shipment
FROM exporters e
LEFT JOIN unified_shipments s ON e.id = s.exporter_id
GROUP BY e.id, e.name;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_exporter_summary_stats_exporter_id ON exporter_summary_stats(exporter_id);

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_exporter_summary_stats()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW exporter_summary_stats;
END;
$$;

-- Grant access to materialized view
GRANT SELECT ON exporter_summary_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION refresh_exporter_summary_stats TO anon, authenticated;

-- ========================================
-- 6. SAMPLE QUERIES FOR TESTING
-- ========================================

-- Test the unified view
-- SELECT COUNT(*) FROM unified_shipments;

-- Test exporter KPIs
-- SELECT * FROM get_exporter_kpis();

-- Test timeseries
-- SELECT * FROM get_exporter_timeseries('month');

-- Test top importers
-- SELECT * FROM get_exporter_tops('importers');

-- Test rankings
-- SELECT * FROM get_exporter_rankings();

-- ========================================
-- 7. PERFORMANCE OPTIMIZATION
-- ========================================

-- Enable parallel query execution
ALTER TABLE shipments_2024_2025 SET (parallel_workers = 4);
ALTER TABLE shipments_2023_2024 SET (parallel_workers = 4);
ALTER TABLE shipments_2022_2023 SET (parallel_workers = 4);
ALTER TABLE shipments_2021_2022 SET (parallel_workers = 4);

-- Set work_mem for complex queries
-- Note: This should be set at session level or in postgresql.conf
-- SET work_mem = '256MB';

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

-- The setup is complete! You can now use the Exporters Analytics page.
-- All functions are created and ready to use.
-- Remember to refresh the materialized view periodically:
-- SELECT refresh_exporter_summary_stats();
