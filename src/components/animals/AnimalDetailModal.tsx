import React, { useState, useMemo, useRef } from 'react';
import { 
  Printer, 
  Edit3, 
  AlertTriangle,
  Plus,
  Layers,
  Milk,
  HeartPulse,
  Scale,
  ShieldAlert,
  Camera,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Activity,
  Award,
  ChevronRight,
  Filter,
  User,
  MapPin,
  Sparkles,
  Baby,
  FileSpreadsheet
} from 'lucide-react';
import { 
  Animal, 
  MilkRecord, 
  WeightRecord, 
  ReproductionEvent, 
  HealthRecord, 
  Pasture 
} from '../../types/livestock';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { 
  formatAge, 
  formatCurrency, 
  getDaysInMilk, 
  isAnimalInWithdrawal,
  getAnimalUGM
} from '../../utils/livestockCalculators';
import { exportElementToPdf } from '../../utils/pdfExport';

// Default high-quality breed portraits when no custom photo is uploaded
const BREED_PORTRAITS: Record<string, string> = {
  holstein: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80',
  jersey: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800&auto=format&fit=crop&q=80',
  brahman: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&auto=format&fit=crop&q=80',
  angus: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=800&auto=format&fit=crop&q=80',
  simmental: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=800&auto=format&fit=crop&q=80',
  girolando: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&auto=format&fit=crop&q=80',
  gyr: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800&auto=format&fit=crop&q=80'
};

interface AnimalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  animal: Animal | null;
  pastures: Pasture[];
  milkRecords: MilkRecord[];
  weightRecords: WeightRecord[];
  reproductionEvents: ReproductionEvent[];
  healthRecords: HealthRecord[];
  onEditAnimal: (animal: Animal) => void;
  onAddMilking: (animal: Animal) => void;
  onAddWeight: (animal: Animal) => void;
  onAddReproduction: (animal: Animal) => void;
  onAddTreatment: (animal: Animal) => void;
  onUpdateAnimalPhoto?: (animalId: string, photoUrl: string) => void;
}

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({
  isOpen,
  onClose,
  animal,
  pastures,
  milkRecords,
  weightRecords,
  reproductionEvents,
  healthRecords,
  onEditAnimal,
  onAddMilking,
  onAddWeight,
  onAddReproduction,
  onAddTreatment,
  onUpdateAnimalPhoto
}) => {
  const [activeTab, setActiveTab] = useState<'trajectory' | 'general' | 'weights' | 'health' | 'reproduction' | 'milk'>('trajectory');
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'weight' | 'health' | 'repro' | 'milk'>('all');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!animal) return null;

  const currentPasture = pastures.find(p => p.id === animal.pastureId);
  const animalMilkRecords = milkRecords.filter(m => m.animalId === animal.id || m.animalTag === animal.tagNumber);
  const animalWeights = weightRecords.filter(w => w.animalId === animal.id || w.animalTag === animal.tagNumber);
  const animalRepro = reproductionEvents.filter(r => r.animalId === animal.id || r.animalTag === animal.tagNumber);
  const animalHealth = healthRecords.filter(h => h.animalId === animal.id || h.animalTag === animal.tagNumber || h.animalId === 'TODOS');

  const inWithdrawal = isAnimalInWithdrawal(animal.withdrawalEndDate);
  const totalLiters = animalMilkRecords.reduce((acc, curr) => acc + curr.liters, 0);
  const avgLiters = animalMilkRecords.length > 0 ? (totalLiters / animalMilkRecords.length).toFixed(1) : '0';
  const daysInMilk = getDaysInMilk(animal.lastCalvingDate);

  // Photo resolution: custom photo or breed portrait fallback
  const breedKey = animal.breed.toLowerCase();
  const animalPhoto = animal.photoUrl || BREED_PORTRAITS[breedKey] || BREED_PORTRAITS.default;

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateAnimalPhoto) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onUpdateAnimalPhoto(animal.id, base64);
    };
    reader.readAsDataURL(file);
  };

  // UNIFIED LIFETIME TRAJECTORY TIMELINE
  const unifiedTimeline = useMemo(() => {
    const events: Array<{
      id: string;
      date: string;
      type: 'birth' | 'weight' | 'health' | 'repro' | 'milk' | 'pasture';
      title: string;
      subtitle: string;
      details?: string;
      badge: string;
      badgeColor: 'emerald' | 'amber' | 'rose' | 'purple' | 'sky' | 'slate';
      icon: React.ElementType;
    }> = [];

    // 1. Birth / Registration Event
    events.push({
      id: `birth-${animal.id}`,
      date: animal.birthDate,
      type: 'birth',
      title: 'Nacimiento & Registro Inicial',
      subtitle: `Ingreso al hato con arete oficial ${animal.tagNumber} (${animal.breed})`,
      details: `Origen: ${animal.geneticOrigin?.replace(/_/g, ' ') || 'Nacido en Finca'} • Madre: ${animal.damTag || 'N/D'} • Padre: ${animal.sireTag || 'N/D'}`,
      badge: 'REGISTRO',
      badgeColor: 'emerald',
      icon: Baby
    });

    // 2. Weights
    animalWeights.forEach((w) => {
      events.push({
        id: `weight-${w.id}`,
        date: w.date,
        type: 'weight',
        title: `Pesaje en Báscula: ${w.weightKg} kg`,
        subtitle: w.adgKg ? `Ganancia Diaria: +${(w.adgKg * 1000).toFixed(0)} g/día (ADG)` : `Tipo de control: ${w.weighingType.toUpperCase()}`,
        details: w.notes || (w.bodyCondition ? `Condición Corporal: ${w.bodyCondition}/5.0` : undefined),
        badge: 'PESAJE',
        badgeColor: 'amber',
        icon: Scale
      });
    });

    // 3. Health & Vaccines
    animalHealth.forEach((h) => {
      events.push({
        id: `health-${h.id}`,
        date: h.date,
        type: 'health',
        title: `Tratamiento: ${h.medicationName}`,
        subtitle: `${h.diseaseOrReason} • Vía ${h.administrationRoute?.toUpperCase() || 'SC'}`,
        details: `Dosis: ${h.dosage} • Resp: ${h.veterinarian} ${h.withdrawalEndDate ? `• Retiro hasta: ${h.withdrawalEndDate}` : ''}`,
        badge: h.type.toUpperCase(),
        badgeColor: h.type === 'vacuna' ? 'sky' : 'rose',
        icon: ShieldAlert
      });
    });

    // 4. Reproductive Events (Heats, AI, Calvings)
    animalRepro.forEach((r) => {
      events.push({
        id: `repro-${r.id}`,
        date: r.date,
        type: 'repro',
        title: `Evento Reproductivo: ${r.eventType.replace(/_/g, ' ').toUpperCase()}`,
        subtitle: r.sireTagOrStraw ? `Pajilla/Toro: ${r.sireTagOrStraw} • Inseminador: ${r.inseminator || 'M.V.'}` : `Estado: ${r.pregnancyStatus || 'Registrado'}`,
        details: r.observations || (r.expectedCalvingDate ? `Fecha esperada de parto: ${r.expectedCalvingDate}` : undefined),
        badge: r.eventType.toUpperCase(),
        badgeColor: 'purple',
        icon: HeartPulse
      });
    });

    // 5. Milking milestone
    if (animalMilkRecords.length > 0) {
      const recentMilks = [...animalMilkRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
      recentMilks.forEach(m => {
        events.push({
          id: `milk-${m.id}`,
          date: m.date,
          type: 'milk',
          title: `Registro de Ordeño: ${m.liters} Litros`,
          subtitle: `Turno: ${m.shift.toUpperCase()} • Destino: ${m.destination?.replace(/_/g, ' ')}`,
          details: m.fatPercent ? `Grasa: ${m.fatPercent}% • Proteína: ${m.proteinPercent}%` : undefined,
          badge: 'ORDEÑO',
          badgeColor: 'sky',
          icon: Milk
        });
      });
    }

    // Sort all events descending (newest first)
    const sorted = events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (timelineFilter === 'all') return sorted;
    return sorted.filter(e => e.type === timelineFilter);
  }, [animal, animalWeights, animalHealth, animalRepro, animalMilkRecords, timelineFilter]);

  // Export PDF of Animal Passport
  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsExportingPdf(true);
    try {
      await exportElementToPdf(printRef.current, {
        fileName: `Ficha_Tecnica_${animal.tagNumber}_${animal.name.replace(/\s+/g, '_')}.pdf`,
        reportTitle: `Hoja de Vida Bovino ${animal.tagNumber}`
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ficha Zootécnica Oficial: ${animal.tagNumber} - ${animal.name}`}
      subtitle={`Hoja de Vida Individual Completa • Raza ${animal.breed} • Arete Oficial`}
      maxWidth="4xl"
    >
      <div className="space-y-5 text-slate-800">
        {/* WITHDRAWAL WARNING BANNER */}
        {inWithdrawal && (
          <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-4 flex items-start gap-3 text-rose-900 shadow-xs">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-extrabold text-sm uppercase tracking-wide text-rose-900">
                ¡ALERTA ZOOSANITARIA - PERIODO DE RETIRO ACTIVO!
              </h4>
              <p className="text-xs text-rose-800 mt-1">
                Este animal tiene un tratamiento activo con antibiótico/medicamento ({animal.activeTreatmentName || 'Tratamiento veterinario'}).
                <span className="font-bold underline ml-1">
                  Prohibido enviar leche a tanque comercial o enviar a faena/sacrificio hasta el {animal.withdrawalEndDate}.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* PRINTABLE CANVAS CONTAINER */}
        <div ref={printRef} className="space-y-5 bg-white">
          {/* PROFESSIONAL PASSPORT HERO HEADER WITH PHOTO */}
          <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Photo Frame with Avatar and Upload Option */}
              <div className="relative group shrink-0">
                <img 
                  src={animalPhoto} 
                  alt={animal.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-emerald-600/40 shadow-md"
                />
                <label 
                  className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-opacity backdrop-blur-2xs"
                  title="Cambiar foto del animal"
                >
                  <Camera className="w-5 h-5 mb-1" />
                  <span>Subir Foto</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload}
                    className="hidden" 
                  />
                </label>
                <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Animal Identity Badges */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                    {animal.tagNumber}
                  </span>
                  <Badge variant={animal.sex === 'F' ? 'purple' : 'info'}>
                    {animal.category.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                  <Badge variant={animal.healthStatus === 'sano' ? 'success' : animal.healthStatus === 'en_tratamiento' ? 'danger' : 'warning'}>
                    {animal.healthStatus.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                  <Badge variant="cyan">{animal.purpose.toUpperCase()}</Badge>
                </div>

                <h3 className="text-lg font-black text-emerald-800">
                  {animal.name || 'Sin Nombre'} <span className="text-slate-500 text-xs font-normal">({animal.breed})</span>
                </h3>

                <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 font-medium">
                  <span>RFID: <strong className="font-mono text-slate-900">{animal.electronicId || 'N/A'}</strong></span>
                  <span>•</span>
                  <span>Edad: <strong className="text-slate-900">{formatAge(animal.birthDate)}</strong></span>
                  <span>•</span>
                  <span>Peso: <strong className="text-slate-900 font-mono">{animal.weightKg} kg</strong></span>
                  <span>•</span>
                  <span>UGM: <strong className="text-emerald-700 font-mono">{getAnimalUGM(animal.category, animal.weightKg)}</strong></span>
                  <span>•</span>
                  <span>Potrero: <strong className="text-slate-900">{currentPasture?.name || 'Hato General'}</strong></span>
                </div>
              </div>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end no-print">
              <button
                onClick={() => onEditAnimal(animal)}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                Editar Ficha
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-600/30 cursor-pointer"
                title="Descargar Hoja de Vida en PDF"
              >
                <Download className="w-3.5 h-3.5" />
                {isExportingPdf ? 'Exportando...' : 'Descargar PDF'}
              </button>
            </div>
          </div>

          {/* QUICK OPERATIONAL LAUNCHER BUTTONS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 no-print">
            <button
              onClick={() => onAddWeight(animal)}
              className="p-2.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Scale className="w-4 h-4 text-amber-600" />
              <span>+ Nuevo Pesaje</span>
            </button>

            <button
              onClick={() => onAddTreatment(animal)}
              className="p-2.5 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>+ Aplicar Fármaco</span>
            </button>

            <button
              onClick={() => onAddReproduction(animal)}
              className="p-2.5 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <HeartPulse className="w-4 h-4 text-purple-600" />
              <span>+ Celo / Servicio IA</span>
            </button>

            <button
              onClick={() => onAddMilking(animal)}
              disabled={animal.sex === 'M'}
              className="p-2.5 bg-sky-50 hover:bg-sky-100/80 disabled:opacity-40 border border-sky-200 text-sky-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Milk className="w-4 h-4 text-sky-600" />
              <span>+ Control Ordeño</span>
            </button>
          </div>

          {/* NAVIGATION TABS */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold overflow-x-auto custom-scroll no-print">
            <button
              onClick={() => setActiveTab('trajectory')}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'trajectory' ? 'bg-white text-emerald-800 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Trayectoria Completa ({unifiedTimeline.length})
            </button>

            <button
              onClick={() => setActiveTab('general')}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'general' ? 'bg-white text-emerald-800 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              Genealogía & Ficha
            </button>

            <button
              onClick={() => setActiveTab('weights')}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'weights' ? 'bg-white text-amber-800 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              Pesajes & GDP ({animalWeights.length})
            </button>

            <button
              onClick={() => setActiveTab('health')}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'health' ? 'bg-white text-rose-800 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Sanidad & Fármacos ({animalHealth.length})
            </button>

            <button
              onClick={() => setActiveTab('reproduction')}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reproduction' ? 'bg-white text-purple-800 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 text-purple-600" />
              Reproducción & Partos ({animalRepro.length})
            </button>

            <button
              onClick={() => setActiveTab('milk')}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'milk' ? 'bg-white text-sky-800 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Milk className="w-3.5 h-3.5 text-sky-600" />
              Ordeño ({animalMilkRecords.length})
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: UNIFIED LIFETIME TRAJECTORY TIMELINE */}
          {/* ========================================================================= */}
          {activeTab === 'trajectory' && (
            <div className="space-y-4">
              {/* Timeline Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs no-print">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-emerald-600" />
                  Filtrar eventos de la trayectoria:
                </span>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setTimelineFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                      timelineFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    Todos ({unifiedTimeline.length})
                  </button>
                  <button
                    onClick={() => setTimelineFilter('weight')}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                      timelineFilter === 'weight' ? 'bg-amber-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    Pesajes ({animalWeights.length})
                  </button>
                  <button
                    onClick={() => setTimelineFilter('health')}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                      timelineFilter === 'health' ? 'bg-rose-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    Sanidad ({animalHealth.length})
                  </button>
                  <button
                    onClick={() => setTimelineFilter('repro')}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                      timelineFilter === 'repro' ? 'bg-purple-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    Reproducción ({animalRepro.length})
                  </button>
                  <button
                    onClick={() => setTimelineFilter('milk')}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                      timelineFilter === 'milk' ? 'bg-sky-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    Ordeños ({animalMilkRecords.length})
                  </button>
                </div>
              </div>

              {/* Chronological Vertical Timeline List */}
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {unifiedTimeline.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="relative group">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-xs flex items-center justify-center text-white ${
                        item.badgeColor === 'emerald' ? 'bg-emerald-600' :
                        item.badgeColor === 'amber' ? 'bg-amber-600' :
                        item.badgeColor === 'rose' ? 'bg-rose-600' :
                        item.badgeColor === 'purple' ? 'bg-purple-600' :
                        item.badgeColor === 'sky' ? 'bg-sky-600' : 'bg-slate-600'
                      }`}>
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>

                      {/* Event Card */}
                      <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-1.5 shadow-2xs hover:border-slate-300 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900">
                            {item.title}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase font-mono">
                              {item.badge}
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-800 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {item.date}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs font-medium text-slate-700">
                          {item.subtitle}
                        </p>

                        {item.details && (
                          <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {item.details}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: GENERAL INFORMATION & PEDIGREE */}
          {/* ========================================================================= */}
          {activeTab === 'general' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Raza & Cruce</span>
                  <strong className="text-slate-900 font-bold text-sm block mt-0.5">{animal.breed}</strong>
                  <span className="text-[10px] text-slate-500">Pureza / Tipo comercial</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Origen Genético</span>
                  <strong className="text-emerald-800 font-bold text-sm block mt-0.5 capitalize">
                    {animal.geneticOrigin?.replace(/_/g, ' ') || 'Nacido en Finca'}
                  </strong>
                  <span className="text-[10px] text-slate-500">Trazabilidad oficial</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Condición Corporal</span>
                  <strong className="text-slate-900 font-mono text-sm block mt-0.5">{animal.bodyCondition || 3.5} / 5.0</strong>
                  <span className="text-[10px] text-emerald-700 font-semibold">Estado nutricional óptimo</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Madre (Dam)</span>
                  <strong className="text-purple-800 font-mono text-sm block mt-0.5">{animal.damTag || 'No Registrada'}</strong>
                  <span className="text-[10px] text-slate-500">Arete materno trazable</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Padre (Sire / Toro)</span>
                  <strong className="text-sky-800 font-mono text-sm block mt-0.5">{animal.sireTag || 'No Registrado'}</strong>
                  <span className="text-[10px] text-slate-500">Pajilla / Toro reproductor</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Valor Comercial / Costo</span>
                  <strong className="text-slate-900 font-mono text-sm block mt-0.5">
                    {animal.purchasePrice ? formatCurrency(animal.purchasePrice) : '$ 3,800,000'}
                  </strong>
                  <span className="text-[10px] text-slate-500">Avalúo zootécnico predial</span>
                </div>
              </div>

              {/* Pedigree Tree Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h5 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Árbol Genealógico & Linaje Zootécnico:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Bovino Titular</span>
                    <strong className="text-slate-900 block font-mono text-sm">{animal.tagNumber}</strong>
                    <span className="text-[11px] text-emerald-700">{animal.name}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-purple-700 block uppercase">Madre (Hembra)</span>
                    <strong className="text-slate-900 block font-mono text-sm">{animal.damTag || 'VACA-BASE-01'}</strong>
                    <span className="text-[11px] text-slate-500">Línea Materna Lechera</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-sky-700 block uppercase">Padre (Toro / IA)</span>
                    <strong className="text-slate-900 block font-mono text-sm">{animal.sireTag || 'TORO-DONANTE-IA'}</strong>
                    <span className="text-[11px] text-slate-500">Genética Mejoradora</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: WEIGHINGS & ADG */}
          {/* ========================================================================= */}
          {activeTab === 'weights' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                  Historial de Pesajes en Báscula & Ganancia Diaria:
                </h4>
                <button
                  onClick={() => onAddWeight(animal)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer shadow-2xs no-print"
                >
                  <Plus className="w-3.5 h-3.5" /> Registrar Pesaje
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Peso (Kg)</th>
                      <th className="p-3">GDP (g/día)</th>
                      <th className="p-3">Condición</th>
                      <th className="p-3">Motivo / Tipo</th>
                      <th className="p-3">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {animalWeights.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-400">
                          Sin pesajes individuales registrados aún.
                        </td>
                      </tr>
                    ) : (
                      animalWeights.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-semibold">{w.date}</td>
                          <td className="p-3 font-mono font-bold text-slate-900 text-sm">{w.weightKg} kg</td>
                          <td className="p-3 font-mono font-bold text-amber-700">
                            {w.adgKg ? `+${(w.adgKg * 1000).toFixed(0)} g/d` : '-'}
                          </td>
                          <td className="p-3 font-mono">{w.bodyCondition ? `${w.bodyCondition}/5.0` : '-'}</td>
                          <td className="p-3 uppercase text-[10px] font-semibold text-slate-600">{w.weighingType}</td>
                          <td className="p-3 text-slate-500">{w.notes || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: HEALTH & PHARMACY */}
          {/* ========================================================================= */}
          {activeTab === 'health' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                  Tratamientos Sanitarios, Vacunas & Periodos de Retiro:
                </h4>
                <button
                  onClick={() => onAddTreatment(animal)}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer shadow-2xs no-print"
                >
                  <Plus className="w-3.5 h-3.5" /> Aplicar Tratamiento
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Fármaco / Vacuna</th>
                      <th className="p-3">Diagnóstico / Motivo</th>
                      <th className="p-3">Dosis & Vía</th>
                      <th className="p-3">Fin Retiro</th>
                      <th className="p-3">Veterinario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {animalHealth.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-slate-400">
                          Sin tratamientos registrados. Animal con estatus sanitario limpio.
                        </td>
                      </tr>
                    ) : (
                      animalHealth.map((h) => (
                        <tr key={h.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono">{h.date}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              h.type === 'vacuna' ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {h.type}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-900">{h.medicationName}</td>
                          <td className="p-3 text-slate-600">{h.diseaseOrReason}</td>
                          <td className="p-3 font-mono">{h.dosage} ({h.administrationRoute || 'SC'})</td>
                          <td className="p-3 font-mono font-bold text-rose-700">{h.withdrawalEndDate || 'Sin retiro'}</td>
                          <td className="p-3 text-slate-600">{h.veterinarian}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: REPRODUCTION */}
          {/* ========================================================================= */}
          {activeTab === 'reproduction' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                  Historial de Celos, Inseminaciones (IA) & Partos:
                </h4>
                <button
                  onClick={() => onAddReproduction(animal)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer shadow-2xs no-print"
                >
                  <Plus className="w-3.5 h-3.5" /> Nuevo Evento
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Evento</th>
                      <th className="p-3">Toro / Pajilla</th>
                      <th className="p-3">Diagnóstico Preñez</th>
                      <th className="p-3">Parto Estimado</th>
                      <th className="p-3">Cría / Arete</th>
                      <th className="p-3">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {animalRepro.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-slate-400">
                          Sin eventos reproductivos registrados.
                        </td>
                      </tr>
                    ) : (
                      animalRepro.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono">{r.date}</td>
                          <td className="p-3 font-bold capitalize text-purple-900">{r.eventType.replace(/_/g, ' ')}</td>
                          <td className="p-3 font-mono text-slate-800">{r.sireTagOrStraw || '-'}</td>
                          <td className="p-3 capitalize">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.pregnancyStatus === 'positivo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {r.pregnancyStatus || 'Pendiente'}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700">{r.expectedCalvingDate || '-'}</td>
                          <td className="p-3 font-mono">{r.calfTag ? `${r.calfTag} (${r.calfSex || 'M'})` : '-'}</td>
                          <td className="p-3 text-slate-500">{r.observations || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: MILK CONTROL */}
          {activeTab === 'milk' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-200">
                  <span className="text-sky-800 font-semibold block text-[10px] uppercase">Acumulado Registrado</span>
                  <strong className="text-sky-900 font-black text-lg block mt-0.5">{totalLiters} L</strong>
                  <span className="text-[10px] text-sky-700">Total en tanque</span>
                </div>
                <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-200">
                  <span className="text-sky-800 font-semibold block text-[10px] uppercase">Promedio Diario</span>
                  <strong className="text-sky-900 font-black text-lg block mt-0.5">{avgLiters} L / día</strong>
                  <span className="text-[10px] text-sky-700">Rendimiento individual</span>
                </div>
                <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-200">
                  <span className="text-sky-800 font-semibold block text-[10px] uppercase">Días en Leche (DIM)</span>
                  <strong className="text-sky-900 font-black text-lg block mt-0.5">{daysInMilk} Días</strong>
                  <span className="text-[10px] text-sky-700">Lactancia en curso</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Turno</th>
                      <th className="p-3 text-right">Litros</th>
                      <th className="p-3 text-center">% Grasa</th>
                      <th className="p-3 text-center">% Proteína</th>
                      <th className="p-3">Destino</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {animalMilkRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-400">
                          Sin registros de ordeño individual para este animal.
                        </td>
                      </tr>
                    ) : (
                      animalMilkRecords.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono">{m.date}</td>
                          <td className="p-3 capitalize font-semibold">{m.shift}</td>
                          <td className="p-3 text-right font-mono font-bold text-sky-700">{m.liters} L</td>
                          <td className="p-3 text-center font-mono">{m.fatPercent ? `${m.fatPercent}%` : '4.1%'}</td>
                          <td className="p-3 text-center font-mono">{m.proteinPercent ? `${m.proteinPercent}%` : '3.3%'}</td>
                          <td className="p-3 capitalize text-slate-600">{m.destination?.replace(/_/g, ' ')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
