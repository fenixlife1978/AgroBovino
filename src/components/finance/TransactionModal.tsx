import React, { useState } from 'react';
import { FinancialTransaction } from '../../types/livestock';
import { Modal } from '../common/Modal';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: FinancialTransaction) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [type, setType] = useState<'ingreso' | 'egreso'>('ingreso');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<any>('venta_leche');
  const [amount, setAmount] = useState<number>(500);
  const [concept, setConcept] = useState('');
  const [quantity, setQuantity] = useState<number | undefined>(undefined);
  const [unitPrice, setUnitPrice] = useState<number | undefined>(undefined);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'cobrado' | 'pagado' | 'pendiente'>('cobrado');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const tx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      date,
      type,
      category,
      amount: Number(amount),
      concept: concept.trim() || `${type === 'ingreso' ? 'Ingreso' : 'Egreso'} por ${category.replace('_', ' ')}`,
      quantity: quantity ? Number(quantity) : undefined,
      unitPrice: unitPrice ? Number(unitPrice) : undefined,
      paymentStatus,
      invoiceNumber: invoiceNumber.trim() || undefined
    };

    onSave(tx);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registro Financiero & Flujo de Caja de Finca"
      subtitle="Ingresos por venta de producción o egresos operativos y de mantenimiento"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        {/* Toggle Type */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => {
              setType('ingreso');
              setCategory('venta_leche');
              setPaymentStatus('cobrado');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'ingreso' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Ingreso (Ventas)
          </button>
          <button
            type="button"
            onClick={() => {
              setType('egreso');
              setCategory('compra_alimento');
              setPaymentStatus('pagado');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'egreso' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            - Egreso (Costos / Gastos)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Fecha *</label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Categoría Contable *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              {type === 'ingreso' ? (
                <>
                  <option value="venta_leche">Venta de Leche Comercial</option>
                  <option value="venta_ganado_pie">Venta de Ganado en Pie (Ceba / Descarte)</option>
                  <option value="venta_ganado_canal">Venta de Ganado en Canal (Frigorífico)</option>
                  <option value="venta_reproductores">Venta de Reproductores / Genética</option>
                  <option value="subproductos_queso">Venta de Quesos y Derivados</option>
                  <option value="otro">Otros Ingresos Agropecuarios</option>
                </>
              ) : (
                <>
                  <option value="compra_alimento">Alimentación (Concentrados, Silos, Sales)</option>
                  <option value="compra_medicamentos">Sanidad (Fármacos, Vacunas, Botiquín)</option>
                  <option value="jornales_personal">Nómina, Jornales y Mayordomía</option>
                  <option value="veterinario_asesoria">Honorarios Asesoría Veterinaria / Zootécnica</option>
                  <option value="mantenimiento_maquinaria">Mantenimiento Maquinaria & Cerca Eléctrica</option>
                  <option value="combustible">Combustible ACPM / Diésel / Gasolina</option>
                  <option value="compra_ganado">Compra de Bovinos / Reposición</option>
                  <option value="servicios_impuestos">Servicios Públicos e Impuestos</option>
                  <option value="otro">Otros Gastos Operativos</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Monto Total ($) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono font-black text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Cantidad (Opcional)</label>
            <input
              type="number"
              step="0.1"
              value={quantity || ''}
              onChange={e => setQuantity(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="ej. 500 L / 5 animales"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Estado de Pago</label>
            <select
              value={paymentStatus}
              onChange={e => setPaymentStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="cobrado">Cobrado / Recibido</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente por Cobrar / Pagar</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Concepto / Detalle *</label>
            <input
              type="text"
              required
              value={concept}
              onChange={e => setConcept(e.target.value)}
              placeholder="ej. Liquidación quincena leche Nestlé"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">No. Factura / Comprobante</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
              placeholder="ej. FAC-00912"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all ${
              type === 'ingreso' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
            }`}
          >
            Registrar Transacción
          </button>
        </div>
      </form>
    </Modal>
  );
};
