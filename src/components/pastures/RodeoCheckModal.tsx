import React, { useState } from 'react';
import { 
  Pasture, 
  DailyRodeoAudit 
} from '../../types/livestock';
import { Modal } from '../common/Modal';
import { 
  CheckCircle2, 
  Droplets, 
  Zap, 
  Layers, 
  HeartPulse, 
  User, 
  Calendar, 
  Sparkles,
  MapPin
} from 'lucide-react';

interface RodeoCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  pastures: Pasture[];
  onSaveAudit: (audit: DailyRodeoAudit) => void;
  preselectedPastureId?: string;
}

export const RodeoCheckModal: React.FC<RodeoCheckModalProps> = ({
  isOpen,
  onClose,
  pastures,
  onSaveAudit,
  preselectedPastureId
}) => {
  const [pastureId, setPastureId] = useState<string>(preselectedPastureId || pastures[0]?.id || '');
  const [waterStatus, setWaterStatus] = useState<'optimo_limpio' | 'escaso' | 'sucio' | 'sin_agua'>('optimo_limpio');
  const [fenceStatus, setFenceStatus] = useState<'intacta_buen_voltaje' | 'alambre_flojo' | 'rota_requiere_reparacion'>('intacta_buen_voltaje');
  const [saltStatus, setSaltStatus] = useState<'abundante' | 'medio' | 'vacio_recargar'>('abundante');
  const [generalHealth, setGeneralHealth] = useState<'excelente' | 'novedades_reportadas'>('excelente');
  const [checkedBy, setCheckedBy] = useState<string>('Marcos Rivas (Vaquero)');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const currentPasture = pastures.find(p => p.id === pastureId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastureId) return;

    const audit: DailyRodeoAudit = {
      id: `audit-${Date.now()}`,
      date,
      pastureId,
      pastureName: currentPasture?.name || 'Potrero General',
      waterStatus,
      fenceStatus,
      saltStatus,
      generalHealth,
      checkedBy,
      notes: notes.trim() || undefined,
      timestamp: new Date().toISOString()
    };

    onSaveAudit(audit);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chequeo de Recorrida Diaria (Agua, Cercas y Salud)"
      subtitle="Evaluación visual rápida del potrero durante el rodeo matutino"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        {/* PASTURE & DATE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Potrero Inspeccionado *
            </label>
            <select
              value={pastureId}
              onChange={e => setPastureId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
            >
              {pastures.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name} ({p.grassType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Fecha de Recorrida
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* 4 RAPID CRITICAL CHECKS */}
        <div className="space-y-3">
          {/* 1. AGUA / ABREVADERO */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-600" />
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                1. Estado del Abrevadero / Bebedero de Agua:
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'optimo_limpio', label: '💧 Limpio y Lleno', bg: 'hover:bg-sky-50' },
                { id: 'escaso', label: '⚠️ Nivel Escaso / Bajo', bg: 'hover:bg-amber-50' },
                { id: 'sucio', label: '🍂 Agua Turbia / Sucia', bg: 'hover:bg-amber-50' },
                { id: 'sin_agua', label: '❌ Seco / Sin Agua', bg: 'hover:bg-rose-50' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setWaterStatus(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    waterStatus === opt.id
                      ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                      : `bg-slate-50 text-slate-700 border-slate-200 ${opt.bg}`
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. CERCA ELÉCTRICA / ALAMBRE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Cerca Eléctrica / Perímetro:
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'intacta_buen_voltaje', label: '⚡ Intacta (7-8 kV)' },
                { id: 'alambre_flojo', label: '⚠️ Alambre Flojo / Caído' },
                { id: 'rota_requiere_reparacion', label: '❌ Cerca Rota / Sin Voltaje' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFenceStatus(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    fenceStatus === opt.id
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. SALADERO & MINERALES */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Saladero / Suplementación Mineral:
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'abundante', label: '🧂 Sal Mineral Abundante' },
                { id: 'medio', label: '⚖️ Nivel Medio' },
                { id: 'vacio_recargar', label: '⚠️ Vacío / Requiere Recarga' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSaltStatus(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    saltStatus === opt.id
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. CONDICIÓN VISUAL DEL LOTE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-teal-600" />
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                4. Condición Visual del Lote de Ganado:
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { id: 'excelente', label: '🟢 Hato Tranquilo / Sin Novedad' },
                { id: 'novedades_reportadas', label: '⚠️ Animal Apartado / Registrar Novedad' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGeneralHealth(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    generalHealth === opt.id
                      ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* VAQUERO & NOTES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              Encargado / Vaquero que realiza la recorrida *
            </label>
            <input
              type="text"
              required
              value={checkedBy}
              onChange={e => setCheckedBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Observaciones Adicionales
            </label>
            <input
              type="text"
              placeholder="ej. Pasto con buen rebrote, agua fresca en pileta"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Guardar Recorrida
          </button>
        </div>
      </form>
    </Modal>
  );
};
