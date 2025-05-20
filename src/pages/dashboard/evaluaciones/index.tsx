// @/pages/evaluaciones/index.tsx
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '..//layout';
import useAuditoriaResultados from '@/hooks/useAuditoriaResultados';
import {
  BarChart3,
  AlertCircle,
  RefreshCw,
  Download,
  FileText,
  Printer,
  ChevronLeft,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

import AuditoriaSelector from '@/components/Resultados/AuditoriaSelector';
import ResumenCard from '@/components/Resultados/ResumenCard';
import GraficoDominio from '@/components/Resultados/GraficoDominio';
import TablaResultados from '@/components/Resultados/TablaResultados';
import ExportPDFButton from '@/components/Resultados/ExportPDFButton';

const EvaluacionesPage = () => {
  const router = useRouter();

  // Estado para almacenar la auditoría seleccionada
  const [selectedAuditoriaId, setSelectedAuditoriaId] = useState<string | null>(null);

  // Estado para mostrar/ocultar el menú de informes
  const [mostrarInformes, setMostrarInformes] = useState(false);

  // Obtener resultados de la auditoría seleccionada
  const {
    loading: loadingResultados,
    error: errorResultados,
    resultados,
    resultadosFiltrados,
    resumen,
    filtroActivo,
    setFiltroActivo,
    recargarDatos
  } = useAuditoriaResultados(selectedAuditoriaId);

  // Manejar la selección de una auditoría
  const handleSelectAuditoria = useCallback((documentId: string) => {
    setSelectedAuditoriaId(documentId);
  }, []);

  // Función para manejar la recarga de datos
  const handleRefresh = async () => {
    try {
      await recargarDatos();
      toast.success('Datos actualizados correctamente');
    } catch (error) {
      toast.error('Error al actualizar los datos');
    }
  };

  // Función para navegar a la auditoría
  const navigateToAuditoria = useCallback(() => {
    if (selectedAuditoriaId) {
      router.push(`/dashboard/auditoria/${selectedAuditoriaId}`);
    }
  }, [router, selectedAuditoriaId]);

  return (
    <>
      <Head>
        <title>Evaluaciones ISO 27001 | Innovacode</title>
        <meta name="description" content="Panel de evaluación de cumplimiento ISO 27001" />
      </Head>

      <DashboardLayout>
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
          {/* CABECERA */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Panel de Evaluaciones
            </h1>
            <p className="text-gray-600">
              Visualiza y analiza los resultados de las evaluaciones de controles ISO 27001
            </p>
          </div>

          {/* SELECTOR DE AUDITORÍA */}
          <div className="mb-6">
            <AuditoriaSelector
              selectedAuditoriaId={selectedAuditoriaId}
              onSelectAuditoria={handleSelectAuditoria}
            />
          </div>

          {/* NAVEGACIÓN Y ACCIONES */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <button
              onClick={navigateToAuditoria}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={!selectedAuditoriaId}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Ver detalles de auditoría</span>
              <ExternalLink className="h-4 w-4 ml-1" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setMostrarInformes(!mostrarInformes)}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={!selectedAuditoriaId || loadingResultados || !resumen}
                >
                  <FileText className="h-4 w-4" />
                  <span>Generar Informe</span>
                </button>

                {/* Menú desplegable de informes */}
                {mostrarInformes && (
                  <div className="absolute right-0 mt-2 z-10 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <ExportPDFButton
                        auditoriaInfo={{
                          id: selectedAuditoriaId || '',
                          titulo: "Evaluación de Controles ISO 27001", 
                          periodo: `${new Date().getFullYear()}`,
                          auditores: "Equipo de Seguridad de la Información",
                          auditor: "Especialista de Seguridad", // Nombre del auditor principal
                          aprobador: "Director de Seguridad", // Aprobador del informe
                          descripcion: "Evaluación de cumplimiento de controles de seguridad ISO 27001:2022" // Descripción más detallada
                        }}
                        resultados={resultadosFiltrados}
                        resumen={resumen || {}}
                        onClose={() => setMostrarInformes(false)}
                      />


                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          {!selectedAuditoriaId ? (
            // No hay auditoría seleccionada
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Selecciona una auditoría</h3>
                <p className="text-gray-500 max-w-md">
                  Utiliza el selector en la parte superior para elegir una auditoría y visualizar sus resultados.
                </p>
              </div>
            </div>
          ) : loadingResultados ? (
            // Estado de carga
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
              <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-1 h-80"></div>
              <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2 h-80"></div>
              <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-3 h-96"></div>
            </div>
          ) : errorResultados ? (
            // Error al cargar
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-center text-red-500 mb-4">
                <AlertCircle className="h-6 w-6 mr-2" />
                <h3 className="text-lg font-medium">Error al cargar los resultados</h3>
              </div>
              <p className="text-gray-600 mb-4">{errorResultados}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
              >
                Intentar nuevamente
              </button>
            </div>
          ) : resumen ? (
            // Contenido cuando hay datos
            <>
              {/* Resumen y gráfico */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-1">
                  <ResumenCard
                    totalControles={resumen.totalControles}
                    evaluados={resumen.evaluados}
                    pendientes={resumen.pendientes}
                    cumplidos={resumen.cumplidos}
                    parciales={resumen.parciales}
                    noCumplidos={resumen.noCumplidos}
                    noAplica={resumen.noAplica}
                    porcentajeCumplimiento={resumen.porcentajeCumplimiento}
                    porcentajeCompletitud={resumen.porcentajeCompletitud}
                    onFiltroChange={setFiltroActivo}
                    filtroActivo={filtroActivo}
                  />
                </div>
                <div className="lg:col-span-2">
                  <GraficoDominio resultadosPorDominio={resumen.resultadosPorDominio} />
                </div>
              </div>

              {/* Tabla de resultados */}
              <TablaResultados resultados={resultadosFiltrados} loading={loadingResultados} />
            </>
          ) : (
            // No hay resultados
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No hay resultados disponibles</h3>
                <p className="text-gray-500 max-w-md mb-6">
                  No se encontraron resultados para esta auditoría. Comienza a evaluar los controles para ver los resultados aquí.
                </p>
                <button
                  onClick={() => router.push(`/dashboard/auditoria/${selectedAuditoriaId}/evaluate`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                >
                  Comenzar evaluación
                </button>
              </div>
            </div>
          )}

          {/* BOTÓN FLOTANTE REFRESCAR */}
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={handleRefresh}
              className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              title="Refrescar datos"
              disabled={!selectedAuditoriaId || loadingResultados}
            >
              <RefreshCw className={`h-6 w-6 ${loadingResultados ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default EvaluacionesPage;