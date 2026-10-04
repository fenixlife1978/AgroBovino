import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Baby, 
  Activity, 
  ThermometerSnowflake
} from 'lucide-react';
import { ReproductionEvent, Animal, SemenStraw, Pasture } from '../../types/livestock';
import { Badge } from '../common/Badge';

interface ReproductionViewProps {
  reproductionEvents: ReproductionEvent[];
  animals: Animal[];
  semenStraws: SemenStraw[];
  pastures: Pasture[];
  onOpenNewService: (animal?: Animal) => void;
  onOpenNewCalving: (animal?: Animal) => void;
  onSelectAnimal: (animal: Animal) => void;
}

export const ReproductionView: React.FC<ReproductionViewProps> = ({
  reproductionEvents,
  animals,
  semenStraws,
  onOpenNewService,
  onOpenNewCalving,
  onSelectAnimal
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'nitrogen_tank' | 'imminent_calvings'>('events');

  // Females
  const females = useMemo(() => {
    return animals.filter(a => a.sex === 'F');
  }, [animals]);

  const pregnantCows = useMemo(() => {
    return animals.filter(a => a.reproductiveStatus === 'gestante');
  }, [animals]);

  const cowsInHeat = useMemo(() => {
    return animals.filter(a => a.reproductiveStatus === 'celo');
  }, [animals]);

  const imminentCalvingsList = useMemo(() => {
    return animals.filter(a => {
      if (!a.estimatedCalvingDate) return false;
      const calvingDate = new Date(a.estimatedCalvingDate);
      const now = new Date();
      const diffDays = Math.ceil((calvingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 45 && diffDays >= -5;
    });
  }, [animals]);

  const totalStraws = useMemo(() => {
    return semenStraws.reduce((acc, curr) => acc + curr.quantityAvailable, 0);
  }, [semenStraws]);

  const pregnancyRate = useMemo(() => {
    const breedableFemales = females.filter(f => f.category !== 'ternera_leche');
    if (breedableFemales.length === 0) return 0;
    return Math.round((pregnantCows.length / breedableFemales.length) * 100);
  }, [females, pregnantCows]);

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Tasa de Preñez</span>
          <span className="text-2xl font-black text-emerald-600">{pregnancyRate}%</span>
          <span className="text-[10px] text-emerald-700 block font-medium">Eficiencia del hato</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Hembras Gestantes</span>
          <span className="text-2xl font-black text-purple-600">{pregnantCows.length}</span>
          <span className="text-[10px] text-purple-700 block font-medium">Confirmadas por eco</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Celos Activos</span>
          <span className={`text-2xl font-black ${cowsInHeat.length > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-800'}`}>
            {cowsInHeat.length}
          </span>
          <span className="text-[10px] text-amber-700 block font-medium">Listas para IA / Monta</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Partos Próximos</span>
          <span className="text-2xl font-black text-sky-600">{imminentCalvingsList.length}</span>
          <span className="text-[10px] text-sky-700 block font-medium">Próximos 45 días</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Termo Nitrógeno</span>
          <span className="text-2xl font-black text-teal-600">{totalStraws}</span>
          <span className="text-[10px] text-teal-700 block font-medium">Pajillas disponibles</span>
        </div>
      </div>

      {/* HEAT ALERTS BANNER */}
      {cowsInHeat.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-950 flex items-center gap-2">
                ¡ALERTA DE CELOS ACTIVOS PARA INSEMINAR!
                <Badge variant="warning" size="xs">REGLA AM-PM</Badge>
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 font-medium">
                Bovinos detectados en celo:{' '}
                {cowsInHeat.map(c => `${c.tagNumber} (${c.name})`).join(', ')}.
                Inseminar en las siguientes 12 horas.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenNewService(cowsInHeat[0])}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl shrink-0 shadow-sm transition-all"
          >
            Inseminar Ahora
          </button>
        </div>
      )}

      {/* TABS & ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 border border-slate-200/90 rounded-2xl shadow-xs">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'events' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Historial de Servicios & Ecos ({reproductionEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('nitrogen_tank')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'nitrogen_tank' ? 'bg-white text-teal-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ThermometerSnowflake className="w-3.5 h-3.5 text-teal-600" />
            Termo de Nitrógeno ({semenStraws.length})
          </button>
          <button
            onClick={() => setActiveTab('imminent_calvings')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'imminent_calvings' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Baby className="w-3.5 h-3.5 text-emerald-600" />
            Partos Programados ({imminentCalvingsList.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenNewService()}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-purple-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Registrar Celo / IA / Eco
          </button>
          <button
            onClick={() => onOpenNewCalving()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all"
          >
            <Baby className="w-4 h-4" />
            Registrar Parto
          </button>
        </div>
      </div>

      {/* TAB 1: EVENTS LOG */}
      {activeTab === 'events' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Vaca / Hembra</th>
                  <th className="p-3.5">Tipo Evento</th>
                  <th className="p-3.5">Toro / Pajilla</th>
                  <th className="p-3.5">Resultado / Diagnóstico</th>
                  <th className="p-3.5">Parto Estimado</th>
                  <th className="p-3.5">Técnico / Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {reproductionEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-medium">{evt.date}</td>
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-slate-900 block">{evt.animalTag}</span>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="purple" size="xs">
                        {evt.eventType.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">
                      {evt.sireTagOrStraw || '-'}
                    </td>
                    <td className="p-3.5">
                      {evt.pregnancyStatus ? (
                        <Badge variant={evt.pregnancyStatus === 'positivo' ? 'success' : 'danger'} size="xs">
                          {evt.pregnancyStatus === 'positivo' ? 'GESTANTE (+)' : 'VACÍA (-)'}
                        </Badge>
                      ) : evt.eventType === 'parto' ? (
                        <Badge variant="success" size="xs">PARTO EXITOSO</Badge>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-emerald-700 font-bold">
                      {evt.expectedCalvingDate || '-'}
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">
                      {evt.inseminator && <strong className="text-slate-800">{evt.inseminator}: </strong>}
                      {evt.observations || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: NITROGEN TANK */}
      {activeTab === 'nitrogen_tank' && (
        <div className="space-y-4">
          <div className="bg-white border border-teal-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-2xs">
                  <ThermometerSnowflake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Termo Criogénico de Nitrógeno Líquido MVE XC 34/18
                  </h3>
                  <p className="text-xs text-teal-800 font-medium">
                    Temperatura interna: -196 °C • Nivel de Nitrógeno: 85% (Óptimo)
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-xl">
                {totalStraws} Pajillas en Stock
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {semenStraws.map((straw) => (
                <div
                  key={straw.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-2xs hover:border-teal-400 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                        {straw.breed}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">{straw.bullName}</h4>
                      <span className="text-[11px] font-mono text-slate-500 font-medium">{straw.registrationCode}</span>
                    </div>
                    <span className="text-xl font-black text-teal-700 font-mono bg-white border border-teal-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                      {straw.quantityAvailable}u
                    </span>
                  </div>

                  <div className="text-xs bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ubicación:</span>
                      <span className="text-slate-800 font-bold">{straw.canisterNumber} ({straw.gobletColor})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Proveedor:</span>
                      <span className="text-slate-700">{straw.supplier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Costo Unitario:</span>
                      <span className="text-emerald-700 font-bold">${straw.unitCost}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-emerald-800 font-semibold">
                    ⚡ {straw.geneticProof}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IMMINENT CALVINGS */}
      {activeTab === 'imminent_calvings' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Baby className="w-4 h-4 text-emerald-600" />
              Calendario de Maternidad & Partos Próximos
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Gestación promedio: 283 días
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {imminentCalvingsList.map((cow) => (
              <div
                key={cow.id}
                className="bg-slate-50 border border-slate-200 hover:border-emerald-400 rounded-xl p-4 space-y-3 transition-all shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-extrabold text-slate-900 text-base block">{cow.tagNumber}</span>
                    <span className="text-xs text-emerald-700 font-bold">{cow.name} ({cow.breed})</span>
                  </div>
                  <Badge variant="warning" size="xs">PARTO INMINENTE</Badge>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fecha Probable:</span>
                    <span className="font-bold text-emerald-700 font-mono">{cow.estimatedCalvingDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Padre Cría:</span>
                    <span className="text-slate-800 font-mono font-medium">{cow.sireTag || 'No reg.'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ubicación:</span>
                    <span className="text-slate-800 font-medium">{cow.lotName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onSelectAnimal(cow)}
                    className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg text-center transition-colors border border-slate-200"
                  >
                    Ver Ficha Vaca
                  </button>
                  <button
                    onClick={() => onOpenNewCalving(cow)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg text-center shadow-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Baby className="w-3.5 h-3.5" />
                    Registrar Parto
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
