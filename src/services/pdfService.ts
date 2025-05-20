// @/services/pdfService.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Genera un informe de auditoría ISO 27001 con diseño profesional
 */
export function generateAuditPDF(auditInfo: any, resultados: any[], resumen: any) {
  // Verificar que estamos en el lado del cliente
  if (typeof window === 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el navegador');
  }

  // Inicializar documento
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Configuración de colores (tuplas de 3 elementos)
  const primaryColor: [number, number, number] = [0, 48, 87]; // Azul oscuro corporativo
  const secondaryColor: [number, number, number] = [0, 106, 167]; // Azul medio
  const accentColor: [number, number, number] = [58, 134, 255]; // Azul brillante
  const grayDark: [number, number, number] = [75, 85, 99]; // Gris oscuro
  const grayLight: [number, number, number] = [229, 231, 235]; // Gris claro
  
  // Función para crear fondos y elementos gráficos
  const drawBackground = () => {
    // Franja superior
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Franja azul secundaria
    doc.setFillColor(...secondaryColor);
    doc.rect(0, 40, pageWidth, 5, 'F');
    
    // Añadir pequeño detalle en la esquina
    doc.setFillColor(...accentColor);
    doc.rect(pageWidth - 20, 0, 20, 10, 'F');
  };
  
  const drawFooter = (pageNum: number) => {
    const totalPages = doc.getNumberOfPages();
    // Línea fina en el pie de página
    doc.setDrawColor(...grayLight);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
    
    // Pie de página con información y número de página
    doc.setFontSize(8);
    doc.setTextColor(...grayDark);
    doc.text(`Informe de Cumplimiento ISO 27001 | Confidencial`, 20, pageHeight - 15);
    doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 40, pageHeight - 15);
  };
  
  // Formateo de fecha
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // ----- PORTADA PROFESIONAL -----
  // Fondo completo de color
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Bloque blanco central
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 60, pageWidth - 40, pageHeight - 120, 3, 3, 'F');
  
  // Bloque de color para el título
  doc.setFillColor(...secondaryColor);
  doc.rect(20, 60, pageWidth - 40, 30, 'F');
  
  // Título principal
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  const title = "INFORME DE AUDITORÍA";
  const subtitle = "ISO/IEC 27001:2022";
  const titleWidth = doc.getStringUnitWidth(title) * 22 / doc.internal.scaleFactor;
  const subtitleWidth = doc.getStringUnitWidth(subtitle) * 16 / doc.internal.scaleFactor;
  
  doc.text(title, (pageWidth - titleWidth)/2, 78);
  doc.setFontSize(16);
  doc.text(subtitle, (pageWidth - subtitleWidth)/2, 85);
  
  // Nombre de la auditoría
  doc.setTextColor(...primaryColor);
  doc.setFontSize(18);
  const auditTitle = auditInfo.titulo || "Evaluación de Controles de Seguridad";
  doc.text(auditTitle, 30, 110, { maxWidth: pageWidth - 60 });
  
  // Información de la auditoría
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...grayDark);
  
  const infoY = 140;
  const infoGap = 20;
  
  // Columna izquierda
  doc.setFont('helvetica', 'bold');
  doc.text("INFORMACIÓN GENERAL", 30, infoY);
  doc.setFont('helvetica', 'normal');
  
  doc.text("Código de Auditoría:", 30, infoY + infoGap);
  doc.setFont('helvetica', 'bold');
  doc.text(auditInfo.id || "N/A", 110, infoY + infoGap);
  doc.setFont('helvetica', 'normal');
  
  doc.text("Periodo Evaluado:", 30, infoY + infoGap*2);
  doc.setFont('helvetica', 'bold');
  doc.text(auditInfo.periodo || new Date().getFullYear().toString(), 110, infoY + infoGap*2);
  doc.setFont('helvetica', 'normal');
  
  doc.text("Fecha de Emisión:", 30, infoY + infoGap*3);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDate(new Date().toISOString()), 110, infoY + infoGap*3);
  doc.setFont('helvetica', 'normal');
  
  // Añadir campo para auditores
  doc.text("Equipo Auditor:", 30, infoY + infoGap*4);
  doc.setFont('helvetica', 'bold');
  doc.text(auditInfo.auditores || "Equipo de Seguridad de la Información", 110, infoY + infoGap*4);
  doc.setFont('helvetica', 'normal');
  
  // Resultado general
  const resultY = infoY + infoGap*5 + 20;
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(30, resultY, pageWidth - 60, 40, 2, 2, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.text("RESULTADO GENERAL", 30 + 10, resultY + 15);
  doc.setFontSize(14);
  doc.setTextColor(...accentColor);
  
  // Porcentaje de cumplimiento destacado
  const porcentajeCumplimiento = resumen?.porcentajeCumplimiento || 0;
  doc.text(`${porcentajeCumplimiento}%`, 30 + 10, resultY + 32);
  
  // Barra de progreso de cumplimiento
  const barStartX = 70;
  const barWidth = pageWidth - 60 - 50;
  const barHeight = 15;
  
  // Fondo de la barra
  doc.setFillColor(220, 220, 220);
  doc.roundedRect(barStartX, resultY + 25 - barHeight/2, barWidth, barHeight, 3, 3, 'F');
  
  // Progreso de la barra (max ancho = barWidth)
  const progressWidth = (porcentajeCumplimiento / 100) * barWidth;
  
  // Color según nivel de cumplimiento
  if (porcentajeCumplimiento >= 75) {
    doc.setFillColor(39, 174, 96); // Verde
  } else if (porcentajeCumplimiento >= 50) {
    doc.setFillColor(241, 196, 15); // Amarillo
  } else {
    doc.setFillColor(231, 76, 60); // Rojo
  }
  
  doc.roundedRect(barStartX, resultY + 25 - barHeight/2, progressWidth, barHeight, 3, 3, 'F');
  
  // Estado
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  let estadoText = "EXCELENTE";
  if (porcentajeCumplimiento < 75 && porcentajeCumplimiento >= 50) {
    estadoText = "ACEPTABLE";
  } else if (porcentajeCumplimiento < 50 && porcentajeCumplimiento >= 25) {
    estadoText = "REGULAR";
  } else if (porcentajeCumplimiento < 25) {
    estadoText = "INSUFICIENTE";
  }
  
  // Solo si hay suficiente espacio en la barra
  if (progressWidth > doc.getStringUnitWidth(estadoText) * 12 / doc.internal.scaleFactor + 10) {
    doc.text(estadoText, barStartX + 10, resultY + 25 + 4);
  }
  
  // Texto en la esquina superior
  doc.setFillColor(0, 0, 0, 0);
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.roundedRect(30, pageHeight - 40, pageWidth - 60, 20, 1, 1, 'S');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text("DOCUMENTO CONFIDENCIAL - USO INTERNO", pageWidth/2, pageHeight - 28, {
    align: 'center'
  });
  
  // ----- RESUMEN EJECUTIVO -----
  doc.addPage();
  drawBackground();
  
  // Título de la sección
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.text('RESUMEN EJECUTIVO', 20, 60);
  
  // Separador
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(1);
  doc.line(20, 65, 70, 65);
  
  // Resumen introductorio
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...grayDark);
  
  const textoIntro = `Este informe presenta los resultados de la evaluación de controles de seguridad de la información según la norma ISO/IEC 27001:2022. La evaluación se realizó durante ${auditInfo.periodo || "el periodo actual"} y abarca ${resumen?.totalControles || 0} controles distribuidos en cuatro dominios principales.`;
  
  doc.text(textoIntro, 20, 80, {
    maxWidth: pageWidth - 40,
    align: 'justify'
  });
  
  // Tabla de métricas clave
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Métricas Clave de Cumplimiento', 20, 100);
  
  // Usar autoTable para la tabla de métricas
  autoTable(doc, {
    startY: 105,
    head: [['Métrica', 'Valor', 'Porcentaje']],
    body: [
      ['Controles evaluados', `${resumen?.evaluados || 0}/${resumen?.totalControles || 0}`, `${resumen?.porcentajeCompletitud || 0}%`],
      ['Controles cumplidos', `${resumen?.cumplidos || 0}/${resumen?.evaluados || 1}`, `${resumen?.porcentajeCumplimiento || 0}%`],
      ['Parcialmente cumplidos', `${resumen?.parciales || 0}`, '-'],
      ['No cumplidos', `${resumen?.noCumplidos || 0}`, '-'],
      ['No aplica', `${resumen?.noAplica || 0}`, '-']
    ],
    headStyles: { 
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 10
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 35 },
      2: { cellWidth: 35 }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });
  
  // Tabla de cumplimiento por dominio
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  const finalY1 = (doc as any).lastAutoTable?.finalY || 180;
  doc.text('Cumplimiento por Dominio', 20, finalY1 + 15);
  
  // Preparar datos
  const dominiosData = [];
  if (resumen && resumen.resultadosPorDominio) {
    for (const [dominio, datos] of Object.entries(resumen.resultadosPorDominio)) {
      if (datos && typeof datos === 'object') {
        const domainData = datos as any;
        dominiosData.push([
          dominio,
          `${domainData.evaluados || 0}/${domainData.total || 0}`,
          `${domainData.cumplidos || 0}/${domainData.evaluados || 1}`,
          `${domainData.porcentaje || 0}%`
        ]);
      }
    }
  }
  
  if (dominiosData.length === 0) {
    dominiosData.push(['Sin datos disponibles', '-', '-', '-']);
  }
  
  // Tabla de dominios
  autoTable(doc, {
    startY: finalY1 + 20,
    head: [['Dominio', 'Evaluados', 'Cumplidos', 'Porcentaje']],
    body: dominiosData,
    headStyles: { 
      fillColor: secondaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 10
    },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });
  
  // Pie de página
  drawFooter(1);
  
  // ----- DETALLE DE CONTROLES -----
  doc.addPage();
  drawBackground();
  
  // Título de la sección
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.text('DETALLE DE CONTROLES EVALUADOS', 20, 60);
  
  // Separador
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(1);
  doc.line(20, 65, 120, 65);
  
  // Texto introductorio
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...grayDark);
  
  const textoControles = `A continuación se presenta el detalle de los ${resultados.length} controles evaluados durante la auditoría, con su estado de cumplimiento y observaciones correspondientes.`;
  
  doc.text(textoControles, 20, 80, {
    maxWidth: pageWidth - 40,
    align: 'justify'
  });
  
  // Preparar datos de resultados
  const resultadosData = [];
  if (Array.isArray(resultados)) {
    for (const resultado of resultados) {
      const control = resultado?.controlData || {};
      
      // Determinar color según estado
      let statusColor = grayDark;
      if (resultado.completado) {
        if (resultado.cumplimiento === 'cumple') {
          statusColor = [39, 174, 96]; // Verde
        } else if (resultado.cumplimiento === 'cumple parcialmente') {
          statusColor = [241, 196, 15]; // Amarillo
        } else if (resultado.cumplimiento === 'no cumple') {
          statusColor = [231, 76, 60]; // Rojo
        }
      }
      
      resultadosData.push([
        control.code || 'N/A',
        control.name || 'Sin nombre',
        control.domain || 'Sin dominio',
        {
          content: resultado.completado ? (resultado.cumplimiento || 'No especificado') : 'Pendiente',
          styles: { textColor: statusColor }
        },
        resultado.observaciones || ''
      ]);
    }
  }
  
  // Si no hay resultados, agregar fila de 'sin datos'
  if (resultadosData.length === 0) {
    resultadosData.push(['N/A', 'No hay controles evaluados', '-', '-', '-']);
  }
  
  // Tabla de resultados
  autoTable(doc, {
    startY: 90,
    head: [['Código', 'Control', 'Dominio', 'Estado', 'Observaciones']],
    body: resultadosData,
    headStyles: { 
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 60 },
      2: { cellWidth: 35 },
      3: { cellWidth: 30 },
      4: { cellWidth: 40 }
    },
    styles: { overflow: 'linebreak', cellPadding: 3 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawPage: (data: any) => {
      // Dibujar fondo y pie de página en cada página
      if (data.pageNumber > 1) { // Solo para páginas adicionales
        drawBackground();
      }
      drawFooter(data.pageNumber);
    }
  });
  
  // ----- CONCLUSIONES Y RECOMENDACIONES -----
  doc.addPage();
  drawBackground();
  
  // Título de la sección
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.text('CONCLUSIONES Y RECOMENDACIONES', 20, 60);
  
  // Separador
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(1);
  doc.line(20, 65, 150, 65);
  
  // Texto introductorio
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...grayDark);
  
  // Sección de conclusiones
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text('Conclusiones', 20, 80);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...grayDark);
  
  const porcentaje = resumen?.porcentajeCumplimiento || 0;
  const evaluados = resumen?.evaluados || 0;
  const total = resumen?.totalControles || 0;
  
  // Estado general según el porcentaje
  let estadoGeneral = "";
  if (porcentaje >= 75) {
    estadoGeneral = "un nivel satisfactorio";
  } else if (porcentaje >= 50) {
    estadoGeneral = "un nivel aceptable";
  } else if (porcentaje >= 25) {
    estadoGeneral = "un nivel que requiere mejoras significativas";
  } else {
    estadoGeneral = "un nivel crítico que requiere atención inmediata";
  }
  
  const conclusionText = 
    `Basado en la evaluación realizada, se ha determinado que la organización ha alcanzado ${estadoGeneral} ` +
    `de cumplimiento (${porcentaje}%) en los controles de seguridad de la información evaluados. ` +
    `\n\nSe han revisado ${evaluados} de ${total} controles de seguridad, ` +
    `lo que representa un ${resumen?.porcentajeCompletitud || 0}% del total de controles aplicables según ISO 27001:2022. ` +
    `\n\nEs importante destacar que este informe representa una instantánea del estado actual de seguridad ` +
    `y debe ser considerado como parte de un proceso continuo de mejora.`;
  
  doc.text(conclusionText, 20, 90, { maxWidth: pageWidth - 40, align: 'justify' });
  
  // Sección de recomendaciones
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text('Recomendaciones', 20, 150);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...grayDark);
  
  // Dominios críticos
  const dominiosCriticos: any[] = [];
  if (resumen && resumen.resultadosPorDominio) {
    for (const [dominio, datos] of Object.entries(resumen.resultadosPorDominio)) {
      const domainData = datos as any;
      if (domainData.porcentaje < 50 && domainData.evaluados > 0) {
        dominiosCriticos.push(dominio);
      }
    }
  }
  
  let recomendacionesTexto = `Se recomienda priorizar las siguientes acciones:\n\n`;
  
  // Si hay dominios con bajo cumplimiento
  if (dominiosCriticos.length > 0) {
    recomendacionesTexto += `1. Priorizar la implementación de controles en los siguientes dominios que presentan bajo nivel de cumplimiento:\n`;
    dominiosCriticos.forEach((dominio, index) => {
      recomendacionesTexto += `   • ${dominio}\n`;
    });
    recomendacionesTexto += '\n';
  }
  
  // Recomendaciones generales
  recomendacionesTexto += 
    `${dominiosCriticos.length > 0 ? '2' : '1'}. Completar la evaluación de los controles pendientes para obtener una visión más completa.\n\n` +
    `${dominiosCriticos.length > 0 ? '3' : '2'}. Establecer un plan de acción con responsables y fechas para remediar los incumplimientos detectados.\n\n` +
    `${dominiosCriticos.length > 0 ? '4' : '3'}. Implementar un programa de concientización en seguridad para todo el personal.\n\n` +
    `${dominiosCriticos.length > 0 ? '5' : '4'}. Planificar una revisión de seguimiento en 3-6 meses para evaluar el progreso.`;
  
  doc.text(recomendacionesTexto, 20, 160, { maxWidth: pageWidth - 40 });
  
  // Pie de página
  const currentPage = doc.getNumberOfPages();
  drawFooter(currentPage);
  
  // ----- SECCIÓN FINAL / FIRMAS -----
  doc.addPage();
  drawBackground();
  
  // Título de la sección
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.text('APROBACIÓN DEL INFORME', 20, 60);
  
  // Separador
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(1);
  doc.line(20, 65, 100, 65);
  
  // Texto introductorio
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...grayDark);
  
  doc.text('El presente informe ha sido elaborado y aprobado por:', 20, 80);
  
  // Sección para firmas
  const firmasY = 100;
  const firmaWidth = (pageWidth - 60) / 2;
  
  // Primera firma
  doc.setDrawColor(...grayLight);
  doc.line(30, firmasY + 40, 30 + firmaWidth - 20, firmasY + 40);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Elaborado por:', 30, firmasY);
  doc.setFont('helvetica', 'normal');
  doc.text(auditInfo.auditor || 'Responsable de Auditoría', 30, firmasY + 10);
  doc.text('Auditor de Seguridad', 30, firmasY + 20);
  doc.text('Fecha: ' + formatDate(new Date().toISOString()), 30, firmasY + 50);
  
  // Segunda firma
  doc.setDrawColor(...grayLight);
  doc.line(30 + firmaWidth, firmasY + 40, 30 + firmaWidth*2 - 20, firmasY + 40);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Aprobado por:', 30 + firmaWidth, firmasY);
  doc.setFont('helvetica', 'normal');
  doc.text(auditInfo.aprobador || 'Director de Seguridad', 30 + firmaWidth, firmasY + 10);
  doc.text('CISO / Director de Seguridad', 30 + firmaWidth, firmasY + 20);
  doc.text('Fecha: ' + formatDate(new Date().toISOString()), 30 + firmaWidth, firmasY + 50);
  
  // Texto de confidencialidad
  doc.setFontSize(9);
  doc.setTextColor(...grayDark);
  doc.setFont('helvetica', 'italic');
  
  const disclaimerY = firmasY + 80;
  doc.text('Confidencialidad y Limitaciones de Responsabilidad', 20, disclaimerY, {align: 'left'});
  
  const disclaimerText = 
    `Este informe y la información contenida en él son confidenciales y están destinados únicamente al uso interno ` +
    `de la organización. No debe ser distribuido a terceros sin autorización previa por escrito. ` +
    `\n\nLos resultados presentados reflejan la situación en el momento de la evaluación y deben interpretarse dentro ` +
    `del contexto y alcance definidos para esta auditoría. La implementación de las recomendaciones debe ser ` +
    `evaluada en el contexto de los requisitos específicos de la organización y el análisis de riesgos correspondiente.`;
  
  doc.text(disclaimerText, 20, disclaimerY + 10, {maxWidth: pageWidth - 40, align: 'justify'});
  
  // Pie de página
  drawFooter(doc.getNumberOfPages());
  
  // Guardar el PDF
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `Informe_ISO27001_${dateStr}.pdf`;
  doc.save(filename);
  
  return filename;
}
