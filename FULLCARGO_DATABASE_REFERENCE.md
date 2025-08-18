# 🚢 FullCargo Database Reference

## 📋 **Descripción General**

FullCargo es una base de datos diseñada para el seguimiento y análisis de exportaciones de productos agrícolas. El sistema permite rastrear envíos desde la empresa exportadora hasta el país destino, con trazabilidad completa por especie, variedad y temporada.

---

## 🗄️ **Esquema de Base de Datos**

### **Tecnología**
- **Base de datos**: PostgreSQL (Supabase)
- **ORM**: Supabase Client
- **Autenticación**: Clerk
- **Frontend**: Next.js 15 + TypeScript + TailwindCSS

---

## 📊 **TABLAS MAESTRAS (Master Data)**

### **1. `regions` - Regiones Geográficas**
```sql
CREATE TABLE regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Headers:**
- `id` - Identificador único (Primary Key)
- `name` - Nombre de la región (ej: "Europa", "Asia", "América")
- `created_at` - Fecha de creación del registro
- `updated_at` - Fecha de última actualización

**Ejemplos de datos:**
- Europa
- Asia
- América del Norte
- América del Sur
- África
- Oceanía

---

### **2. `markets` - Mercados por Región**
```sql
CREATE TABLE markets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  region_id INTEGER REFERENCES regions(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Headers:**
- `id` - Identificador único (Primary Key)
- `name` - Nombre del mercado
- `region_id` - Referencia a la tabla regions (Foreign Key)
- `created_at` - Fecha de creación del registro
- `updated_at` - Fecha de última actualización

**Relación:** `regions (1) ←→ (N) markets`

---

### **3. `countries` - Países por Mercado**
```sql
CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  market_id INTEGER REFERENCES markets(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Headers:**
- `id` - Identificador único (Primary Key)
- `name` - Nombre del país
- `market_id` - Referencia a la tabla markets (Foreign Key)
- `created_at` - Fecha de creación del registro
- `updated_at` - Fecha de última actualización

**Relación:** `markets (1) ←→ (N) countries`

**Ejemplos de datos:**
- Alemania, Francia, Reino Unido (Europa)
- China, Japón, Corea del Sur (Asia)
- Estados Unidos, Canadá (América del Norte)

---

### **4. `species` - Especies de Productos**
```sql
CREATE TABLE species (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Headers:**
- `id` - Identificador único (Primary Key)
- `name` - Nombre de la especie
- `created_at` - Fecha de creación del registro
- `updated_at` - Fecha de última actualización

**Ejemplos de datos:**
- APPLES (Manzanas)
- CHERRIES (Cerezas)
- MANDARINS (Mandarinas)
- AVOCADOS (Aguacates)
- LEMONS (Limones)
- ORANGES (Naranjas)
- GRAPES (Uvas)

---

### **5. `varieties` - Variedades por Especie**
```sql
CREATE TABLE varieties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  species_id INTEGER REFERENCES species(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Headers:**
- `id` - Identificador único (Primary Key)
- `name` - Nombre de la variedad
- `species_id` - Referencia a la tabla species (Foreign Key)
- `created_at` - Fecha de creación del registro
- `updated_at` - Fecha de última actualización

**Relación:** `species (1) ←→ (N) varieties`

**Ejemplos de datos:**
- Para APPLES: Gala, Fuji, Granny Smith, Red Delicious
- Para CHERRIES: Bing, Rainier, Sweetheart
- Para MANDARINS: Clementine, Satsuma, Tangerine

---

### **6. `transport_types` - Tipos de Transporte**
```sql
CREATE TABLE transport_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  transport_category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Headers:**
- `id` - Identificador único (Primary Key)
- `name` - Nombre del tipo de transporte
- `transport_category` - Categoría del transporte
- `created_at` - Fecha de creación del registro
- `updated_at` - Fecha de última actualización

**Ejemplos de datos:**
- Marítimo (Contenedor, Bulk)
- Aéreo (Carga regular, Charter)
- Terrestre (Camión, Tren)

---

### **7. `arrival_ports` - Puertos de Llegada**
```sql
CREATE TABLE arrival_ports (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Headers:**
- `id` - Identificador único (Primary Key)
- `name` - Nombre del puerto
- `created_at` - Fecha de creación del registro
- `updated_at` - Fecha de última actualización

**Ejemplos de datos:**
- Puerto de Hamburgo (Alemania)
- Puerto de Rotterdam (Países Bajos)
- Puerto de Shanghai (China)
- Puerto de Los Ángeles (Estados Unidos)

---

### **8. `exporters` - Empresas Exportadoras**
```sql
CREATE TABLE exporters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Headers:**
- `id` - Identificador único (Primary Key)
- `name` - Nombre de la empresa exportadora
- `created_at` - Fecha de creación del registro
- `updated_at` - Fecha de última actualización

**Ejemplos de datos:**
- Frutícola del Valle S.A.
- Exportadora Agrícola Ltda.
- Comercializadora de Frutas S.A.

---

### **9. `importers` - Empresas Importadoras**
```sql
CREATE TABLE importers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Headers:**
- `id` - Identificador único (Primary Key)
- `name` - Nombre de la empresa importadora
- `created_at` - Fecha de creación del registro
- `updated_at` - Fecha de última actualización

**Ejemplos de datos:**
- Supermercado Europeo GmbH
- Distribuidora Asiática Co.
- Importadora Americana Inc.

---

### **10. `seasons` - Temporadas de Exportación**
```sql
CREATE TABLE seasons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_year INTEGER NOT NULL,
  end_year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Headers:**
- `id` - Identificador único (Primary Key)
- `name` - Nombre de la temporada
- `start_year` - Año de inicio de la temporada
- `end_year` - Año de fin de la temporada
- `created_at` - Fecha de creación del registro
- `updated_at` - Fecha de última actualización

**Ejemplos de datos:**
- 2024-2025 (start_year: 2024, end_year: 2025)
- 2023-2024 (start_year: 2023, end_year: 2024)
- 2022-2023 (start_year: 2022, end_year: 2023)
- 2021-2022 (start_year: 2021, end_year: 2022)

---

## 🚢 **TABLAS DE ENVÍOS (Shipments) - Por Temporada**

### **11. `shipments_2024_2025` - Envíos Temporada 2024-2025**
```sql
CREATE TABLE shipments_2024_2025 (
  id SERIAL PRIMARY KEY,
  season_id INTEGER REFERENCES seasons(id),
  etd_week VARCHAR(10), -- Formato: "2024-W01"
  region_id INTEGER REFERENCES regions(id),
  market_id INTEGER REFERENCES markets(id),
  country_id INTEGER REFERENCES countries(id),
  transport_type_id INTEGER REFERENCES transport_types(id),
  species_id INTEGER REFERENCES species(id),
  variety_id INTEGER REFERENCES varieties(id),
  importer_id INTEGER REFERENCES importers(id),
  exporter_id INTEGER REFERENCES exporters(id),
  arrival_port_id INTEGER REFERENCES arrival_ports(id),
  boxes INTEGER,
  kilograms DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Headers:**
- `id` - Identificador único (Primary Key)
- `season_id` - Referencia a la tabla seasons (Foreign Key)
- `etd_week` - Semana de embarque (ej: "2024-W01", "2024-W02")
- `region_id` - Referencia a la tabla regions (Foreign Key)
- `market_id` - Referencia a la tabla markets (Foreign Key)
- `country_id` - Referencia a la tabla countries (Foreign Key)
- `transport_type_id` - Referencia a la tabla transport_types (Foreign Key)
- `species_id` - Referencia a la tabla species (Foreign Key)
- `variety_id` - Referencia a la tabla varieties (Foreign Key)
- `importer_id` - Referencia a la tabla importers (Foreign Key)
- `exporter_id` - Referencia a la tabla exporters (Foreign Key)
- `arrival_port_id` - Referencia a la tabla arrival_ports (Foreign Key)
- `boxes` - Cantidad de cajas enviadas
- `kilograms` - Peso total en kilogramos
- `created_at` - Fecha de creación del registro
- `updated_at` - Fecha de última actualización

**Notas:**
- `etd_week` sigue el formato ISO 8601 para semanas
- `boxes` y `kilograms` pueden ser NULL si no están disponibles
- Todas las referencias son Foreign Keys que mantienen integridad referencial

---

### **12. `shipments_2023_2024` - Envíos Temporada 2023-2024**
- *Misma estructura que shipments_2024_2025*
- **Diferencia**: Los datos corresponden a la temporada 2023-2024

### **13. `shipments_2022_2023` - Envíos Temporada 2022-2023**
- *Misma estructura que shipments_2024_2025*
- **Diferencia**: Los datos corresponden a la temporada 2022-2023

### **14. `shipments_2021_2022` - Envíos Temporada 2021-2022**
- *Misma estructura que shipments_2024_2025*
- **Diferencia**: Los datos corresponden a la temporada 2021-2022

---

## 🔗 **RELACIONES ENTRE TABLAS**

### **Diagrama de Relaciones**
```
regions (1) ←→ (N) markets (1) ←→ (N) countries (1) ←→ (N) shipments
    ↑                                                           ↑
    └───────────────────────────────────────────────────────────┘

species (1) ←→ (N) varieties (1) ←→ (N) shipments
    ↑                                              ↑
    └──────────────────────────────────────────────┘

transport_types (1) ←→ (N) shipments
    ↑                                    ↑
    └────────────────────────────────────┘

arrival_ports (1) ←→ (N) shipments
    ↑                                ↑
    └────────────────────────────────┘

exporters (1) ←→ (N) shipments
    ↑                            ↑
    └────────────────────────────┘

importers (1) ←→ (N) shipments
    ↑                            ↑
    └────────────────────────────┘

seasons (1) ←→ (N) shipments
    ↑                        ↑
    └────────────────────────┘
```

### **Cardinalidad de Relaciones**
- **1:1** - No hay relaciones uno a uno en este esquema
- **1:N** - Todas las relaciones son uno a muchos
- **N:M** - No hay relaciones muchos a muchos directas

---

## 📈 **USO EN EL DASHBOARD**

### **KPI Cards (Tarjetas de Métricas)**
- **Total Exporters**: Conteo de empresas exportadoras activas
- **Total Importers**: Conteo de empresas importadoras activas
- **Species**: Conteo total de especies + variedades disponibles
- **Total Shipments**: Total de envíos por temporada o todas las temporadas

### **Gráficos y Visualizaciones**
- **Countries Bar Chart**: Top países por volumen de envíos
- **Species Pie Chart**: Distribución de especies por volumen
- **Monthly Shipments Chart**: Evolución temporal de envíos
- **Shipments Overview**: Resumen detallado de envíos

### **Filtros Disponibles**
- **Temporada**: All Seasons, 2024-2025, 2023-2024, 2022-2023, 2021-2022
- **Especie**: Filtro específico en el gráfico de países
- **Reset**: Botón para volver a "All Seasons" por defecto

---

## 🗃️ **ESTRUCTURA DE DATOS**

### **Tipos de Datos Utilizados**
- **INTEGER**: IDs, conteos, referencias
- **VARCHAR**: Nombres, descripciones
- **DECIMAL**: Pesos, cantidades monetarias
- **TIMESTAMP**: Fechas de creación y actualización
- **BOOLEAN**: Estados, flags (si se requieren)

### **Índices Recomendados**
```sql
-- Índices para mejorar performance en consultas frecuentes
CREATE INDEX idx_shipments_season_id ON shipments_2024_2025(season_id);
CREATE INDEX idx_shipments_species_id ON shipments_2024_2025(species_id);
CREATE INDEX idx_shipments_country_id ON shipments_2024_2025(country_id);
CREATE INDEX idx_shipments_etd_week ON shipments_2024_2025(etd_week);
CREATE INDEX idx_shipments_exporter_id ON shipments_2024_2025(exporter_id);
CREATE INDEX idx_shipments_importer_id ON shipments_2024_2025(importer_id);
```

---

## 🔍 **CONSULTAS FRECUENTES**

### **1. Total de Envíos por Temporada**
```sql
SELECT 
  s.name as season_name,
  COUNT(*) as total_shipments,
  SUM(ship.boxes) as total_boxes,
  SUM(ship.kilograms) as total_kilograms
FROM seasons s
LEFT JOIN shipments_2024_2025 ship ON s.id = ship.season_id
GROUP BY s.id, s.name
ORDER BY s.start_year DESC;
```

### **2. Top 10 Especies por Volumen**
```sql
SELECT 
  sp.name as species_name,
  COUNT(*) as total_shipments,
  SUM(ship.boxes) as total_boxes,
  SUM(ship.kilograms) as total_kilograms
FROM species sp
JOIN shipments_2024_2025 ship ON sp.id = ship.species_id
GROUP BY sp.id, sp.name
ORDER BY total_kilograms DESC
LIMIT 10;
```

### **3. Top 10 Países por Volumen**
```sql
SELECT 
  c.name as country_name,
  COUNT(*) as total_shipments,
  SUM(ship.boxes) as total_boxes,
  SUM(ship.kilograms) as total_kilograms
FROM countries c
JOIN shipments_2024_2025 ship ON c.id = ship.country_id
GROUP BY c.id, c.name
ORDER BY total_kilograms DESC
LIMIT 10;
```

### **4. Envíos por Semana (Últimas 12 semanas)**
```sql
SELECT 
  etd_week,
  COUNT(*) as shipments_count,
  SUM(boxes) as total_boxes,
  SUM(kilograms) as total_kilograms
FROM shipments_2024_2025
WHERE etd_week IS NOT NULL
GROUP BY etd_week
ORDER BY etd_week DESC
LIMIT 12;
```

---

## 🚀 **FUNCIONALIDADES IMPLEMENTADAS**

### **API Functions Disponibles**
- `getRegions()` - Obtener todas las regiones
- `getMarkets(regionId?)` - Obtener mercados por región
- `getCountries(marketId?)` - Obtener países por mercado
- `getSpecies()` - Obtener todas las especies
- `getVarieties(speciesId?)` - Obtener variedades por especie
- `getTransportTypes()` - Obtener tipos de transporte
- `getArrivalPorts()` - Obtener puertos de llegada
- `getExporters()` - Obtener empresas exportadoras
- `getImporters()` - Obtener empresas importadoras
- `getSeasons()` - Obtener temporadas disponibles

### **Funciones de Analytics**
- `getShipmentAnalytics(season)` - Analytics por temporada o todas
- `getWeeklyShipments(season)` - Envíos semanales por temporada
- `getDashboardKPIs(season)` - KPIs del dashboard
- `getShipmentById(id, season)` - Envío específico por ID
- `searchGlobal(searchTerm)` - Búsqueda global en múltiples tablas

---

## 📝 **NOTAS DE IMPLEMENTACIÓN**

### **Características Técnicas**
- **Row Level Security (RLS)**: Implementado para control de acceso
- **Foreign Key Constraints**: Mantienen integridad referencial
- **Timestamps Automáticos**: created_at y updated_at se actualizan automáticamente
- **Soft Deletes**: No implementado (se pueden agregar si es necesario)

### **Consideraciones de Performance**
- **Índices**: Recomendados para campos de búsqueda frecuente
- **Paginación**: Implementada en consultas de envíos
- **Caching**: Se puede implementar para datos estáticos (regiones, especies, etc.)
- **Agregación**: Los KPIs se calculan en tiempo real

### **Escalabilidad**
- **Particionamiento**: Las tablas de envíos están separadas por temporada
- **Archivado**: Los datos históricos se pueden mover a tablas de archivo
- **Backup**: Recomendado backup diario para datos críticos

---

## 🔧 **MANTENIMIENTO**

### **Tareas Regulares**
- **Limpieza de datos**: Eliminar registros duplicados o inválidos
- **Actualización de estadísticas**: Mantener índices actualizados
- **Backup**: Respaldos regulares de la base de datos
- **Monitoreo**: Revisar performance de consultas

### **Métricas de Salud**
- **Tiempo de respuesta**: Consultas principales < 100ms
- **Uso de disco**: Monitorear crecimiento de tablas
- **Conectividad**: Verificar conexiones activas
- **Errores**: Revisar logs de errores regularmente

---

*Documento generado para referencia del equipo de desarrollo FullCargo*
*Última actualización: Diciembre 2024*
