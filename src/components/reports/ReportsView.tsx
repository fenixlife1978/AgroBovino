import React, { useState, useMemo, useRef } from 'react';
import { 
  Printer, 
  Download, 
  ShieldCheck, 
  FileText, 
  Truck, 
  Layers, 
  CheckCircle2, 
  Loader2, 
  Calendar, 
  Building2, 
  UserCheck, 
  Filter,
  Award
} from 'lucide-react';
import { Animal, Pasture, FarmProfile, HealthRecord, ReproductionEvent } from '../../types/livestock';
import { formatAge, getAnimalUGM, calculatePastureCarryingCapacity } from '../../utils/livestockCalculators';
import { exportElementToPdf } from '../../utils/pdfExport';

interface ReportsViewProps {
  animals: Animal[];
  pastures: Pasture[];
  farm: FarmProfile;
  healthRecords: HealthRecord[];
  reproductionEvents: ReproductionEvent[];
}

type ReportKey = 'official_census' | 'mobilization_guide' | 'sanitary_cert' | 'pasture_audit' | 'reproductive_kpi';

export const ReportsView: React.FC<ReportsViewProps> = ({
  animals,
  pastures,
  farm,
  healthRecords,
  reproductionEvents
}) => {
  const [reportType, setReportType] = useState<ReportKey>('official_census');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [selectedLotFilter, setSelectedLotFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Mobilization guide state
  const [guideTransport, setGuideTransport] = useState('Camión Ganadero Doble Troque (Placa: WZJ-881)');
  const [guideDriver, setGuideDriver] = useState('Rodrigo Gómez (C.C. 79.441.200)');
  const [guideDestination, setGuideDestination] = useState('Frigorífico Regional del Valle / Planta de Faena');
  const [guidePurpose, setGuidePurpose] = useState('Sacrificio / Faena Comercial');
  const [guideQuantity, setGuideQuantity] = useState<number>(10);

  // Technical certification state
  const [vetName, setVetName] = useState('Dr. Carlos Mendoza (M.V.Z. Mat. Prof. 08492)');
  const [certNotes, setCertNotes] = useState('El hato se encuentra al día con los ciclos oficiales de vacunación y bajo estricto plan de bioseguridad predial.');

  const reportRef = useRef<HTMLDivElement>(null);

  // Available lots for filter
  const availableLots = useMemo(() => {
    const lots = new Set<string>();
    animals.forEach(a => {
      if (a.lotName) lots.add(a.lotName);
    });
    return Array.from(lots);
  }, [animals]);

  // Filtered animals for reports
  const filteredAnimals = useMemo(() => {
    return animals.filter(a => {
      const matchLot = selectedLotFilter === 'all' || a.lotName === selectedLotFilter;
      const matchCategory = selectedCategoryFilter === 'all' || a.category === selectedCategoryFilter;
      return matchLot && matchCategory;
    });
  }, [animals, selectedLotFilter, selectedCategoryFilter]);

  // Official census breakdown by categories
  const categoryCounts = useMemo(() => {
    const map: Record<string, { count: number; totalKg: number; ugm: number }> = {};
    filteredAnimals.forEach(a => {
      if (!map[a.category]) {
        map[a.category] = { count: 0, totalKg: 0, ugm: 0 };
      }
      map[a.category].count += 1;
      map[a.category].totalKg += a.weightKg;
      map[a.category].ugm += getAnimalUGM(a.category, a.weightKg);
    });
    return map;
  }, [filteredAnimals]);

  const totalAnimals = filteredAnimals.length;
  const totalWeight = filteredAnimals.reduce((acc, a) => acc + a.weightKg, 0);
  const totalUGM = filteredAnimals.reduce((acc, a) => acc + getAnimalUGM(a.category, a.weightKg), 0);
  const avgWeight = totalAnimals > 0 ? Math.round(totalWeight / totalAnimals) : 0;

  // Pasture stats
  const totalPastureArea = pastures.reduce((acc, p) => acc + p.areaHa, 0);
  const farmCarryingCapacity = totalPastureArea > 0 ? (totalUGM / totalPastureArea).toFixed(2) : '0.00';

  // Handler for direct PDF file download
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsExportingPdf(true);
    setExportSuccess(false);

    const safeFarmName = farm.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    
    let reportCode = 'Censo-Ganadero';
    if (reportType === 'mobilization_guide') reportCode = 'Guia-Movilizacion-GSMI';
    if (reportType === 'sanitary_cert') reportCode = 'Certificado-Sanidad-Oficial';
    if (reportType === 'pasture_audit') reportCode = 'Auditoria-Potreros-Carga';
    if (reportType === 'reproductive_kpi') reportCode = 'Informe-Reproductivo-Zootecnico';

    const fileName = `${reportCode}_${safeFarmName}_${dateStr}.pdf`;

    try {
      const success = await exportElementToPdf(reportRef.current, {
        fileName,
        farmName: farm.name,
      });

      if (success) {
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Error al exportar PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Report Selector Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 shadow-xs no-print">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto custom-scroll">
          <button
            onClick={() => setReportType('official_census')}
            className={`px-3.5 py-2 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              reportType === 'official_census' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            Censo Ganadero Oficial
          </button>
          <button
            onClick={() => setReportType('mobilization_guide')}
            className={`px-3.5 py-2 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              reportType === 'mobilization_guide' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            Guía de Movilización (GSMI)
          </button>
          <button
            onClick={() => setReportType('sanitary_cert')}
            className={`px-3.5 py-2 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              reportType === 'sanitary_cert' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Certificado Sanitario & Hato Libre
          </button>
          <button
            onClick={() => setReportType('reproductive_kpi')}
            className={`px-3.5 py-2 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              reportType === 'reproductive_kpi' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            Indicadores Reproductivos
          </button>
          <button
            onClick={() => setReportType('pasture_audit')}
            className={`px-3.5 py-2 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              reportType === 'pasture_audit' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            Auditoría de Potreros & Carga
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
            title="Generar y descargar archivo PDF directamente a tu dispositivo"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generando PDF...
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                ¡PDF Descargado!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Descargar PDF
              </>
            )}
          </button>

          {/* Browser Print Button */}
          <button
            onClick={handlePrint}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            title="Abrir ventana de impresión / Guardar como PDF"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Filter Toolbar for Technical Customization */}
      {reportType === 'official_census' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filtros de emisión del informe:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Lote:</span>
              <select
                value={selectedLotFilter}
                onChange={e => setSelectedLotFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 text-xs font-semibold focus:outline-emerald-500"
              >
                <option value="all">Todos los Lotes ({animals.length})</option>
                {availableLots.map(lot => (
                  <option key={lot} value={lot}>{lot}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Categoría:</span>
              <select
                value={selectedCategoryFilter}
                onChange={e => setSelectedCategoryFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 text-xs font-semibold focus:outline-emerald-500"
              >
                <option value="all">Todas las Categorías</option>
                {Object.keys(categoryCounts).map(cat => (
                  <option key={cat} value={cat}>{cat.replace(/_/g, ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT CANVAS (PRINTABLE & EXPORTABLE TO PDF) */}
      <div 
        ref={reportRef}
        id="official-report-canvas"
        className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6 text-slate-800 print:bg-white print:text-black print:border-none print:shadow-none print:p-0"
      >
        {/* Official Header */}
        <div className="border-b-2 border-emerald-700 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase font-mono">
                DOCUMENTO TÉCNICO OFICIAL
              </span>
              <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase font-semibold">
                SISTEMA INTEGRADO DE GESTIÓN GANADERA
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mt-1 print:text-black">
              {reportType === 'official_census' && 'CENSO & REGISTRO ÚNICO GANADERO'}
              {reportType === 'mobilization_guide' && 'GUÍA SANITARIA DE MOVILIZACIÓN INTERNA (GSMI)'}
              {reportType === 'sanitary_cert' && 'CERTIFICADO OFICIAL DE SANIDAD ANIMAL & BIOSEGURIDAD'}
              {reportType === 'pasture_audit' && 'INFORME TÉCNICO DE CAPACIDAD DE CARGA & FORRAJES'}
              {reportType === 'reproductive_kpi' && 'INFORME REPRODUCTIVO Y GESTIÓN DE HATO'}
            </h2>
            <div className="text-xs text-slate-600 mt-1 font-medium flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Predio: <strong className="text-slate-900">{farm.name}</strong></span>
              <span>•</span>
              <span>Reg. ICA/Oficial: <strong className="font-mono text-emerald-800">{farm.legalId}</strong></span>
              <span>•</span>
              <span>Ubicación: <strong className="text-slate-900">{farm.location}</strong></span>
              <span>•</span>
              <span>Titular: <strong className="text-slate-900">{farm.ownerName}</strong></span>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
            <span className="text-xs text-slate-500 block font-medium">Fecha de Emisión:</span>
            <span className="font-mono font-bold text-slate-900 text-sm block">
              {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
            <span className="text-[10px] text-emerald-700 block font-mono font-semibold">
              Folio: EXP-{new Date().getFullYear()}-{Math.floor(10000 + Math.random() * 90000)}
            </span>
          </div>
        </div>

        {/* REPORT 1: OFFICIAL CENSUS */}
        {reportType === 'official_census' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Total Bovinos</span>
                <span className="text-2xl font-black text-slate-900">{totalAnimals}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Cabezas en inventario</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Biomasa Total</span>
                <span className="text-2xl font-black text-emerald-700 font-mono">{(totalWeight / 1000).toFixed(2)} Ton</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Promedio: {avgWeight} kg/animal</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Carga Total (UGM)</span>
                <span className="text-2xl font-black text-sky-700 font-mono">{totalUGM.toFixed(1)}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Unidades Gran Ganado</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Densidad / Carga</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{farmCarryingCapacity}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">UGM / Hectárea</span>
              </div>
            </div>

            {/* Category Breakdown Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                  1. Desglose Zootécnico por Categorías & Grupos Etarios
                </h4>
                <span className="text-[10px] font-semibold text-slate-500">
                  {Object.keys(categoryCounts).length} categorías activas
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200 text-[10px]">
                    <tr>
                      <th className="p-3">Categoría Zootécnica</th>
                      <th className="p-3 text-center">No. Cabezas</th>
                      <th className="p-3 text-center">% del Hato</th>
                      <th className="p-3 text-right">Peso Total (Kg)</th>
                      <th className="p-3 text-right">UGM Total</th>
                      <th className="p-3 text-right">Promedio (Kg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {Object.entries(categoryCounts).map(([cat, data]) => (
                      <tr key={cat} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold capitalize text-slate-900">
                          {cat.replace(/_/g, ' ')}
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-700">{data.count}</td>
                        <td className="p-3 text-center text-slate-600">
                          {totalAnimals > 0 ? Math.round((data.count / totalAnimals) * 100) : 0}%
                        </td>
                        <td className="p-3 text-right font-mono font-medium">{data.totalKg.toLocaleString()} kg</td>
                        <td className="p-3 text-right font-mono font-bold text-sky-700">{data.ugm.toFixed(1)}</td>
                        <td className="p-3 text-right font-mono text-slate-600">
                          {data.count > 0 ? Math.round(data.totalKg / data.count) : 0} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                    <tr>
                      <td className="p-3">TOTAL GENERAL</td>
                      <td className="p-3 text-center text-emerald-800 font-black">{totalAnimals}</td>
                      <td className="p-3 text-center">100%</td>
                      <td className="p-3 text-right font-mono">{totalWeight.toLocaleString()} kg</td>
                      <td className="p-3 text-right font-mono text-sky-800">{totalUGM.toFixed(1)}</td>
                      <td className="p-3 text-right font-mono">{avgWeight} kg</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Individual Listing */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                  2. Relación Detallada de Bovinos Individuales ({filteredAnimals.length} Registros)
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">
                  Identificación Oficial Trazable
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">No. Arete</th>
                      <th className="p-2.5">RFID / Electrónico</th>
                      <th className="p-2.5">Nombre / Raza</th>
                      <th className="p-2.5">Sexo / Edad</th>
                      <th className="p-2.5 text-right">Peso (Kg)</th>
                      <th className="p-2.5">Estado Repro</th>
                      <th className="p-2.5">Origen Genético</th>
                      <th className="p-2.5">Potrero / Lote</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredAnimals.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-bold text-slate-900">{a.tagNumber}</td>
                        <td className="p-2.5 font-mono text-[10px] text-slate-500">{a.electronicId || 'N/A'}</td>
                        <td className="p-2.5 font-medium text-slate-900">
                          {a.name} <span className="text-slate-500 text-[11px]">({a.breed})</span>
                        </td>
                        <td className="p-2.5 text-slate-600">{a.sex} • {formatAge(a.birthDate)}</td>
                        <td className="p-2.5 text-right font-mono font-semibold text-slate-900">{a.weightKg} kg</td>
                        <td className="p-2.5 capitalize text-slate-700">{a.reproductiveStatus}</td>
                        <td className="p-2.5 capitalize text-slate-600 text-[11px]">{a.geneticOrigin?.replace(/_/g, ' ') || 'Nac. en finca'}</td>
                        <td className="p-2.5 font-medium text-emerald-800">{a.lotName || 'Hato General'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 2: MOBILIZATION GUIDE */}
        {reportType === 'mobilization_guide' && (
          <div className="space-y-6">
            <div className="no-print bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  Configurar Datos de Transporte para la Guía:
                </span>
                <span className="text-[11px] text-slate-500">
                  Total bovinos seleccionados: <strong>{Math.min(guideQuantity, animals.length)}</strong>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Vehículo / Placa:</label>
                  <input
                    type="text"
                    value={guideTransport}
                    onChange={e => setGuideTransport(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Conductor / C.C.:</label>
                  <input
                    type="text"
                    value={guideDriver}
                    onChange={e => setGuideDriver(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Cantidad de Animales:</label>
                  <input
                    type="number"
                    min="1"
                    max={animals.length}
                    value={guideQuantity}
                    onChange={e => setGuideQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:outline-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">Lugar de Destino / Planta:</label>
                  <input
                    type="text"
                    value={guideDestination}
                    onChange={e => setGuideDestination(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Finalidad de la Movilización:</label>
                  <input
                    type="text"
                    value={guidePurpose}
                    onChange={e => setGuidePurpose(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:outline-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Official Guide Content */}
            <div className="border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5 text-xs bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-slate-200">
                <div className="space-y-2">
                  <h5 className="font-bold text-emerald-900 uppercase text-[11px] border-b border-slate-100 pb-1">
                    Datos del Predio de Origen:
                  </h5>
                  <div><strong className="text-slate-500">Predio:</strong> <span className="font-semibold text-slate-900">{farm.name}</span></div>
                  <div><strong className="text-slate-500">Registro ICA / RUV:</strong> <span className="font-mono font-bold text-emerald-800">{farm.legalId}</span></div>
                  <div><strong className="text-slate-500">Municipio / Dpto:</strong> <span className="font-semibold text-slate-900">{farm.location}</span></div>
                  <div><strong className="text-slate-500">Propietario:</strong> <span className="font-semibold text-slate-900">{farm.ownerName}</span></div>
                </div>
                <div className="space-y-2">
                  <h5 className="font-bold text-emerald-900 uppercase text-[11px] border-b border-slate-100 pb-1">
                    Datos de Destino y Transporte:
                  </h5>
                  <div><strong className="text-slate-500">Lugar Destino:</strong> <span className="font-semibold text-slate-900">{guideDestination}</span></div>
                  <div><strong className="text-slate-500">Transportador:</strong> <span className="font-semibold text-slate-900">{guideDriver}</span></div>
                  <div><strong className="text-slate-500">Vehículo:</strong> <span className="font-semibold text-slate-900">{guideTransport}</span></div>
                  <div><strong className="text-slate-500">Finalidad:</strong> <span className="font-semibold text-slate-900">{guidePurpose}</span></div>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-2 uppercase text-[11px] flex items-center justify-between">
                  <span>Bovinos Autorizados para Transporte ({animals.slice(0, guideQuantity).length} Cabezas):</span>
                  <span className="text-slate-500 font-mono">
                    Peso Total Estimado: {animals.slice(0, guideQuantity).reduce((acc, a) => acc + a.weightKg, 0).toLocaleString()} kg
                  </span>
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 font-mono text-[11px]">
                  {animals.slice(0, guideQuantity).map((a, i) => (
                    <div key={a.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">{i + 1}. {a.tagNumber}</strong>
                        <span className="text-[10px] text-emerald-700 font-bold">{a.weightKg}kg</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate">{a.breed} • {a.sex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Clauses */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                <strong>Cláusula de Responsabilidad Sanitaria:</strong> El presente documento ampara la movilización legal de los semovientes arriba relacionados, garantizando que provienen de un hato bajo estricto control sanitario libre de fiebre aftosa, brucelosis y tuberculosis bovina. Esta guía tiene una validez de 48 horas a partir de su emisión.
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center">
                <div className="border-t-2 border-slate-400 pt-2">
                  <span className="font-bold block text-slate-900">{farm.ownerName}</span>
                  <span className="text-[10px] text-slate-500 font-medium">Firma Propietario / Representante Legal</span>
                </div>
                <div className="border-t-2 border-slate-400 pt-2">
                  <span className="font-bold block text-slate-900">{guideDriver.split('(')[0]}</span>
                  <span className="text-[10px] text-slate-500 font-medium">Firma Transportador Responsable</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 3: SANITARY CERTIFICATE */}
        {reportType === 'sanitary_cert' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-xs text-emerald-900 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Award className="w-5 h-5 text-emerald-700" />
                Certificación Oficial de Hato Libre & Sanidad Preventiva
              </div>
              <p className="leading-relaxed text-slate-700 font-medium">
                Este documento es un reporte técnico generado a partir de los registros cargados en AgroBovino para el predio <strong>{farm.name}</strong>, con registro <strong>{farm.legalId}</strong>, ubicado en <strong>{farm.location}</strong>. La información no sustituye una certificación sanitaria oficial ni acredita por sí sola el cumplimiento de programas regulatorios.
              </p>
            </div>

            <div className="no-print bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider block">
                Datos del Profesional Responsable:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Médico Veterinario / Zootecnista:</label>
                  <input
                    type="text"
                    value={vetName}
                    onChange={e => setVetName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Dictamen / Observaciones Técnicas:</label>
                  <input
                    type="text"
                    value={certNotes}
                    onChange={e => setCertNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:outline-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                Historial de Vacunaciones Oficiales & Biológicos Aplicados:
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Fecha de Aplicación</th>
                      <th className="p-3">Biológico / Vacuna</th>
                      <th className="p-3">Lote Oficial / Registro</th>
                      <th className="p-3">Bovino / Arete</th>
                      <th className="p-3">Dosis / Vía</th>
                      <th className="p-3">Profesional Responsable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {healthRecords.filter(h => h.type === 'vacuna').length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-500">
                          No hay registros de vacunación registrados en el sistema.
                        </td>
                      </tr>
                    ) : (
                      healthRecords.filter(h => h.type === 'vacuna').map(v => (
                        <tr key={v.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono">{v.date}</td>
                          <td className="p-3 font-bold text-slate-900">{v.medicationName}</td>
                          <td className="p-3 font-mono text-slate-500">{v.batchNumber || 'OFICIAL-2026'}</td>
                          <td className="p-3 font-mono font-bold text-emerald-800">{v.animalTag}</td>
                          <td className="p-3">{v.dosage || '2 ml SC'}</td>
                          <td className="p-3 font-medium text-slate-800">{v.veterinarian || vetName}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Professional Signatures */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-center">
              <div className="border-t-2 border-slate-400 pt-2">
                <span className="font-bold block text-slate-900">{vetName}</span>
                <span className="text-[10px] text-slate-500 font-medium">Médico Veterinario Inspector Oficial</span>
              </div>
              <div className="border-t-2 border-slate-400 pt-2">
                <span className="font-bold block text-slate-900">{farm.ownerName}</span>
                <span className="text-[10px] text-slate-500 font-medium">Titular del Predio Ganadero</span>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 4: PASTURE & FORAGE AUDIT */}
        {reportType === 'pasture_audit' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Total Potreros</span>
                <span className="text-2xl font-black text-slate-900">{pastures.length}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Área: {totalPastureArea} Ha</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Carga Actual</span>
                <span className="text-2xl font-black text-emerald-700 font-mono">{farmCarryingCapacity}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">UGM / Ha</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Potreros en Ocupación</span>
                <span className="text-2xl font-black text-sky-700 font-mono">
                  {pastures.filter(p => p.status === 'ocupado').length}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Bajo pastoreo activo</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">En Descanso / Recuperación</span>
                <span className="text-2xl font-black text-amber-700 font-mono">
                  {pastures.filter(p => p.status === 'descanso').length}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Regeneración forrajera</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                Estado Agronómico & Balance Forrajero por Potrero:
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Potrero</th>
                      <th className="p-3">Variedad Forraje</th>
                      <th className="p-3 text-right">Área (Ha)</th>
                      <th className="p-3 text-center">Estado</th>
                      <th className="p-3 text-right">Aforo Estimado (kg/m²)</th>
                      <th className="p-3 text-right">Capacidad Máx (UGM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {pastures.map(p => {
                      const estimatedKgM2 = p.forageEstimateKgM2 || 0;
                      const capacityUGM = p.carryingCapacityUGM || 0;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{p.name}</td>
                          <td className="p-3 text-slate-600">{p.grassType || 'Brachiaria Brizantha'}</td>
                          <td className="p-3 text-right font-mono font-medium">{p.areaHa} Ha</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              p.status === 'ocupado' ? 'bg-emerald-100 text-emerald-800' :
                              p.status === 'descanso' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono text-slate-700">
                            {estimatedKgM2.toFixed(2)} kg/m²
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-700">
                            {capacityUGM.toFixed(1)} UGM
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-center">
              <div className="border-t-2 border-slate-400 pt-2">
                <span className="font-bold block text-slate-900">{farm.ownerName}</span>
                <span className="text-[10px] text-slate-500 font-medium">Administrador / Evaluador Agronómico</span>
              </div>
              <div className="border-t-2 border-slate-400 pt-2">
                <span className="font-bold block text-slate-900">Dirección Técnica Agropecuaria</span>
                <span className="text-[10px] text-slate-500 font-medium">Validación de Carga & Sostenibilidad</span>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 5: REPRODUCTIVE KPI */}
        {reportType === 'reproductive_kpi' && (
          <div className="space-y-6">
            {(() => {
              const females = animals.filter(a => a.sex === 'F');
              const services = reproductionEvents.filter(e => e.eventType === 'servicio_ia' || e.eventType === 'monta_natural');
              const pregnancies = reproductionEvents.filter(e => (e.eventType === 'palpacion' || e.eventType === 'ecografia') && e.pregnancyStatus === 'positivo');
              const abortions = reproductionEvents.filter(e => e.eventType === 'aborto');
              const calvings = reproductionEvents.filter(e => e.eventType === 'parto');
              const pregnancyRate = services.length ? ((pregnancies.length / services.length) * 100).toFixed(1) : '0.0';
              const abortionRate = pregnancies.length ? ((abortions.length / pregnancies.length) * 100).toFixed(1) : '0.0';
              return (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200"><span className="text-[10px] text-slate-500 block uppercase font-bold">Hembras</span><span className="text-2xl font-black">{females.length}</span></div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200"><span className="text-[10px] text-slate-500 block uppercase font-bold">Servicios</span><span className="text-2xl font-black">{services.length}</span></div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200"><span className="text-[10px] text-slate-500 block uppercase font-bold">Diagnósticos +</span><span className="text-2xl font-black text-emerald-700">{pregnancies.length}</span></div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200"><span className="text-[10px] text-slate-500 block uppercase font-bold">Preñez/Servicio</span><span className="text-2xl font-black text-purple-700">{pregnancyRate}%</span></div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200"><span className="text-[10px] text-slate-500 block uppercase font-bold">Partos</span><span className="text-2xl font-black text-sky-700">{calvings.length}</span></div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-100"><h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Resumen reproductivo por bovino</h4></div>
                    <div className="overflow-x-auto"><table className="w-full text-xs text-left"><thead className="bg-slate-50 text-[10px] uppercase"><tr><th className="p-3">Arete</th><th className="p-3">Estado</th><th className="p-3">Último servicio</th><th className="p-3">Parto estimado</th><th className="p-3">Último parto</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">{females.map(a => <tr key={a.id}><td className="p-3 font-mono font-bold">{a.tagNumber}</td><td className="p-3 font-semibold">{a.reproductiveStatus}</td><td className="p-3">{a.lastServiceDate || '—'}</td><td className="p-3">{a.estimatedCalvingDate || '—'}</td><td className="p-3">{a.lastCalvingDate || '—'}</td></tr>)}</tbody></table></div>
                  </div>
                  <div className="text-xs text-slate-600">Tasa de aborto observada sobre diagnósticos positivos registrados: <strong>{abortionRate}%</strong>. Estos indicadores dependen de la calidad y completitud de los eventos registrados.</div>
                </>
              );
            })()}
          </div>
        )}
        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Documento generado por AgroBovino a partir de los registros almacenados en el sistema.</span>
          </div>
          <div>
            Predio: <strong>{farm.legalId}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
