-- Function to get accurate filtered totals without row limits
CREATE OR REPLACE FUNCTION get_filtered_totals(
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
    total_kilograms NUMERIC,
    total_boxes NUMERIC,
    unique_importers INTEGER,
    unique_varieties INTEGER,
    unique_exporters INTEGER,
    unique_countries INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(s.kilograms), 0) as total_kilograms,
        COALESCE(SUM(s.boxes), 0) as total_boxes,
        COUNT(DISTINCT s.importer_id) as unique_importers,
        COUNT(DISTINCT s.variety_id) as unique_varieties,
        COUNT(DISTINCT s.exporter_id) as unique_exporters,
        COUNT(DISTINCT s.country_id) as unique_countries
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
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_filtered_totals TO anon, authenticated;
