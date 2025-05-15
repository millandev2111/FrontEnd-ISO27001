import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../layout';
import {
    ArrowLeft,
    Calendar,
    User,
    ClipboardCheck,
    AlertTriangle,
    CheckCircle,
    XCircle,
    HelpCircle,
    Save,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import axios from 'axios';

// Interfaces
interface ControladorData {
    id: number;
    code: string;
    title: string;
    ask: string;
    description: string;
    type: string;
}

interface Controlador {
    id: number;
    data: ControladorData;
}

enum ResultadoTipo {
    CONFORME = 'conforme',
    NO_CONFORME = 'no_conforme',
    OBSERVACION = 'observacion',
    NO_APLICA = 'no_aplica',
}

interface ResultadoControlador {
    id?: number;
    tipo: ResultadoTipo;
    comentario: string;
    evidencias?: string[];
    fechaEvaluacion: string;
    evaluadoPor?: string;
}

interface Usuario {
    id: number;
    data: {
        id: number;
        username: string;
        email: string;
    };
}

interface Auditoria {
    id: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    state: string;
    users?: Usuario[];
    controladors?: Controlador[];
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

const AuditoriaDetalle = () => {
    const router = useRouter();
    const { title } = router.query;

    const [auditoria, setAuditoria] = useState<Auditoria | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedControls, setExpandedControls] = useState<{ [key: number]: boolean }>({});
    const [resultados, setResultados] = useState<{ [key: number]: ResultadoControlador }>({});
    const [guardando, setGuardando] = useState(false);
    const [guardadoExitoso, setGuardadoExitoso] = useState(false);

    const getAuthToken = () => {
        return (
            localStorage.getItem('jwtToken') ||
            localStorage.getItem('auth_token') ||
            localStorage.getItem('token') ||
            sessionStorage.getItem('jwtToken') ||
            sessionStorage.getItem('auth_token') ||
            sessionStorage.getItem('token') ||
            null
        );
    };

    // Función para obtener resultados asociados a controladores y auditoría
    const fetchResultados = async (
        auditoriaId: number,
        controladorIds: number[],
        token: string
    ) => {
        const res = await axios.get('http://localhost:1337/api/resultados', {
            params: {
                filters: {
                    controlador: { id: { $in: controladorIds } },
                    auditoria: { id: { $eq: auditoriaId } },
                },
                populate: ['evaluadoPor'],
            },
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data.data;
    };

    const slugToTitle = (slug: string) => {
        return slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const fetchAuditoriaBySlugConverted = async (slug: string) => {
        try {
            setLoading(true);
            setError(null);

            const token = getAuthToken();
            if (!token) throw new Error('No token de autenticación');

            const titleFromSlug = slugToTitle(slug);

            const response = await axios.get('http://localhost:1337/api/auditorias', {
                params: {
                    filters: {
                        title: { $eq: titleFromSlug }
                    },
                    populate: ['users', 'controladors']
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.data.data.length) {
                throw new Error('No se encontró ninguna auditoría con ese título');
            }

            const auditoriaData = response.data.data[0];
            const auditoriaObj = auditoriaData


            setAuditoria(auditoriaObj);

            // 2. Obtener resultados relacionados a controladores de esa auditoría
            const controladorIds = auditoriaObj.controladors?.map((c: any) => c.id) || [];
            if (controladorIds.length > 0) {
                const resultadosData = await fetchResultados(auditoriaObj.id, controladorIds, token);

                const resultadosMap: { [key: number]: ResultadoControlador } = {};
                resultadosData.forEach((r: any) => {
                    const controladorId = r.attributes.controlador.id;
                    resultadosMap[controladorId] = {
                        id: r.id,
                        tipo: r.attributes.tipo,
                        comentario: r.attributes.comentario,
                        evidencias: r.attributes.evidencias,
                        fechaEvaluacion: r.attributes.fechaEvaluacion,
                        evaluadoPor: r.attributes.evaluadoPor?.data?.username || '',
                    };
                });
                setResultados(resultadosMap);
            } else {
                setResultados({});
            }

            setError(null);
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 403) {
                    setError('No tienes permisos para acceder a esta auditoría');
                } else if (err.response?.status === 401) {
                    setError('Token inválido o expirado. Por favor, inicia sesión nuevamente.');
                } else if (err.response?.status === 404) {
                    setError('La auditoría solicitada no existe');
                } else if (err.response?.data?.error?.message) {
                    setError(err.response.data.error.message);
                } else {
                    setError(`Error HTTP ${err.response?.status}: ${err.response?.statusText || 'Error desconocido'}`);
                }
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Error desconocido al cargar la auditoría');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!title) return;

        fetchAuditoriaBySlugConverted(title as string);
    }, [title]);

    const toggleControlExpanded = (controlId: number) => {
        setExpandedControls((prev) => ({
            ...prev,
            [controlId]: !prev[controlId],
        }));
    };

    const handleResultadoChange = (controladorId: number, tipo: ResultadoTipo) => {
        setResultados((prev) => {
            const resultado = prev[controladorId] || {
                tipo: ResultadoTipo.NO_APLICA,
                comentario: '',
                fechaEvaluacion: new Date().toISOString(),
            };

            return {
                ...prev,
                [controladorId]: {
                    ...resultado,
                    tipo,
                },
            };
        });
    };

    const handleComentarioChange = (controladorId: number, comentario: string) => {
        setResultados((prev) => {
            const resultado = prev[controladorId] || {
                tipo: ResultadoTipo.NO_APLICA,
                comentario: '',
                fechaEvaluacion: new Date().toISOString(),
            };

            return {
                ...prev,
                [controladorId]: {
                    ...resultado,
                    comentario,
                },
            };
        });
    };

    const calcularProgreso = () => {
        if (!auditoria || !auditoria.controladors || auditoria.controladors.length === 0) {
            return 0;
        }

        const totalControladores = auditoria.controladors.length;
        const controladoresEvaluados = Object.keys(resultados).length;

        return Math.round((controladoresEvaluados / totalControladores) * 100);
    };

    const guardarResultados = async () => {
        if (!auditoria) return;

        setGuardando(true);
        setGuardadoExitoso(false);

        try {
            const token = getAuthToken();
            if (!token) throw new Error('No se encontró el token de autenticación');

            for (const [controladorId, resultado] of Object.entries(resultados)) {
                const payload = {
                    data: {
                        tipo: resultado.tipo,
                        comentario: resultado.comentario,
                        evidencias: resultado.evidencias || [],
                        fechaEvaluacion: resultado.fechaEvaluacion,
                        evaluadoPor: resultado.evaluadoPor ? { connect: resultado.evaluadoPor } : null,
                        controlador: { connect: Number(controladorId) },
                        auditoria: { connect: auditoria.id },
                    },
                };

                if (resultado.id) {
                    // Actualizar resultado existente
                    await axios.put(`http://localhost:1337/api/resultados/${resultado.id}`, payload, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                } else {
                    // Crear nuevo resultado
                    await axios.post('http://localhost:1337/api/resultados', payload, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                }
            }

            setGuardadoExitoso(true);
            fetchAuditoriaBySlugConverted(auditoria.title);

            setTimeout(() => setGuardadoExitoso(false), 3000);
        } catch (err: any) {
            let errorMsg = 'Error al guardar los resultados';
            if (axios.isAxiosError(err) && err.response?.data?.error?.message) {
                errorMsg = err.response.data.error.message;
            } else if (err instanceof Error) {
                errorMsg = err.message;
            }
            setError(errorMsg);
        } finally {
            setGuardando(false);
        }
    };

    const getResultadoIcon = (tipo: ResultadoTipo) => {
        switch (tipo) {
            case ResultadoTipo.CONFORME:
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case ResultadoTipo.NO_CONFORME:
                return <XCircle className="h-5 w-5 text-red-500" />;
            case ResultadoTipo.OBSERVACION:
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case ResultadoTipo.NO_APLICA:
            default:
                return <HelpCircle className="h-5 w-5 text-gray-400" />;
        }
    };

    const getProgressColor = (progreso: number) => {
        if (progreso >= 75) return 'bg-green-600';
        if (progreso >= 50) return 'bg-yellow-600';
        if (progreso >= 25) return 'bg-orange-600';
        return 'bg-red-600';
    };

    const getUserNames = (auditoria: Auditoria) => {
        if (!auditoria.users || auditoria.users.length === 0) {
            return 'Sin usuarios asignados';
        }

        return auditoria.users
            .map((user) => {
                if (user && typeof user === 'object' && user !== null) {
                    if ('username' in user && typeof user.username === 'string') {
                        return user.username;
                    }
                    if ('email' in user && typeof user.email === 'string') {
                        return user.email;
                    }
                    if ('data' in user && typeof user.data === 'object' && user.data !== null) {
                        if ('username' in user.data && typeof user.data.username === 'string') {
                            return user.data.username;
                        }
                        if ('email' in user.data && typeof user.data.email === 'string') {
                            return user.data.email;
                        }
                    }
                    if ('attributes' in user && typeof user.attributes === 'object' && user.attributes !== null) {
                        if ('username' in user.attributes && typeof user.attributes.username === 'string') {
                            return user.attributes.username;
                        }
                        if ('email' in user.attributes && typeof user.attributes.email === 'string') {
                            return user.attributes.email;
                        }
                    }
                }
                return 'Usuario desconocido';
            })
            .join(', ');
    };

    const getStatusColor = (estado: string) => {
        switch (estado?.toLowerCase()) {
            case 'en progreso':
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'completada':
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pendiente':
            case 'pending':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6 bg-gray-50 min-h-full">
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Cargando datos de la auditoría...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !auditoria) {
        return (
            <DashboardLayout>
                <div className="p-6 bg-gray-50 min-h-full">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Error</p>
                                <p className="text-sm">{error || 'No se pudo cargar la auditoría'}</p>
                            </div>
                            <button
                                onClick={() => router.push('/dashboard/auditoria')}
                                className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                            >
                                Volver
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const progreso = calcularProgreso();

    return (
        <DashboardLayout>
            <div className="p-6 bg-gray-50 min-h-full">
                {/* Cabecera */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div className="flex items-center mb-4 md:mb-0">
                        <button
                            onClick={() => router.push('/dashboard/auditoria')}
                            className="mr-3 p-1 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{auditoria.title}</h1>
                            <p className="text-gray-600">
                                {new Date(auditoria.startDate).toLocaleDateString('es-ES')} -{' '}
                                {new Date(auditoria.endDate).toLocaleDateString('es-ES')}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${getStatusColor(
                                auditoria.state || 'pending'
                            )}`}
                        >
                            {auditoria.state || 'Pendiente'}
                        </span>
                        <button
                            onClick={guardarResultados}
                            disabled={guardando}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${guardando ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                } text-white transition-colors`}
                        >
                            {guardando ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            <span>{guardando ? 'Guardando...' : 'Guardar resultados'}</span>
                        </button>
                    </div>
                </div>

                {guardadoExitoso && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                        <p>Los resultados se han guardado correctamente</p>
                    </div>
                )}

                {/* Detalles de la auditoría */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">Detalles de la auditoría</h2>
                            <p className="text-gray-600 mb-4">{auditoria.description}</p>

                            <div className="flex items-center gap-2 mb-3 text-gray-600">
                                <User className="h-4 w-4" />
                                <span>Auditores: {getUserNames(auditoria)}</span>
                            </div>

                            <div className="flex items-center gap-2 mb-3 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    Período: {new Date(auditoria.startDate).toLocaleDateString('es-ES')} -{' '}
                                    {new Date(auditoria.endDate).toLocaleDateString('es-ES')}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600">
                                <ClipboardCheck className="h-4 w-4" />
                                <span>Controles: {auditoria.controladors?.length || 0}</span>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">Progreso</h2>
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Controles evaluados</span>
                                    <span className="font-medium">{progreso}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className={`h-full rounded-full transition-all ${getProgressColor(progreso)}`}
                                        style={{ width: `${progreso}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Conformes</span>
                                        <span className="font-medium text-green-600">
                                            {Object.values(resultados).filter((r) => r.tipo === ResultadoTipo.CONFORME).length}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">No conformes</span>
                                        <span className="font-medium text-red-600">
                                            {Object.values(resultados).filter((r) => r.tipo === ResultadoTipo.NO_CONFORME).length}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Observaciones</span>
                                        <span className="font-medium text-yellow-600">
                                            {Object.values(resultados).filter((r) => r.tipo === ResultadoTipo.OBSERVACION).length}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">No evaluados</span>
                                        <span className="font-medium text-gray-600">
                                            {(auditoria.controladors?.length || 0) - Object.keys(resultados).length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de controles */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Controles de la auditoría</h2>

                    {(!auditoria.controladors || auditoria.controladors.length === 0) && (
                        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                            <p className="text-gray-600">Esta auditoría no tiene controles asignados</p>
                        </div>
                    )}

                    {auditoria.controladors && auditoria.controladors.length > 0 && (
                        <div className="space-y-4">
                            {auditoria.controladors.map(controlador => {
                                const isExpanded = expandedControls[controlador.id] || false;
                                const resultado = resultados[controlador.id];

                                return (
                                    <div key={controlador.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                        <div
                                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                                            onClick={() => toggleControlExpanded(controlador.id)}
                                        >
                                            <div className="flex items-center">
                                                {resultado && getResultadoIcon(resultado.tipo)}
                                                <span className="ml-2 font-medium">
                                                    {controlador.code} - {controlador.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                {isExpanded ? (
                                                    <ChevronUp className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                                )}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="p-4 border-t border-gray-100">
                                                <div className="mb-4">
                                                    <h3 className="text-sm font-medium text-gray-700 mb-1">Pregunta de control</h3>
                                                    <p className="text-gray-600">{controlador.ask}</p>
                                                </div>

                                                <div className="mb-4">
                                                    <h3 className="text-sm font-medium text-gray-700 mb-1">Descripción</h3>
                                                    <p className="text-gray-600">{controlador.description}</p>
                                                </div>

                                                {/* resto del código */}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AuditoriaDetalle;
