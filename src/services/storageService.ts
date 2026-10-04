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
  SemenStraw,
  PaddockNovelty,
  HerdRotationRecord,
  DailyRodeoAudit
} from '../types/livestock';

import {
  INITIAL_FARM,
  INITIAL_ANIMALS,
  INITIAL_PASTURES,
  INITIAL_MILK_RECORDS,
  INITIAL_WEIGHT_RECORDS,
  INITIAL_REPRODUCTION_EVENTS,
  INITIAL_HEALTH_RECORDS,
  INITIAL_INVENTORY,
  INITIAL_SEMEN_STRAWS,
  INITIAL_TRANSACTIONS,
  INITIAL_TASKS,
  INITIAL_PADDOCK_NOVELTIES,
  INITIAL_HERD_ROTATIONS,
  INITIAL_RODEO_AUDITS
} from './initialData';

const STORAGE_KEYS = {
  FARM: 'agro_farm_profile',
  ANIMALS: 'agro_animals',
  PASTURES: 'agro_pastures',
  MILK_RECORDS: 'agro_milk_records',
  WEIGHT_RECORDS: 'agro_weight_records',
  REPRODUCTION_EVENTS: 'agro_reproduction_events',
  HEALTH_RECORDS: 'agro_health_records',
  INVENTORY: 'agro_inventory',
  SEMEN_STRAWS: 'agro_semen_straws',
  TRANSACTIONS: 'agro_transactions',
  TASKS: 'agro_tasks',
  PADDOCK_NOVELTIES: 'agro_paddock_novelties',
  HERD_ROTATIONS: 'agro_herd_rotations',
  RODEO_AUDITS: 'agro_rodeo_audits'
};

class StorageService {
  private cloudSyncTimer: ReturnType<typeof setTimeout> | null = null;
  private cloudHydrating = false;
  private cloudVersion: number | null = null;
  private cloudReadMissing = false;
  private cloudReadFailed = false;

  // AgroBovino es una finca única: el identificador cloud es estable y no depende
  // de lo que exista en el navegador. Esto evita que un localStorage antiguo
  // pueda apuntar accidentalmente a otra "finca" y convertirse en una fuente paralela.
  private getCloudKey(): string {
    return 'farm-01';
  }

  private scheduleCloudSync(): void {
    if (this.cloudHydrating || typeof window === 'undefined') return;
    if (this.cloudSyncTimer) clearTimeout(this.cloudSyncTimer);
    this.cloudSyncTimer = setTimeout(() => { void this.syncToCloud(); }, 750);
  }

  private async syncToCloud(): Promise<boolean> {
    try {
      const state = JSON.parse(this.exportFullBackup());
      const response = await fetch('/api/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmId: this.getCloudKey(), state, version: this.cloudVersion }),
      });
      if (!response.ok) {
        if (response.status === 409) {
          console.warn('AgroBovino: conflicto de versión en Turso; se descarta el snapshot local en conflicto y se recarga la versión canónica de Turso.');
          await this.hydrateFromCloud();
        } else {
          console.warn('AgroBovino: no se pudo sincronizar con Turso.', response.status);
        }
        return;
      }
      const saved = await response.json();
      if (Number.isInteger(saved?.version)) this.cloudVersion = saved.version;
      return true;
    } catch (error) {
      console.warn('AgroBovino: sincronización cloud no disponible; se mantiene modo local.', error);
      return false;
    }
  }

  async initializeCloud(): Promise<'hydrated' | 'initialized' | 'failed'> {
    if (typeof window === 'undefined') return 'failed';
    this.cloudReadMissing = false;
    this.cloudReadFailed = false;
    try {
      const hydrated = await this.hydrateFromCloud();
      if (hydrated) return 'hydrated';

      // Si Turso no tiene estado, NO se reutiliza el localStorage existente:
      // Turso es la fuente de verdad. Se crea el estado canónico únicamente
      // con los datos iniciales de la aplicación.
      if (this.cloudReadMissing) {
        this.resetLocalToInitialData();
        const initialized = await this.syncToCloud();
        return initialized ? 'initialized' : 'failed';
      }

      return 'failed';
    } catch (error) {
      console.warn('AgroBovino: no se pudo inicializar la persistencia cloud.', error);
      return 'failed';
    }
  }

  async hydrateFromCloud(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    this.cloudHydrating = true;
    try {
      const response = await fetch(`/api/state?farmId=${encodeURIComponent(this.getCloudKey())}`, { cache: 'no-store' });
      if (response.status === 404) {
        this.cloudReadMissing = true;
        return false;
      }
      if (!response.ok) {
        this.cloudReadFailed = true;
        return false;
      }
      const payload = await response.json();
      if (!payload?.found || !payload.state) {
        this.cloudReadMissing = true;
        return false;
      }
      this.cloudVersion = Number.isInteger(payload.version) ? payload.version : null;
      return this.importFullBackup(JSON.stringify(payload.state), false);
    } catch (error) {
      this.cloudReadFailed = true;
      console.warn('AgroBovino: no se pudo hidratar desde Turso.', error);
      return false;
    } finally {
      this.cloudHydrating = false;
    }
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error loading from localStorage [${key}]:`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.scheduleCloudSync();
    } catch (e) {
      console.error(`Error saving to localStorage [${key}]:`, e);
    }
  }

  // Farm Profile
  getFarm(): FarmProfile {
    return this.getItem<FarmProfile>(STORAGE_KEYS.FARM, INITIAL_FARM);
  }

  saveFarm(farm: FarmProfile): void {
    this.setItem(STORAGE_KEYS.FARM, farm);
  }

  // Animals
  getAnimals(): Animal[] {
    return this.getItem<Animal[]>(STORAGE_KEYS.ANIMALS, INITIAL_ANIMALS);
  }

  saveAnimals(animals: Animal[]): void {
    this.setItem(STORAGE_KEYS.ANIMALS, animals);
  }

  addAnimal(animal: Animal): void {
    const animals = this.getAnimals();
    animals.unshift(animal);
    this.saveAnimals(animals);
  }

  updateAnimal(animal: Animal): void {
    const animals = this.getAnimals().map(a => a.id === animal.id ? animal : a);
    this.saveAnimals(animals);
  }

  deleteAnimal(id: string): void {
    const animals = this.getAnimals().filter(a => a.id !== id);
    this.saveAnimals(animals);
  }

  // Pastures
  getPastures(): Pasture[] {
    return this.getItem<Pasture[]>(STORAGE_KEYS.PASTURES, INITIAL_PASTURES);
  }

  savePastures(pastures: Pasture[]): void {
    this.setItem(STORAGE_KEYS.PASTURES, pastures);
  }

  addPasture(pasture: Pasture): void {
    const pastures = this.getPastures();
    pastures.push(pasture);
    this.savePastures(pastures);
  }

  updatePasture(pasture: Pasture): void {
    const pastures = this.getPastures().map(p => p.id === pasture.id ? pasture : p);
    this.savePastures(pastures);
  }

  deletePasture(id: string): void {
    const pastures = this.getPastures().filter(p => p.id !== id);
    this.savePastures(pastures);
  }

  // Milk Records
  getMilkRecords(): MilkRecord[] {
    return this.getItem<MilkRecord[]>(STORAGE_KEYS.MILK_RECORDS, INITIAL_MILK_RECORDS);
  }

  saveMilkRecords(records: MilkRecord[]): void {
    this.setItem(STORAGE_KEYS.MILK_RECORDS, records);
  }

  addMilkRecord(record: MilkRecord): void {
    const records = this.getMilkRecords();
    records.unshift(record);
    this.saveMilkRecords(records);
  }

  deleteMilkRecord(id: string): void {
    const records = this.getMilkRecords().filter(r => r.id !== id);
    this.saveMilkRecords(records);
  }

  // Weight Records
  getWeightRecords(): WeightRecord[] {
    return this.getItem<WeightRecord[]>(STORAGE_KEYS.WEIGHT_RECORDS, INITIAL_WEIGHT_RECORDS);
  }

  saveWeightRecords(records: WeightRecord[]): void {
    this.setItem(STORAGE_KEYS.WEIGHT_RECORDS, records);
  }

  addWeightRecord(record: WeightRecord): void {
    const records = this.getWeightRecords();
    records.unshift(record);
    this.saveWeightRecords(records);

    // Update animal's current weight
    const animals = this.getAnimals();
    const targetAnimal = animals.find(a => a.id === record.animalId);
    if (targetAnimal) {
      targetAnimal.weightKg = record.weightKg;
      if (record.bodyCondition) {
        targetAnimal.bodyCondition = record.bodyCondition;
      }
      this.saveAnimals(animals);
    }
  }

  // Reproduction Events
  getReproductionEvents(): ReproductionEvent[] {
    return this.getItem<ReproductionEvent[]>(STORAGE_KEYS.REPRODUCTION_EVENTS, INITIAL_REPRODUCTION_EVENTS);
  }

  saveReproductionEvents(events: ReproductionEvent[]): void {
    this.setItem(STORAGE_KEYS.REPRODUCTION_EVENTS, events);
  }

  addReproductionEvent(event: ReproductionEvent): void {
    const events = this.getReproductionEvents();
    events.unshift(event);
    this.saveReproductionEvents(events);

    // Update target animal's reproductive status
    const animals = this.getAnimals();
    const animal = animals.find(a => a.id === event.animalId);
    if (animal) {
      if (event.eventType === 'celo') {
        animal.reproductiveStatus = 'celo';
      } else if (event.eventType === 'servicio_ia' || event.eventType === 'monta_natural') {
        animal.reproductiveStatus = 'inseminada';
        animal.lastServiceDate = event.date;
      } else if (event.eventType === 'palpacion' || event.eventType === 'ecografia') {
        if (event.pregnancyStatus === 'positivo') {
          animal.reproductiveStatus = 'gestante';
          animal.estimatedCalvingDate = event.expectedCalvingDate;
        } else if (event.pregnancyStatus === 'negativo') {
          animal.reproductiveStatus = 'vacia';
          animal.estimatedCalvingDate = undefined;
        }
      } else if (event.eventType === 'parto') {
        animal.reproductiveStatus = 'parida';
        animal.lastCalvingDate = event.date;
        animal.totalLactations = (animal.totalLactations || 0) + 1;
        animal.productionStatus = animal.purpose === 'leche' || animal.purpose === 'doble_proposito' ? 'ordeño' : 'crecimiento';
      } else if (event.eventType === 'secado') {
        animal.reproductiveStatus = 'en_secado';
        animal.productionStatus = 'seca';
      }
      this.saveAnimals(animals);
    }
  }

  // Health Records
  getHealthRecords(): HealthRecord[] {
    return this.getItem<HealthRecord[]>(STORAGE_KEYS.HEALTH_RECORDS, INITIAL_HEALTH_RECORDS);
  }

  saveHealthRecords(records: HealthRecord[]): void {
    this.setItem(STORAGE_KEYS.HEALTH_RECORDS, records);
  }

  addHealthRecord(record: HealthRecord): void {
    const records = this.getHealthRecords();
    records.unshift(record);
    this.saveHealthRecords(records);

    // If applied to individual animal and has withdrawal period
    if (record.animalId && record.animalId !== 'TODOS' && record.withdrawalEndDate) {
      const animals = this.getAnimals();
      const animal = animals.find(a => a.id === record.animalId);
      if (animal) {
        animal.healthStatus = 'en_tratamiento';
        animal.withdrawalEndDate = record.withdrawalEndDate;
        animal.activeTreatmentName = `${record.medicationName} (${record.diseaseOrReason})`;
        this.saveAnimals(animals);
      }
    }
  }

  // Inventory
  getInventory(): InventoryItem[] {
    return this.getItem<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
  }

  saveInventory(items: InventoryItem[]): void {
    this.setItem(STORAGE_KEYS.INVENTORY, items);
  }

  addInventoryItem(item: InventoryItem): void {
    const items = this.getInventory();
    items.unshift(item);
    this.saveInventory(items);
  }

  updateInventoryItem(item: InventoryItem): void {
    const items = this.getInventory().map(i => i.id === item.id ? item : i);
    this.saveInventory(items);
  }

  deleteInventoryItem(id: string): void {
    const items = this.getInventory().filter(i => i.id !== id);
    this.saveInventory(items);
  }

  // Semen Straws
  getSemenStraws(): SemenStraw[] {
    return this.getItem<SemenStraw[]>(STORAGE_KEYS.SEMEN_STRAWS, INITIAL_SEMEN_STRAWS);
  }

  saveSemenStraws(straws: SemenStraw[]): void {
    this.setItem(STORAGE_KEYS.SEMEN_STRAWS, straws);
  }

  addSemenStraw(straw: SemenStraw): void {
    const straws = this.getSemenStraws();
    straws.unshift(straw);
    this.saveSemenStraws(straws);
  }

  // Financial Transactions
  getTransactions(): FinancialTransaction[] {
    return this.getItem<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }

  saveTransactions(transactions: FinancialTransaction[]): void {
    this.setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
  }

  addTransaction(tx: FinancialTransaction): void {
    const transactions = this.getTransactions();
    transactions.unshift(tx);
    this.saveTransactions(transactions);
  }

  deleteTransaction(id: string): void {
    const transactions = this.getTransactions().filter(t => t.id !== id);
    this.saveTransactions(transactions);
  }

  // Tasks
  getTasks(): TaskAssignment[] {
    return this.getItem<TaskAssignment[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  }

  saveTasks(tasks: TaskAssignment[]): void {
    this.setItem(STORAGE_KEYS.TASKS, tasks);
  }

  addTask(task: TaskAssignment): void {
    const tasks = this.getTasks();
    tasks.unshift(task);
    this.saveTasks(tasks);
  }

  toggleTask(id: string): void {
    const tasks = this.getTasks().map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    this.saveTasks(tasks);
  }

  deleteTask(id: string): void {
    const tasks = this.getTasks().filter(t => t.id !== id);
    this.saveTasks(tasks);
  }

  // =========================================================================
  // FIELD RECORRIDA & NOVELTIES (RECORREDOR / RODEO / ROTACIÓN)
  // =========================================================================

  getPaddockNovelties(): PaddockNovelty[] {
    return this.getItem<PaddockNovelty[]>(STORAGE_KEYS.PADDOCK_NOVELTIES, INITIAL_PADDOCK_NOVELTIES);
  }

  savePaddockNovelties(novelties: PaddockNovelty[]): void {
    this.setItem(STORAGE_KEYS.PADDOCK_NOVELTIES, novelties);
  }

  addPaddockNovelty(novelty: PaddockNovelty): void {
    const novelties = this.getPaddockNovelties();
    novelties.unshift(novelty);
    this.savePaddockNovelties(novelties);

    // Automated field effects based on novelty type:
    const animals = this.getAnimals();

    if (novelty.type === 'muerte' && (novelty.animalId || novelty.animalTag)) {
      const target = animals.find(a => (novelty.animalId && a.id === novelty.animalId) || (novelty.animalTag && a.tagNumber === novelty.animalTag));
      if (target) {
        target.reproductiveStatus = 'descarte';
        target.notes = `${target.notes || ''} [MUERTE REPORTADA ${novelty.date}: ${novelty.causeOrReason || novelty.description}]`;
        this.saveAnimals(animals);
      }
    } else if (novelty.type === 'enfermo_herido' && (novelty.animalId || novelty.animalTag)) {
      const target = animals.find(a => (novelty.animalId && a.id === novelty.animalId) || (novelty.animalTag && a.tagNumber === novelty.animalTag));
      if (target) {
        target.healthStatus = 'en_tratamiento';
        target.activeTreatmentName = novelty.causeOrReason || 'Atención en recorrida';
        this.saveAnimals(animals);
      }
      // Create task for veterinary review
      this.addTask({
        id: `task-san-${Date.now()}`,
        title: `Revisión Veterinaria / Tratamiento: ${novelty.animalTag || 'Animal de Potrero'}`,
        description: `Novedad de recorrida en ${novelty.pastureName}: ${novelty.description}`,
        category: 'sanidad',
        dueDate: novelty.date,
        priority: 'urgente',
        assignedTo: novelty.reportedBy || 'Médico Veterinario',
        completed: false,
        relatedAnimalTag: novelty.animalTag
      });
    } else if (novelty.type === 'parto_nacimiento' && novelty.calfTag) {
      // Create newborn calf automatically
      const dam = animals.find(a => (novelty.animalId && a.id === novelty.animalId) || (novelty.animalTag && a.tagNumber === novelty.animalTag));
      if (dam) {
        dam.reproductiveStatus = 'parida';
        dam.lastCalvingDate = novelty.date;
        dam.totalLactations = (dam.totalLactations || 0) + 1;
        this.saveAnimals(animals);
      }
      const newCalf: Animal = {
        id: `anim-calf-${Date.now()}`,
        tagNumber: novelty.calfTag,
        name: `Cría de ${dam ? dam.name : 'Potrero'}`,
        breed: dam ? dam.breed : 'Doble Propósito',
        category: (novelty.calfSex === 'M' ? 'ternero_cria' : 'ternera_leche') as any,
        sex: novelty.calfSex || 'F',
        birthDate: novelty.date,
        weightKg: novelty.calfWeightKg || 35,
        bodyCondition: 3.5,
        purpose: dam ? dam.purpose : 'doble_proposito',
        reproductiveStatus: 'vacia',
        productionStatus: 'crecimiento',
        pastureId: novelty.pastureId,
        lotName: novelty.lotName || 'Lote Sala Cuna / Terneras',
        damTag: dam?.tagNumber,
        geneticOrigin: 'nacido_finca',
        healthStatus: 'sano',
        notes: `Nacido en potrero ${novelty.pastureName}. ${novelty.description}`,
        createdAt: new Date().toISOString()
      };
      this.addAnimal(newCalf);
    } else if (novelty.type === 'falla_infraestructura') {
      // Create infrastructure repair task
      this.addTask({
        id: `task-infra-${Date.now()}`,
        title: `Reparación: ${novelty.infraType?.replace('_', ' ').toUpperCase() || 'Infraestructura'} en ${novelty.pastureName}`,
        description: novelty.description,
        category: 'mantenimiento',
        dueDate: novelty.date,
        priority: novelty.severity === 'urgente' || novelty.severity === 'critico' ? 'urgente' : 'alta',
        assignedTo: 'Equipo de Mantenimiento / Vaquería',
        completed: false
      });
    }
  }

  resolvePaddockNovelty(id: string, resolutionNotes?: string): void {
    const novelties = this.getPaddockNovelties().map(n => {
      if (n.id === id) {
        return {
          ...n,
          status: 'resuelto' as const,
          resolutionNotes: resolutionNotes || 'Atendido y solventado por el equipo de campo.'
        };
      }
      return n;
    });
    this.savePaddockNovelties(novelties);
  }

  deletePaddockNovelty(id: string): void {
    const novelties = this.getPaddockNovelties().filter(n => n.id !== id);
    this.savePaddockNovelties(novelties);
  }

  // Herd Rotations (Gate / Chute counting)
  getHerdRotations(): HerdRotationRecord[] {
    return this.getItem<HerdRotationRecord[]>(STORAGE_KEYS.HERD_ROTATIONS, INITIAL_HERD_ROTATIONS);
  }

  saveHerdRotations(rotations: HerdRotationRecord[]): void {
    this.setItem(STORAGE_KEYS.HERD_ROTATIONS, rotations);
  }

  addHerdRotation(rotation: HerdRotationRecord): void {
    const rotations = this.getHerdRotations();
    rotations.unshift(rotation);
    this.saveHerdRotations(rotations);

    // 1. Move animals belonging to this lot or source pasture to target pasture
    const animals = this.getAnimals();
    let movedCount = 0;
    animals.forEach(a => {
      const matchLot = rotation.lotName && a.lotName === rotation.lotName;
      const matchPasture = !rotation.lotName && a.pastureId === rotation.sourcePastureId;
      if (matchLot || matchPasture) {
        a.pastureId = rotation.targetPastureId;
        movedCount++;
      }
    });
    this.saveAnimals(animals);

    // 2. Update pastures occupancy & rest
    const pastures = this.getPastures();
    const sourcePast = pastures.find(p => p.id === rotation.sourcePastureId);
    const targetPast = pastures.find(p => p.id === rotation.targetPastureId);

    if (sourcePast) {
      // Check if source pasture still has animals
      const remainingInSource = animals.filter(a => a.pastureId === sourcePast.id).length;
      if (remainingInSource === 0) {
        sourcePast.status = 'descanso';
        sourcePast.daysOccupied = 0;
      }
    }

    if (targetPast) {
      targetPast.status = 'ocupado';
      targetPast.entryDate = rotation.date;
      targetPast.daysOccupied = 1;
    }

    this.savePastures(pastures);
  }

  // Daily Rodeo / Recorrida Audits
  getDailyRodeoAudits(): DailyRodeoAudit[] {
    return this.getItem<DailyRodeoAudit[]>(STORAGE_KEYS.RODEO_AUDITS, INITIAL_RODEO_AUDITS);
  }

  saveDailyRodeoAudits(audits: DailyRodeoAudit[]): void {
    this.setItem(STORAGE_KEYS.RODEO_AUDITS, audits);
  }

  addDailyRodeoAudit(audit: DailyRodeoAudit): void {
    const audits = this.getDailyRodeoAudits();
    audits.unshift(audit);
    this.saveDailyRodeoAudits(audits);
  }

  // Full backup & restore
  exportFullBackup(): string {
    const backup = {
      farm: this.getFarm(),
      animals: this.getAnimals(),
      pastures: this.getPastures(),
      milkRecords: this.getMilkRecords(),
      weightRecords: this.getWeightRecords(),
      reproductionEvents: this.getReproductionEvents(),
      healthRecords: this.getHealthRecords(),
      inventory: this.getInventory(),
      semenStraws: this.getSemenStraws(),
      transactions: this.getTransactions(),
      tasks: this.getTasks(),
      paddockNovelties: this.getPaddockNovelties(),
      herdRotations: this.getHerdRotations(),
      rodeoAudits: this.getDailyRodeoAudits(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(backup, null, 2);
  }

  importFullBackup(jsonString: string, syncToCloud = true): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.farm) this.saveFarm(data.farm);
      if (data.animals) this.saveAnimals(data.animals);
      if (data.pastures) this.savePastures(data.pastures);
      if (data.milkRecords) this.saveMilkRecords(data.milkRecords);
      if (data.weightRecords) this.saveWeightRecords(data.weightRecords);
      if (data.reproductionEvents) this.saveReproductionEvents(data.reproductionEvents);
      if (data.healthRecords) this.saveHealthRecords(data.healthRecords);
      if (data.inventory) this.saveInventory(data.inventory);
      if (data.semenStraws) this.saveSemenStraws(data.semenStraws);
      if (data.transactions) this.saveTransactions(data.transactions);
      if (data.tasks) this.saveTasks(data.tasks);
      if (data.paddockNovelties) this.savePaddockNovelties(data.paddockNovelties);
      if (data.herdRotations) this.saveHerdRotations(data.herdRotations);
      if (data.rodeoAudits) this.saveDailyRodeoAudits(data.rodeoAudits);
      if (syncToCloud) this.scheduleCloudSync();
      return true;
    } catch (e) {
      console.error('Error importing backup:', e);
      return false;
    }
  }

  private resetLocalToInitialData(): void {
    localStorage.clear();
    this.saveFarm(INITIAL_FARM);
    this.saveAnimals(INITIAL_ANIMALS);
    this.savePastures(INITIAL_PASTURES);
    this.saveMilkRecords(INITIAL_MILK_RECORDS);
    this.saveWeightRecords(INITIAL_WEIGHT_RECORDS);
    this.saveReproductionEvents(INITIAL_REPRODUCTION_EVENTS);
    this.saveHealthRecords(INITIAL_HEALTH_RECORDS);
    this.saveInventory(INITIAL_INVENTORY);
    this.saveSemenStraws(INITIAL_SEMEN_STRAWS);
    this.saveTransactions(INITIAL_TRANSACTIONS);
    this.saveTasks(INITIAL_TASKS);
    this.savePaddockNovelties(INITIAL_PADDOCK_NOVELTIES);
    this.saveHerdRotations(INITIAL_HERD_ROTATIONS);
    this.saveDailyRodeoAudits(INITIAL_RODEO_AUDITS);
  }

  resetToDemoData(): void {
    localStorage.clear();
    this.saveFarm(INITIAL_FARM);
    this.saveAnimals(INITIAL_ANIMALS);
    this.savePastures(INITIAL_PASTURES);
    this.saveMilkRecords(INITIAL_MILK_RECORDS);
    this.saveWeightRecords(INITIAL_WEIGHT_RECORDS);
    this.saveReproductionEvents(INITIAL_REPRODUCTION_EVENTS);
    this.saveHealthRecords(INITIAL_HEALTH_RECORDS);
    this.saveInventory(INITIAL_INVENTORY);
    this.saveSemenStraws(INITIAL_SEMEN_STRAWS);
    this.saveTransactions(INITIAL_TRANSACTIONS);
    this.saveTasks(INITIAL_TASKS);
    this.savePaddockNovelties(INITIAL_PADDOCK_NOVELTIES);
    this.saveHerdRotations(INITIAL_HERD_ROTATIONS);
    this.saveDailyRodeoAudits(INITIAL_RODEO_AUDITS);
  }
}

export const storage = new StorageService();
