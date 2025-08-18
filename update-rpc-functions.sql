-- ========================================
-- UPDATE RPC FUNCTIONS WITH ALL FILTERS
-- ========================================
-- This script updates the RPC functions to accept all filter parameters
-- Following Supabase best practices for multi-function scripts

-- ========================================
-- 0. DROP EXISTING FUNCTIONS FIRST
-- ========================================

DROP FUNCTION IF EXISTS get_exporter_kpis(INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_kpis(INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_kpis(INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_kpis(INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_kpis(INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_kpis(INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_kpis(INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_kpis(INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_kpis(INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_kpis(TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_kpis(TEXT);
DROP FUNCTION IF EXISTS get_exporter_kpis();

DROP FUNCTION IF EXISTS get_exporter_timeseries(TEXT, INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_timeseries(TEXT, INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_timeseries(TEXT, INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_timeseries(TEXT, INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_timeseries(TEXT, INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_timeseries(TEXT, INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_timeseries(TEXT, INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_timeseries(TEXT, INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_timeseries(TEXT, INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_timeseries(TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_timeseries(TEXT);
DROP FUNCTION IF EXISTS get_exporter_timeseries();

DROP FUNCTION IF EXISTS get_exporter_tops(TEXT, INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_tops(TEXT, INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_tops(TEXT, INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_tops(TEXT, INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_tops(TEXT, INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_tops(TEXT, INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_tops(TEXT, INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_tops(TEXT, INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_tops(TEXT, INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_tops(TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_tops(TEXT);
DROP FUNCTION IF EXISTS get_exporter_tops();

DROP FUNCTION IF EXISTS get_exporter_rankings(INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_rankings(INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_rankings(INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_rankings(INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_rankings(INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_rankings(INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_rankings(INTEGER[], INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_tops(TEXT, INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_rankings(INTEGER[], TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_rankings(TEXT, TEXT);
DROP FUNCTION IF EXISTS get_exporter_rankings();

-- ========================================
-- 1. UPDATE get_exporter_kpis FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION get_exporter_kpis(
    p_season_ids INTEGER[] DEFAULT NULL,
    p_exporter_ids INTEGER[] DEFAULT NULL,
    p_species_ids INTEGER[] DEFAULT NULL,
    p_variety_ids INTEGER[] DEFAULT NULL,
    p_market_ids INTEGER[] DEFAULT NULL,
    p_country_ids INTEGER[] DEFAULT NULL,
    p_region_ids INTEGER[] DEFAULT NULL,
    p_transport_type_ids INTEGER[] DEFAULT NULL,
    p_arrival_port_ids INTEGER[] DEFAULT NULL,
    p_week_from TEXT DEFAULT NULL,
    p_week_to TEXT DEFAULT NULL
)
RETURNS TABLE(
    exporter_id BIGINT,
    exporter_name TEXT,
    total_kilograms INTEGER,
    total_boxes INTEGER,
    importers_active BIGINT,
    varieties_active BIGINT,
    kg_per_box INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn_kpis$
BEGIN
    RETURN QUERY
    SELECT 
        e.id::BIGINT as exporter_id,
        e.name as exporter_name,
        COALESCE(SUM(s.kilograms)::INTEGER, 0) as total_kilograms,
        COALESCE(SUM(s.boxes)::INTEGER, 0) as total_boxes,
        COUNT(DISTINCT s.importer_id)::BIGINT as importers_active,
        COUNT(DISTINCT s.variety_id)::BIGINT as varieties_active,
        CASE 
            WHEN SUM(s.boxes) > 0 THEN (SUM(s.kilograms) / SUM(s.boxes))::INTEGER
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
        AND (p_arrival_port_ids IS NULL OR s.arrival_port_id = ANY(p_arrival_port_ids))
        AND (p_week_from IS NULL OR s.etd_week >= p_week_from)
        AND (p_week_to IS NULL OR s.etd_week <= p_week_to)
    GROUP BY e.id, e.name
    ORDER BY total_kilograms DESC;
END;
$fn_kpis$;

-- ========================================
-- 2. UPDATE get_exporter_timeseries FUNCTION
-- ========================================

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
    p_arrival_port_ids INTEGER[] DEFAULT NULL,
    p_week_from TEXT DEFAULT NULL,
    p_week_to TEXT DEFAULT NULL
)
RETURNS TABLE(
    period TEXT,
    kilograms INTEGER,
    boxes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn_timeseries$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN p_granularity = 'week' THEN s.etd_week
            WHEN p_granularity = 'month' THEN SUBSTRING(s.etd_week, 1, 7)
            WHEN p_granularity = 'season' THEN se.name
            ELSE s.etd_week
        END as period,
        COALESCE(SUM(s.kilograms)::INTEGER, 0) as kilograms,
        COALESCE(SUM(s.boxes)::INTEGER, 0) as boxes
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
        AND (p_arrival_port_ids IS NULL OR s.arrival_port_id = ANY(p_arrival_port_ids))
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
$fn_timeseries$;

-- ========================================
-- 3. UPDATE get_exporter_tops FUNCTION
-- ========================================

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
    p_arrival_port_ids INTEGER[] DEFAULT NULL,
    p_week_from TEXT DEFAULT NULL,
    p_week_to TEXT DEFAULT NULL
)
RETURNS TABLE(
    id BIGINT,
    name TEXT,
    kilograms INTEGER,
    boxes INTEGER,
    share_pct NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn_tops$
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
        AND (p_arrival_port_ids IS NULL OR s.arrival_port_id = ANY(p_arrival_port_ids))
        AND (p_week_from IS NULL OR s.etd_week >= p_week_from)
        AND (p_week_to IS NULL OR s.etd_week <= p_week_to);

    RETURN QUERY
    SELECT 
        CASE 
            WHEN p_top_type = 'importers' THEN i.id::BIGINT
            WHEN p_top_type = 'markets' THEN m.id::BIGINT
            WHEN p_top_type = 'countries' THEN c.id::BIGINT
            WHEN p_top_type = 'varieties' THEN v.id::BIGINT
            WHEN p_top_type = 'arrival_ports' THEN ap.id::BIGINT
            ELSE 0::BIGINT
        END as id,
        CASE 
            WHEN p_top_type = 'importers' THEN i.name
            WHEN p_top_type = 'markets' THEN m.name
            WHEN p_top_type = 'countries' THEN c.name
            WHEN p_top_type = 'varieties' THEN v.name
            WHEN p_top_type = 'arrival_ports' THEN ap.name
            ELSE ''
        END as name,
        COALESCE(SUM(s.kilograms)::INTEGER, 0) as kilograms,
        COALESCE(SUM(s.boxes)::INTEGER, 0) as boxes,
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
        AND (p_arrival_port_ids IS NULL OR s.arrival_port_id = ANY(p_arrival_port_ids))
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
$fn_tops$;

-- ========================================
-- 4. UPDATE get_exporter_rankings FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION get_exporter_rankings(
    p_season_ids INTEGER[] DEFAULT NULL,
    p_species_ids INTEGER[] DEFAULT NULL,
    p_variety_ids INTEGER[] DEFAULT NULL,
    p_market_ids INTEGER[] DEFAULT NULL,
    p_country_ids INTEGER[] DEFAULT NULL,
    p_region_ids INTEGER[] DEFAULT NULL,
    p_transport_type_ids INTEGER[] DEFAULT NULL,
    p_arrival_port_ids INTEGER[] DEFAULT NULL,
    p_week_from TEXT DEFAULT NULL,
    p_week_to TEXT DEFAULT NULL
)
RETURNS TABLE(
    exporter_id BIGINT,
    exporter_name TEXT,
    season_id BIGINT,
    season_name TEXT,
    kilograms INTEGER,
    boxes INTEGER,
    rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn_rankings$
BEGIN
    RETURN QUERY
    SELECT 
        e.id::BIGINT as exporter_id,
        e.name as exporter_name,
        s.season_id::BIGINT,
        se.name as season_name,
        COALESCE(SUM(s.kilograms)::INTEGER, 0) as kilograms,
        COALESCE(SUM(s.boxes)::INTEGER, 0) as boxes,
        RANK() OVER (PARTITION BY s.season_id ORDER BY SUM(s.kilograms) DESC)::BIGINT as rank
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
        AND (p_arrival_port_ids IS NULL OR s.arrival_port_id = ANY(p_arrival_port_ids))
        AND (p_week_from IS NULL OR s.etd_week >= p_week_from)
        AND (p_week_to IS NULL OR s.etd_week <= p_week_to)
    GROUP BY e.id, e.name, s.season_id, se.name
    ORDER BY s.season_id, rank;
END;
$fn_rankings$;

-- ========================================
-- 5. GRANT PERMISSIONS
-- ========================================

GRANT EXECUTE ON FUNCTION get_exporter_kpis TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_exporter_timeseries TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_exporter_tops TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_exporter_rankings TO anon, authenticated;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

-- RPC functions have been updated with all filter parameters.
-- The functions now accept:
-- - p_season_ids, p_exporter_ids, p_species_ids, p_variety_ids
-- - p_market_ids, p_country_ids, p_region_ids, p_transport_type_ids
-- - p_arrival_port_ids, p_week_from, p_week_to
-- 
-- All functions return INTEGER types for better compatibility.
-- 
-- IMPORTANT: Each function uses a unique tag ($fn_kpis$, $fn_timeseries$, etc.)
-- to avoid conflicts and ensure proper parsing in Supabase SQL Editor.
