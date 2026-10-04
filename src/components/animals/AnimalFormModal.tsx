import React, { useState, useEffect } from 'react';
import { Animal, AnimalBreed, AnimalCategory, AnimalPurpose, ReproductiveStatus, ProductionStatus, Pasture } from '../../types/livestock';
import { Modal } from '../common/Modal';
import { Plus, X, Check, Dna } from 'lucide-react';

interface AnimalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (animal: Animal) => void;
  pastures: Pasture[];
  initialData?: Animal | null;
}

const BREEDS: AnimalBreed[] = [
  'Girolando',
  'Holstein',
  'Brahman',
  'Gyr Lechero',
  'Jersey',
  'Brown Swiss',
  'Simmental',
  'Angus',
  'Brangus',
  'Nelore',
  'Charolais',
  'Doble Propósito',
  'Criollo / Bon'
];

const CATEGORIES: { id: AnimalCategory; label: string; sex: 'M' | 'F' }[] = [
  { id: 'vaca_produccion', label: 'Vaca en Ordeño / Producción', sex: 'F' },
  { id: 'vaca_seca', label: 'Vaca Seca / Horra', sex: 'F' },
  { id: 'novilla_vientre', label: 'Novilla de Vientre / Levante', sex: 'F' },
  { id: 'ternera_leche', label: 'Ternera Lactante', sex: 'F' },
  { id: 'novillo_ceba', label: 'Novillo de Ceba / Engorde', sex: 'M' },
  { id: 'torete', label: 'Torete de Levante', sex: 'M' },
  { id: 'toro_reproductor', label: 'Toro Reproductor / Semental', sex: 'M' },
  { id: 'ternero_cria', label: 'Ternero al Pie / Lactante', sex: 'M' },
  { id: 'buey', label: 'Buey / Trabajo', sex: 'M' }
];

const DEFAULT_GENETIC_ORIGINS = [
  'Nacido en Finca',
  'Comprado en Feria / Subasta',
  'Transferencia Embrionaria (FIV)',
  'Importado / Purasangre',
  'Inseminación Artificial (IA)',
  'Monta Natural Controlada',
  'Donación / Traspaso',
  'Cruce Absorbente F1 / F2'
];

export const AnimalFormModal: React.FC<AnimalFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  pastures,
  initialData
}) => {
  // Custom genetic origins storage
  const [originsList, setOriginsList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('agrobovino_custom_origins');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.from(new Set([...DEFAULT_GENETIC_ORIGINS, ...parsed]));
      }
    } catch {
      // ignore
    }
    return DEFAULT_GENETIC_ORIGINS;
  });

  const [isAddingOrigin, setIsAddingOrigin] = useState(false);
  const [newOriginInput, setNewOriginInput] = useState('');

  const [formData, setFormData] = useState<Partial<Animal>>({
    tagNumber: '',
    electronicId: '',
    tattoo: '',
    name: '',
    breed: 'Girolando',
    category: 'vaca_produccion',
    sex: 'F',
    birthDate: new Date().toISOString().split('T')[0],
    weightKg: 450,
    bodyCondition: 3.5,
    purpose: 'doble_proposito',
    reproductiveStatus: 'vacia',
    productionStatus: 'ordeño',
    pastureId: pastures[0]?.id || '',
    lotName: 'Lote Ordeño Principal',
    damTag: '',
    sireTag: '',
    geneticOrigin: 'Nacido en Finca',
    healthStatus: 'sano',
    totalLactations: 0,
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      // Normalize origin label if needed
      let currentOrigin = initialData.geneticOrigin;
      if (currentOrigin === 'nacido_finca') currentOrigin = 'Nacido en Finca';
      else if (currentOrigin === 'comprado_feria') currentOrigin = 'Comprado en Feria / Subasta';
      else if (currentOrigin === 'transferencia_embrionaria') currentOrigin = 'Transferencia Embrionaria (FIV)';
      else if (currentOrigin === 'importado') currentOrigin = 'Importado / Purasangre';

      setFormData({
        ...initialData,
        geneticOrigin: currentOrigin
      });

      if (currentOrigin && !originsList.includes(currentOrigin)) {
        setOriginsList(prev => [...prev, currentOrigin]);
      }
    } else {
      setFormData({
        tagNumber: `CO-${Math.floor(100 + Math.random() * 900)}`,
        electronicId: `982.000341${Math.floor(100000 + Math.random() * 900000)}`,
        tattoo: '',
        name: '',
        breed: 'Girolando',
        category: 'vaca_produccion',
        sex: 'F',
        birthDate: new Date(Date.now() - 365 * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weightKg: 480,
        bodyCondition: 3.5,
        purpose: 'doble_proposito',
        reproductiveStatus: 'vacia',
        productionStatus: 'ordeño',
        pastureId: pastures[0]?.id || '',
        lotName: 'Lote Ordeño Principal',
        damTag: '',
        sireTag: '',
        geneticOrigin: 'Nacido en Finca',
        healthStatus: 'sano',
        totalLactations: 1,
        notes: ''
      });
      setIsAddingOrigin(false);
      setNewOriginInput('');
    }
  }, [initialData, isOpen, pastures]);

  const handleAddNewOrigin = () => {
    const trimmed = newOriginInput.trim();
    if (!trimmed) return;

    if (!originsList.includes(trimmed)) {
      const updated = [...originsList, trimmed];
      setOriginsList(updated);
      try {
        const customOnly = updated.filter(o => !DEFAULT_GENETIC_ORIGINS.includes(o));
        localStorage.setItem('agrobovino_custom_origins', JSON.stringify(customOnly));
      } catch {
        // ignore
      }
    }

    setFormData(prev => ({ ...prev, geneticOrigin: trimmed }));
    setNewOriginInput('');
    setIsAddingOrigin(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tagNumber?.trim()) {
      alert('Por favor ingrese el número de Arete Oficial');
      return;
    }

    const animalToSave: Animal = {
      id: initialData ? initialData.id : `anim-${Date.now()}`,
      tagNumber: formData.tagNumber.trim().toUpperCase(),
      electronicId: formData.electronicId?.trim() || undefined,
      tattoo: formData.tattoo?.trim() || undefined,
      name: formData.name?.trim() || `Bovino ${formData.tagNumber}`,
      breed: (formData.breed as AnimalBreed) || 'Doble Propósito',
      category: (formData.category as AnimalCategory) || 'vaca_produccion',
      sex: formData.sex || 'F',
      birthDate: formData.birthDate || new Date().toISOString().split('T')[0],
      weightKg: Number(formData.weightKg) || 400,
      bodyCondition: Number(formData.bodyCondition) || 3.0,
      purpose: (formData.purpose as AnimalPurpose) || 'doble_proposito',
      reproductiveStatus: (formData.reproductiveStatus as ReproductiveStatus) || 'vacia',
      productionStatus: (formData.productionStatus as ProductionStatus) || 'ordeño',
      pastureId: formData.pastureId || pastures[0]?.id || '',
      lotName: formData.lotName || 'Lote General',
      damTag: formData.damTag?.trim() || undefined,
      sireTag: formData.sireTag?.trim() || undefined,
      geneticOrigin: formData.geneticOrigin || 'Nacido en Finca',
      purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : undefined,
      purchaseDate: formData.purchaseDate || undefined,
      healthStatus: formData.healthStatus || 'sano',
      totalLactations: Number(formData.totalLactations) || 0,
      notes: formData.notes?.trim() || undefined,
      createdAt: initialData?.createdAt || new Date().toISOString()
    };

    onSave(animalToSave);
    onClose();
  };

  const handleCategoryChange = (cat: AnimalCategory) => {
    const selected = CATEGORIES.find(c => c.id === cat);
    setFormData(prev => ({
      ...prev,
      category: cat,
      sex: selected ? selected.sex : prev.sex,
      productionStatus: cat.includes('ordeño') || cat === 'vaca_produccion' ? 'ordeño' : cat.includes('ceba') ? 'ceba' : 'crecimiento'
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Editar Bovino ${initialData.tagNumber}` : 'Registrar Nuevo Bovino en Censo'}
      subtitle="Ficha de Identificación, Registro Genealógico y Zootécnico"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-slate-800">
        {/* Section 1: Identifiers */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 border-b border-slate-100 pb-1 flex items-center justify-between">
            <span>1. Identificación Oficial</span>
            <span className="text-[10px] text-slate-400 font-normal">Campos obligatorios *</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Arete Oficial (Caravana) *
              </label>
              <input
                type="text"
                required
                value={formData.tagNumber}
                onChange={e => setFormData({ ...formData, tagNumber: e.target.value })}
                placeholder="ej. CO-145"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Chip RFID / Electrónico
              </label>
              <input
                type="text"
                value={formData.electronicId || ''}
                onChange={e => setFormData({ ...formData, electronicId: e.target.value })}
                placeholder="ej. 982.0003..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-sky-700 focus:bg-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Tatuaje / Marca de Fierro
              </label>
              <input
                type="text"
                value={formData.tattoo || ''}
                onChange={e => setFormData({ ...formData, tattoo: e.target.value })}
                placeholder="ej. T-145"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Nombre / Alias del Animal
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="ej. Paloma, Campeón"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-4 bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative group shrink-0">
                {formData.photoUrl ? (
                  <img 
                    src={formData.photoUrl} 
                    alt="Foto bovino" 
                    className="w-14 h-14 rounded-xl object-cover border border-emerald-500/40"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold border border-slate-300">
                    Foto
                  </div>
                )}
              </div>
              <div className="flex-1 w-full">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Fotografía del Bovino (Ficha Zootécnica):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.photoUrl || ''}
                    onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="URL de imagen o carga un archivo..."
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                  <label className="bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 cursor-pointer shrink-0 shadow-2xs">
                    Examinar...
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setFormData({ ...formData, photoUrl: ev.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Zootecnia */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 border-b border-slate-100 pb-1">
            2. Clasificación Zootécnica & Características
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Raza Principal *
              </label>
              <select
                value={formData.breed}
                onChange={e => setFormData({ ...formData, breed: e.target.value as AnimalBreed })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                {BREEDS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={e => handleCategoryChange(e.target.value as AnimalCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label} ({c.sex === 'F' ? 'Hembra' : 'Macho'})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Propósito Productivo *
              </label>
              <select
                value={formData.purpose}
                onChange={e => setFormData({ ...formData, purpose: e.target.value as AnimalPurpose })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="doble_proposito">Doble Propósito (Carne + Leche)</option>
                <option value="leche">Lechería Especializada</option>
                <option value="carne">Ceba / Producción de Carne</option>
                <option value="genetica">Genética / Cabaña Reproductora</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Fecha Nacimiento *
              </label>
              <input
                type="date"
                required
                value={formData.birthDate}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Peso Actual (Kg) *
              </label>
              <input
                type="number"
                required
                value={formData.weightKg}
                onChange={e => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Condición Corporal (1.0 - 5.0)
              </label>
              <input
                type="number"
                step="0.25"
                min="1"
                max="5"
                value={formData.bodyCondition}
                onChange={e => setFormData({ ...formData, bodyCondition: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Lactancias Acumuladas
              </label>
              <input
                type="number"
                min="0"
                value={formData.totalLactations}
                onChange={e => setFormData({ ...formData, totalLactations: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Ubicación y Estados */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 border-b border-slate-100 pb-1">
            3. Asignación de Potrero, Lote & Estados
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Potrero Asignado *
              </label>
              <select
                value={formData.pastureId}
                onChange={e => setFormData({ ...formData, pastureId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                {pastures.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name} ({p.areaHa} Ha)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Lote de Manejo *
              </label>
              <input
                type="text"
                value={formData.lotName || ''}
                onChange={e => setFormData({ ...formData, lotName: e.target.value })}
                placeholder="ej. Lote Ordeño 1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Estado Reproductivo *
              </label>
              <select
                value={formData.reproductiveStatus}
                onChange={e => setFormData({ ...formData, reproductiveStatus: e.target.value as ReproductiveStatus })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="vacia">Vacía / Abierta</option>
                <option value="celo">En Celo</option>
                <option value="inseminada">Inseminada</option>
                <option value="gestante">Gestante / Preñada</option>
                <option value="parida">Parida</option>
                <option value="en_secado">En Secado</option>
                <option value="descarte">Descarte</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Estado Sanitario *
              </label>
              <select
                value={formData.healthStatus}
                onChange={e => setFormData({ ...formData, healthStatus: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="sano">Sano / Apto</option>
                <option value="en_tratamiento">En Tratamiento</option>
                <option value="cuarentena">En Cuarentena</option>
                <option value="cronico">Condición Especial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Genealogía & Origen Genético Dinámico */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 border-b border-slate-100 pb-1">
            4. Genealogía & Procedencia
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Arete / Código de la Madre (Dam)
              </label>
              <input
                type="text"
                value={formData.damTag || ''}
                onChange={e => setFormData({ ...formData, damTag: e.target.value })}
                placeholder="ej. CO-022"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Toro Padre / Pajilla (Sire)
              </label>
              <input
                type="text"
                value={formData.sireTag || ''}
                onChange={e => setFormData({ ...formData, sireTag: e.target.value })}
                placeholder="ej. GYR-JAGUAR"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-600">
                  Origen Genético *
                </label>
                {!isAddingOrigin && (
                  <button
                    type="button"
                    onClick={() => setIsAddingOrigin(true)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    Nuevo Origen
                  </button>
                )}
              </div>

              {!isAddingOrigin ? (
                <div className="space-y-1">
                  <select
                    value={formData.geneticOrigin}
                    onChange={e => {
                      if (e.target.value === '__add_new__') {
                        setIsAddingOrigin(true);
                      } else {
                        setFormData({ ...formData, geneticOrigin: e.target.value });
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    {originsList.map(origin => (
                      <option key={origin} value={origin}>{origin}</option>
                    ))}
                    <option value="__add_new__" className="text-emerald-700 font-bold bg-emerald-50">
                      + Agregar nuevo origen genético...
                    </option>
                  </select>
                </div>
              ) : (
                /* INLINE ADD NEW GENETIC ORIGIN FORM */
                <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-2 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1 uppercase">
                      <Dna className="w-3 h-3 text-emerald-600" />
                      Nuevo Origen Genético
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingOrigin(false);
                        setNewOriginInput('');
                      }}
                      className="text-slate-400 hover:text-slate-700 p-0.5"
                      title="Cancelar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      autoFocus
                      value={newOriginInput}
                      onChange={e => setNewOriginInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewOrigin();
                        }
                      }}
                      placeholder="Ej: Convenio Genético Brasil..."
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewOrigin}
                      disabled={!newOriginInput.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shrink-0 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Guardar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Observaciones */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            Observaciones Zootécnicas & Notas
          </label>
          <textarea
            rows={2}
            value={formData.notes || ''}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Características de ubre, aplomos, temperamento, producción esperada..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/30 transition-all"
          >
            {initialData ? 'Guardar Cambios' : 'Registrar Bovino'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
