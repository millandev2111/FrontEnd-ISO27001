// @/components/Resultados/ExportPDFButton.tsx
import React, { useState } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExportPDFButtonProps {
  auditoriaInfo: {
    id?: string;
    titulo?: string;
    periodo?: string;
    auditor?: string;        // Nombre del auditor
    auditores?: string;      // Equipo de auditores
    aprobador?: string;      // Nombre del aprobador
    descripcion?: string;    // Descripción de la auditoría
  };
  resultados: any[];
  resumen: any;
  onClose?: () => void;
}

const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({
  auditoriaInfo,
  resultados,
  resumen,
  onClose
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleExport = async () => {
    try {
      setIsGenerating(true);
      
      // Importar jsPDF y autoTable directamente cuando se necesitan
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;
      
      // Importar dinámicamente la función generadora de PDF
      const pdfServiceModule = await import('@/services/pdfService');
      const generateAuditPDF = pdfServiceModule.generateAuditPDF;
      
      // Completar información de auditoría
      const infoAuditoria = {
        ...auditoriaInfo,
        // Valores predeterminados para campos opcionales
        auditor: auditoriaInfo.auditor || 'Especialista en Seguridad',
        auditores: auditoriaInfo.auditores || 'Equipo de Seguridad de la Información',
        periodo: auditoriaInfo.periodo || new Date().getFullYear().toString(),
        titulo: auditoriaInfo.titulo || 'Evaluación de Controles ISO 27001'
      };
      
      // Generar el PDF
      const filename = generateAuditPDF(infoAuditoria, resultados, resumen);
      toast.success(`Informe generado exitosamente!`, {
        duration: 5000,
        style: {
          border: '1px solid #0066cc',
          padding: '16px',
          color: '#0066cc'
        },
        icon: '📑'
      });
      
      // Cerrar menú si es necesario
      if (onClose) onClose();
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('Error al generar el informe. Consulta la consola para más detalles.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <button
      onClick={handleExport}
      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
      disabled={isGenerating}
    >
      <Download className="h-4 w-4 mr-2" />
      {isGenerating ? 'Generando informe ...' : 'Descargar informe '}
    </button>
  );
};

export default ExportPDFButton;