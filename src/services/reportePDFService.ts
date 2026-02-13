import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoCezeus from '../constants/Logo_Cezeus.jpeg';

/**
 * Servicio para generar el reporte oficial del Centro de Estudios Zeus
 * Configurado para mostrar todos los campos de la base de datos de alumnos.
 */
export const generarReporteCEZEUS = async (
  titulo: string = "Reporte de Alumnos",
  datos: any[] = [],
  columnas: { header: string; dataKey: string }[] = []
) => {
  try {
    // 1. Crear documento en orientación Horizontal (Landscape) para mayor espacio
    const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });

    // 2. Insertar Logo de Zeus
    try {
      // Dimensiones: x:14, y:10, ancho:25, alto:25
      doc.addImage(logoCezeus, 'JPEG', 14, 10, 25, 25);
    } catch (e) {
      console.warn("Logo no cargado en el PDF, continuando sin imagen.");
    }

    // 3. Encabezado Institucional
    doc.setFontSize(22);
    doc.setTextColor(22, 160, 133); // Verde Zeus (#16A085)
    doc.setFont('helvetica', 'bold');
    doc.text("CENTRO DE ESTUDIOS ZEUS", 45, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'italic');
    doc.text(titulo.toUpperCase(), 45, 29);
    doc.text(`Fecha de reporte: ${new Date().toLocaleString()}`, 45, 34);

    // 4. Línea decorativa horizontal
    doc.setDrawColor(22, 160, 133);
    doc.setLineWidth(0.5);
    doc.line(14, 38, 283, 38);

    // 5. Generar Tabla con autoTable
    autoTable(doc, {
      startY: 42,
      head: [columnas.map(col => col.header)],
      body: datos.map(item => columnas.map(col => String(item[col.dataKey] || ""))),
      theme: 'striped',
      headStyles: { 
        fillColor: [22, 160, 133], 
        textColor: 255, 
        fontSize: 9, 
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: { 
        fontSize: 8, 
        cellPadding: 3,
        valign: 'middle',
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 28 }, // Documento
        1: { cellWidth: 55 }, // Alumno (Nombre completo)
        2: { cellWidth: 35 }, // Categoría
        3: { cellWidth: 12, halign: 'center' }, // RH
        4: { cellWidth: 30 }, // EPS
        5: { cellWidth: 50 }, // Acudiente
        6: { cellWidth: 35 }, // Contactos
        7: { halign: 'center', fontStyle: 'bold' } // Estado
      },
      margin: { left: 14, right: 14 },
      didParseCell: function (data) {
        // Validación visual de estados: Verde para Activos, Rojo para Inactivos
        if (data.section === 'body' && data.column.index === (columnas.length - 1)) {
          const val = String(data.cell.raw).toUpperCase();
          if (val.includes('ACTIVO')) {
            data.cell.styles.textColor = [39, 174, 96]; // Verde esmeralda
          } else if (val.includes('INACTIVO')) {
            data.cell.styles.textColor = [192, 57, 43]; // Rojo granate
          }
        }
      }
    });

    // 6. Pie de página con numeración
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount} - Centro de Estudios Zeus - Sistema de Gestión Deportiva`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // 7. Guardar/Descargar el archivo
    const nombreLimpio = titulo.replace(/\s+/g, '_').toLowerCase();
    doc.save(`reporte_zeus_${nombreLimpio}.pdf`);

  } catch (error) {
    console.error("Error crítico al generar el PDF:", error);
    alert("No se pudo generar el reporte PDF. Por favor, verifica la consola para más detalles.");
  }
};