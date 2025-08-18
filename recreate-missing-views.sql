-- ========================================
-- RECREATE MISSING MATERIALIZED VIEWS
-- ========================================
-- Script to recreate only the missing materialized views

-- ========================================
-- 1. DROP MISSING VIEWS (if they exist partially)
-- ========================================

DROP MATERIALIZED VIEW IF EXISTS v_exporter_kpis CASCADE;
DROP MATERIALIZED VIEW IF EXISTS v_exporter_timeseries CASCADE;
DROP MATERIALIZED VIEW IF EXISTS v_exporter_tops CASCADE;

-- ========================================
-- 2. CREATE MISSING MATERIALIZED VIEWS
-- ========================================

-- Materialized view for exporter KPIs
CREATE MATERIALIZED VIEW v_exporter_kpis AS
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
GROUP BY e.id, e.name
ORDER BY total_kilograms DESC;

-- Materialized view for timeseries data
CREATE MATERIALIZED VIEW v_exporter_timeseries AS
SELECT 
    'week' as granularity,
    s.etd_week as period,
    COALESCE(SUM(s.kilograms), 0) as kilograms,
    COALESCE(SUM(s.boxes), 0) as boxes
FROM unified_shipments s
GROUP BY s.etd_week
UNION ALL
SELECT 
    'month' as granularity,
    SUBSTRING(s.etd_week, 1, 7) as period,
    COALESCE(SUM(s.kilograms), 0) as kilograms,
    COALESCE(SUM(s.boxes), 0) as boxes
FROM unified_shipments s
GROUP BY SUBSTRING(s.etd_week, 1, 7)
UNION ALL
SELECT 
    'season' as granularity,
    se.name as period,
    COALESCE(SUM(s.kilograms), 0) as kilograms,
    COALESCE(SUM(s.boxes), 0) as boxes
FROM unified_shipments s
JOIN seasons se ON s.season_id = se.id
GROUP BY se.name
ORDER BY granularity, period;

-- Materialized view for top items by category
CREATE MATERIALIZED VIEW v_exporter_tops AS
-- Top Importers
SELECT 
    'importers' as category,
    i.id,
    i.name,
    COALESCE(SUM(s.kilograms), 0) as kilograms,
    COALESCE(SUM(s.boxes), 0) as boxes,
    0 as share_pct
FROM importers i
LEFT JOIN unified_shipments s ON i.id = s.importer_id
GROUP BY i.id, i.name
UNION ALL
-- Top Markets
SELECT 
    'markets' as category,
    m.id,
    m.name,
    COALESCE(SUM(s.kilograms), 0) as kilograms,
    COALESCE(SUM(s.boxes), 0) as boxes,
    0 as share_pct
FROM markets m
LEFT JOIN unified_shipments s ON m.id = s.market_id
GROUP BY m.id, m.name
UNION ALL
-- Top Countries
SELECT 
    'countries' as category,
    c.id,
    c.name,
    COALESCE(SUM(s.kilograms), 0) as kilograms,
    COALESCE(SUM(s.boxes), 0) as boxes,
    0 as share_pct
FROM countries c
LEFT JOIN unified_shipments s ON c.id = s.country_id
GROUP BY c.id, c.name
UNION ALL
-- Top Varieties
SELECT 
    'varieties' as category,
    v.id,
    v.name,
    COALESCE(SUM(s.kilograms), 0) as kilograms,
    COALESCE(SUM(s.boxes), 0) as boxes,
    0 as share_pct
FROM varieties v
LEFT JOIN unified_shipments s ON v.id = s.variety_id
GROUP BY v.id, v.name
UNION ALL
-- Top Arrival Ports
SELECT 
    'arrival_ports' as category,
    ap.id,
    ap.name,
    COALESCE(SUM(s.kilograms), 0) as kilograms,
    COALESCE(SUM(s.boxes), 0) as boxes,
    0 as share_pct
FROM arrival_ports ap
LEFT JOIN unified_shipments s ON ap.id = s.arrival_port_id
GROUP BY ap.id, ap.name
ORDER BY category, kilograms DESC;

-- ========================================
-- 3. CREATE INDEXES ON NEW VIEWS
-- ========================================

CREATE INDEX IF NOT EXISTS idx_v_exporter_kpis_exporter_id ON v_exporter_kpis(exporter_id);
CREATE INDEX IF NOT EXISTS idx_v_exporter_timeseries_granularity ON v_exporter_timeseries(granularity, period);
CREATE INDEX IF NOT EXISTS idx_v_exporter_tops_category ON v_exporter_tops(category, kilograms);

-- ========================================
-- 4. GRANT PERMISSIONS
-- ========================================

GRANT SELECT ON v_exporter_kpis TO anon, authenticated;
GRANT SELECT ON v_exporter_timeseries TO anon, authenticated;
GRANT SELECT ON v_exporter_tops TO anon, authenticated;

-- ========================================
-- 5. REFRESH ALL VIEWS
-- ========================================

-- Refresh the existing view
REFRESH MATERIALIZED VIEW v_exporter_rankings;

-- Refresh the new views
REFRESH MATERIALIZED VIEW v_exporter_kpis;
REFRESH MATERIALIZED VIEW v_exporter_timeseries;
REFRESH MATERIALIZED VIEW v_exporter_tops;

-- ========================================
-- 6. VERIFICATION QUERIES
-- ========================================

-- Check all views now exist and have data
SELECT 'v_exporter_kpis' as view_name, COUNT(*) as row_count FROM v_exporter_kpis
UNION ALL
SELECT 'v_exporter_timeseries' as view_name, COUNT(*) as row_count FROM v_exporter_timeseries
UNION ALL
SELECT 'v_exporter_tops' as view_name, COUNT(*) as row_count FROM v_exporter_tops
UNION ALL
SELECT 'v_exporter_rankings' as view_name, COUNT(*) as row_count FROM v_exporter_rankings;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

-- All missing materialized views have been recreated.
-- Run the verification query above to confirm all views now have data.

