import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatPriceConfig } from '@/lib/format';

export function exportReportePDF({
  titulo,
  subtitulo,
  columnas,
  filas,
  resumen,
}: {
  titulo: string;
  subtitulo?: string;
  columnas: string[];
  filas: (string | number)[][];
  resumen?: { label: string; value: string }[];
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text(titulo, 14, 20);

  if (subtitulo) {
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(subtitulo, 14, 28);
  }

  // Resumen
  if (resumen && resumen.length > 0) {
    let y = subtitulo ? 34 : 28;
    doc.setFontSize(10);
    resumen.forEach((item) => {
      doc.setTextColor(60, 60, 60);
      doc.text(`${item.label}: ${item.value}`, 14, y);
      y += 6;
    });
  }

  // Tabla
  const startY = resumen && resumen.length > 0 ? 34 + resumen.length * 6 + 4 : subtitulo ? 34 : 28;

  autoTable(doc, {
    head: [columnas],
    body: filas,
    startY,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: 50 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 10, right: 14, bottom: 10, left: 14 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generado el ${new Date().toLocaleString('es-AR')} - Página ${i} de ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(`${titulo.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportComprobantePDF({
  tipo,
  numero,
  fecha,
  cliente,
  items,
  total,
  pagos,
  observaciones,
}: {
  tipo: string;
  numero: string;
  fecha: string;
  cliente: string;
  items: { nombre: string; cantidad: number; precio: number; total: number }[];
  total: number;
  pagos?: { metodo: string; monto: number }[];
  observaciones?: string;
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text(tipo.toUpperCase(), 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`N°: ${numero}`, 14, 28);
  doc.text(`Fecha: ${new Date(fecha).toLocaleString('es-AR')}`, 14, 33);
  doc.text(`Cliente: ${cliente || 'Consumidor Final'}`, 14, 38);

  autoTable(doc, {
    head: [['Producto', 'Cant', 'Precio', 'Total']],
    body: items.map((i) => [
      i.nombre,
      i.cantidad.toString(),
      formatPriceConfig(i.precio),
      formatPriceConfig(i.total),
    ]),
    startY: 44,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text(`TOTAL: ${formatPriceConfig(total)}`, 14, finalY);

  if (pagos && pagos.length > 0) {
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Formas de pago:', 14, finalY + 8);
    pagos.forEach((p, idx) => {
      doc.text(`- ${p.metodo}: ${formatPriceConfig(p.monto)}`, 14, finalY + 14 + idx * 5);
    });
  }

  if (observaciones) {
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Obs: ${observaciones}`, 14, finalY + (pagos ? pagos.length * 5 + 18 : 12));
  }

  doc.save(`${tipo.toLowerCase().replace(/\s+/g, '_')}_${numero}.pdf`);
}
