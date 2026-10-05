import React from 'react';
import type { UserRole } from '../../auth';
import { LayoutDashboard, FileSpreadsheet, Calculator, X } from 'lucide-react';

export type NavView = 
  | 'dashboard'
  | 'animals'
  | 'dairy'
  | 'reproduction'
  | 'beef'
  | 'health'
  | 'pastures'
  | 'inventory'
  | 'finance'
  | 'tasks'
  | 'reports'
  | 'calculators'
  | 'users';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  metricsBadge: {
    animalsCount: number;
    urgentWithdrawals: number;
    imminentCalvings: number;
    urgentTasks: number;
    lowStockCount: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onClose,
  metricsBadge,
  role
}) => {
  const navItems: {
    id: NavView;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeVariant?: 'danger' | 'warning' | 'info' | 'default';
    description: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Panel General',
      icon: LayoutDashboard,
      description: 'KPIs, alertas y resumen general'
    },
    {
      id: 'animals',
      label: 'Ganado',
      icon: () => <span aria-hidden="true">🐄</span>,
      badge: metricsBadge.animalsCount,
      badgeVariant: 'default',
      description: 'Hojas de vida, genealogía y aretes'
    },
    {
      id: 'dairy',
      label: 'Producción de leche',
      icon: () => <span aria-hidden="true">🥛</span>,
      description: 'Ordeños, tanque, calidad y curvas'
    },
    {
      id: 'reproduction',
      label: 'Reproducción',
      icon: () => <span aria-hidden="true">🧬</span>,
      badge: metricsBadge.imminentCalvings > 0 ? metricsBadge.imminentCalvings : undefined,
      badgeVariant: 'warning',
      description: 'Celos, IA, preñeces y partos'
    },
    {
      id: 'beef',
      label: 'Pesajes',
      icon: () => <span aria-hidden="true">⚖️</span>,
      description: 'Ganancia diaria (GDP) y faena'
    },
    {
      id: 'health',
      label: 'Salud',
      icon: () => <span aria-hidden="true">🩺</span>,
      badge: metricsBadge.urgentWithdrawals > 0 ? metricsBadge.urgentWithdrawals : undefined,
      badgeVariant: 'danger',
      description: 'Vacunas, retiros y tratamientos'
    },
    {
      id: 'pastures',
      label: 'Potreros',
      icon: () => <span aria-hidden="true">🌾</span>,
      description: 'Rotación Voisin, aforo y carga'
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: () => <span aria-hidden="true">💉</span>,
      badge: metricsBadge.lowStockCount > 0 ? metricsBadge.lowStockCount : undefined,
      badgeVariant: 'warning',
      description: 'Insumos, silos, concentrados'
    },
    {
      id: 'finance',
      label: 'Transacciones',
      icon: () => <span aria-hidden="true">💰</span>,
      description: 'P&L, costo/litro y margen/ha'
    },
    {
      id: 'tasks',
      label: 'Tareas',
      icon: () => <span aria-hidden="true">📋</span>,
      badge: metricsBadge.urgentTasks > 0 ? metricsBadge.urgentTasks : undefined,
      badgeVariant: 'danger',
      description: 'Actividades de campo y personal'
    },
    {
      id: 'reports',
      label: 'Reportes Oficiales',
      icon: FileSpreadsheet,
      description: 'Censo ICA/SENASA y guías'
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: LayoutDashboard,
      description: 'Usuarios, roles y accesos'
    },
    {
      id: 'calculators',
      label: 'Calculadoras Zootécnicas',
      icon: Calculator,
      description: 'Carga animal, cinta métrica, dietas'
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xs ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <img 
              src="/app-icon.png" 
              alt="AgroBovino ERP" 
              className="w-9 h-9 rounded-xl object-cover shadow-sm shadow-emerald-900/20 border border-emerald-600/30"
            />
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">
                AgroBovino <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider">ERP</span>
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">
                Gestión Ganadera v1.0
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scroll">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Módulos Operativos
          </div>

          {navItems.filter(item => role === 'admin' || ['dashboard', 'animals', 'dairy', 'reproduction', 'beef', 'health', 'pastures', 'tasks'].includes(item.id)).map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  onClose();
                }}
                className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/25'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:text-emerald-700 group-hover:bg-emerald-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className={`text-xs font-semibold leading-tight truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                      {item.label}
                    </div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive ? 'text-emerald-100' : 'text-slate-500'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      item.badgeVariant === 'danger'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : item.badgeVariant === 'warning'
                        ? isActive ? 'bg-amber-300 text-amber-900' : 'bg-amber-100 text-amber-800 border border-amber-300/60'
                        : isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info: Local Offline Status & System Version */}
        <div className="p-3 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-700">
                Modo Campo Offline Activo
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-bold">v3.8 ERP</span>
          </div>
        </div>
      </aside>
    </>
  );
};
