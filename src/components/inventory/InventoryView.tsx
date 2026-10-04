import React, { useState, useMemo } from 'react';
import { Plus, AlertTriangle, Edit3, Trash2, Utensils } from 'lucide-react';
import { InventoryItem, FarmProfile } from '../../types/livestock';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/livestockCalculators';

interface InventoryViewProps {
  inventory: InventoryItem[];
  farm: FarmProfile;
  onOpenNewItem: () => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  farm,
  onOpenNewItem,
  onEditItem,
  onDeleteItem
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'inventory' | 'ration_planner'>('inventory');

  // Low stock items
  const lowStockItems = useMemo(() => {
    return inventory.filter(item => item.currentStock <= item.minStockAlert);
  }, [inventory]);

  const totalInventoryValue = useMemo(() => {
    return inventory.reduce((acc, curr) => acc + (curr.currentStock * curr.unitCost), 0);
  }, [inventory]);

  const filteredItems = useMemo(() => {
    if (categoryFilter === 'all') return inventory;
    return inventory.filter(i => i.category === categoryFilter);
  }, [inventory, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Valor en Bodega</span>
          <span className="text-2xl font-black text-emerald-600 font-mono">
            {formatCurrency(totalInventoryValue, farm.currency)}
          </span>
          <span className="text-[10px] text-emerald-700 block font-medium">Stock valorizado</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Alertas Stock Mínimo</span>
          <span className={`text-2xl font-black ${lowStockItems.length > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-800'}`}>
            {lowStockItems.length}
          </span>
          <span className="text-[10px] text-amber-700 block font-medium">Requieren reposición</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Concentrado en Stock</span>
          <span className="text-2xl font-black text-slate-900">
            {inventory.filter(i => i.category === 'balanceado_concentrado').reduce((acc, i) => acc + i.currentStock, 0)}
          </span>
          <span className="text-[10px] text-slate-500 block font-medium">Sacos disponibles</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Silo de Maíz</span>
          <span className="text-2xl font-black text-teal-600">
            {inventory.filter(i => i.category === 'silo_heno').reduce((acc, i) => acc + i.currentStock, 0)} Ton
          </span>
          <span className="text-[10px] text-teal-700 block font-medium">Reserva forrajera</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Total Insumos</span>
          <span className="text-2xl font-black text-purple-600">{inventory.length}</span>
          <span className="text-[10px] text-purple-700 block font-medium">Referencias activas</span>
        </div>
      </div>

      {/* LOW STOCK BANNER */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm text-amber-900">
              ¡ATENCIÓN: REPOSICIÓN DE STOCK NECESARIA!
            </h4>
            <p className="text-xs text-amber-800 mt-0.5 font-medium">
              Los siguientes productos han alcanzado el umbral mínimo de seguridad:{' '}
              <strong className="text-slate-900">
                {lowStockItems.map(i => `${i.name} (Quedan: ${i.currentStock} ${i.unit})`).join(', ')}.
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* TABS: Stock Catalog vs Ration Balancer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 border border-slate-200/90 rounded-2xl shadow-xs">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'inventory' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Catálogo de Insumos & Bodega ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab('ration_planner')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'ration_planner' ? 'bg-white text-teal-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-teal-600" />
            Plan de Alimentación & Raciones
          </button>
        </div>

        <button
          onClick={onOpenNewItem}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nuevo Insumo
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto custom-scroll">
            {[
              { id: 'all', label: 'Todos los Insumos' },
              { id: 'balanceado_concentrado', label: 'Concentrados' },
              { id: 'silo_heno', label: 'Silos y Henos' },
              { id: 'sal_mineral', label: 'Sales Minerales' },
              { id: 'medicamento', label: 'Medicamentos' },
              { id: 'vacuna', label: 'Vacunas' },
              { id: 'pajilla_semen', label: 'Pajillas Semen' },
              { id: 'arete_identificacion', label: 'Aretes RFID' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  categoryFilter === tab.id ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="p-3.5">Código / SKU</th>
                  <th className="p-3.5">Producto & Categoría</th>
                  <th className="p-3.5">Stock Disponible</th>
                  <th className="p-3.5">Costo Unitario</th>
                  <th className="p-3.5">Valor Total Stock</th>
                  <th className="p-3.5">Ubicación / Proveedor</th>
                  <th className="p-3.5">Vencimiento</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredItems.map((item) => {
                  const isLow = item.currentStock <= item.minStockAlert;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-800">{item.skuCode}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 text-sm block">{item.name}</span>
                        <Badge variant="cyan" size="xs">{item.category.replace('_', ' ').toUpperCase()}</Badge>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-base font-black font-mono ${isLow ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {item.currentStock} {item.unit.replace('_', ' ')}
                        </span>
                        {isLow && (
                          <span className="text-[10px] text-rose-600 block font-bold">
                            ⚠️ Stock mínimo: {item.minStockAlert}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 font-medium">
                        {formatCurrency(item.unitCost, farm.currency)}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-700">
                        {formatCurrency(item.currentStock * item.unitCost, farm.currency)}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <div>{item.location || 'Bodega'}</div>
                        <div className="text-[10px] text-slate-500">{item.supplier || '-'}</div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">
                        {item.expirationDate || 'N/A'}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditItem(item)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* RATION PLANNER TAB */
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-teal-600" />
              Programa de Nutrición & Formulación de Raciones por Categoría
            </h3>
            <p className="text-xs text-slate-500">
              Cálculo de consumo de materia seca (CMS) y suplementación zootécnica diaria
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Diet 1 */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-emerald-800">Vacas Alta Producción</h4>
                <Badge variant="success" size="xs">&gt; 18 L/día</Badge>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between"><span>Pastoreo Rotacional:</span><strong className="text-slate-900">Ad libitum (~45 kg)</strong></div>
                <div className="flex justify-between"><span>Silo de Maíz:</span><strong className="text-slate-900">8.0 kg / vaca / día</strong></div>
                <div className="flex justify-between"><span>Concentrado 18%:</span><strong className="text-slate-900">1 kg por c/ 3 L producidos</strong></div>
                <div className="flex justify-between"><span>Sal Mineral 8% P:</span><strong className="text-slate-900">120 g / día</strong></div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-xs">
                <span className="text-slate-500">Costo Suplemento:</span>
                <strong className="text-emerald-700 font-mono font-bold">$1.85 / vaca / día</strong>
              </div>
            </div>

            {/* Diet 2 */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-amber-800">Novillos en Ceba</h4>
                <Badge variant="amber" size="xs">Engorde Final</Badge>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between"><span>Pasto Mombaza:</span><strong className="text-slate-900">Ad libitum (~38 kg)</strong></div>
                <div className="flex justify-between"><span>Silo + Torta Palmiste:</span><strong className="text-slate-900">6.0 kg / novillo / día</strong></div>
                <div className="flex justify-between"><span>Sal Mineralizada 6% P:</span><strong className="text-slate-900">100 g / día</strong></div>
                <div className="flex justify-between"><span>Sulfato de Amonio:</span><strong className="text-slate-900">30 g / día (NPT)</strong></div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-xs">
                <span className="text-slate-500">Costo Suplemento:</span>
                <strong className="text-amber-700 font-mono font-bold">$0.95 / novillo / día</strong>
              </div>
            </div>

            {/* Diet 3 */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-sky-800">Terneraje & Sala Cuna</h4>
                <Badge variant="info" size="xs">0 - 4 Meses</Badge>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between"><span>Leche Entera Tibia:</span><strong className="text-slate-900">4.0 L / día (en 2 tomas)</strong></div>
                <div className="flex justify-between"><span>Concentrado Iniciación:</span><strong className="text-slate-900">0.8 kg / día</strong></div>
                <div className="flex justify-between"><span>Heno de Calidad:</span><strong className="text-slate-900">A libre disposición</strong></div>
                <div className="flex justify-between"><span>Agua Limpia Fresca:</span><strong className="text-slate-900">Permanente</strong></div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-xs">
                <span className="text-slate-500">Costo Estimado:</span>
                <strong className="text-sky-700 font-mono font-bold">$2.40 / cría / día</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
