'use client';
import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarTrigger
} from '@/components/ui/menubar';
import { Languages } from 'lucide-react';
import React from 'react'; // Added missing import for React

type Msg = { role: 'user' | 'assistant'; content: string; chart?: any };

// Componente para renderizar gráficos sugeridos por la AI
function AIChart({ chart }: { chart: any }) {
  if (!chart || !chart.type) return null;

  const { type, x, y, title, description } = chart;

  // Datos de ejemplo - en producción esto vendría de la base de datos
  const sampleData = [
    { name: 'DOLE-CHILE', kilograms: 1434254, boxes: 2850000 },
    { name: 'GREENVIC', kilograms: 1302490, boxes: 2600000 },
    { name: 'LO GARCES', kilograms: 1231622, boxes: 2450000 },
    { name: 'VERFRUT', kilograms: 1169238, boxes: 2300000 },
    { name: 'TUNICHE', kilograms: 1122365, boxes: 2200000 }
  ];

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  switch (type) {
    case 'bar':
      return (
        <div className='bg-background mt-4 rounded-lg border p-4'>
          <h3 className='mb-2 text-lg font-semibold'>
            {title || 'Gráfico de Barras'}
          </h3>
          <p className='text-muted-foreground mb-4 text-sm'>
            {description || `Comparación de ${y} por ${x}`}
          </p>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={sampleData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
              <Bar dataKey={y} fill='#8884d8' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );

    case 'line':
      return (
        <div className='bg-background mt-4 rounded-lg border p-4'>
          <h3 className='mb-2 text-lg font-semibold'>
            {title || 'Gráfico de Líneas'}
          </h3>
          <p className='text-muted-foreground mb-4 text-sm'>
            {description || `Tendencia de ${y} a lo largo del tiempo`}
          </p>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={sampleData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
              <Line
                type='monotone'
                dataKey={y}
                stroke='#8884d8'
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );

    case 'pie':
      return (
        <div className='bg-background mt-4 rounded-lg border p-4'>
          <h3 className='mb-2 text-lg font-semibold'>
            {title || 'Gráfico Circular'}
          </h3>
          <p className='text-muted-foreground mb-4 text-sm'>
            {description || `Distribución de ${y}`}
          </p>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={sampleData}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill='#8884d8'
                dataKey={y}
              >
                {sampleData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );

    case 'area':
      return (
        <div className='bg-background mt-4 rounded-lg border p-4'>
          <h3 className='mb-2 text-lg font-semibold'>
            {title || 'Gráfico de Área'}
          </h3>
          <p className='text-muted-foreground mb-4 text-sm'>
            {description || `Volumen acumulado de ${y}`}
          </p>
          <ResponsiveContainer width='100%' height={300}>
            <AreaChart data={sampleData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
              <Area
                type='monotone'
                dataKey={y}
                fill='#8884d8'
                stroke='#8884d8'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );

    default:
      return null;
  }
}

export default function AIPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        '¡Hola! Soy Ask DataHub. Pregúntame sobre exportadores, temporadas, especies, mercados... y te mostraré gráficos visuales útiles.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'es' | 'en'>('es');

  // Función para extraer sugerencia de gráfico del mensaje de la AI
  function extractChartSuggestion(content: string) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*"chart"[\s\S]*\}/);
      if (jsonMatch) {
        const chartData = JSON.parse(jsonMatch[0]);
        return chartData.chart;
      }
    } catch (e) {
      console.log('No se pudo parsear sugerencia de gráfico');
    }
    return null;
  }

  async function onSend() {
    const q = input.trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ message: q, history: messages, lang: language })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error');

      const chartSuggestion = extractChartSuggestion(data.reply || '');
      const cleanContent = (data.reply || '')
        .replace(/\{[\s\S]*"chart"[\s\S]*\}/, '')
        .trim();

      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: cleanContent,
          chart: chartSuggestion
        }
      ]);
    } catch (e: any) {
      const errorMsg =
        language === 'es'
          ? 'Hubo un error procesando tu pregunta.'
          : 'There was an error processing your question.';
      setMessages((m) => [...m, { role: 'assistant', content: errorMsg }]);
    } finally {
      setLoading(false);
    }
  }

  // Mensajes según el idioma
  const getWelcomeMessage = () => {
    if (language === 'es') {
      return '¡Hola! Soy Ask DataHub. Pregúntame sobre exportadores, temporadas, especies, mercados... y te mostraré gráficos visuales útiles.';
    }
    return "Hello! I'm Ask DataHub. Ask me about exporters, seasons, species, markets... and I'll show you useful visual charts.";
  };

  const getPlaceholder = () => {
    if (language === 'es') {
      return 'Ej: Top 5 exportadores por kilogramos en 2023-2024';
    }
    return 'Ex: Top 5 exporters by kilograms in 2023-2024';
  };

  const getSendButtonText = () => {
    return language === 'es' ? 'Enviar' : 'Send';
  };

  const getLoadingText = () => {
    return language === 'es' ? 'Pensando…' : 'Thinking…';
  };

  // Actualizar mensaje de bienvenida cuando cambie el idioma
  React.useEffect(() => {
    if (messages.length === 1) {
      setMessages([{ role: 'assistant', content: getWelcomeMessage() }]);
    }
  }, [language]);

  return (
    <PageContainer>
      <Breadcrumbs />
      <div className='mx-auto max-w-4xl space-y-4 p-4'>
        {/* Header con título y selector de idioma */}
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-semibold'>Ask DataHub</h1>

          {/* Selector de idioma usando Menubar */}
          <Menubar className='h-8 border-0 bg-transparent shadow-none'>
            <MenubarMenu>
              <MenubarTrigger className='hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors'>
                <Languages className='h-4 w-4' />
                {language === 'es' ? 'Español' : 'English'}
              </MenubarTrigger>
              <MenubarContent>
                <MenubarRadioGroup
                  value={language}
                  onValueChange={(value) => setLanguage(value as 'es' | 'en')}
                >
                  <MenubarRadioItem value='es'>Español</MenubarRadioItem>
                  <MenubarRadioItem value='en'>English</MenubarRadioItem>
                </MenubarRadioGroup>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        <div
          aria-live='polite'
          className='bg-background min-h-[50vh] space-y-3 rounded-lg border p-4'
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === 'user' ? 'text-right' : 'text-left'}
            >
              <div
                className={`inline-block rounded-2xl px-3 py-2 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {m.content}
              </div>
              {/* Renderizar gráfico si existe */}
              {m.chart && <AIChart chart={m.chart} />}
            </div>
          ))}
          {loading && (
            <div className='text-sm opacity-70'>{getLoadingText()}</div>
          )}
        </div>
        <div className='flex gap-2'>
          <input
            className='flex-1 rounded-lg border px-3 py-2'
            aria-label={
              language === 'es' ? 'Escribe tu pregunta' : 'Type your question'
            }
            placeholder={getPlaceholder()}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
          />
          <button
            disabled={loading}
            className='bg-primary text-primary-foreground rounded-lg px-4 py-2'
            onClick={onSend}
          >
            {getSendButtonText()}
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
