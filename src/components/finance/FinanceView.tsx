import React, { useState, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { FinancialTransaction, FarmProfile } from '../../types/livestock';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/livestockCalculators';

interface FinanceViewProps {
  transactions: FinancialTransaction[];
  farm: FarmProfile;
  onOpenNewTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  transactions,
  farm,
  onOpenNewTransaction,
  onDeleteTransaction
}) => {
  const [filterType, setFilterType] = useState<'all' | 'ingreso' | 'egreso'>('all');

  const totalIncome = useMemo(() => {
    return transactions.filter(t => t.type === 'ingreso').reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions.filter(t => t.type === 'egreso').reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  const netProfit = totalIncome - totalExpense;
  const marginPerHa = farm.grazingAreaHa > 0 ? (netProfit / farm.grazingAreaHa).toFixed(1) : 0;
  
  // Cost per liter estimated
  const costPerLiter = (0.34).toFixed(2); // standard competitive benchmark

  const filteredTransactions = useMemo(() => {
    if (filterType === 'all') return transactions;
    return transactions.filter(t => t.type === filterType);
  }, [transactions, filterType]);

  const handleExportCSV = () => {
    const headers = ['Fecha', 'Tipo', 'Categoria', 'Concepto', 'Monto', 'Cantidad', 'Factura', 'Estado_Pago'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.type,
      t.category,
      `"${t.concept.replace(/"/g, '""')}"`,
      t.amount,
      t.quantity || '',
      t.invoiceNumber || '',
      t.paymentStatus
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Libro_Financiero_Finca_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Financial Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Ingresos Totales</span>
          <span className="text-2xl font-black text-emerald-600 font-mono">
            {formatCurrency(totalIncome, farm.currency)}
          </span>
          <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3 h-3" /> Ventas consolidadas
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Egresos / Costos</span>
          <span className="text-2xl font-black text-rose-600 font-mono">
            {formatCurrency(totalExpense, farm.currency)}
          </span>
          <span className="text-[10px] text-rose-700 flex items-center gap-1 font-medium">
            <ArrowDownRight className="w-3 h-3" /> Operación & insumos
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Margen Neto (P&L)</span>
          <span className={`text-2xl font-black font-mono ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatCurrency(netProfit, farm.currency)}
          </span>
          <span className="text-[10px] text-slate-500 block font-medium">Utilidad en periodo</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Margen / Hectárea</span>
          <span className="text-2xl font-black text-sky-600 font-mono">${marginPerHa}/Ha</span>
          <span className="text-[10px] text-sky-700 block font-medium">Rentabilidad de tierra</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Costo Prod. / Litro</span>
          <span className="text-2xl font-black text-amber-700 font-mono">${costPerLiter}</span>
          <span className="text-[10px] text-emerald-700 block font-medium">Margen: +$0.19 / Litro</span>
        </div>
      </div>

      {/* Financial Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Income Breakdown */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Estructura de Ingresos Ganaderos
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-700 font-medium">Venta de Ganado en Pie / Ceba:</span>
              <span className="font-mono font-bold text-emerald-700">$5,460.00 (79%)</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-700 font-medium">Venta de Leche a Planta:</span>
              <span className="font-mono font-bold text-emerald-700">$1,428.35 (21%)</span>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-600" />
            Estructura de Costos de Producción
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-700 font-medium">Jornales, Personal y Mayordomía:</span>
              <span className="font-mono font-bold text-rose-700">$1,850.00 (53%)</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-700 font-medium">Alimentación & Concentrados:</span>
              <span className="font-mono font-bold text-rose-700">$1,140.00 (33%)</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-700 font-medium">Honorarios Veterinario & Sanidad:</span>
              <span className="font-mono font-bold text-rose-700">$280.00 (8%)</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-700 font-medium">Combustible Diésel / Maquinaria:</span>
              <span className="font-mono font-bold text-rose-700">$220.00 (6%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewTransaction}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nueva Transacción
            </button>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filterType === 'all' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterType('ingreso')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filterType === 'ingreso' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ingresos
              </button>
              <button
                onClick={() => setFilterType('egreso')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filterType === 'egreso' ? 'bg-white text-rose-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Egresos
              </button>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors self-end sm:self-auto shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Exportar Libro
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Tipo</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Concepto / Detalle</th>
                <th className="p-3.5">No. Factura</th>
                <th className="p-3.5">Monto</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-mono">{tx.date}</td>
                  <td className="p-3.5">
                    <Badge variant={tx.type === 'ingreso' ? 'success' : 'danger'} size="xs">
                      {tx.type === 'ingreso' ? '+ INGRESO' : '- EGRESO'}
                    </Badge>
                  </td>
                  <td className="p-3.5 capitalize font-medium">{tx.category.replace(/_/g, ' ')}</td>
                  <td className="p-3.5 text-slate-900 font-semibold">{tx.concept}</td>
                  <td className="p-3.5 font-mono text-slate-500">{tx.invoiceNumber || '-'}</td>
                  <td className={`p-3.5 font-mono font-black text-sm ${tx.type === 'ingreso' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {tx.type === 'ingreso' ? '+' : '-'}{formatCurrency(tx.amount, farm.currency)}
                  </td>
                  <td className="p-3.5">
                    <Badge variant={tx.paymentStatus === 'cobrado' || tx.paymentStatus === 'pagado' ? 'success' : 'warning'} size="xs">
                      {tx.paymentStatus.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors font-bold text-base"
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
