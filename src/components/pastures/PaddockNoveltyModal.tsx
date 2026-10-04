import React, { useState } from 'react';
import { 
  PaddockNovelty, 
  Pasture, 
  Animal, 
  NoveltyType 
} from '../../types/livestock';
import { Modal } from '../common/Modal';
import { 
  AlertTriangle, 
  HeartPulse, 
  Baby, 
  Wrench, 
  Skull, 
  CheckCircle2, 
  Camera, 
  Clock, 
  Calendar, 
  User, 
  MapPin, 
  Layers, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface PaddockNoveltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  pastures: Pasture[];
  animals: Animal[];
  onSaveNovelty: (novelty: PaddockNovelty) => void;
  preselectedPastureId?: string;
}

export const PaddockNoveltyModal: React.FC<PaddockNoveltyModalProps> = ({
  isOpen,
  onClose,
  pastures,
  animals,
  onSaveNovelty,
  preselectedPastureId
}) => {
  const [selectedType, setSelectedType] = useState<NoveltyType>('recorrida_ok');
  const [pastureId, setPastureId] = useState<string>(preselectedPastureId || pastures[0]?.id || '');
  const [animalTag, setAnimalTag] = useState<string>('');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [causeOrReason, setCauseOrReason] = useState<string>('');
  const [infraType, setInfraType] = useState<'cerca_electrica' | 'cerca_alambre' | 'bebedero_sin_agua' | 'bebedero_roto' | 'saladero_vacio' | 'desmoronamiento' | 'otro'>('bebedero_sin_agua');
  const [description, setDescription] = useState<string>('');
  const [reportedBy, setReportedBy] = useState<string>('Marcos Rivas (Vaquero)');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
  );
  const [photoUrl, setPhotoUrl] = useState<string>('');
  
  // Calf specific fields if birth
  const [calfTag, setCalfTag] = useState<string>(`CO-${Math.floor(500 + Math.random() * 499)}`);
  const [calfSex, setCalfSex] = useState<'M' | 'F'>('F');
  const [calfWeightKg, setCalfWeightKg] = useState<number>(36);

  const currentPasture = pastures.find(p => p.id === pastureId);
  const animalsInCurrentPasture = animals.filter(a => a.pastureId === pastureId);

  // Available lots in pasture
  const activeLotsInPasture = Array.from(new Set(animalsInCurrentPasture.map(a => a.lotName).filter(Boolean)));
  const [lotName, setLotName] = useState<string>(activeLotsInPasture[0] || '');

  const handleAnimalSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAnimalId(val);
    const target = animals.find(a => a.id === val);
    if (target) {
      setAnimalTag(target.tagNumber);
      if (target.pastureId && target.pastureId !== pastureId) {
        setPastureId(target.pastureId);
      }
    } else {
      setAnimalTag('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastureId) return;

    let severity: 'info' | 'alerta' | 'urgente' | 'critico' = 'info';
    if (selectedType === 'muerte') severity = 'critico';
    else if (selectedType === 'faltante_extraviado') severity = 'urgente';
    else if (selectedType === 'enfermo_herido') severity = 'urgente';
    else if (selectedType === 'falla_infraestructura') severity = 'alerta';
    else if (selectedType === 'parto_nacimiento') severity = 'info';

    let finalDesc = description.trim();
    if (!finalDesc) {
      if (selectedType === 'recorrida_ok') finalDesc = 'Recorrida matutina completada. Agua, cercas y condición del lote en óptimo estado.';
      else if (selectedType === 'muerte') finalDesc = `Muerte reportada en potrero. Causa aparente: ${causeOrReason || 'Por determinar'}.`;
      else if (selectedType === 'faltante_extraviado') finalDesc = `Animal ${animalTag || 'no identificado'} faltante en el conteo visual del lote. Requiere rastreo perimetral.`;
      else if (selectedType === 'enfermo_herido') finalDesc = `Animal ${animalTag} requiere atención: ${causeOrReason || 'Signos clínicos observados'}.`;
      else if (selectedType === 'parto_nacimiento') finalDesc = `Nacimiento de cría ${calfSex === 'M' ? 'macho' : 'hembra'} (Arete: ${calfTag}).`;
      else if (selectedType === 'falla_infraestructura') finalDesc = `Novedad de infraestructura: ${infraType.replace('_', ' ')}.`;
    }

    const newNovelty: PaddockNovelty = {
      id: `nov-${Date.now()}`,
      date,
      time,
      pastureId,
      pastureName: currentPasture?.name || 'Potrero General',
      lotName: lotName || activeLotsInPasture[0] || undefined,
      type: selectedType,
      severity,
      animalTag: animalTag || undefined,
      animalId: selectedAnimalId || undefined,
      causeOrReason: causeOrReason || undefined,
      infraType: selectedType === 'falla_infraestructura' ? infraType : undefined,
      description: finalDesc,
      reportedBy,
      status: selectedType === 'recorrida_ok' || selectedType === 'parto_nacimiento' ? 'resuelto' : 'pendiente',
      photoUrl: photoUrl || undefined,
      calfTag: selectedType === 'parto_nacimiento' ? calfTag : undefined,
      calfSex: selectedType === 'parto_nacimiento' ? calfSex : undefined,
      calfWeightKg: selectedType === 'parto_nacimiento' ? calfWeightKg : undefined,
      createdAt: new Date().toISOString()
    };

    onSaveNovelty(newNovelty);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reporte de Recorredor / Novedad en Potrero"
      subtitle="Registro rápido de la recorrida diaria de campo (salud, agua, cercas y eventos)"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-slate-800">
        {/* TOP SELECTOR: 6 NOVELTY CARDS */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Tipo de Novedad Observada en el Campo:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* 1. Recorrida OK */}
            <button
              type="button"
              onClick={() => setSelectedType('recorrida_ok')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                selectedType === 'recorrida_ok'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold block text-slate-900">Todo en Orden</strong>
                <span className="text-[10px] text-slate-500 block leading-tight">Agua, cercas y lote OK</span>
              </div>
            </button>

            {/* 2. Nacimiento */}
            <button
              type="button"
              onClick={() => setSelectedType('parto_nacimiento')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                selectedType === 'parto_nacimiento'
                  ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                <Baby className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold block text-slate-900">Nacimiento / Parto</strong>
                <span className="text-[10px] text-slate-500 block leading-tight">Suma cría al lote</span>
              </div>
            </button>

            {/* 3. Enfermo / Herido */}
            <button
              type="button"
              onClick={() => setSelectedType('enfermo_herido')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                selectedType === 'enfermo_herido'
                  ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold block text-slate-900">Enfermo / Tratar</strong>
                <span className="text-[10px] text-slate-500 block leading-tight">Asigna tarea médica</span>
              </div>
            </button>

            {/* 4. Falla Infraestructura */}
            <button
              type="button"
              onClick={() => setSelectedType('falla_infraestructura')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                selectedType === 'falla_infraestructura'
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold block text-slate-900">Agua / Cerca / Sal</strong>
                <span className="text-[10px] text-slate-500 block leading-tight">Falla de infraestructura</span>
              </div>
            </button>

            {/* 5. Faltante / Extraviado */}
            <button
              type="button"
              onClick={() => setSelectedType('faltante_extraviado')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                selectedType === 'faltante_extraviado'
                  ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold block text-slate-900">Animal Faltante</strong>
                <span className="text-[10px] text-slate-500 block leading-tight">Alerta de rastreo</span>
              </div>
            </button>

            {/* 6. Muerte */}
            <button
              type="button"
              onClick={() => setSelectedType('muerte')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                selectedType === 'muerte'
                  ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Skull className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-bold block text-slate-900">Animal Muerto</strong>
                <span className="text-[10px] text-slate-500 block leading-tight">Baja de inventario</span>
              </div>
            </button>
          </div>
        </div>

        {/* LOCATION & TIME SECTION */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Potrero Recorrido *
            </label>
            <select
              value={pastureId}
              onChange={e => setPastureId(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
            >
              {pastures.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name} ({animals.filter(a => a.pastureId === p.id).length} cabezas)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Hora de Recorrida
            </label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* DYNAMIC FIELDS PER NOVELTY TYPE */}

        {/* TYPE: NACIMIENTO EN POTRERO */}
        {selectedType === 'parto_nacimiento' && (
          <div className="bg-pink-50/70 border border-pink-200 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-pink-900 font-bold text-xs">
              <Baby className="w-4 h-4 text-pink-600" />
              <span>Detalles del Nacimiento en Potrero:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Vaca Madre (si está identificada)
                </label>
                <select
                  value={selectedAnimalId}
                  onChange={handleAnimalSelect}
                  className="w-full bg-white border border-pink-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-pink-500 font-medium"
                >
                  <option value="">-- No identificada aún --</option>
                  {animals
                    .filter(a => a.sex === 'F')
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.tagNumber} - {a.name} ({a.breed})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Arete Asignado a la Cría *
                </label>
                <input
                  type="text"
                  required
                  value={calfTag}
                  onChange={e => setCalfTag(e.target.value)}
                  className="w-full bg-white border border-pink-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Sexo</label>
                  <select
                    value={calfSex}
                    onChange={e => setCalfSex(e.target.value as any)}
                    className="w-full bg-white border border-pink-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="F">Hembra (♀)</option>
                    <option value="M">Macho (♂)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={calfWeightKg}
                    onChange={e => setCalfWeightKg(Number(e.target.value))}
                    className="w-full bg-white border border-pink-300 rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TYPE: ENFERMO / HERIDO */}
        {selectedType === 'enfermo_herido' && (
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <HeartPulse className="w-4 h-4 text-amber-600" />
              <span>Animal Afectado y Diagnóstico Preliminar de Campo:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Animal Afectado *
                </label>
                <select
                  value={selectedAnimalId}
                  onChange={handleAnimalSelect}
                  required
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">-- Seleccionar Animal --</option>
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.tagNumber} - {a.name} ({a.category.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Causa / Síntoma Observado *
                </label>
                <select
                  value={causeOrReason}
                  onChange={e => setCauseOrReason(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                >
                  <option value="">-- Seleccionar o escribir abajo --</option>
                  <option value="Cojera / Claudicación en miembro">Cojera / Claudicación</option>
                  <option value="Mastitis clínica / Ubre inflamada">Mastitis clínica / Inflamación</option>
                  <option value="Timpanismo / Hinchazón ruminal">Timpanismo / Timpanización aguda</option>
                  <option value="Mordedura de serpiente / Picadura">Mordedura de serpiente</option>
                  <option value="Herida por alambre de púa">Herida por alambre de cerca</option>
                  <option value="Fiebre de garrapata / Anaplasmosis">Tristeza bovina / Garrapatosis</option>
                  <option value="Ojo de buey / Queratoconjuntivitis">Queratoconjuntivitis infecciosa</option>
                  <option value="Neumonía / Dificultad respiratoria">Neumonía / Tos con moco</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TYPE: FALLA INFRAESTRUCTURA */}
        {selectedType === 'falla_infraestructura' && (
          <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-900 font-bold">
              <Wrench className="w-4 h-4 text-indigo-600" />
              <span>Falla de Instalaciones en Potrero (Agua, Cercas o Saladeros):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tipo de Infraestructura Afectada *
                </label>
                <select
                  value={infraType}
                  onChange={e => setInfraType(e.target.value as any)}
                  className="w-full bg-white border border-indigo-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                >
                  <option value="bebedero_sin_agua">💧 Abrevadero / Bebedero sin agua o seco</option>
                  <option value="bebedero_roto">💧 Flotador / Tubería de agua rota con fuga</option>
                  <option value="cerca_electrica">⚡ Cerca eléctrica sin voltaje o caída</option>
                  <option value="cerca_alambre">🪵 Cerca de alambre de púas reventada</option>
                  <option value="saladero_vacio">🧂 Saladero vacío / requiere recarga mineral</option>
                  <option value="desmoronamiento">⚠️ Desmoronamiento de talud o canal</option>
                  <option value="otro">🛠️ Otra falla de campo</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Acción Sugerida Inmediata
                </label>
                <input
                  type="text"
                  placeholder="ej. Enviar cuadrilla con machete y alambre a primera hora"
                  value={causeOrReason}
                  onChange={e => setCauseOrReason(e.target.value)}
                  className="w-full bg-white border border-indigo-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* TYPE: MUERTE */}
        {selectedType === 'muerte' && (
          <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-rose-900 font-bold">
              <Skull className="w-4 h-4 text-rose-600" />
              <span>Registro Formal de Muerte en Potrero:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Animal Fallecido *
                </label>
                <select
                  value={selectedAnimalId}
                  onChange={handleAnimalSelect}
                  required
                  className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                >
                  <option value="">-- Seleccionar Animal --</option>
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.tagNumber} - {a.name} ({a.breed} • {a.lotName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Causa de Muerte Probable *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Timpanismo espumoso severo, Picadura de mapaná, Rayo"
                  value={causeOrReason}
                  onChange={e => setCauseOrReason(e.target.value)}
                  className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* TYPE: FALTANTE */}
        {selectedType === 'faltante_extraviado' && (
          <div className="bg-orange-50/70 border border-orange-200 p-4 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-orange-900 font-bold">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span>Animal Faltante en Conteo Visual:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Animal Sospechoso / Tag (si se conoce)
                </label>
                <select
                  value={selectedAnimalId}
                  onChange={handleAnimalSelect}
                  className="w-full bg-white border border-orange-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                >
                  <option value="">-- Indeterminado (Falta 1 cabeza en lote) --</option>
                  {animalsInCurrentPasture.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.tagNumber} - {a.name} ({a.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Última Ubicación Conocida
                </label>
                <input
                  type="text"
                  placeholder="ej. Visto ayer cerca a la cañada o bosque"
                  value={causeOrReason}
                  onChange={e => setCauseOrReason(e.target.value)}
                  className="w-full bg-white border border-orange-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* OBSERVATIONS & REPORTED BY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Observaciones / Detalle de Campo
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Notas del vaquero durante la recorrida (pastura restante, comportamiento del lote, etc.)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              Reportado por (Vaquero/Encargado) *
            </label>
            <input
              type="text"
              required
              value={reportedBy}
              onChange={e => setReportedBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 italic">
            * El software actualizará automáticamente el inventario o generará las alertas operativas.
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Guardar Reporte
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
