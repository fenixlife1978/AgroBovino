import React, { useState, useMemo } from 'react';
import { Plus, AlertTriangle, ShieldCheck } from 'lucide-react';
import { HealthRecord, Animal, FarmProfile } from '../../types/livestock';
import { Badge } from '../common/Badge';
import { isAnimalInWithdrawal, formatCurrency } from '../../utils/livestockCalculators';

interface HealthViewProps {
  healthRecords: HealthRecord[];
  animals: Animal[];
  farm: FarmProfile;
  onOpenNewTreatment: (animal?: Animal) => void;
  onSelectAnimal: (animal: Animal) => void;
}

export const HealthView: React.FC<HealthViewProps> = ({
  healthRecords,
  animals,
  farm,
  onOpenNewTreatment
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  // Animals with active withdrawal
  const animalsInWithdrawal = useMemo(() => {
    return animals.filter(a => isAnimalInWithdrawal(a.withdrawalEndDate));
  }, [animals]);

  const healthyCount = useMemo(() => {
    return animals.filter(a => a.healthStatus === 'sano' && !isAnimalInWithdrawal(a.withdrawalEndDate)).length;
  }, [animals]);

  const totalSanitaryCost = useMemo(() => {
    return healthRecords.reduce((acc, curr) => acc + (curr.cost || 0), 0);
  }, [healthRecords]);

  const filteredRecords = useMemo(() => {
    return healthRecords.filter(r => {
      if (filterType === 'all') return true;
      return r.type === filterType;
    });
  }, [healthRecords, filterType]);

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Índice Salud Hato</span>
          <span className="text-2xl font-black text-emerald-600">
            {Math.round((healthyCount / Math.max(1, animals.length)) * 100)}%
          </span>
          <span className="text-[10px] text-emerald-700 block font-medium">Animales 100% sanos</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Retiros Activos</span>
          <span className={`text-2xl font-black ${animalsInWithdrawal.length > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
            {animalsInWithdrawal.length}
          </span>
          <span className="text-[10px] text-rose-700 block font-medium">Bloqueo leche / faena</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">En Tratamiento</span>
          <span className="text-2xl font-black text-amber-600">
            {animals.filter(a => a.healthStatus === 'en_tratamiento').length}
          </span>
          <span className="text-[10px] text-amber-700 block font-medium">Bajo supervisión médica</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Plan Oficial Aftosa</span>
          <span className="text-2xl font-black text-sky-600">AL DÍA</span>
          <span className="text-[10px] text-sky-700 block font-medium">Certificado RUV Vigente</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Gasto Sanitario</span>
          <span className="text-2xl font-black text-purple-600">{formatCurrency(totalSanitaryCost, farm.currency)}</span>
          <span className="text-[10px] text-purple-700 block font-medium">Medicamentos & Vacunas</span>
        </div>
      </div>

      {/* ACTIVE WITHDRAWAL LOCK ALERTS */}
      {animalsInWithdrawal.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 animate-pulse">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-rose-900 uppercase tracking-wide">
                  ⚠️ PROTOCOLO DE RETIRO ACTIVO - CONTROL DE INOCUIDAD
                </h3>
                <p className="text-xs text-rose-800 font-medium">
                  Los siguientes bovinos están en periodo de descarte obligatorio de leche o retención para faena.
                </p>
              </div>
            </div>
            <Badge variant="danger" size="md">BLOQUEO ACTIVO</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {animalsInWithdrawal.map((animal) => (
              <div
                key={animal.id}
                className="bg-white border border-rose-200 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-900 text-sm">{animal.tagNumber}</span>
                    <span className="text-xs text-rose-700 font-bold">{animal.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 font-medium">
                    Tratamiento: <strong>{animal.activeTreatmentName || 'Fármaco veterinario'}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-medium">Fin de Retiro:</span>
                  <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                    {animal.withdrawalEndDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Vaccination Plan Matrix */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Plan Sanitario Oficial & Calendario Preventivo
            </h3>
            <p className="text-xs text-slate-500">Cumplimiento de normatividad zoosanitaria (ICA / SENASA / SAGARPA)</p>
          </div>
          <button
            onClick={() => onOpenNewTreatment()}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-rose-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Registrar Tratamiento / Vacuna
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-50 p-4 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Fiebre Aftosa & Brucelosis</span>
              <Badge variant="success" size="xs">VIGENTE</Badge>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">Ciclo I 2026 aplicado al 100% del hato. Próximo ciclo en Noviembre.</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Clostridiosis & Carbón</span>
              <Badge variant="success" size="xs">VIGENTE</Badge>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">Vacuna 8 vías aplicada a terneraje y novillos de levante.</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Baño Garrapaticida / Ectoparásitos</span>
              <Badge variant="warning" size="xs">PROGRAMAR</Badge>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">Último baño hace 35 días. Recomendado rotación de principio activo.</p>
          </div>
        </div>
      </div>

      {/* Full Veterinary Log Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {['all', 'vacuna', 'tratamiento_clinico', 'desparasitacion'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg capitalize transition-all ${
                  filterType === type ? 'bg-white text-rose-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type === 'all' ? 'Todos los Registros' : type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Bovino / Lote</th>
                <th className="p-3.5">Tipo</th>
                <th className="p-3.5">Enfermedad / Diagnóstico</th>
                <th className="p-3.5">Medicamento & Dosis</th>
                <th className="p-3.5">Vía</th>
                <th className="p-3.5">Retiro Leche / Carne</th>
                <th className="p-3.5">Veterinario</th>
                <th className="p-3.5">Costo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-mono font-medium">{rec.date}</td>
                  <td className="p-3.5 font-mono font-bold text-slate-900">{rec.animalTag}</td>
                  <td className="p-3.5">
                    <Badge variant={rec.type === 'vacuna' ? 'info' : 'danger'} size="xs">
                      {rec.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{rec.diseaseOrReason}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 block">{rec.medicationName}</span>
                    <span className="text-[10px] text-slate-500 block font-medium">{rec.dosage}</span>
                  </td>
                  <td className="p-3.5 capitalize font-medium">{rec.administrationRoute}</td>
                  <td className="p-3.5">
                    {rec.withdrawalDaysMilk > 0 || rec.withdrawalDaysMeat > 0 ? (
                      <Badge variant="warning" size="xs">
                        {rec.withdrawalDaysMilk}d Leche / {rec.withdrawalDaysMeat}d Carne
                      </Badge>
                    ) : (
                      <span className="text-emerald-700 font-bold">0 días (Sin retiro)</span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-600 font-medium">{rec.veterinarian}</td>
                  <td className="p-3.5 font-mono font-bold text-emerald-700">
                    {rec.cost ? formatCurrency(rec.cost, farm.currency) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
