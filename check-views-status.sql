-- ========================================
-- CHECK VIEWS STATUS - EXPORTERS ANALYTICS
-- ========================================
-- Script to check the current status of materialized views

-- ========================================
-- 1. CHECK WHICH VIEWS EXIST
-- ========================================

SELECT 
    schemaname,
    matviewname,
    matviewowner,
    hasindexes,
    ispopulated
FROM pg_matviews 
WHERE schemaname = 'public' 
    AND matviewname LIKE 'v_exporter_%';

-- ========================================
-- 2. CHECK TABLE STRUCTURE
-- ========================================

-- Check v_exporter_kpis structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'v_exporter_kpis'
ORDER BY ordinal_position;

-- Check v_exporter_timeseries structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'v_exporter_timeseries'
ORDER BY ordinal_position;

-- Check v_exporter_tops structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'v_exporter_tops'
ORDER BY ordinal_position;

-- Check v_exporter_rankings structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'v_exporter_rankings'
ORDER BY ordinal_position;

-- ========================================
-- 3. CHECK DATA COUNTS
-- ========================================

SELECT 'v_exporter_kpis' as view_name, COUNT(*) as row_count FROM v_exporter_kpis
UNION ALL
SELECT 'v_exporter_timeseries' as view_name, COUNT(*) as row_count FROM v_exporter_timeseries
UNION ALL
SELECT 'v_exporter_tops' as view_name, COUNT(*) as row_count FROM v_exporter_tops
UNION ALL
SELECT 'v_exporter_rankings' as view_name, COUNT(*) as row_count FROM v_exporter_rankings;

-- ========================================
-- 4. CHECK SAMPLE DATA
-- ========================================

-- Sample from each view
SELECT 'v_exporter_kpis' as view_name, * FROM v_exporter_kpis LIMIT 2;
SELECT 'v_exporter_timeseries' as view_name, * FROM v_exporter_timeseries LIMIT 2;
SELECT 'v_exporter_tops' as view_name, * FROM v_exporter_tops LIMIT 2;
SELECT 'v_exporter_rankings' as view_name, * FROM v_exporter_rankings LIMIT 2;
