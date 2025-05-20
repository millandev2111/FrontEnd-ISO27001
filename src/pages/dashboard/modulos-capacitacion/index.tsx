import React, { useEffect, useState } from 'react'
import DashboardLayout from '../layout'
import axios from 'axios'

interface Pregunta {
  id: number
  pregunta: string
}

const index = () => {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [respuestas, setRespuestas] = useState<Record<number, string>>({})
  const [nota, setNota] = useState<number | null>(null)
  const [advertencia, setAdvertencia] = useState<string>('')
  const [recomendacion, setRecomendacion] = useState<string>('')
  const [bloqueado, setBloqueado] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    setCargando(true)
    axios.get('http://localhost:1337/api/capacitacions')
      .then(res => {
        setPreguntas(res.data.data)
      })
      .catch(err => {
        console.error('Error cargando preguntas', err)
      })
      .finally(() => {
        setCargando(false)
      })
  }, [])

  const handleChange = (id: number, valor: string) => {
    if (bloqueado) return // no permitir cambios si está bloqueado
    setRespuestas(prev => ({ ...prev, [id]: valor }))
    setAdvertencia('')
  }

  const handleSubmit = () => {
    if (Object.keys(respuestas).length < preguntas.length) {
      setAdvertencia('Por favor responde todas las preguntas antes de calcular la nota.')
      return
    }

    setEnviando(true)
    
    // Simular proceso con un pequeño delay
    setTimeout(() => {
      let total = 0
      preguntas.forEach(p => {
        const respuesta = respuestas[p.id]
        if (respuesta === 'Sí') total += 1
        else if (respuesta === 'Medianamente') total += 0.5
      })

      const notaCalculada = (total / preguntas.length) * 10
      setNota(notaCalculada)

      // Recomendación según el puntaje
      if (notaCalculada < 5) {
        setRecomendacion('Nivel crítico. Es necesario implementar mejoras urgentes.')
      } else if (notaCalculada < 7) {
        setRecomendacion('Se están haciendo esfuerzos, pero aún hay áreas críticas que deben mejorarse.')
      } else if (notaCalculada < 9) {
        setRecomendacion('Buen nivel de cumplimiento. Continúa reforzando los puntos débiles.')
      } else {
        setRecomendacion('Excelente cumplimiento. Sigue así.')
      }

      setBloqueado(true)
      setEnviando(false)
    }, 800)
  }

  const handleReset = () => {
    setRespuestas({})
    setNota(null)
    setRecomendacion('')
    setAdvertencia('')
    setBloqueado(false)
  }

  const todasRespondidas = preguntas.length > 0 && Object.keys(respuestas).length === preguntas.length

  // Función para determinar color según la nota
  const getNotaColor = () => {
    if (nota === null) return 'bg-gray-200'
    if (nota < 5) return 'bg-red-500'
    if (nota < 7) return 'bg-yellow-500'
    if (nota < 9) return 'bg-blue-500'
    return 'bg-green-500'
  }

  // Función para obtener el emoji según la nota
  const getEmoji = () => {
    if (nota === null) return ''
    if (nota < 5) return '😟'
    if (nota < 7) return '😐'
    if (nota < 9) return '🙂'
    return '😄'
  }

  // Calcular el progreso de respuestas
  const progresoRespuestas = preguntas.length > 0 
    ? Math.round((Object.keys(respuestas).length / preguntas.length) * 100) 
    : 0

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Cabecera */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Formulario de Capacitaciones
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Evalúa tus conocimientos y obtén recomendaciones personalizadas
            </p>
          </div>

          {/* Barra de progreso */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso: {progresoRespuestas}%</span>
              <span className="text-sm font-medium text-gray-700">{Object.keys(respuestas).length} de {preguntas.length} preguntas</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progresoRespuestas}%` }}
              ></div>
            </div>
          </div>

          {/* Estado de carga */}
          {cargando ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-lg text-gray-700">Cargando preguntas...</span>
            </div>
          ) : (
            <>
              {/* Formulario de preguntas */}
              <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                {preguntas.map((p, index) => (
                  <div key={p.id} className={`px-6 py-5 ${bloqueado ? 'opacity-80' : 'hover:bg-gray-50'} transition-all duration-200`}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-md font-medium text-gray-900 mb-3">{p.pregunta}</p>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                          {['Sí', 'Medianamente', 'No'].map(opcion => {
                            const isSelected = respuestas[p.id] === opcion;
                            const getOptionColor = () => {
                              if (!isSelected) return '';
                              if (opcion === 'Sí') return 'bg-green-50 border-green-200 text-green-700';
                              if (opcion === 'Medianamente') return 'bg-yellow-50 border-yellow-200 text-yellow-700';
                              return 'bg-red-50 border-red-200 text-red-700';
                            };
                            
                            return (
                              <label 
                                key={opcion} 
                                className={`flex items-center p-3 border rounded-lg transition-all cursor-pointer ${getOptionColor()} ${bloqueado ? 'cursor-not-allowed' : 'hover:shadow-sm'}`}
                              >
                                <input
                                  type="radio"
                                  name={`pregunta-${p.id}`}
                                  value={opcion}
                                  checked={isSelected}
                                  onChange={() => handleChange(p.id, opcion)}
                                  disabled={bloqueado}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-3 font-medium text-gray-500">{opcion}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mensaje de advertencia */}
              {advertencia && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{advertencia}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="mt-6 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleSubmit}
                  disabled={!todasRespondidas || bloqueado || enviando}
                  className={`
                    w-full sm:w-auto flex justify-center items-center px-6 py-3 border border-transparent 
                    text-base font-medium rounded-md shadow-sm text-white 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    ${todasRespondidas && !bloqueado && !enviando 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'}
                    transition-all duration-200
                  `}
                >
                  {enviando ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calculando...
                    </>
                  ) : (
                    'Calcular nota'
                  )}
                </button>

                {bloqueado && (
                  <button
                    onClick={handleReset}
                    className="w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    Intentar de nuevo
                  </button>
                )}
              </div>

              {/* Resultados */}
              {nota !== null && (
                <div className="mt-8 bg-white shadow overflow-hidden rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="text-center">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Resultado de tu evaluación
                      </h3>
                      
                      {/* Indicador visual de nota */}
                      <div className="flex justify-center mb-6">
                        <div className={`flex items-center justify-center h-32 w-32 rounded-full ${getNotaColor()} text-white`}>
                          <div>
                            <div className="text-4xl font-bold">{nota.toFixed(1)}</div>
                            <div className="text-2xl mb-1">{getEmoji()}</div>
                            <div className="text-xs opacity-80">de 10 puntos</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Recomendación */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Recomendación
                        </h4>
                        <p className="text-gray-900">{recomendacion}</p>
                      </div>
                      
                      {/* Acciones adicionales */}
                      <div className="mt-6">
                        <button
                          onClick={() => { /* Función para imprimir o guardar resultados */ }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                          </svg>
                          Guardar resultados
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default index
