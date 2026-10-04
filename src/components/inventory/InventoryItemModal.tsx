import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../types/livestock';
import { Modal } from '../common/Modal';

interface InventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  initialData?: InventoryItem | null;
}

export const InventoryItemModal: React.FC<InventoryItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'balanceado_concentrado',
    skuCode: '',
    unit: 'sacos_40kg',
    currentStock: 10,
    minStockAlert: 5,
    unitCost: 25.0,
    expirationDate: '',
    supplier: '',
    location: 'Bodega Principal'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        category: 'balanceado_concentrado',
        skuCode: `INS-${Math.floor(100 + Math.random() * 900)}`,
        unit: 'sacos_40kg',
        currentStock: 20,
        minStockAlert: 5,
        unitCost: 28.0,
        expirationDate: '',
        supplier: 'Proveedor Agropecuario',
        location: 'Bodega Principal'
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const itemToSave: InventoryItem = {
      id: initialData ? initialData.id : `inv-${Date.now()}`,
      name: formData.name.trim(),
      category: formData.category || 'balanceado_concentrado',
      skuCode: formData.skuCode?.trim().toUpperCase() || 'INS-00',
      unit: formData.unit || 'unidades',
      currentStock: Number(formData.currentStock) || 0,
      minStockAlert: Number(formData.minStockAlert) || 0,
      unitCost: Number(formData.unitCost) || 0,
      expirationDate: formData.expirationDate || undefined,
      supplier: formData.supplier?.trim() || undefined,
      location: formData.location?.trim() || undefined
    };

    onSave(itemToSave);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Editar Insumo ${initialData.name}` : 'Registrar Nuevo Insumo en Bodega'}
      subtitle="Control de stock de alimentos, suplementos, fármacos y materiales"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Nombre del Insumo / Producto *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="ej. Concentrado Lechero 18% Proteína"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Categoría *</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="balanceado_concentrado">Concentrado / Balanceado</option>
              <option value="silo_heno">Silo / Heno / Forraje Conservado</option>
              <option value="sal_mineral">Sal Mineralizada / Bloque</option>
              <option value="medicamento">Medicamento / Antibiótico</option>
              <option value="vacuna">Vacuna / Biológico</option>
              <option value="pajilla_semen">Pajilla de Semen</option>
              <option value="arete_identificacion">Arete / Botón RFID</option>
              <option value="herramienta_insumo">Herramienta / Insumo General</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Código SKU / Lote</label>
            <input
              type="text"
              value={formData.skuCode}
              onChange={e => setFormData({ ...formData, skuCode: e.target.value })}
              placeholder="ej. CONC-18P"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono uppercase focus:bg-white focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Unidad de Medida *</label>
            <select
              value={formData.unit}
              onChange={e => setFormData({ ...formData, unit: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="sacos_40kg">Sacos (40 kg)</option>
              <option value="kg">Kilogramos (Kg)</option>
              <option value="toneladas">Toneladas (Ton)</option>
              <option value="frascos">Frascos / Botellas</option>
              <option value="dosis">Dosis</option>
              <option value="pajillas">Pajillas</option>
              <option value="unidades">Unidades</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Costo Unitario ($) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.unitCost}
              onChange={e => setFormData({ ...formData, unitCost: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Stock Actual *</label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.currentStock}
              onChange={e => setFormData({ ...formData, currentStock: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-black focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Alerta Stock Mínimo *</label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.minStockAlert}
              onChange={e => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-amber-700 font-mono font-bold focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Fecha de Caducidad</label>
            <input
              type="date"
              value={formData.expirationDate || ''}
              onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Proveedor Habitual</label>
            <input
              type="text"
              value={formData.supplier || ''}
              onChange={e => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="ej. Distribuidora Agropecuaria El Ganadero"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Ubicación en Finca</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              placeholder="ej. Bodega Principal / Silo 2 / Nevera Botiquín"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
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
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/30 transition-all"
          >
            {initialData ? 'Guardar Cambios' : 'Registrar Insumo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
