import { createClient, Client } from '@libsql/client/web';
import { 
  FarmProfile, 
  Animal, 
  Pasture, 
  MilkRecord, 
  WeightRecord, 
  ReproductionEvent, 
  HealthRecord, 
  InventoryItem, 
  FinancialTransaction, 
  TaskAssignment, 
  SemenStraw 
} from '../types/livestock';

// Get Turso connection credentials from environment variables (compatible with Vercel and Vite)
const getTursoConfig = () => {
  const url = 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TURSO_DATABASE_URL) ||
    (typeof process !== 'undefined' && (process.env?.TURSO_DATABASE_URL || process.env?.VITE_TURSO_DATABASE_URL)) ||
    '';

  const authToken = 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TURSO_AUTH_TOKEN) ||
    (typeof process !== 'undefined' && (process.env?.TURSO_AUTH_TOKEN || process.env?.VITE_TURSO_AUTH_TOKEN)) ||
    '';

  return { url, authToken };
};

let tursoClientInstance: Client | null = null;

export function getTursoClient(): Client | null {
  const { url, authToken } = getTursoConfig();
  if (!url) return null;

  if (!tursoClientInstance) {
    try {
      tursoClientInstance = createClient({
        url,
        authToken: authToken || undefined,
      });
    } catch (e) {
      console.warn('Error al inicializar cliente Turso:', e);
      return null;
    }
  }
  return tursoClientInstance;
}

export function isTursoConfigured(): boolean {
  const { url } = getTursoConfig();
  return Boolean(url && url.startsWith('libsql://') || url.startsWith('https://'));
}

export function getTursoUrl(): string {
  const { url } = getTursoConfig();
  return url;
}

/**
 * Tests connection to the Turso database
 */
export async function testTursoConnection(): Promise<{ success: boolean; latencyMs?: number; error?: string }> {
  const client = getTursoClient();
  if (!client) {
    return { 
      success: false, 
      error: 'Variables de entorno de Turso (TURSO_DATABASE_URL / VITE_TURSO_DATABASE_URL) no configuradas.' 
    };
  }

  const start = performance.now();
  try {
    const rs = await client.execute('SELECT 1 as connected;');
    const latencyMs = Math.round(performance.now() - start);
    if (rs.rows.length > 0) {
      return { success: true, latencyMs };
    }
    return { success: false, error: 'No se obtuvo respuesta del servidor Turso.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al conectar con la base de datos Turso.' };
  }
}

/**
 * Initializes tables in the Turso LibSQL database
 */
export async function initTursoSchema(): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;

  try {
    // 1. Animals table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS animals (
        id TEXT PRIMARY KEY,
        tag_number TEXT NOT NULL UNIQUE,
        electronic_id TEXT,
        name TEXT,
        breed TEXT NOT NULL,
        category TEXT NOT NULL,
        purpose TEXT NOT NULL,
        sex TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        weight_kg REAL NOT NULL,
        pasture_id TEXT,
        lot_name TEXT,
        reproductive_status TEXT NOT NULL,
        production_status TEXT NOT NULL,
        health_status TEXT NOT NULL,
        dam_tag TEXT,
        sire_tag TEXT,
        genetic_origin TEXT,
        withdrawal_end_date TEXT,
        active_treatment_name TEXT,
        notes TEXT,
        created_at TEXT NOT NULL
      );
    `);

    // 2. Milk records
    await client.execute(`
      CREATE TABLE IF NOT EXISTS milk_records (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        shift TEXT NOT NULL,
        animal_id TEXT,
        animal_tag TEXT,
        lot_name TEXT,
        liters REAL NOT NULL,
        fat_percent REAL,
        protein_percent REAL,
        destination TEXT NOT NULL,
        created_at TEXT
      );
    `);

    // 3. Pastures table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS pastures (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        area_ha REAL NOT NULL,
        grass_type TEXT NOT NULL,
        carrying_capacity_ugm REAL,
        status TEXT NOT NULL,
        entry_date TEXT,
        days_occupied INTEGER,
        target_rest_days INTEGER,
        forage_estimate_kg_m2 REAL,
        notes TEXT
      );
    `);

    // 4. Weight records
    await client.execute(`
      CREATE TABLE IF NOT EXISTS weight_records (
        id TEXT PRIMARY KEY,
        animal_id TEXT NOT NULL,
        animal_tag TEXT NOT NULL,
        date TEXT NOT NULL,
        weight_kg REAL NOT NULL,
        adg_kg REAL,
        weighing_type TEXT NOT NULL,
        notes TEXT
      );
    `);

    // 5. Health records
    await client.execute(`
      CREATE TABLE IF NOT EXISTS health_records (
        id TEXT PRIMARY KEY,
        animal_id TEXT NOT NULL,
        animal_tag TEXT NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        disease_or_reason TEXT NOT NULL,
        medication_name TEXT NOT NULL,
        dosage TEXT,
        veterinarian TEXT,
        withdrawal_end_date TEXT,
        cost REAL NOT NULL,
        status TEXT NOT NULL
      );
    `);

    // 6. Reproduction events
    await client.execute(`
      CREATE TABLE IF NOT EXISTS reproduction_events (
        id TEXT PRIMARY KEY,
        animal_id TEXT NOT NULL,
        animal_tag TEXT NOT NULL,
        event_type TEXT NOT NULL,
        date TEXT NOT NULL,
        sire_tag_or_straw TEXT,
        pregnancy_status TEXT,
        expected_calving_date TEXT,
        calf_tag TEXT,
        calf_sex TEXT,
        observations TEXT
      );
    `);

    // 7. Inventory
    await client.execute(`
      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        sku_code TEXT NOT NULL,
        unit TEXT NOT NULL,
        current_stock REAL NOT NULL,
        min_stock_alert REAL NOT NULL,
        unit_cost REAL NOT NULL,
        expiration_date TEXT
      );
    `);

    // 8. Financial transactions
    await client.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        concept TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        notes TEXT
      );
    `);

    // 9. Farm profile
    await client.execute(`
      CREATE TABLE IF NOT EXISTS farm_profile (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        legal_id TEXT NOT NULL,
        owner_name TEXT NOT NULL,
        location TEXT NOT NULL,
        total_area_ha REAL NOT NULL,
        grazing_area_ha REAL NOT NULL,
        system_type TEXT NOT NULL,
        currency TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    return true;
  } catch (e) {
    console.error('Error al inicializar el esquema de Turso:', e);
    return false;
  }
}

/**
 * Pushes full ERP state to Turso Database
 */
export async function pushStateToTurso(data: {
  farm: FarmProfile;
  animals: Animal[];
  pastures: Pasture[];
  milkRecords: MilkRecord[];
  healthRecords: HealthRecord[];
  inventory: InventoryItem[];
  transactions: FinancialTransaction[];
}): Promise<{ success: boolean; message: string }> {
  const client = getTursoClient();
  if (!client) {
    return { success: false, message: 'Turso no está configurado.' };
  }

  try {
    await initTursoSchema();

    // 1. Sync Farm
    await client.execute({
      sql: `INSERT OR REPLACE INTO farm_profile (id, name, legal_id, owner_name, location, total_area_ha, grazing_area_ha, system_type, currency, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.farm.id,
        data.farm.name,
        data.farm.legalId,
        data.farm.ownerName,
        data.farm.location,
        data.farm.totalAreaHa,
        data.farm.grazingAreaHa,
        data.farm.systemType,
        data.farm.currency,
        new Date().toISOString()
      ]
    });

    // 2. Sync Animals in batch
    for (const a of data.animals) {
      await client.execute({
        sql: `INSERT OR REPLACE INTO animals (id, tag_number, electronic_id, name, breed, category, purpose, sex, birth_date, weight_kg, pasture_id, lot_name, reproductive_status, production_status, health_status, dam_tag, sire_tag, genetic_origin, withdrawal_end_date, active_treatment_name, notes, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          a.id,
          a.tagNumber,
          a.electronicId || null,
          a.name,
          a.breed,
          a.category,
          a.purpose,
          a.sex,
          a.birthDate,
          a.weightKg,
          a.pastureId || null,
          a.lotName || null,
          a.reproductiveStatus,
          a.productionStatus,
          a.healthStatus,
          a.damTag || null,
          a.sireTag || null,
          a.geneticOrigin || null,
          a.withdrawalEndDate || null,
          a.activeTreatmentName || null,
          a.notes || null,
          a.createdAt
        ]
      });
    }

    return { 
      success: true, 
      message: `Sincronización con Turso completada: ${data.animals.length} animales y registros actualizados en la nube.` 
    };
  } catch (err: any) {
    console.error('Error al sincronizar con Turso:', err);
    return { success: false, message: err?.message || 'Error durante la sincronización.' };
  }
}
