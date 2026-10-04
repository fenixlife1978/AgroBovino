import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Plus, 
  MoveRight, 
  Leaf, 
  Droplets, 
  Sun, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  HeartPulse, 
  Baby, 
  Wrench, 
  Skull, 
  ShieldCheck, 
  Users, 
  Calendar, 
  Clock, 
  Zap, 
  CheckSquare, 
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { 
  Pasture, 
  Animal, 
  FarmProfile, 
  PaddockNovelty, 
  HerdRotationRecord, 
  DailyRodeoAudit 
} from '../../types/livestock';
import { Badge } from '../common/Badge';
import { getAnimalUGM, calculatePastureCarryingCapacity } from '../../utils/livestockCalculators';
import { storage } from '../../services/storageService';
import { PaddockNoveltyModal } from './PaddockNoveltyModal';
import { HerdRotationModal } from './HerdRotationModal';
import { RodeoCheckModal } from './RodeoCheckModal';

interface PasturesViewProps {
  pastures: Pasture[];
  animals: Animal[];
  farm: FarmProfile;
  novelties?: PaddockNovelty[];
  rotations?: HerdRotationRecord[];
  rodeoAudits?: DailyRodeoAudit[];
  onOpenNewPasture: () => void;
  onEditPasture: (pasture: Pasture) => void;
  onDeletePasture: (id: string) => void;
  onRotateHerd: (sourcePastureId: string, targetPastureId: string) => void;
  onSaveNovelty?: (novelty: PaddockNovelty) => void;
  onResolveNovelty?: (id: string, notes?: string) => void;
  onSaveRotation?: (rotation: HerdRotationRecord) => void;
  onSaveRodeoAudit?: (audit: DailyRodeoAudit) => void;
}

export const PasturesView: React.FC<PasturesViewProps> = ({
  pastures,
  animals,
  farm,
  novelties = [],
  rotations = [],
  rodeoAudits = [],
  onOpenNewPasture,
  onEditPasture,
  onDeletePasture,
  onRotateHerd,
  onSaveNovelty,
  onResolveNovelty,
  onSaveRotation,
  onSaveRodeoAudit
}) => {
  const [activeTab, setActiveTab] = useState<'paddocks' | 'rotations' | 'novelties' | 'water_fences'>('paddocks');
  
  // Modals state
  const [isNoveltyModalOpen, setIsNoveltyModalOpen] = useState(false);
  const [isRotationModalOpen, setIsRotationModalOpen] = useState(false);
  const [isRodeoModalOpen, setIsRodeoModalOpen] = useState(false);
  const [selectedPastureForAction, setSelectedPastureForAction] = useState<string | undefined>();
  
  // Novelty filter
  const [noveltyFilter, setNoveltyFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [noveltySearch, setNoveltySearch] = useState('');

  // Calculations
  const totalGrazingArea = useMemo(() => {
    return pastures.reduce((acc, curr) => acc + curr.areaHa, 0);
  }, [pastures]);

  const totalUGM = useMemo(() => {
    return animals.reduce((acc, curr) => acc + getAnimalUGM(curr.category, curr.weightKg), 0);
  }, [animals]);

  const globalStockingRate = totalGrazingArea > 0 ? (totalUGM / totalGrazingArea).toFixed(2) : '0';

  // Count animals and UGM per pasture with lot info
  const pastureDetails = useMemo(() => {
    return pastures.map(p => {
      const pastureAnimals = animals.filter(a => a.pastureId === p.id);
      const pastureUGM = pastureAnimals.reduce((acc, curr) => acc + getAnimalUGM(curr.category, curr.weightKg), 0);
      const capacityInfo = calculatePastureCarryingCapacity(p.areaHa, p.forageEstimateKgM2);
      const distinctLots = Array.from(new Set(pastureAnimals.map(a => a.lotName).filter(Boolean)));
      
      // Check for active alerts in this pasture
      const activePaddockNovelties = novelties.filter(n => n.pastureId === p.id && n.status !== 'resuelto');
      
      return {
        ...p,
        animalsCount: pastureAnimals.length,
        currentUGM: Number(pastureUGM.toFixed(1)),
        capacityInfo,
        stockingRate: (pastureUGM / Math.max(0.1, p.areaHa)).toFixed(2),
        lots: distinctLots,
        activeAlertsCount: activePaddockNovelties.length,
        hasWaterIssue: activePaddockNovelties.some(n => n.type === 'falla_infraestructura' && n.infraType?.includes('bebedero')),
        hasFenceIssue: activePaddockNovelties.some(n => n.type === 'falla_infraestructura' && n.infraType?.includes('cerca'))
      };
    });
  }, [pastures, animals, novelties]);

  // Unique lots in the farm
  const farmLots = useMemo(() => {
    const lotMap = new Map<string, { name: string; count: number; pastureName: string; pastureCode: string; pastureId: string; ugm: number }>();
    animals.forEach(a => {
      const lot = a.lotName || 'Hato General';
      const past = pastures.find(p => p.id === a.pastureId);
      const animalUGM = getAnimalUGM(a.category, a.weightKg);
      if (!lotMap.has(lot)) {
        lotMap.set(lot, {
          name: lot,
          count: 1,
          pastureName: past?.name || 'Sin asignar',
          pastureCode: past?.code || 'POT-00',
          pastureId: a.pastureId,
          ugm: animalUGM
        });
      } else {
        const item = lotMap.get(lot)!;
        item.count += 1;
        item.ugm += animalUGM;
      }
    });
    return Array.from(lotMap.values());
  }, [animals, pastures]);

  const filteredNovelties = useMemo(() => {
    return novelties.filter(n => {
      if (noveltyFilter === 'pending' && n.status === 'resuelto') return false;
      if (noveltyFilter === 'resolved' && n.status !== 'resuelto') return false;
      if (noveltySearch) {
        const q = noveltySearch.toLowerCase();
        return (
          n.pastureName.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          (n.animalTag && n.animalTag.toLowerCase().includes(q)) ||
          (n.causeOrReason && n.causeOrReason.toLowerCase().includes(q)) ||
          n.reportedBy.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [novelties, noveltyFilter, noveltySearch]);

  const handleOpenNoveltyForPasture = (pastureId: string) => {
    setSelectedPastureForAction(pastureId);
    setIsNoveltyModalOpen(true);
  };

  const handleOpenRotationForPasture = (pastureId: string) => {
    setSelectedPastureForAction(pastureId);
    setIsRotationModalOpen(true);
  };

  const handleOpenRodeoForPasture = (pastureId: string) => {
    setSelectedPastureForAction(pastureId);
    setIsRodeoModalOpen(true);
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* TOP STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Área de Pastoreo</span>
          <span className="text-2xl font-black text-slate-900">{totalGrazingArea} Ha</span>
          <span className="text-[10px] text-slate-500 block font-medium">{pastures.length} potreros delimitados</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Carga Global Hato</span>
          <span className="text-2xl font-black text-emerald-600">{globalStockingRate}</span>
          <span className="text-[10px] text-emerald-700 block font-medium">UGM / Hectárea</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Potreros Ocupados</span>
          <span className="text-2xl font-black text-amber-600">
            {pastureDetails.filter(p => p.animalsCount > 0).length}
          </span>
          <span className="text-[10px] text-slate-500 block font-medium">Con lotes de ganado</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">En Descanso / Rebrote</span>
          <span className="text-2xl font-black text-sky-600">
            {pastureDetails.filter(p => p.animalsCount === 0).length}
          </span>
          <span className="text-[10px] text-sky-700 block font-medium">Recuperando forraje</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Novedades de Recorrida</span>
          <span className="text-2xl font-black text-rose-600">
            {novelties.filter(n => n.status !== 'resuelto').length}
          </span>
          <span className="text-[10px] text-rose-700 block font-medium">Pendientes de atención</span>
        </div>
      </div>

      {/* ACTION & MODULE HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">Control de Potreros, Lotes & Recorrida de Campo</h3>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Manejo Real de Campo
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestión basada en lotes, rotaciones con conteo en manga y reporte ágil de novedades del vaquero
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedPastureForAction(undefined);
              setIsNoveltyModalOpen(true);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm shadow-amber-600/20 transition-all cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Novedad de Recorrida</span>
          </button>

          <button
            onClick={() => {
              setSelectedPastureForAction(undefined);
              setIsRotationModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <MoveRight className="w-4 h-4" />
            <span>Rotación (Conteo en Manga)</span>
          </button>

          <button
            onClick={() => {
              setSelectedPastureForAction(undefined);
              setIsRodeoModalOpen(true);
            }}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
          >
            <Droplets className="w-4 h-4" />
            <span>Ronda de Agua & Cercas</span>
          </button>

          <button
            onClick={onOpenNewPasture}
            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Nuevo Potrero</span>
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('paddocks')}
          className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'paddocks'
              ? 'border-emerald-600 text-emerald-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Leaf className="w-4 h-4" />
          <span>🌿 Potreros & Estado Forrajero ({pastures.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rotations')}
          className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'rotations'
              ? 'border-emerald-600 text-emerald-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MoveRight className="w-4 h-4" />
          <span>🤠 Rotaciones & Lotes en Manga ({farmLots.length} Lotes)</span>
        </button>

        <button
          onClick={() => setActiveTab('novelties')}
          className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'novelties'
              ? 'border-emerald-600 text-emerald-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>📋 Libro de Novedades de Recorrida ({novelties.length})</span>
          {novelties.filter(n => n.status !== 'resuelto').length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              {novelties.filter(n => n.status !== 'resuelto').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('water_fences')}
          className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'water_fences'
              ? 'border-emerald-600 text-emerald-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>💧 Ronda de Agua, Cercas & Saladeros</span>
        </button>
      </div>

      {/* TAB 1: PADDOCKS & FORAGE VIEW */}
      {activeTab === 'paddocks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pastureDetails.map((pasture) => {
            const isOccupied = pasture.animalsCount > 0;
            const isOverCapacity = pasture.currentUGM > pasture.carryingCapacityUGM;

            return (
              <div
                key={pasture.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                  isOccupied
                    ? 'border-emerald-300 ring-1 ring-emerald-400/20'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-base">{pasture.code}</span>
                        <Badge variant={isOccupied ? 'success' : 'info'} size="xs">
                          {isOccupied ? 'OCUPADO' : 'EN DESCANSO'}
                        </Badge>
                        {pasture.activeAlertsCount > 0 && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {pasture.activeAlertsCount} Novedad
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-emerald-800 mt-0.5">{pasture.name}</h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditPasture(pasture)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Editar Potrero"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeletePasture(pasture.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Forage Specs */}
                  <div className="space-y-2 mb-3">
                    <div className="text-xs text-slate-600 flex items-center justify-between font-medium">
                      <span className="flex items-center gap-1.5">
                        <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{pasture.grassType}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Aforo: <strong>{pasture.forageEstimateKgM2} kg/m²</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold">Área Predial:</span>
                        <strong className="text-slate-900 font-mono">{pasture.areaHa} Ha</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold">Capacidad Óptima:</span>
                        <strong className="text-slate-900 font-mono">{pasture.carryingCapacityUGM} UGM</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold">Ocupación Actual:</span>
                        <strong className="text-emerald-700 font-mono">
                          {pasture.animalsCount} cabezas ({pasture.currentUGM} UGM)
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold">Carga Instantánea:</span>
                        <strong className={`font-mono ${isOverCapacity ? 'text-rose-700 font-black' : 'text-slate-900'}`}>
                          {pasture.stockingRate} UGM/Ha
                        </strong>
                      </div>
                    </div>

                    {/* Active Lot Names in Pasture */}
                    {pasture.lots.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] font-bold text-slate-500">Lote:</span>
                        {pasture.lots.map(lot => (
                          <span key={lot} className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px] px-2 py-0.5 rounded-lg">
                            {lot}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Environmental & Facilities Check */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pb-3 border-b border-slate-100 font-medium">
                    <span className="flex items-center gap-1">
                      <Droplets className={`w-3.5 h-3.5 ${pasture.hasWaterIssue ? 'text-rose-600 animate-bounce' : 'text-sky-600'}`} />
                      {pasture.waterSource.replace('_', ' ')}
                      {pasture.hasWaterIssue && <span className="text-[10px] font-bold text-rose-600">(Alerta)</span>}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-amber-600" />
                      {pasture.shadePercent}% sombra
                    </span>
                  </div>
                </div>

                {/* Quick Action Footer */}
                <div className="pt-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenNoveltyForPasture(pasture.id)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    title="Reportar novedad rápida en este potrero"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Novedad</span>
                  </button>

                  {isOccupied ? (
                    <button
                      onClick={() => handleOpenRotationForPasture(pasture.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <MoveRight className="w-3.5 h-3.5" />
                      <span>Rotar Lote</span>
                    </button>
                  ) : (
                    <span className="text-xs text-sky-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Listo para rotar
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: ROTATIONS & LOT MANAGEMENT IN CHUTE */}
      {activeTab === 'rotations' && (
        <div className="space-y-6">
          {/* ACTIVE LOTS OVERVIEW */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Lotes y Grupos Productivos Activos en la Finca
                </h4>
                <p className="text-xs text-slate-500">
                  Ubicación actual y censo confirmado por lote
                </p>
              </div>
              <button
                onClick={() => setIsRotationModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <MoveRight className="w-4 h-4" />
                <span>Mover Lote por Manga</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {farmLots.map(lot => (
                <div key={lot.name} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-slate-900">{lot.name}</strong>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg font-mono">
                      {lot.count} cabezas
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center justify-between">
                    <span>Ubicación: <strong>{lot.pastureCode} - {lot.pastureName}</strong></span>
                    <span className="font-mono text-slate-500">{lot.ugm.toFixed(1)} UGM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HISTORICAL ROTATION LOG TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Historial de Rotaciones & Conteo en Brocal / Manga
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                {rotations.length} traslados registrados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Lote Trasladado</th>
                    <th className="p-3">Potrero Origen</th>
                    <th className="p-3">Potrero Destino</th>
                    <th className="p-3 text-center">Conteo Manga</th>
                    <th className="p-3 text-center">Descuadre</th>
                    <th className="p-3">Responsable</th>
                    <th className="p-3">Notas / Novedad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rotations.map(rot => (
                    <tr key={rot.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-medium text-slate-600">{rot.date}</td>
                      <td className="p-3 font-bold text-slate-900">{rot.lotName}</td>
                      <td className="p-3 text-slate-600">{rot.sourcePastureName}</td>
                      <td className="p-3 font-bold text-emerald-700 flex items-center gap-1">
                        <MoveRight className="w-3.5 h-3.5 text-emerald-600" />
                        {rot.targetPastureName}
                      </td>
                      <td className="p-3 text-center font-mono font-black text-slate-900">
                        {rot.countedHeads} / {rot.expectedHeads}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {rot.discrepancy === 0 ? (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            0 (Exacto)
                          </span>
                        ) : (
                          <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-black text-[10px]">
                            {rot.discrepancy > 0 ? `+${rot.discrepancy}` : rot.discrepancy}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 font-medium">{rot.responsiblePerson}</td>
                      <td className="p-3 text-slate-500 italic max-w-xs truncate">
                        {rot.discrepancyReason || rot.notes || 'Traslado sin novedad.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NOVELTIES & FIELD LOG */}
      {activeTab === 'novelties' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por potrero, arete, causa o vaquero..."
                  value={noveltySearch}
                  onChange={e => setNoveltySearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setNoveltyFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    noveltyFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Todas ({novelties.length})
                </button>
                <button
                  onClick={() => setNoveltyFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    noveltyFilter === 'pending' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Pendientes ({novelties.filter(n => n.status !== 'resuelto').length})
                </button>
                <button
                  onClick={() => setNoveltyFilter('resolved')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    noveltyFilter === 'resolved' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Resueltas ({novelties.filter(n => n.status === 'resuelto').length})
                </button>
              </div>

              <button
                onClick={() => setIsNoveltyModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Novedad</span>
              </button>
            </div>
          </div>

          {/* NOVELTIES LIST */}
          <div className="space-y-3">
            {filteredNovelties.map(novelty => {
              const isResolved = novelty.status === 'resuelto';

              return (
                <div
                  key={novelty.id}
                  className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isResolved
                      ? 'border-slate-200 opacity-90'
                      : novelty.severity === 'critico' || novelty.severity === 'urgente'
                      ? 'border-rose-300 ring-2 ring-rose-500/10'
                      : 'border-amber-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      novelty.type === 'parto_nacimiento'
                        ? 'bg-pink-100 text-pink-700'
                        : novelty.type === 'enfermo_herido'
                        ? 'bg-amber-100 text-amber-700'
                        : novelty.type === 'muerte'
                        ? 'bg-rose-100 text-rose-700'
                        : novelty.type === 'faltante_extraviado'
                        ? 'bg-orange-100 text-orange-700'
                        : novelty.type === 'falla_infraestructura'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {novelty.type === 'parto_nacimiento' && <Baby className="w-5 h-5" />}
                      {novelty.type === 'enfermo_herido' && <HeartPulse className="w-5 h-5" />}
                      {novelty.type === 'muerte' && <Skull className="w-5 h-5" />}
                      {novelty.type === 'faltante_extraviado' && <AlertTriangle className="w-5 h-5" />}
                      {novelty.type === 'falla_infraestructura' && <Wrench className="w-5 h-5" />}
                      {novelty.type === 'recorrida_ok' && <CheckCircle2 className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {novelty.type === 'parto_nacimiento' && '👶 Nacimiento en Potrero'}
                          {novelty.type === 'enfermo_herido' && '🏥 Animal Enfermo / Tratar'}
                          {novelty.type === 'muerte' && '❌ Animal Muerto'}
                          {novelty.type === 'faltante_extraviado' && '⚠️ Animal Faltante / Extraviado'}
                          {novelty.type === 'falla_infraestructura' && '🛠️ Falla de Infraestructura'}
                          {novelty.type === 'recorrida_ok' && '🟢 Recorrida Sin Novedades'}
                        </span>

                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                          {novelty.pastureName}
                        </span>

                        {novelty.animalTag && (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
                            Tag: {novelty.animalTag}
                          </span>
                        )}

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isResolved ? 'Resuelto' : 'Pendiente'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {novelty.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                        <span>Reportado por: <strong>{novelty.reportedBy}</strong></span>
                        <span>Fecha: {novelty.date} a las {novelty.time}</span>
                        {novelty.causeOrReason && (
                          <span className="font-semibold text-slate-600">Causa: {novelty.causeOrReason}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {!isResolved && onResolveNovelty && (
                      <button
                        onClick={() => onResolveNovelty(novelty.id, 'Atendido y resuelto en campo.')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Marcar Resuelto</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredNovelties.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                No hay novedades registradas con los filtros seleccionados.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: WATER, FENCES & SALT ROUND */}
      {activeTab === 'water_fences' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-600" />
                Matriz de Inspección Diaria (Agua, Cercas y Saladeros)
              </h4>
              <p className="text-xs text-slate-500">
                Resumen de la ronda matutina para asegurar el bienestar del ganado en cada potrero
              </p>
            </div>
            <button
              onClick={() => setIsRodeoModalOpen(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Registrar Ronda del Día</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastures.map(p => {
              const lastAudit = rodeoAudits.filter(a => a.pastureId === p.id)[0];

              return (
                <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="font-mono font-black text-slate-900 text-xs">{p.code}</span>
                      <h5 className="font-bold text-xs text-emerald-800">{p.name}</h5>
                    </div>
                    <button
                      onClick={() => handleOpenRodeoForPasture(p.id)}
                      className="text-[10px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Inspeccionar
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Water Status */}
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                        <Droplets className="w-3.5 h-3.5 text-sky-600" />
                        Abrevadero / Agua:
                      </span>
                      <strong className={`text-[11px] font-bold ${
                        lastAudit?.waterStatus === 'sin_agua' || lastAudit?.waterStatus === 'escaso'
                          ? 'text-rose-600'
                          : 'text-emerald-700'
                      }`}>
                        {lastAudit ? lastAudit.waterStatus.replace('_', ' ').toUpperCase() : 'Óptimo'}
                      </strong>
                    </div>

                    {/* Fence Status */}
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        Cerca / Voltaje:
                      </span>
                      <strong className="text-[11px] font-bold text-slate-800">
                        {lastAudit ? lastAudit.fenceStatus.replace('_', ' ') : 'Intacta (7-8 kV)'}
                      </strong>
                    </div>

                    {/* Salt Status */}
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        Saladero / Minerales:
                      </span>
                      <strong className="text-[11px] font-bold text-slate-800">
                        {lastAudit ? lastAudit.saltStatus.replace('_', ' ') : 'Abundante'}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODALS */}
      {isNoveltyModalOpen && (
        <PaddockNoveltyModal
          isOpen={isNoveltyModalOpen}
          onClose={() => setIsNoveltyModalOpen(false)}
          pastures={pastures}
          animals={animals}
          preselectedPastureId={selectedPastureForAction}
          onSaveNovelty={(novelty) => {
            if (onSaveNovelty) onSaveNovelty(novelty);
            else storage.addPaddockNovelty(novelty);
          }}
        />
      )}

      {isRotationModalOpen && (
        <HerdRotationModal
          isOpen={isRotationModalOpen}
          onClose={() => setIsRotationModalOpen(false)}
          pastures={pastures}
          animals={animals}
          preselectedSourcePastureId={selectedPastureForAction}
          onSaveRotation={(rotation) => {
            if (onSaveRotation) onSaveRotation(rotation);
            else storage.addHerdRotation(rotation);
          }}
        />
      )}

      {isRodeoModalOpen && (
        <RodeoCheckModal
          isOpen={isRodeoModalOpen}
          onClose={() => setIsRodeoModalOpen(false)}
          pastures={pastures}
          preselectedPastureId={selectedPastureForAction}
          onSaveAudit={(audit) => {
            if (onSaveRodeoAudit) onSaveRodeoAudit(audit);
            else storage.addDailyRodeoAudit(audit);
          }}
        />
      )}
    </div>
  );
};
