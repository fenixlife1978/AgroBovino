import React, { useState } from 'react';
import { MilkRecord, Animal } from '../../types/livestock';
import { Modal } from '../common/Modal';

interface MilkRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: MilkRecord) => void;
  milkingCows: Animal[];
  selectedAnimal?: Animal | null;
}

export const MilkRecordModal: React.FC<MilkRecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  milkingCows,
  selectedAnimal
}) => {
  const [recordType, setRecordType] = useState<'individual' | 'bulk_tank'>('individual');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<'manana' | 'tarde' | 'noche' | 'total_dia'>('manana');
  const [animalId, setAnimalId] = useState(selectedAnimal?.id || milkingCows[0]?.id || '');
  const [lotName, setLotName] = useState('Tanque Frío General');
  const [liters, setLiters] = useState<number>(14.5);
  const [fatPercent, setFatPercent] = useState<number>(3.9);
  const [proteinPercent, setProteinPercent] = useState<number>(3.3);
  const [californiaMastitisTest, setCmt] = useState<'negativo' | 'traza' | 'grado_1' | 'grado_2' | 'grado_3'>('negativo');
  const [destination, setDestination] = useState<'venta_planta' | 'queseria' | 'consumo_terneros' | 'descarte_antibiotico'>('venta_planta');
  const [pricePerLiter, setPricePerLiter] = useState<number>(0.53);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cow = milkingCows.find(c => c.id === animalId);

    const record: MilkRecord = {
      id: `milk-${Date.now()}`,
      date,
      shift,
      animalId: recordType === 'individual' ? animalId : undefined,
      animalTag: recordType === 'individual' ? cow?.tagNumber : undefined,
      lotName: recordType === 'bulk_tank' ? lotName : cow?.lotName,
      liters: Number(liters),
      fatPercent: fatPercent ? Number(fatPercent) : undefined,
      proteinPercent: proteinPercent ? Number(proteinPercent) : undefined,
      californiaMastitisTest: recordType === 'individual' ? californiaMastitisTest : undefined,
      destination,
      pricePerLiter: destination === 'venta_planta' || destination === 'queseria' ? Number(pricePerLiter) : 0,
      revenue: (destination === 'venta_planta' || destination === 'queseria') ? Number((liters * pricePerLiter).toFixed(2)) : 0,
      notes: notes.trim() || undefined
    };

    onSave(record);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registro de Producción Lechera & Ordeño"
      subtitle="Control diario de pesaje individual o acopio en tanque frío"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        {/* Toggle Mode */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setRecordType('individual')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              recordType === 'individual' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vaca Individual
          </button>
          <button
            type="button"
            onClick={() => setRecordType('bulk_tank')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              recordType === 'bulk_tank' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tanque General / Acopio
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Fecha</label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Turno de Ordeño</label>
            <select
              value={shift}
              onChange={e => setShift(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="manana">1er Ordeño (Madrugada / Mañana)</option>
              <option value="tarde">2do Ordeño (Tarde)</option>
              <option value="noche">3er Ordeño (Noche)</option>
              <option value="total_dia">Total Consolidado Día</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Litros Producidos *</label>
            <input
              type="number"
              step="0.1"
              required
              value={liters}
              onChange={e => setLiters(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {recordType === 'individual' ? (
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Vaca en Ordeño *</label>
            <select
              value={animalId}
              onChange={e => setAnimalId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              {milkingCows.map(cow => (
                <option key={cow.id} value={cow.id}>
                  {cow.tagNumber} - {cow.name} ({cow.breed}) • {cow.lotName}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanque / Sala Acopio</label>
            <input
              type="text"
              value={lotName}
              onChange={e => setLotName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>
        )}

        {/* Quality metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">% Grasa</label>
            <input
              type="number"
              step="0.05"
              value={fatPercent}
              onChange={e => setFatPercent(Number(e.target.value))}
              placeholder="ej. 3.9"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">% Proteína</label>
            <input
              type="number"
              step="0.05"
              value={proteinPercent}
              onChange={e => setProteinPercent(Number(e.target.value))}
              placeholder="ej. 3.3"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {recordType === 'individual' ? (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">CMT (Test Mastitis)</label>
              <select
                value={californiaMastitisTest}
                onChange={e => setCmt(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value="negativo">Negativo (Sana)</option>
                <option value="traza">Traza</option>
                <option value="grado_1">Grado 1 (Subclínica leve)</option>
                <option value="grado_2">Grado 2 (Moderada)</option>
                <option value="grado_3">Grado 3 (Clínica severa)</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Precio / Litro ($)</label>
              <input
                type="number"
                step="0.01"
                value={pricePerLiter}
                onChange={e => setPricePerLiter(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          )}
        </div>

        {/* Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Destino de la Leche</label>
            <select
              value={destination}
              onChange={e => setDestination(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="venta_planta">Venta a Planta Procesadora / Carro Cisterna</option>
              <option value="queseria">Transformación en Quesería / Derivados</option>
              <option value="consumo_terneros">Consumo Terneros / Sala Cuna</option>
              <option value="descarte_antibiotico">⚠️ Descarte (Por Antibiótico / Mastitis)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Observaciones</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="ej. Temperatura tanque 3.8°C, ubre limpia"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
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
            Guardar Registro de Ordeño
          </button>
        </div>
      </form>
    </Modal>
  );
};
