import React, { useState } from 'react';
import { Animal, Pasture } from '../../types/livestock';
import { Modal } from '../common/Modal';
import { ShieldAlert, MoveRight, CheckCircle2 } from 'lucide-react';

interface BatchActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAnimals: Animal[];
  pastures: Pasture[];
  onApplyBatchPastureChange: (targetPastureId: string, newLotName?: string) => void;
  onApplyBatchVaccine: (vaccineName: string, disease: string, dosage: string, vet: string) => void;
}

export const BatchActionModal: React.FC<BatchActionModalProps> = ({
  isOpen,
  onClose,
  selectedAnimals,
  pastures,
  onApplyBatchPastureChange,
  onApplyBatchVaccine
}) => {
  const [actionType, setActionType] = useState<'move_pasture' | 'mass_vaccine'>('move_pasture');
  
  // Move state
  const [targetPastureId, setTargetPastureId] = useState(pastures[0]?.id || '');
  const [newLotName, setNewLotName] = useState('');

  // Vaccine state
  const [vaccineName, setVaccineName] = useState('Vacuna Antiaftosa Bivalente ICA');
  const [disease, setDisease] = useState('Ciclo Oficial Fiebre Aftosa');
  const [dosage, setDosage] = useState('2 ml Vía Subcutánea');
  const [vet, setVet] = useState('Carlos Mendoza (Zootecnista)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actionType === 'move_pasture') {
      onApplyBatchPastureChange(targetPastureId, newLotName);
    } else {
      onApplyBatchVaccine(vaccineName, disease, dosage, vet);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Acción Masiva por Lote (${selectedAnimals.length} Bovinos Seleccionados)`}
      subtitle="Operación simultánea en manga de manejo o potreros"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-slate-800">
        {/* Selected cattle preview */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
            Bovinos a procesar en lote:
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scroll">
            {selectedAnimals.map((a) => (
              <span
                key={a.id}
                className="text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono text-emerald-700 font-bold shadow-2xs"
              >
                {a.tagNumber} ({a.name.split(' ')[0]})
              </span>
            ))}
          </div>
        </div>

        {/* Action Type Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setActionType('move_pasture')}
            className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
              actionType === 'move_pasture'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MoveRight className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-900">Trasladar de Potrero</div>
              <div className="text-[10px] text-slate-500 font-medium">Rotar a otro potrero o lote</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActionType('mass_vaccine')}
            className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
              actionType === 'mass_vaccine'
                ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-5 h-5 shrink-0 text-sky-600 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-900">Vacunación / Baño</div>
              <div className="text-[10px] text-slate-500 font-medium">Tratamiento sanitario masivo</div>
            </div>
          </button>
        </div>

        {/* Form fields based on action */}
        {actionType === 'move_pasture' ? (
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Potrero de Destino *
              </label>
              <select
                value={targetPastureId}
                onChange={(e) => setTargetPastureId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
              >
                {pastures.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code}) - {p.grassType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nuevo Nombre de Lote (Opcional)
              </label>
              <input
                type="text"
                value={newLotName}
                onChange={(e) => setNewLotName(e.target.value)}
                placeholder="Dejar en blanco para mantener el actual"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nombre del Biológico / Vacuna *
                </label>
                <input
                  type="text"
                  required
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Enfermedad o Motivo *
                </label>
                <input
                  type="text"
                  required
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Dosis y Vía de Aplicación
                </label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Responsable / Aplicador
                </label>
                <input
                  type="text"
                  value={vet}
                  onChange={(e) => setVet(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        )}

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
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/30 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Aplicar a {selectedAnimals.length} Bovinos
          </button>
        </div>
      </form>
    </Modal>
  );
};
