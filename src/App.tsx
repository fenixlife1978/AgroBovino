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
  const [offlineMode, setOfflineMode] = useState(false);

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
      setOfflineMode(result === 'offline');
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
  const [farmSettingsInitialTab, setFarmSettingsInitialTab] = useState<'settings' | 'backup'>('settings');

  // Animal Modals
  const [selectedAnimalForDetail, setSelectedAnimalForDetail] = useState<Animal | null>(null);
  const [isAnimalFormOpen, setIsAnimalFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [isBatchActionOpen, setIsBatchActionOpen] = useState(false);
  const [batchSelectedAnimals, setBatchSelectedAnimals] = useState<Animal[]>([]);

  // Operational Modals with preselection
  const [isMilkingModalOpen, setIsMilkingModalOpen] = useState(false);
  const [milkingPreselectedAnimal, setMilkingPreselectedAnimal] = useState<Animal | null>(null);

  const [isWeighingModalOpen, setIsWeighingModalOpen] = useState(false);
  const [weighingPreselectedAnimal, setWeighingPreselectedAnimal] = useState<Animal | null>(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [servicePreselectedAnimal, setServicePreselectedAnimal] = useState<Animal | null>(null);

  const [isCalvingModalOpen, setIsCalvingModalOpen] = useState(false);
  const [calvingPreselectedAnimal, setCalvingPreselectedAnimal] = useState<Animal | null>(null);

  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [treatmentPreselectedAnimal, setTreatmentPreselectedAnimal] = useState<Animal | null>(null);

  const [isPastureModalOpen, setIsPastureModalOpen] = useState(false);
  const [editingPasture, setEditingPasture] = useState<Pasture | null>(null);

  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Synchronize search query navigation
  useEffect(() => {
    if (searchQuery.trim() && currentView !== 'animals') {
      setCurrentView('animals');
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (typeof navigator !== 'undefined' && navigator.onLine === false) setOfflineMode(true);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (user?.role === 'vaquero' && (currentView === 'inventory' || currentView === 'finance')) {
      setCurrentView('dashboard');
    }
  }, [user, currentView]);

  // Sidebar badges computation
  const metricsBadge = useMemo(() => {
    const urgentWithdrawals = animals.filter(a => isAnimalInWithdrawal(a.withdrawalEndDate)).length;
    const imminentCalvings = animals.filter(a => {
      if (!a.estimatedCalvingDate) return false;
      const calvingDate = new Date(a.estimatedCalvingDate);
      const now = new Date();
      const diffDays = Math.ceil((calvingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays >= -5;
    }).length;
    const urgentTasks = tasks.filter(t => !t.completed && t.priority === 'urgente').length;
    const lowStockCount = inventory.filter(i => i.currentStock <= i.minStockAlert).length;

    return {
      animalsCount: animals.length,
      urgentWithdrawals,
      imminentCalvings,
      urgentTasks,
      lowStockCount
    };
  }, [animals, tasks, inventory]);

  // CRUD Handlers
  const handleSaveAnimal = (animal: Animal) => {
    const duplicateTag = animals.some(a => a.tagNumber.toUpperCase() === animal.tagNumber.toUpperCase() && a.id !== animal.id);
    if (duplicateTag) {
      window.alert('El Arete Oficial ' + animal.tagNumber + ' ya está registrado en otro bovino.');
      return;
    }
    if (animal.electronicId) {
      const duplicateRfid = animals.some(a => a.electronicId && a.electronicId.toUpperCase() === animal.electronicId!.toUpperCase() && a.id !== animal.id);
      if (duplicateRfid) {
        window.alert('El identificador RFID ' + animal.electronicId + ' ya está asignado a otro bovino.');
        return;
      }
    }
    if (editingAnimal) storage.updateAnimal(animal);
    else storage.addAnimal(animal);
    reloadData();
    setEditingAnimal(null);
  };

  const handleDeleteAnimal = (id: string) => {
    const animal = animals.find(a => a.id === id);
    if (!animal) return;

    const dependencies: string[] = [];
    if (milkRecords.some(r => r.animalId === id)) dependencies.push('Producción de leche');
    if (weightRecords.some(r => r.animalId === id)) dependencies.push('Pesajes');
    if (reproductionEvents.some(r => r.animalId === id)) dependencies.push('Reproducción');
    if (healthRecords.some(r => r.animalId === id)) dependencies.push('Sanidad');
    if (paddockNovelties.some(r => r.animalId === id || r.animalTag === animal.tagNumber)) dependencies.push('Novedades de campo');
    if (transactions.some(t => t.relatedAnimalTag === animal.tagNumber)) dependencies.push('Transacciones financieras');

    if (dependencies.length > 0) {
      window.alert('No se puede eliminar ' + animal.tagNumber + ' porque conserva historial operativo en: ' + dependencies.join(', ') + '. Elimine/corrija primero los registros dependientes o mantenga el bovino en el censo para conservar su trazabilidad.');
      return;
    }

    if (window.confirm('¿Está seguro de eliminar este animal del censo?')) {
      storage.deleteAnimal(id);
      reloadData();
      if (selectedAnimalForDetail?.id === id) setSelectedAnimalForDetail(null);
    }
  };

  const handleSaveMilkRecord = (record: MilkRecord) => {
    if (record.animalId) {
      const animal = animals.find(a => a.id === record.animalId);
      if (animal && isAnimalInWithdrawal(animal.withdrawalEndDate) && record.destination !== 'descarte_antibiotico') {
        window.alert('No se puede registrar esta leche como destinada a venta/consumo mientras ' + animal.tagNumber + ' esté en periodo de retiro hasta ' + animal.withdrawalEndDate + '. Seleccione destino de descarte por antibiótico o registre el ordeño cuando finalice el retiro.');
        return;
      }
    }

    storage.addMilkRecord(record);
    // If it generated revenue, log transaction
    if (record.revenue && record.revenue > 0) {
      storage.addTransaction({
        id: `tx-milk-${record.id}`,
        relatedRecordId: record.id,
        date: record.date,
        type: 'ingreso',
        category: 'venta_leche',
        amount: record.revenue,
        concept: `Venta Leche: ${record.liters}L (${record.lotName || record.animalTag})`,
        quantity: record.liters,
        unitPrice: record.pricePerLiter,
        paymentStatus: 'cobrado'
      });
    }
    reloadData();
  };

  const handleSaveWeightRecord = (record: WeightRecord) => {
    storage.addWeightRecord(record);
    reloadData();
  };

  const handleSaveReproductionEvent = (event: ReproductionEvent) => {
    if (event.eventType === 'servicio_ia') {
      const straw = semenStraws.find(s => s.bullName === event.sireTagOrStraw || s.registrationCode === event.sireTagOrStraw);
      if (!straw) { window.alert('No se pudo identificar la pajilla de semen seleccionada.'); return; }
      if (straw.quantityAvailable <= 0) { window.alert('La pajilla de ' + straw.bullName + ' no tiene existencias disponibles.'); return; }
      storage.saveSemenStraws(semenStraws.map(s => s.id === straw.id ? { ...s, quantityAvailable: s.quantityAvailable - 1 } : s));
    }
    storage.addReproductionEvent(event);
    reloadData();
  };

  const handleSaveCalvingEvent = (event: ReproductionEvent, newCalf?: Animal) => {
    const mother = animals.find(a => a.id === event.animalId);
    if (!mother) return;
    if (mother.reproductiveStatus !== 'gestante' && mother.reproductiveStatus !== 'en_secado') {
      window.alert('El parto solo puede registrarse para una hembra en estado gestante o en secado.');
      return;
    }
    if (newCalf && animals.some(a => a.tagNumber.toUpperCase() === newCalf.tagNumber.toUpperCase())) {
      window.alert('El Arete Oficial ' + newCalf.tagNumber + ' ya existe en el censo.');
      return;
    }
    storage.addReproductionEvent(event);
    if (newCalf) storage.addAnimal(newCalf);
    reloadData();
  };

  const handleSaveHealthRecord = (record: HealthRecord) => {
    storage.addHealthRecord(record);
    if (record.cost && record.cost > 0) {
      storage.addTransaction({
        id: `tx-health-${record.id}`,
        relatedRecordId: record.id,
        date: record.date,
        type: 'egreso',
        category: 'compra_medicamentos',
        amount: record.cost,
        concept: `Tratamiento Sanitario: ${record.medicationName} (${record.animalTag})`,
        paymentStatus: 'pagado'
      });
    }
    reloadData();
  };

  const handleSavePasture = (pasture: Pasture) => {
    if (editingPasture) {
      storage.updatePasture(pasture);
    } else {
      storage.addPasture(pasture);
    }
    reloadData();
    setEditingPasture(null);
  };

  const handleDeletePasture = (id: string) => {
    const pasture = pastures.find(p => p.id === id);
    if (!pasture) return;
    const refs: string[] = [];
    const animalCount = animals.filter(a => a.pastureId === id).length;
    const noveltyCount = paddockNovelties.filter(n => n.pastureId === id).length;
    const rotationCount = herdRotations.filter(r => r.sourcePastureId === id || r.targetPastureId === id).length;
    const auditCount = rodeoAudits.filter(r => r.pastureId === id).length;
    if (animalCount) refs.push(animalCount + ' animal(es) asignado(s)');
    if (noveltyCount) refs.push(noveltyCount + ' novedad(es)');
    if (rotationCount) refs.push(rotationCount + ' rotación(es)');
    if (auditCount) refs.push(auditCount + ' inspección(es)');
    if (refs.length > 0) {
      window.alert('No se puede eliminar el potrero ' + pasture.code + ' porque conserva referencias: ' + refs.join(', ') + '. Esto evita dejar animales o historial de campo huérfanos.');
      return;
    }
    if (window.confirm('¿Está seguro de eliminar este potrero?')) {
      storage.deletePasture(id);
      reloadData();
    }
  };

  const handleRotateHerd = (sourcePastureId: string, targetPastureId: string) => {
    const updatedAnimals = animals.map(a => {
      if (a.pastureId === sourcePastureId) {
        return { ...a, pastureId: targetPastureId };
      }
      return a;
    });
    storage.saveAnimals(updatedAnimals);

    // Update pasture status
    const updatedPastures = pastures.map(p => {
      if (p.id === sourcePastureId) {
        return { ...p, status: 'descanso' as const, daysOccupied: 0 };
      }
      if (p.id === targetPastureId) {
        return { ...p, status: 'ocupado' as const, entryDate: new Date().toISOString().split('T')[0], daysOccupied: 1 };
      }
      return p;
    });
    storage.savePastures(updatedPastures);
    reloadData();
  };

  const handleSaveInventoryItem = (item: InventoryItem) => {
    if (editingInventoryItem) {
      storage.updateInventoryItem(item);
    } else {
      storage.addInventoryItem(item);
    }
    reloadData();
    setEditingInventoryItem(null);
  };

  const handleDeleteInventoryItem = (id: string) => {
    if (window.confirm('¿Eliminar este insumo de la bodega?')) {
      storage.deleteInventoryItem(id);
      reloadData();
    }
  };

  const handleSaveTransaction = (tx: FinancialTransaction) => {
    storage.addTransaction(tx);
    reloadData();
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('¿Eliminar esta transacción contable?')) {
      storage.deleteTransaction(id);
      reloadData();
    }
  };

  const handleSaveTask = (task: TaskAssignment) => {
    storage.addTask(task);
    reloadData();
  };

  const handleToggleTask = (id: string) => {
    storage.toggleTask(id);
    reloadData();
  };

  const handleDeleteTask = (id: string) => {
    storage.deleteTask(id);
    reloadData();
  };

  // Batch actions
  const handleApplyBatchPastureChange = (targetPastureId: string, newLotName?: string) => {
    const selectedIds = batchSelectedAnimals.map(a => a.id);
    const updatedAnimals = animals.map(a => {
      if (selectedIds.includes(a.id)) {
        return {
          ...a,
          pastureId: targetPastureId,
          lotName: newLotName ? newLotName : a.lotName
        };
      }
      return a;
    });
    storage.saveAnimals(updatedAnimals);
    reloadData();
    setBatchSelectedAnimals([]);
  };

  const handleApplyBatchVaccine = (vaccineName: string, disease: string, dosage: string, vet: string) => {
    const batchHealthRecord: HealthRecord = {
      id: `health-batch-${Date.now()}`,
      animalId: 'LOTE_SELECCIONADO',
      animalTag: `Lote (${batchSelectedAnimals.length} Bovinos)`,
      type: 'vacuna',
      date: new Date().toISOString().split('T')[0],
      diseaseOrReason: disease,
      medicationName: vaccineName,
      dosage,
      administrationRoute: 'subcutanea',
      veterinarian: vet,
      withdrawalDaysMilk: 0,
      withdrawalDaysMeat: 0,
      cost: batchSelectedAnimals.length * 2.5,
      status: 'aplicado'
    };
    storage.addHealthRecord(batchHealthRecord);
    storage.addTransaction({
      id: `tx-health-${batchHealthRecord.id}`,
      relatedRecordId: batchHealthRecord.id,
      date: batchHealthRecord.date,
      type: 'egreso',
      category: 'compra_medicamentos',
      amount: batchHealthRecord.cost,
      concept: `Vacunación masiva: ${vaccineName} (${batchSelectedAnimals.length} bovinos)`,
      quantity: batchSelectedAnimals.length,
      unitPrice: 2.5,
      paymentStatus: 'pagado'
    });
    reloadData();
    setBatchSelectedAnimals([]);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsSidebarOpen(false);
  };

  const handleSaveFarm = (updatedFarm: FarmProfile) => {
    storage.saveFarm(updatedFarm);
    setFarm(updatedFarm);
  };

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

  if (!user) return <LoginPage onAuthenticated={setUser} />;

  if (cloudError && !cloudReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-red-400/20 bg-white/5 p-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-300">!</div>
          <h1 className="text-lg font-bold">Datos no disponibles</h1>
          <p className="mt-2 text-sm leading-6 text-white/70">
            No fue posible confirmar Turso. La aplicación no usará los datos guardados en este dispositivo como fuente de verdad.
          </p>
          <button onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-100">
            Reintentar conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white antialiased">
      {offlineMode && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 px-3 py-1.5 text-center text-xs font-semibold text-amber-950 shadow-md">
          Sin conexión: AgroBovino continúa trabajando con la última copia sincronizada. Los cambios quedarán pendientes hasta recuperar Internet.
        </div>
      )}


      {/* Top Navigation Bar */}
      <Navbar
        farm={farm}
        activeView={currentView}
        onOpenQuickAdd={() => setIsQuickAddMenuOpen(true)}
        onOpenRfidScanner={() => setIsRfidScannerOpen(true)}
        onOpenSettings={() => {
          setFarmSettingsInitialTab('settings');
          setIsFarmSettingsOpen(true);
        }}
        onOpenBackup={() => {
          setFarmSettingsInitialTab('backup');
          setIsFarmSettingsOpen(true);
        }}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        pendingAlertsCount={metricsBadge.urgentWithdrawals + metricsBadge.imminentCalvings}
      />

      <div className="fixed top-20 right-4 z-30 flex items-center gap-2 bg-white/95 backdrop-blur border border-slate-200 shadow-sm rounded-full px-3 py-1.5">
        <span className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        <span className="text-xs font-bold text-slate-700">{user.username} · {user.role === 'admin' ? 'Administrador' : 'Vaquero'}</span>
        {user.role === 'admin' && <button onClick={() => setIsUserManagementOpen(true)} className="ml-1 p-1 text-slate-400 hover:text-emerald-600" title="Gestionar usuarios"><span className="text-[10px] font-bold">👥 USUARIOS</span></button>}
        <button onClick={handleLogout} className="ml-1 p-1 text-slate-400 hover:text-rose-600" title="Cerrar sesión"><LogOut className="w-3.5 h-3.5" /></button>
      </div>

      <div className="flex flex-1">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={(view) => setCurrentView(view)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          metricsBadge={metricsBadge}
          role={user.role}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-72 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full transition-all">
          {currentView === 'dashboard' && (
            <DashboardView
              farm={farm}
              animals={animals}
              milkRecords={milkRecords}
              weightRecords={weightRecords}
              reproductionEvents={reproductionEvents}
              healthRecords={healthRecords}
              pastures={pastures}
              inventory={inventory}
              transactions={transactions}
              tasks={tasks}
              paddockNovelties={paddockNovelties}
              onNavigate={(view) => setCurrentView(view)}
              onOpenNewAnimal={() => {
                setEditingAnimal(null);
                setIsAnimalFormOpen(true);
              }}
              onOpenNewMilking={() => {
                setMilkingPreselectedAnimal(null);
                setIsMilkingModalOpen(true);
              }}
              onOpenNewWeighing={() => {
                setWeighingPreselectedAnimal(null);
                setIsWeighingModalOpen(true);
              }}
              onOpenNewService={() => {
                setServicePreselectedAnimal(null);
                setIsServiceModalOpen(true);
              }}
              onOpenNewTreatment={() => {
                setTreatmentPreselectedAnimal(null);
                setIsTreatmentModalOpen(true);
              }}
              onOpenRfidScanner={() => setIsRfidScannerOpen(true)}
              onSelectAnimal={(animal) => setSelectedAnimalForDetail(animal)}
            />
          )}

          {currentView === 'animals' && (
            <AnimalsView
              animals={animals}
              pastures={pastures}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectAnimal={(animal) => setSelectedAnimalForDetail(animal)}
              onEditAnimal={(animal) => {
                setEditingAnimal(animal);
                setIsAnimalFormOpen(true);
              }}
              onDeleteAnimal={handleDeleteAnimal}
              onOpenNewAnimal={() => {
                setEditingAnimal(null);
                setIsAnimalFormOpen(true);
              }}
              onOpenBatchActions={(selected) => {
                setBatchSelectedAnimals(selected);
                setIsBatchActionOpen(true);
              }}
              onOpenRfidScanner={() => setIsRfidScannerOpen(true)}
            />
          )}

          {currentView === 'dairy' && (
            <DairyView
              milkRecords={milkRecords}
              animals={animals}
              farm={farm}
              onOpenNewRecord={() => {
                setMilkingPreselectedAnimal(null);
                setIsMilkingModalOpen(true);
              }}
              onDeleteRecord={(id) => {
                if (window.confirm('¿Eliminar este registro de ordeño?')) {
                  storage.deleteMilkRecord(id);
                  reloadData();
                }
              }}
            />
          )}

          {currentView === 'reproduction' && (
            <ReproductionView
              reproductionEvents={reproductionEvents}
              animals={animals}
              semenStraws={semenStraws}
              pastures={pastures}
              onOpenNewService={(preselected) => {
                setServicePreselectedAnimal(preselected || null);
                setIsServiceModalOpen(true);
              }}
              onOpenNewCalving={(preselected) => {
                setCalvingPreselectedAnimal(preselected || null);
                setIsCalvingModalOpen(true);
              }}
              onSelectAnimal={(animal) => setSelectedAnimalForDetail(animal)}
            />
          )}

          {currentView === 'beef' && (
            <BeefView
              weightRecords={weightRecords}
              animals={animals}
              farm={farm}
              onOpenNewWeighing={(preselected) => {
                setWeighingPreselectedAnimal(preselected || null);
                setIsWeighingModalOpen(true);
              }}
              onSelectAnimal={(animal) => setSelectedAnimalForDetail(animal)}
            />
          )}

          {currentView === 'health' && (
            <HealthView
              healthRecords={healthRecords}
              animals={animals}
              farm={farm}
              onOpenNewTreatment={(preselected) => {
                setTreatmentPreselectedAnimal(preselected || null);
                setIsTreatmentModalOpen(true);
              }}
              onSelectAnimal={(animal) => setSelectedAnimalForDetail(animal)}
            />
          )}

          {currentView === 'pastures' && (
            <PasturesView
              pastures={pastures}
              animals={animals}
              farm={farm}
              novelties={paddockNovelties}
              rotations={herdRotations}
              rodeoAudits={rodeoAudits}
              onOpenNewPasture={() => {
                setEditingPasture(null);
                setIsPastureModalOpen(true);
              }}
              onEditPasture={(pasture) => {
                setEditingPasture(pasture);
                setIsPastureModalOpen(true);
              }}
              onDeletePasture={handleDeletePasture}
              onRotateHerd={handleRotateHerd}
              onSaveNovelty={(novelty) => {
                storage.addPaddockNovelty(novelty);
                reloadData();
              }}
              onResolveNovelty={(id, notes) => {
                storage.resolvePaddockNovelty(id, notes);
                reloadData();
              }}
              onSaveRotation={(rotation) => {
                // La rotación formal mueve únicamente los animales del lote
                // confirmado que realmente estaban en el potrero de origen.
                const updatedAnimals = animals.map(animal => {
                  if (
                    animal.lotName === rotation.lotName &&
                    animal.pastureId === rotation.sourcePastureId
                  ) {
                    return { ...animal, pastureId: rotation.targetPastureId };
                  }
                  return animal;
                });
                storage.saveAnimals(updatedAnimals);

                const updatedPastures = pastures.map(pasture => {
                  if (pasture.id === rotation.sourcePastureId) {
                    return { ...pasture, status: 'descanso' as const, daysOccupied: 0 };
                  }
                  if (pasture.id === rotation.targetPastureId) {
                    return {
                      ...pasture,
                      status: 'ocupado' as const,
                      entryDate: rotation.date,
                      daysOccupied: 1
                    };
                  }
                  return pasture;
                });
                storage.savePastures(updatedPastures);
                storage.addHerdRotation(rotation);
                reloadData();
              }}
              onSaveRodeoAudit={(audit) => {
                storage.addDailyRodeoAudit(audit);
                reloadData();
              }}
            />
          )}

          {currentView === 'inventory' && (
            <InventoryView
              inventory={inventory}
              farm={farm}
              onOpenNewItem={() => {
                setEditingInventoryItem(null);
                setIsInventoryModalOpen(true);
              }}
              onEditItem={(item) => {
                setEditingInventoryItem(item);
                setIsInventoryModalOpen(true);
              }}
              onDeleteItem={handleDeleteInventoryItem}
            />
          )}

          {currentView === 'finance' && (
            <FinanceView
              transactions={transactions}
              farm={farm}
              onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {currentView === 'tasks' && (
            <TasksView
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onOpenNewTask={() => setIsTaskModalOpen(true)}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              animals={animals}
              pastures={pastures}
              farm={farm}
              healthRecords={healthRecords}
              reproductionEvents={reproductionEvents}
            />
          )}

          {currentView === 'calculators' && (
            <CalculatorsView />
          )}
        </main>
      </div>

      {/* QUICK ADD LAUNCHER MODAL */}
      {isQuickAddMenuOpen && (
        <Modal
          isOpen={isQuickAddMenuOpen}
          onClose={() => setIsQuickAddMenuOpen(false)}
          title="Nuevo Registro Operativo"
          subtitle="Seleccione el módulo o tipo de evento que desea asentar"
          maxWidth="lg"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => {
                setIsQuickAddMenuOpen(false);
                setEditingAnimal(null);
                setIsAnimalFormOpen(true);
              }}
              className="p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group transition-all shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Nuevo Bovino</span>
              <span className="text-[10px] text-slate-500 font-medium">Alta en Censo</span>
            </button>

            <button
              onClick={() => {
                setIsQuickAddMenuOpen(false);
                setMilkingPreselectedAnimal(null);
                setIsMilkingModalOpen(true);
              }}
              className="p-4 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group transition-all shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Milk className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Ordeño / Leche</span>
              <span className="text-[10px] text-slate-500 font-medium">Pesaje o Tanque</span>
            </button>

            <button
              onClick={() => {
                setIsQuickAddMenuOpen(false);
                setWeighingPreselectedAnimal(null);
                setIsWeighingModalOpen(true);
              }}
              className="p-4 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group transition-all shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Scale className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Pesaje Báscula</span>
              <span className="text-[10px] text-slate-500 font-medium">Ganancia GDP</span>
            </button>

            <button
              onClick={() => {
                setIsQuickAddMenuOpen(false);
                setServicePreselectedAnimal(null);
                setIsServiceModalOpen(true);
              }}
              className="p-4 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group transition-all shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Celo / IA / Eco</span>
              <span className="text-[10px] text-slate-500 font-medium">Reproducción</span>
            </button>

            <button
              onClick={() => {
                setIsQuickAddMenuOpen(false);
                setTreatmentPreselectedAnimal(null);
                setIsTreatmentModalOpen(true);
              }}
              className="p-4 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group transition-all shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Tratamiento Fármaco</span>
              <span className="text-[10px] text-slate-500 font-medium">Sanidad y Retiro</span>
            </button>

            {user.role === 'admin' && <button
              onClick={() => {
                setIsQuickAddMenuOpen(false);
                setIsTransactionModalOpen(true);
              }}
              className="p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group transition-all shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Ingreso / Gasto</span>
              <span className="text-[10px] text-slate-500 font-medium">Flujo de Caja</span>
            </button>}
          </div>
        </Modal>
      )}

      {/* ALL MODALS */}
      {selectedAnimalForDetail && (
        <AnimalDetailModal
          isOpen={!!selectedAnimalForDetail}
          onClose={() => setSelectedAnimalForDetail(null)}
          animal={selectedAnimalForDetail}
          pastures={pastures}
          milkRecords={milkRecords}
          weightRecords={weightRecords}
          reproductionEvents={reproductionEvents}
          healthRecords={healthRecords}
          onEditAnimal={(a) => {
            setSelectedAnimalForDetail(null);
            setEditingAnimal(a);
            setIsAnimalFormOpen(true);
          }}
          onAddMilking={(a) => {
            setSelectedAnimalForDetail(null);
            setMilkingPreselectedAnimal(a);
            setIsMilkingModalOpen(true);
          }}
          onAddWeight={(a) => {
            setSelectedAnimalForDetail(null);
            setWeighingPreselectedAnimal(a);
            setIsWeighingModalOpen(true);
          }}
          onAddReproduction={(a) => {
            setSelectedAnimalForDetail(null);
            setServicePreselectedAnimal(a);
            setIsServiceModalOpen(true);
          }}
          onAddTreatment={(a) => {
            setSelectedAnimalForDetail(null);
            setTreatmentPreselectedAnimal(a);
            setIsTreatmentModalOpen(true);
          }}
          onUpdateAnimalPhoto={(animalId, photoUrl) => {
            const updated = animals.map(a => a.id === animalId ? { ...a, photoUrl } : a);
            setAnimals(updated);
            storage.saveAnimals(updated);
            if (selectedAnimalForDetail && selectedAnimalForDetail.id === animalId) {
              setSelectedAnimalForDetail({ ...selectedAnimalForDetail, photoUrl });
            }
          }}
        />
      )}

      {isAnimalFormOpen && (
        <AnimalFormModal
          isOpen={isAnimalFormOpen}
          onClose={() => {
            setIsAnimalFormOpen(false);
            setEditingAnimal(null);
          }}
          onSave={handleSaveAnimal}
          pastures={pastures}
          initialData={editingAnimal}
        />
      )}

      {isBatchActionOpen && (
        <BatchActionModal
          isOpen={isBatchActionOpen}
          onClose={() => {
            setIsBatchActionOpen(false);
            setBatchSelectedAnimals([]);
          }}
          selectedAnimals={batchSelectedAnimals}
          pastures={pastures}
          onApplyBatchPastureChange={handleApplyBatchPastureChange}
          onApplyBatchVaccine={handleApplyBatchVaccine}
        />
      )}

      {isRfidScannerOpen && (
        <RfidScannerModal
          isOpen={isRfidScannerOpen}
          onClose={() => setIsRfidScannerOpen(false)}
          animals={animals}
          onSelectAnimal={(animal) => setSelectedAnimalForDetail(animal)}
        />
      )}

      {isMilkingModalOpen && (
        <MilkRecordModal
          isOpen={isMilkingModalOpen}
          onClose={() => {
            setIsMilkingModalOpen(false);
            setMilkingPreselectedAnimal(null);
          }}
          onSave={handleSaveMilkRecord}
          milkingCows={animals.filter(a => a.productionStatus === 'ordeño' || a.id === milkingPreselectedAnimal?.id)}
          selectedAnimal={milkingPreselectedAnimal}
        />
      )}

      {isWeighingModalOpen && (
        <WeighingModal
          isOpen={isWeighingModalOpen}
          onClose={() => {
            setIsWeighingModalOpen(false);
            setWeighingPreselectedAnimal(null);
          }}
          onSave={handleSaveWeightRecord}
          animals={animals}
          weightRecords={weightRecords}
          selectedAnimal={weighingPreselectedAnimal}
        />
      )}

      {isServiceModalOpen && (
        <ServiceRecordModal
          isOpen={isServiceModalOpen}
          onClose={() => {
            setIsServiceModalOpen(false);
            setServicePreselectedAnimal(null);
          }}
          onSave={handleSaveReproductionEvent}
          females={animals.filter(a => a.sex === 'F')}
          semenStraws={semenStraws}
          selectedAnimal={servicePreselectedAnimal}
        />
      )}

      {isCalvingModalOpen && (
        <CalvingRecordModal
          isOpen={isCalvingModalOpen}
          onClose={() => {
            setIsCalvingModalOpen(false);
            setCalvingPreselectedAnimal(null);
          }}
          onSaveCalving={handleSaveCalvingEvent}
          pregnantCows={animals.filter(a => a.reproductiveStatus === 'gestante' || a.reproductiveStatus === 'en_secado')}
          pastures={pastures}
          selectedAnimal={calvingPreselectedAnimal}
        />
      )}

      {isTreatmentModalOpen && (
        <TreatmentModal
          isOpen={isTreatmentModalOpen}
          onClose={() => {
            setIsTreatmentModalOpen(false);
            setTreatmentPreselectedAnimal(null);
          }}
          onSave={handleSaveHealthRecord}
          animals={animals}
          selectedAnimal={treatmentPreselectedAnimal}
        />
      )}

      {isPastureModalOpen && (
        <PastureModal
          isOpen={isPastureModalOpen}
          onClose={() => {
            setIsPastureModalOpen(false);
            setEditingPasture(null);
          }}
          onSave={handleSavePasture}
          initialData={editingPasture}
        />
      )}

      {isInventoryModalOpen && (
        <InventoryItemModal
          isOpen={isInventoryModalOpen}
          onClose={() => {
            setIsInventoryModalOpen(false);
            setEditingInventoryItem(null);
          }}
          onSave={handleSaveInventoryItem}
          initialData={editingInventoryItem}
        />
      )}

      {isTransactionModalOpen && (
        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          onSave={handleSaveTransaction}
        />
      )}

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
        />
      )}

      {user.role === 'admin' && <UserManagementModal isOpen={isUserManagementOpen} onClose={() => setIsUserManagementOpen(false)} />}

      {isFarmSettingsOpen && (
        <FarmSettingsModal
          isOpen={isFarmSettingsOpen}
          onClose={() => setIsFarmSettingsOpen(false)}
          farm={farm}
          onSaveFarm={handleSaveFarm}
          onDataReset={reloadData}
          initialTab={farmSettingsInitialTab}
        />
      )}
    </div>
  );
}
