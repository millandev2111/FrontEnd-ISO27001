import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { loadProgress, saveProgress, calculateProgress } from '@/utils/progressUtils';
import toast from 'react-hot-toast';

const API_BASE = 'https://backend-iso27001.onrender.com/api/auditorias';

// Función auxiliar para obtener token
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

  // Cargar datos de la auditoría
  const fetchAuditoriaData = useCallback(async () => {
    if (!documentId) {
      console.log('No hay documentId, no se puede cargar la auditoría');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Intentar cargar progreso desde localStorage primero
      const cachedProgress = loadProgress(documentId);
      if (cachedProgress) {
        console.log('Progreso encontrado en caché:', cachedProgress);
        setProgreso(cachedProgress.progreso);
        setControlesEvaluados(cachedProgress.controlesEvaluados);
      }
      
      const token = getAuthToken();
      if (!token) throw new Error('No se encontró token de autenticación');

      console.log(`Cargando auditoría con documentId: ${documentId}`);
      
      // Añadir timestamp para evitar caché del navegador
      const timestamp = new Date().getTime();
      
      const res = await axios.get(`${API_BASE}?populate=*`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          filters: { documentId: { $eq: documentId } },
          _t: timestamp
        }
      });

      console.log('Respuesta de API de auditoría:', res.data);

      if (!res.data || !res.data.data || res.data.data.length === 0) {
        throw new Error('Auditoría no encontrada');
      }

      // Guardar datos
      const data = res.data.data[0];
      console.log('Datos de auditoría:', data);
      setAuditoria(data);

      // Usar 1 como valor predeterminado para totalControles
      const totalControles = 1;
      
      // Calcular progreso (solo si no se encontró en caché)
      if (!cachedProgress) {
        try {
          console.log('Calculando progreso desde API...');
          const progressData = await calculateProgress(documentId, totalControles);
          console.log('Progreso calculado:', progressData);
          
          setProgreso(progressData.progreso);
          setControlesEvaluados(progressData.controlesEvaluados);
          
          // Sugerir estado según progreso
          if (progressData.progreso === 100 && data.state !== 'Completada') {
            setEstadoSugerido('Completada');
          } else if (progressData.progreso >= 0 && progressData.progreso < 100 && data.state !== 'En Progreso') {
            setEstadoSugerido('En Progreso');
          }
        } catch (error) {
          console.error('Error calculando progreso:', error);
          // Si falla el cálculo, establecer valores por defecto
          setProgreso(100);
          setControlesEvaluados(totalControles);
        }
      }
    } catch (e: any) {
      console.error('Error al cargar auditoría:', e);
      setError(e.message || 'Error desconocido');
      setAuditoria(null);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  // Función para actualizar el estado de la auditoría
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

        // Guardar progreso actual antes de la actualización
        const currentProgreso = progreso;
        const currentControlesEvaluados = controlesEvaluados;

        // CORRECCIÓN: Usar documentId para el endpoint, NO el ID numérico
        // Obtener documentId del objeto auditoría o usar el que se pasó al hook
        const auditoriaDocumentId = auditoria.documentId || documentId;
        const endpoint = `${API_BASE}/${auditoriaDocumentId}`;
        
        // Formato correcto con data para Strapi v4
        const payload = {
          data: {
            state: nuevoEstado
          }
        };
        
        console.log('---------- DIAGNÓSTICO DE API ----------');
        console.log('Endpoint:', endpoint);
        console.log('DocumentId usado en URL:', auditoriaDocumentId);
        console.log('ID numérico (NO usado):', auditoria.id);
        console.log('Payload exacto:', JSON.stringify(payload, null, 2));
        console.log('----------------------------------------');
        
        const response = await axios({
          method: 'PUT',
          url: endpoint,
          data: payload,
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Respuesta exitosa:', response.data);

        // Actualizar estado local
        setAuditoria(prev => {
          if (!prev) return null;
          return {
            ...prev,
            state: nuevoEstado
          };
        });
        
        // Mantener el progreso después de la actualización
        saveProgress(documentId, currentProgreso, currentControlesEvaluados);
        
        // Eliminar sugerencia
        setEstadoSugerido(null);
        
        toast.success(`Estado actualizado a: ${nuevoEstado}`);
      } catch (e: any) {
        console.error('Error actualizando estado:', e);
        console.error('Datos de error completos:', e.response?.data || 'No hay datos adicionales');
        
        // Mostrar mensaje de error más descriptivo
        let mensajeError = 'Error al actualizar estado';
        if (e.response?.status === 400) {
          mensajeError = `Error 400: Formato de solicitud incorrecto. Detalles: ${JSON.stringify(e.response?.data || {})}`;
        } else if (e.response?.status === 401) {
          mensajeError = 'Error 401: No autorizado';
        } else if (e.response?.status === 404) {
          mensajeError = 'Error 404: Auditoría no encontrada';
        } else if (e.message) {
          mensajeError = e.message;
        }
        
        setError(mensajeError);
        toast.error(`No se pudo actualizar el estado: ${mensajeError}`);
      } finally {
        setActualizandoEstado(false);
      }
    },
    [documentId, auditoria, progreso, controlesEvaluados]
  );

  // Efecto para cargar datos iniciales
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
    actualizandoEstado,
    estadoSugerido,
    fetchAuditoriaData,
    actualizarEstadoAuditoria,
  };
};