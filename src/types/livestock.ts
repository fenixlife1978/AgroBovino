export type AnimalCategory = 
  | 'vaca_produccion' 
  | 'vaca_seca' 
  | 'novilla_vientre' 
  | 'novillo_ceba' 
  | 'torete' 
  | 'toro_reproductor' 
  | 'ternera_leche' 
  | 'ternero_cria' 
  | 'buey';

export type AnimalBreed = 
  | 'Holstein' 
  | 'Brahman' 
  | 'Jersey' 
  | 'Girolando' 
  | 'Gyr Lechero' 
  | 'Brown Swiss' 
  | 'Simmental' 
  | 'Angus' 
  | 'Brangus' 
  | 'Nelore' 
  | 'Charolais' 
  | 'Doble Propósito' 
  | 'Criollo / Bon';

export type ReproductiveStatus = 
  | 'vacia' 
  | 'celo' 
  | 'inseminada' 
  | 'gestante' 
  | 'parida' 
  | 'en_secado' 
  | 'descarte';

export type ProductionStatus = 
  | 'ordeño' 
  | 'seca' 
  | 'crecimiento' 
  | 'ceba' 
  | 'reproductor';

export type AnimalPurpose = 'leche' | 'carne' | 'doble_proposito' | 'genetica';

export type HealthStatus = 'sano' | 'en_tratamiento' | 'cuarentena' | 'cronico';

export interface Animal {
  id: string;
  tagNumber: string; // Arete Oficial (ej. CO-104)
  electronicId?: string; // RFID / Chip
  tattoo?: string;
  name: string;
  breed: AnimalBreed;
  category: AnimalCategory;
  sex: 'M' | 'F';
  birthDate: string;
  weightKg: number;
  bodyCondition: number; // 1.0 - 5.0 (escala zootécnica)
  purpose: AnimalPurpose;
  reproductiveStatus: ReproductiveStatus;
  productionStatus: ProductionStatus;
  pastureId: string; // Potrero asignado
  lotName: string; // Lote (ej. Lote Ordeño 1, Lote Ceba B, Lote Terneraje)
  damTag?: string; // Madre
  sireTag?: string; // Padre
  geneticOrigin: string; // Nacido en finca, Comprado, FIV, Importado o personalizado
  purchasePrice?: number;
  purchaseDate?: string;
  photoUrl?: string;
  healthStatus: HealthStatus;
  quarantineReason?: string;
  withdrawalEndDate?: string; // Periodo de retiro activo para leche/carne
  activeTreatmentName?: string;
  totalLactations?: number;
  lastCalvingDate?: string;
  lastServiceDate?: string;
  estimatedCalvingDate?: string;
  notes?: string;
  createdAt: string;
}

export interface MilkRecord {
  id: string;
  date: string;
  shift: 'manana' | 'tarde' | 'noche' | 'total_dia';
  animalId?: string; // Si es individual
  animalTag?: string;
  lotName?: string; // Si es por lote
  liters: number;
  fatPercent?: number; // % Grasa
  proteinPercent?: number; // % Proteína
  somaticCellCount?: number; // Células somáticas (CCS)
  californiaMastitisTest?: 'negativo' | 'traza' | 'grado_1' | 'grado_2' | 'grado_3';
  temperatureTank?: number; // °C
  destination: 'venta_planta' | 'queseria' | 'consumo_terneros' | 'descarte_antibiotico';
  pricePerLiter?: number;
  revenue?: number;
  notes?: string;
}

export interface WeightRecord {
  id: string;
  animalId: string;
  animalTag: string;
  date: string;
  weightKg: number;
  previousWeightKg?: number;
  daysBetween?: number;
  adgKg?: number; // Ganancia Diaria de Peso (kg/día)
  weighingType: 'rutina' | 'destete' | 'ingreso_ceba' | 'salida_faena' | 'servicio';
  bodyCondition?: number;
  notes?: string;
}

export interface ReproductionEvent {
  id: string;
  animalId: string;
  animalTag: string;
  eventType: 'celo' | 'servicio_ia' | 'monta_natural' | 'palpacion' | 'ecografia' | 'parto' | 'aborto' | 'secado';
  date: string;
  sireTagOrStraw?: string; // Toro donante o código pajilla
  sireBreed?: string;
  inseminator?: string;
  pregnancyStatus?: 'positivo' | 'negativo' | 'dudoso';
  estimatedGestationDays?: number;
  expectedCalvingDate?: string;
  calvingType?: 'normal' | 'distocico' | 'cesarea' | 'gemelar';
  calfSex?: 'M' | 'F';
  calfTag?: string;
  calfWeightKg?: number;
  dryOffTreatment?: string;
  observations?: string;
}

export interface HealthRecord {
  id: string;
  animalId: string; // ID o 'LOTE_COMPLETO' o 'TODOS'
  animalTag: string;
  type: 'vacuna' | 'desparasitacion' | 'tratamiento_clinico' | 'curacion' | 'cirugia' | 'necropsia';
  date: string;
  diseaseOrReason: string;
  medicationName: string;
  dosage: string;
  administrationRoute: 'intramuscular' | 'subcutanea' | 'intravenosa' | 'intramamaria' | 'oral' | 'topica';
  batchNumber?: string;
  veterinarian: string;
  withdrawalDaysMilk: number;
  withdrawalDaysMeat: number;
  withdrawalEndDate?: string;
  cost: number;
  status: 'aplicado' | 'programado' | 'en_curso';
  notes?: string;
}

export interface Pasture {
  id: string;
  name: string;
  code: string;
  areaHa: number;
  grassType: string; // ej. Brachiaria Brizantha, Mombaza, Decumbens, Estrella
  carryingCapacityUGM: number; // Capacidad zootécnica
  status: 'ocupado' | 'descanso' | 'recuperacion' | 'mantenimiento' | 'fertilizacion';
  entryDate?: string;
  daysOccupied?: number;
  targetRestDays: number; // Días de descanso recomendados (ej. 28-35)
  forageEstimateKgM2: number; // Aforo de pastura (kg materia verde / m2)
  waterSource: 'bebedero_automatico' | 'quebrada' | 'tanque_australiano' | 'represa';
  shadePercent: number;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  category: 'medicamento' | 'vacuna' | 'balanceado_concentrado' | 'silo_heno' | 'sal_mineral' | 'pajilla_semen' | 'arete_identificacion' | 'herramienta_insumo';
  name: string;
  skuCode: string;
  unit: 'frascos' | 'dosis' | 'kg' | 'sacos_40kg' | 'toneladas' | 'pajillas' | 'unidades';
  currentStock: number;
  minStockAlert: number;
  unitCost: number;
  expirationDate?: string;
  supplier?: string;
  location?: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'ingreso' | 'egreso';
  category: 
    | 'venta_leche' 
    | 'venta_ganado_pie' 
    | 'venta_ganado_canal' 
    | 'venta_reproductores' 
    | 'subproductos_queso' 
    | 'compra_alimento' 
    | 'compra_medicamentos' 
    | 'jornales_personal' 
    | 'veterinario_asesoria' 
    | 'mantenimiento_maquinaria' 
    | 'combustible' 
    | 'compra_ganado' 
    | 'servicios_impuestos' 
    | 'otro';
  amount: number;
  concept: string;
  quantity?: number;
  unitPrice?: number;
  relatedAnimalTag?: string;
  /** Registro operativo que originó automáticamente esta transacción. */
  relatedRecordId?: string;
  paymentStatus: 'cobrado' | 'pagado' | 'pendiente';
  invoiceNumber?: string;
}

export interface TaskAssignment {
  id: string;
  title: string;
  description: string;
  category: 'sanidad' | 'reproduccion' | 'pesaje' | 'rotacion_potrero' | 'ordeño' | 'mantenimiento' | 'nutricion';
  dueDate: string;
  priority: 'urgente' | 'alta' | 'media' | 'baja';
  assignedTo: string;
  completed: boolean;
  relatedAnimalTag?: string;
}

export interface FarmProfile {
  id: string;
  name: string;
  legalId: string;
  location: string;
  totalAreaHa: number;
  grazingAreaHa: number;
  currency: string;
  systemType: 'Doble Propósito' | 'Lechería Especializada' | 'Cría y Ceba Bovina' | 'Genética Pura';
  ownerName: string;
  phone: string;
  managerName: string;
}

export interface SemenStraw {
  id: string;
  bullName: string;
  registrationCode: string;
  breed: AnimalBreed;
  canisterNumber: string; // Canastilla del termo
  gobletColor: string; // Goblet/Color
  quantityAvailable: number;
  unitCost: number;
  supplier: string;
  geneticProof: string; // ej. PTA Leche +850kg, Facilidad de parto 98%
}

export type NoveltyType = 
  | 'muerte' 
  | 'faltante_extraviado' 
  | 'enfermo_herido' 
  | 'parto_nacimiento' 
  | 'falla_infraestructura' 
  | 'recorrida_ok';

export interface PaddockNovelty {
  id: string;
  date: string;
  time: string;
  pastureId: string;
  pastureName: string;
  lotName?: string;
  type: NoveltyType;
  severity: 'info' | 'alerta' | 'urgente' | 'critico';
  animalTag?: string;
  animalId?: string;
  causeOrReason?: string; // ej. Timpanismo, Clostridiosis, Mastitis, Mordedura serpiente, etc.
  infraType?: 'cerca_electrica' | 'cerca_alambre' | 'bebedero_sin_agua' | 'bebedero_roto' | 'saladero_vacio' | 'desmoronamiento' | 'otro';
  description: string;
  reportedBy: string; // ej. Vaquero de campo, Administrador
  status: 'pendiente' | 'en_atencion' | 'resuelto';
  photoUrl?: string;
  calfTag?: string;
  calfSex?: 'M' | 'F';
  calfWeightKg?: number;
  resolutionNotes?: string;
  createdAt: string;
}

export interface HerdRotationRecord {
  id: string;
  date: string;
  lotName: string;
  sourcePastureId: string;
  sourcePastureName: string;
  targetPastureId: string;
  targetPastureName: string;
  expectedHeads: number;
  countedHeads: number;
  discrepancy: number; // countedHeads - expectedHeads
  discrepancyReason?: string; // ej. 1 novilla rezagada en corral de enfermería
  responsiblePerson: string;
  pastureForageState: 'optimo' | 'medio' | 'bajo';
  notes?: string;
  createdAt: string;
}

export interface DailyRodeoAudit {
  id: string;
  date: string;
  pastureId: string;
  pastureName: string;
  waterStatus: 'optimo_limpio' | 'escaso' | 'sucio' | 'sin_agua';
  fenceStatus: 'intacta_buen_voltaje' | 'alambre_flojo' | 'rota_requiere_reparacion';
  saltStatus: 'abundante' | 'medio' | 'vacio_recargar';
  generalHealth: 'excelente' | 'novedades_reportadas';
  checkedBy: string;
  notes?: string;
  timestamp: string;
}

