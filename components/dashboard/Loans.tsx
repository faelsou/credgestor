import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { formatCurrency, formatDate } from '../../utils';
import { LoanStatus, Installment, InstallmentStatus, UserRole } from '../../types';
import { Plus, Calculator } from 'lucide-react';

export const LoansView: React.FC = () => {
  const { loans, clients, addLoan, user } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [amount, setAmount] = useState(1000);
  const [interestRate, setInterestRate] = useState(20); // 20%
  const [installmentsCount, setInstallmentsCount] = useState(4);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Derived calculations
  const totalAmount = amount * (1 + interestRate / 100);
  const installmentValue = totalAmount / installmentsCount;

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;

    const loanId = Math.random().toString(36).substr(2, 9);
    
    // Generate Installments
    const generatedInstallments: Installment[] = [];
    let currentDate = new Date(startDate);

    for (let i = 1; i <= installmentsCount; i++) {
        // Add 1 month for next installment (Simplified logic)
        currentDate.setMonth(currentDate.getMonth() + 1);
        
        generatedInstallments.push({
            id: `inst_${loanId}_${i}`,
            loanId: loanId,
            clientId: selectedClientId,
            number: i,
            dueDate: currentDate.toISOString().split('T')[0],
            amount: parseFloat(installmentValue.toFixed(2)),
            amountPaid: 0,
            status: InstallmentStatus.PENDING
        });
    }

    addLoan({
        id: loanId,
        clientId: selectedClientId,
        amount,
        interestRate,
        totalAmount,
        startDate,
        installmentsCount,
        status: LoanStatus.ACTIVE
    }, generatedInstallments);

    setIsModalOpen(false);
    // Reset form defaults
    setAmount(1000);
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Desconhecido';

  const canAdd = user?.role === UserRole.ADMIN;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Empréstimos</h2>
        {canAdd && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
          >
            <Plus size={18} /> Novo Empréstimo
          </button>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="p-4">Cliente</th>
              <th className="p-4">Valor Principal</th>
              <th className="p-4">Total (+Juros)</th>
              <th className="p-4">Parcelas</th>
              <th className="p-4">Data</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loans.map(loan => (
              <tr key={loan.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-medium text-slate-800">{getClientName(loan.clientId)}</td>
                <td className="p-4">{formatCurrency(loan.amount)}</td>
                <td className="p-4 font-semibold text-emerald-600">{formatCurrency(loan.totalAmount)}</td>
                <td className="p-4">{loan.installmentsCount}x</td>
                <td className="p-4 text-slate-500">{formatDate(loan.startDate)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    loan.status === LoanStatus.ACTIVE ? 'bg-blue-100 text-blue-700' : 
                    loan.status === LoanStatus.PAID ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {loan.status === LoanStatus.ACTIVE ? 'Em Aberto' : 'Finalizado'}
                  </span>
                </td>
              </tr>
            ))}
            {loans.length === 0 && (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Nenhum empréstimo cadastrado.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal - New Loan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center gap-2 mb-6 text-emerald-600">
                <Calculator />
                <h3 className="text-xl font-bold text-slate-900">Simular Empréstimo</h3>
            </div>
            
            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                <select 
                    required 
                    className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white transition-colors"
                    value={selectedClientId}
                    onChange={e => setSelectedClientId(e.target.value)}
                >
                    <option value="">Selecione um cliente...</option>
                    {clients.filter(c => c.status === 'active').map(c => (
                        <option key={c.id} value={c.id}>{c.name} - {c.cpf}</option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                    <input 
                      type="number" 
                      min="1" 
                      className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white transition-colors" 
                      value={amount} 
                      onChange={e => setAmount(parseFloat(e.target.value))} 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Juros (%)</label>
                    <input 
                      type="number" 
                      min="0" 
                      className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white transition-colors" 
                      value={interestRate} 
                      onChange={e => setInterestRate(parseFloat(e.target.value))} 
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Parcelas</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="48" 
                      className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white transition-colors" 
                      value={installmentsCount} 
                      onChange={e => setInstallmentsCount(parseInt(e.target.value))} 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">1ª Parcela</label>
                    <input 
                      type="date" 
                      required 
                      className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white transition-colors" 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)} 
                    />
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Valor a liberar:</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total a receber:</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700">Parcelas:</span>
                    <span className="text-lg font-bold text-slate-900">{installmentsCount}x de {formatCurrency(installmentValue)}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">Confirmar Empréstimo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};