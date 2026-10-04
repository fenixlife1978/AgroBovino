import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Download, 
  Layers, 
  Table, 
  Grid, 
  CheckSquare, 
  Square, 
  Eye, 
  Edit3, 
  Trash2,
  Radio
} from 'lucide-react';
import { Animal, Pasture } from '../../types/livestock';
import { Badge } from '../common/Badge';
import { formatAge, getAnimalUGM, isAnimalInWithdrawal } from '../../utils/livestockCalculators';

interface AnimalsViewProps {
  animals: Animal[];
  pastures: Pasture[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectAnimal: (animal: Animal) => void;
  onEditAnimal: (animal: Animal) => void;
  onDeleteAnimal: (id: string) => void;
  onOpenNewAnimal: () => void;
  onOpenBatchActions: (selected: Animal[]) => void;
  onOpenRfidScanner: () => void;
}

export const AnimalsView: React.FC<AnimalsViewProps> = ({
  animals,
  pastures,
  searchQuery,
  onSelectAnimal,
  onEditAnimal,
  onDeleteAnimal,
  onOpenNewAnimal,
  onOpenBatchActions,
  onOpenRfidScanner
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [breedFilter, setBreedFilter] = useState<string>('all');
  const [reproductiveFilter, setReproductiveFilter] = useState<string>('all');
  const [pastureFilter, setPastureFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');

  // Filtered list
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      // Search
      const search = searchQuery.toLowerCase().trim();
      const matchesSearch = !search || (
        animal.tagNumber.toLowerCase().includes(search) ||
        animal.name.toLowerCase().includes(search) ||
        animal.electronicId?.toLowerCase().includes(search) ||
        animal.tattoo?.toLowerCase().includes(search) ||
        animal.breed.toLowerCase().includes(search) ||
        animal.lotName.toLowerCase().includes(search) ||
        animal.damTag?.toLowerCase().includes(search) ||
        animal.sireTag?.toLowerCase().includes(search)
      );

      // Category
      const matchesCategory = categoryFilter === 'all' || animal.category === categoryFilter;
      // Breed
      const matchesBreed = breedFilter === 'all' || animal.breed === breedFilter;
      // Reproductive
      const matchesRepro = reproductiveFilter === 'all' || animal.reproductiveStatus === reproductiveFilter;
      // Pasture
      const matchesPasture = pastureFilter === 'all' || animal.pastureId === pastureFilter;
      // Health
      const matchesHealth = healthFilter === 'all' || 
        (healthFilter === 'retiro' ? isAnimalInWithdrawal(animal.withdrawalEndDate) : animal.healthStatus === healthFilter);

      return matchesSearch && matchesCategory && matchesBreed && matchesRepro && matchesPasture && matchesHealth;
    });
  }, [animals, searchQuery, categoryFilter, breedFilter, reproductiveFilter, pastureFilter, healthFilter]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredAnimals.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAnimals.map(a => a.id));
    }
  };

  const selectedAnimalsList = useMemo(() => {
    return animals.filter(a => selectedIds.includes(a.id));
  }, [animals, selectedIds]);

  // Total UGM calculation
  const totalUGM = useMemo(() => {
    return animals.reduce((acc, curr) => acc + getAnimalUGM(curr.category, curr.weightKg), 0).toFixed(1);
  }, [animals]);

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Arete', 'RFID', 'Nombre', 'Raza', 'Categoria', 'Sexo', 'Peso_Kg', 'Condicion_Corp', 'Estado_Repro', 'Lote', 'Potrero', 'Fecha_Nac'];
    const rows = filteredAnimals.map(a => {
      const past = pastures.find(p => p.id === a.pastureId);
      return [
        a.tagNumber,
        a.electronicId || '',
        a.name,
        a.breed,
        a.category,
        a.sex,
        a.weightKg,
        a.bodyCondition,
        a.reproductiveStatus,
        a.lotName,
        past?.name || '',
        a.birthDate
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Censo_Ganadero_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Censo Total</span>
          <span className="text-2xl font-black text-slate-900">{animals.length}</span>
          <span className="text-[10px] text-slate-500 block font-medium">Cabezas de ganado</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Vacas Ordeño</span>
          <span className="text-2xl font-black text-emerald-600">
            {animals.filter(a => a.productionStatus === 'ordeño').length}
          </span>
          <span className="text-[10px] text-emerald-700 block font-medium">En producción láctea</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Novillos Ceba</span>
          <span className="text-2xl font-black text-amber-600">
            {animals.filter(a => a.category === 'novillo_ceba').length}
          </span>
          <span className="text-[10px] text-amber-700 block font-medium">En engorde intensivo</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Hembras Gestantes</span>
          <span className="text-2xl font-black text-purple-600">
            {animals.filter(a => a.reproductiveStatus === 'gestante').length}
          </span>
          <span className="text-[10px] text-purple-700 block font-medium">Preñez confirmada</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Carga Total (UGM)</span>
          <span className="text-2xl font-black text-sky-600">{totalUGM}</span>
          <span className="text-[10px] text-sky-700 block font-medium">Unidades Gran Ganado</span>
        </div>
      </div>

      {/* Main Filter & Action Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Left Actions: Batch actions + Create + Scan */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenNewAnimal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo Bovino
            </button>

            <button
              onClick={onOpenRfidScanner}
              className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Radio className="w-4 h-4 text-sky-600" />
              Escanear RFID
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={() => onOpenBatchActions(selectedAnimalsList)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-900/20 transition-all animate-pulse"
              >
                <Layers className="w-4 h-4" />
                Acción por Lote ({selectedIds.length})
              </button>
            )}
          </div>

          {/* Right Actions: View Switcher + Export */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={exportToCSV}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Exportar Censo a Excel / CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Vista Tabla"
              >
                <Table className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Vista Cuadrícula"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Categoría</label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Todas ({animals.length})</option>
              <option value="vaca_produccion">Vacas en Ordeño</option>
              <option value="vaca_seca">Vacas Secas / Horras</option>
              <option value="novilla_vientre">Novillas de Vientre</option>
              <option value="novillo_ceba">Novillos de Ceba</option>
              <option value="toro_reproductor">Toros Reproductores</option>
              <option value="ternera_leche">Terneras Lactantes</option>
              <option value="ternero_cria">Terneros de Cría</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Raza</label>
            <select
              value={breedFilter}
              onChange={e => setBreedFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Todas las Razas</option>
              <option value="Girolando">Girolando</option>
              <option value="Holstein">Holstein</option>
              <option value="Brahman">Brahman</option>
              <option value="Gyr Lechero">Gyr Lechero</option>
              <option value="Jersey">Jersey</option>
              <option value="Simmental">Simmental</option>
              <option value="Brangus">Brangus</option>
              <option value="Nelore">Nelore</option>
              <option value="Doble Propósito">Doble Propósito</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Estado Reproductivo</label>
            <select
              value={reproductiveFilter}
              onChange={e => setReproductiveFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Todos los Estados</option>
              <option value="vacia">Vacías / Abiertas</option>
              <option value="celo">En Celo</option>
              <option value="inseminada">Inseminadas</option>
              <option value="gestante">Gestantes / Preñadas</option>
              <option value="parida">Paridas</option>
              <option value="en_secado">En Secado</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Potrero</label>
            <select
              value={pastureFilter}
              onChange={e => setPastureFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Todos los Potreros</option>
              {pastures.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Sanidad / Retiro</label>
            <select
              value={healthFilter}
              onChange={e => setHealthFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Todos los Estados</option>
              <option value="sano">Sanos</option>
              <option value="retiro">⚠️ Periodo de Retiro Activo</option>
              <option value="en_tratamiento">En Tratamiento</option>
              <option value="cuarentena">En Cuarentena</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Bulk select banner */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-500 font-medium">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 transition-colors"
          >
            {selectedIds.length > 0 && selectedIds.length === filteredAnimals.length ? (
              <CheckSquare className="w-4 h-4 text-emerald-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Seleccionar todos ({filteredAnimals.length})</span>
          </button>
          {selectedIds.length > 0 && (
            <span className="text-emerald-700 font-bold">
              • {selectedIds.length} seleccionados
            </span>
          )}
        </div>
        <span>Mostrando {filteredAnimals.length} de {animals.length} bovinos</span>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredAnimals.length}
                      onChange={handleSelectAll}
                      className="rounded bg-white border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="p-3.5">Arete / Identificación</th>
                  <th className="p-3.5">Nombre & Raza</th>
                  <th className="p-3.5">Categoría & Sexo</th>
                  <th className="p-3.5">Edad / Peso</th>
                  <th className="p-3.5">Estado Reproductivo</th>
                  <th className="p-3.5">Potrero / Lote</th>
                  <th className="p-3.5">Sanidad</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAnimals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-500">
                      No se encontraron bovinos con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredAnimals.map((animal) => {
                    const isSelected = selectedIds.includes(animal.id);
                    const past = pastures.find(p => p.id === animal.pastureId);
                    const inRetiro = isAnimalInWithdrawal(animal.withdrawalEndDate);

                    return (
                      <tr
                        key={animal.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? 'bg-emerald-50/50' : inRetiro ? 'bg-rose-50/40' : ''
                        }`}
                      >
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(animal.id)}
                            className="rounded bg-white border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => onSelectAnimal(animal)}
                            className="text-left group flex items-center gap-2.5 cursor-pointer"
                          >
                            <img 
                              src={animal.photoUrl || (animal.breed.toLowerCase().includes('holstein') ? 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=200&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=200&auto=format&fit=crop&q=80')} 
                              alt={animal.tagNumber}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:border-emerald-500 transition-colors shrink-0"
                            />
                            <div>
                              <span className="font-mono font-black text-slate-900 text-sm block group-hover:text-emerald-700 transition-colors">
                                {animal.tagNumber}
                              </span>
                              {animal.electronicId && (
                                <span className="text-[10px] text-sky-700 font-mono block font-medium">
                                  RFID: {animal.electronicId.slice(-6)}
                                </span>
                              )}
                            </div>
                          </button>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{animal.name}</div>
                          <div className="text-[11px] text-slate-500">{animal.breed}</div>
                        </td>
                        <td className="p-3.5">
                          <Badge variant={animal.sex === 'F' ? 'purple' : 'info'} size="xs">
                            {animal.category.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-[10px] text-slate-500 block mt-0.5 font-medium capitalize">
                            {animal.purpose.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-extrabold text-slate-900">{animal.weightKg} kg</div>
                          <div className="text-[10px] text-slate-500 font-medium">{formatAge(animal.birthDate)}</div>
                        </td>
                        <td className="p-3.5">
                          <Badge 
                            variant={
                              animal.reproductiveStatus === 'gestante' ? 'success' :
                              animal.reproductiveStatus === 'celo' ? 'warning' :
                              animal.reproductiveStatus === 'inseminada' ? 'info' : 'default'
                            }
                            size="xs"
                          >
                            {animal.reproductiveStatus.toUpperCase()}
                          </Badge>
                          {animal.estimatedCalvingDate && (
                            <span className="text-[10px] text-emerald-700 block font-mono font-bold mt-0.5">
                              Parto: {animal.estimatedCalvingDate.slice(5)}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{past?.code || 'S/P'}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[120px] font-medium">{animal.lotName}</div>
                        </td>
                        <td className="p-3.5">
                          {inRetiro ? (
                            <Badge variant="danger" size="xs">
                              ⚠️ RETIRO {animal.withdrawalEndDate?.slice(5)}
                            </Badge>
                          ) : (
                            <Badge variant={animal.healthStatus === 'sano' ? 'success' : 'warning'} size="xs">
                              {animal.healthStatus.toUpperCase()}
                            </Badge>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onSelectAnimal(animal)}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Ver Ficha Completa"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditAnimal(animal)}
                              className="p-1.5 text-slate-400 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteAnimal(animal.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAnimals.map((animal) => {
            const isSelected = selectedIds.includes(animal.id);
            const inRetiro = isAnimalInWithdrawal(animal.withdrawalEndDate);
            const past = pastures.find(p => p.id === animal.pastureId);

            return (
              <div
                key={animal.id}
                className={`bg-white border rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between shadow-2xs ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : inRetiro
                    ? 'border-rose-300 bg-rose-50/20'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(animal.id)}
                        className="rounded bg-white border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg">
                        {animal.sex === 'F' ? '🐄' : '🐂'}
                      </div>
                      <div>
                        <span className="text-base font-black text-slate-900 font-mono block leading-none">
                          {animal.tagNumber}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
                          {animal.name}
                        </span>
                      </div>
                    </div>

                    <Badge variant={animal.sex === 'F' ? 'purple' : 'info'} size="xs">
                      {animal.category.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  {inRetiro && (
                    <div className="mb-2 p-1.5 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-800 font-bold flex items-center gap-1">
                      Retiro activo hasta {animal.withdrawalEndDate}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mb-3">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">Raza:</span>
                      <span className="font-bold text-slate-800">{animal.breed}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">Peso / Edad:</span>
                      <span className="font-bold text-slate-900">{animal.weightKg} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">Estado Repro:</span>
                      <span className="font-bold text-purple-700 capitalize">{animal.reproductiveStatus}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">Potrero:</span>
                      <span className="font-bold text-emerald-700 truncate block">{past?.name || 'S/P'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-500 font-mono font-medium">CC: {animal.bodyCondition}/5.0</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectAnimal(animal)}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ficha
                    </button>
                    <button
                      onClick={() => onEditAnimal(animal)}
                      className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
