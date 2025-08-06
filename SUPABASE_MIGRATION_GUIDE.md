# 🚀 Guía de Migración a Supabase - Expo Hub

## ✅ Progreso Completado

- [x] **Dependencias instaladas**: `@supabase/supabase-js`
- [x] **Variables de entorno**: Agregadas a `.env.local`
- [x] **Cliente Supabase**: Configurado en `src/lib/supabase.ts`
- [x] **API migrada**: Productos y Kanban en `src/lib/supabase-api.ts`
- [x] **Componentes actualizados**: Productos usan Supabase
- [x] **Store Kanban**: Migrado de localStorage a Supabase
- [x] **Schema SQL**: Creado en `supabase-setup.sql`

## 🔧 Configuración Pendiente

### 1. **Configurar Proyecto Supabase**

1. Ve a tu [proyecto Supabase](https://app.supabase.com)
2. Ve a **SQL Editor** 
3. Ejecuta el script `supabase-setup.sql` completo
4. Verifica que se crearon las tablas: `products`, `kanban_columns`, `kanban_tasks`

### 2. **Actualizar Variables de Entorno**

Reemplaza estos valores en `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica_anon
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role
```

**Dónde encontrar las claves:**
- Ve a tu proyecto → **Settings** → **API**
- `Project URL` = `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` = `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` = `SUPABASE_SERVICE_ROLE_KEY`

### 3. **Integrar Clerk con Supabase JWT**

Para que Row Level Security funcione con Clerk:

1. **En Supabase Dashboard:**
   - Ve a **Settings** → **API** → **JWT Settings**
   - Habilita "Use custom JWT"
   - JWT Secret: `tu_clerk_jwt_secret`
   - JWKS: `https://tu-clerk-domain.clerk.accounts.dev/.well-known/jwks.json`

2. **En Clerk Dashboard:**
   - Ve a **JWT Templates**
   - Crea un nuevo template llamado "supabase"
   - Agrega claims personalizados:
   ```json
   {
     "aud": "authenticated",
     "exp": {{exp}},
     "iat": {{iat}},
     "iss": "https://tu-clerk-domain.clerk.accounts.dev",
     "sub": "{{user.id}}"
   }
   ```

### 4. **Actualizar Kanban Component**

Agrega el hook de inicialización en `src/features/kanban/components/kanban-view-page.tsx`:

```tsx
import { useSupabaseKanban } from '@/hooks/use-supabase-kanban';

export function KanbanViewPage() {
  useSupabaseKanban(); // Carga datos de Supabase
  
  // ... resto del componente
}
```

## 🧪 Testing

### Productos
1. Ve a `/dashboard/product`
2. Verifica que la tabla carga datos desde Supabase
3. Prueba filtros y búsqueda
4. Prueba crear/editar/eliminar productos

### Kanban
1. Ve a `/dashboard/kanban`
2. Verifica que las columnas y tareas cargan desde Supabase
3. Prueba drag & drop entre columnas
4. Prueba crear/editar/eliminar tareas y columnas

## 📂 Archivos Modificados

### Nuevos Archivos:
- `src/lib/supabase.ts` - Cliente Supabase
- `src/lib/supabase-api.ts` - APIs de productos y kanban
- `src/hooks/use-supabase-kanban.tsx` - Hook de inicialización
- `supabase-setup.sql` - Schema de base de datos
- `SUPABASE_MIGRATION_GUIDE.md` - Esta guía

### Archivos Modificados:
- `src/features/products/components/product-listing.tsx` - Usa Supabase API
- `src/features/kanban/utils/store.ts` - Migrado a Supabase
- `.env.local` - Variables de Supabase agregadas

## 🔒 Seguridad (RLS)

- **Row Level Security** habilitado en todas las tablas
- Los usuarios solo pueden acceder a sus propios datos
- Datos de ejemplo accesibles a todos (user_id IS NULL)
- Para producción, ajustar políticas según necesidades

## 🚨 Troubleshooting

### Error de Conexión
- Verifica las variables de entorno
- Verifica que el proyecto Supabase esté activo

### Error de RLS
- Verifica la integración JWT con Clerk
- Verifica que las políticas estén habilitadas

### Datos No Cargan
- Verifica que el SQL se ejecutó correctamente
- Verifica la consola del navegador para errores
- Verifica que las tablas existen en Supabase

## 🎉 ¡Migración Completada!

Una vez completados estos pasos, tu aplicación estará totalmente migrada a Supabase con:

- ✅ Persistencia real de datos
- ✅ Autenticación integrada
- ✅ Seguridad Row Level Security
- ✅ APIs escalables
- ✅ Datos en tiempo real (opcional)