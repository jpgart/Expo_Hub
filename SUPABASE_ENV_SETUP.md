# 🔧 Configuración de Variables de Entorno Supabase

## 📍 **Estado Actual del .env.local**

Tu archivo `.env.local` ya tiene la estructura correcta con las variables de Supabase agregadas:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 🎯 **Pasos para obtener las credenciales reales:**

### **1. Ve a tu proyecto Supabase:**
- Abre: https://app.supabase.com
- Selecciona tu proyecto

### **2. Ve a Settings → API:**
- En el sidebar izquierdo: **Settings** → **API**

### **3. Copia estos valores:**

#### **Project URL:**
```
Busca: "Project URL"
Copia: https://tu-proyecto-id.supabase.co
```

#### **API Keys:**
```
Busca: "Project API keys"

anon public:
- Etiqueta: "anon" o "public"
- Empieza con: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

service_role:
- Etiqueta: "service_role" 
- Empieza con: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- ⚠️ MANTÉN ESTA CLAVE SECRETA
```

## ✏️ **Actualiza tu .env.local:**

Reemplaza las líneas en tu archivo `.env.local`:

```env
# Reemplaza estas líneas:
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.TU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.TU_SERVICE_ROLE_KEY
```

## ✅ **Verificación:**

Una vez actualizado, puedes verificar que todo funciona:

```bash
# Reinicia el servidor de desarrollo
npm run dev
```

## 🔍 **Cómo verificar que las variables están correctas:**

### **1. En el navegador (consola de desarrollo):**
```javascript
// Esto debería mostrar tu URL de Supabase:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

### **2. Las variables deben tener este formato:**
```
✅ NEXT_PUBLIC_SUPABASE_URL: https://abcdefghij.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚨 **Errores Comunes:**

### **Error: "Invalid API key"**
- ✅ Verifica que copiaste la clave completa
- ✅ No debe tener espacios al inicio/final
- ✅ Debe empezar con `eyJ`

### **Error: "Project not found"**
- ✅ Verifica la URL del proyecto
- ✅ Debe terminar en `.supabase.co`
- ✅ Debe incluir `https://`

### **Error: "RLS policy"**
- ✅ Verifica que ejecutaste el SQL: `supabase-setup.sql`
- ✅ Las tablas deben existir en Supabase

## 📋 **Checklist Final:**

- [ ] ✅ Proyecto Supabase creado
- [ ] ✅ SQL ejecutado (`supabase-setup.sql`)
- [ ] ✅ Variables copiadas de Supabase Dashboard
- [ ] ✅ `.env.local` actualizado
- [ ] ✅ Servidor reiniciado (`npm run dev`)
- [ ] ✅ Aplicación carga sin errores

---

**¿Necesitas ayuda con algún paso específico?** 🤔