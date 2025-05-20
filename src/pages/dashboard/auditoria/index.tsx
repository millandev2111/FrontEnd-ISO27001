import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '../layout'
import { Plus, Search, MoreVertical, Calendar, User, ChevronRight } from 'lucide-react'
import axios from 'axios'
import AuditCreationForm from '@/components/Dashboard/AuditCreationForm'
import { useResultados } from '@/context/ResultadosContext'
import { loadProgress, saveProgress, calculateProgressFromCounts } from '@/utils/progressUtils'
import { getCookie } from 'cookies-next'

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

interface Usuario {
  id: number
  data: {
    id: number
    username: string
    email: string
  }
}

interface Auditoria {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
  state: string
  users?: Usuario[]
  controladors?: Controlador[]
  createdAt: string
  updatedAt: string
  publishedAt: string
  documentId?: string
}

interface StrapiResponse {
  data: Array<{
    id: number
    attributes?: Auditoria
  }> | any[]
  meta?: any
}

interface ProgressState {
  [key: number]: number
}

const AuditoriaPage = () => {
  const router = useRouter()
  const { resultados, refreshResultados } = useResultados()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [auditorias, setAuditorias] = useState<Auditoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [auditoriaProgreso, setAuditoriaProgreso] = useState<ProgressState>({})

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null
    const token = getCookie('auth_token')
    return typeof token === 'string' ? token : null
  }

  useEffect(() => {
    fetchAuditorias()
    refreshResultados()
  }, [])

  const loadAllAuditoriasProgress = useCallback(async (auditoriasToLoad: Auditoria[]) => {
    const progresos: ProgressState = {}

    for (const auditoria of auditoriasToLoad) {
      if (auditoria && auditoria.documentId) {
        const savedProgress = loadProgress(auditoria.documentId)
        if (savedProgress) {
          progresos[auditoria.id] = savedProgress.progreso
        } else {
          try {
            const totalControles = auditoria.controladors?.length || 1
            const progressData = calculateProgressFromCounts(0, totalControles) // Por defecto 0 evaluados aún
            progresos[auditoria.id] = progressData.progreso
            saveProgress(auditoria.documentId, progressData.progreso, progressData.controlesEvaluados)
          } catch (err) {
            console.error(`Error calculando progreso para auditoría ${auditoria.documentId}:`, err)
            progresos[auditoria.id] = 0
          }
        }
      }
    }

    setAuditoriaProgreso(progresos)
  }, [])

  const fetchAuditorias = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = getAuthToken()
      if (!token) throw new Error('No se encontró el token de autenticación')

      const response = await axios.get<StrapiResponse>('https://backend-iso27001.onrender.com/api/auditorias', {
        params: { populate: ['users', 'controladors'] },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      let transformedAuditorias: Auditoria[] = []

      if (Array.isArray(response.data) && response.data.length > 0 && !response.data[0].attributes) {
        transformedAuditorias = response.data
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        transformedAuditorias = response.data.data.map(item => {
          if (!item.attributes) return item
          const { id: _, ...restAttributes } = item.attributes
          return { id: item.id, ...restAttributes }
        })
      } else {
        transformedAuditorias = []
      }

      setAuditorias(transformedAuditorias)

      await loadAllAuditoriasProgress(transformedAuditorias)

      setError(null)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setError('No tienes permisos para acceder a las auditorías. Verifica los permisos en Strapi.')
        } else if (err.response?.status === 401) {
          setError('Token inválido o expirado. Por favor, inicia sesión nuevamente.')
        } else if (err.response?.data?.error?.message) {
          setError(err.response.data.error.message)
        } else {
          setError(`Error HTTP ${err.response?.status}: ${err.response?.statusText || 'Error desconocido'}`)
        }
      } else if (err instanceof Error) setError(err.message)
      else setError('Error desconocido al cargar las auditorías')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'en progreso':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completada':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pendiente':
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressPercentage = (auditoria: Auditoria) => {
    if (auditoria.id && auditoriaProgreso[auditoria.id] !== undefined) {
      return auditoriaProgreso[auditoria.id]
    }

    if (!auditoria.controladors || auditoria.controladors.length === 0) return 0

    const totalControls = auditoria.controladors.length
    let completedControls = 0

    for (const controlador of auditoria.controladors) {
      const controladorId = controlador.id || controlador.data?.id
      if (controladorId) {
        const clave = `${auditoria.id}-${controladorId}`
        const resultado = resultados[clave]
        if (resultado && typeof resultado.tipo === 'string' && resultado.tipo.trim() !== '') {
          completedControls++
        }
      }
    }

    const progreso = Math.round((completedControls / totalControls) * 100)

    if (auditoria.id) {
      setAuditoriaProgreso(prev => ({ ...prev, [auditoria.id]: progreso }))
    }

    return progreso
  }

  const getProgressColor = (progreso: number) => {
    if (progreso >= 75) return 'bg-green-600'
    if (progreso >= 50) return 'bg-yellow-600'
    if (progreso >= 25) return 'bg-orange-600'
    return 'bg-red-600'
  }

  const getUserNames = (auditoria: Auditoria) => {
    if (!auditoria.users || auditoria.users.length === 0) return 'Sin usuarios asignados'

    return auditoria.users
      .map(user => {
        if (user && typeof user === 'object' && user !== null) {
          if ('username' in user && typeof user.username === 'string') return user.username
          if ('email' in user && typeof user.email === 'string') return user.email

          if ('data' in user && typeof user.data === 'object' && user.data !== null) {
            if ('username' in user.data && typeof user.data.username === 'string') return user.data.username
            if ('email' in user.data && typeof user.data.email === 'string') return user.data.email
          }

          if ('attributes' in user && typeof user.attributes === 'object' && user.attributes !== null) {
            if ('username' in user.attributes && typeof user.attributes.username === 'string') return user.attributes.username
            if ('email' in user.attributes && typeof user.attributes.email === 'string') return user.attributes.email
          }
        }
        return 'Usuario desconocido'
      })
      .join(', ')
  }

  const handleAuditCreated = () => {
    fetchAuditorias()
    refreshResultados()
  }

  const navigateToAuditDetail = (auditoria: Auditoria) => {
    router.push(`/dashboard/auditoria/${auditoria.documentId}`)
  }

  const simpleSlugify = (text: string) => {
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }

  const refreshAuditoriaProgress = async (auditoria: Auditoria) => {
    if (auditoria && auditoria.id) {
      try {
        const totalControls = auditoria.controladors?.length || 1
        const completedControls = Object.values(resultados).filter(
          r => r.auditoriaId === auditoria.id && r.tipo && r.tipo.trim() !== ''
        ).length
        const progressData = calculateProgressFromCounts(completedControls, totalControls)

        setAuditoriaProgreso(prev => ({
          ...prev,
          [auditoria.id]: progressData.progreso
        }))

        return progressData.progreso
      } catch (err) {
        console.error(`Error recalculando progreso para auditoría ${auditoria.id}:`, err)
        return getProgressPercentage(auditoria)
      }
    }
    return 0
  }

  const filteredAuditorias = auditorias.filter(auditoria => {
    if (searchTerm && !auditoria.title.toLowerCase().includes(searchTerm.toLowerCase())) return false

    if (filterStatus !== 'todos') {
      const estado = auditoria.state?.toLowerCase() || ''

      if (filterStatus === 'en progreso' && estado !== 'en progreso' && estado !== 'in_progress') return false
      if (filterStatus === 'completadas' && estado !== 'completada' && estado !== 'completed') return false
      if (filterStatus === 'pendientes' && estado !== 'pendiente' && estado !== 'pending') return false
    }

    return true
  })

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 min-h-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Auditorías</h1>
          <p className="text-gray-600">Gestiona y supervisa todas las auditorías de tu organización</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-1 gap-4 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar auditorías..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Nueva Auditoría</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b overflow-x-auto">
            {['todos', 'en progreso', 'completadas', 'pendientes'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  filterStatus === status ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando auditorías...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={fetchAuditorias}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuditorias.map(auditoria => {
              const progreso = getProgressPercentage(auditoria)
              const totalControls = auditoria.controladors?.length || 0
              const completedControls = Math.round((progreso / 100) * totalControls)

              return (
                <div
                  key={auditoria.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigateToAuditDetail(auditoria)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{auditoria.title}</h3>
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={e => {
                          e.stopPropagation()
                        }}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{auditoria.description}</p>

                    <div className="flex items-center gap-2 mb-3 text-gray-600">
                      <User className="h-4 w-4" />
                      <span className="text-sm">{getUserNames(auditoria)}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(auditoria.startDate).toLocaleDateString('es-ES')} -{' '}
                        {new Date(auditoria.endDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>

                    {auditoria.controladors && (
                      <div className="mb-4">
                        <span className="text-sm text-gray-600">{auditoria.controladors.length} controles asignados</span>
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progreso</span>
                        <span className="font-medium">
                          {completedControls} de {totalControls} • {progreso}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progreso)}`}
                          style={{ width: `${progreso}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          auditoria.state || 'pending'
                        )}`}
                      >
                        {auditoria.state || 'Pendiente'}
                      </span>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && !error && filteredAuditorias.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay auditorías</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? 'No se encontraron auditorías con ese término de búsqueda'
                : 'Comienza creando tu primera auditoría'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Auditoría
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <AuditCreationForm
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleAuditCreated}
        />
      )}
    </DashboardLayout>
  )
}

export default AuditoriaPage
