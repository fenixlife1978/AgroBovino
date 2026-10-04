import React, { useState, useEffect, useMemo } from 'react';
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
  PaddockNovelty,
  HerdRotationRecord,
  DailyRodeoAudit,
  FarmProfile,
  SemenStraw
} from './types/livestock';
import { storage } from './services/storageService';
import { isAnimalInWithdrawal } from './utils/livestockCalculators';
import { getCurrentUser, logout, type AuthUser } from './auth';
import { LoginPage } from './components/auth/LoginPage';
import { UserManagementModal } from './components/users/UserManagementModal';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavView } from './components/layout/Sidebar';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { AnimalsView } from './components/animals/AnimalsView';
import { DairyView } from './components/dairy/DairyView';
import { ReproductionView } from './components/reproduction/ReproductionView';
import { BeefView } from './components/beef/BeefView';
import { HealthView } from './components/health/HealthView';
import { PasturesView } from './components/pastures/PasturesView';
import { InventoryView } from './components/inventory/InventoryView';
import { FinanceView } from './components/finance/FinanceView';
import { TasksView } from './components/tasks/TasksView';
import { ReportsView } from './components/reports/ReportsView';
import { CalculatorsView } from './components/calculators/CalculatorsView';

// Modals
import { AnimalDetailModal } from './components/animals/AnimalDetailModal';
import { AnimalFormModal } from './components/animals/AnimalFormModal';
import { BatchActionModal } from './components/animals/BatchActionModal';
import { RfidScannerModal } from './components/animals/RfidScannerModal';
import { MilkRecordModal } from './components/dairy/MilkRecordModal';
import { ServiceRecordModal } from './components/reproduction/ServiceRecordModal';
import { CalvingRecordModal } from './components/reproduction/CalvingRecordModal';
import { WeighingModal } from './components/beef/WeighingModal';
import { TreatmentModal } from './components/health/TreatmentModal';
import { PastureModal } from './components/pastures/PastureModal';
import { InventoryItemModal } from './components/inventory/InventoryItemModal';
import { TransactionModal } from './components/finance/TransactionModal';
import { TaskModal } from './components/tasks/TaskModal';
import { FarmSettingsModal } from './components/farm-settings/FarmSettingsModal';
import { Modal } from './components/common/Modal';
import { Milk, Scale, HeartPulse, ShieldAlert, Plus, Layers, DollarSign, Package, LogOut } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudError, setCloudError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getCurrentUser().then(async (currentUser) => {
      if (cancelled) return;
      setUser(currentUser);
      if (!currentUser) {
        setAuthLoading(false);
        return;
      }
      const result = await storage.initializeCloud();
      if (cancelled) return;
      if (result === 'failed') {
        console.error('AgroBovino: Turso no pudo ser confirmado como fuente de verdad. Se bloquea la sesión operativa para evitar trabajar contra datos locales obsoletos.');
        setCloudError(true);
        setAuthLoading(false);
        return;
      }
      setCloudReady(true);
      setFarm(storage.getFarm());
      setAnimals(storage.getAnimals());
      setPastures(storage.getPastures());
      setMilkRecords(storage.getMilkRecords());
      setWeightRecords(storage.getWeightRecords());
      setReproductionEvents(storage.getReproductionEvents());
      setHealthRecords(storage.getHealthRecords());
      setInventory(storage.getInventory());
      setSemenStraws(storage.getSemenStraws());
      setTransactions(storage.getTransactions());
      setTasks(storage.getTasks());
      setPaddockNovelties(storage.getPaddockNovelties());
      setHerdRotations(storage.getHerdRotations());
      setRodeoAudits(storage.getDailyRodeoAudits());
      setAuthLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-sm font-semibold">Conectando con AgroBovino…</p>
          <p className="mt-1 text-xs text-white/60">Verificando la fuente de datos Turso</p>
        </div>
      </div>
    );
  }

  if (user && cloudError && !cloudReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-red-400/20 bg-white/5 p-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-300">!</div>
          <h1 className="text-lg font-bold">Datos no disponibles</h1>
          <p className="mt-2 text-sm leading-6 text-white/70">
            No fue posible confirmar Turso. La aplicación no usará los datos guardados en este dispositivo como fuente de verdad.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-100"
          >
            Reintentar conexión
          </button>
        </div>
      </div>
    );
  }

  // Navigation State
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Primary Data State
  const [farm, setFarm] = useState<FarmProfile>(storage.getFarm());
  const [animals, setAnimals] = useState<Animal[]>(storage.getAnimals());
  const [pastures, setPastures] = useState<Pasture[]>(storage.getPastures());
  const [milkRecords, setMilkRecords] = useState<MilkRecord[]>(storage.getMilkRecords());
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>(storage.getWeightRecords());
  const [reproductionEvents, setReproductionEvents] = useState<ReproductionEvent[]>(storage.getReproductionEvents());
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(storage.getHealthRecords());
  const [inventory, setInventory] = useState<InventoryItem[]>(storage.getInventory());
  const [semenStraws, setSemenStraws] = useState<SemenStraw[]>(storage.getSemenStraws());
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(storage.getTransactions());
  const [tasks, setTasks] = useState<TaskAssignment[]>(storage.getTasks());
  const [paddockNovelties, setPaddockNovelties] = useState<PaddockNovelty[]>(storage.getPaddockNovelties());
  const [herdRotations, setHerdRotations] = useState<HerdRotationRecord[]>(storage.getHerdRotations());
  const [rodeoAudits, setRodeoAudits] = useState<DailyRodeoAudit[]>(storage.getDailyRodeoAudits());

  // Reload helper
  const reloadData = () => {
    setFarm(storage.getFarm());
    setAnimals(storage.getAnimals());
    setPastures(storage.getPastures());
    setMilkRecords(storage.getMilkRecords());
    setWeightRecords(storage.getWeightRecords());
    setReproductionEvents(storage.getReproductionEvents());
    setHealthRecords(storage.getHealthRecords());
    setInventory(storage.getInventory());
    setSemenStraws(storage.getSemenStraws());
    setTransactions(storage.getTransactions());
    setTasks(storage.getTasks());
    setPaddockNovelties(storage.getPaddockNovelties());
    setHerdRotations(storage.getHerdRotations());
    setRodeoAudits(storage.getDailyRodeoAudits());
  };

  // Modal States
  const [isQuickAddMenuOpen, setIsQuickAddMenuOpen] = useState(false);
  const [isRfidScannerOpen, setIsRfidScannerOpen] = useState(false);
  const [isFarmSettingsOpen, setIsFarmSettingsOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);