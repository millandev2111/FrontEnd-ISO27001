// @/components/auditoria/utils.ts
import { Auditoria } from './types';

// Funciones de utilidad para auditoría

export function getProgressColor(progreso: number) {
    if (progreso >= 75) return 'bg-emerald-500';
    if (progreso >= 50) return 'bg-amber-500';
    if (progreso >= 25) return 'bg-orange-500';
    return 'bg-red-500';
}

export function getStatusColor(estado: string) {
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
}

export function getUserNames(auditoria: Auditoria) {
    if (!auditoria.users || auditoria.users.length === 0) return 'Sin usuarios asignados';
    return auditoria.users
        .map((user) => user.username || user.email || 'Usuario desconocido')
        .join(', ');
}

export function slugToTitle(slug: string) {
    if (!slug) return '';
    return slug
        .toString()
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function formatearFecha(fecha: string) {
    if (!fecha) return 'Fecha no disponible';
    
    try {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (e) {
        console.error('Error al formatear fecha:', e);
        return 'Fecha no disponible';
    }
}

export function calcularDiasRestantes(fechaFin: string) {
    if (!fechaFin) return 0;
    
    try {
        return Math.max(0, Math.ceil(
            (new Date(fechaFin).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ));
    } catch (e) {
        console.error('Error al calcular días restantes:', e);
        return 0;
    }
}