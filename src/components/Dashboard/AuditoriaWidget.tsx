'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useResultados } from '@/context/ResultadosContext'
import { getCookie } from 'cookies-next'
import { loadProgress, saveProgress, calculateProgressFromCounts } from '@/utils/progressUtils' // Usamos calculateProgress real

interface Controlador {
  id: number
  data?: {
    id: number
    code: string
    title: string
    ask: string
    description: string
    type: string
  }
}

interface AuditoriaData {
  id: number
  documentId: string
  title: string
  state: string
  controladors?: Controlador[]
  progreso?: number
  controlesEvaluados?: number
}

const AuditoriaWidget = () => {
  const router = useRouter()
  const { resultados, refreshResultados } = useResultados()
  const [auditorias, setAuditorias] = useState<AuditoriaData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null
    const token = getCookie('auth_token')
    return typeof token === 'string' ? token : null
  }

  useEffect(() => {
    refreshResultados(true)
  }, [refreshResultados])

  useEffect(() => {
    fetchAuditoriasData()
  }, [])

  const fetchAuditoriasData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) throw new Error('No se encontró el token de autenticación');

      const response = await axios.get('https://backend-iso27001.onrender.com/api/auditorias', {
        params: { populate: ['controladors'] },
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      let transformedData = response.data.data.map((item: any) => {
        let result: any = { id: item.id };

        if (item.attributes) {
          result.documentId = item.attributes.documentId || '';
          result.title = item.attributes.title || '';
          result.state = item.attributes.state || '';

          if (item.attributes.controladors && item.attributes.controladors.data) {
            result.controladors = item.attributes.controladors.data.map((controlador: any) => ({
              id: controlador.id,
              ...controlador.attributes,
            }));
          } else if (item.attributes.controladors && Array.isArray(item.attributes.controladors)) {
            result.controladors = item.attributes.controladors;
          } else {
            result.controladors = [];
          }
        } else {
          result = { ...item };
          result.documentId = result.documentId || '';
          result.controladors = result.controladors || [];
        }

        return result;
      });

      for (let i = 0; i < transformedData.length; i++) {
        const auditoria = transformedData[i];
        if (auditoria.documentId) {
          try {
            const cachedProgress = loadProgress(auditoria.documentId);
            if (cachedProgress) {
              auditoria.progreso = cachedProgress.progreso;
              auditoria.controlesEvaluados = cachedProgress.controlesEvaluados;
            } else {
              const totalControles = auditoria.controladors?.length || 1;

              // Aquí debes calcular los controles evaluados si tienes la info, sino asumo 0
              const evaluados = 0;

              const progressData = calculateProgressFromCounts(evaluados, totalControles);

              auditoria.progreso = progressData.progreso;
              auditoria.controlesEvaluados = progressData.controlesEvaluados;

              saveProgress(auditoria.documentId, progressData.progreso, progressData.controlesEvaluados);
            }
          } catch (error) {
            console.error(`Error cargando progreso para ${auditoria.title}:`, error);
            auditoria.progreso = 0;
            auditoria.controlesEvaluados = 0;
          }
        }
      }

      setAuditorias(transformedData);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) setError('No tienes permisos para acceder a las auditorías');
        else if (err.response?.status === 401) setError('Token inválido o expirado');
        else if (err.response?.data?.error?.message) setError(err.response.data.error.message);
        else setError('Error al cargar las auditorías');
      } else if (err instanceof Error) setError(err.message);
      else setError('Error desconocido');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white shadow-lg rounded-lg p-6 w-full">
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
        <div className="text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={fetchAuditoriasData} className="mt-2 text-blue-600 text-sm hover:underline">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (auditorias.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
        <p className="text-gray-600 text-center">No hay auditorías disponibles</p>
      </div>
    )
  }

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'text-red-500'
    if (progress < 70) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {auditorias.map((auditoria) => {
        const progress = auditoria.progreso || 0
        const completedControls = auditoria.controlesEvaluados || 0
        const totalControls = auditoria.controladors?.length || 1

        const progressColor = getProgressColor(progress)
        const circumference = 2 * Math.PI * 40 // Radio = 40
        const dashoffset = circumference - (progress / 100) * circumference

        return (
          <div key={auditoria.id} className="bg-white shadow-lg rounded-lg p-6 w-full">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{auditoria.title}</h3>

            <div className="flex flex-col items-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />

                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    className={`${progressColor} transform -rotate-90 origin-center transition-all duration-1000 ease-out`}
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className={`text-2xl font-bold ${progressColor}`}>{progress}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-2">
              <p className="text-sm text-gray-600">Controladores Evaluados:</p>
              <p className="font-semibold text-gray-800">
                {completedControls} de {totalControls}
              </p>
            </div>

            <div className="mt-6">
              {auditoria.documentId ? (
                <button
                  onClick={() => router.push(`/dashboard/auditoria/${auditoria.documentId}`)}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <span>Evaluar cumplimiento</span>
                </button>
              ) : (
                <button className="w-full bg-gray-400 text-white py-2 rounded-md transition-colors duration-200 flex items-center justify-center cursor-not-allowed">
                  <span>ID no disponible</span>
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AuditoriaWidget
