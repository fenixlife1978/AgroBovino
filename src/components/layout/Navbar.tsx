import React from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  Radio, 
  Settings, 
  Database,
  MapPin,
  Calendar
} from 'lucide-react';
import { FarmProfile } from '../../types/livestock';

interface NavbarProps {
  farm: FarmProfile;
  activeView: string;
  onOpenQuickAdd: () => void;
  onOpenRfidScanner: () => void;
  onOpenSettings: () => void;
  onOpenBackup: () => void;
  toggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  pendingAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  farm,
  activeView,
  onOpenQuickAdd,
  onOpenRfidScanner,
  onOpenSettings,
  onOpenBackup,
  toggleSidebar,
  searchQuery,
  setSearchQuery,
  pendingAlertsCount
}) => {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-800 shadow-xs">
      {/* Left side: Hamburger + Farm Name */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl lg:hidden transition-colors"
          title="Abrir Menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <img 
            src="/app-icon.png" 
            alt="AgroBovino ERP" 
            className="w-9 h-9 rounded-xl object-cover shadow-sm shadow-emerald-900/20 border border-emerald-600/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight flex items-center gap-1.5">
                {farm.name}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {farm.systemType}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <MapPin className="w-3 h-3 text-emerald-600" />
              {farm.location} • {farm.totalAreaHa} Ha
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Fast Search for Ear Tags (Aretes) */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Arete (ej: CO-104), Chip RFID, Nombre, Raza..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right side: Quick Action Buttons, Scanner RFID, Settings, Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* RFID Scanner Trigger Button */}
        <button
          onClick={onOpenRfidScanner}
          className="flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100/80 text-sky-800 border border-sky-200 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-95"
          title="Escanear Arete Electrónico / Chip RFID"
        >
          <Radio className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
          <span className="hidden sm:inline">Lector RFID</span>
        </button>

        {/* Fast Action / Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 sm:px-3.5 py-1.5 rounded-xl shadow-sm shadow-emerald-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo Registro</span>
          <span className="sm:hidden">Nuevo</span>
        </button>

        {/* Date display */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="capitalize font-medium">{currentDate}</span>
        </div>

        {/* Backup / Data Management */}
        <button
          onClick={onOpenBackup}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          title="Copia de Seguridad / Datos"
        >
          <Database className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          title="🏡 Datos de la finca"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
