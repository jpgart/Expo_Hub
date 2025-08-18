-- ========================================
-- FIX RPC FUNCTION TYPES - EXPORTERS ANALYTICS
-- ========================================
-- Script to fix data type mismatches in RPC functions

-- ========================================
-- 1. DROP EXISTING FUNCTIONS
-- ========================================

DROP FUNCTION IF EXISTS get_exporter_yoy_growth(INTEGER, INTEGER, INTEGER[]);
DROP FUNCTION IF EXISTS get_global_yoy_growth(INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_exporter_importer_retention(INTEGER, INTEGER, INTEGER[]);
DROP FUNCTION IF EXISTS get_global_importer_retention(INTEGER, INTEGER);

-- ========================================
-- 2. RECREATE FUNCTIONS WITH CORRECT TYPES
-- ========================================

-- Function to calculate YoY growth for exporters
CREATE OR REPLACE FUNCTION get_exporter_yoy_growth(
    p_current_season_id INTEGER,
    p_previous_season_id INTEGER,
    p_exporter_ids INTEGER[] DEFAULT NULL
)
RETURNS TABLE(
    exporter_id BIGINT,
    exporter_name TEXT,
    current_kilograms NUMERIC,
    previous_kilograms NUMERIC,
    yoy_kg_growth NUMERIC,
    yoy_kg_growth_pct NUMERIC,
    current_boxes BIGINT,
    previous_boxes BIGINT,
    yoy_boxes_growth BIGINT,
    yoy_boxes_growth_pct NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH current_season AS (
        SELECT 
            s.exporter_id,
            e.name as exporter_name,
            COALESCE(SUM(s.kilograms), 0) as kilograms,
            COALESCE(SUM(s.boxes), 0) as boxes
        FROM unified_shipments s
        JOIN exporters e ON s.exporter_id = e.id
        WHERE s.season_id = p_current_season_id
            AND (p_exporter_ids IS NULL OR s.exporter_id = ANY(p_exporter_ids))
        GROUP BY s.exporter_id, e.name
    ),
    previous_season AS (
        SELECT 
            s.exporter_id,
            COALESCE(SUM(s.kilograms), 0) as kilograms,
            COALESCE(SUM(s.boxes), 0) as boxes
        FROM unified_shipments s
        WHERE s.season_id = p_previous_season_id
            AND (p_exporter_ids IS NULL OR s.exporter_id = ANY(p_exporter_ids))
        GROUP BY s.exporter_id
    )
    SELECT 
        cs.exporter_id::BIGINT,
        cs.exporter_name,
        cs.kilograms as current_kilograms,
        COALESCE(ps.kilograms, 0) as previous_kilograms,
        (cs.kilograms - COALESCE(ps.kilograms, 0)) as yoy_kg_growth,
        CASE 
            WHEN COALESCE(ps.kilograms, 0) > 0 THEN 
                ((cs.kilograms - ps.kilograms) / ps.kilograms) * 100
            ELSE NULL
        END as yoy_kg_growth_pct,
        cs.boxes::BIGINT as current_boxes,
        COALESCE(ps.boxes, 0)::BIGINT as previous_boxes,
        (cs.boxes - COALESCE(ps.boxes, 0))::BIGINT as yoy_boxes_growth,
        CASE 
            WHEN COALESCE(ps.boxes, 0) > 0 THEN 
                ((cs.boxes - ps.boxes) / ps.boxes) * 100
            ELSE NULL
        END as yoy_boxes_growth_pct
    FROM current_season cs
    LEFT JOIN previous_season ps ON cs.exporter_id = ps.exporter_id
    ORDER BY cs.kilograms DESC;
END;
$$;

-- Function to calculate YoY growth for global metrics
CREATE OR REPLACE FUNCTION get_global_yoy_growth(
    p_current_season_id INTEGER,
    p_previous_season_id INTEGER
)
RETURNS TABLE(
    current_kilograms NUMERIC,
    previous_kilograms NUMERIC,
    yoy_kg_growth NUMERIC,
    yoy_kg_growth_pct NUMERIC,
    current_boxes BIGINT,
    previous_boxes BIGINT,
    yoy_boxes_growth BIGINT,
    yoy_boxes_growth_pct NUMERIC,
    current_importers BIGINT,
    previous_importers BIGINT,
    yoy_importers_growth BIGINT,
    yoy_importers_growth_pct NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH current_season AS (
        SELECT 
            COALESCE(SUM(kilograms), 0) as kilograms,
            COALESCE(SUM(boxes), 0) as boxes,
            COUNT(DISTINCT importer_id) as importers
        FROM unified_shipments
        WHERE season_id = p_current_season_id
    ),
    previous_season AS (
        SELECT 
            COALESCE(SUM(kilograms), 0) as kilograms,
            COALESCE(SUM(boxes), 0) as boxes,
            COUNT(DISTINCT importer_id) as importers
        FROM unified_shipments
        WHERE season_id = p_previous_season_id
    )
    SELECT 
        cs.kilograms as current_kilograms,
        ps.kilograms as previous_kilograms,
        (cs.kilograms - ps.kilograms) as yoy_kg_growth,
        CASE 
            WHEN ps.kilograms > 0 THEN ((cs.kilograms - ps.kilograms) / ps.kilograms) * 100
            ELSE NULL
        END as yoy_kg_growth_pct,
        cs.boxes::BIGINT as current_boxes,
        ps.boxes::BIGINT as previous_boxes,
        (cs.boxes - ps.boxes)::BIGINT as yoy_boxes_growth,
        CASE 
            WHEN ps.boxes > 0 THEN ((cs.boxes - ps.boxes) / ps.boxes) * 100
            ELSE NULL
        END as yoy_boxes_growth_pct,
        cs.importers::BIGINT as current_importers,
        ps.importers::BIGINT as previous_importers,
        (cs.importers - ps.importers)::BIGINT as yoy_importers_growth,
        CASE 
            WHEN ps.importers > 0 THEN ((cs.importers - ps.importers) / ps.importers) * 100
            ELSE NULL
        END as yoy_importers_growth_pct
    FROM current_season cs, previous_season ps;
END;
$$;

-- Function to calculate importer retention by exporter
CREATE OR REPLACE FUNCTION get_exporter_importer_retention(
    p_current_season_id INTEGER,
    p_previous_season_id INTEGER,
    p_exporter_ids INTEGER[] DEFAULT NULL
)
RETURNS TABLE(
    exporter_id BIGINT,
    exporter_name TEXT,
    previous_importers BIGINT,
    retained_importers BIGINT,
    new_importers BIGINT,
    churned_importers BIGINT,
    retention_rate NUMERIC,
    acquisition_rate NUMERIC,
    churn_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH previous_importers AS (
        SELECT DISTINCT
            s.exporter_id,
            s.importer_id
        FROM unified_shipments s
        WHERE s.season_id = p_previous_season_id
            AND s.importer_id IS NOT NULL
            AND (p_exporter_ids IS NULL OR s.exporter_id = ANY(p_exporter_ids))
    ),
    current_importers AS (
        SELECT DISTINCT
            s.exporter_id,
            s.importer_id
        FROM unified_shipments s
        WHERE s.season_id = p_current_season_id
            AND s.importer_id IS NOT NULL
            AND (p_exporter_ids IS NULL OR s.exporter_id = ANY(p_exporter_ids))
    ),
    retention_analysis AS (
        SELECT 
            e.id as exporter_id,
            e.name as exporter_name,
            COUNT(DISTINCT pi.importer_id) as previous_importers,
            COUNT(DISTINCT CASE WHEN ci.importer_id IS NOT NULL THEN pi.importer_id END) as retained_importers,
            COUNT(DISTINCT CASE WHEN pi.importer_id IS NULL THEN ci.importer_id END) as new_importers,
            COUNT(DISTINCT CASE WHEN ci.importer_id IS NULL THEN pi.importer_id END) as churned_importers
        FROM exporters e
        LEFT JOIN previous_importers pi ON e.id = pi.exporter_id
        LEFT JOIN current_importers ci ON e.id = ci.exporter_id AND pi.importer_id = ci.importer_id
        WHERE (p_exporter_ids IS NULL OR e.id = ANY(p_exporter_ids))
        GROUP BY e.id, e.name
    )
    SELECT 
        ra.exporter_id::BIGINT,
        ra.exporter_name,
        ra.previous_importers::BIGINT,
        ra.retained_importers::BIGINT,
        ra.new_importers::BIGINT,
        ra.churned_importers::BIGINT,
        CASE 
            WHEN ra.previous_importers > 0 THEN 
                (ra.retained_importers::NUMERIC / ra.previous_importers) * 100
            ELSE NULL
        END as retention_rate,
        CASE 
            WHEN ra.previous_importers > 0 THEN 
                (ra.new_importers::NUMERIC / ra.previous_importers) * 100
            ELSE NULL
        END as acquisition_rate,
        CASE 
            WHEN ra.previous_importers > 0 THEN 
                (ra.churned_importers::NUMERIC / ra.previous_importers) * 100
            ELSE NULL
        END as churn_rate
    FROM retention_analysis ra
    ORDER BY ra.retained_importers DESC;
END;
$$;

-- Function to calculate global importer retention
CREATE OR REPLACE FUNCTION get_global_importer_retention(
    p_current_season_id INTEGER,
    p_previous_season_id INTEGER
)
RETURNS TABLE(
    previous_importers BIGINT,
    retained_importers BIGINT,
    new_importers BIGINT,
    churned_importers BIGINT,
    retention_rate NUMERIC,
    acquisition_rate NUMERIC,
    churn_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH previous_importers AS (
        SELECT DISTINCT importer_id
        FROM unified_shipments
        WHERE season_id = p_previous_season_id
            AND importer_id IS NOT NULL
    ),
    current_importers AS (
        SELECT DISTINCT importer_id
        FROM unified_shipments
        WHERE season_id = p_current_season_id
            AND importer_id IS NOT NULL
    ),
    retention_analysis AS (
        SELECT 
            COUNT(DISTINCT pi.importer_id) as previous_importers,
            COUNT(DISTINCT CASE WHEN ci.importer_id IS NOT NULL THEN pi.importer_id END) as retained_importers,
            COUNT(DISTINCT CASE WHEN pi.importer_id IS NULL THEN ci.importer_id END) as new_importers,
            COUNT(DISTINCT CASE WHEN ci.importer_id IS NULL THEN pi.importer_id END) as churned_importers
        FROM previous_importers pi
        FULL OUTER JOIN current_importers ci ON pi.importer_id = ci.importer_id
    )
    SELECT 
        ra.previous_importers::BIGINT,
        ra.retained_importers::BIGINT,
        ra.new_importers::BIGINT,
        ra.churned_importers::BIGINT,
        CASE 
            WHEN ra.previous_importers > 0 THEN 
                (ra.retained_importers::NUMERIC / ra.previous_importers) * 100
            ELSE NULL
        END as retention_rate,
        CASE 
            WHEN ra.previous_importers > 0 THEN 
                (ra.new_importers::NUMERIC / ra.previous_importers) * 100
            ELSE NULL
        END as acquisition_rate,
        CASE 
            WHEN ra.previous_importers > 0 THEN 
                (ra.churned_importers::NUMERIC / ra.previous_importers) * 100
            ELSE NULL
        END as churn_rate
    FROM retention_analysis ra;
END;
$$;

-- ========================================
-- 3. GRANT PERMISSIONS
-- ========================================

GRANT EXECUTE ON FUNCTION get_exporter_yoy_growth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_global_yoy_growth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_exporter_importer_retention TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_global_importer_retention TO anon, authenticated;

-- ========================================
-- 4. TEST FUNCTIONS
-- ========================================

-- Test YoY growth (replace with actual season IDs)
-- SELECT * FROM get_exporter_yoy_growth(1, 2) LIMIT 5;
-- SELECT * FROM get_global_yoy_growth(1, 2);

-- Test retention (replace with actual season IDs)
-- SELECT * FROM get_exporter_importer_retention(1, 2) LIMIT 5;
-- SELECT * FROM get_global_importer_retention(1, 2);

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

-- RPC functions have been recreated with correct BIGINT types.
-- All functions now use BIGINT for ID and count columns to match PostgreSQL's actual types.
