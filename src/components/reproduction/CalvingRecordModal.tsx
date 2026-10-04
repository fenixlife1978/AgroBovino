import React, { useState } from 'react';
import { ReproductionEvent, Animal, Pasture } from '../../types/livestock';
import { Modal } from '../common/Modal';
import { Baby, CheckCircle2 } from 'lucide-react';

interface CalvingRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCalving: (event: ReproductionEvent, newCalf?: Animal) => void;
  pregnantCows: Animal[];
  pastures: Pasture[];
  selectedAnimal?: Animal | null;
}

export const CalvingRecordModal: React.FC<CalvingRecordModalProps> = ({
  isOpen,
  onClose,
  onSaveCalving,
  pregnantCows,
  pastures,
  selectedAnimal
}) => {
  const [motherId, setMotherId] = useState(selectedAnimal?.id || pregnantCows[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [calvingType, setCalvingType] = useState<'normal' | 'distocico' | 'cesarea' | 'gemelar'>('normal');
  
  // Calf data
  const [autoCreateCalf, setAutoCreateCalf] = useState(true);
  const [calfTag, setCalfTag] = useState(`CRIA-${Math.floor(100 + Math.random() * 900)}`);
  const [calfName, setCalfName] = useState('');
  const [calfSex, setCalfSex] = useState<'M' | 'F'>('F');
  const [calfWeightKg, setCalfWeightKg] = useState<number>(38);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mother = pregnantCows.find(c => c.id === motherId) || selectedAnimal;
    if (!mother) return;

    const event: ReproductionEvent = {
      id: `calv-${Date.now()}`,
      animalId: mother.id,
      animalTag: mother.tagNumber,
      eventType: 'parto',
      date,
      calvingType,
      calfSex,
      calfTag: autoCreateCalf ? calfTag : undefined,
      calfWeightKg: autoCreateCalf ? Number(calfWeightKg) : undefined,
      observations: `Parto ${calvingType}. Cría ${calfSex === 'F' ? 'Hembra' : 'Macho'} ${calfTag}. ${notes}`
    };

    let newCalf: Animal | undefined = undefined;
    if (autoCreateCalf) {
      newCalf = {
        id: `anim-calf-${Date.now()}`,
        tagNumber: calfTag.trim().toUpperCase(),
        name: calfName.trim() || `Cría de ${mother.name}`,
        breed: mother.breed,
        category: calfSex === 'F' ? 'ternera_leche' : 'ternero_cria',
        sex: calfSex,
        birthDate: date,
        weightKg: Number(calfWeightKg),
        bodyCondition: 3.5,
        purpose: mother.purpose,
        reproductiveStatus: 'vacia',
        productionStatus: 'crecimiento',
        pastureId: mother.pastureId || pastures[0]?.id || '',
        lotName: 'Lote Sala Cuna / Terneras',
        damTag: mother.tagNumber,
        sireTag: mother.sireTag || 'Toro Finca',
        geneticOrigin: 'nacido_finca',
        healthStatus: 'sano',
        notes: `Nacimiento registrado. Madre ${mother.tagNumber}. Parto ${calvingType}.`,
        createdAt: new Date().toISOString()
      };
    }

    onSaveCalving(event, newCalf);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registro de Parto & Nacimiento de Cría"
      subtitle="Actualización de lactancia y alta automática del ternero en censo"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Vaca Madre *</label>
            <select
              value={motherId}
              onChange={e => setMotherId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              {pregnantCows.map(cow => (
                <option key={cow.id} value={cow.id}>
                  {cow.tagNumber} - {cow.name} ({cow.breed})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Fecha del Parto *</label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipo de Parto</label>
            <select
              value={calvingType}
              onChange={e => setCalvingType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="normal">Normal / Eutócico (Sin asistencia)</option>
              <option value="distocico">Distócico (Asistido / Complicación)</option>
              <option value="cesarea">Cesárea Quirúrgica</option>
              <option value="gemelar">Parto Gemelar / Mellizos</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Sexo de la Cría</label>
            <select
              value={calfSex}
              onChange={e => setCalfSex(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 font-bold"
            >
              <option value="F">Hembra (Ternera)</option>
              <option value="M">Macho (Ternero)</option>
            </select>
          </div>
        </div>

        {/* Checkbox auto create calf */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoCreateCalf}
              onChange={e => setAutoCreateCalf(e.target.checked)}
              className="rounded bg-white border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <Baby className="w-4 h-4" />
              Ingresar cría automáticamente al Censo Bovino
            </span>
          </label>

          {autoCreateCalf && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Arete Cría *</label>
                <input
                  type="text"
                  required
                  value={calfTag}
                  onChange={e => setCalfTag(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Nombre Cría</label>
                <input
                  type="text"
                  value={calfName}
                  onChange={e => setCalfName(e.target.value)}
                  placeholder="ej. Linda, Morocho"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Peso al Nacer (Kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={calfWeightKg}
                  onChange={e => setCalfWeightKg(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono font-bold"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Observaciones / Calostrado</label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Calostrado en las primeras 2 horas, ombligo desinfectado con yodo al 10%..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 resize-none"
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
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/30 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Registrar Parto y Cría
          </button>
        </div>
      </form>
    </Modal>
  );
};
