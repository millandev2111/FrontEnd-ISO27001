'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import axios from 'axios'
import { getCookie } from 'cookies-next'

interface Resultado {
  id?: number
  documentId?: string
  tipo?: string
  controladorId?: number
  auditoriaId?: number
}

interface ResultadosContextValue {
  resultados: Record<string, Resultado> // ahora clave es `${auditoriaId}-${controladorId}`
  setResultados: React.Dispatch<React.SetStateAction<Record<string, Resultado>>>
  refreshResultados: () => Promise<void>
}

const ResultadosContext = createContext<ResultadosContextValue | undefined>(undefined)

export const useResultados = () => {
  const context = useContext(ResultadosContext)
  if (!context) throw new Error('useResultados debe usarse dentro de ResultadosProvider')
  return context
}

export const ResultadosProvider = ({ children }: { children: ReactNode }) => {
  const [resultados, setResultados] = useState<Record<string, Resultado>>({})

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null
    const token = getCookie('auth_token')
    return typeof token === 'string' ? token : null
  }

  const refreshResultados = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        console.warn("No se encontró token de autenticación")
        return
      }

      const res = await axios.get('https://backend-iso27001.onrender.com/api/resultados', {
        headers: { Authorization: `Bearer ${token}` },
        params: { populate: '*' }
      })

      if (!res.data || !res.data.data || !Array.isArray(res.data.data)) {
        console.error("Formato de respuesta inesperado:", res.data)
        return
      }

      const mapResultados: Record<string, Resultado> = {}

      res.data.data.forEach((result: any, index: number) => {
        const resultado = result.attributes || result
        const controladorId =
          resultado.controlador?.id ??
          resultado.controlador?.data?.id ??
          (typeof resultado.controlador === 'number' ? resultado.controlador : null)
        const auditoriaId =
          resultado.auditoria?.id ??
          resultado.auditoria?.data?.id ??
          (typeof resultado.auditoria === 'number' ? resultado.auditoria : null)

        if (
          controladorId &&
          auditoriaId &&
          resultado.tipo &&
          typeof resultado.tipo === 'string' &&
          ['conforme', 'no_conforme', 'observacion', 'no_aplica'].includes(resultado.tipo)
        ) {
          const clave = `${auditoriaId}-${controladorId}`
          mapResultados[clave] = {
            id: result.id || resultado.id,
            documentId: resultado.documentId || String(result.id || resultado.id),
            tipo: resultado.tipo,
            controladorId,
            auditoriaId,
          }
        } else if (!controladorId || !auditoriaId) {
          console.warn(`Resultado #${index} omitido: falta controladorId o auditoriaId`)
        }
      })

      setResultados(mapResultados)
    } catch (error: any) {
      console.error("Error cargando resultados:", error)
      console.error("Mensaje de error:", error.message)
      if (error.response) {
        console.error("Datos de respuesta:", error.response.data)
        console.error("Estado de respuesta:", error.response.status)
      }
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      refreshResultados()
    }
  }, [])

  return (
    <ResultadosContext.Provider value={{ resultados, setResultados, refreshResultados }}>
      {children}
    </ResultadosContext.Provider>
  )
}
