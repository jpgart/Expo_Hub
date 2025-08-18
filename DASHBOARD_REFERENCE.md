# 📊 Dashboard Overview - Referencia de Componentes

## 🗺️ Estructura General del Dashboard

### 📁 **Archivos principales:**
- **Layout**: `/src/app/dashboard/overview/layout.tsx`
- **Parallel Routes**: `/src/app/dashboard/overview/@{slot}/page.tsx`
- **Componentes**: `/src/features/fullcargo/components/`

---

## 🎯 **Secciones del Dashboard (de arriba hacia abajo)**

### 1. **Header Section** 
- **Ubicación**: Línea 34-38 en `layout.tsx`
- **Contenido**: Mensaje de bienvenida
- **Código**: `<h2>Hi, Welcome back 👋</h2>`

### 2. **Dashboard Filters Section**
- **Componente**: `<DashboardFilters />`
- **Archivo**: `/src/components/dashboard-filters.tsx`
- **Ubicación**: Línea 41-44 en `layout.tsx`
- **Funcionalidad**: 
  - Selector de temporada (Season Filter)
  - Badge de filtros activos
  - Botón reset

### 3. **KPI Cards Grid** (4 columnas)
- **Ubicación**: Línea 46-124 en `layout.tsx`
- **Grid CSS**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

#### **KPI Cards individuales:**
1. **Total Revenue Card**
   - Valor: `$1,250.00`
   - Trend: `+12.5%` (verde)
   
2. **New Customers Card**
   - Valor: `1,234`
   - Trend: `-20%` (rojo)
   
3. **Active Accounts Card**
   - Valor: `45,678`
   - Trend: `+12.5%` (verde)
   
4. **Growth Rate Card**
   - Valor: `4.5%`
   - Trend: `+4.5%` (verde)

### 4. **Main Charts Grid**
- **Ubicación**: Línea 125-133 en `layout.tsx`
- **Grid CSS**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-7`

---

## 📈 **Componentes de Gráficos (Parallel Routes)**

### **Fila Superior** (Main Charts Row)

#### **A. Countries Bar Chart** 
- **Slot**: `@bar_stats`
- **Archivo**: `/src/app/dashboard/overview/@bar_stats/page.tsx`
- **Componente**: `<CountriesBarChart />`
- **Ubicación**: `/src/features/fullcargo/components/countries-bar-chart.tsx`
- **Grid**: `col-span-4` (lado izquierdo)
- **Datos**: Top 8 países por volumen
- **Métricas**: Kilograms/Boxes toggle

#### **B. Shipments Overview**
- **Slot**: `@sales`
- **Archivo**: `/src/app/dashboard/overview/@sales/page.tsx`
- **Componente**: `<ShipmentsOverview />`
- **Ubicación**: `/src/features/fullcargo/components/shipments-overview.tsx`
- **Grid**: `col-span-3` (lado derecho)
- **Datos**: Resumen + Top 5 especies

### **Fila Inferior** (Secondary Charts Row)

#### **C. Shipments Timeline Chart**
- **Slot**: `@area_stats`
- **Archivo**: `/src/app/dashboard/overview/@area_stats/page.tsx`
- **Componente**: `<ShipmentsChart />`
- **Ubicación**: `/src/features/fullcargo/components/shipments-chart.tsx`
- **Grid**: `col-span-4` (lado izquierdo)
- **Datos**: Últimas 12 semanas
- **Tipo**: Area chart

#### **D. Species Distribution Chart**
- **Slot**: `@pie_stats`
- **Archivo**: `/src/app/dashboard/overview/@pie_stats/page.tsx`
- **Componente**: `<SpeciesPieChart />`
- **Ubicación**: `/src/features/fullcargo/components/species-pie-chart.tsx`
- **Grid**: `col-span-3` (lado derecho)
- **Datos**: Top 6 especies
- **Tipo**: Pie chart

---

## 🎨 **Nombres de referencia para comunicación**

### **Por ubicación visual:**
- **Top Left**: Countries Bar Chart
- **Top Right**: Shipments Overview  
- **Bottom Left**: Shipments Timeline
- **Bottom Right**: Species Distribution

### **Por función:**
- **Countries Analysis**: Gráfico de barras de países
- **Species Breakdown**: Gráfico circular de especies
- **Timeline View**: Gráfico de área temporal
- **Summary Panel**: Panel de resumen de envíos

### **Por slot técnico:**
- **@bar_stats**: Countries Bar Chart
- **@sales**: Shipments Overview
- **@area_stats**: Shipments Timeline Chart  
- **@pie_stats**: Species Distribution Chart

---

## 🔧 **Filtros y Estado**

### **Dashboard Filters Context:**
- **Provider**: `<DashboardFiltersProvider>`
- **Hook**: `useDashboardFilters()`
- **Estado**: `{ season: string }`

### **Temporadas disponibles:**
- `2024_2025` (por defecto)
- `2023_2024`
- `2022_2023` 
- `2021_2022`

---

## 📝 **Ejemplos de uso para comunicación:**

✅ **Correcto**:
- "Cambia el gráfico de países (Countries Bar Chart / @bar_stats)"
- "Actualiza el panel de resumen (Shipments Overview / @sales)"
- "Modifica la vista temporal (Shipments Timeline / @area_stats)"
- "Ajusta el gráfico circular (Species Distribution / @pie_stats)"

✅ **También válido**:
- "El gráfico de la esquina superior izquierda"
- "El panel de la derecha en la fila superior"
- "El componente CountriesBarChart"
- "La sección de filtros"

---

*Documento generado para facilitar la comunicación sobre cambios específicos en el dashboard.*
