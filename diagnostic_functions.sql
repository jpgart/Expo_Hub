-- ========================================
-- DIAGNÓSTICO COMPLETO DE FUNCIONES RPC
-- ========================================
-- Script para diagnosticar el estado exacto de las funciones RPC
-- Identifica problemas específicos y proporciona soluciones

-- ========================================
-- 1. VERIFICAR FUNCIONES EXISTENTES
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '=== DIAGNÓSTICO DE FUNCIONES RPC ===';
    RAISE NOTICE 'Revisando funciones existentes...';
END $$;

-- Listar todas las funciones relacionadas con exportadores
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    p.oid::regprocedure as full_signature,
    CASE 
        WHEN p.provolatile = 'i' THEN 'IMMUTABLE'
        WHEN p.provolatile = 's' THEN 'STABLE'
        WHEN p.provolatile = 'v' THEN 'VOLATILE'
    END as volatility
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
    AND p.proname LIKE '%exporter%'
ORDER BY p.proname, p.oid::regprocedure;

-- ========================================
-- 2. VERIFICAR ESTRUCTURA DE RETORNO
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICANDO ESTRUCTURA DE RETORNO ===';
END $$;

-- Verificar la estructura de retorno de get_exporter_tops
DO $$
DECLARE
    result_record RECORD;
    row_count INTEGER;
BEGIN
    RAISE NOTICE 'Probando get_exporter_tops...';
    
    BEGIN
        SELECT COUNT(*) INTO row_count FROM public.get_exporter_tops('exporters');
        RAISE NOTICE '✅ get_exporter_tops ejecutado exitosamente: % filas', row_count;
        
        -- Verificar estructura de retorno
        SELECT * INTO result_record FROM public.get_exporter_tops('exporters') LIMIT 1;
        RAISE NOTICE '✅ Estructura de retorno correcta';
        RAISE NOTICE '   entity_id: %, entity_name: %, total_kilograms: %', 
            result_record.entity_id, result_record.entity_name, result_record.total_kilograms;
            
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en get_exporter_tops: %', SQLERRM;
    END;
END $$;

-- Verificar la estructura de retorno de get_exporter_timeseries
DO $$
DECLARE
    result_record RECORD;
    row_count INTEGER;
BEGIN
    RAISE NOTICE 'Probando get_exporter_timeseries...';
    
    BEGIN
        SELECT COUNT(*) INTO row_count FROM public.get_exporter_timeseries();
        RAISE NOTICE '✅ get_exporter_timeseries ejecutado exitosamente: % filas', row_count;
        
        -- Verificar estructura de retorno
        SELECT * INTO result_record FROM public.get_exporter_timeseries() LIMIT 1;
        RAISE NOTICE '✅ Estructura de retorno correcta';
        RAISE NOTICE '   period: %, total_kilograms: %, total_boxes: %', 
            result_record.period, result_record.total_kilograms, result_record.total_boxes;
            
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en get_exporter_timeseries: %', SQLERRM;
    END;
END $$;

-- ========================================
-- 3. VERIFICAR VISTA MATERIALIZADA
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICANDO VISTA MATERIALIZADA ===';
END $$;

-- Verificar estado de la vista materializada
SELECT 
    schemaname,
    matviewname,
    matviewowner,
    definition
FROM pg_matviews 
WHERE matviewname = 'unified_shipments_mv';

-- Verificar conteo de datos
DO $$
DECLARE
    row_count BIGINT;
    sample_data RECORD;
BEGIN
    SELECT COUNT(*) INTO row_count FROM public.unified_shipments_mv;
    RAISE NOTICE 'Vista materializada tiene % filas', row_count;
    
    IF row_count > 0 THEN
        SELECT * INTO sample_data FROM public.unified_shipments_mv LIMIT 1;
        RAISE NOTICE '✅ Datos disponibles en vista materializada';
        RAISE NOTICE '   Ejemplo: season_id=%, exporter_id=%, kilograms=%', 
            sample_data.season_id, sample_data.exporter_id, sample_data.kilograms;
    ELSE
        RAISE NOTICE '❌ Vista materializada está vacía';
    END IF;
END $$;

-- ========================================
-- 4. VERIFICAR PERMISOS
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICANDO PERMISOS ===';
END $$;

-- Verificar permisos de las funciones
SELECT 
    p.proname as function_name,
    has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
    has_function_privilege('authenticated', p.oid, 'EXECUTE') as auth_can_execute,
    has_function_privilege('service_role', p.oid, 'EXECUTE') as service_can_execute
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
    AND p.proname IN ('get_exporter_kpis', 'get_exporter_timeseries', 'get_exporter_tops');

-- ========================================
-- 5. TEST DE CONECTIVIDAD DIRECTA
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST DE CONECTIVIDAD DIRECTA ===';
END $$;

-- Test directo de get_exporter_kpis
DO $$
DECLARE
    kpi_result RECORD;
BEGIN
    BEGIN
        SELECT * INTO kpi_result FROM public.get_exporter_kpis() LIMIT 1;
        RAISE NOTICE '✅ get_exporter_kpis: Conectividad OK';
        RAISE NOTICE '   total_kilograms: %, total_boxes: %', 
            kpi_result.total_kilograms, kpi_result.total_boxes;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ get_exporter_kpis: Error - %', SQLERRM;
    END;
END $$;

-- Test directo de get_exporter_timeseries
DO $$
DECLARE
    ts_result RECORD;
BEGIN
    BEGIN
        SELECT * INTO ts_result FROM public.get_exporter_timeseries() LIMIT 1;
        RAISE NOTICE '✅ get_exporter_timeseries: Conectividad OK';
        RAISE NOTICE '   period: %, total_kilograms: %', 
            ts_result.period, ts_result.total_kilograms;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ get_exporter_timeseries: Error - %', SQLERRM;
    END;
END $$;

-- Test directo de get_exporter_tops
DO $$
DECLARE
    tops_result RECORD;
BEGIN
    BEGIN
        SELECT * INTO tops_result FROM public.get_exporter_tops('exporters') LIMIT 1;
        RAISE NOTICE '✅ get_exporter_tops: Conectividad OK';
        RAISE NOTICE '   entity_name: %, total_kilograms: %', 
            tops_result.entity_name, tops_result.total_kilograms;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ get_exporter_tops: Error - %', SQLERRM;
    END;
END $$;

-- ========================================
-- 6. RESUMEN DEL DIAGNÓSTICO
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 DIAGNÓSTICO COMPLETADO';
    RAISE NOTICE '========================';
    RAISE NOTICE 'Revisa los resultados arriba para identificar problemas específicos';
    RAISE NOTICE '';
    RAISE NOTICE 'Si hay errores, ejecuta el script de corrección correspondiente';
    RAISE NOTICE 'Si todo está OK, el problema puede estar en el caché de Supabase';
    RAISE NOTICE '';
END $$;
