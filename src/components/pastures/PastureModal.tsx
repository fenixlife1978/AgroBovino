import React, { useState, useEffect } from 'react';
import { Pasture } from '../../types/livestock';
import { Modal } from '../common/Modal';

interface PastureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pasture: Pasture) => void;
  initialData?: Pasture | null;
}

export const PastureModal: React.FC<PastureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<Pasture>>({
    name: '',
    code: '',
    areaHa: 10.0,
    grassType: 'Brachiaria Brizantha cv. Marandú',
    carryingCapacityUGM: 20,
    status: 'descanso',
    targetRestDays: 30,
    forageEstimateKgM2: 2.5,
    waterSource: 'bebedero_automatico',
    shadePercent: 25,
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: `Potrero Nuevo ${Math.floor(10 + Math.random() * 90)}`,
        code: `POT-${Math.floor(10 + Math.random() * 90)}`,
        areaHa: 12.0,
        grassType: 'Brachiaria Brizantha cv. Marandú',
        carryingCapacityUGM: 24,
        status: 'descanso',
        targetRestDays: 30,
        forageEstimateKgM2: 2.8,
        waterSource: 'bebedero_automatico',
        shadePercent: 25,
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const pastureToSave: Pasture = {
      id: initialData ? initialData.id : `past-${Date.now()}`,
      name: formData.name.trim(),
      code: formData.code?.trim().toUpperCase() || 'POT-X',
      areaHa: Number(formData.areaHa) || 10,
      grassType: formData.grassType || 'Pasto Tropical',
      carryingCapacityUGM: Number(formData.carryingCapacityUGM) || 20,
      status: formData.status || 'descanso',
      daysOccupied: formData.daysOccupied,
      targetRestDays: Number(formData.targetRestDays) || 30,
      forageEstimateKgM2: Number(formData.forageEstimateKgM2) || 2.5,
      waterSource: formData.waterSource || 'bebedero_automatico',
      shadePercent: Number(formData.shadePercent) || 20,
      notes: formData.notes?.trim() || undefined
    };

    onSave(pastureToSave);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Editar Potrero ${initialData.code}` : 'Crear Nuevo Potrero / Cuartel'}
      subtitle="Definición de forraje, capacidad de sustentación y rotación"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Nombre del Potrero *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="ej. Potrero El Trébol"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Código / Identificador *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              placeholder="ej. POT-01"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono uppercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Área Total (Hectáreas) *</label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.areaHa}
              onChange={e => setFormData({ ...formData, areaHa: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Capacidad Máx. (UGM)</label>
            <input
              type="number"
              value={formData.carryingCapacityUGM}
              onChange={e => setFormData({ ...formData, carryingCapacityUGM: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Días Descanso Meta</label>
            <input
              type="number"
              value={formData.targetRestDays}
              onChange={e => setFormData({ ...formData, targetRestDays: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Especie de Pasto / Forraje *</label>
            <input
              type="text"
              required
              value={formData.grassType}
              onChange={e => setFormData({ ...formData, grassType: e.target.value })}
              placeholder="ej. Mombaza, Brachiaria Brizantha, Estrella"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Aforo Estimado (Kg MV / m²)</label>
            <input
              type="number"
              step="0.1"
              value={formData.forageEstimateKgM2}
              onChange={e => setFormData({ ...formData, forageEstimateKgM2: Number(e.target.value) })}
              placeholder="ej. 2.8"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Fuente de Agua</label>
            <select
              value={formData.waterSource}
              onChange={e => setFormData({ ...formData, waterSource: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="bebedero_automatico">Bebedero Automático con Flotador</option>
              <option value="tanque_australiano">Tanque Australiano</option>
              <option value="quebrada">Quebrada / Río Natural</option>
              <option value="represa">Represa / Reservorio</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Cobertura de Sombra (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.shadePercent}
              onChange={e => setFormData({ ...formData, shadePercent: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Estado Inicial</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="descanso">En Descanso</option>
              <option value="ocupado">En Ocupación</option>
              <option value="recuperacion">En Recuperación</option>
              <option value="mantenimiento">En Mantenimiento</option>
              <option value="fertilizacion">Fertilizado / Enmienda</option>
            </select>
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
            {initialData ? 'Actualizar Potrero' : 'Guardar Potrero'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
