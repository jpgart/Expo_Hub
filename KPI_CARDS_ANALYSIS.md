# 📊 ANÁLISIS DE TARJETAS KPI - ESTRUCTURA Y EDICIÓN

## 🎯 **ESTRUCTURA DE UNA TARJETA KPI**

Basándome en el código de ejemplo que proporcionaste y el código actual del proyecto, aquí está el desglose completo de cada sección:

### **1. TÍTULO (Title)**
```tsx
// En tu ejemplo:
<CardDescription>Total Revenue</CardDescription>

// En el código actual:
<CardTitle className='text-muted-foreground text-sm font-medium'>
  {kpi.title}
</CardTitle>
```

**Ubicación en el código:** Línea 158-160 en `KpiCards.tsx`
**Propósito:** Identifica qué métrica representa la tarjeta
**Ejemplos:** "Total Revenue", "Total Kilograms", "Active Importers"

---

### **2. VALOR KPI (Value)**
```tsx
// En tu ejemplo:
<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
  $1,250.00
</CardTitle>

// En el código actual:
<div className='text-2xl font-bold'>{kpi.value}</div>
```

**Ubicación en el código:** Línea 165 en `KpiCards.tsx`
**Propósito:** Muestra el valor numérico principal
**Formato:** Puede incluir símbolos de moneda, separadores de miles, unidades
**Ejemplos:** "$1,250.00", "35,549,711", "1,224"

---

### **3. FORMATO DEL KPI (Value Formatting)**
```tsx
// En el código actual:
value: totalKilograms.toLocaleString(), // "35,549,711"
value: `${avgKgPerBox.toFixed(1)} kg`, // "0.5 kg"
value: `${marketCoverage} countries`, // "107 countries"
```

**Ubicación en el código:** Líneas 55-140 en `KpiCards.tsx` (array `kpiData`)
**Propósito:** Define cómo se formatea el valor
**Opciones:** 
- `.toLocaleString()` - Separadores de miles
- `.toFixed(1)` - Decimales fijos
- Concatenación con unidades
- Formato de moneda

---

### **4. LEYENDA/TREND (Trend Label)**
```tsx
// En tu ejemplo:
<div className="line-clamp-1 flex gap-2 font-medium">
  Trending up this month <IconTrendingUp className="size-4" />
</div>

// En el código actual:
<div className='flex items-center gap-1 text-xs'>
  <span className={trendData.color}>
    {trendData.arrow} {trendData.text}
  </span>
  <span className='text-muted-foreground'>
    {kpi.trendLabel}
  </span>
</div>
```

**Ubicación en el código:** Líneas 167-175 en `KpiCards.tsx`
**Propósito:** Muestra la tendencia o cambio respecto al período anterior
**Componentes:**
- Flecha (↑↓→)
- Porcentaje o valor de cambio
- Texto descriptivo
- Color (verde/rojo según positivo/negativo)

---

### **5. BAJADA/SUBTÍTULO (Subtitle)**
```tsx
// En tu ejemplo:
<div className="text-muted-foreground">
  Visitors for the last 6 months
</div>

// En el código actual:
<div className='text-muted-foreground text-xs'>
  {kpi.subtitle}
</div>
```

**Ubicación en el código:** Línea 166 en `KpiCards.tsx`
**Propósito:** Proporciona contexto adicional sobre la métrica
**Ejemplos:** "All shipments", "Unique importers", "vs prev season"

---

### **6. MINI-ICONO CON PORCENTAJE (Badge with Percentage)**
```tsx
// En tu ejemplo:
<CardAction>
  <Badge variant="outline">
    <IconTrendingUp />
    +12.5%
  </Badge>
</CardAction>

// En el código actual (icono principal):
<div className={`rounded-lg p-2 ${kpi.bgColor}`}>
  <IconComponent className={`h-4 w-4 ${kpi.color}`} />
</div>
```

**Ubicación en el código:** Líneas 161-164 en `KpiCards.tsx`
**Propósito:** Icono representativo de la métrica
**Características:**
- Icono específico por tipo de KPI
- Color de fondo y texto personalizable
- Posición en la esquina superior derecha

---

## 🔧 **SISTEMA DE EDICIÓN DE KPIs**

### **Estructura de Datos para Edición:**

```tsx
interface EditableKpi {
  id: string;
  title: string;           // Título de la tarjeta
  value: number;           // Valor numérico
  valueFormat: string;     // Formato del valor
  subtitle: string;        // Bajada/descripción
  trend: number | null;    // Porcentaje de cambio
  trendLabel: string;      // Etiqueta del trend
  icon: string;            // Nombre del icono
  color: string;           // Color del icono
  bgColor: string;         // Color de fondo del icono
  enabled: boolean;        // Si está activo
  order: number;           // Orden de aparición
}
```

### **Componente de Edición:**

```tsx
// src/components/KpiEditor.tsx
export function KpiEditor({ kpi, onSave }: { kpi: EditableKpi; onSave: (kpi: EditableKpi) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar KPI: {kpi.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* TÍTULO */}
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input 
            id="title" 
            value={kpi.title} 
            placeholder="Ej: Total Revenue"
          />
        </div>

        {/* VALOR */}
        <div className="space-y-2">
          <Label htmlFor="value">Valor</Label>
          <Input 
            id="value" 
            type="number" 
            value={kpi.value}
            placeholder="1250"
          />
        </div>

        {/* FORMATO DEL VALOR */}
        <div className="space-y-2">
          <Label htmlFor="format">Formato del Valor</Label>
          <Select value={kpi.valueFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Número simple (1,250)</SelectItem>
              <SelectItem value="currency">Moneda ($1,250.00)</SelectItem>
              <SelectItem value="percentage">Porcentaje (12.5%)</SelectItem>
              <SelectItem value="with-unit">Con unidad (1,250 kg)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* SUBTÍTULO */}
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtítulo/Bajada</Label>
          <Input 
            id="subtitle" 
            value={kpi.subtitle}
            placeholder="Ej: Visitors for the last 6 months"
          />
        </div>

        {/* TREND */}
        <div className="space-y-2">
          <Label htmlFor="trend">Porcentaje de Cambio</Label>
          <Input 
            id="trend" 
            type="number" 
            value={kpi.trend || 0}
            placeholder="12.5"
          />
        </div>

        {/* ETIQUETA DEL TREND */}
        <div className="space-y-2">
          <Label htmlFor="trendLabel">Etiqueta del Trend</Label>
          <Input 
            id="trendLabel" 
            value={kpi.trendLabel}
            placeholder="Ej: vs prev month"
          />
        </div>

        {/* ICONO */}
        <div className="space-y-2">
          <Label htmlFor="icon">Icono</Label>
          <Select value={kpi.icon}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IconTrendingUp">Trending Up</SelectItem>
              <SelectItem value="IconPackage">Package</SelectItem>
              <SelectItem value="IconUsers">Users</SelectItem>
              <SelectItem value="IconGlobe">Globe</SelectItem>
              {/* Más iconos... */}
            </SelectContent>
          </Select>
        </div>

        {/* COLORES */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="color">Color del Icono</Label>
            <Select value={kpi.color}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text-blue-600">Azul</SelectItem>
                <SelectItem value="text-green-600">Verde</SelectItem>
                <SelectItem value="text-red-600">Rojo</SelectItem>
                {/* Más colores... */}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bgColor">Color de Fondo</Label>
            <Select value={kpi.bgColor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bg-blue-50">Azul Claro</SelectItem>
                <SelectItem value="bg-green-50">Verde Claro</SelectItem>
                <SelectItem value="bg-red-50">Rojo Claro</SelectItem>
                {/* Más colores... */}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ACTIVAR/DESACTIVAR */}
        <div className="flex items-center space-x-2">
          <Switch 
            id="enabled" 
            checked={kpi.enabled}
          />
          <Label htmlFor="enabled">KPI Activo</Label>
        </div>

        {/* ORDEN */}
        <div className="space-y-2">
          <Label htmlFor="order">Orden de Aparición</Label>
          <Input 
            id="order" 
            type="number" 
            value={kpi.order}
            min="1"
            max="8"
          />
        </div>

        {/* BOTONES */}
        <div className="flex gap-2">
          <Button onClick={() => onSave(kpi)}>
            Guardar Cambios
          </Button>
          <Button variant="outline">
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### **Configuración de KPIs por Defecto:**

```tsx
// src/config/kpiDefaults.ts
export const defaultKpis: EditableKpi[] = [
  {
    id: 'total-kilograms',
    title: 'Total Kilograms',
    value: 35549711,
    valueFormat: 'with-unit',
    subtitle: 'All shipments',
    trend: 0,
    trendLabel: 'vs prev season',
    icon: 'IconPackage',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    enabled: true,
    order: 1
  },
  {
    id: 'total-boxes',
    title: 'Total Boxes',
    value: 70799042,
    valueFormat: 'with-unit',
    subtitle: 'All shipments',
    trend: 0,
    trendLabel: 'vs prev season',
    icon: 'IconTruck',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
    enabled: true,
    order: 2
  },
  {
    id: 'avg-kg-box',
    title: 'Avg Kg/Box',
    value: 0.5,
    valueFormat: 'with-unit',
    subtitle: 'Efficiency metric',
    trend: null,
    trendLabel: '',
    icon: 'IconLeaf',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    enabled: true,
    order: 3
  },
  // ... más KPIs
];
```

### **Página de Administración de KPIs:**

```tsx
// src/app/dashboard/admin/kpis/page.tsx
export default function KpiAdminPage() {
  const [kpis, setKpis] = useState<EditableKpi[]>(defaultKpis);
  const [editingKpi, setEditingKpi] = useState<EditableKpi | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Administrar KPIs</h1>
        <Button onClick={() => setEditingKpi({...defaultKpis[0], id: 'new'})}>
          Agregar Nuevo KPI
        </Button>
      </div>

      {/* Lista de KPIs */}
      <div className="grid gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{kpi.title}</CardTitle>
                  <CardDescription>{kpi.subtitle}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingKpi(kpi)}
                  >
                    Editar
                  </Button>
                  <Switch checked={kpi.enabled} />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Modal de Edición */}
      {editingKpi && (
        <Dialog open={!!editingKpi} onOpenChange={() => setEditingKpi(null)}>
          <DialogContent className="max-w-2xl">
            <KpiEditor 
              kpi={editingKpi} 
              onSave={(updatedKpi) => {
                setKpis(kpis.map(k => k.id === updatedKpi.id ? updatedKpi : k));
                setEditingKpi(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
```

---

## 📋 **PROCESO DE EDICIÓN PASO A PASO**

### **1. Identificar la Sección a Editar**
- **Título:** Cambiar el nombre de la métrica
- **Valor:** Modificar el número principal
- **Formato:** Elegir cómo se muestra (moneda, porcentaje, etc.)
- **Subtítulo:** Cambiar la descripción
- **Trend:** Ajustar el porcentaje de cambio
- **Icono:** Seleccionar un icono diferente
- **Colores:** Personalizar la apariencia visual

### **2. Aplicar los Cambios**
- Los cambios se guardan en la configuración
- Se actualiza la visualización en tiempo real
- Se mantiene la consistencia con el tema

### **3. Validación**
- Verificar que los valores sean coherentes
- Asegurar que los formatos sean correctos
- Comprobar que los iconos existan

---

## 🎨 **PERSONALIZACIÓN AVANZADA**

### **Temas de Colores Predefinidos:**
```tsx
const colorThemes = {
  blue: { color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950' },
  green: { color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950' },
  purple: { color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950' },
  orange: { color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950' },
  red: { color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950' },
  // ... más temas
};
```

### **Formatos de Valor Personalizados:**
```tsx
const valueFormatters = {
  number: (value: number) => value.toLocaleString(),
  currency: (value: number) => `$${value.toLocaleString()}.00`,
  percentage: (value: number) => `${value}%`,
  withUnit: (value: number, unit: string) => `${value.toLocaleString()} ${unit}`,
  custom: (value: number, format: string) => format.replace('{value}', value.toLocaleString())
};
```

---

**Este sistema permite una edición completa y flexible de todas las secciones de las tarjetas KPI, manteniendo la consistencia visual y funcional del dashboard.**
