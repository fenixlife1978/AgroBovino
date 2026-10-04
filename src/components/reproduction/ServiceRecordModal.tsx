import React, { useState } from 'react';
import { ReproductionEvent, Animal, SemenStraw } from '../../types/livestock';
import { Modal } from '../common/Modal';
import { calculateExpectedCalvingDate } from '../../utils/livestockCalculators';

interface ServiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: ReproductionEvent) => void;
  females: Animal[];
  semenStraws: SemenStraw[];
  selectedAnimal?: Animal | null;
}

export const ServiceRecordModal: React.FC<ServiceRecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  females,
  semenStraws,
  selectedAnimal
}) => {
  const [animalId, setAnimalId] = useState(selectedAnimal?.id || females[0]?.id || '');
  const [eventType, setEventType] = useState<'celo' | 'servicio_ia' | 'monta_natural' | 'palpacion' | 'ecografia' | 'secado'>('servicio_ia');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sireTagOrStraw, setSireTagOrStraw] = useState(semenStraws[0]?.bullName || '');
  const [inseminator, setInseminator] = useState('Carlos Mendoza (Técnico IA)');
  const [pregnancyStatus, setPregnancyStatus] = useState<'positivo' | 'negativo' | 'dudoso'>('positivo');
  const [estimatedGestationDays, setEstimatedGestationDays] = useState<number>(45);
  const [dryOffTreatment, setDryOffTreatment] = useState('Pomo intramamario de secado + sellador barrera');
  const [observations, setObservations] = useState('');

  const expectedCalving = eventType === 'servicio_ia'
    ? calculateExpectedCalvingDate(date)
    : (eventType === 'palpacion' || eventType === 'ecografia') && pregnancyStatus === 'positivo'
      ? calculateExpectedCalvingDate(
          cow?.lastServiceDate || date,
          cow?.lastServiceDate ? 283 : Math.max(1, 283 - Number(estimatedGestationDays))
        )
      : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cow = females.find(f => f.id === animalId);
    if (!cow) return;

    const event: ReproductionEvent = {
      id: `rep-${Date.now()}`,
      animalId,
      animalTag: cow.tagNumber,
      eventType,
      date,
      sireTagOrStraw: eventType === 'servicio_ia' || eventType === 'monta_natural' ? sireTagOrStraw : undefined,
      inseminator: eventType === 'servicio_ia' || eventType === 'ecografia' || eventType === 'palpacion' ? inseminator : undefined,
      pregnancyStatus: eventType === 'palpacion' || eventType === 'ecografia' ? pregnancyStatus : undefined,
      estimatedGestationDays: (eventType === 'palpacion' || eventType === 'ecografia') && pregnancyStatus === 'positivo' ? Number(estimatedGestationDays) : undefined,
      expectedCalvingDate: (eventType === 'servicio_ia' || (eventType === 'palpacion' && pregnancyStatus === 'positivo')) ? expectedCalving : undefined,
      dryOffTreatment: eventType === 'secado' ? dryOffTreatment : undefined,
      observations: observations.trim() || undefined
    };

    onSave(event);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registro Reproductivo & Ginecológico"
      subtitle="Celo, Inseminación Artificial (IA), Diagnóstico de Gestación o Secado"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Hembra / Vaca *</label>
            <select
              value={animalId}
              onChange={e => setAnimalId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 font-medium"
            >
              {females.map(cow => (
                <option key={cow.id} value={cow.id}>
                  {cow.tagNumber} - {cow.name} ({cow.breed}) [{cow.reproductiveStatus.toUpperCase()}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipo de Evento *</label>
            <select
              value={eventType}
              onChange={e => setEventType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 font-semibold"
            >
              <option value="servicio_ia">Inseminación Artificial (IA)</option>
              <option value="celo">Detección de Celo Natural</option>
              <option value="monta_natural">Monta Natural Dirigida</option>
              <option value="ecografia">Ecografía Ultrasónica (Diagnóstico Gestación)</option>
              <option value="palpacion">Palpación Rectal Ginecológica</option>
              <option value="secado">Secado Programado de Lactancia</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Fecha del Evento *</label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {(eventType === 'servicio_ia' || eventType === 'monta_natural') && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Toro Donante / Pajilla del Termo *
              </label>
              <select
                value={sireTagOrStraw}
                onChange={e => setSireTagOrStraw(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 font-mono"
              >
                {semenStraws.map(s => (
                  <option key={s.id} value={s.bullName}>
                    {s.bullName} ({s.breed}) • {s.quantityAvailable} pajillas disp.
                  </option>
                ))}
              </select>
            </div>
          )}

          {(eventType === 'palpacion' || eventType === 'ecografia') && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Diagnóstico de Preñez *</label>
              <select
                value={pregnancyStatus}
                onChange={e => setPregnancyStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 font-bold"
              >
                <option value="positivo">PREÑADA / GESTANTE (+)</option>
                <option value="negativo">VACÍA / ABIERTA (-)</option>
                <option value="dudoso">DUDOSO / REPETIR EN 15 DÍAS</option>
              </select>
            </div>
          )}
        </div>

        {/* Projection Info */}
        {(eventType === 'servicio_ia' || (eventType === 'ecografia' && pregnancyStatus === 'positivo')) && (
          <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-xl flex items-center justify-between text-xs text-purple-900">
            <span className="font-medium">Fecha proyectada de parto (283 días gestación):</span>
            <strong className="text-purple-800 font-mono text-sm bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200">
              {expectedCalving}
            </strong>
          </div>
        )}

        {eventType === 'secado' && (
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tratamiento de Secado</label>
            <input
              type="text"
              value={dryOffTreatment}
              onChange={e => setDryOffTreatment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500"
            />
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Técnico / Inseminador / Veterinario</label>
          <input
            type="text"
            value={inseminator}
            onChange={e => setInseminator(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Observaciones</label>
          <textarea
            rows={2}
            value={observations}
            onChange={e => setObservations(e.target.value)}
            placeholder="Celo matutino, moco claro, hora de inseminación..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 resize-none"
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
            className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm shadow-purple-900/20 transition-all"
          >
            Guardar Evento Reproductivo
          </button>
        </div>
      </form>
    </Modal>
  );
};
