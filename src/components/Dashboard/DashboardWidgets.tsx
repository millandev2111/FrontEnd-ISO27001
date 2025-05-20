import React, { useState, useEffect } from 'react';
import {BookOpen, Trophy, Users, BarChart , ArrowRight, BarChart2, ClipboardCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getCookie } from 'cookies-next';
import axios from 'axios';
import toast from 'react-hot-toast';


interface Auditoria {
  id: number;
  documentId: string;
  title: string;
  state: string;
  resultados?: any[];
  controladors?: any[];
}

interface SummaryData {
  totalAuditorias: number;
  auditoriasCompletadas: number;
  resultadosRecientes: number;
}




export const ResultsSummaryPanel: React.FC = () => {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalAuditorias: 0,
    auditoriasCompletadas: 0,
    resultadosRecientes: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener el token de autenticación
  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = getCookie('auth_token');
    return typeof token === 'string' ? token : null;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }

        const timestamp = new Date().getTime();
        const response = await axios.get('https://backend-iso27001.onrender.com/api/auditorias', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            populate: ['resultados', 'controladors'],
            _t: timestamp,
          },
        });

        if (!response.data || !response.data.data) {
          throw new Error('Formato de respuesta inesperado');
        }

        const auditorias: Auditoria[] = response.data.data;

        // Calcular estadísticas de resumen
        const totalAuditorias = auditorias.length;
        const auditoriasCompletadas = auditorias.filter(a => a.state === 'Completada').length;

        // Contar resultados recientes (últimos 30 días)
        const ahora = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(ahora.getDate() - 30);

        let resultadosRecientes = 0;

        // Contar todos los resultados de todas las auditorías
        auditorias.forEach(auditoria => {
          if (auditoria.resultados && Array.isArray(auditoria.resultados)) {
            // Contar resultados recientes basados en fechaEvaluacion
            auditoria.resultados.forEach(resultado => {
              if (resultado.fechaEvaluacion) {
                const fechaEval = new Date(resultado.fechaEvaluacion);
                if (fechaEval >= hace30Dias) {
                  resultadosRecientes++;
                }
              }
            });
          }
        });

        setSummaryData({
          totalAuditorias,
          auditoriasCompletadas,
          resultadosRecientes
        });

        setLoading(false);
      } catch (err: unknown) {
        console.error('Error al cargar datos:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
        setLoading(false);
        toast.error('No se pudieron cargar los datos de resumen');
      }
    };

    fetchData();
  }, []);

  // Mostrar indicador de carga
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Resultados y Evaluaciones</h3>
        </div>
        <div className="py-8 flex justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-200 h-10 w-10"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-slate-200 rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                  <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar mensaje de error
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Resultados y Evaluaciones</h3>
        </div>
        <div className="p-4 text-red-500 text-center">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Resultados y Evaluaciones</h3>
        <Link href="/dashboard/evaluaciones">
          <span className="text-sm text-blue-600 hover:text-blue-800 flex items-center cursor-pointer">
            Ver todas <ChevronRight className="h-4 w-4 ml-1" />
          </span>
        </Link>
      </div>

      <div className="space-y-4">
        {/* Tarjeta principal que invita a ver resultados */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-5 text-white shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-semibold mb-2">Análisis de Resultados</h4>
              <p className="text-blue-100 mb-4">
                Visualiza los resultados de tus evaluaciones y obtén insights valiosos
              </p>
              <Link href="/dashboard/evaluaciones">
                <span className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-md font-medium text-sm hover:bg-blue-50 transition-colors cursor-pointer">
                  Ver evaluaciones <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>
            </div>
            <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
              <BarChart2 className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Resumen de estadísticas */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Auditorías Completadas</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {summaryData.auditoriasCompletadas}/{summaryData.totalAuditorias}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <ClipboardCheck className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Resultados Recientes</p>
                <p className="text-2xl font-semibold text-gray-800">{summaryData.resultadosRecientes}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <BarChart2 className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de resumen diario
export const CapacitacionCallToAction: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-sm border border-indigo-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Módulos de Capacitación</h3>
          <p className="text-sm text-gray-500">Mantente actualizado en seguridad de la información</p>
        </div>
        <div className="bg-indigo-100 p-3 rounded-full">
          <BookOpen className="h-6 w-6 text-indigo-600" />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          Accede a nuestros módulos de capacitación para aprender sobre mejores prácticas de seguridad,
          implementación de controles ISO 27001 y evaluación de riesgos.
        </p>
        
        
        
        <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <BarChart className="h-5 w-5 text-indigo-600 mr-2" />
            <p className="text-sm font-medium text-gray-900">Módulo destacado:</p>
          </div>
          <p className="text-sm text-gray-700 mb-1">Implementación y evaluación de controles ISO 27001</p>
          
        </div>
      </div>

      <div className="mt-4">
        <Link href="/dashboard/modulos-capacitacion">
          <span className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-center font-medium cursor-pointer">
            Acceder a Módulos de Capacitación <ArrowRight className="inline-block ml-2 h-4 w-4" />
          </span>
        </Link>
      </div>
    </div>
  );
};