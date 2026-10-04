import React, { useState, useMemo } from 'react';
import { 
  Pasture, 
  Animal, 
  HerdRotationRecord 
} from '../../types/livestock';
import { Modal } from '../common/Modal';
import { 
  MoveRight, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Layers, 
  Calendar, 
  Leaf, 
  Clock, 
  ShieldCheck, 
  ArrowRightCircle, 
  Plus, 
  Minus 
} from 'lucide-react';

interface HerdRotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pastures: Pasture[];
  animals: Animal[];
  onSaveRotation: (rotation: HerdRotationRecord) => void;
  preselectedSourcePastureId?: string;
}

export const HerdRotationModal: React.FC<HerdRotationModalProps> = ({
  isOpen,
  onClose,
  pastures,
  animals,
  onSaveRotation,
  preselectedSourcePastureId
}) => {
  // Extract all active lots
  const lots = useMemo(() => {
    const map = new Map<string, { name: string; count: number; pastureId: string; pastureName: string }>();
    animals.forEach(a => {
      const lot = a.lotName || 'Hato General';
      const past = pastures.find(p => p.id === a.pastureId);
      if (!map.has(lot)) {
        map.set(lot, {
          name: lot,
          count: 1,
          pastureId: a.pastureId,
          pastureName: past?.name || 'Potrero sin asignar'
        });
      } else {
        const item = map.get(lot)!;
        item.count += 1;
      }
    });
    return Array.from(map.values());
  }, [animals, pastures]);

  const [selectedLotName, setSelectedLotName] = useState<string>(lots[0]?.name || 'Lote Ordeño Principal');
  
  // Find current lot info
  const currentLotInfo = lots.find(l => l.name === selectedLotName);
  
  const [sourcePastureId, setSourcePastureId] = useState<string>(
    preselectedSourcePastureId || currentLotInfo?.pastureId || pastures[0]?.id || ''
  );
  
  const [targetPastureId, setTargetPastureId] = useState<string>('');
  const [countedHeads, setCountedHeads] = useState<number>(currentLotInfo?.count || 25);
  const [discrepancyReason, setDiscrepancyReason] = useState<string>('');
  const [responsiblePerson, setResponsiblePerson] = useState<string>('Carlos Mendoza (Capataz) & Marcos Rivas');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [forageState, setForageState] = useState<'optimo' | 'medio' | 'bajo'>('optimo');
  const [notes, setNotes] = useState<string>('');

  // When lot changes, update expected count and source pasture
  const handleLotChange = (lotName: string) => {
    setSelectedLotName(lotName);
    const info = lots.find(l => l.name === lotName);
    if (info) {
      setSourcePastureId(info.pastureId);
      setCountedHeads(info.count);
    }
  };

  const sourcePasture = pastures.find(p => p.id === sourcePastureId);
  const targetPasture = pastures.find(p => p.id === targetPastureId);

  const expectedHeads = useMemo(() => {
    if (selectedLotName) {
      return animals.filter(a => a.lotName === selectedLotName).length;
    }
    return animals.filter(a => a.pastureId === sourcePastureId).length;
  }, [animals, selectedLotName, sourcePastureId]);

  const discrepancy = countedHeads - expectedHeads;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourcePastureId || !targetPastureId || sourcePastureId === targetPastureId) return;

    const rotationRecord: HerdRotationRecord = {
      id: `rot-${Date.now()}`,
      date,
      lotName: selectedLotName,
      sourcePastureId,
      sourcePastureName: sourcePasture?.name || 'Potrero de Origen',
      targetPastureId,
      targetPastureName: targetPasture?.name || 'Potrero de Destino',
      expectedHeads,
      countedHeads,
      discrepancy,
      discrepancyReason: discrepancy !== 0 ? discrepancyReason : undefined,
      responsiblePerson,
      pastureForageState: forageState,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    onSaveRotation(rotationRecord);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rotación de Lote & Conteo en Brocal / Manga"
      subtitle="Traslado de potrero con confirmación formal de cabezas contadas al pasar la puerta"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-slate-800">
        {/* LOT SELECTION & CURRENT POSITION */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Seleccionar Lote / Grupo a Mover *
            </label>
            <select
              value={selectedLotName}
              onChange={e => handleLotChange(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
            >
              {lots.map(l => (
                <option key={l.name} value={l.name}>
                  {l.name} ({l.count} cabezas registradas)
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Ubicación actual: <strong>{sourcePasture?.name || 'Potrero origen'}</strong>
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Fecha del Traslado *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* ROTATION ROUTE: SOURCE -> TARGET */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* SOURCE PADDOCK */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                1. Potrero de Salida (Origen)
              </span>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                Entrará a Descanso
              </span>
            </div>

            <select
              value={sourcePastureId}
              onChange={e => setSourcePastureId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
            >
              {pastures.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name} ({p.grassType})
                </option>
              ))}
            </select>

            {sourcePasture && (
              <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                <div>Área: <strong>{sourcePasture.areaHa} Ha</strong> • Pasto: {sourcePasture.grassType}</div>
                <div>Días ocupado: <strong className="text-amber-700">{sourcePasture.daysOccupied || 1} días</strong></div>
              </div>
            )}
          </div>

          {/* TARGET PADDOCK */}
          <div className="bg-emerald-50/70 border-2 border-emerald-400 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                <MoveRight className="w-3.5 h-3.5 text-emerald-600" />
                2. Potrero de Entrada (Destino) *
              </span>
              <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                Listo para Pastoreo
              </span>
            </div>

            <select
              value={targetPastureId}
              onChange={e => setTargetPastureId(e.target.value)}
              required
              className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-600 shadow-2xs"
            >
              <option value="">-- Seleccionar Potrero Destino --</option>
              {pastures
                .filter(p => p.id !== sourcePastureId)
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name} ({p.areaHa} Ha • {p.grassType} • {p.status.toUpperCase()})
                  </option>
                ))}
            </select>

            {targetPasture && (
              <div className="text-[11px] text-emerald-900 space-y-0.5 pt-1">
                <div>Capacidad: <strong>{targetPasture.carryingCapacityUGM} UGM</strong> • Sombra: {targetPasture.shadePercent}%</div>
                <div>Aforo de forraje estimado: <strong>{targetPasture.forageEstimateKgM2} kg/m²</strong></div>
              </div>
            )}
          </div>
        </div>

        {/* CHUTE / GATE HEAD COUNT (EL CONTEO REAL) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 rounded-2xl space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="font-extrabold text-sm text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Conteo en Manga / Brocal de Puerta
              </h4>
              <p className="text-[11px] text-slate-400">
                Verificación cabeza por cabeza al pasar por el estrecho
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Censo Esperado</span>
              <span className="text-lg font-black text-white font-mono">{expectedHeads} Cabezas</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Counter Controller */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Cabezas Confirmadas al Paso:
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCountedHeads(Math.max(0, countedHeads - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-lg flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="number"
                  min="0"
                  value={countedHeads}
                  onChange={e => setCountedHeads(Number(e.target.value))}
                  className="w-24 text-center bg-slate-800 border-2 border-emerald-500 rounded-xl py-2 text-xl font-black text-emerald-300 font-mono focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => setCountedHeads(countedHeads + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-lg flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
                >
                  <Plus className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setCountedHeads(expectedHeads)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                >
                  Igualar ({expectedHeads})
                </button>
              </div>
            </div>

            {/* Discrepancy Alert */}
            <div>
              {discrepancy === 0 ? (
                <div className="bg-emerald-950/80 border border-emerald-500/50 p-3 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block font-bold">Conteo Exacto (Sin descuadre)</strong>
                    <span className="text-[11px] text-emerald-400/80">Las {countedHeads} cabezas pasaron completas al nuevo potrero.</span>
                  </div>
                </div>
              ) : (
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                  discrepancy < 0 
                    ? 'bg-rose-950/80 border-rose-500/50 text-rose-300' 
                    : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                }`}>
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div>
                    <strong className="block font-bold">
                      {discrepancy < 0 ? `Faltan ${Math.abs(discrepancy)} cabezas` : `Sobran ${discrepancy} cabezas`} en manga
                    </strong>
                    <span className="text-[11px] opacity-90">
                      Esperadas: {expectedHeads} | Contadas: {countedHeads} (Descuadre: {discrepancy > 0 ? `+${discrepancy}` : discrepancy})
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* If Discrepancy, Ask for Reason */}
          {discrepancy !== 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <label className="block text-[11px] font-bold text-rose-300">
                Motivo del Descuadre de Cabezas *
              </label>
              <input
                type="text"
                required
                placeholder="ej. 1 novilla rezagada por cojera dejada en corral de enfermería / 1 becerro parido anoche"
                value={discrepancyReason}
                onChange={e => setDiscrepancyReason(e.target.value)}
                className="w-full bg-slate-900 border border-rose-500/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
              />
            </div>
          )}
        </div>

        {/* DETAILS & PERSON RESPONSIBLE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Responsables del Traslado & Conteo *
            </label>
            <input
              type="text"
              required
              value={responsiblePerson}
              onChange={e => setResponsiblePerson(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Condición del Pasto al Momento del Traslado
            </label>
            <select
              value={forageState}
              onChange={e => setForageState(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="optimo">🌿 Óptimo (Punto óptimo de reposo / Pre-floración)</option>
              <option value="medio">🌾 Medio (Aceptable, buena cobertura verde)</option>
              <option value="bajo">🍂 Bajo (Pasto pasado de madurez o afectado por clima)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Notas Adicionales de la Rotación
            </label>
            <input
              type="text"
              placeholder="ej. Se suministró sal mineral al 8% en el nuevo saladero techado"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            * Al ejecutar, todos los animales del lote cambiarán automáticamente a su nuevo potrero.
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!targetPastureId || sourcePastureId === targetPastureId}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <MoveRight className="w-4 h-4" />
              Confirmar Rotación en Brocal
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
