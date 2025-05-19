'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../layout';
import { getCookie } from 'cookies-next';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Upload,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
} from 'lucide-react';
import axios from 'axios';
import { useResultados } from '@/context/ResultadosContext';
// Importar las utilidades de progreso
import { saveProgress, updateProgressAfterEvaluation } from '@/utils/progressUtils';

enum ResultadoTipo {
  CONFORME = 'conforme',
  NO_CONFORME = 'no_conforme',
  OBSERVACION = 'observacion',
  NO_APLICA = 'no_aplica',
}

// Mantener las interfaces originales
interface ResultadoControlador {
  id?: number;
  documentId?: string; // para PUT
  tipo: ResultadoTipo;
  comentario: string;
  evidencias?: string[];
  fechaEvaluacion: string;
  evaluadoPor?: string;
  controlador?: { id: number; code: string };
  auditoria?: { id: number };
}

interface Controlador {
  id: number;
  documentId: string;
  code: string;
  title: string;
  ask: string;
  description: string;
  type: string;
}

interface Auditoria {
  id: number;
  documentId: string;
  title: string;
  controladors: Controlador[];
}

interface ResultadoApi {
  id: number;
  documentId: string;
  tipo: string;
  comentario?: string;
  evidencias?: string[];
  fechaEvaluacion?: string;
  evaluadoPor?: {
    data?: {
      attributes?: {
        username?: string;
      };
    };
  };
  controlador?: {
    id: number;
    code: string;
  };
  auditoria?: {
    id: number;
  };
}

const EvaluateAuditoria = () => {
  const router = useRouter();
  const { documentId } = router.query;
  const { resultados: resultadosGlobales, refreshResultados } = useResultados();

  // Estado con clave compuesta auditoriaId-controladorId
  const [auditoria, setAuditoria] = useState<Auditoria | null>(null);
  const [resultados, setResultados] = useState<{ [key: string]: ResultadoControlador }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    const token = getCookie('auth_token')
    return typeof token === 'string' ? token : null
  }

  const getUserIdFromCookie = () => {
    try {
      const cookies = document.cookie.split(';').map((c) => c.trim());
      const userCookie = cookies.find((c) => c.startsWith('user_info='));
      if (!userCookie) return null;
      const cookieValue = userCookie.split('=')[1];
      if (!cookieValue) return null;
      const decoded = decodeURIComponent(cookieValue);
      const user = JSON.parse(decoded);
      return user.id || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    console.log('EvaluateAuditoria mounted or documentId changed:', documentId);
    if (!documentId) return;

    const fetchAuditoria = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAuthToken();
        if (!token) throw new Error('No token de autenticación');

        // Buscar directamente por documentId
        console.log('Fetching auditoria with documentId:', documentId);

        // Opción 1: Buscar directamente por documentId
        const auditoriaRes = await axios.get('https://backend-iso27001.onrender.com/api/auditorias', {
          params: {
            filters: {
              documentId: { $eq: documentId }
            },
            populate: ['controladors']
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Auditoria raw response:', auditoriaRes.data);

        if (!auditoriaRes.data.data || auditoriaRes.data.data.length === 0) {
          // Si no encontramos por documentId, intentamos con el endpoint directo
          console.log('Auditoría no encontrada por filtro, intentando directamente con ID');

          // Opción 2: Tratar documentId como ID directo
          const directRes = await axios.get(`https://backend-iso27001.onrender.com/api/auditorias/${documentId}`, {
            params: { populate: ['controladors'] },
            headers: { Authorization: `Bearer ${token}` },
          });

          console.log('Direct auditoria response:', directRes.data);

          if (!directRes.data.data) {
            throw new Error('Auditoría no encontrada');
          }

          const auditoriaData = directRes.data.data;
          const auditoriaObj = auditoriaData.attributes
            ? { id: auditoriaData.id, ...auditoriaData.attributes }
            : auditoriaData;

          console.log('Parsed auditoria object:', auditoriaObj);
          setAuditoria(auditoriaObj);
          await fetchResultados(auditoriaObj);
        } else {
          // Procesamos los resultados del filtro
          const auditoriaData = auditoriaRes.data.data[0];
          const auditoriaObj = auditoriaData.attributes
            ? { id: auditoriaData.id, ...auditoriaData.attributes }
            : auditoriaData;

          console.log('Parsed auditoria object:', auditoriaObj);
          setAuditoria(auditoriaObj);
          await fetchResultados(auditoriaObj);
        }
      } catch (err: any) {
        console.error('Error fetching auditoria completa:', err);
        setError(err.message || 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };

    const fetchResultados = async (auditoriaObj: Auditoria) => {
      try {
        const token = getAuthToken();
        if (!token) throw new Error('No token de autenticación');

        const resultadosRes = await axios.get('https://backend-iso27001.onrender.com/api/resultados', {
          params: { populate: ['controlador', 'auditoria', 'evaluadoPor'] },
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Resultados raw response:', resultadosRes.data);

        const resultadosArr: ResultadoApi[] = resultadosRes.data.data;
        const resultadosMap: { [key: string]: ResultadoControlador } = {};

        resultadosArr.forEach((res, index) => {
          console.log(`Resultado #${index}:`, res);
          if (res.controlador && res.controlador.id && res.auditoria && res.auditoria.id) {
            const key = `${res.auditoria.id}-${res.controlador.id}`;
            resultadosMap[key] = {
              id: res.id,
              documentId: res.documentId,
              tipo: res.tipo as ResultadoTipo,
              comentario: res.comentario || '',
              evidencias: res.evidencias || [],
              fechaEvaluacion: res.fechaEvaluacion || new Date().toISOString(),
              evaluadoPor: res.evaluadoPor?.data?.attributes?.username || '',
              controlador: { id: res.controlador.id, code: res.controlador.code },
              auditoria: { id: res.auditoria.id },
            };
          } else {
            console.warn(`Resultado #${index} sin controlador o auditoria válida, se omite.`);
          }
        });

        setResultados(resultadosMap);
      } catch (err: any) {
        console.error('Error fetching resultados:', err);
        setError(err.message || 'Error cargando resultados');
      }
    };

    fetchAuditoria();
  }, [documentId]);

  // AQUÍ ESTÁ EL CAMBIO PRINCIPAL: Modificamos guardarEvaluacion para actualizar el progreso
  const guardarEvaluacion = async () => {
    if (!auditoria) {
      console.warn('No hay auditoria cargada, no se puede guardar');
      return;
    }
    const currentControlador = auditoria.controladors[currentIndex];
    if (!currentControlador) {
      console.warn('No hay controlador actual seleccionado, no se puede guardar');
      return;
    }
    setGuardando(true);
    setError(null);

    const key = `${auditoria.id}-${currentControlador.id}`;

    try {
      const token = getAuthToken();
      const userId = getUserIdFromCookie();
      if (!token || !userId) throw new Error('No autenticación');

      // Obtener resultado actual para este controlador y auditoria
      let currentResult = resultados[key] || {
        tipo: ResultadoTipo.NO_APLICA,
        comentario: '',
        evidencias: [],
        fechaEvaluacion: new Date().toISOString(),
      };

      const payload = {
        data: {
          tipo: currentResult.tipo,
          comentario: currentResult.comentario || '',
          evidencias: currentResult.evidencias || [],
          fechaEvaluacion: new Date().toISOString(),
          controlador: currentControlador.id,
          auditoria: auditoria.id,  // Mantenemos esta forma por ahora
          evaluadoPor: userId,
        },
      };

      // Agregar logs detallados para depuración
      console.log('Payload para guardar:', JSON.stringify(payload, null, 2));
      console.log('ID de auditoría:', auditoria.id);
      console.log('ID de controlador:', currentControlador.id);

      console.log('Payload para guardar:', payload);

      let response;
      if (currentResult.documentId) {
        console.log('Actualizando resultado existente documentId:', currentResult.documentId);
        response = await axios.put(
          `https://backend-iso27001.onrender.com/api/resultados/${currentResult.documentId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        console.log('Creando nuevo resultado');
        response = await axios.post('https://backend-iso27001.onrender.com/api/resultados', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const nuevoId = response.data.data.id;
        const nuevoDocumentId = response.data.data.documentId;

        // Actualizar estado y variable local para evitar desincronización del id
        currentResult = { ...currentResult, id: nuevoId, documentId: nuevoDocumentId };
      }

      // Actualizar el estado local de resultados
      setResultados((prev) => ({
        ...prev,
        [key]: currentResult,
      }));

      // Actualizar el contexto de resultados
      await refreshResultados();

      // NUEVO: Calcular y actualizar el progreso después de guardar
      // Contar cuántos controles tienen resultados ahora
      const totalControles = auditoria.controladors.length;
      const resultadosKeys = Object.keys(resultados);
      const evaluados = resultadosKeys.filter(k => k.startsWith(`${auditoria.id}-`)).length +
        (resultados[key] ? 0 : 1); // +1 si es nuevo resultado

      // Actualizar el progreso usando nuestra utilidad centralizada
      updateProgressAfterEvaluation(auditoria.id, evaluados, totalControles);
      console.log(`Progreso actualizado: ${evaluados}/${totalControles} controles evaluados`);

      console.log('Respuesta al guardar:', response.data);
      setSuccessMessage('Evaluación guardada correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error guardando evaluación:', err);
      setError(err.response?.data?.error?.message || err.message || 'Error guardando evaluación');
    } finally {
      setGuardando(false);
    }
  };

  // Funciones auxiliares sin cambios
  const getResultadoColor = (tipo: ResultadoTipo) => {
    switch (tipo) {
      case ResultadoTipo.CONFORME:
        return 'bg-green-100 border-green-500 text-green-800 hover:bg-green-200';
      case ResultadoTipo.NO_CONFORME:
        return 'bg-red-100 border-red-500 text-red-800 hover:bg-red-200';
      case ResultadoTipo.OBSERVACION:
        return 'bg-yellow-100 border-yellow-500 text-yellow-800 hover:bg-yellow-200';
      case ResultadoTipo.NO_APLICA:
        return 'bg-gray-100 border-gray-500 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800 hover:bg-gray-200';
    }
  };

  const getResultadoIcon = (tipo: ResultadoTipo) => {
    switch (tipo) {
      case ResultadoTipo.CONFORME:
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case ResultadoTipo.NO_CONFORME:
        return <XCircle className="w-4 h-4 mr-1" />;
      case ResultadoTipo.OBSERVACION:
        return <AlertTriangle className="w-4 h-4 mr-1" />;
      case ResultadoTipo.NO_APLICA:
        return <HelpCircle className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  const getResultadoNameInSpanish = (tipo: ResultadoTipo) => {
    switch (tipo) {
      case ResultadoTipo.CONFORME:
        return 'Conforme';
      case ResultadoTipo.NO_CONFORME:
        return 'No Conforme';
      case ResultadoTipo.OBSERVACION:
        return 'Observación';
      case ResultadoTipo.NO_APLICA:
        return 'No Aplica';
      default:
        return tipo;
    }
  };

  // Renderizado condicional sin cambios
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600" />
            <p className="mt-4 text-lg text-gray-700">Cargando datos de la auditoría...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!auditoria) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
            <XCircle className="w-12 h-12 mx-auto text-red-600 mb-4" />
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">No se pudo cargar la auditoría</h2>
            <p className="text-gray-600 text-center mb-4">{error || 'Ha ocurrido un error inesperado'}</p>
            <button
              onClick={() => router.back()}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentControlador = auditoria.controladors[currentIndex];
  const key = `${auditoria.id}-${currentControlador.id}`;
  const currentResult = resultados[key] || {
    tipo: ResultadoTipo.NO_APLICA,
    comentario: '',
    evidencias: [],
    fechaEvaluacion: new Date().toISOString(),
  };
  const progress = Math.round(((currentIndex + 1) / auditoria.controladors.length) * 100);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Cabecera */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{auditoria.title}</h1>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <span>Evaluando controladores</span>
              <span className="mx-2">•</span>
              <span>
                {currentIndex + 1} de {auditoria.controladors.length}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Contenedor principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Información del controlador */}
          <div className="border-b border-gray-200 bg-gray-50 p-6">
            <div className="flex items-center mb-2">
              <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {currentControlador?.code || 'N/A'}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{currentControlador?.title || 'No disponible'}</h2>
            {currentControlador?.description && (
              <p className="text-gray-600 mb-2">{currentControlador.description}</p>
            )}
            {currentControlador?.ask && (
              <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-blue-800">
                <p className="font-medium mb-1">Pregunta clave:</p>
                <p>{currentControlador.ask}</p>
              </div>
            )}
          </div>

          {/* Formulario de evaluación */}
          <div className="p-6">
            {/* Selección de resultado */}
            <div className="mb-6">
              <label className="block font-medium text-gray-700 mb-2">Resultado de la evaluación:</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(ResultadoTipo).map(([key, tipo]) => {
                  const isSelected = currentResult.tipo === tipo;
                  return (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => {
                        setResultados((prev) => ({
                          ...prev,
                          [`${auditoria.id}-${currentControlador.id}`]: {
                            ...prev[`${auditoria.id}-${currentControlador.id}`],
                            tipo,
                          },
                        }));
                      }}
                      className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${currentResult.tipo === tipo
                        ? `${getResultadoColor(tipo)} border-2`
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {getResultadoIcon(tipo)}
                      <span>{getResultadoNameInSpanish(tipo)}</span>
                    </button>

                  );
                })}
              </div>
            </div>

            {/* Comentarios */}
            <div className="mb-6">
              <label className="block font-medium text-gray-700 mb-2">Comentarios:</label>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={currentResult.comentario || ''}
                onChange={(e) => {
                  const comentario = e.target.value;
                  setResultados((prev) => ({
                    ...prev,
                    [key]: {
                      ...prev[key],
                      comentario,
                    },
                  }));
                }}
                placeholder="Agrega tus observaciones, detalles o justificación para esta evaluación..."
              />
            </div>

            {/* Mensajes de error y éxito */}
            {error && (
              <div className="mb-6 p-3 bg-red-100 border border-red-200 rounded-lg text-red-800 flex items-start">
                <XCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-3 bg-green-100 border border-green-200 rounded-lg text-green-800 flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <p>{successMessage}</p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 space-y-3 sm:space-y-0">
              {/* Navegación */}
              <div className="flex space-x-3">
                <button
                  disabled={currentIndex === 0 || guardando}
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </button>
                <button
                  disabled={currentIndex === auditoria.controladors.length - 1 || guardando}
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              {/* Guardar */}
              <button
                onClick={guardarEvaluacion}
                disabled={guardando}
                className="flex items-center justify-center w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {guardando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar evaluación
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EvaluateAuditoria; 