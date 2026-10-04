import React, { useState } from 'react';
import { Radio, Search, CheckCircle2, ArrowRight, Zap, QrCode, AlertCircle } from 'lucide-react';
import { Animal } from '../../types/livestock';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

interface RfidScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  animals: Animal[];
  onSelectAnimal: (animal: Animal) => void;
}

export const RfidScannerModal: React.FC<RfidScannerModalProps> = ({
  isOpen,
  onClose,
  animals,
  onSelectAnimal
}) => {
  const [rfidInput, setRfidInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedAnimal, setLastScannedAnimal] = useState<Animal | null>(null);
  const [notFound, setNotFound] = useState(false);

  const simulateFieldScan = (animalToScan: Animal) => {
    setIsScanning(true);
    setNotFound(false);
    setRfidInput(animalToScan.electronicId || animalToScan.tagNumber);

    setTimeout(() => {
      setIsScanning(false);
      setLastScannedAnimal(animalToScan);
    }, 600);
  };

  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfidInput.trim()) return;

    const term = rfidInput.trim().toLowerCase();
    const found = animals.find(
      (a) =>
        a.electronicId?.toLowerCase().includes(term) ||
        a.tagNumber.toLowerCase() === term ||
        a.tattoo?.toLowerCase() === term ||
        a.name.toLowerCase().includes(term)
    );

    if (found) {
      setLastScannedAnimal(found);
      setNotFound(false);
    } else {
      setLastScannedAnimal(null);
      setNotFound(true);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lector RFID / Identificación Electrónica Bovino"
      subtitle="Escaneo de caravana electrónica ISO 11784/11785 o Arete de Campo"
      maxWidth="xl"
    >
      <div className="space-y-6 text-slate-800">
        {/* Scanner Simulation Box */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-sky-50/70 to-slate-50 border-2 border-dashed border-sky-300 p-6 text-center">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-400 animate-pulse" />

          <div className="w-16 h-16 mx-auto rounded-full bg-white border border-sky-200 flex items-center justify-center text-sky-600 mb-3 shadow-xs">
            {isScanning ? (
              <Radio className="w-8 h-8 animate-spin" />
            ) : (
              <Radio className="w-8 h-8 animate-pulse" />
            )}
          </div>

          <h4 className="text-sm font-bold text-slate-900 mb-1">
            {isScanning ? 'Leyendo transpondedor RFID...' : 'Lector Listo para Captura en Manga/Brete'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 font-medium">
            Pase el bastón electrónico o ingrese el código de arete visual/electrónico.
          </p>

          {/* Form input */}
          <form onSubmit={handleManualLookup} className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              value={rfidInput}
              onChange={(e) => {
                setRfidInput(e.target.value);
                setNotFound(false);
              }}
              placeholder="Arete visual (CO-104) o Chip (982.000...)"
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 font-mono shadow-2xs"
            />
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-sky-600/30"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </form>
        </div>

        {/* Quick Simulation Tags for Field Testing */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="text-xs font-bold text-slate-600 mb-2.5 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Simular paso por báscula / Manga de trabajo:
          </div>
          <div className="flex flex-wrap gap-2">
            {animals.slice(0, 5).map((animal) => (
              <button
                key={animal.id}
                type="button"
                onClick={() => simulateFieldScan(animal)}
                className="text-xs bg-white hover:bg-slate-100 border border-slate-200 hover:border-sky-400 text-slate-700 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-mono shadow-2xs font-semibold"
              >
                <QrCode className="w-3.5 h-3.5 text-sky-600" />
                {animal.tagNumber} ({animal.name.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>

        {/* Not Found State */}
        {notFound && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <div>
              <span className="font-bold">Arete o Chip no encontrado.</span> Verifique que el código esté registrado en el censo ganadero o cree un nuevo animal.
            </div>
          </div>
        )}

        {/* Scanned Result Card */}
        {lastScannedAnimal && (
          <div className="bg-white border-2 border-emerald-500 rounded-2xl p-5 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shadow-2xs">
                  {lastScannedAnimal.sex === 'F' ? '🐄' : '🐂'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold text-slate-900 font-mono">
                      {lastScannedAnimal.tagNumber}
                    </span>
                    <Badge variant={lastScannedAnimal.sex === 'F' ? 'purple' : 'info'}>
                      {lastScannedAnimal.category.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm font-bold text-emerald-700">
                    {lastScannedAnimal.name} • {lastScannedAnimal.breed}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block font-mono">Chip RFID:</span>
                <span className="text-xs font-bold text-sky-700 font-mono">
                  {lastScannedAnimal.electronicId || 'Sin RFID asignado'}
                </span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-5">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Peso Actual:</span>
                <span className="text-sm font-bold text-slate-900">{lastScannedAnimal.weightKg} kg</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Condición:</span>
                <span className="text-sm font-bold text-amber-700">CC {lastScannedAnimal.bodyCondition}/5.0</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Estado Repr.:</span>
                <span className="text-sm font-bold text-purple-700 capitalize">{lastScannedAnimal.reproductiveStatus}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Lote:</span>
                <span className="text-sm font-bold text-emerald-700 truncate block">{lastScannedAnimal.lotName}</span>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={() => {
                onSelectAnimal(lastScannedAnimal);
                onClose();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all text-sm"
            >
              <CheckCircle2 className="w-5 h-5" />
              Abrir Hoja de Vida Completa del Bovino
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
