# 🚀 PLAN DE IMPLEMENTACIÓN - EXPORTERS ANALYTICS

## 📋 **RESUMEN DEL PROBLEMA**
Los logs muestran errores persistentes:
- `column reference "kilograms" is ambiguous` (vistas materializadas)
- `structure of query does not match function result type` (RPC functions)
- Funciones RPC para YoY/retención no implementadas

## 🎯 **SOLUCIÓN EN 3 FASES**

---

## **FASE 1: Verificar y Corregir Vistas Materializadas**

### **Paso 1.1: Ejecutar Script de Corrección**
```sql
-- Copiar y ejecutar en Supabase SQL Editor:
-- Contenido del archivo: fix-materialized-views.sql
```

**Qué hace:**
- ✅ Elimina vistas materializadas existentes con problemas
- ✅ Recrea vistas con estructura correcta (sin columnas ambiguas)
- ✅ Crea índices optimizados
- ✅ Asigna permisos correctos
- ✅ Crea función de refresh

### **Paso 1.2: Verificar Creación**
```sql
-- Verificar que las vistas se crearon correctamente:
SELECT COUNT(*) FROM v_exporter_kpis;
SELECT COUNT(*) FROM v_exporter_timeseries;
SELECT COUNT(*) FROM v_exporter_tops;
SELECT COUNT(*) FROM v_exporter_rankings;
```

### **Paso 1.3: Refrescar Datos**
```sql
-- Refrescar las vistas con datos actuales:
SELECT refresh_exporters_views();
```

---

## **FASE 2: Implementar RPC para YoY/Retención**

### **Paso 2.1: Ejecutar Script de RPC**
```sql
-- Copiar y ejecutar en Supabase SQL Editor:
-- Contenido del archivo: yoy-retention-rpc.sql
```

**Qué hace:**
- ✅ Crea función `get_exporter_yoy_growth()` para crecimiento año-a-año
- ✅ Crea función `get_global_yoy_growth()` para métricas globales
- ✅ Crea función `get_exporter_importer_retention()` para retención por exportador
- ✅ Crea función `get_global_importer_retention()` para retención global
- ✅ Asigna permisos correctos

### **Paso 2.2: Verificar Funciones RPC**
```sql
-- Verificar que las funciones se crearon:
SELECT * FROM get_exporter_yoy_growth(1, 2) LIMIT 1;
SELECT * FROM get_exporter_importer_retention(1, 2) LIMIT 1;
```

---

## **FASE 3: Corregir Errores de Columnas Ambiguas**

### **Paso 3.1: API Route Actualizado**
✅ **YA IMPLEMENTADO** en `src/app/api/exporters/route.ts`:
- Integra llamadas RPC para YoY y retención
- Maneja datos de vistas materializadas corregidas
- Procesa métricas complejas (YoY, retención)

### **Paso 3.2: Verificar Funcionamiento**
1. **Reiniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Probar página de exportadores:**
   - Ir a `http://localhost:3000/exporters`
   - Verificar que no hay errores en consola
   - Confirmar que los datos se cargan correctamente

---

## 🔧 **ARCHIVOS CREADOS/MODIFICADOS**

### **Nuevos Archivos SQL:**
- `fix-materialized-views.sql` - Corrige vistas materializadas
- `yoy-retention-rpc.sql` - Implementa funciones RPC complejas

### **Archivos Modificados:**
- `src/app/api/exporters/route.ts` - Integra RPC y corrige procesamiento

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

### **Después de Fase 1:**
- [ ] Vistas materializadas creadas sin errores
- [ ] Datos se refrescan correctamente
- [ ] No hay errores de columnas ambiguas

### **Después de Fase 2:**
- [ ] Funciones RPC creadas sin errores
- [ ] Pruebas de RPC funcionan
- [ ] Permisos asignados correctamente

### **Después de Fase 3:**
- [ ] API route responde sin errores
- [ ] Página de exportadores carga completamente
- [ ] Métricas YoY y retención se muestran
- [ ] Scroll funciona correctamente

---

## 🚨 **POSIBLES PROBLEMAS Y SOLUCIONES**

### **Problema: "function does not exist"**
**Solución:** Verificar que los scripts SQL se ejecutaron completamente

### **Problema: "permission denied"**
**Solución:** Verificar que los GRANT se ejecutaron correctamente

### **Problema: "column reference ambiguous"**
**Solución:** Las vistas materializadas corregidas deberían resolver esto

### **Problema: Datos no se actualizan**
**Solución:** Ejecutar `SELECT refresh_exporters_views();`

---

## 🎯 **RESULTADO ESPERADO**

Al completar las 3 fases:
- ✅ Vistas materializadas funcionando sin errores
- ✅ Funciones RPC para YoY/retención implementadas
- ✅ API route integrando datos complejos
- ✅ Página de exportadores completamente funcional
- ✅ Métricas avanzadas (YoY, retención) disponibles
- ✅ Performance optimizada con vistas materializadas

---

## 📞 **SIGUIENTE PASO**

**Ejecutar Fase 1:** Copiar y ejecutar `fix-materialized-views.sql` en Supabase SQL Editor

