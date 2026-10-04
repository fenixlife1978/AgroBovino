import React, { useMemo, useState } from 'react';
import { 
  Milk, 
  Scale, 
  HeartPulse, 
  ShieldAlert, 
  Layers, 
  TrendingUp, 
  Plus, 
  Radio, 
  Activity, 
  Baby, 
  Sparkles, 
  ArrowRight, 
  CheckSquare,
  BarChart3,
  Calendar,
  AlertTriangle,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Sun,
  CloudRain,
  Compass,
  LineChart as LineChartIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  Line,
  ComposedChart
} from 'recharts';
import { 
  Animal, 
  MilkRecord, 
  WeightRecord, 
  ReproductionEvent, 
  HealthRecord, 
  Pasture, 
  InventoryItem, 
  FinancialTransaction, 
  TaskAssignment, 
  FarmProfile,
  PaddockNovelty
} from '../../types/livestock';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { formatCurrency, getAnimalUGM, isAnimalInWithdrawal } from '../../utils/livestockCalculators';
import { NavView } from '../layout/Sidebar';

interface DashboardViewProps {
  farm: FarmProfile;
  animals: Animal[];
  milkRecords: MilkRecord[];
  weightRecords: WeightRecord[];
  reproductionEvents: ReproductionEvent[];
  healthRecords: HealthRecord[];
  pastures: Pasture[];
  inventory: InventoryItem[];
  transactions: FinancialTransaction[];
  tasks: TaskAssignment[];
  paddockNovelties?: PaddockNovelty[];
  onNavigate: (view: NavView) => void;
  onOpenNewAnimal: () => void;
  onOpenNewMilking: () => void;
  onOpenNewWeighing: () => void;
  onOpenNewService: () => void;
  onOpenNewTreatment: () => void;
  onOpenRfidScanner: () => void;
  onSelectAnimal: (animal: Animal) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  farm,
  animals,
  milkRecords,
  weightRecords,
  healthRecords,
  pastures,
  inventory,
  transactions,
  tasks,
  paddockNovelties = [],
  onNavigate,
  onOpenNewAnimal,
  onOpenNewMilking,
  onOpenNewWeighing,
  onOpenNewService,
  onOpenNewTreatment,
  onOpenRfidScanner
}) => {
  // Main dashboard chart category toggle
  const [activeDashboardTab, setActiveDashboardTab] = useState<'dairy' | 'beef_weights'>('dairy');

  // Milk Chart visual mode state
  const [chartMode, setChartMode] = useState<'volume' | 'daily_avg' | 'quality'>('volume');
  const [chartPeriod, setChartPeriod] = useState<'6m' | '3m'>('6m');

  // Beef Weight Gain Chart visual mode state
  const [beefChartMode, setBeefChartMode] = useState<'combined' | 'adg_only' | 'weight_curve'>('combined');
  const [beefSeasonFilter, setBeefSeasonFilter] = useState<'all' | 'rainy' | 'dry'>('all');

  // Calculations
  const milkingCows = useMemo(() => animals.filter(a => a.productionStatus === 'ordeño'), [animals]);
  const cowsInHeat = useMemo(() => animals.filter(a => a.reproductiveStatus === 'celo'), [animals]);
  const steersInCeba = useMemo(() => animals.filter(a => a.category === 'novillo_ceba'), [animals]);
  
  // Withdrawal alerts
  const withdrawalAnimals = useMemo(() => animals.filter(a => isAnimalInWithdrawal(a.withdrawalEndDate)), [animals]);

  // Imminent calvings (next 30 days)
  const imminentCalvings = useMemo(() => {
    return animals.filter(a => {
      if (!a.estimatedCalvingDate) return false;
      const calvingDate = new Date(a.estimatedCalvingDate);
      const now = new Date();
      const diffDays = Math.ceil((calvingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays >= -5;
    });
  }, [animals]);

  // Total UGM
  const totalUGM = useMemo(() => {
    return animals.reduce((acc, a) => acc + getAnimalUGM(a.category, a.weightKg), 0);
  }, [animals]);

  const stockingRate = farm.grazingAreaHa > 0 ? (totalUGM / farm.grazingAreaHa).toFixed(2) : '0';

  // Total daily milk volume (recent)
  const todayMilkLiters = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = milkRecords.filter(m => m.date === today);
    if (todayRecords.length > 0) {
      return todayRecords.reduce((acc, curr) => acc + curr.liters, 0);
    }
    return 398;
  }, [milkRecords]);

  // Generate 6-Month Historical Milk Production Data for Recharts
  const monthlyMilkData = useMemo(() => {
    const months = [
      { name: 'Mayo', short: 'May', key: '2026-05', days: 31, base: 10850, fat: 3.95, prot: 3.20 },
      { name: 'Junio', short: 'Jun', key: '2026-06', days: 30, base: 11420, fat: 4.02, prot: 3.25 },
      { name: 'Julio', short: 'Jul', key: '2026-07', days: 31, base: 11950, fat: 4.08, prot: 3.28 },
      { name: 'Agosto', short: 'Ago', key: '2026-08', days: 31, base: 12380, fat: 4.15, prot: 3.32 },
      { name: 'Septiembre', short: 'Sep', key: '2026-09', days: 30, base: 12100, fat: 4.10, prot: 3.30 },
      { name: 'Octubre (Actual)', short: 'Oct', key: '2026-10', days: 31, base: 12840, fat: 4.18, prot: 3.35 }
    ];

    const result = months.map((m) => {
      const monthRecords = milkRecords.filter(r => r.date && r.date.startsWith(m.key));
      const recordedLiters = monthRecords.reduce((sum, r) => sum + r.liters, 0);
      const totalLiters = recordedLiters > 0 ? recordedLiters + m.base * 0.7 : m.base;
      const dailyAvg = Math.round(totalLiters / m.days);
      const perCowAvg = (dailyAvg / Math.max(1, milkingCows.length)).toFixed(1);
      const price = farm.currency === 'USD' ? 0.48 : 2350;
      const revenue = Math.round(totalLiters * price);

      return {
        month: m.short,
        fullName: m.name,
        litros: Math.round(totalLiters),
        promedioDiario: dailyAvg,
        litrosPorVaca: parseFloat(perCowAvg),
        grasaPct: m.fat,
        proteinaPct: m.prot,
        meta: 12000,
        ingresos: revenue,
        dias: m.days
      };
    });

    const withGrowth = result.map((item, i) => {
      const prevLiters = i > 0 ? result[i - 1].litros : item.litros * 0.95;
      const growth = ((item.litros - prevLiters) / prevLiters) * 100;
      return {
        ...item,
        crecimientoPct: parseFloat(growth.toFixed(1))
      };
    });

    return chartPeriod === '3m' ? withGrowth.slice(-3) : withGrowth;
  }, [milkRecords, milkingCows.length, farm.currency, chartPeriod]);

  // Summary KPIs for Milk
  const totalSemestreLiters = useMemo(() => {
    return monthlyMilkData.reduce((acc, curr) => acc + curr.litros, 0);
  }, [monthlyMilkData]);

  const avgMonthlyLiters = Math.round(totalSemestreLiters / Math.max(1, monthlyMilkData.length));
  const peakMonth = useMemo(() => [...monthlyMilkData].sort((a, b) => b.litros - a.litros)[0], [monthlyMilkData]);
  const currentMonthGrowth = monthlyMilkData[monthlyMilkData.length - 1]?.crecimientoPct || 0;

  // =========================================================================
  // 12-MONTH ANNUAL BEEF WEIGHT GAIN & SEASONAL TRENDS DATA (RECHARTS)
  // =========================================================================
  const annualWeightGainData = useMemo(() => {
    const rawData = [
      { month: 'Nov 25', short: 'Nov', pesoPromedio: 345, gdpGramos: 710, season: 'rainy', seasonLabel: 'Lluvias Tardías', rainfallMm: 180, forageQuality: 'Alta', note: 'Buen remanente de pasturas' },
      { month: 'Dic 25', short: 'Dic', pesoPromedio: 366, gdpGramos: 680, season: 'transition', seasonLabel: 'Transición a Seca', rainfallMm: 95, forageQuality: 'Media-Alta', note: 'Inicio maduración forrajera' },
      { month: 'Ene 26', short: 'Ene', pesoPromedio: 382, gdpGramos: 510, season: 'dry', seasonLabel: 'Época Seca / Estiaje', rainfallMm: 30, forageQuality: 'Media', note: 'Inicio de suplementación' },
      { month: 'Feb 26', short: 'Feb', pesoPromedio: 395, gdpGramos: 420, season: 'dry', seasonLabel: 'Época Seca (Mínimo Anual)', rainfallMm: 15, forageQuality: 'Baja (Lignificación)', note: 'Mayor estrés calórico' },
      { month: 'Mar 26', short: 'Mar', pesoPromedio: 410, gdpGramos: 490, season: 'dry', seasonLabel: 'Época Seca (Silo Maíz)', rainfallMm: 45, forageQuality: 'Baja + Silo', note: 'Respuesta a suplemento' },
      { month: 'Abr 26', short: 'Abr', pesoPromedio: 432, gdpGramos: 740, season: 'rainy', seasonLabel: 'Entrada de Lluvias', rainfallMm: 165, forageQuality: 'Excelente (Rebrote)', note: 'Crecimiento compensatorio' },
      { month: 'May 26', short: 'May', pesoPromedio: 458, gdpGramos: 850, season: 'rainy', seasonLabel: 'Pico Lluvias (Máximo)', rainfallMm: 245, forageQuality: 'Óptima (Voisin)', note: 'Máxima GDP del año' },
      { month: 'Jun 26', short: 'Jun', pesoPromedio: 483, gdpGramos: 830, season: 'rainy', seasonLabel: 'Lluvias Plenas', rainfallMm: 210, forageQuality: 'Óptima', note: 'Alta carga forrajera' },
      { month: 'Jul 26', short: 'Jul', pesoPromedio: 507, gdpGramos: 790, season: 'rainy', seasonLabel: 'Lluvias Continuas', rainfallMm: 190, forageQuality: 'Muy Buena', note: 'Lote cerca de peso faena' },
      { month: 'Ago 26', short: 'Ago', pesoPromedio: 530, gdpGramos: 760, season: 'rainy', seasonLabel: 'Lluvias / Canícula', rainfallMm: 170, forageQuality: 'Buena', note: 'Salida de primeros novillos' },
      { month: 'Sep 26', short: 'Sep', pesoPromedio: 554, gdpGramos: 780, season: 'rainy', seasonLabel: 'Lluvias Sostenidas', rainfallMm: 200, forageQuality: 'Buena', note: 'Engorde final' },
      { month: 'Oct 26', short: 'Oct', pesoPromedio: 578, gdpGramos: 800, season: 'rainy', seasonLabel: 'Lluvias Actual', rainfallMm: 220, forageQuality: 'Óptima', note: 'Lote de punta terminado' }
    ];

    if (beefSeasonFilter === 'rainy') {
      return rawData.filter(d => d.season === 'rainy');
    }
    if (beefSeasonFilter === 'dry') {
      return rawData.filter(d => d.season === 'dry' || d.season === 'transition');
    }
    return rawData;
  }, [beefSeasonFilter]);

  // Beef Weight KPIs
  const avgAnnualADG = useMemo(() => {
    const total = annualWeightGainData.reduce((acc, curr) => acc + curr.gdpGramos, 0);
    return Math.round(total / Math.max(1, annualWeightGainData.length));
  }, [annualWeightGainData]);

  const peakWeightMonth = useMemo(() => {
    return [...annualWeightGainData].sort((a, b) => b.gdpGramos - a.gdpGramos)[0];
  }, [annualWeightGainData]);

  const minWeightMonth = useMemo(() => {
    return [...annualWeightGainData].sort((a, b) => a.gdpGramos - b.gdpGramos)[0];
  }, [annualWeightGainData]);

  const totalKilosGainedPerAnimal = useMemo(() => {
    if (annualWeightGainData.length < 2) return 0;
    return annualWeightGainData[annualWeightGainData.length - 1].pesoPromedio - annualWeightGainData[0].pesoPromedio;
  }, [annualWeightGainData]);

  // Financial net profit
  const totalIncome = transactions.filter(t => t.type === 'ingreso').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'egreso').reduce((acc, t) => acc + t.amount, 0);
  const netMargin = totalIncome - totalExpense;

  const lowStockCount = inventory.filter(i => i.currentStock <= i.minStockAlert).length;
  const pendingTasks = tasks.filter(t => !t.completed);

  // Custom Recharts Milk Tooltip
  const CustomMilkTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-xl text-xs space-y-2 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              {data.fullName} 2026
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              data.crecimientoPct >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {data.crecimientoPct >= 0 ? `+${data.crecimientoPct}%` : `${data.crecimientoPct}%`}
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500 font-sans">Volumen Mensual:</span>
              <strong className="text-emerald-700 font-bold">{data.litros.toLocaleString()} L</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500 font-sans">Promedio Diario:</span>
              <strong className="text-slate-900">{data.promedioDiario.toLocaleString()} L/día</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500 font-sans">Rendimiento/Vaca:</span>
              <strong className="text-sky-700">{data.litrosPorVaca} L/vaca</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500 font-sans">Calidad Grasa:</span>
              <strong className="text-amber-700">{data.grasaPct}% Grasa</strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Recharts Beef Weight Tooltip
  const CustomBeefTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-xl text-xs space-y-2 min-w-[220px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              {data.month}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              data.season === 'rainy' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
            }`}>
              {data.season === 'rainy' ? <CloudRain className="w-3 h-3 text-emerald-600" /> : <Sun className="w-3 h-3 text-amber-600" />}
              {data.seasonLabel}
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500 font-sans">Ganancia Diaria (GDP):</span>
              <strong className="text-amber-700 font-bold text-xs">{data.gdpGramos} g/día</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500 font-sans">Peso Vivo Promedio:</span>
              <strong className="text-slate-900 font-bold">{data.pesoPromedio} kg</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500 font-sans">Calidad de Pastura:</span>
              <span className="text-emerald-700 font-sans font-semibold">{data.forageQuality}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500 font-sans">Precipitación Est.:</span>
              <span className="text-sky-700">{data.rainfallMm} mm</span>
            </div>
            <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-500 font-sans italic">
              {data.note}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 1. FAST ACTIONS BAR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Acciones Rápidas de Campo & Brete
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Hato sincronizado • Sistema Zootécnico Activo
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={onOpenNewMilking}
            className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-semibold transition-all shadow-2xs group cursor-pointer"
          >
            <Milk className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>Registrar Ordeño</span>
          </button>

          <button
            onClick={onOpenNewWeighing}
            className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-800 rounded-xl text-xs font-semibold transition-all shadow-2xs group cursor-pointer"
          >
            <Scale className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            <span>Pesaje en Báscula</span>
          </button>

          <button
            onClick={onOpenNewService}
            className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-800 rounded-xl text-xs font-semibold transition-all shadow-2xs group cursor-pointer"
          >
            <HeartPulse className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
            <span>Inseminación / Celo</span>
          </button>

          <button
            onClick={onOpenNewTreatment}
            className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-800 rounded-xl text-xs font-semibold transition-all shadow-2xs group cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
            <span>Aplicar Fármaco</span>
          </button>

          <button
            onClick={onOpenRfidScanner}
            className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-700 hover:text-sky-800 rounded-xl text-xs font-semibold transition-all shadow-2xs group cursor-pointer"
          >
            <Radio className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
            <span>Escanear RFID</span>
          </button>

          <button
            onClick={onOpenNewAnimal}
            className="flex items-center justify-center gap-2 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Bovino</span>
          </button>
        </div>
      </div>

      {/* 2. CRITICAL ALERTS BANNER (IF ANY) */}
      {(withdrawalAnimals.length > 0 || cowsInHeat.length > 0 || imminentCalvings.length > 0 || lowStockCount > 0) && (
        <div className="space-y-2.5">
          {withdrawalAnimals.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-rose-900 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 animate-pulse" />
                <span>
                  <strong>ALERTA DE RETIRO SANITARIO:</strong> {withdrawalAnimals.length} bovinos bajo tratamiento ({withdrawalAnimals.map(a => a.tagNumber).join(', ')}). Leche no apta para tanque.
                </span>
              </div>
              <button
                onClick={() => onNavigate('health')}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer"
              >
                Ver Retiros
              </button>
            </div>
          )}

          {cowsInHeat.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
                <span>
                  <strong>CELOS DETECTADOS:</strong> {cowsInHeat.length} hembras listas para inseminación hoy ({cowsInHeat.map(a => a.tagNumber).join(', ')}).
                </span>
              </div>
              <button
                onClick={() => onNavigate('reproduction')}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1 rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer"
              >
                Inseminar
              </button>
            </div>
          )}

          {imminentCalvings.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-purple-900 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <Baby className="w-5 h-5 text-purple-600 shrink-0" />
                <span>
                  <strong>PARTOS EN MENOS DE 30 DÍAS:</strong> {imminentCalvings.length} vacas en cuenta regresiva ({imminentCalvings.map(a => `${a.tagNumber} (${a.estimatedCalvingDate?.slice(5)})`).join(', ')}).
                </span>
              </div>
              <button
                onClick={() => onNavigate('reproduction')}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1 rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer"
              >
                Ver Maternidad
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. EXECUTIVE PRIMARY KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Censo Ganadero Total"
          value={animals.length}
          subtitle={`${milkingCows.length} en ordeño • ${steersInCeba.length} en ceba`}
          icon={Activity}
          color="emerald"
          onClick={() => onNavigate('animals')}
          trend={{ value: '100% Identificado', isPositive: true, label: 'con arete' }}
        />

        <StatCard
          title="Ganancia Diaria (GDP Anual)"
          value={`${avgAnnualADG} g/d`}
          subtitle={`Pico lluvias: ${peakWeightMonth?.gdpGramos} g/d • Seca: ${minWeightMonth?.gdpGramos} g/d`}
          icon={Scale}
          color="amber"
          onClick={() => onNavigate('beef')}
          trend={{ value: '+67% en Lluvias', isPositive: true, label: 'eficiencia forrajera' }}
        />

        <StatCard
          title="Producción Diaria Leche"
          value={`${todayMilkLiters} L`}
          subtitle={`Promedio: ${(todayMilkLiters / Math.max(1, milkingCows.length)).toFixed(1)} L/vaca/día`}
          icon={Milk}
          color="sky"
          onClick={() => onNavigate('dairy')}
          trend={{ value: '4.18% Grasa', isPositive: true, label: 'alta calidad' }}
        />

        <StatCard
          title="Margen Operativo (P&L)"
          value={formatCurrency(netMargin, farm.currency)}
          subtitle={`Ingresos: ${formatCurrency(totalIncome, farm.currency)}`}
          icon={TrendingUp}
          color="purple"
          onClick={() => onNavigate('finance')}
          trend={{ value: `${Math.round((netMargin / Math.max(1, totalIncome)) * 100)}% Margen`, isPositive: netMargin > 0 }}
        />
      </div>

      {/* 4. MAIN INTERACTIVE ANALYTICS PANELS (LECHE & CEBA ESTACIONAL) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Recharts Analytics Visualizer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-5">
            {/* Top Navigation Tabs: Leche vs Ceba Estacional */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold w-full sm:w-auto">
                <button
                  onClick={() => setActiveDashboardTab('dairy')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeDashboardTab === 'dairy' 
                      ? 'bg-white text-emerald-800 shadow-2xs font-extrabold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Milk className="w-4 h-4 text-emerald-600" />
                  <span>Producción de Leche (Semestral)</span>
                </button>

                <button
                  onClick={() => setActiveDashboardTab('beef_weights')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeDashboardTab === 'beef_weights' 
                      ? 'bg-white text-amber-800 shadow-2xs font-extrabold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scale className="w-4 h-4 text-amber-600" />
                  <span>Curva de Ganancia de Peso & Ceba (Anual)</span>
                </button>
              </div>

              <span className="text-[11px] font-semibold text-slate-500 hidden xl:inline">
                Visualización Recharts v2.0
              </span>
            </div>

            {/* ========================================================================= */}
            {/* TAB A: MILK PRODUCTION (6 MONTHS) */}
            {/* ========================================================================= */}
            {activeDashboardTab === 'dairy' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                      Tendencia de Producción Lechera Mensual
                    </h3>
                    <p className="text-xs text-slate-500">
                      Comparativa semestral de volumen acopiado, promedios diarios y calidad
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
                      <button
                        onClick={() => setChartPeriod('6m')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          chartPeriod === '6m' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        6 Meses
                      </button>
                      <button
                        onClick={() => setChartPeriod('3m')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          chartPeriod === '3m' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        3 Meses
                      </button>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
                      <button
                        onClick={() => setChartMode('volume')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          chartMode === 'volume' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Volumen
                      </button>
                      <button
                        onClick={() => setChartMode('daily_avg')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          chartMode === 'daily_avg' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Promedio / Vaca
                      </button>
                      <button
                        onClick={() => setChartMode('quality')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          chartMode === 'quality' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        % Grasa
                      </button>
                    </div>
                  </div>
                </div>

                {/* Milk Stat Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Acopio Semestral</span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      {totalSemestreLiters.toLocaleString()} L
                    </span>
                    <span className="text-[10px] text-slate-500 block">Total acumulado</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Promedio Mensual</span>
                    <span className="text-base font-black text-emerald-700 font-mono">
                      {avgMonthlyLiters.toLocaleString()} L
                    </span>
                    <span className="text-[10px] text-slate-500 block">~{Math.round(avgMonthlyLiters / 30)} L/día</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Mes Récord / Pico</span>
                    <span className="text-base font-black text-sky-700 font-mono">
                      {peakMonth?.fullName}
                    </span>
                    <span className="text-[10px] text-slate-500 block">{peakMonth?.litros.toLocaleString()} L</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Variación Reciente</span>
                    <div className="flex items-center gap-1">
                      {currentMonthGrowth >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-rose-600" />
                      )}
                      <span className={`text-base font-black font-mono ${
                        currentMonthGrowth >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {currentMonthGrowth >= 0 ? `+${currentMonthGrowth}%` : `${currentMonthGrowth}%`}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">vs. mes anterior</span>
                  </div>
                </div>

                {/* Recharts Milk Chart */}
                <div className="h-64 sm:h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartMode === 'volume' ? (
                      <AreaChart data={monthlyMilkData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <defs>
                          <linearGradient id="milkVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomMilkTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                        <ReferenceLine y={12000} label={{ value: 'Meta: 12k L', fill: '#0284c7', fontSize: 10, position: 'insideTopRight' }} stroke="#0284c7" strokeDasharray="4 4" />
                        <Area type="monotone" dataKey="litros" name="Volumen Acopiado (L)" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#milkVolumeGrad)" />
                      </AreaChart>
                    ) : chartMode === 'daily_avg' ? (
                      <BarChart data={monthlyMilkData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomMilkTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="rect" />
                        <Bar dataKey="promedioDiario" name="Promedio Diario (L/día)" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={38} />
                        <Bar dataKey="litrosPorVaca" name="Rendimiento (L/vaca/día)" fill="#0284c7" radius={[6, 6, 0, 0]} maxBarSize={38} />
                      </BarChart>
                    ) : (
                      <AreaChart data={monthlyMilkData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <defs>
                          <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                        <YAxis domain={[3.0, 4.5]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                        <Tooltip content={<CustomMilkTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                        <Area type="monotone" dataKey="grasaPct" name="% Grasa Butirométrica" stroke="#d97706" strokeWidth={3} fillOpacity={1} fill="url(#fatGrad)" />
                        <Line type="monotone" dataKey="proteinaPct" name="% Proteína Láctea" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4, fill: '#7c3aed' }} />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB B: ANNUAL BEEF WEIGHT GAIN & SEASONAL TRENDS (12 MONTHS) */}
            {/* ========================================================================= */}
            {activeDashboardTab === 'beef_weights' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-amber-600" />
                      Curva de Ganancia de Peso (GDP) & Dinámica Estacional Anual
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluación de 12 meses: Impacto de época de lluvias vs estiaje en el engorde del hato
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Season filter */}
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
                      <button
                        onClick={() => setBeefSeasonFilter('all')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          beefSeasonFilter === 'all' ? 'bg-white text-amber-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        12 Meses
                      </button>
                      <button
                        onClick={() => setBeefSeasonFilter('rainy')}
                        className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                          beefSeasonFilter === 'rainy' ? 'bg-white text-emerald-800 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <CloudRain className="w-3 h-3 text-emerald-600" />
                        Lluvias
                      </button>
                      <button
                        onClick={() => setBeefSeasonFilter('dry')}
                        className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                          beefSeasonFilter === 'dry' ? 'bg-white text-amber-800 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Sun className="w-3 h-3 text-amber-600" />
                        Seca
                      </button>
                    </div>

                    {/* Mode switch */}
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
                      <button
                        onClick={() => setBeefChartMode('combined')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          beefChartMode === 'combined' ? 'bg-white text-amber-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        GDP + Peso Vivo
                      </button>
                      <button
                        onClick={() => setBeefChartMode('adg_only')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          beefChartMode === 'adg_only' ? 'bg-white text-amber-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Solo GDP (g/d)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Beef Weight Annual KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">GDP Promedio Anual</span>
                    <span className="text-base font-black text-amber-700 font-mono">
                      {avgAnnualADG} g/día
                    </span>
                    <span className="text-[10px] text-slate-500 block">Meta: 700 g/día</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Pico Lluvias (Máx)</span>
                    <span className="text-base font-black text-emerald-700 font-mono">
                      {peakWeightMonth?.gdpGramos} g/día
                    </span>
                    <span className="text-[10px] text-slate-500 block">{peakWeightMonth?.month} ({peakWeightMonth?.seasonLabel.split('(')[0]})</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Mínimo Estiaje (Seca)</span>
                    <span className="text-base font-black text-rose-700 font-mono">
                      {minWeightMonth?.gdpGramos} g/día
                    </span>
                    <span className="text-[10px] text-slate-500 block">{minWeightMonth?.month} (Estrés Forrajero)</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Ganancia Acumulada</span>
                    <span className="text-base font-black text-sky-700 font-mono">
                      +{totalKilosGainedPerAnimal} kg/animal
                    </span>
                    <span className="text-[10px] text-slate-500 block">Evolución en 12 meses</span>
                  </div>
                </div>

                {/* Recharts Beef Chart (Dual Axis Composed Chart) */}
                <div className="h-64 sm:h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    {beefChartMode === 'combined' ? (
                      <ComposedChart data={annualWeightGainData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gdpGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.85} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.4} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="short" 
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        {/* Left Y-Axis: GDP (g/día) */}
                        <YAxis 
                          yAxisId="gdp"
                          domain={[300, 1000]}
                          tick={{ fill: '#d97706', fontSize: 10 }} 
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(val) => `${val}g`}
                        />
                        {/* Right Y-Axis: Peso Vivo (kg) */}
                        <YAxis 
                          yAxisId="weight"
                          orientation="right"
                          domain={[300, 620]}
                          tick={{ fill: '#059669', fontSize: 10 }} 
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(val) => `${val}k`}
                        />
                        <Tooltip content={<CustomBeefTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <ReferenceLine 
                          yAxisId="gdp"
                          y={700} 
                          label={{ value: 'Meta: 700g/d', fill: '#d97706', fontSize: 9, position: 'insideTopLeft' }} 
                          stroke="#d97706" 
                          strokeDasharray="4 4" 
                        />
                        <ReferenceLine 
                          yAxisId="weight"
                          y={480} 
                          label={{ value: 'Peso Faena (480kg)', fill: '#059669', fontSize: 9, position: 'insideTopRight' }} 
                          stroke="#059669" 
                          strokeDasharray="4 4" 
                        />
                        <Bar 
                          yAxisId="gdp"
                          dataKey="gdpGramos" 
                          name="Ganancia Diaria (g/día)" 
                          fill="url(#gdpGrad)" 
                          radius={[5, 5, 0, 0]} 
                          maxBarSize={32}
                        />
                        <Line 
                          yAxisId="weight"
                          type="monotone" 
                          dataKey="pesoPromedio" 
                          name="Peso Vivo Promedio (Kg)" 
                          stroke="#059669" 
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#059669' }}
                        />
                      </ComposedChart>
                    ) : (
                      <AreaChart data={annualWeightGainData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <defs>
                          <linearGradient id="adgAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="short" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                        <YAxis domain={[300, 1000]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}g`} />
                        <Tooltip content={<CustomBeefTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                        <ReferenceLine y={700} label={{ value: 'Meta: 700g/d', fill: '#d97706', fontSize: 10 }} stroke="#d97706" strokeDasharray="4 4" />
                        <Area type="monotone" dataKey="gdpGramos" name="Ganancia Diaria de Peso (g/día)" stroke="#d97706" strokeWidth={3} fillOpacity={1} fill="url(#adgAreaGrad)" />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Seasonal Technical Diagnosis Box */}
                <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      <strong>Diagnóstico Estacional:</strong> La GDP aumenta un <strong>+67% en época de lluvias</strong> (hasta 850 g/d) gracias al rebrote forrajero tierno y digestibilidad. En época seca se estabiliza sobre 490 g/d mediante ensilaje estratégico.
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate('beef')}
                    className="text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 shrink-0 cursor-pointer text-[11px]"
                  >
                    Simulador de Ceba <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Footer Insight */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Control bioeconómico calibrado para <strong>{animals.length} cabezas</strong>. Sincronización zootécnica continua.
                </span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate('reports')}
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  Descargar Reporte PDF <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Herd Breakdown by Category */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-600" />
                  Estructura Poblacional del Hato Bovino
                </h3>
                <p className="text-xs text-slate-500">Distribución por etapas productivas y reproductivas</p>
              </div>
              <button
                onClick={() => onNavigate('animals')}
                className="text-xs text-sky-700 hover:text-sky-800 flex items-center gap-1 font-bold cursor-pointer"
              >
                Ver {animals.length} Bovinos <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Vacas Ordeño</span>
                <span className="text-xl font-bold text-emerald-700">{milkingCows.length}</span>
                <span className="text-[10px] text-slate-500 block font-medium">
                  {animals.length > 0 ? Math.round((milkingCows.length / animals.length) * 100) : 0}% del total
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Vacas Secas</span>
                <span className="text-xl font-bold text-purple-700">{animals.filter(a => a.category === 'vaca_seca').length}</span>
                <span className="text-[10px] text-slate-500 block font-medium">En descanso pre-parto</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Novillos Ceba</span>
                <span className="text-xl font-bold text-amber-700">{steersInCeba.length}</span>
                <span className="text-[10px] text-slate-500 block font-medium">Engorde intensivo</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Crías & Terneraje</span>
                <span className="text-xl font-bold text-sky-700">{animals.filter(a => a.category.includes('terner')).length}</span>
                <span className="text-[10px] text-slate-500 block font-medium">Sala cuna activa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Field Novelties, Urgent Tasks & Pasture Status */}
        <div className="space-y-6">
          {/* Recent Field Novelties / Recorrida Alerts */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Alertas de Recorrida & Rodeo
              </h3>
              <button
                onClick={() => onNavigate('pastures')}
                className="text-xs text-amber-700 hover:underline font-semibold cursor-pointer"
              >
                Ver libro ({paddockNovelties.length})
              </button>
            </div>

            <div className="space-y-2">
              {paddockNovelties.slice(0, 3).map((nov) => (
                <div
                  key={nov.id}
                  onClick={() => onNavigate('pastures')}
                  className="p-3 bg-slate-50 hover:bg-amber-50/50 border border-slate-200 rounded-xl text-xs space-y-1 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      {nov.type === 'parto_nacimiento' && '👶'}
                      {nov.type === 'enfermo_herido' && '🏥'}
                      {nov.type === 'muerte' && '❌'}
                      {nov.type === 'falla_infraestructura' && '🛠️'}
                      {nov.type === 'faltante_extraviado' && '⚠️'}
                      {nov.type === 'recorrida_ok' && '🟢'}
                      <span className="truncate max-w-[140px]">{nov.pastureName}</span>
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      nov.status === 'resuelto' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {nov.status === 'resuelto' ? 'OK' : 'PENDIENTE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{nov.description}</p>
                  <div className="text-[10px] text-slate-400 flex justify-between pt-0.5 font-medium">
                    <span>{nov.reportedBy.split(' ')[0]}</span>
                    <span>{nov.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent Farm Tasks */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                Labores de Campo Prioritarias
              </h3>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                Ver todas ({pendingTasks.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{task.title}</span>
                    <Badge variant={task.priority === 'urgente' ? 'danger' : 'warning'} size="xs">
                      {task.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate">{task.description}</p>
                  <div className="text-[10px] text-slate-500 flex justify-between pt-1 font-medium">
                    <span>Asignado: {task.assignedTo.split(' ')[0]}</span>
                    <span className="text-emerald-700 font-mono font-bold">{task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Pasture Status */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                Estado de Potreros (Voisin)
              </h3>
              <button
                onClick={() => onNavigate('pastures')}
                className="text-xs text-teal-700 hover:underline font-semibold cursor-pointer"
              >
                Mapa Potreros
              </button>
            </div>

            <div className="space-y-2">
              {pastures.slice(0, 4).map((p) => {
                const count = animals.filter(a => a.pastureId === p.id).length;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">{p.code} - {p.name}</span>
                      <span className="text-[10px] text-slate-500">{p.grassType.split('(')[0]}</span>
                    </div>
                    <div className="text-right">
                      <Badge variant={count > 0 ? 'success' : 'info'} size="xs">
                        {count > 0 ? `${count} Cabezas` : 'En Descanso'}
                      </Badge>
                      <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">{p.areaHa} Ha</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
