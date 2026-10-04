import React, { useState, useMemo } from 'react';
import { Scale, Plus, Calculator } from 'lucide-react';
import { WeightRecord, Animal, FarmProfile } from '../../types/livestock';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/livestockCalculators';

interface BeefViewProps {
  weightRecords: WeightRecord[];
  animals: Animal[];
  farm: FarmProfile;
  onOpenNewWeighing: (animal?: Animal) => void;
  onSelectAnimal: (animal: Animal) => void;
}

export const BeefView: React.FC<BeefViewProps> = ({
  weightRecords,
  animals,
  farm,
  onOpenNewWeighing
}) => {
  // Steers in fattening
  const steers = useMemo(() => {
    return animals.filter(a => a.category === 'novillo_ceba' || a.productionStatus === 'ceba');
  }, [animals]);

  // KPIs
  const avgSteerWeight = useMemo(() => {
    if (steers.length === 0) return 0;
    return Math.round(steers.reduce((acc, curr) => acc + curr.weightKg, 0) / steers.length);
  }, [steers]);

  const avgADG = useMemo(() => {
    const withAdg = weightRecords.filter(w => w.adgKg !== undefined && w.adgKg > 0);
    if (withAdg.length === 0) return 0.95;
    return (withAdg.reduce((acc, curr) => acc + (curr.adgKg || 0), 0) / withAdg.length).toFixed(3);
  }, [weightRecords]);

  // Carcass Yield Simulator State
  const [simWeightPie, setSimWeightPie] = useState<number>(450);
  const [simYieldPct, setSimYieldPct] = useState<number>(55.5);
  const [simPricePie, setSimPricePie] = useState<number>(2.10);
  const [simShrinkPct, setSimShrinkPct] = useState<number>(4.0);

  const effectiveWeightPie = simWeightPie * (1 - simShrinkPct / 100);
  const carcassWeightKg = (effectiveWeightPie * (simYieldPct / 100)).toFixed(1);
  const totalRevenuePie = (simWeightPie * simPricePie).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Novillos en Ceba</span>
          <span className="text-2xl font-black text-amber-600">{steers.length}</span>
          <span className="text-[10px] text-slate-500 block font-medium">Lotes de engorde activo</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Peso Promedio</span>
          <span className="text-2xl font-black text-slate-900">{avgSteerWeight} kg</span>
          <span className="text-[10px] text-slate-500 block font-medium">Meta faena: 480 kg</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">GDP Promedio</span>
          <span className="text-2xl font-black text-emerald-600">+{avgADG}</span>
          <span className="text-[10px] text-emerald-700 block font-medium">kg/animal/día</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Listo para Frigorífico</span>
          <span className="text-2xl font-black text-sky-600">
            {steers.filter(s => s.weightKg >= 450).length}
          </span>
          <span className="text-[10px] text-sky-700 block font-medium">&gt; 450 kg en pie</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Biomasa Total Ceba</span>
          <span className="text-2xl font-black text-purple-600">
            {(steers.reduce((acc, curr) => acc + curr.weightKg, 0) / 1000).toFixed(1)} Ton
          </span>
          <span className="text-[10px] text-purple-700 block font-medium">Peso vivo total lote</span>
        </div>
      </div>

      {/* Steers Grid & Carcass Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Steers Performance List */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600" />
                Lote de Engorde & Desempeño Ponderal
              </h3>
              <p className="text-xs text-slate-500">Progreso hacia el peso objetivo de mercado (480 kg)</p>
            </div>
            <button
              onClick={() => onOpenNewWeighing()}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-amber-900/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo Pesaje
            </button>
          </div>

          <div className="space-y-3">
            {steers.map((steer) => {
              const targetKg = 480;
              const progressPct = Math.min(100, Math.round((steer.weightKg / targetKg) * 100));
              const remainingKg = Math.max(0, targetKg - steer.weightKg);
              const daysToFinish = Math.round(remainingKg / (Number(avgADG) || 0.9));

              return (
                <div
                  key={steer.id}
                  className="bg-slate-50 border border-slate-200 hover:border-amber-300 rounded-xl p-4 transition-all shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-slate-900 text-base">{steer.tagNumber}</span>
                      <span className="text-xs text-emerald-700 font-bold">{steer.name}</span>
                      <Badge variant="amber" size="xs">{steer.breed}</Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-extrabold text-slate-900 text-sm">{steer.weightKg} kg</span>
                      <span className="text-slate-500 font-medium">
                        Faltan: <strong className="text-amber-700">{remainingKg} kg</strong> (~{daysToFinish} días)
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="h-2.5 bg-slate-200/80 rounded-full overflow-hidden border border-slate-200/60">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>Inicio: 250 kg</span>
                      <span className="font-bold text-amber-800">{progressPct}% del peso meta</span>
                      <span>Meta: 480 kg</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Carcass Simulator */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Calculator className="w-4 h-4 text-emerald-600" />
              Simulador de Venta & Rendimiento en Canal
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Cálculo de liquidación frigorífico, merma de báscula y rendimiento %
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Peso en Pie en Finca (Kg)</label>
                <input
                  type="number"
                  value={simWeightPie}
                  onChange={e => setSimWeightPie(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Precio / Kg en Pie ($)</label>
                <input
                  type="number"
                  step="0.05"
                  value={simPricePie}
                  onChange={e => setSimPricePie(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Rend. Canal (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={simYieldPct}
                    onChange={e => setSimYieldPct(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Merma Transp. (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={simShrinkPct}
                    onChange={e => setSimShrinkPct(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Peso en Canal Estimado:</span>
              <strong className="text-slate-900 font-mono">{carcassWeightKg} kg</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Merma de Viaje:</span>
              <span className="text-rose-600 font-mono font-semibold">-{(simWeightPie * (simShrinkPct / 100)).toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-slate-800 font-bold">Liquidación Estimada:</span>
              <span className="text-emerald-700 font-extrabold text-base font-mono">
                {formatCurrency(Number(totalRevenuePie), farm.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Weighing Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Historial de Pesajes en Báscula</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Arete Bovino</th>
                <th className="p-3.5">Peso (Kg)</th>
                <th className="p-3.5">Peso Anterior</th>
                <th className="p-3.5">Días</th>
                <th className="p-3.5">Ganancia Diaria (GDP)</th>
                <th className="p-3.5">Condición</th>
                <th className="p-3.5">Tipo</th>
                <th className="p-3.5">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {weightRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-mono font-medium">{rec.date}</td>
                  <td className="p-3.5 font-mono font-bold text-slate-900">{rec.animalTag}</td>
                  <td className="p-3.5 font-black text-slate-900 text-sm">{rec.weightKg} kg</td>
                  <td className="p-3.5">{rec.previousWeightKg ? `${rec.previousWeightKg} kg` : '-'}</td>
                  <td className="p-3.5">{rec.daysBetween || '-'}</td>
                  <td className="p-3.5">
                    {rec.adgKg !== undefined ? (
                      <span className="font-bold text-emerald-700">+{rec.adgKg} kg/d</span>
                    ) : '-'}
                  </td>
                  <td className="p-3.5 font-mono">{rec.bodyCondition ? `${rec.bodyCondition}/5.0` : '-'}</td>
                  <td className="p-3.5 capitalize font-medium">{rec.weighingType}</td>
                  <td className="p-3.5 text-slate-500">{rec.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
