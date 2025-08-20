# Guía SQL para Supabase (PostgreSQL)

**Estándares, Patrones y Estrategias -- lista para que tu LLM la use
como referencia**

> **Formato recomendado para VS Code**: guarda este documento como
> `docs/sql-guidelines-supabase.md`. Todas las plantillas vienen en
> bloques ```` ```sql ```` para copiado directo. Incluye "prompt cues"
> para que tu LLM siga los mismos estándares al generar código.

------------------------------------------------------------------------

## 0) Cómo debe usar esto el LLM

-   **Siempre** usar *snake_case* para tablas, columnas, índices y
    funciones.
-   Prefijar el esquema: **public.** en todas las referencias dentro de
    funciones/visiones para evitar problemas con `search_path`.
-   Generar migraciones **idempotentes**: `CREATE ... IF NOT EXISTS`,
    `DROP ... IF EXISTS`, `CREATE OR REPLACE FUNCTION`, etc.
-   En funciones RPC: usar `SECURITY DEFINER`,
    `SET search_path = public`, y marcar la volatilidad correcta
    (`STABLE` si solo lee, `IMMUTABLE` si no toca tablas, `VOLATILE` si
    modifica estado).
-   Validar parámetros y **nunca** dividir por cero. Manejar `NULL`
    explícitamente.
-   Al optimizar: proponer índices concretos y justificar (cláusulas
    `WHERE`, `JOIN`, `ORDER BY`).

**Plantilla de prompt para tu LLM**

    Actúa como DBA de PostgreSQL en Supabase. Genera SQL idempotente con comentarios claros, siguiendo mi guía `docs/sql-guidelines-supabase.md`. Usa snake_case, prefija public., valida parámetros, y añade índices necesarios. Si creas funciones RPC, usa SECURITY DEFINER, SET search_path=public y STABLE. Incluye tests al final.

------------------------------------------------------------------------

## 1) Convenciones de modelado y nombres

-   **Tablas**: sustantivos plurales (`shipments`, `exporters`).
-   **PK**: `id` (INTEGER/BIGINT o UUID; en analítica suele bastar
    BIGINT).
-   **FK**: sufijo `_id` (`exporter_id`).
-   **Tiempos**: `created_at`, `updated_at` como `timestamptz` con
    `DEFAULT now()`.
-   **Numéricos**: usar `numeric(p,s)` para dinero/pesos; `bigint` para
    contadores.
-   **Comentarios**: documenta cada objeto (`COMMENT ON TABLE/COLUMN`),
    tu LLM debe copiar esa práctica.

Ejemplo idempotente:

``` sql
CREATE TABLE IF NOT EXISTS public.exporters (
  id            bigserial PRIMARY KEY,
  name          text NOT NULL,
  country_id    bigint REFERENCES public.countries(id),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.exporters IS 'Catálogo de exportadores';
COMMENT ON COLUMN public.exporters.name IS 'Nombre legal del exportador';
```

------------------------------------------------------------------------

## 2) Seguridad y RLS (Row Level Security)

\[...\]

**Fin de la guía.**
