# 📋 COMPONENTES DISPONIBLES - EXPO HUB

## 🎯 **RESUMEN EJECUTIVO**

Este documento contiene **todos los componentes predefinidos** disponibles en el proyecto Expo_Hub, organizados por categorías y con ejemplos de implementación. Todos los componentes están **listos para usar** con TypeScript completo, temas automáticos y diseño responsive.

---

## 🎨 **COMPONENTES DE GRÁFICOS (Charts)**

### **Basados en Recharts - Fácil implementación**

#### **Tipos de Gráficos Disponibles:**
1. **BarChart** - Gráficos de barras
2. **LineChart** - Gráficos de líneas  
3. **AreaChart** - Gráficos de área
4. **PieChart** - Gráficos circulares
5. **ComposedChart** - Gráficos combinados
6. **ScatterChart** - Gráficos de dispersión
7. **RadarChart** - Gráficos de radar
8. **FunnelChart** - Gráficos de embudo

#### **Componentes ya implementados:**
- `src/features/overview/components/bar-graph.tsx`
- `src/features/overview/components/area-graph.tsx`
- `src/features/overview/components/pie-graph.tsx`
- `src/app/dashboard/exporters/_components/TrendChart.tsx`
- `src/app/dashboard/exporters/_components/CompareChart.tsx`
- `src/app/dashboard/exporters/_components/TopBars.tsx`
- `src/app/dashboard/exporters/_components/MixCharts.tsx`

#### **Ejemplo de uso:**
```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

<BarChart data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="value" fill="#8884d8" />
</BarChart>
```

---

## 📊 **COMPONENTES DE TABLAS**

### **Basados en shadcn/ui**

#### **Componentes de Tabla:**
1. **Table** - Tabla básica
2. **TableHeader** - Encabezado de tabla
3. **TableBody** - Cuerpo de tabla
4. **TableFooter** - Pie de tabla
5. **TableRow** - Fila de tabla
6. **TableHead** - Celda de encabezado
7. **TableCell** - Celda de datos
8. **TableCaption** - Descripción de tabla

#### **Componente ya implementado:**
- `src/app/dashboard/exporters/_components/ExportersTable.tsx`

#### **Ejemplo de uso:**
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nombre</TableHead>
      <TableHead>Valor</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Dato 1</TableCell>
      <TableCell>100</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 🎯 **COMPONENTES DE INTERFAZ BÁSICOS**

### **Cards (Tarjetas)**

#### **Componentes de Card:**
- `Card` - Contenedor principal
- `CardHeader` - Encabezado de tarjeta
- `CardTitle` - Título de tarjeta
- `CardDescription` - Descripción de tarjeta
- `CardContent` - Contenido de tarjeta
- `CardFooter` - Pie de tarjeta
- `CardAction` - Acción de tarjeta

#### **Ejemplo de uso:**
```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Título de la Tarjeta</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Contenido de la tarjeta</p>
  </CardContent>
  <CardFooter>
    <Button>Acción</Button>
  </CardFooter>
</Card>
```

### **Botones**

#### **Variantes disponibles:**
- `default` - Botón primario
- `destructive` - Botón de eliminación
- `outline` - Botón con borde
- `secondary` - Botón secundario
- `ghost` - Botón fantasma
- `link` - Botón tipo enlace

#### **Tamaños:**
- `sm` - Pequeño
- `default` - Normal
- `lg` - Grande
- `icon` - Solo icono

#### **Ejemplo de uso:**
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="lg">
  Botón Principal
</Button>
<Button variant="destructive" size="sm">
  Eliminar
</Button>
```

### **Badges (Etiquetas)**

#### **Variantes disponibles:**
- `default` - Etiqueta primaria
- `secondary` - Etiqueta secundaria
- `destructive` - Etiqueta de error
- `outline` - Etiqueta con borde

#### **Ejemplo de uso:**
```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Nuevo</Badge>
<Badge variant="destructive">Error</Badge>
```

### **Inputs (Entradas)**

#### **Componentes de Input:**
- `Input` - Campo de texto básico
- `Textarea` - Campo de texto multilínea
- `InputOTP` - Campo para códigos OTP

#### **Ejemplo de uso:**
```tsx
import { Input, Textarea } from '@/components/ui/input';

<Input placeholder="Ingrese texto" />
<Textarea placeholder="Descripción" />
```

---

## 🔍 **COMPONENTES DE SELECCIÓN**

### **Select (Selección)**

#### **Componentes de Select:**
- `Select` - Selector básico
- `SelectGroup` - Grupo de opciones
- `SelectValue` - Valor seleccionado
- `SelectTrigger` - Disparador del selector
- `SelectContent` - Contenido del selector
- `SelectLabel` - Etiqueta del selector
- `SelectItem` - Elemento del selector

#### **Ejemplo de uso:**
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Seleccionar opción" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opcion1">Opción 1</SelectItem>
    <SelectItem value="opcion2">Opción 2</SelectItem>
  </SelectContent>
</Select>
```

### **MultiSearchSelect**

#### **Características:**
- Selector múltiple con búsqueda
- Filtrado en tiempo real
- Selección/deselección de múltiples opciones
- Badges para mostrar selecciones

#### **Ejemplo de uso:**
```tsx
import { MultiSearchSelect } from '@/components/ui/multi-search-select';

<MultiSearchSelect
  options={[
    { id: 1, name: "Opción 1" },
    { id: 2, name: "Opción 2" }
  ]}
  value={selectedValues}
  onValueChange={setSelectedValues}
  placeholder="Seleccionar múltiples opciones"
/>
```

### **SearchSelect**
- Selector con búsqueda individual

---

## 📅 **COMPONENTES DE FECHA**

### **Calendar**
- Calendario completo
- Soporte para selección de fechas
- Soporte para rangos de fechas

#### **Ejemplo de uso:**
```tsx
import { Calendar } from '@/components/ui/calendar';

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-md border"
/>
```

---

## 📈 **COMPONENTES DE PROGRESO**

### **Progress**
- Barra de progreso

### **Slider**
- Control deslizante

#### **Ejemplo de uso:**
```tsx
import { Progress, Slider } from '@/components/ui/progress';

<Progress value={33} />
<Slider defaultValue={[33]} max={100} step={1} />
```

---

## 🎭 **COMPONENTES DE NAVEGACIÓN**

### **Tabs (Pestañas)**

#### **Componentes de Tabs:**
- `Tabs` - Contenedor de pestañas
- `TabsList` - Lista de pestañas
- `TabsTrigger` - Disparador de pestaña
- `TabsContent` - Contenido de pestaña

#### **Ejemplo de uso:**
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Pestaña 1</TabsTrigger>
    <TabsTrigger value="tab2">Pestaña 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Contenido 1</TabsContent>
  <TabsContent value="tab2">Contenido 2</TabsContent>
</Tabs>
```

### **Breadcrumbs**

#### **Componentes de Breadcrumb:**
- `Breadcrumb` - Navegación de migas de pan
- `BreadcrumbList` - Lista de migas
- `BreadcrumbItem` - Elemento de miga
- `BreadcrumbLink` - Enlace de miga
- `BreadcrumbPage` - Página actual

---

## 🎪 **COMPONENTES DE DIÁLOGO**

### **Dialog (Diálogos)**

#### **Componentes de Dialog:**
- `Dialog` - Diálogo modal
- `DialogTrigger` - Disparador de diálogo
- `DialogContent` - Contenido del diálogo
- `DialogHeader` - Encabezado del diálogo
- `DialogFooter` - Pie del diálogo
- `DialogTitle` - Título del diálogo
- `DialogDescription` - Descripción del diálogo

#### **Ejemplo de uso:**
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger>Abrir Diálogo</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título del Diálogo</DialogTitle>
    </DialogHeader>
    <p>Contenido del diálogo</p>
  </DialogContent>
</Dialog>
```

### **Alert Dialog**
- Diálogo de confirmación con componentes similares a Dialog

### **Popover**
- Contenido emergente

#### **Ejemplo de uso:**
```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

<Popover>
  <PopoverTrigger>Disparador</PopoverTrigger>
  <PopoverContent>
    <p>Contenido emergente</p>
  </PopoverContent>
</Popover>
```

---

## 🏗️ **COMPONENTES DE LAYOUT**

### **Accordion (Acordeón)**

#### **Componentes de Accordion:**
- `Accordion` - Contenedor de acordeón
- `AccordionItem` - Elemento del acordeón
- `AccordionTrigger` - Disparador
- `AccordionContent` - Contenido

#### **Ejemplo de uso:**
```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Sección 1</AccordionTrigger>
    <AccordionContent>Contenido de la sección</AccordionContent>
  </AccordionItem>
</Accordion>
```

### **Collapsible**
- Contenido colapsable

### **Separator**
- Separador visual

### **ScrollArea**
- Área con scroll personalizado

---

## 🎛️ **COMPONENTES DE FORMULARIOS**

### **Form**

#### **Componentes de Form:**
- `Form` - Formulario con validación
- `FormField` - Campo de formulario
- `FormItem` - Elemento de formulario
- `FormLabel` - Etiqueta de formulario
- `FormControl` - Control de formulario
- `FormDescription` - Descripción de campo
- `FormMessage` - Mensaje de error/validación

### **Checkbox**
- Casilla de verificación

### **RadioGroup**
- Grupo de botones de radio

### **Switch**
- Interruptor toggle

### **Toggle**
- Botón toggle

#### **Ejemplo de uso:**
```tsx
import { Checkbox, Switch, Toggle } from '@/components/ui/checkbox';

<Checkbox />
<Switch />
<Toggle>Aria Label</Toggle>
```

---

## 🎨 **COMPONENTES DE TEMA**

### **ThemeSelector**
- Selector de tema

### **ActiveTheme**
- Tema activo

---

## 📱 **COMPONENTES ESPECIALIZADOS**

### **File Uploader**
- `FileUploader` - Subida de archivos

### **KPIs**
- `KpiCards` - Tarjetas de indicadores clave
- `dashboard-kpi-cards.tsx` - KPIs del dashboard

### **Filtros**
- `Filters` - Sistema de filtros
- `dashboard-filters.tsx` - Filtros del dashboard

---

## 🎯 **COMPONENTES DE UTILIDAD**

### **Skeletons (Esqueletos de carga)**
- `Skeleton` - Esqueleto básico
- `form-card-skeleton.tsx` - Esqueleto de formulario
- `bar-graph-skeleton.tsx` - Esqueleto de gráfico de barras
- `area-graph-skeleton.tsx` - Esqueleto de gráfico de área
- `pie-graph-skeleton.tsx` - Esqueleto de gráfico circular

#### **Ejemplo de uso:**
```tsx
import { Skeleton } from '@/components/ui/skeleton';

<Skeleton className="h-4 w-[250px]" />
```

### **Tooltips**
- `Tooltip` - Información emergente
- `TooltipTrigger` - Disparador
- `TooltipContent` - Contenido

### **HoverCard**
- `HoverCard` - Tarjeta al pasar el mouse
- `HoverCardTrigger` - Disparador
- `HoverCardContent` - Contenido

---

## 🎨 **COMPONENTES DE ICONOS**

### **Iconos disponibles:**
- `icons.tsx` - Biblioteca de iconos
- Iconos de Lucide React
- Iconos de Radix UI

#### **Ejemplo de uso:**
```tsx
import { IconPackage, IconGlobe, IconLeaf } from '@/components/icons';

<IconPackage className="h-4 w-4" />
```

---

## 🚀 **FÁCIL IMPLEMENTACIÓN**

### **Características de todos los componentes:**

1. **Importación simple**: `import { Component } from '@/components/ui/component'`
2. **Props tipadas**: TypeScript completo
3. **Temas automáticos**: Soporte para modo claro/oscuro
4. **Responsive**: Diseño adaptable
5. **Accesibilidad**: ARIA labels y navegación por teclado

### **Estructura de archivos:**
```
src/
├── components/
│   ├── ui/           # Componentes base de shadcn/ui
│   ├── layout/       # Componentes de layout
│   └── modal/        # Componentes de modal
├── features/
│   └── overview/
│       └── components/  # Componentes específicos del dashboard
└── app/
    └── dashboard/
        └── exporters/
            └── _components/  # Componentes específicos de exportadores
```

---

## 📝 **EJEMPLOS DE USO COMUNES**

### **Dashboard con KPIs y Gráficos:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <Card>
    <CardHeader>
      <CardTitle>Total Ventas</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">$1,234,567</p>
    </CardContent>
  </Card>
</div>

<Card>
  <CardHeader>
    <CardTitle>Gráfico de Ventas</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

### **Formulario con Validación:**
```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input, Button } from '@/components/ui/input';

<Form>
  <FormField
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input placeholder="email@ejemplo.com" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
  <Button type="submit">Enviar</Button>
</Form>
```

---

## 🔧 **CONFIGURACIÓN Y PERSONALIZACIÓN**

### **Temas y Colores:**
Todos los componentes soportan temas automáticos y pueden ser personalizados mediante:
- Variables CSS personalizadas
- Clases de Tailwind CSS
- Props de tema específicas

### **Responsive Design:**
Los componentes incluyen clases responsive de Tailwind:
- `sm:` - Pantallas pequeñas (640px+)
- `md:` - Pantallas medianas (768px+)
- `lg:` - Pantallas grandes (1024px+)
- `xl:` - Pantallas extra grandes (1280px+)

---

## 📚 **RECURSOS ADICIONALES**

### **Documentación:**
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Recharts Documentation](https://recharts.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

### **Iconos:**
- [Lucide Icons](https://lucide.dev/)
- [Radix Icons](https://www.radix-ui.com/icons)

---

**Última actualización:** Enero 2025  
**Versión del proyecto:** Expo_Hub v1.0.0  
**Framework:** Next.js 15.3.2 + TypeScript + Tailwind CSS
