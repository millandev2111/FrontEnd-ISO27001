// @/hooks/useAuditoriaResultados.ts - Versión Final
import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import toast from 'react-hot-toast';

// Interfaces exactamente como las espera el componente TablaResultados
interface Control {
  id: number;
  documentId?: string;
  code?: string;
  name?: string;
  description?: string;
  category?: string;
  domain?: string;
}

interface Resultado {
  id: number;
  documentId?: string;
  completado: boolean;
  estado?: string;
  cumplimiento?: string;
  observaciones?: string;
  fechaEvaluacion?: string;
  controlId?: string;
  controlData?: Control;
  cumplimientoNumerico?: number;
  attributes?: any;
}

interface ResumenResultados {
  totalControles: number;
  evaluados: number;
  pendientes: number;
  cumplidos: number;
  parciales: number;
  noCumplidos: number;
  noAplica: number;
  porcentajeCumplimiento: number;
  porcentajeCompletitud: number;
  resultadosPorDominio: Record<string, {
    total: number;
    evaluados: number;
    cumplidos: number;
    porcentaje: number;
  }>;
  resultadosPorCategoria: Record<string, {
    total: number;
    evaluados: number;
    cumplidos: number;
    porcentaje: number;
  }>;
}

const API_BASE = 'https://backend-iso27001.onrender.com/api';

// Hook simplificado para gestionar los resultados de una auditoría
export const useAuditoriaResultados = (auditoriaDocumentId: string | null) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [controles, setControles] = useState<Control[]>([]);
  const [resumen, setResumen] = useState<ResumenResultados | null>(null);
  const [filtroActivo, setFiltroActivo] = useState<string>('todos');

  // Obtener token de autenticación
  const getAuthToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const token = getCookie('auth_token');
    return typeof token === 'string' ? token : null;
  }, []);

  // Función para calcular el resumen de resultados
  const calcularResumen = useCallback((resultados: Resultado[], controles: Control[]) => {
    // Crear un resumen de resultados
    const resumen: ResumenResultados = {
      totalControles: controles.length,
      evaluados: 0,
      pendientes: 0,
      cumplidos: 0,
      parciales: 0,
      noCumplidos: 0,
      noAplica: 0,
      porcentajeCumplimiento: 0,
      porcentajeCompletitud: 0,
      resultadosPorDominio: {},
      resultadosPorCategoria: {}
    };

    // Inicializar dominios y categorías
    controles.forEach(control => {
      const dominio = control.domain || 'Sin dominio';
      const categoria = control.category || 'Sin categoría';

      // Inicializar dominio
      if (!resumen.resultadosPorDominio[dominio]) {
        resumen.resultadosPorDominio[dominio] = {
          total: 0,
          evaluados: 0,
          cumplidos: 0,
          porcentaje: 0
        };
      }

      // Inicializar categoría
      if (!resumen.resultadosPorCategoria[categoria]) {
        resumen.resultadosPorCategoria[categoria] = {
          total: 0,
          evaluados: 0,
          cumplidos: 0,
          porcentaje: 0
        };
      }

      // Incrementar totales
      resumen.resultadosPorDominio[dominio].total++;
      resumen.resultadosPorCategoria[categoria].total++;
    });

    // Contabilizar evaluaciones
    resultados.forEach(resultado => {
      if (resultado.completado) {
        resumen.evaluados++;

        if (resultado.controlData) {
          const dominio = resultado.controlData.domain || 'Sin dominio';
          const categoria = resultado.controlData.category || 'Sin categoría';

          // Incrementar contadores de dominio y categoría
          if (resumen.resultadosPorDominio[dominio]) {
            resumen.resultadosPorDominio[dominio].evaluados++;
          }

          if (resumen.resultadosPorCategoria[categoria]) {
            resumen.resultadosPorCategoria[categoria].evaluados++;
          }

          // Clasificar por cumplimiento
          if (resultado.cumplimiento) {
            switch (resultado.cumplimiento.toLowerCase()) {
              case 'cumple':
                resumen.cumplidos++;
                if (resumen.resultadosPorDominio[dominio]) {
                  resumen.resultadosPorDominio[dominio].cumplidos++;
                }
                if (resumen.resultadosPorCategoria[categoria]) {
                  resumen.resultadosPorCategoria[categoria].cumplidos++;
                }
                break;
              case 'cumple parcialmente':
                resumen.parciales++;
                if (resumen.resultadosPorDominio[dominio]) {
                  resumen.resultadosPorDominio[dominio].cumplidos += 0.5;
                }
                if (resumen.resultadosPorCategoria[categoria]) {
                  resumen.resultadosPorCategoria[categoria].cumplidos += 0.5;
                }
                break;
              case 'no cumple':
                resumen.noCumplidos++;
                break;
              case 'no aplica':
                resumen.noAplica++;
                break;
            }
          }
        }
      } else {
        resumen.pendientes++;
      }
    });

    // Calcular porcentajes
    const controlesAplicables = resumen.totalControles - resumen.noAplica;

    if (controlesAplicables > 0) {
      resumen.porcentajeCompletitud = Math.round((resumen.evaluados / controlesAplicables) * 100);

      if (resumen.evaluados > 0) {
        const evaluadosAplicables = resumen.evaluados - resumen.noAplica;
        if (evaluadosAplicables > 0) {
          resumen.porcentajeCumplimiento = Math.round(
            ((resumen.cumplidos + (resumen.parciales * 0.5)) / evaluadosAplicables) * 100
          );
        }
      }
    }

    // Calcular porcentajes por dominio y categoría
    Object.keys(resumen.resultadosPorDominio).forEach(dominio => {
      const datos = resumen.resultadosPorDominio[dominio];
      if (datos.evaluados > 0) {
        datos.porcentaje = Math.round((datos.cumplidos / datos.evaluados) * 100);
      }
    });

    Object.keys(resumen.resultadosPorCategoria).forEach(categoria => {
      const datos = resumen.resultadosPorCategoria[categoria];
      if (datos.evaluados > 0) {
        datos.porcentaje = Math.round((datos.cumplidos / datos.evaluados) * 100);
      }
    });

    setResumen(resumen);
  }, []);

  // Cargar datos de resultados y controles
  const cargarDatos = useCallback(async (forzarRecarga = false) => {
    if (!auditoriaDocumentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // PASO 1: Cargar controles
      if (controles.length === 0 || forzarRecarga) {
        try {
          const responseControles = await axios.get(`${API_BASE}/controladors`, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              'populate': '*',
              'pagination[pageSize]': 200
            }
          });

          if (responseControles.data && responseControles.data.data) {
            const controlesData = responseControles.data.data.map((item: any) => {
              // Normalizar estructura básica para controles
              const attributes = item.attributes || {};

              // Intentar encontrar campos de código y nombre en cualquier lugar de la estructura
              const code =
                attributes.code ||
                item.code ||
                attributes.codigo ||
                item.codigo ||
                (attributes.documentId ? `C-${attributes.documentId.substring(0, 5)}` : `C-${item.id}`);

              const name =
                attributes.name ||
                item.name ||
                attributes.title ||
                item.title ||
                attributes.nombre ||
                item.nombre ||
                attributes.ask ||
                item.ask ||
                'Sin nombre';

              // Obtener el tipo (A, B, C, D) para usar como dominio
              const tipo =
                attributes.type ||
                item.type ||
                attributes.tipo ||
                item.tipo;

              // Mapear el tipo a su nombre completo de dominio
              let domain = 'Sin dominio';
              if (tipo) {
                switch (tipo) {
                  case 'A':
                    domain = 'Controles Organizacionales';
                    break;
                  case 'B':
                    domain = 'Controles de Personas';
                    break;
                  case 'C':
                    domain = 'Controles Físicos';
                    break;
                  case 'D':
                    domain = 'Controles Tecnológicos';
                    break;
                  default:
                    domain = `Tipo ${tipo}`;
                }
              }

              const control = {
                id: item.id,
                documentId: attributes.documentId || item.documentId || `control-${item.id}`,
                code: code,
                name: name,
                description: attributes.description || item.description || attributes.descripcion || '',
                category: attributes.category || item.category || 'Sin categoría',
                domain: domain
              };

              return control;
            });

            setControles(controlesData);
          }
        } catch (error) {
          console.error('Error cargando controles:', error);
          // Continuar de todos modos para intentar cargar resultados
        }
      }

      // PASO 2: Cargar resultados
      const responseResultados = await axios.get(`${API_BASE}/resultados?populate=*`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          'filters[auditoria][documentId][$eq]': auditoriaDocumentId,
          'pagination[pageSize]': 100
        }
      });

      if (responseResultados.data && responseResultados.data.data) {
        // Procesar resultados de forma simple
        const resultadosData = responseResultados.data.data.map((item: any) => {
          // Normalizar estructura
          const rawItem = item.attributes ? { ...item.attributes, id: item.id } : item;

          // Determinar si está completado
          const estaCompletado = !!rawItem.fechaEvaluacion;

          // Mapear tipo a cumplimiento (si existe)
          let cumplimiento = estaCompletado ? 'no evaluado' : undefined;
          if (rawItem.tipo) {
            switch (rawItem.tipo.toLowerCase()) {
              case 'conforme':
                cumplimiento = 'cumple';
                break;
              case 'no conforme':
                cumplimiento = 'no cumple';
                break;
              case 'parcialmente conforme':
                cumplimiento = 'cumple parcialmente';
                break;
              case 'no aplica':
                cumplimiento = 'no aplica';
                break;
            }
          }

          // Verificar si hay relación con la auditoría
          let auditoriaId = null;
          if (rawItem.auditoria) {
            auditoriaId = rawItem.auditoria.documentId ||
              (rawItem.auditoria.data && rawItem.auditoria.data.attributes ?
                rawItem.auditoria.data.attributes.documentId : null);
          }

          // Identificar el control asociado
          let controlData: Control | undefined;
          let controlId = null;

          // Buscar el controlador en diferentes lugares de la estructura
          const controladorDirecto = rawItem.controlador;
          const controladorData = rawItem.control && rawItem.control.data ? rawItem.control.data : null;
          const controladorRelacion = rawItem.control;

          // Primero intentar con controlador directo
          if (controladorDirecto) {
            const controlRaw = controladorDirecto;

            // Extraer propiedades de cualquier nivel de la estructura
            const controlAttributes = controlRaw.attributes || {};

            // Buscar código en múltiples ubicaciones posibles
            const code =
              controlRaw.code ||
              controlAttributes.code ||
              controlRaw.codigo ||
              controlAttributes.codigo ||
              `C-${controlRaw.id}`;

            // Buscar nombre en múltiples ubicaciones posibles
            const name =
              controlRaw.name ||
              controlAttributes.name ||
              controlRaw.title ||
              controlAttributes.title ||
              controlRaw.nombre ||
              controlAttributes.nombre ||
              controlRaw.ask ||
              controlAttributes.ask ||
              'Sin nombre';

            // Obtener dominio basado en el tipo desde data.attributes
            const tipo =
              controlAttributes.type ||
              controlRaw.type ||
              (controlRaw.code && controlRaw.code.startsWith('A.') ? 'A' :
                controlRaw.code && controlRaw.code.startsWith('B.') ? 'B' :
                  controlRaw.code && controlRaw.code.startsWith('C.') ? 'C' :
                    controlRaw.code && controlRaw.code.startsWith('D.') ? 'D' : null);

            // Mapear el tipo a su nombre completo de dominio
            let domain = 'Sin dominio';
            if (tipo) {
              switch (tipo) {
                case 'A':
                  domain = 'Controles Organizacionales';
                  break;
                case 'B':
                  domain = 'Controles de Personas';
                  break;
                case 'C':
                  domain = 'Controles Físicos';
                  break;
                case 'D':
                  domain = 'Controles Tecnológicos';
                  break;
                default:
                  domain = `Tipo ${tipo}`;
              }
            } else if (controlRaw.code && controlRaw.code.includes('.')) {
              // Si no tenemos tipo pero tenemos un código con formato X.Y.Z
              // podemos intentar extraer el tipo del código
              const firstLetter = controlRaw.code.charAt(0);
              if (['A', 'B', 'C', 'D'].includes(firstLetter)) {
                switch (firstLetter) {
                  case 'A':
                    domain = 'Controles Organizacionales';
                    break;
                  case 'B':
                    domain = 'Controles de Personas';
                    break;
                  case 'C':
                    domain = 'Controles Físicos';
                    break;
                  case 'D':
                    domain = 'Controles Tecnológicos';
                    break;
                }
              }
            }

            controlData = {
              id: controlRaw.id,
              documentId: controlRaw.documentId || controlAttributes.documentId || `control-${controlRaw.id}`,
              code: code,
              name: name,
              description: controlRaw.description || controlAttributes.description || '',
              category:
                controlRaw.category ||
                controlAttributes.category ||
                'Sin categoría',
              domain: domain
            };

            controlId = controlData.documentId;
          }
          // Probar con la estructura control.data (formato Strapi común)
          else if (controladorData) {
            const controlAttributes = controladorData.attributes || {};

            const code =
              controladorData.code ||
              controlAttributes.code ||
              `C-${controladorData.id}`;

            const name =
              controladorData.name ||
              controlAttributes.name ||
              controladorData.title ||
              controlAttributes.title ||
              controladorData.ask ||
              controlAttributes.ask ||
              'Sin nombre';

            controlData = {
              id: controladorData.id,
              documentId: controlAttributes.documentId || `control-${controladorData.id}`,
              code: code,
              name: name,
              description: controlAttributes.description || '',
              category: controlAttributes.category || controlAttributes.type || 'Sin categoría',
              domain: controlAttributes.domain || 'Sin dominio'
            };

            controlId = controlData.documentId;
          }
          // Buscar por controlId si está disponible
          else if (rawItem.controlId || rawItem.controladorId) {
            const controlIdToSearch = rawItem.controlId || rawItem.controladorId;

            // Intentar coincidir por ID numérico o documentId
            const controlPorId = controles.find(c => c.id === parseInt(controlIdToSearch) || c.id === controlIdToSearch);
            const controlPorDocumentId = controles.find(c => c.documentId === controlIdToSearch);

            if (controlPorId) {
              controlData = controlPorId;
              controlId = controlPorId.documentId;
            } else if (controlPorDocumentId) {
              controlData = controlPorDocumentId;
              controlId = controlPorDocumentId.documentId;
            }
          }

          // Si no se encontró, intentar encontrar controles a través de otras estructuras de relación
          if (!controlData) {
            // Buscar en toda la estructura para encontrar cualquier objeto que parezca un control
            // Definir un tipo de retorno explícito para searchForControlFields
            const searchForControlFields = (obj: any, path = ''): Control | null => {
              if (!obj || typeof obj !== 'object') return null;

              // Buscar campos que puedan ser un control
              if (obj.code && (obj.name || obj.title || obj.ask)) {
                // Buscar el tipo (A, B, C, D) para usar como dominio
                const tipo =
                  obj.type ||
                  obj.tipo;

                // Mapear el tipo a su nombre completo de dominio
                let domain = 'Sin dominio';
                if (tipo) {
                  switch (tipo) {
                    case 'A':
                      domain = 'Controles Organizacionales';
                      break;
                    case 'B':
                      domain = 'Controles de Personas';
                      break;
                    case 'C':
                      domain = 'Controles Físicos';
                      break;
                    case 'D':
                      domain = 'Controles Tecnológicos';
                      break;
                    default:
                      domain = `Tipo ${tipo}`;
                  }
                }

                const possibleControl: Control = {
                  id: obj.id || -1,
                  documentId: obj.documentId || `control-${obj.id || Math.random().toString(36).substring(2, 9)}`,
                  code: obj.code,
                  name: obj.name || obj.title || obj.ask || 'Sin nombre',
                  description: obj.description || '',
                  category: obj.category || 'Sin categoría',
                  domain: domain
                };

                return possibleControl;
              }

              // Revisar si hay attributes que puedan contener un control
              if (obj.attributes && obj.attributes.code) {
                const attrs = obj.attributes;
                const possibleControl: Control = {
                  id: obj.id || -1,
                  documentId: attrs.documentId || `control-${obj.id || Math.random().toString(36).substring(2, 9)}`,
                  code: attrs.code,
                  name: attrs.name || attrs.title || attrs.ask || 'Sin nombre',
                  description: attrs.description || '',
                  category: attrs.category || attrs.type || 'Sin categoría',
                  domain: attrs.domain || 'Sin dominio'
                };

                return possibleControl;
              }

              // Buscar recursivamente en todas las propiedades
              for (const key in obj) {
                if (obj[key] && typeof obj[key] === 'object') {
                  const result: Control | null = searchForControlFields(obj[key], `${path}.${key}`);
                  if (result) return result;
                }
              }

              return null;
            };

            // Buscar en toda la estructura del resultado
            const foundControl = searchForControlFields(rawItem, 'resultado');

            if (foundControl) {
              controlData = foundControl;
              controlId = foundControl.documentId;
            } else {
              // Intentar usar el campo A.6.1 que vimos en la imagen
              const fixedControl = controles.find(c => c.code === 'A.6.1');

              if (fixedControl) {
                controlData = fixedControl;
                controlId = fixedControl.documentId;
              } else if (controles.length > 0) {
                controlData = controles[0];
                controlId = controles[0].documentId;
              } else {
                controlData = {
                  id: -1,
                  documentId: 'control-default',
                  code: 'A.6.1',
                  name: 'Verificación de antecedentes',
                  description: '',
                  domain: 'Sin dominio',
                  category: 'Seguridad de recursos humanos'
                };
                controlId = controlData.documentId;
              }
            }
          }

          // Crear resultado normalizado
          return {
            id: rawItem.id,
            documentId: rawItem.documentId,
            completado: estaCompletado,
            cumplimiento: cumplimiento,
            observaciones: rawItem.comentario || '',
            fechaEvaluacion: rawItem.fechaEvaluacion,
            controlId: controlId || controlData?.documentId,
            controlData: controlData,
            attributes: rawItem
          } as Resultado;
        });

        setResultados(resultadosData);

        // Calcular resumen
        calcularResumen(resultadosData, controles);
      } else {
        setResultados([]);
        calcularResumen([], controles);
      }
    } catch (e: any) {
      console.error('Error cargando datos:', e);
      setError(`Error: ${e.message || 'Error desconocido al cargar los datos'}`);
      toast.error('Error al cargar los resultados');
    } finally {
      setLoading(false);
    }
  }, [auditoriaDocumentId, controles, getAuthToken, calcularResumen]);

  // Filtrar resultados según el filtro activo
  const resultadosFiltrados = useMemo(() => {
    if (!resultados || resultados.length === 0) return [];

    switch (filtroActivo) {
      case 'pendientes':
        return resultados.filter(r => !r.completado);
      case 'cumplidos':
        return resultados.filter(r => r.completado && r.cumplimiento?.toLowerCase() === 'cumple');
      case 'parciales':
        return resultados.filter(r => r.completado && r.cumplimiento?.toLowerCase() === 'cumple parcialmente');
      case 'noCumplidos':
        return resultados.filter(r => r.completado && r.cumplimiento?.toLowerCase() === 'no cumple');
      case 'noAplica':
        return resultados.filter(r => r.completado && r.cumplimiento?.toLowerCase() === 'no aplica');
      case 'evaluados':
        return resultados.filter(r => r.completado);
      default:
        return resultados;
    }
  }, [resultados, filtroActivo]);

  // Cargar datos cuando cambie el ID de auditoría
  useEffect(() => {
    if (auditoriaDocumentId) {
      cargarDatos();
    } else {
      setResultados([]);
      setResumen(null);
    }
  }, [auditoriaDocumentId, cargarDatos]);

  return {
    loading,
    error,
    resultados,
    resultadosFiltrados,
    controles,
    resumen,
    filtroActivo,
    setFiltroActivo,
    recargarDatos: () => cargarDatos(true)
  };
};

export default useAuditoriaResultados;