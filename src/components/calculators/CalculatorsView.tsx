import React, { useState } from 'react';
import { 
  Calculator, 
  Scale, 
  Calendar, 
  Leaf, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  HelpCircle,
  TrendingUp,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { 
  estimateWeightFromGirth, 
  calculateAdvancedPastureCarryingCapacity 
} from '../../utils/livestockCalculators';

// Pasture species presets with typical forage yields (kg FV / m2) and rest days
const PASTURE_PRESETS = [
  { name: 'Brachiaria Brizantha / Toledo', yieldKgM2: 2.8, restDays: 32, dmPercent: 22, description: 'Alta resistencia y palatabilidad' },
  { name: 'Mombaza / Tanzania (Panicum)', yieldKgM2: 4.2, restDays: 35, dmPercent: 20, description: 'Forraje voluminoso de alto rendimiento' },
  { name: 'Estrella Africana (Cynodon)', yieldKgM2: 2.4, restDays: 25, dmPercent: 24, description: 'Excelente cobertura y rápido rebrote' },
  { name: 'Kikuyo (Pennisetum - Clima Frío)', yieldKgM2: 3.1, restDays: 40, dmPercent: 19, description: 'Ideal para trópico alto lechero' },
  { name: 'Pasto de Corte / Maralfalfa / Cuba 22', yieldKgM2: 8.5, restDays: 60, dmPercent: 18, description: 'Biomasa intensiva para ensilaje o picado' },
  { name: 'Pastizal Natural / Sabana Nativa', yieldKgM2: 1.2, restDays: 45, dmPercent: 26, description: 'Baja densidad forrajera' }
];

export const CalculatorsView: React.FC = () => {
  // Tab selector for tools
  const [activeTab, setActiveTab] = useState<'carrying_capacity' | 'weight_girth' | 'gestation' | 'dry_matter'>('carrying_capacity');

  // 1. ADVANCED PASTURE CARRYING CAPACITY STATE
  const [pastureAreaHa, setPastureAreaHa] = useState<number>(3.5);
  const [foragePerM2Kg, setForagePerM2Kg] = useState<number>(2.8);
  const [selectedGrassPreset, setSelectedGrassPreset] = useState<string>('Brachiaria Brizantha / Toledo');
  const [utilizationPercent, setUtilizationPercent] = useState<number>(70); // 70% in rotational grazing
  const [dryMatterPercent, setDryMatterPercent] = useState<number>(22); // 22% DM
  const [animalWeightKg, setAnimalWeightKg] = useState<number>(450); // 1 UGM = 450kg
  const [dailyIntakePercentBW, setDailyIntakePercentBW] = useState<number>(11); // 11% body weight in fresh forage
  const [grazingDaysTarget, setGrazingDaysTarget] = useState<number>(2); // 2 days of occupation per paddock
  const [currentHerdSize, setCurrentHerdSize] = useState<number>(35); // 35 cows in the current lot

  // Calculate advanced carrying capacity results
  const carryingCapacityResult = calculateAdvancedPastureCarryingCapacity({
    areaHa: pastureAreaHa,
    foragePerM2Kg,
    utilizationPercent,
    dryMatterPercent,
    animalWeightKg,
    dailyIntakePercentBW,
    grazingDaysTarget,
    currentHerdSize
  });

  const selectedPresetObj = PASTURE_PRESETS.find(p => p.name === selectedGrassPreset);

  const applyPreset = (preset: typeof PASTURE_PRESETS[0]) => {
    setSelectedGrassPreset(preset.name);
    setForagePerM2Kg(preset.yieldKgM2);
    setDryMatterPercent(preset.dmPercent);
  };

  // 2. HEART GIRTH WEIGHT ESTIMATOR
  const [heartGirthCm, setHeartGirthCm] = useState<number>(185);
  const estimatedWeightKg = estimateWeightFromGirth(heartGirthCm);

  // 3. GESTATION & DRY-OFF CALCULATOR
  const [serviceDate, setServiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const sDate = new Date(serviceDate);
  const dryOffDate = new Date(sDate);
  dryOffDate.setDate(dryOffDate.getDate() + 220); // standard drying off at 220 days of gestation
  const calvingDate = new Date(sDate);
  calvingDate.setDate(calvingDate.getDate() + 283); // standard calving date at 283 days

  // 4. DRY MATTER (CMS) REQUIREMENT CALCULATOR
  const [cowWeightKg, setCowWeightKg] = useState<number>(550);
  const [milkYieldLiters, setMilkYieldLiters] = useState<number>(18);
  
  // Maintenance (2.2% BW) + Production (0.33 kg DM / liter)
  const maintenanceDM = cowWeightKg * 0.022;
  const productionDM = milkYieldLiters * 0.33;
  const totalDryMatterKg = (maintenanceDM + productionDM).toFixed(2);
  const freshForageNeededKg = (Number(totalDryMatterKg) / 0.22).toFixed(1); // at 22% DM in pasture

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Calculadoras Zootécnicas & Balance Forrajero Ganadero
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Herramientas de precisión agronómica para aforo de pasturas, capacidad de carga (UGM), pesaje y reproducción
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold overflow-x-auto custom-scroll w-full md:w-auto">
          <button
            onClick={() => setActiveTab('carrying_capacity')}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'carrying_capacity' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            Capacidad de Carga por Potrero
          </button>
          <button
            onClick={() => setActiveTab('weight_girth')}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'weight_girth' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-600" />
            Cinta Torácica (Peso)
          </button>
          <button
            onClick={() => setActiveTab('gestation')}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'gestation' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            Gestación & Secado
          </button>
          <button
            onClick={() => setActiveTab('dry_matter')}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dry_matter' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            Materia Seca (CMS)
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PRINCIPAL TOOL: PASTURE CARRYING CAPACITY CALCULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'carrying_capacity' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  Calculadora de Capacidad de Carga Animal & Oferta Forrajera por Potrero
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Basada en las Leyes Universales del Pastoreo Racional Voisin (PRV) y aforo zootécnico en verde.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Modelo Biológico Calibrado
                </span>
              </div>
            </div>

            {/* Pasture Grass Presets Bar */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Selección Rápida de Pastura / Especie Forrajera:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {PASTURE_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${
                      selectedGrassPreset === preset.name
                        ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="block font-semibold text-slate-900 truncate" title={preset.name}>
                        {preset.name.split('(')[0]}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        {preset.yieldKgM2} kg FV/m² • {preset.restDays}d descanso
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Grid: Area & Forage Parameters */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Left Column: Form Inputs (7 Cols) */}
              <div className="lg:col-span-7 space-y-5 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/90">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  2. Parámetros del Potrero & Oferta de Pastura
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Paddock Area */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Área del Potrero (Hectáreas):</span>
                      <span className="text-slate-400 font-mono">{(pastureAreaHa * 10000).toLocaleString()} m²</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={pastureAreaHa}
                        onChange={e => setPastureAreaHa(Math.max(0.1, parseFloat(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold font-mono focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Ha</span>
                    </div>
                  </div>

                  {/* Forage Yield per m2 */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Aforo / Oferta Forrajera:</span>
                      <span className="text-slate-400 font-mono">{(foragePerM2Kg * 10).toFixed(1)} Ton/Ha</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={foragePerM2Kg}
                        onChange={e => setForagePerM2Kg(Math.max(0.1, parseFloat(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold font-mono focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">kg FV/m²</span>
                    </div>
                  </div>

                  {/* Utilization Rate Slider */}
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Aprovechamiento / Cosecha:</span>
                      <span className="text-emerald-700 font-bold font-mono">{utilizationPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="85"
                      step="5"
                      value={utilizationPercent}
                      onChange={e => setUtilizationPercent(Number(e.target.value))}
                      className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-0.5">
                      <span>40% Extensivo</span>
                      <span>70% Rotacional</span>
                      <span>85% Cinta Diaria</span>
                    </div>
                  </div>

                  {/* Dry Matter % */}
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Materia Seca (MS):</span>
                      <span className="text-sky-700 font-bold font-mono">{dryMatterPercent}% MS</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="32"
                      step="1"
                      value={dryMatterPercent}
                      onChange={e => setDryMatterPercent(Number(e.target.value))}
                      className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-0.5">
                      <span>15% Época Lluviosa</span>
                      <span>22% Normal</span>
                      <span>32% Época Seca</span>
                    </div>
                  </div>
                </div>

                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-2 pt-2">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  3. Parámetros del Lote de Animales & Consumo
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Animal Average Weight */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Peso Promedio Animal:</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="10"
                        min="100"
                        value={animalWeightKg}
                        onChange={e => setAnimalWeightKg(Math.max(50, parseFloat(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">kg PV</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                      = {(animalWeightKg / 450).toFixed(2)} UGM
                    </span>
                  </div>

                  {/* Daily Intake % of Body Weight */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Consumo Diario (% PV):</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="5"
                        max="16"
                        value={dailyIntakePercentBW}
                        onChange={e => setDailyIntakePercentBW(Math.max(5, parseFloat(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">% Verde</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                      ~{carryingCapacityResult.dailyIntakePerAnimalKg} kg FV / vaca / día
                    </span>
                  </div>

                  {/* Target Days of Occupation */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Días Ocupación Deseados:</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={grazingDaysTarget}
                        onChange={e => setGrazingDaysTarget(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Días</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                      Voisin recomienda 1-3 días
                    </span>
                  </div>
                </div>

                {/* Herd Size Simulator */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-300/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Simulador de Lote Actual (¿Cuántos animales tienes?):
                    </label>
                    <span className="text-xs font-black text-amber-700 font-mono bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      {currentHerdSize} Cabezas
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    step="1"
                    value={currentHerdSize}
                    onChange={e => setCurrentHerdSize(Number(e.target.value))}
                    className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>5 animales</span>
                    <span>Consumo diario del lote: {carryingCapacityResult.totalHerdDailyConsumptionKg.toLocaleString()} kg FV/día</span>
                    <span>150 animales</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Results & Diagnosis (5 Cols) */}
              <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Primary Capacity Card */}
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-2xl text-white shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                        <Leaf className="w-4 h-4 text-emerald-200" />
                        Capacidad de Carga Instantánea
                      </span>
                      <span className="bg-white/20 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {grazingDaysTarget} {grazingDaysTarget === 1 ? 'Día' : 'Días'} de Pastoreo
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight">
                        {carryingCapacityResult.supportedAnimalsForTargetDays}
                      </span>
                      <span className="text-emerald-100 font-bold text-sm">
                        Bovinos de {animalWeightKg} kg
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/15 grid grid-cols-2 gap-2 text-xs font-medium">
                      <div>
                        <span className="text-emerald-200 text-[10px] block">Carga Soportada (UGM):</span>
                        <strong className="text-white text-base font-mono">
                          {carryingCapacityResult.instantaneousUGMSupported} UGM
                        </strong>
                      </div>
                      <div>
                        <span className="text-emerald-200 text-[10px] block">Densidad de Pastoreo:</span>
                        <strong className="text-white text-base font-mono">
                          {carryingCapacityResult.stockingRateUGMPerHa} UGM/Ha
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Herd Duration Result Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Duración para Lote de {currentHerdSize} Cabezas:
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono ${
                        carryingCapacityResult.daysCurrentHerdCanGraze >= grazingDaysTarget 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {carryingCapacityResult.daysCurrentHerdCanGraze} Días Totales
                      </span>
                    </div>

                    {/* Progress Bar of Herd Load */}
                    <div className="space-y-1">
                      <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            carryingCapacityResult.daysCurrentHerdCanGraze >= grazingDaysTarget 
                              ? 'bg-emerald-600' 
                              : 'bg-amber-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (carryingCapacityResult.daysCurrentHerdCanGraze / (grazingDaysTarget * 2)) * 100)}%` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>Oferta: {carryingCapacityResult.usableFreshForageTon} Ton Aprovechables</span>
                        <span>Consumo: {(carryingCapacityResult.totalHerdDailyConsumptionKg / 1000).toFixed(2)} Ton/día</span>
                      </div>
                    </div>
                  </div>

                  {/* Forage Balance Breakdown Table */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                    <h5 className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-100 pb-1.5 flex items-center justify-between">
                      <span>Balance Forrajero del Potrero:</span>
                      <span className="text-slate-500 font-normal font-mono">{pastureAreaHa} Hectáreas</span>
                    </h5>

                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="font-sans">Biomasa Total Producida:</span>
                        <strong className="text-slate-900">{carryingCapacityResult.totalFreshForageTon} Ton FV</strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="font-sans">Forraje Verde Aprovechable ({utilizationPercent}%):</span>
                        <strong className="text-emerald-700 font-bold">{carryingCapacityResult.usableFreshForageTon} Ton FV</strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="font-sans">Materia Seca Disponible ({dryMatterPercent}% MS):</span>
                        <strong className="text-sky-700">{carryingCapacityResult.totalDryMatterAvailableKg.toLocaleString()} kg MS</strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-100">
                        <span className="font-sans">Días de Descanso Recomendados:</span>
                        <strong className="text-amber-700 font-bold font-sans">
                          {selectedPresetObj ? `${selectedPresetObj.restDays} días` : '30-35 días'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agronomic Recommendation Box */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="block font-bold">Consejo Zootécnico:</strong>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      Para garantizar el punto óptimo de reposo (llamarada de crecimiento), retire el lote cuando el pasto alcance una altura remanente de 10-15 cm (remanente post-pastoreo) y proporcione <strong>{selectedPresetObj?.restDays || 32} días de descanso</strong> antes del próximo ciclo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. HEART GIRTH WEIGHT ESTIMATOR */}
      {/* ========================================================================= */}
      {activeTab === 'weight_girth' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Scale className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Estimador de Peso por Cinta Métrica (Perímetro Torácico)
              </h3>
              <p className="text-xs text-slate-500">
                Fórmula biométrica zootécnica para estimar el peso vivo en campo sin báscula electrónica.
              </p>
            </div>
          </div>

          <div className="max-w-2xl space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Perímetro Torácico (cm) - Medido detrás de las patas delanteras:
              </label>
              <input
                type="range"
                min="100"
                max="240"
                value={heartGirthCm}
                onChange={e => setHeartGirthCm(Number(e.target.value))}
                className="w-full accent-amber-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1 font-mono">
                <span>100 cm (Ternero ~110kg)</span>
                <span className="text-amber-700 font-bold text-sm bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {heartGirthCm} cm
                </span>
                <span>240 cm (Toro ~850kg)</span>
              </div>
            </div>

            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-900 font-semibold block">Peso Vivo Estimado del Bovino:</span>
                <span className="text-[11px] text-amber-700">Equivalente zootécnico: {(estimatedWeightKg / 450).toFixed(2)} UGM</span>
              </div>
              <span className="text-3xl sm:text-4xl font-black text-amber-700 font-mono">
                ~{estimatedWeightKg} kg
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. GESTATIONAL & CALVING CALENDAR */}
      {/* ========================================================================= */}
      {activeTab === 'gestation' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Calculadora Gestacional & Programador de Secado
              </h3>
              <p className="text-xs text-slate-500">
                Cálculo de fechas clave reproductivas basado en 283 días promedio de gestación bovina.
              </p>
            </div>
          </div>

          <div className="max-w-2xl space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha del Servicio / Inseminación Artificial (IA):
              </label>
              <input
                type="date"
                value={serviceDate}
                onChange={e => setServiceDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <span className="text-[10px] text-purple-800 block uppercase font-bold">Fecha de Secado (Día 220)</span>
                <strong className="text-purple-900 font-mono text-base block mt-1">
                  {dryOffDate.toISOString().split('T')[0]}
                </strong>
                <span className="text-[10px] text-purple-700 font-medium">
                  Suspender ordeño y aplicar sellador intramamario 60 días antes del parto.
                </span>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 block uppercase font-bold">Fecha Estimada de Parto (Día 283)</span>
                <strong className="text-emerald-900 font-mono text-base block mt-1">
                  {calvingDate.toISOString().split('T')[0]}
                </strong>
                <span className="text-[10px] text-emerald-700 font-medium">
                  Trasladar vaca a potrero de maternidad 15 días antes.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DRY MATTER NUTRITIONAL REQUIREMENT */}
      {/* ========================================================================= */}
      {activeTab === 'dry_matter' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="w-5 h-5 text-sky-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Requerimiento de Consumo de Materia Seca (CMS)
              </h3>
              <p className="text-xs text-slate-500">
                Balance nutricional de mantenimiento y producción láctea.
              </p>
            </div>
          </div>

          <div className="max-w-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Peso Vivo de la Vaca (Kg):</label>
                <input
                  type="number"
                  value={cowWeightKg}
                  onChange={e => setCowWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Producción Diaria de Leche (Litros):</label>
                <input
                  type="number"
                  value={milkYieldLiters}
                  onChange={e => setMilkYieldLiters(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Requerimiento Neto de Materia Seca (MS):</span>
                <strong className="text-sky-700 font-mono text-base">{totalDryMatterKg} kg MS / día</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Equivalente en Forraje Verde Fresco (22% MS):</span>
                <strong className="text-emerald-700 font-mono text-base">{freshForageNeededKg} kg Verde / día</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
