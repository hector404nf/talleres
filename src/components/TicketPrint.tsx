'use client';

import { useRef, forwardRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { formatPriceConfig } from '@/lib/format';

interface TicketData {
  titulo: string;
  numero?: string;
  fecha: string;
  cliente?: string;
  items: { nombre: string; cantidad: number; precio: number; total: number }[];
  subtotal?: number;
  descuento?: number;
  total: number;
  pagos?: { forma_pago: string; monto: number }[];
  observaciones?: string;
  pie?: string;
}

const TicketContent = forwardRef<HTMLDivElement, { data: TicketData }>(({ data }, ref) => {
  return (
    <div ref={ref} className="bg-white p-4 w-[80mm] text-xs font-mono text-gray-900" style={{ width: '80mm', minHeight: 'auto' }}>
      <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
        <p className="font-bold text-sm">{data.titulo}</p>
        <p className="text-[10px] text-gray-500">{new Date(data.fecha).toLocaleString('es-AR')}</p>
        {data.numero && <p className="text-[10px]">Nº: {data.numero}</p>}
      </div>

      {data.cliente && (
        <div className="mb-2 text-[10px]">
          <p><strong>Cliente:</strong> {data.cliente}</p>
        </div>
      )}

      <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
        <div className="flex justify-between text-[10px] font-bold mb-1">
          <span className="flex-1">Producto</span>
          <span className="w-8 text-center">Cant</span>
          <span className="w-12 text-right">Total</span>
        </div>
        {data.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-[10px]">
            <span className="flex-1 truncate">{item.nombre}</span>
            <span className="w-8 text-center">{item.cantidad}</span>
            <span className="w-12 text-right">{formatPriceConfig(item.total)}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1 text-[10px]">
        {data.subtotal !== undefined && (
          <div className="flex justify-between"><span>Subtotal:</span><span>{formatPriceConfig(data.subtotal || 0)}</span></div>
        )}
        {data.descuento !== undefined && data.descuento > 0 && (
          <div className="flex justify-between"><span>Descuento:</span><span>-{formatPriceConfig(data.descuento)}</span></div>
        )}
        <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-400 pt-1 mt-1">
          <span>TOTAL:</span>
          <span>{formatPriceConfig(data.total)}</span>
        </div>
      </div>

      {data.pagos && data.pagos.length > 0 && (
        <div className="mt-2 border-t border-dashed border-gray-400 pt-2 text-[10px]">
          <p className="font-bold mb-1">Formas de pago:</p>
          {data.pagos.map((p, idx) => (
            <div key={idx} className="flex justify-between capitalize">
              <span>{p.forma_pago}:</span>
              <span>{formatPriceConfig(p.monto)}</span>
            </div>
          ))}
        </div>
      )}

      {data.observaciones && (
        <div className="mt-2 text-[10px] text-gray-500 italic">{data.observaciones}</div>
      )}

      <div className="mt-4 text-center text-[10px] text-gray-500 border-t border-dashed border-gray-400 pt-2">
        <p>{data.pie || '¡Gracias por su preferencia!'}</p>
      </div>
    </div>
  );
});
TicketContent.displayName = 'TicketContent';

interface TicketPrintProps {
  data: TicketData;
  buttonLabel?: string;
  buttonClassName?: string;
}

export default function TicketPrint({ data, buttonLabel = '🖨️ Imprimir Ticket', buttonClassName = 'px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm' }: TicketPrintProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: data.titulo,
    pageStyle: `
      @page { size: 80mm auto; margin: 0; }
      @media print {
        body { margin: 0; padding: 0; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `,
  });

  return (
    <>
      <button type="button" onClick={handlePrint} className={buttonClassName}>
        {buttonLabel}
      </button>
      <div className="hidden">
        <TicketContent ref={ticketRef} data={data} />
      </div>
    </>
  );
}
