import React, { useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Baby,
  HeartPulse,
  Milk,
  PawPrint,
  Radio,
  Scale,
  ShieldAlert,
  Sparkles,
  CheckSquare,
  Map,
  Plus
} from 'lucide-react';
import type {
  Animal,
  FarmProfile,
  HealthRecord,
  MilkRecord,
  Pasture,
  TaskAssignment,
  WeightRecord
} from '../../types/livestock';
import type { NavView } from '../layout/Sidebar';

interface VaqueroDashboardProps {
  farm: FarmProfile;
  animals: Animal[];
  milkRecords: MilkRecord[];
  weightRecords: WeightRecord[];
  healthRecords: HealthRecord[];
  pastures: Pasture[];
  tasks: TaskAssignment[];
  onNavigate: (view: NavView) => void;
  onOpenNewAnimal: () => void;
  onOpenNewMilking: () => void;
  onOpenNewWeighing: () => void;
  onOpenNewService: () => void;
  onOpenNewTreatment: () => void;
  onOpenRfidScanner: () => void;
}

export const VaqueroDashboard: React.FC<VaqueroDashboardProps> = ({
  farm,
  animals,
  milkRecords,
  weightRecords,
  healthRecords,
  pastures,
  tasks,
  onNavigate,
  onOpenNewAnimal,
  onOpenNewMilking,
  onOpenNewWeighing,
  onOpenNewService,
  onOpenNewTreatment,
  onOpenRfidScanner
}) => {
  const today = new Date().toISOString().split('T')[0];

  const todayMilk = useMemo(
    () => milkRecords.filter(r => r.date === today).reduce((sum, r) => sum + r.liters, 0),
    [milkRecords, today]
  );

  const withdrawalAnimals = useMemo(
    () => animals.filter(a => a.withdrawalEndDate && a.withdrawalEndDate >= today),
    [animals, today]
  );

  const imminentCalvings = useMemo(
    () => animals.filter(a => {
      if (!a.estimatedCalvingDate) return false;
      const diff = Math.ceil(
        (new Date(a.estimatedCalvingDate).getTime() - new Date(today).getTime()) /
        (1000 * 60 * 60 * 24)
      );
      return diff >= 0 && diff <= 15;
    }),
    [animals, today]
  );

  const cowsInHeat = useMemo(
    () => animals.filter(a => a.reproductiveStatus === 'celo'),
    [animals]
  );

  const pendingTasks = useMemo(
    () => tasks.filter(t => !t.completed),
    [tasks]
  );

  const recentWeights = useMemo(
    () => [...weightRecords].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 5),
    [weightRecords]
  );

  const recentHealth = useMemo(
    () => [...healthRecords].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 5),
    [healthRecords]
  );

  const actionClass = 'flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-700 to-emerald-900 p-5 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-wider">
              <PawPrint className="w-4 h-4" />
              Panel de Campo
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold">Bienvenido, Vaquero</h2>
            <p className="mt-1 text-sm text-emerald-100">{farm.name} · {farm.location}</p>
            <p className="mt-3 max-w-2xl text-xs sm:text-sm text-white/80">
              Este panel contiene únicamente las herramientas operativas autorizadas para el trabajo diario de campo.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 min-w-[230px]">
            <div className="rounded-xl bg-white/10 border border-white/10 p-3">
              <div className="text-[10px] uppercase tracking-wide text-emerald-200">Bovinos</div>
              <div className="mt-1 text-2xl font-black">{animals.length}</div>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/10 p-3">
              <div className="text-[10px] uppercase tracking-wide text-emerald-200">Leche hoy</div>
              <div className="mt-1 text-2xl font-black">{todayMilk.toLocaleString('es-VE')} L</div>
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Acciones de campo</h3>
            <p className="text-xs text-slate-500">Registros que el Vaquero puede ejecutar directamente.</p>
          </div>
          <Sparkles className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button className={actionClass} onClick={onOpenNewMilking}><Milk className="w-4 h-4 text-emerald-600" />Ordeño</button>
          <button className={actionClass} onClick={onOpenNewWeighing}><Scale className="w-4 h-4 text-amber-600" />Pesaje</button>
          <button className={actionClass} onClick={onOpenNewService}><HeartPulse className="w-4 h-4 text-purple-600" />Reproducción</button>
          <button className={actionClass} onClick={onOpenNewTreatment}><ShieldAlert className="w-4 h-4 text-rose-600" />Tratamiento</button>
          <button className={actionClass} onClick={onOpenRfidScanner}><Radio className="w-4 h-4 text-sky-600" />Escanear RFID</button>
          <button className={actionClass} onClick={onOpenNewAnimal}><Plus className="w-4 h-4 text-emerald-600" />Nuevo bovino</button>
        </div>
      </section>

      {(withdrawalAnimals.length > 0 || cowsInHeat.length > 0 || imminentCalvings.length > 0 || pendingTasks.length > 0) && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {withdrawalAnimals.length > 0 && (
            <button onClick={() => onNavigate('health')} className="text-left rounded-xl border border-rose-200 bg-rose-50 p-4 hover:bg-rose-100 transition">
              <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm"><ShieldAlert className="w-4 h-4" /> Retiros sanitarios</div>
              <p className="mt-1 text-xs text-rose-700">{withdrawalAnimals.length} bovinos requieren atención por periodo de retiro.</p>
            </button>
          )}
          {cowsInHeat.length > 0 && (
            <button onClick={() => onNavigate('reproduction')} className="text-left rounded-xl border border-amber-200 bg-amber-50 p-4 hover:bg-amber-100 transition">
              <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm"><Activity className="w-4 h-4" /> Celos detectados</div>
              <p className="mt-1 text-xs text-amber-700">{cowsInHeat.length} hembras en celo registradas.</p>
            </button>
          )}
          {imminentCalvings.length > 0 && (
            <button onClick={() => onNavigate('reproduction')} className="text-left rounded-xl border border-purple-200 bg-purple-50 p-4 hover:bg-purple-100 transition">
              <div className="flex items-center gap-2 text-purple-800 font-extrabold text-sm"><Baby className="w-4 h-4" /> Partos próximos</div>
              <p className="mt-1 text-xs text-purple-700">{imminentCalvings.length} partos previstos en los próximos 15 días.</p>
            </button>
          )}
          {pendingTasks.length > 0 && (
            <button onClick={() => onNavigate('tasks')} className="text-left rounded-xl border border-sky-200 bg-sky-50 p-4 hover:bg-sky-100 transition">
              <div className="flex items-center gap-2 text-sky-800 font-extrabold text-sm"><CheckSquare className="w-4 h-4" /> Tareas pendientes</div>
              <p className="mt-1 text-xs text-sky-700">{pendingTasks.length} actividades pendientes de ejecución.</p>
            </button>
          )}
        </section>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button onClick={() => onNavigate('animals')} className="rounded-2xl bg-white border border-slate-200 p-4 text-left shadow-sm hover:border-emerald-300 transition">
          <PawPrint className="w-5 h-5 text-emerald-600" />
          <div className="mt-3 text-2xl font-black text-slate-900">{animals.length}</div>
          <div className="text-xs font-semibold text-slate-500">Ganado registrado</div>
        </button>
        <button onClick={() => onNavigate('dairy')} className="rounded-2xl bg-white border border-slate-200 p-4 text-left shadow-sm hover:border-emerald-300 transition">
          <Milk className="w-5 h-5 text-emerald-600" />
          <div className="mt-3 text-2xl font-black text-slate-900">{todayMilk.toLocaleString('es-VE')}</div>
          <div className="text-xs font-semibold text-slate-500">Litros registrados hoy</div>
        </button>
        <button onClick={() => onNavigate('pastures')} className="rounded-2xl bg-white border border-slate-200 p-4 text-left shadow-sm hover:border-emerald-300 transition">
          <Map className="w-5 h-5 text-green-600" />
          <div className="mt-3 text-2xl font-black text-slate-900">{pastures.length}</div>
          <div className="text-xs font-semibold text-slate-500">Potreros</div>
        </button>
        <button onClick={() => onNavigate('tasks')} className="rounded-2xl bg-white border border-slate-200 p-4 text-left shadow-sm hover:border-emerald-300 transition">
          <CheckSquare className="w-5 h-5 text-sky-600" />
          <div className="mt-3 text-2xl font-black text-slate-900">{pendingTasks.length}</div>
          <div className="text-xs font-semibold text-slate-500">Tareas pendientes</div>
        </button>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Últimos pesajes</h3>
              <p className="text-[11px] text-slate-500">Consulta operativa de campo</p>
            </div>
            <Scale className="w-4 h-4 text-amber-600" />
          </div>
          <div className="space-y-2">
            {recentWeights.length ? recentWeights.map(record => (
              <div key={record.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <div className="text-xs font-semibold text-slate-700">{record.animalTag}</div>
                <div className="text-xs text-slate-500">{record.weightKg} kg · {record.date}</div>
              </div>
            )) : <p className="text-xs text-slate-400">No hay pesajes registrados.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Últimas atenciones sanitarias</h3>
              <p className="text-[11px] text-slate-500">Tratamientos y vacunas registrados</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="space-y-2">
            {recentHealth.length ? recentHealth.map(record => (
              <div key={record.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-700 truncate">{record.animalTag}</div>
                  <div className="text-[10px] text-slate-500 truncate">{record.medicationName || record.diseaseOrReason}</div>
                </div>
                <div className="text-[10px] text-slate-500 shrink-0">{record.date}</div>
              </div>
            )) : <p className="text-xs text-slate-400">No hay registros sanitarios.</p>}
          </div>
        </div>
      </section>

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
        <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
        Acceso restringido: Inventario, Transacciones, Usuarios, Configuración y reinicio del sistema no forman parte del panel del Vaquero.
      </div>
    </div>
  );
};
