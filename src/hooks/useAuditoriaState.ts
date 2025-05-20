import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import {
  loadProgress,
  saveProgress,
  calculateProgressFromCounts,
  clearProgress,
} from '@/utils/progressUtils';
import toast from 'react-hot-toast';

const API_BASE = 'https://backend-iso27001.onrender.com/api/auditorias';

const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  const token = getCookie('auth_token');
  return typeof token === 'string' ? token : null;
};

export const useAuditoriaState = (documentId: string) => {
  const [auditoria, setAuditoria] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);
  const [estadoSugerido, setEstadoSugerido] = useState<string | null>(null);
  const [progreso, setProgreso] = useState(0);
  const [controlesEvaluados, setControlesEvaluados] = useState(0);
  const [totalControles, setTotalControles] = useState(0);

  const fetchAuditoriaData = useCallback(async () => {
    if (!documentId) {
      console.log('No hay documentId, no se puede cargar la auditoría');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Intentar cargar progreso cacheado primero
      const cachedProgress = loadProgress(documentId);
      if (cachedProgress) {
        setProgreso(cachedProgress.progreso);
        setControlesEvaluados(cachedProgress.controlesEvaluados);
      }

      const token = getAuthToken();
      if (!token) throw new Error('No se encontró token de autenticación');

      const timestamp = new Date().getTime();

      // Llamar al endpoint sin filtro, porque documentId está en query params
      const res = await axios.get(`${API_BASE}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          populate: ['users', 'controladors', 'resultados'],
          filters: { documentId: { $eq: documentId } },
          _t: timestamp,
        },
      });

      if (!res.data || !res.data.data || res.data.data.length === 0) {
        throw new Error('Auditoría no encontrada');
      }

      const data = res.data.data[0];
      setAuditoria(data);

      // Sacar controles y resultados reales
      const controles = data.controladors || [];
      const resultados = data.resultados || [];

      const total = controles.length;
      setTotalControles(total);

      // Contar cuántos controles fueron evaluados (existen resultados con fechaEvaluacion)
      const evaluados = resultados.filter(
        (r: any) => r.fechaEvaluacion && r.fechaEvaluacion.trim() !== ''
      ).length;

      setControlesEvaluados(evaluados);

      // Calcular progreso con función pura
      const { progreso: prog } = calculateProgressFromCounts(evaluados, total);
      setProgreso(prog);

      // Guardar progreso en localStorage
      saveProgress(documentId, prog, evaluados);

      // Sugerir cambio de estado si aplica
      if (prog === 100 && data.state !== 'Completada') {
        setEstadoSugerido('Completada');
      } else if (prog < 100 && prog > 0 && data.state !== 'En Progreso') {
        setEstadoSugerido('En Progreso');
      } else {
        setEstadoSugerido(null);
      }
    } catch (e: any) {
      console.error('Error al cargar auditoría:', e);
      setError(e.message || 'Error desconocido');
      setAuditoria(null);

      // Limpiar progreso cacheado si hubo error (opcional)
      clearProgress(documentId);

      setProgreso(0);
      setControlesEvaluados(0);
      setTotalControles(0);
      setEstadoSugerido(null);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const actualizarEstadoAuditoria = useCallback(
    async (nuevoEstado: string) => {
      if (!documentId || !auditoria) {
        setError('No hay auditoría cargada o ID inválido');
        return;
      }

      setActualizandoEstado(true);
      setError(null);

      try {
        const token = getAuthToken();
        if (!token) throw new Error('No se encontró token de autenticación');

        const auditoriaDocumentId = auditoria.documentId || documentId;
        const endpoint = `${API_BASE}/${auditoriaDocumentId}`;

        // Enfoque 1: Usar connect para IDs regulares (más común)
        const payload = {
          data: {
            state: nuevoEstado,
            resultados: {
              connect: auditoria.resultados
                ? auditoria.resultados.map((r: any) => r.documentId)
                : []
            }
          },
        };
        // Actualizar el estado
        await axios.put(endpoint, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Obtener todos los datos actualizados con populate
        const respuestaCompleta = await axios.get(`${endpoint}?populate=*`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Actualizar el estado local con la auditoría actualizada
        setAuditoria(respuestaCompleta.data.data);

        setEstadoSugerido(null);
        toast.success(`Estado actualizado a: ${nuevoEstado}`);
      } catch (e: any) {
        console.error('Error actualizando estado:', e);
        setError('Error al actualizar estado');
        toast.error('No se pudo actualizar el estado');
      } finally {
        setActualizandoEstado(false);
      }
    },
    [documentId, auditoria]
  );
  useEffect(() => {
    if (documentId) {
      fetchAuditoriaData();
    }
  }, [documentId, fetchAuditoriaData]);

  return {
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
  };
};
