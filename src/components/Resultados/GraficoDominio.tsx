// @/components/Resultados/GraficoDominio.tsx
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DominioData {
  total: number;
  evaluados: number;
  cumplidos: number;
  porcentaje: number;
}

interface GraficoDominioProps {
  resultadosPorDominio: Record<string, DominioData>;
}

const GraficoDominio: React.FC<GraficoDominioProps> = ({ resultadosPorDominio }) => {
  // Ordenar y formatear datos para el gráfico
  const data = useMemo(() => {
    return Object.entries(resultadosPorDominio)
      .map(([dominio, datos]) => ({
        dominio: formatearNombreDominio(dominio),
        total: datos.total,
        evaluados: datos.evaluados,
        cumplidos: Math.round(datos.cumplidos), // Redondear por si hay parciales (0.5)
        porcentaje: datos.porcentaje
      }))
      .sort((a, b) => a.dominio.localeCompare(b.dominio));
  }, [resultadosPorDominio]);

  // Función para formatear nombres de dominios largos
  function formatearNombreDominio(dominio: string): string {
    // Si el dominio comienza con "A." o similar, extraer solo esa parte
    const match = dominio.match(/^([A-Z]\d*\.)/);
    if (match) {
      return match[1];
    }
    
    // Si el dominio es muy largo, truncarlo
    if (dominio.length > 15) {
      return dominio.substring(0, 12) + '...';
    }
    
    return dominio;
  }

  // Obtener color según el porcentaje
  const getColor = (porcentaje: number) => {
    if (porcentaje >= 90) return '#10b981'; // emerald-500
    if (porcentaje >= 70) return '#22c55e'; // green-500
    if (porcentaje >= 50) return '#f59e0b'; // amber-500
    if (porcentaje >= 30) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded shadow-md border border-gray-200">
          <p className="font-bold">{item.dominio}</p>
          <p className="text-sm">Total controles: <span className="font-medium">{item.total}</span></p>
          <p className="text-sm">Evaluados: <span className="font-medium">{item.evaluados}</span></p>
          <p className="text-sm">Cumplidos: <span className="font-medium">{item.cumplidos}</span></p>
          <p className="text-sm font-medium" style={{ color: getColor(item.porcentaje) }}>
            Cumplimiento: {item.porcentaje}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Cumplimiento por Dominio</h2>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="dominio" 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="porcentaje" name="Porcentaje de Cumplimiento" barSize={30}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.porcentaje)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-sm text-gray-500 mt-4 text-center">
          El gráfico muestra el porcentaje de cumplimiento para cada dominio de la ISO 27001
        </p>
      </div>
    </div>
  );
};

export default GraficoDominio;