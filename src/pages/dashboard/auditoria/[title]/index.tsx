import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../layout';
import { 
  ArrowLeft, Calendar, User, ClipboardCheck, Save,
  Clock, Clipboard, AlertCircle, CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { useResultados } from '@/context/ResultadosContext';

// Interfaces simplificadas
interface Usuario {
    id: number;
    username: string;
    email: string;
}

interface Controlador {
    id: number;
    code: string;
    title: string;
    ask: string;
    description: string;
    type: string;
}

interface ResultadoControlador {
    id?: number;
    tipo: string;
    comentario: string;
    evidencias?: string[];
    fechaEvaluacion: string;
    evaluadoPor?: string;
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
}

const AuditoriaDetalle = () => {
    const router = useRouter();
    const { title } = router.query;
    // Usamos useResultados, pero solo obtenemos resultadosGlobales (no la función)
    const { resultados: resultadosGlobales } = useResultados();

    const [auditoria, setAuditoria] = useState<Auditoria | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    const getAuthToken = useCallback(() => {
        if (typeof window === 'undefined') return null;
        
        return (
            localStorage.getItem('jwtToken') ||
            localStorage.getItem('auth_token') ||
            localStorage.getItem('token') ||
            sessionStorage.getItem('jwtToken') ||
            sessionStorage.getItem('auth_token') ||
            sessionStorage.getItem('token') ||
            null
        );
    }, []);

    const slugToTitle = useCallback((slug: string) => {
        if (!slug) return '';
        return slug
            .toString()
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }, []);

    // Función de carga aislada con useCallback para evitar recreaciones
    const fetchAuditoriaData = useCallback(async (titleParam: string) => {
        try {
            setLoading(true);
            setError(null);

            const token = getAuthToken();
            if (!token) throw new Error('No token de autenticación');

            // Aseguramos que titleParam es un string
            const titleStr = Array.isArray(titleParam) ? titleParam[0] : titleParam.toString();
            const titleFromSlug = slugToTitle(titleStr);

            const auditoriaRes = await axios.get('http://localhost:1337/api/auditorias', {
                params: {
                    filters: { title: { $eq: titleFromSlug } },
                    populate: ['users', 'controladors'],
                },
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!auditoriaRes.data.data.length) throw new Error('Auditoría no encontrada');

            const auditoriaData = auditoriaRes.data.data[0];
            const auditoriaObj = auditoriaData.attributes
                ? { id: auditoriaData.id, ...auditoriaData.attributes }
                : auditoriaData;

            setAuditoria(auditoriaObj);
        } catch (err: any) {
            console.error("Error en la carga:", err);
            setError(err.response?.data?.error?.message || err.message || 'Error al cargar la auditoría');
        } finally {
            setLoading(false);
            setInitialLoadDone(true);
        }
    }, [getAuthToken, slugToTitle]);

    // Efecto principal con dependencias explícitas y control
    useEffect(() => {
        // Solo realizar la carga inicial una vez cuando title esté disponible
        if (title && !initialLoadDone) {
            fetchAuditoriaData(title as string);
        }
    }, [title, fetchAuditoriaData, initialLoadDone]);

    const getStatusColor = useCallback((estado: string) => {
        switch (estado?.toLowerCase()) {
            case 'en progreso':
            case 'in_progress':
                return 'bg-amber-100 text-amber-800 border border-amber-300';
            case 'completada':
            case 'completed':
                return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
            case 'pendiente':
            case 'pending':
                return 'bg-slate-100 text-slate-800 border border-slate-300';
            default:
                return 'bg-slate-100 text-slate-800 border border-slate-300';
        }
    }, []);

    const getStatusIcon = useCallback((estado: string) => {
        switch (estado?.toLowerCase()) {
            case 'en progreso':
            case 'in_progress':
                return <Clock className="h-4 w-4 mr-1" />;
            case 'completada':
            case 'completed':
                return <CheckCircle className="h-4 w-4 mr-1" />;
            case 'pendiente':
            case 'pending':
                return <Clipboard className="h-4 w-4 mr-1" />;
            default:
                return <AlertCircle className="h-4 w-4 mr-1" />;
        }
    }, []);

    const getUserNames = useCallback((auditoria: Auditoria) => {
        if (!auditoria.users || auditoria.users.length === 0) return 'Sin usuarios asignados';
        return auditoria.users
            .map((user) => user.username || user.email || 'Usuario desconocido')
            .join(', ');
    }, []);

    // Obtener el progreso usando el contexto global
    const calcularProgreso = useCallback(() => {
        if (!auditoria || !auditoria.controladors || !auditoria.controladors.length) return 0;

        const total = auditoria.controladors.length;
        
        // Contar controladores con resultados
        const evaluados = auditoria.controladors.filter(controlador => {
            try {
                const controladorId = typeof controlador.id === 'number' ? controlador.id : 
                                   controlador.id ? parseInt(controlador.id.toString()) : null;
                return controladorId && resultadosGlobales[controladorId]?.tipo !== undefined;
            } catch (e) {
                return false;
            }
        }).length;

        return Math.round((evaluados / total) * 100);
    }, [auditoria, resultadosGlobales]);

    const getProgressColor = useCallback((progreso: number) => {
        if (progreso >= 75) return 'bg-emerald-500';
        if (progreso >= 50) return 'bg-amber-500';
        if (progreso >= 25) return 'bg-orange-500';
        return 'bg-red-500';
    }, []);
    
    // Componente para el círculo de progreso - Memoizado para evitar recreaciones
    const CircularProgressBar = React.memo(({ percentage }: { percentage: number }) => {
        const circumference = 2 * Math.PI * 40; // Radio = 40
        const strokeDashoffset = circumference - (percentage / 100) * circumference;
        let progressColor;
        
        if (percentage >= 75) progressColor = 'text-emerald-500';
        else if (percentage >= 50) progressColor = 'text-amber-500';
        else if (percentage >= 25) progressColor = 'text-orange-500';
        else progressColor = 'text-red-500';
        
        return (
            <div className="relative h-32 w-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="none" 
                        stroke="#e5e7eb" 
                        strokeWidth="10"
                    />
                    
                    <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className={`${progressColor} transform -rotate-90 origin-center transition-all duration-1000 ease-out`}
                    />
                </svg>
                
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800">{percentage}%</span>
                </div>
            </div>
        );
    });
    
    // Asignar un displayName al componente memoizado
    CircularProgressBar.displayName = 'CircularProgressBar';

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8 bg-slate-50 min-h-full">
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-slate-600 font-medium">Cargando datos de la auditoría...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !auditoria) {
        return (
            <DashboardLayout>
                <div className="p-8 bg-slate-50 min-h-full">
                    <div className="bg-red-50 border border-red-200 shadow-sm text-red-700 px-6 py-4 rounded-xl mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                                <div>
                                    <p className="font-medium text-red-800">Error</p>
                                    <p>{error || 'No se pudo cargar la auditoría'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/dashboard/auditoria')}
                                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                            >
                                Volver
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Cálculos de datos una vez que tenemos la auditoría
    const progreso = calcularProgreso();
    
    // Formato de fechas con manejo de errores
    let fechaInicio = 'Fecha no disponible';
    let fechaFin = 'Fecha no disponible';
    
    try {
        if (auditoria.startDate) {
            fechaInicio = new Date(auditoria.startDate).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
        
        if (auditoria.endDate) {
            fechaFin = new Date(auditoria.endDate).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    } catch (e) {
        console.error('Error al formatear fechas:', e);
    }
    
    // Contar los controles evaluados
    const controlesEvaluados = !auditoria.controladors ? 0 : auditoria.controladors.filter(controlador => {
        try {
            const controladorId = typeof controlador.id === 'number' ? controlador.id : 
                               controlador.id ? parseInt(controlador.id.toString()) : null;
            return controladorId && resultadosGlobales[controladorId]?.tipo !== undefined;
        } catch (e) {
            return false;
        }
    }).length;

    // Calcular días restantes
    let diasRestantes = 0;
    try {
        if (auditoria.endDate) {
            diasRestantes = Math.max(0, Math.ceil(
                (new Date(auditoria.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            ));
        }
    } catch (e) {
        console.error('Error al calcular días restantes:', e);
    }

    return (
        <DashboardLayout>
            <div className="p-8 bg-slate-50 min-h-full">
                {/* Cabecera */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center">
                            <button
                                onClick={() => router.push('/dashboard/auditoria')}
                                className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                                aria-label="Volver"
                            >
                                <ArrowLeft className="h-5 w-5 text-slate-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">{auditoria.title}</h1>
                                <div className="flex items-center text-slate-500 text-sm">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>{fechaInicio} - {fechaFin}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div
                                className={`px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center ${getStatusColor(
                                    auditoria.state || 'pending'
                                )}`}
                            >
                                {getStatusIcon(auditoria.state || 'pending')}
                                {auditoria.state || 'Pendiente'}
                            </div>

                            <button
                                onClick={() => router.push(`/dashboard/auditoria/${title}/evaluate`)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                            >
                                <Save className="h-4 w-4" />
                                <span>Comenzar evaluación</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contenido principal en grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Detalles de la auditoría - 2/3 del ancho */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 lg:col-span-2">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                            <Clipboard className="h-5 w-5 mr-2 text-blue-600" />
                            Detalles de la auditoría
                        </h2>
                        
                        <p className="text-slate-600 mb-6 text-lg leading-relaxed">{auditoria.description || 'Sin descripción'}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-blue-100 p-2 rounded-full">
                                        <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <h3 className="font-medium text-slate-700">Auditores</h3>
                                </div>
                                <p className="text-slate-600 pl-11">{getUserNames(auditoria)}</p>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-blue-100 p-2 rounded-full">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <h3 className="font-medium text-slate-700">Período</h3>
                                </div>
                                <p className="text-slate-600 pl-11">{fechaInicio} - {fechaFin}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta de progreso - 1/3 del ancho */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                            <ClipboardCheck className="h-5 w-5 mr-2 text-blue-600" />
                            Progreso
                        </h2>
                        
                        <div className="flex justify-center mb-4">
                            <CircularProgressBar percentage={progreso} />
                        </div>

                        <div className="text-center">
                            <div className="text-sm font-medium text-slate-600 mb-3">
                                Controles evaluados: {controlesEvaluados} de {auditoria.controladors?.length || 0}
                            </div>
                            
                            <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
                                <div
                                    className={`h-2.5 rounded-full transition-all ${getProgressColor(progreso)}`}
                                    style={{ width: `${progreso}%` }}
                                />
                            </div>

                            <button
                                onClick={() => router.push(`/dashboard/auditoria/${title}/evaluate`)}
                                className="w-full py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors mt-2 font-medium flex items-center justify-center gap-2"
                            >
                                <ClipboardCheck className="h-4 w-4" />
                                <span>Continuar evaluación</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Sección de estadísticas */}
                <div className="bg-white rounded-xl shadow-md p-6 mt-6 border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Resumen de controles</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex items-center justify-between">
                            <div>
                                <p className="text-blue-700 font-medium">Total de controles</p>
                                <p className="text-3xl font-bold text-slate-800">{auditoria.controladors?.length || 0}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <ClipboardCheck className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        
                        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 flex items-center justify-between">
                            <div>
                                <p className="text-emerald-700 font-medium">Evaluados</p>
                                <p className="text-3xl font-bold text-slate-800">
                                    {controlesEvaluados}
                                </p>
                            </div>
                            <div className="bg-emerald-100 p-3 rounded-full">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                        
                        <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 flex items-center justify-between">
                            <div>
                                <p className="text-amber-700 font-medium">Pendientes</p>
                                <p className="text-3xl font-bold text-slate-800">
                                    {(auditoria.controladors?.length || 0) - controlesEvaluados}
                                </p>
                            </div>
                            <div className="bg-amber-100 p-3 rounded-full">
                                <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                        
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 flex items-center justify-between">
                            <div>
                                <p className="text-purple-700 font-medium">Días restantes</p>
                                <p className="text-3xl font-bold text-slate-800">
                                    {diasRestantes}
                                </p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AuditoriaDetalle;