import { Animal, AnimalCategory } from '../types/livestock';

/**
 * Retorna el coeficiente de Unidad Gran Ganado (UGM / UGG) según categoría y peso
 */
export function getAnimalUGM(category: AnimalCategory, weightKg: number): number {
  if (weightKg > 0) {
    // Estándar internacional: 1 UGM = 450 kg de peso vivo
    return Number((weightKg / 450).toFixed(2));
  }
  switch (category) {
    case 'toro_reproductor':
    case 'buey':
      return 1.2;
    case 'vaca_produccion':
    case 'vaca_seca':
      return 1.0;
    case 'novillo_ceba':
    case 'novilla_vientre':
    case 'torete':
      return 0.7;
    case 'ternera_leche':
    case 'ternero_cria':
      return 0.35;
    default:
      return 1.0;
  }
}

/**
 * Formatea la edad en formato amigable (ej. "2 años 4 meses", "8 meses", "15 días")
 */
export function formatAge(birthDateStr: string): string {
  if (!birthDateStr) return 'N/D';
  const birth = new Date(birthDateStr);
  const now = new Date();
  
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    days += 30;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years > 0) {
    return months > 0 ? `${years}a ${months}m` : `${years} años`;
  }
  if (months > 0) {
    return `${months} meses`;
  }
  return `${Math.max(1, days)} días`;
}

/**
 * Calcula la edad en meses numéricos
 */
export function getAgeInMonths(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const birth = new Date(birthDateStr);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  return Math.max(0, months);
}

/**
 * Calcula la Ganancia Diaria de Peso (GDP / ADG en kg/día)
 */
export function calculateADG(currentWeightKg: number, previousWeightKg: number, daysBetween: number): number {
  if (daysBetween <= 0 || previousWeightKg <= 0) return 0;
  const gain = currentWeightKg - previousWeightKg;
  return Number((gain / daysBetween).toFixed(3));
}

/**
 * Calcula la fecha probable de parto bovino (283 días estándar de gestación)
 */
export function calculateExpectedCalvingDate(serviceDateStr: string): string {
  if (!serviceDateStr) return '';
  const serviceDate = new Date(serviceDateStr);
  serviceDate.setDate(serviceDate.getDate() + 283);
  return serviceDate.toISOString().split('T')[0];
}

/**
 * Calcula los días de gestación transcurridos
 */
export function getGestationDays(serviceDateStr: string): number {
  if (!serviceDateStr) return 0;
  const service = new Date(serviceDateStr);
  const now = new Date();
  const diffTime = now.getTime() - service.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  return Math.min(290, diffDays);
}

/**
 * Días en leche (DIM: Days in Milk)
 */
export function getDaysInMilk(lastCalvingDateStr?: string): number {
  if (!lastCalvingDateStr) return 0;
  const calving = new Date(lastCalvingDateStr);
  const now = new Date();
  const diffTime = now.getTime() - calving.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

/**
 * Verifica si un animal está actualmente en periodo de retiro por medicamentos
 */
export function isAnimalInWithdrawal(withdrawalEndDate?: string): boolean {
  if (!withdrawalEndDate) return false;
  const end = new Date(withdrawalEndDate);
  const now = new Date();
  return end >= now;
}

/**
 * Formateador de moneda dinámico
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  const symbols: Record<string, string> = {
    USD: '$',
    COP: 'COP $',
    MXN: 'MXN $',
    BRL: 'R$',
    EUR: '€',
    ARS: 'ARS $'
  };
  const sym = symbols[currencyCode] || '$';
  return `${sym} ${amount.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Aforo de pastura y balance forrajero (Fórmula Zootécnica Voisin)
 * @param areaHa Hectáreas del potrero
 * @param kgGreenPerM2 Kilos de forraje verde por m²
 * @param dryMatterPercent % Materia Seca (aprox 20-25%)
 * @param utilizationRate % Aprovechamiento (ej. 70%)
 * @returns Capacidad de carga en días para cierto número de animales
 */
export function calculatePastureCarryingCapacity(
  areaHa: number,
  kgGreenPerM2: number,
  dryMatterPercent: number = 22,
  utilizationRate: number = 70
) {
  const totalM2 = areaHa * 10000;
  const totalGreenForageKg = totalM2 * kgGreenPerM2;
  const usableGreenKg = totalGreenForageKg * (utilizationRate / 100);
  
  // Consumo diario promedio por UGM (450kg PV) = 10-12% de su peso vivo en forraje verde = ~50kg verde/día
  const dailyConsumptionPerUGM = 50; 
  const maxUGMDays = Math.round(usableGreenKg / dailyConsumptionPerUGM);
  
  return {
    totalGreenForageKg: Math.round(totalGreenForageKg),
    usableGreenKg: Math.round(usableGreenKg),
    maxUGMDays, // Días que 1 UGM puede pastar
    capacityFor30AnimalsInDays: Math.round(maxUGMDays / 30)
  };
}

export interface AdvancedCarryingCapacityParams {
  areaHa: number;
  foragePerM2Kg: number; // Aforo en kg FV / m2
  utilizationPercent: number; // Factor de aprovechamiento (ej: 70%)
  dryMatterPercent: number; // % Materia seca (ej: 22%)
  animalWeightKg: number; // Peso vivo promedio (ej: 450 kg)
  dailyIntakePercentBW: number; // Consumo diario como % de peso vivo (ej: 11% en verde o 2.6% MS)
  grazingDaysTarget: number; // Días de ocupación deseados (ej: 1 a 3 días)
  currentHerdSize: number; // Tamaño del lote actual de animales
}

export function calculateAdvancedPastureCarryingCapacity(params: AdvancedCarryingCapacityParams) {
  const {
    areaHa,
    foragePerM2Kg,
    utilizationPercent,
    dryMatterPercent,
    animalWeightKg,
    dailyIntakePercentBW,
    grazingDaysTarget,
    currentHerdSize
  } = params;

  const totalAreaM2 = Math.max(0, areaHa) * 10000;
  const totalFreshForageKg = totalAreaM2 * Math.max(0, foragePerM2Kg);
  const usableFreshForageKg = totalFreshForageKg * (Math.max(1, utilizationPercent) / 100);
  const totalDryMatterAvailableKg = usableFreshForageKg * (Math.max(1, dryMatterPercent) / 100);

  // Consumo diario individual en forraje verde fresco
  const dailyIntakePerAnimalKg = animalWeightKg * (dailyIntakePercentBW / 100);
  const dailyDryMatterPerAnimalKg = dailyIntakePerAnimalKg * (dryMatterPercent / 100);

  // Capacidad de carga en UGM o Cabezas para el período de ocupación objetivo
  const totalAnimalDaysCapacity = dailyIntakePerAnimalKg > 0 ? usableFreshForageKg / dailyIntakePerAnimalKg : 0;
  const supportedAnimalsForTargetDays = grazingDaysTarget > 0 ? Math.floor(totalAnimalDaysCapacity / grazingDaysTarget) : 0;
  
  // Capacidad en días para el lote actual introducido
  const totalHerdDailyConsumptionKg = Math.max(1, currentHerdSize) * dailyIntakePerAnimalKg;
  const daysCurrentHerdCanGraze = totalHerdDailyConsumptionKg > 0 ? Number((usableFreshForageKg / totalHerdDailyConsumptionKg).toFixed(1)) : 0;

  // Carga instantánea y global (UGM / Hectárea)
  const animalUGMValue = animalWeightKg / 450;
  const instantaneousUGMSupported = supportedAnimalsForTargetDays * animalUGMValue;
  const stockingRateUGMPerHa = areaHa > 0 ? Number((instantaneousUGMSupported / areaHa).toFixed(2)) : 0;

  return {
    totalFreshForageKg: Math.round(totalFreshForageKg),
    totalFreshForageTon: Number((totalFreshForageKg / 1000).toFixed(2)),
    usableFreshForageKg: Math.round(usableFreshForageKg),
    usableFreshForageTon: Number((usableFreshForageKg / 1000).toFixed(2)),
    totalDryMatterAvailableKg: Math.round(totalDryMatterAvailableKg),
    dailyIntakePerAnimalKg: Number(dailyIntakePerAnimalKg.toFixed(1)),
    dailyDryMatterPerAnimalKg: Number(dailyDryMatterPerAnimalKg.toFixed(2)),
    supportedAnimalsForTargetDays,
    instantaneousUGMSupported: Number(instantaneousUGMSupported.toFixed(1)),
    daysCurrentHerdCanGraze,
    stockingRateUGMPerHa,
    totalHerdDailyConsumptionKg: Math.round(totalHerdDailyConsumptionKg)
  };
}

/**
 * Estimación de peso corporal por perímetro torácico (Cinta bovinométrica)
 * Fórmula Crevat / Quetelet para bovinos: Peso (kg) = (PT² * LC) / 10838 o regresión estándar
 */
export function estimateWeightFromGirth(heartGirthCm: number): number {
  if (heartGirthCm <= 0) return 0;
  // Regresión estándar zootécnica: W = 0.000085 * (PT^2.85) aproximado o tabla calibrada
  // Tabla estándar: 150cm = ~290kg, 180cm = ~470kg, 200cm = ~620kg
  const weight = Math.pow(heartGirthCm, 2.75) * 0.00035;
  return Math.round(weight);
}
