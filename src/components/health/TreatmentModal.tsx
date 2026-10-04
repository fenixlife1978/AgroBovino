import React, { useState } from 'react';
import { HealthRecord, Animal } from '../../types/livestock';
import { Modal } from '../common/Modal';
import { AlertTriangle } from 'lucide-react';

interface TreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: HealthRecord) => void;
  animals: Animal[];
  selectedAnimal?: Animal | null;
}

export const TreatmentModal: React.FC<TreatmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  animals,
  selectedAnimal
}) => {
  const [targetType, setTargetType] = useState<'individual' | 'all_herd'>('individual');
  const [animalId, setAnimalId] = useState(selectedAnimal?.id || animals[0]?.id || '');
  const [type, setType] = useState<'vacuna' | 'desparasitacion' | 'tratamiento_clinico' | 'curacion' | 'cirugia'>('tratamiento_clinico');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [diseaseOrReason, setDiseaseOrReason] = useState('Mastitis / Neumonía / Infección');
  const [medicationName, setMedicationName] = useState('Oxitetraciclina L.A. 200mg');
  const [dosage, setDosage] = useState('1 ml por cada 10 kg de peso');
  const [administrationRoute, setRoute] = useState<'intramuscular' | 'subcutanea' | 'intravenosa' | 'intramamaria' | 'oral' | 'topica'>('intramuscular');
  const [batchNumber, setBatchNumber] = useState('LOT-2026-99');
  const [veterinarian, setVeterinarian] = useState('Dr. Medina (Médico Veterinario)');
  const [withdrawalDaysMilk, setWithdrawalDaysMilk] = useState<number>(4);
  const [withdrawalDaysMeat, setWithdrawalDaysMeat] = useState<number>(28);
  const [cost, setCost] = useState<number>(25.0);
  const [notes, setNotes] = useState('');

  const withdrawalDaysMax = Math.max(Number(withdrawalDaysMilk), Number(withdrawalDaysMeat));
  const withdrawalEnd = new Date(date);
  withdrawalEnd.setDate(withdrawalEnd.getDate() + withdrawalDaysMax);
  const withdrawalEndDateStr = withdrawalDaysMax > 0 ? withdrawalEnd.toISOString().split('T')[0] : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const animal = animals.find(a => a.id === animalId) || selectedAnimal;

    const record: HealthRecord = {
      id: `health-${Date.now()}`,
      animalId: targetType === 'individual' ? (animal?.id || 'anim-01') : 'TODOS',
      animalTag: targetType === 'individual' ? (animal?.tagNumber || 'BOVINO') : 'LOTE COMPLETO (Hato General)',
      type,
      date,
      diseaseOrReason,
      medicationName,
      dosage,
      administrationRoute,
      batchNumber: batchNumber.trim() || undefined,
      veterinarian,
      withdrawalDaysMilk: Number(withdrawalDaysMilk),
      withdrawalDaysMeat: Number(withdrawalDaysMeat),
      withdrawalEndDate: withdrawalEndDateStr,
      cost: Number(cost),
      status: 'aplicado',
      notes: notes.trim() || undefined
    };

    onSave(record);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registro de Tratamiento Sanitario & Bioseguridad"
      subtitle="Control de fármacos, vías de administración y periodos de retiro"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        {/* Target Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setTargetType('individual')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              targetType === 'individual' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Animal Individual
          </button>
          <button
            type="button"
            onClick={() => setTargetType('all_herd')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              targetType === 'all_herd' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todo el Hato / Lote Masivo
          </button>
        </div>

        {targetType === 'individual' ? (
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Bovino a Tratar *</label>
            <select
              value={animalId}
              onChange={e => setAnimalId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500 font-mono font-medium"
            >
              {animals.map(a => (
                <option key={a.id} value={a.id}>
                  {a.tagNumber} - {a.name} ({a.category.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
            Tratamiento o vacunación masiva para las <strong className="text-slate-900">{animals.length} cabezas</strong> de la finca.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipo de Actividad *</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500 font-semibold"
            >
              <option value="tratamiento_clinico">Tratamiento Clínico / Antibiótico</option>
              <option value="vacuna">Vacuna Oficial / Preventiva</option>
              <option value="desparasitacion">Desparasitación Interna / Externa</option>
              <option value="curacion">Curación de Herida / Podología</option>
              <option value="cirugia">Procedimiento Quirúrgico</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Fecha de Aplicación *</label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Diagnóstico / Motivo *</label>
            <input
              type="text"
              required
              value={diseaseOrReason}
              onChange={e => setDiseaseOrReason(e.target.value)}
              placeholder="ej. Mastitis Aguda, Fiebre Aftosa, Gabarro"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Nombre del Medicamento *</label>
            <input
              type="text"
              required
              value={medicationName}
              onChange={e => setMedicationName(e.target.value)}
              placeholder="ej. Cefalexina, Ivermectina, Aftogan"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Dosis</label>
            <input
              type="text"
              value={dosage}
              onChange={e => setDosage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Vía de Administración</label>
            <select
              value={administrationRoute}
              onChange={e => setRoute(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500"
            >
              <option value="intramuscular">Intramuscular (IM)</option>
              <option value="subcutanea">Subcutánea (SC)</option>
              <option value="intravenosa">Intravenosa (IV)</option>
              <option value="intramamaria">Intramamaria (Tubo)</option>
              <option value="oral">Oral / Drench</option>
              <option value="topica">Tópica / Baño</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Lote Fármaco</label>
            <input
              type="text"
              value={batchNumber}
              onChange={e => setBatchNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>
        </div>

        {/* WITHDRAWAL PERIOD CONFIG */}
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Control de Inocuidad: Días de Retiro (Withdrawal Period)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">
                Días de Retiro en LECHE (Ordeño)
              </label>
              <input
                type="number"
                min="0"
                value={withdrawalDaysMilk}
                onChange={e => setWithdrawalDaysMilk(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">
                Días de Retiro en CARNE (Faena)
              </label>
              <input
                type="number"
                min="0"
                value={withdrawalDaysMeat}
                onChange={e => setWithdrawalDaysMeat(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono font-bold"
              />
            </div>
          </div>

          {withdrawalEndDateStr && (
            <div className="text-[11px] text-rose-900 font-medium">
              🔒 El animal quedará bloqueado para venta/leche hasta el:{' '}
              <strong className="text-slate-900 font-mono font-bold">{withdrawalEndDateStr}</strong>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Médico Veterinario / Responsable</label>
            <input
              type="text"
              value={veterinarian}
              onChange={e => setVeterinarian(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Costo Tratamiento ($)</label>
            <input
              type="number"
              step="0.5"
              value={cost}
              onChange={e => setCost(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-rose-500"
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
            className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-900/20 transition-all"
          >
            Guardar Tratamiento
          </button>
        </div>
      </form>
    </Modal>
  );
};
