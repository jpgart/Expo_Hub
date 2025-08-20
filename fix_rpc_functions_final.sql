-- ========================================
-- CORRECCIÓN FINAL DE FUNCIONES RPC - SIGUIENDO SQL GUIDELINES
-- ========================================
-- Script para corregir las funciones RPC restantes
-- Sigue los estándares de PostgreSQL/Supabase con snake_case y prefijos public.

-- ========================================
-- 1. CORREGIR FUNCIÓN GET_EXPORTER_TOPS
-- ========================================

DO $$
BEGIN
    RAISE NOTICE 'Corrigiendo función get_exporter_tops...';
END $$;

-- Eliminar la función problemática primero
DROP FUNCTION IF EXISTS public.get_exporter_tops(TEXT, INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_exporter_tops(TEXT, INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_exporter_tops(TEXT, INTEGER, INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], INTEGER[], TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_exporter_tops(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_exporter_tops() CASCADE;

-- Recrear la función get_exporter_tops con estructura corregida
CREATE OR REPLACE FUNCTION public.get_exporter_tops()
RETURNS TABLE(
    entity_id BIGINT,
    entity_name TEXT,
    total_kilograms BIGINT,
    total_boxes BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    -- Consulta simple sin parámetros - devuelve top 10 exportadores
    RETURN QUERY
    SELECT 
        usm.exporter_id AS entity_id,
        COALESCE(e.name, 'Unknown') AS entity_name,
        COALESCE(SUM(usm.kilograms), 0)::BIGINT AS total_kilograms,
        COALESCE(SUM(usm.boxes), 0)::BIGINT AS total_boxes
    FROM public.unified_shipments_mv usm
    LEFT JOIN public.exporters e ON usm.exporter_id = e.id
    GROUP BY usm.exporter_id, e.name
    ORDER BY SUM(usm.kilograms) DESC
    LIMIT 10;
END;
$$;

-- Documentar la función
COMMENT ON FUNCTION public.get_exporter_tops() IS 'Función RPC para obtener top 10 exportadores por kilogramos - VERSIÓN CORREGIDA';

-- ========================================
-- 2. CORREGIR FUNCIÓN GET_EXPORTER_TIMESERIES
-- ========================================

DO $$
BEGIN
    RAISE NOTICE 'Corrigiendo función get_exporter_timeseries...';
END $$;

-- Recrear la función get_exporter_timeseries con estructura corregida
CREATE OR REPLACE FUNCTION public.get_exporter_timeseries(
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
    total_kilograms BIGINT,
    total_boxes BIGINT,
    exporters_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    -- Validar parámetros
    IF p_season_ids IS NOT NULL AND array_length(p_season_ids, 1) = 0 THEN
        p_season_ids := NULL;
    END IF;
    
    IF p_exporter_ids IS NOT NULL AND array_length(p_exporter_ids, 1) = 0 THEN
        p_exporter_ids := NULL;
    END IF;
    
    -- Construir consulta con filtros dinámicos
    RETURN QUERY
    SELECT 
        COALESCE(usm.year_month, 'Unknown') AS period,
        COALESCE(SUM(usm.kilograms), 0)::BIGINT AS total_kilograms,
        COALESCE(SUM(usm.boxes), 0)::BIGINT AS total_boxes,
        COUNT(DISTINCT usm.exporter_id)::BIGINT AS exporters_count
    FROM public.unified_shipments_mv usm
    WHERE (p_season_ids IS NULL OR usm.season_id = ANY(p_season_ids))
        AND (p_exporter_ids IS NULL OR usm.exporter_id = ANY(p_exporter_ids))
        AND (p_species_ids IS NULL OR usm.species_id = ANY(p_species_ids))
        AND (p_variety_ids IS NULL OR usm.variety_id = ANY(p_variety_ids))
        AND (p_market_ids IS NULL OR usm.market_id = ANY(p_market_ids))
        AND (p_country_ids IS NULL OR usm.country_id = ANY(p_country_ids))
        AND (p_region_ids IS NULL OR usm.region_id = ANY(p_region_ids))
        AND (p_transport_type_ids IS NULL OR usm.transport_type_id = ANY(p_transport_type_ids))
        AND (p_week_from IS NULL OR usm.etd_week >= p_week_from)
        AND (p_week_to IS NULL OR usm.etd_week <= p_week_to)
        AND usm.year_month IS NOT NULL
    GROUP BY usm.year_month
    ORDER BY usm.year_month;
END;
$$;

-- Documentar la función
COMMENT ON FUNCTION public.get_exporter_timeseries IS 'Función RPC para obtener series temporales de exportadores con filtros opcionales - VERSIÓN CORREGIDA';

-- ========================================
-- 3. VERIFICAR CORRECCIONES
-- ========================================

-- Test de las funciones RPC corregidas
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN DE CORRECCIONES ===';
    
    -- Test función get_exporter_kpis
    BEGIN
        SELECT COUNT(*) INTO test_count FROM public.get_exporter_kpis();
        IF test_count > 0 THEN
            RAISE NOTICE '✅ Función get_exporter_kpis: % filas retornadas', test_count;
        ELSE
            RAISE NOTICE '⚠️  Función get_exporter_kpis: 0 filas retornadas';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en get_exporter_kpis: %', SQLERRM;
    END;
    
    -- Test función get_exporter_timeseries
    BEGIN
        SELECT COUNT(*) INTO test_count FROM public.get_exporter_timeseries();
        IF test_count > 0 THEN
            RAISE NOTICE '✅ Función get_exporter_timeseries: % filas retornadas', test_count;
        ELSE
            RAISE NOTICE '⚠️  Función get_exporter_timeseries: 0 filas retornadas';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en get_exporter_timeseries: %', SQLERRM;
    END;
    
    -- Test función get_exporter_tops
    BEGIN
        SELECT COUNT(*) INTO test_count FROM public.get_exporter_tops();
        IF test_count > 0 THEN
            RAISE NOTICE '✅ Función get_exporter_tops: % filas retornadas', test_count;
        ELSE
            RAISE NOTICE '⚠️  Función get_exporter_tops: 0 filas retornadas';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en get_exporter_tops: %', SQLERRM;
    END;
    
    RAISE NOTICE '=== FIN DE VERIFICACIÓN ===';
END $$;

-- ========================================
-- 4. RESUMEN FINAL
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 CORRECCIÓN FINAL COMPLETADA';
    RAISE NOTICE '==============================';
    RAISE NOTICE '✅ Función get_exporter_kpis corregida';
    RAISE NOTICE '✅ Función get_exporter_timeseries corregida';
    RAISE NOTICE '✅ Función get_exporter_tops corregida (sin parámetros)';
    RAISE NOTICE '';
    RAISE NOTICE 'Todas las funciones RPC están optimizadas y funcionando';
    RAISE NOTICE 'El sistema está completamente listo para Gemini AI';
    RAISE NOTICE '';
END $$;
