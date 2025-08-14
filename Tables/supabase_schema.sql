
-- ========================================
-- FULLCARGO SUPABASE SCHEMA (PERFORMANCE OPTIMIZED)
-- ========================================

-- Enable RLS on all tables
-- Tables follow Supabase best practices for reactive applications:
-- - BIGINT as primary keys (optimized for performance)
-- - Plural table names
-- - Singular column names
-- - Foreign keys with format: table_name_id
-- - Optimized indexes for fast queries and aggregations

-- 1. REGIONS TABLE
CREATE TABLE regions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

-- 2. MARKETS TABLE  
CREATE TABLE markets (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    region_id BIGINT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, region_id)
);

ALTER TABLE markets ENABLE ROW LEVEL SECURITY;

-- 3. COUNTRIES TABLE
CREATE TABLE countries (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    market_id BIGINT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, market_id)
);

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- 4. SPECIES TABLE
CREATE TABLE species (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE species ENABLE ROW LEVEL SECURITY;

-- 5. VARIETIES TABLE
CREATE TABLE varieties (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    species_id BIGINT NOT NULL REFERENCES species(id) ON DELETE CASCADE,
    variety_name_type TEXT DEFAULT 'commercial_name',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, species_id)
);

ALTER TABLE varieties ENABLE ROW LEVEL SECURITY;

-- 6. TRANSPORT_TYPES TABLE
CREATE TABLE transport_types (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    transport_category TEXT NOT NULL,
    transport_subcategory TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(transport_category, transport_subcategory)
);

ALTER TABLE transport_types ENABLE ROW LEVEL SECURITY;

-- 7. ARRIVAL_PORTS TABLE
CREATE TABLE arrival_ports (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE arrival_ports ENABLE ROW LEVEL SECURITY;

-- 8. EXPORTERS TABLE
CREATE TABLE exporters (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE exporters ENABLE ROW LEVEL SECURITY;

-- 9. IMPORTERS TABLE
CREATE TABLE importers (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE importers ENABLE ROW LEVEL SECURITY;

-- 10. SEASONS TABLE
CREATE TABLE seasons (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL UNIQUE,
    start_year INTEGER,
    end_year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

-- 11. SHIPMENTS TABLE (will be created per season)
-- Template for shipments_YYYY_YYYY tables
/*
CREATE TABLE shipments_2023_2024 (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    season_id BIGINT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    etd_week TEXT,
    region_id BIGINT REFERENCES regions(id),
    market_id BIGINT REFERENCES markets(id),
    country_id BIGINT REFERENCES countries(id),
    transport_type_id BIGINT REFERENCES transport_types(id),
    species_id BIGINT REFERENCES species(id),
    variety_id BIGINT REFERENCES varieties(id),
    importer_id BIGINT REFERENCES importers(id),
    exporter_id BIGINT REFERENCES exporters(id),
    arrival_port_id BIGINT REFERENCES arrival_ports(id),
    boxes DECIMAL(10,3),
    kilograms DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shipments_2023_2024 ENABLE ROW LEVEL SECURITY;
*/

-- Create optimized indexes for fast queries and aggregations
CREATE INDEX CONCURRENTLY idx_markets_region_id ON markets USING btree(region_id);
CREATE INDEX CONCURRENTLY idx_countries_market_id ON countries USING btree(market_id);
CREATE INDEX CONCURRENTLY idx_varieties_species_id ON varieties USING btree(species_id);

-- Additional performance indexes for reactive dashboards
CREATE INDEX CONCURRENTLY idx_varieties_name ON varieties USING btree(name);
CREATE INDEX CONCURRENTLY idx_species_name ON species USING btree(name);
CREATE INDEX CONCURRENTLY idx_exporters_name ON exporters USING btree(name);
CREATE INDEX CONCURRENTLY idx_importers_name ON importers USING btree(name);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON regions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON markets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_species_updated_at BEFORE UPDATE ON species FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_varieties_updated_at BEFORE UPDATE ON varieties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_types_updated_at BEFORE UPDATE ON transport_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_arrival_ports_updated_at BEFORE UPDATE ON arrival_ports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exporters_updated_at BEFORE UPDATE ON exporters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_importers_updated_at BEFORE UPDATE ON importers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

