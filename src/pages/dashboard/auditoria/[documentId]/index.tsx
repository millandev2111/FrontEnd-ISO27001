import React, { useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../layout';
import { useAuditoriaState } from '@/hooks/useAuditoriaState';
import { useResultados } from '@/context/ResultadosContext';
import {
  ArrowLeft,
  Calendar,
  ClipboardCheck,
  AlertCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

import StatusBadge from '@/components/Auditoria/StatusBadge';
import SugerenciaEstado from '@/components/Auditoria/SugerenciaEstado';
import InfoDetail from '@/components/Auditoria/InfoDetail';
import EstadoButtons from '@/components/Auditoria/EstadoButton';
import ProgressPanel from '@/components/Auditoria/ProgressPanel';
import StatCard from '@/components/Auditoria/StartCard';
import { formatearFecha, calcularDiasRestantes } from '@/components/Auditoria/utils';

const AuditoriaDetalle = () => {
  const router = useRouter();
  const { documentId } = router.query;
  const docId =
    typeof documentId === 'string'
      ? documentId
      : Array.isArray(documentId)
      ? documentId[0]
      : '';

  const { refreshResultados } = useResultados();

  const {
    auditoria,
    loading,
    error,
    progreso,
    controlesEvaluados,
    totalControles,
    actualizandoEstado,
    estadoSugerido,
    fetchAuditoriaData,
    actualizarEstadoAuditoria,
  } = useAuditoriaState(docId);

  // Cargar resultados al inicio
  useEffect(() => {
    if (docId) {
      refreshResultados(true);
    }
  }, [docId, refreshResultados]);

  // Calcular fechas y progreso de manera segura y sin valores arbitrarios
  const {
    fechaInicio,
    fechaFin,
    diasRestantes,
    pendientes,
  } = useMemo(() => {
    if (!auditoria) {
      return {
        fechaInicio: 'Fecha no disponible',
        fechaFin: 'Fecha no disponible',
        diasRestantes: 0,
        pendientes: 0,
      };
    }

    const fInicio = formatearFecha(auditoria.startDate || auditoria.attributes?.startDate || '');
    const fFin = formatearFecha(auditoria.endDate || auditoria.attributes?.endDate || '');
    const diasRest = calcularDiasRestantes(auditoria.endDate || auditoria.attributes?.endDate || '');

    const evaluados = controlesEvaluados || 0;
    const total = totalControles || 0;
    const pendientesCalc = Math.max(total - evaluados, 0);

    return {
      fechaInicio: fInicio,
      fechaFin: fFin,
      diasRestantes: diasRest,
      pendientes: pendientesCalc,
    };
  }, [auditoria, controlesEvaluados, totalControles]);

  // Navegar a evaluación
  const handleEvaluateClick = useCallback(() => {
    if (!docId) return;
    router.push(`/dashboard/auditoria/${docId}/evaluate`);
  }, [router, docId]);

  // Actualizar estado
  const handleActualizarEstado = useCallback(
    (nuevoEstado: string) => {
      actualizarEstadoAuditoria(nuevoEstado);
    },
    [actualizarEstadoAuditoria]
  );

  // Refrescar datos
  const handleRefreshData = useCallback(async () => {
    if (auditoria && auditoria.id) {
      try {
        await fetchAuditoriaData();
        await refreshResultados(true); // Forzar recarga
        toast.success('Datos actualizados desde el servidor');
      } catch {
        toast.error('Error actualizando datos');
      }
    }
  }, [auditoria, fetchAuditoriaData, refreshResultados]);

  // Función auxiliar para obtener datos seguros
  const getAuditoriaValue = (key: string, defaultValue: string = ''): string => {
    if (!auditoria) return defaultValue;

    return (
      auditoria[key] ||
      (auditoria.attributes ? auditoria.attributes[key] : null) ||
      defaultValue
    );
  };

  if (!docId) {
    return (
      <DashboardLayout>
        <div className="p-8 bg-slate-50 min-h-full flex items-center justify-center">
          <p className="text-gray-600 text-lg">Cargando identificador de auditoría...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 bg-slate-50 min-h-full flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 font-medium">Cargando datos de la auditoría...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !auditoria) {
    return (
      <DashboardLayout>
        <div className="p-8 bg-slate-50 min-h-full flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 shadow-sm text-red-700 px-6 py-4 rounded-xl max-w-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              <p>{error || 'No se pudo cargar la auditoría'}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 bg-slate-50 min-h-full">
        {/* CABECERA */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard/auditoria')}
                className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Volver"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">
                  {getAuditoriaValue('title', 'Auditoría sin título')}
                </h1>
                <div className="flex items-center text-slate-500 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {fechaInicio} - {fechaFin}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <StatusBadge estado={getAuditoriaValue('state', 'En Progreso')} />

              <button
                onClick={handleEvaluateClick}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
              >
                <ClipboardCheck className="h-4 w-4" />
                <span>Comenzar evaluación</span>
              </button>
            </div>
          </div>

          <SugerenciaEstado
            estadoSugerido={estadoSugerido}
            actualizandoEstado={actualizandoEstado}
            onActualizarEstado={handleActualizarEstado}
          />
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 lg:col-span-2">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
              <ClipboardCheck className="h-5 w-5 mr-2 text-blue-600" />
              Detalles de la auditoría
            </h2>

            <p className="text-slate-600 mb-6 text-lg leading-relaxed">
              {getAuditoriaValue('description', 'Sin descripción')}
            </p>

            <InfoDetail auditoria={auditoria} fechaInicio={fechaInicio} fechaFin={fechaFin} />

            <EstadoButtons
              currentState={getAuditoriaValue('state', 'En Progreso')}
              actualizandoEstado={actualizandoEstado}
              onStateChange={handleActualizarEstado}
            />
          </div>

          <ProgressPanel
            progreso={progreso}
            controlesEvaluados={controlesEvaluados}
            totalControles={totalControles}
            onContinuarClick={handleEvaluateClick}
          />
        </div>

        {/* ESTADÍSTICAS */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Resumen de controles</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total controles"
              value={totalControles}
              icon={<ClipboardCheck />}
              bgColor="bg-blue-50"
              borderColor="border-blue-100"
              textColor="text-blue-700"
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
            />

            <StatCard
              title="Evaluados"
              value={controlesEvaluados}
              icon={<ClipboardCheck />}
              bgColor="bg-emerald-50"
              borderColor="border-emerald-100"
              textColor="text-emerald-700"
              iconBgColor="bg-emerald-100"
              iconColor="text-emerald-600"
            />

            <StatCard
              title="Pendientes"
              value={Math.max(totalControles - controlesEvaluados, 0)}
              icon={<Clock />}
              bgColor="bg-amber-50"
              borderColor="border-amber-100"
              textColor="text-amber-700"
              iconBgColor="bg-amber-100"
              iconColor="text-amber-600"
            />

            <StatCard
              title="Días restantes"
              value={diasRestantes}
              icon={<Calendar />}
              bgColor="bg-purple-50"
              borderColor="border-purple-100"
              textColor="text-purple-700"
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
            />
          </div>
        </div>

        {/* BOTÓN FLOTANTE REFRESCAR */}
        {actualizandoEstado ? (
          <div className="fixed bottom-6 right-6 bg-black bg-opacity-70 text-white p-4 rounded-lg shadow-lg flex items-center">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
            <span>Actualizando estado...</span>
          </div>
        ) : (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={handleRefreshData}
              className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              title="Refrescar datos"
            >
              <RefreshCw className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* MENSAJE SIN CONEXIÓN */}
        {typeof window !== 'undefined' && !window.navigator.onLine && (
          <div className="fixed top-6 left-0 right-0 mx-auto w-auto max-w-md bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow-md flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              <span>Sin conexión a Internet. Los cambios se guardarán cuando vuelvas a estar en línea.</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AuditoriaDetalle;
