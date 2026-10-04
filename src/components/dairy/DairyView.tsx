import React, { useState, useMemo } from 'react';
import { Plus, Download, TrendingUp, ShieldCheck } from 'lucide-react';
import { MilkRecord, Animal, FarmProfile } from '../../types/livestock';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/livestockCalculators';

interface DairyViewProps {
  milkRecords: MilkRecord[];
  animals: Animal[];
  farm: FarmProfile;
  onOpenNewRecord: () => void;
  onDeleteRecord: (id: string) => void;
}

export const DairyView: React.FC<DairyViewProps> = ({
  milkRecords,
  animals,
  farm,
  onOpenNewRecord,
  onDeleteRecord
}) => {
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'bulk_tank'>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const milkingCows = useMemo(() => {
    return animals.filter(a => a.productionStatus === 'ordeño');
  }, [animals]);

  const filteredRecords = useMemo(() => {
    return milkRecords.filter(r => {
      const matchesType = filterType === 'all' || 
        (filterType === 'individual' ? !!r.animalId : !r.animalId);
      const matchesDate = !dateFilter || r.date === dateFilter;
      return matchesType && matchesDate;
    });
  }, [milkRecords, filterType, dateFilter]);

  // KPIs
  const totalRevenue = useMemo(() => {
    return milkRecords.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  }, [milkRecords]);

  const avgFat = useMemo(() => {
    const withFat = milkRecords.filter(r => r.fatPercent);
    if (withFat.length === 0) return 3.9;
    return (withFat.reduce((acc, curr) => acc + (curr.fatPercent || 0), 0) / withFat.length).toFixed(2);
  }, [milkRecords]);

  const avgPerCow = useMemo(() => {
    if (milkingCows.length === 0) return 0;
    return (385 / milkingCows.length).toFixed(1);
  }, [milkingCows]);

  const mastitisCount = useMemo(() => {
    return milkRecords.filter(r => r.californiaMastitisTest && r.californiaMastitisTest !== 'negativo').length;
  }, [milkRecords]);

  // Export
  const handleExportCSV = () => {
    const headers = ['Fecha', 'Turno', 'Arete_Vaca', 'Lote_Tanque', 'Litros', 'Grasa_Pct', 'Proteina_Pct', 'CMT_Mastitis', 'Destino', 'Ingreso_Total'];
    const rows = filteredRecords.map(r => [
      r.date,
      r.shift,
      r.animalTag || '',
      r.lotName || '',
      r.liters,
      r.fatPercent || '',
      r.proteinPercent || '',
      r.californiaMastitisTest || '',
      r.destination,
      r.revenue || 0
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Produccion_Lechera_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Vacas en Ordeño</span>
          <span className="text-2xl font-black text-slate-900">{milkingCows.length}</span>
          <span className="text-[10px] text-emerald-700 block font-medium">Ordeño activo diario</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Promedio / Vaca</span>
          <span className="text-2xl font-black text-emerald-600">{avgPerCow} L/d</span>
          <span className="text-[10px] text-slate-500 block font-medium">Eficiencia zootécnica</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">% Grasa Promedio</span>
          <span className="text-2xl font-black text-amber-600">{avgFat}%</span>
          <span className="text-[10px] text-amber-700 block font-medium">Calidad y sólidos</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Alertas Mastitis</span>
          <span className={`text-2xl font-black ${mastitisCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {mastitisCount}
          </span>
          <span className="text-[10px] text-slate-500 block font-medium">Casos detectados CMT</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Ventas Leche</span>
          <span className="text-2xl font-black text-sky-600">{formatCurrency(totalRevenue, farm.currency)}</span>
          <span className="text-[10px] text-sky-700 block font-medium">Acopio registrado</span>
        </div>
      </div>

      {/* Production Chart & CMT Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart representation */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Curva de Acopio Diario en Tanque Frío (Litros)
              </h3>
              <p className="text-xs text-slate-500">Rendimiento semanal consolidado</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
              Meta: 400 L/día
            </span>
          </div>

          {/* Clean bars */}
          <div className="space-y-3 pt-2">
            {[
              { day: 'Lun 28 Sep', liters: 380, pct: 95 },
              { day: 'Mar 29 Sep', liters: 395, pct: 98 },
              { day: 'Mié 30 Sep', liters: 410, pct: 102 },
              { day: 'Jue 01 Oct', liters: 392, pct: 98 },
              { day: 'Vie 02 Oct', liters: 385, pct: 96 },
              { day: 'Hoy 03 Oct', liters: 398, pct: 99 }
            ].map((bar, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">{bar.day}</span>
                  <span className="font-mono font-bold text-slate-900">{bar.liters} L</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, bar.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality & CMT Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              Protocolo de Calidad & Mastitis (CMT)
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              California Mastitis Test semanal para prevención de células somáticas y retiros.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Temperatura Tanque Frío:</span>
                <span className="font-mono font-bold text-sky-700">3.8 °C (Óptimo)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Conteo Células Somáticas:</span>
                <span className="font-mono font-bold text-emerald-700">&lt; 180,000 / ml</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Precio Base + Bonificación:</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(0.53, farm.currency)} / L</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 block mb-2 font-medium">
              Leche con antibiótico debe desviarse directamente a descarte.
            </span>
            <button
              onClick={onOpenNewRecord}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Registrar Nuevo Ordeño
            </button>
          </div>
        </div>
      </div>

      {/* Production Log Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewRecord}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo Ordeño
            </button>

            {/* Type selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterType === 'all' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterType('individual')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterType === 'individual' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Individual
              </button>
              <button
                onClick={() => setFilterType('bulk_tank')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterType === 'bulk_tank' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tanque General
              </button>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors self-end sm:self-auto shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Exportar Historial
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Turno</th>
                <th className="p-3.5">Origen / Bovino</th>
                <th className="p-3.5">Litros</th>
                <th className="p-3.5">% Grasa / Prot.</th>
                <th className="p-3.5">CMT / Calidad</th>
                <th className="p-3.5">Destino</th>
                <th className="p-3.5">Valor Liquidado</th>
                <th className="p-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-mono font-medium">{rec.date}</td>
                  <td className="p-3.5 capitalize font-semibold">{rec.shift.replace('_', ' ')}</td>
                  <td className="p-3.5">
                    {rec.animalTag ? (
                      <div>
                        <span className="font-mono font-bold text-slate-900">{rec.animalTag}</span>
                        <span className="text-[10px] text-slate-500 block">{rec.lotName}</span>
                      </div>
                    ) : (
                      <span className="font-bold text-emerald-700">{rec.lotName}</span>
                    )}
                  </td>
                  <td className="p-3.5 font-black text-slate-900 text-sm">{rec.liters} L</td>
                  <td className="p-3.5">
                    {rec.fatPercent ? `${rec.fatPercent}% G / ${rec.proteinPercent || '-'}% P` : '-'}
                  </td>
                  <td className="p-3.5">
                    {rec.californiaMastitisTest ? (
                      <Badge variant={rec.californiaMastitisTest === 'negativo' ? 'success' : 'danger'} size="xs">
                        {rec.californiaMastitisTest.toUpperCase()}
                      </Badge>
                    ) : (
                      <span className="text-slate-500 font-medium">Estándar Tanque</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <Badge variant={rec.destination === 'descarte_antibiotico' ? 'danger' : 'default'} size="xs">
                      {rec.destination.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-700">
                    {rec.revenue ? formatCurrency(rec.revenue, farm.currency) : '-'}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onDeleteRecord(rec.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors font-bold text-sm"
                      title="Eliminar"
                    >
                      ×
                    </button>
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
