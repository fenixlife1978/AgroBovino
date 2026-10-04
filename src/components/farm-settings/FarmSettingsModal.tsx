import React, { useState, useEffect } from 'react';
import { FarmProfile } from '../../types/livestock';
import { Modal } from '../common/Modal';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Settings, 
  Laptop
} from 'lucide-react';
import { storage } from '../../services/storageService';

interface FarmSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: FarmProfile;
  onSaveFarm: (farm: FarmProfile) => void;
  onDataReset: () => void;
  initialTab?: 'settings' | 'backup';
}

export const FarmSettingsModal: React.FC<FarmSettingsModalProps> = ({
  isOpen,
  onClose,
  farm,
  onSaveFarm,
  onDataReset,
  initialTab = 'settings'
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'backup'>(initialTab);
  const [formData, setFormData] = useState<FarmProfile>(farm);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    setFormData(farm);
    setActiveTab(initialTab);
    setImportStatus(null);
  }, [farm, initialTab, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveFarm(formData);
    onClose();
  };

  const handleExportBackup = () => {
    const jsonStr = storage.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_AgroBovino_ERP_${farm.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storage.importFullBackup(content);
      if (success) {
        setImportStatus('Copia de seguridad restaurada con éxito.');
        setTimeout(() => {
          onDataReset();
          onClose();
        }, 1200);
      } else {
        setImportStatus('Error al leer el archivo JSON de respaldo.');
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = async () => {
    const first = window.confirm('REINICIO DE FÁBRICA: se eliminarán todos los datos de la finca, usuarios y configuraciones de Turso. Esta acción no se puede deshacer. ¿Desea continuar?');
    if (!first) return;
    const second = window.confirm('Confirme nuevamente: se restaurará únicamente el administrador semilla y deberá iniciar sesión otra vez.');
    if (!second) return;

    try {
      const response = await fetch('/api/admin/factory-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setImportStatus(data.error || 'No se pudo completar el reinicio de fábrica.');
        return;
      }
      localStorage.clear();
      setImportStatus('Reinicio de fábrica completado. Iniciando sesión nuevamente...');
      setTimeout(() => window.location.reload(), 900);
    } catch {
      setImportStatus('No fue posible contactar al servidor para realizar el reinicio de fábrica.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración de la Finca"
      subtitle="Datos generales, moneda de operación y copias de seguridad"
      maxWidth="2xl"
    >
      <div className="space-y-5 text-slate-800">
        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'settings' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Finca & Parámetros</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'backup' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Respaldo & Aplicación</span>
          </button>
        </div>

        {/* TAB 1: FARM SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nombre de la Finca / Hacienda *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Identificación Legal / Registro Ganadero (RUT / RUC / RFC)
                </label>
                <input
                  type="text"
                  value={formData.legalId}
                  onChange={e => setFormData({ ...formData, legalId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Propietario / Representante Legal
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Ubicación Geográfica (Municipio, Departamento/Provincia)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Área Total del Predio (Hectáreas)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.totalAreaHa}
                  onChange={e => setFormData({ ...formData, totalAreaHa: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Área Efectiva de Pastoreo (Ha)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.grazingAreaHa}
                  onChange={e => setFormData({ ...formData, grazingAreaHa: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Orientación Productiva Principal
                </label>
                <select
                  value={formData.systemType}
                  onChange={e => setFormData({ ...formData, systemType: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="Doble Propósito">Doble Propósito (Carne + Leche)</option>
                  <option value="Lechería Especializada">Lechería Especializada (Trópico Alto / Bajo)</option>
                  <option value="Cría & Levante">Cría & Levante</option>
                  <option value="Ceba & Engorde Intensivo">Ceba & Engorde Intensivo</option>
                  <option value="Genética & Cabaña">Genética Pura & Biotecnología</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Moneda de Registro Financiero
                </label>
                <select
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="USD">Dólar Estadounidense (USD $)</option>
                  <option value="COP">Peso Colombiano (COP $)</option>
                  <option value="MXN">Peso Mexicano (MXN $)</option>
                  <option value="BRL">Real Brasileño (R$)</option>
                  <option value="EUR">Euro (EUR €)</option>
                  <option value="ARS">Peso Argentino (ARS $)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Guardar Configuración
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: BACKUP & APP ICON */}
        {activeTab === 'backup' && (
          <div className="space-y-5">
            {/* App Icon Presentation */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
              <img
                src="/app-icon.png"
                alt="AgroBovino ERP v1.0 Icon"
                className="w-20 h-20 rounded-2xl object-cover shadow-md border-2 border-emerald-600/30 shrink-0"
              />
              <div className="space-y-1 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900">Icono Oficial AgroBovino ERP v1.0</h4>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    PWA & Desktop Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Configurado como icono de aplicación, acceso directo de escritorio y splash screen móvil.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <a
                    href="/app-icon.png"
                    download="AgroBovino_ERP_Icon.png"
                    className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    Descargar Icono (.png)
                  </a>
                </div>
              </div>
            </div>

            {/* Desktop / PWA Install Guide */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
              <h5 className="font-bold text-slate-900 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-emerald-600" />
                Instalación como Aplicación de Escritorio & Móvil:
              </h5>
              <p className="text-slate-600 leading-relaxed">
                Puedes instalar <strong>AgroBovino ERP</strong> directamente en tu escritorio (Windows, macOS, Linux) o pantalla de inicio (Android / iOS):
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                <li><strong>En Chrome / Edge (Escritorio):</strong> Haz clic en el icono de <em>Instalar</em> en la barra de direcciones del navegador.</li>
                <li><strong>En Android:</strong> Toca el menú de opciones (⋮) y selecciona <em>"Agregar a la pantalla principal"</em>.</li>
                <li><strong>En iPhone / iPad:</strong> Toca el botón <em>Compartir</em> y selecciona <em>"Añadir a pantalla de inicio"</em>.</li>
              </ul>
            </div>

            {/* JSON Local Backup Export / Import */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-600" />
                  Descargar Copia de Seguridad JSON
                </h5>
                <p className="text-slate-500 text-[11px]">
                  Guarda un archivo de respaldo con el censo completo, hojas de vida, partos y transacciones.
                </p>
                <button
                  onClick={handleExportBackup}
                  className="w-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar Backup (.json)
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-sky-600" />
                  Restaurar Copia de Seguridad
                </h5>
                <p className="text-slate-500 text-[11px]">
                  Carga un archivo JSON previamente exportado para recuperar tu base de datos ganadera.
                </p>
                <label className="w-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-sky-600" />
                  <span>Importar Archivo JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
                {importStatus && (
                  <span className="text-[10px] text-emerald-700 font-semibold block">{importStatus}</span>
                )}
              </div>
            </div>

            {/* Factory reset */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-slate-700 text-[11px] font-bold block">Reinicio de fábrica</span>
                  <span className="text-slate-500 text-[10px]">Elimina la finca y usuarios de Turso y restaura únicamente el administrador semilla.</span>
                </div>
                <button
                  type="button"
                  onClick={handleFactoryReset}
                  className="text-rose-600 hover:text-rose-700 hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reiniciar de fábrica
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
