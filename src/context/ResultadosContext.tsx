import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import axios from 'axios'
import { getCookie } from 'cookies-next'
import toast from 'react-hot-toast'

interface Resultado {
  id?: number
  documentId?: string
  tipo?: string
  controladorId?: number
  auditoriaId?: number
}

interface ResultadosContextValue {
  resultados: Record<string, Resultado> // clave es `${auditoriaId}-${controladorId}`
  setResultados: React.Dispatch<React.SetStateAction<Record<string, Resultado>>>
  refreshResultados: (forceRefresh?: boolean) => Promise<void>
}

const ResultadosContext = createContext<ResultadosContextValue | undefined>(undefined)

export const useResultados = () => {
  const context = useContext(ResultadosContext)
  if (!context) throw new Error('useResultados debe usarse dentro de ResultadosProvider')
  return context
}

export const ResultadosProvider = ({ children }: { children: ReactNode }) => {
  const [resultados, setResultados] = useState<Record<string, Resultado>>({})
  const [cargando, setCargando] = useState(false)
  const [resultadosCargados, setResultadosCargados] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(0) // Para evitar recargas excesivas

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null
    const token = getCookie('auth_token')
    return typeof token === 'string' ? token : null
  }

  const refreshResultados = useCallback(async (forceRefresh = false) => {
    // Evitar múltiples cargas en menos de 2 segundos
    const now = Date.now()
    const minRefreshInterval = 2000 // 2 segundos
    
    if (!forceRefresh && now - lastRefresh < minRefreshInterval) {
      return
    }
    
    // Evitar múltiples cargas simultáneas
    if (cargando) {
      return
    }
    
    // Si ya están cargados y no es forzado, no recargar
    if (resultadosCargados && !forceRefresh) {
      return
    }
    
    setCargando(true)
    setLastRefresh(now)
    
    try {
      const token = getAuthToken()
      if (!token) {
        console.warn("No se encontró token de autenticación")
        return
      }


      const res = await axios.get('https://backend-iso27001.onrender.com/api/resultados', {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          populate: '*',
          _t: now // Evitar caché
        }
      })

      // Debug para ver estructura completa

      if (!res.data || !res.data.data || !Array.isArray(res.data.data)) {
        console.error("Formato de respuesta inesperado:", res.data)
        toast.error("Error cargando resultados: formato de respuesta inesperado")
        return
      }

      const mapResultados: Record<string, Resultado> = {}
      let resultadosOmitidos = 0

      res.data.data.forEach((result: any, index: number) => {
        // Debug para explorar la estructura
        
        let controladorId = null
        let auditoriaId = null
        
        // Busca controladorId y auditoriaId en todas las posibles estructuras
        if (result.attributes) {
          // Estructura Strapi v4
          if (result.attributes.controlador) {
            if (typeof result.attributes.controlador === 'number') {
              controladorId = result.attributes.controlador
            } else if (result.attributes.controlador.data?.id) {
              controladorId = result.attributes.controlador.data.id
            } else if (result.attributes.controlador.id) {
              controladorId = result.attributes.controlador.id
            }
          }
          
          if (result.attributes.auditoria) {
            if (typeof result.attributes.auditoria === 'number') {
              auditoriaId = result.attributes.auditoria
            } else if (result.attributes.auditoria.data?.id) {
              auditoriaId = result.attributes.auditoria.data.id
            } else if (result.attributes.auditoria.id) {
              auditoriaId = result.attributes.auditoria.id
            } else if (result.attributes.auditoria.attributes?.documentId) {
              // Usar documentId como id alternativo
              auditoriaId = result.attributes.auditoria.attributes.documentId
            }
          }
        } else {
          // Estructura antigua o personalizada
          if (result.controlador) {
            if (typeof result.controlador === 'number') {
              controladorId = result.controlador
            } else if (result.controlador.id) {
              controladorId = result.controlador.id
            }
          }
          
          if (result.auditoria) {
            if (typeof result.auditoria === 'number') {
              auditoriaId = result.auditoria
            } else if (result.auditoria.id) {
              auditoriaId = result.auditoria.id
            } else if (result.auditoria.documentId) {
              auditoriaId = result.auditoria.documentId
            }
          }
        }
        
        // Si no se encontró en las estructuras comunes, buscar recursivamente
        if (!controladorId || !auditoriaId) {
          const findInObject = (obj: any, key: string): any => {
            if (!obj || typeof obj !== 'object') return null
            if (obj[key] !== undefined) return obj[key]
            
            for (const prop in obj) {
              if (typeof obj[prop] === 'object') {
                const found = findInObject(obj[prop], key)
                if (found !== null) return found
              }
            }
            return null
          }
          
          if (!controladorId) {
            controladorId = findInObject(result, 'controladorId')
          }
          
          if (!auditoriaId) {
            auditoriaId = findInObject(result, 'auditoriaId')
          }
        }

        // Obtener tipo de resultado (conforme, no_conforme, etc.)
        const tipo = result.attributes?.tipo || result.tipo

        if (
          controladorId &&
          auditoriaId &&
          tipo &&
          typeof tipo === 'string' &&
          ['conforme', 'no_conforme', 'observacion', 'no_aplica'].includes(tipo)
        ) {
          const clave = `${auditoriaId}-${controladorId}`
          mapResultados[clave] = {
            id: result.id || (result.attributes?.id),
            documentId: result.attributes?.documentId || result.documentId || String(result.id),
            tipo: tipo,
            controladorId,
            auditoriaId,
          }
        } else {
          resultadosOmitidos++
         
        }
      })

      
      
      setResultados(mapResultados)
      setResultadosCargados(true)
      
      if (Object.keys(mapResultados).length > 0) {
        toast.success(`${Object.keys(mapResultados).length} resultados cargados`)
      } else if (resultadosOmitidos > 0) {
        toast.error(`No se pudieron procesar los resultados. Se omitieron ${resultadosOmitidos} elementos.`)
      }
    } catch (error: any) {
      console.error("Error cargando resultados:", error)
      console.error("Mensaje de error:", error.message)
      if (error.response) {
        console.error("Datos de respuesta:", error.response.data)
        console.error("Estado de respuesta:", error.response.status)
      }
      toast.error(`Error cargando resultados: ${error.message}`)
    } finally {
      setCargando(false)
    }
  }, [cargando, resultadosCargados, lastRefresh])

  // Cargar resultados al iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      refreshResultados()
    }
  }, [refreshResultados])

  return (
    <ResultadosContext.Provider value={{ 
      resultados, 
      setResultados, 
      refreshResultados
    }}>
      {children}
    </ResultadosContext.Provider>
  )
}