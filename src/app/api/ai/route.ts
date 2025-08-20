import { NextRequest, NextResponse } from 'next/server';
import { getGemini } from '@/lib/ai/gemini';
import { execPlan } from '@/lib/data/executors';

export const runtime = 'nodejs'; // we use Node, not edge (we'll need server keys)
export const dynamic = 'force-dynamic'; // don't cache

// Security and size utilities
function clipJson(obj: any, maxChars = 4000) {
  try {
    const s = JSON.stringify(obj);
    return s.length > maxChars ? s.slice(0, maxChars) + '…[truncated]' : s;
  } catch {
    return String(obj).slice(0, maxChars);
  }
}

function pct(n: number | null | undefined) {
  if (n == null || !isFinite(n)) return 'n/a';
  return `${(n * 100).toFixed(1)}%`;
}

const ROUTER_SCHEMA = `
You are an intent router for a data analytics system. Your job is to convert natural language questions into structured JSON objects.

AVAILABLE TABLES:
- unified_shipments(id, season_id, etd_week, region_id, market_id, country_id, transport_type_id, species_id, variety_id, importer_id, exporter_id, arrival_port_id, boxes, kilograms)

AVAILABLE INTENTS:
1. "kpis" - For general summary statistics and key performance indicators
2. "timeseries" - For trend analysis over time (weekly, monthly, seasonal)
3. "tops" - For ranking top items by category (exporters, importers, markets, countries, varieties, arrival_ports)
4. "rankings" - For detailed ranking analysis with positions

AVAILABLE METRICS:
- "kilograms" - Weight-based analysis
- "boxes" - Volume-based analysis

AVAILABLE GRANULARITIES:
- "week" - Weekly data
- "month" - Monthly data  
- "season" - Seasonal data

EXAMPLES:
- "Top 5 exporters by kilograms" → {"intent":"tops","filters":{},"params":{"metric":"kilograms","topType":"exporters","topN":5}}
- "Show me the trend of kilograms over weeks" → {"intent":"timeseries","filters":{},"params":{"metric":"kilograms","granularity":"week"}}
- "What are the top 3 markets?" → {"intent":"tops","filters":{},"params":{"metric":"kilograms","topType":"markets","topN":3}}
- "General summary statistics" → {"intent":"kpis","filters":{},"params":{"metric":"kilograms"}}

IMPORTANT RULES:
- Use "tops" for ranking questions (top, best, highest, etc.)
- Use "timeseries" for trend/time analysis (trend, over time, weekly, monthly, etc.)
- Use "rankings" for detailed position analysis
- Use "kpis" ONLY for general summary requests
- Extract any filters mentioned (seasons, exporters, species, etc.)
- Set appropriate granularity based on time references
`;

async function routeWithGemini(question: string, language: string) {
  try {
    const model = getGemini('gemini-2.0-flash');

    const ROUTER_SCHEMA =
      language === 'es'
        ? `Eres un router inteligente que convierte preguntas en español a un plan estructurado.

INSTRUCCIONES:
- Analiza la pregunta del usuario
- Identifica la INTENCIÓN principal (kpis, tops, timeseries, rankings, search)
- Extrae FILTROS relevantes (temporadas, exportadores, especies, mercados, países, regiones)
- Define PARÁMETROS específicos (métrica, top N, granularidad)

IMPORTANTE: Si la pregunta menciona un nombre específico de empresa/exportador, usa "intent": "search" y busca en exporter_ids.

FORMATO DE RESPUESTA (JSON válido):
{
  "intent": "kpis|tops|timeseries|rankings|search",
  "filters": {
    "season_ids": [1,2,3],
    "exporter_ids": [10,20,30],
    "species_ids": [100,200],
    "variety_ids": [1000,2000],
    "market_ids": [10000,20000],
    "country_ids": [100000,200000],
    "region_ids": [1000000,2000000],
    "transport_type_ids": [1,2]
  },
  "params": {
    "metric": "kilograms|boxes",
    "topN": 5,
    "granularity": "week|month|season",
    "search_term": "nombre de empresa"
  }
}

EJEMPLOS:
Pregunta: "Top 5 exportadores por kilogramos en 2023-2024"
Respuesta: {"intent":"tops","filters":{"season_ids":[1]},"params":{"metric":"kilograms","topN":5}}

Pregunta: "Datos de la exportadora Allegria Foods"
Respuesta: {"intent":"search","filters":{},"params":{"search_term":"Allegria Foods","metric":"kilograms"}}

Pregunta: "Tendencias semanales de exportadores"
Respuesta: {"intent":"timeseries","filters":{},"params":{"metric":"kilograms","granularity":"week"}}

Pregunta: "KPIs generales del sistema"
Respuesta: {"intent":"kpis","filters":{},"params":{"metric":"kilograms"}}`
        : `You are an intelligent router that converts English questions into a structured plan.

INSTRUCTIONS:
- Analyze the user's question
- Identify the main INTENT (kpis, tops, timeseries, rankings, search)
- Extract relevant FILTERS (seasons, exporters, species, markets, countries, regions)
- Define specific PARAMETERS (metric, top N, granularity)

IMPORTANT: If the question mentions a specific company/exporter name, use "intent": "search" and search in exporter_ids.

RESPONSE FORMAT (valid JSON):
{
  "intent": "kpis|tops|timeseries|rankings|search",
  "filters": {
    "season_ids": [1,2,3],
    "exporter_ids": [10,20,30],
    "species_ids": [100,200],
    "variety_ids": [1000,2000],
    "market_ids": [10000,20000],
    "country_ids": [100000,200000],
    "region_ids": [1000000,2000000],
    "transport_type_ids": [1,2]
  },
  "params": {
    "metric": "kilograms|boxes",
    "topN": 5,
    "granularity": "week|month|season",
    "search_term": "company name"
  }
}

EXAMPLES:
Question: "Top 5 exporters by kilograms in 2023-2024"
Response: {"intent":"tops","filters":{"season_ids":[1]},"params":{"metric":"kilograms","topN":5}}

Question: "Data for exporter Allegria Foods"
Response: {"intent":"search","filters":{},"params":{"search_term":"Allegria Foods","metric":"kilograms"}}

Question: "Weekly trends for exporters"
Response: {"intent":"timeseries","filters":{},"params":{"metric":"kilograms","granularity":"week"}}

Question: "General system KPIs"
Response: {"intent":"kpis","filters":{},"params":{"metric":"kilograms"}}`;

    const content = `PREGUNTA: ${question}\n\n${ROUTER_SCHEMA}`;

    const out = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: content }] }],
      generationConfig: { temperature: 0.0, topK: 1, topP: 0.9 }
    } as any);

    const response = out.response.text();
    console.log('🔍 Gemini response:', response);

    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.intent && parsed.filters && parsed.params) {
          return parsed;
        }
      }
    } catch (error) {
      console.log('⚠️ Failed to parse Gemini response, using fallback');
    }

    // Fallback logic when Gemini fails - improved to detect company names
    const lowerQ = question.toLowerCase();

    // Check if question contains company names (common patterns)
    const companyPatterns = [
      /\b(allegria|foods|dole|chile|greenvic|garcés|verfrut|tuniche)\b/i,
      /\b(exportadora|empresa|compañía|company|exporter)\b/i
    ];

    const hasCompanyName = companyPatterns.some((pattern) =>
      pattern.test(question)
    );

    if (hasCompanyName) {
      // Extract potential company name
      const words = question.split(/\s+/);
      const potentialCompany = words.find(
        (word) => /^[A-Z][a-z]+/.test(word) || /^[A-Z]+$/.test(word)
      );

      return {
        intent: 'search',
        filters: {},
        params: {
          search_term: potentialCompany || 'company',
          metric: 'kilograms'
        }
      };
    }

    if (
      lowerQ.includes('top') ||
      lowerQ.includes('best') ||
      lowerQ.includes('highest')
    ) {
      return {
        intent: 'tops',
        filters: {},
        params: {
          metric: 'kilograms',
          topType: lowerQ.includes('market') ? 'markets' : 'exporters',
          topN: 5
        }
      };
    }
    if (
      lowerQ.includes('trend') ||
      lowerQ.includes('over time') ||
      lowerQ.includes('weekly') ||
      lowerQ.includes('monthly')
    ) {
      return {
        intent: 'timeseries',
        filters: {},
        params: {
          metric: 'kilograms',
          granularity: 'week'
        }
      };
    }
    return { intent: 'kpis', filters: {}, params: { metric: 'kilograms' } };
  } catch (error) {
    console.error('❌ Error in routeWithGemini:', error);
    // Fallback logic when Gemini fails
    const lowerQ = question.toLowerCase();

    // Check if question contains company names
    const companyPatterns = [
      /\b(allegria|foods|dole|chile|greenvic|garcés|verfrut|tuniche)\b/i,
      /\b(exportadora|empresa|compañía|company|exporter)\b/i
    ];

    const hasCompanyName = companyPatterns.some((pattern) =>
      pattern.test(question)
    );

    if (hasCompanyName) {
      return {
        intent: 'search',
        filters: {},
        params: {
          search_term: 'company',
          metric: 'kilograms'
        }
      };
    }

    if (
      lowerQ.includes('top') ||
      lowerQ.includes('best') ||
      lowerQ.includes('highest')
    ) {
      return {
        intent: 'tops',
        filters: {},
        params: {
          metric: 'kilograms',
          topType: lowerQ.includes('market') ? 'markets' : 'exporters',
          topN: 5
        }
      };
    }
    if (
      lowerQ.includes('trend') ||
      lowerQ.includes('over time') ||
      lowerQ.includes('weekly') ||
      lowerQ.includes('monthly')
    ) {
      return {
        intent: 'timeseries',
        filters: {},
        params: {
          metric: 'kilograms',
          granularity: 'week'
        }
      };
    }
    return { intent: 'kpis', filters: {}, params: { metric: 'kilograms' } };
  }
}

// Demo router function (used when Gemini API key is not configured)
async function routeWithDemo(question: string, language: string) {
  const lowerQ = question.toLowerCase();
  if (lowerQ.includes('top') || lowerQ.includes('ranking')) {
    return {
      intent: 'tops',
      filters: {},
      params: {
        metric: 'kilograms',
        granularity: 'season',
        topType: 'exporters',
        topN: 5
      }
    };
  }
  if (
    lowerQ.includes('trend') ||
    lowerQ.includes('time') ||
    lowerQ.includes('week') ||
    lowerQ.includes('month')
  ) {
    return {
      intent: 'timeseries',
      filters: {},
      params: { metric: 'kilograms', granularity: 'week' }
    };
  }
  return {
    intent: 'kpis',
    filters: {},
    params: { metric: 'kilograms' }
  };
}

async function finalAnswer(plan: any, result: any, language: string) {
  const model = getGemini('gemini-2.0-flash');

  const system =
    language === 'es'
      ? `Eres un analista de DataHub experto. Responde en español, claro, profesional y detallado.

INSTRUCCIONES ESPECÍFICAS:
- Usa EXCLUSIVAMENTE los valores presentes en RESULT. NO inventes números ni nombres.
- Para búsquedas de empresas (intent: "search"):
  * Menciona el nombre completo de la empresa
  * Especifica las temporadas exactas (ej: "2024-2025", no "temporada 4")
  * Lista los mercados específicos y especies específicas
  * Muestra totales de kilogramos y cajas por especie
  * Muestra totales por mercado
  * NO calcules promedios a menos que se soliciten
  * Especifica las semanas exactas de envío
- Para otros intents: da 2-4 bullets de hallazgos principales
- Al final, sugiere UN gráfico útil basado en los datos, usando este formato EXACTO:
{"chart":{"type":"bar|line|pie|area","x":"exporter|market|season|week","y":"kilograms|boxes","title":"Título del gráfico","description":"Descripción breve"}}

TIPOS DE GRÁFICO:
- "bar": para comparar especies, mercados, variedades
- "line": para tendencias temporales, evolución semanal
- "pie": para distribución de porcentajes
- "area": para volúmenes acumulados`
      : `You are an expert DataHub analyst. Respond in English, clear, professional and detailed.

SPECIFIC INSTRUCTIONS:
- Use ONLY values present in RESULT. DO NOT invent numbers or names.
- For company searches (intent: "search"):
  * Mention the complete company name
  * Specify exact seasons (e.g., "2024-2025", not "season 4")
  * List specific markets and species
  * Show totals of kilograms and boxes by species
  * Show totals by market
  * DO NOT calculate averages unless requested
  * Specify exact shipping weeks
- For other intents: give 2-4 main findings
- At the end, suggest ONE useful chart based on the data, using this EXACT format:
{"chart":{"type":"bar|line|pie|area","x":"exporter|market|season|week","y":"kilograms|boxes","title":"Chart Title","description":"Brief description"}}

CHART TYPES:
- "bar": for comparing species, markets, varieties
- "line": for temporal trends, weekly evolution
- "pie": for percentage distribution
- "area": for accumulated volumes`;

  // Prepara un payload chico y verificable
  const safeResult = {
    kind: result?.kind || 'unknown',
    sample: Array.isArray(result?.data)
      ? result.data.slice(0, 30)
      : result.data, // <= solo 30 filas máx
    params: result?.params ?? {}
  };

  const content = `PLAN:
${clipJson(plan, 2000)}

RESULT:
${clipJson(safeResult, 3500)}`;

  const out = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: `${system}\n\n${content}` }] }],
    generationConfig: { temperature: 0.0, topK: 1, topP: 0.9 }
  } as any);

  return out.response.text();
}

function generateDemoResponse(plan: any, result: any, language: string) {
  const { intent, params } = plan;

  if (intent === 'tops') {
    return language === 'es'
      ? 'Aquí están los principales exportadores por kilogramos:\n\n* DOLE-CHILE S.A.: 1,434,254 kg\n* GREENVIC SPA: 1,302,490 kg\n* LO GARCES LTDA.: 1,231,622 kg\n\n{"chart":{"type":"bar","x":"exporter","y":"kilograms","title":"Top Exportadores","description":"Comparación de exportadores por kilogramos"}}'
      : 'Here are the top exporters by kilograms:\n\n* DOLE-CHILE S.A.: 1,434,254 kg\n* GREENVIC SPA: 1,302,490 kg\n* LO GARCES LTDA.: 1,231,622 kg\n\n{"chart":{"type":"bar","x":"exporter","y":"kilograms","title":"Top Exporters","description":"Comparison of exporters by kilograms"}}';
  }

  if (intent === 'timeseries') {
    return language === 'es'
      ? 'Tendencias temporales de exportadores:\n\n* Semana 1: 2,500,000 kg\n* Semana 2: 2,800,000 kg\n* Semana 3: 3,100,000 kg\n\n{"chart":{"type":"line","x":"week","y":"kilograms","title":"Tendencias Semanales","description":"Evolución de kilogramos por semana"}}'
      : 'Temporal trends for exporters:\n\n* Week 1: 2,500,000 kg\n* Week 2: 2,800,000 kg\n* Week 3: 3,100,000 kg\n\n{"chart":{"type":"line","x":"week","y":"kilograms","title":"Weekly Trends","description":"Kilograms evolution by week"}}';
  }

  return language === 'es'
    ? 'KPIs generales del sistema:\n\n* Total exportadores: 1,224\n* Total kilogramos: 35,549,711\n* Total cajas: 70,799,042\n\n{"chart":{"type":"pie","x":"metric","y":"value","title":"KPIs del Sistema","description":"Resumen de métricas principales"}}'
    : 'General system KPIs:\n\n* Total exporters: 1,224\n* Total kilograms: 35,549,711\n* Total boxes: 70,799,042\n\n{"chart":{"type":"pie","x":"metric","y":"value","title":"System KPIs","description":"Summary of main metrics"}}';
}

export async function POST(request: Request) {
  let language = 'es'; // Default language

  try {
    const { message, history, lang } = await request.json();
    language = lang || 'es'; // Use provided language or default

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Processing question:', message);

    // Route the question to get intent and filters
    const plan = await routeWithGemini(message, language);
    console.log('🔍 Plan generated:', plan);

    // Execute the plan to get data
    const result = await execPlan(plan);
    console.log('🔍 Data result:', {
      kind: result.kind,
      rows: Array.isArray(result.data) ? result.data.length : 0
    });

    // Log for diagnostics
    console.log(
      `[AI] intent: ${plan.intent} resultKind: ${result.kind} rows: ${Array.isArray(result.data) ? result.data.length : 0}`
    );

    // If no data, return deterministic message
    if (Array.isArray(result.data) && result.data.length === 0) {
      const noDataMessage =
        language === 'es'
          ? 'No se encontraron datos para tu consulta. Intenta ajustar los filtros o hacer una pregunta más general.'
          : 'No data found for your query. Try adjusting the filters or asking a more general question.';

      return NextResponse.json({ reply: noDataMessage });
    }

    // Generate final answer with AI
    const reply = await finalAnswer(plan, result, language);

    return NextResponse.json({ reply, plan, resultKind: result.kind });
  } catch (error: any) {
    console.error('❌ Error in AI API:', error);
    const errorMessage =
      language === 'es'
        ? 'Hubo un error procesando tu pregunta. Inténtalo de nuevo.'
        : 'There was an error processing your question. Please try again.';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
