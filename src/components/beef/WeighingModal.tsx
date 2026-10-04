import React, { useState } from 'react';
import { WeightRecord, Animal } from '../../types/livestock';
import { Modal } from '../common/Modal';
import { calculateADG } from '../../utils/livestockCalculators';

interface WeighingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: WeightRecord) => void;
  animals: Animal[];
  weightRecords: WeightRecord[];
  selectedAnimal?: Animal | null;
}

export const WeighingModal: React.FC<WeighingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  animals,
  weightRecords,
  selectedAnimal
}) => {
  const [animalId, setAnimalId] = useState(selectedAnimal?.id || animals[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightKg, setWeightKg] = useState<number>(420);
  const [weighingType, setWeighingType] = useState<'rutina' | 'destete' | 'ingreso_ceba' | 'salida_faena' | 'servicio'>('rutina');
  const [bodyCondition, setBodyCondition] = useState<number>(3.5);
  const [notes, setNotes] = useState('');

  const currentAnimal = animals.find(a => a.id === animalId) || selectedAnimal;
  const priorRecords = weightRecords
    .filter(r => r.animalId === currentAnimal?.id && r.date < date)
    .sort((a, b) => b.date.localeCompare(a.date));
  const latestPriorRecord = priorRecords[0];
  const previousWeight = latestPriorRecord?.weightKg ?? currentAnimal?.weightKg ?? 0;
  const previousDate = latestPriorRecord?.date;
  const daysEstimated = previousDate
    ? Math.max(1, Math.round((new Date(date).getTime() - new Date(previousDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const calculatedADG = calculateADG(Number(weightKg), previousWeight, daysEstimated);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnimal) return;

    const record: WeightRecord = {
      id: `weight-${Date.now()}`,
      animalId: currentAnimal.id,
      animalTag: currentAnimal.tagNumber,
      date,
      weightKg: Number(weightKg),
      previousWeightKg: previousWeight,
      daysBetween: daysEstimated,
      adgKg: calculatedADG,
      weighingType,
      bodyCondition: Number(bodyCondition),
      notes: notes.trim() || undefined
    };

    onSave(record);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registro de Pesaje en Báscula & Ganancia Diaria (GDP)"
      subtitle="Control de evolución ponderal y conversión alimenticia"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Bovino a Pesar *</label>
          <select
            value={animalId}
            onChange={e => setAnimalId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 font-mono font-medium"
          >
            {animals.map(a => (
              <option key={a.id} value={a.id}>
                {a.tagNumber} - {a.name} ({a.category.replace('_', ' ')}) • Peso anterior: {a.weightKg} kg
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Fecha de Pesaje *</label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipo de Pesaje</label>
            <select
              value={weighingType}
              onChange={e => setWeighingType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
            >
              <option value="rutina">Control Rutinario / Mensual</option>
              <option value="destete">Pesaje de Destete</option>
              <option value="ingreso_ceba">Ingreso a Lote de Ceba</option>
              <option value="salida_faena">Salida a Venta / Faena (Frigorífico)</option>
              <option value="servicio">Aptitud para Servicio / Entore</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Nuevo Peso en Báscula (Kg) *</label>
            <input
              type="number"
              step="0.5"
              required
              value={weightKg}
              onChange={e => setWeightKg(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-black text-base focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Condición Corporal (1.0 - 5.0)</label>
            <input
              type="number"
              step="0.25"
              min="1"
              max="5"
              value={bodyCondition}
              onChange={e => setBodyCondition(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Live ADG Calculation Box */}
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Ganancia Estimada (GDP)</span>
            <span className="text-slate-800 font-semibold">
              {weightKg - previousWeight >= 0 ? '+' : ''}{weightKg - previousWeight} kg en {daysEstimated} días
            </span>
          </div>
          <div className="text-right">
            <span className="text-amber-800 text-lg font-black font-mono">
              +{calculatedADG} kg/día
            </span>
            <span className="text-[10px] text-slate-500 block font-medium">
              {calculatedADG >= 0.9 ? '🚀 Excelente' : calculatedADG >= 0.6 ? '👍 Aceptable' : '⚠️ Bajo'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Observaciones</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="ej. Pesaje en ayunas de 12 horas, buena masa muscular"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
          />
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
            className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm shadow-amber-900/20 transition-all"
          >
            Guardar Pesaje
          </button>
        </div>
      </form>
    </Modal>
  );
};
