'use client'
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import axios from 'axios'

interface Resultado {
  id?: number
  documentId?: string
  tipo?: string
  controladorId?: number
}

interface ResultadosContextValue {
  resultados: Record<number, Resultado>
  setResultados: React.Dispatch<React.SetStateAction<Record<number, Resultado>>>
  refreshResultados: () => Promise<void>
}

const ResultadosContext = createContext<ResultadosContextValue | undefined>(undefined)

export const useResultados = () => {
  const context = useContext(ResultadosContext)
  if (!context) throw new Error('useResultados debe usarse dentro de ResultadosProvider')
  return context
}

export const ResultadosProvider = ({ children }: { children: ReactNode }) => {
  const [resultados, setResultados] = useState<Record<number, Resultado>>({})

  const getAuthToken = () => {
    // Verificar que estamos en el navegador
    if (typeof window === 'undefined') return null;

    return (
      localStorage.getItem('jwtToken') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('jwtToken') ||
      sessionStorage.getItem('auth_token') ||
      sessionStorage.getItem('token') ||
      null
    )
  }

  const refreshResultados = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn("No se encontró token de autenticación");
        return;
      }

      const res = await axios.get('http://localhost:1337/api/resultados', {
        headers: { Authorization: `Bearer ${token}` },
        params: { populate: '*' }
      });


      if (!res.data || !res.data.data || !Array.isArray(res.data.data)) {
        console.error("Formato de respuesta inesperado:", res.data);
        return;
      }

      const mapResultados: Record<number, Resultado> = {};


      res.data.data.forEach((result: any, index: number) => {

        // Maneja correctamente la estructura de datos
        // Verifica primero si los datos están en el objeto raíz o en attributes
        const resultado = result.attributes || result;

        // Obtener el ID del controlador - intenta varias opciones
        let controladorId = null;

        // Opción 1: controlador.id
        if (resultado.controlador?.id) {
          controladorId = resultado.controlador.id;
        }
        // Opción 2: controlador.data.id
        else if (resultado.controlador?.data?.id) {
          controladorId = resultado.controlador.data.id;
        }
        // Opción 3: controlador es directamente un ID
        else if (typeof resultado.controlador === 'number') {
          controladorId = resultado.controlador;
        }


        if (controladorId) {
          mapResultados[controladorId] = {
            id: result.id || resultado.id,
            documentId: resultado.documentId || String(result.id || resultado.id),
            tipo: resultado.tipo,
            controladorId,
          };
        } else {
          console.warn(`  Resultado #${index} omitido: no tiene controladorId válido`);
        }
      });


      setResultados(mapResultados);
    } catch (error: any) {
      console.error("Error cargando resultados:", error);
      console.error("Mensaje de error:", error.message);
      if (error.response) {
        console.error("Datos de respuesta:", error.response.data);
        console.error("Estado de respuesta:", error.response.status);
      }
    }
  };

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      refreshResultados();
    }
  }, []);

  return (
    <ResultadosContext.Provider value={{ resultados, setResultados, refreshResultados }}>
      {children}
    </ResultadosContext.Provider>
  );
};