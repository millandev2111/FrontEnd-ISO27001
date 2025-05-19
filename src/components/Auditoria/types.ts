// @/components/auditoria/types.ts
export interface Usuario {
    id: number;
    username: string;
    email: string;
}

export interface Controlador {
    id: number;
    code: string;
    title: string;
    ask: string;
    description: string;
    type: string;
}

export interface ResultadoControlador {
    id?: number;
    tipo: string;
    comentario: string;
    evidencias?: string[];
    fechaEvaluacion: string;
    evaluadoPor?: string;
    controlador?: number;
    auditoria?: number;
}

export interface Auditoria {
    id: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    state: string;
    users?: Usuario[];
    controladors?: Controlador[];
    documentId?: string;
}