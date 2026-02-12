import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Perfil } from '../types'; // Asegúrate de que la ruta sea correcta

export const exportarUsuariosPDF = (usuarios: Perfil[]) => {
  // Configuración inicial: Landscape (l), milímetros (mm), A4
  const doc = new jsPDF('l', 'mm', 'a4');
  const primaryColor = [0, 255, 153]; // El verde neón de Cezeus

  // --- ENCABEZADO Y LOGO ---
  // Círculo de fondo para el logo
  doc.setFillColor(10, 15, 24);
  doc.circle(20, 20, 10, 'F');
  
  // Texto del logo
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('CZ', 17, 21);

  // Título Principal
  doc.setTextColor(10, 15, 24);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CLUB DEPORTIVO CEZEUS - BASE DE DATOS PERSONAL', 35, 18);
  
  // Subtítulo y Fecha
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('REPORTE INTEGRAL DE PERSONAL Y FICHA MÉDICA', 35, 24);
  
  const fechaGeneracion = new Date().toLocaleString();
  doc.text(`Generado: ${fechaGeneracion}`, 230, 18);

  // --- PREPARACIÓN DE DATOS ---
  const tableRows = usuarios.map(u => [
    [u.primer_apellido, u.segundo_apellido, u.nombre, u.segundo_nombre]
      .filter(Boolean)
      .join(' ')
      .toUpperCase(),
    u.rol,
    u.numero_documento,
    `${u.grupo_sanguineo}${u.factor_rh}`,
    u.eps || 'N/A',
    u.telefono || 'N/A',
    u.email || 'N/A',
    u.fecha_nacimiento || 'N/A'
  ]);

  // --- GENERACIÓN DE TABLA ---
  autoTable(doc, {
    startY: 35,
    head: [['Nombre Completo', 'Rol', 'Documento', 'RH', 'EPS', 'Teléfono', 'Email', 'Nacimiento']],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
      fillColor: primaryColor as [number, number, number], 
      textColor: [10, 15, 24], 
      fontStyle: 'bold' 
    },
    styles: { 
      fontSize: 7, 
      cellPadding: 3,
      overflow: 'linebreak'
    },
    columnStyles: { 
      0: { cellWidth: 50 }, // Nombre
      6: { cellWidth: 40 }  // Email
    },
    didDrawPage: (data) => {
      // Pie de página (opcional)
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(7);
      doc.text(`Página ${data.pageNumber} de ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.getHeight() - 10);
    }
  });

  // --- DESCARGA ---
  doc.save(`Base_Datos_Cezeus_${new Date().getTime()}.pdf`);
};