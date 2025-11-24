import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { formatCurrency, formatDate, isLate, sendToN8N } from '../../utils';
import { InstallmentStatus, Installment, UserRole } from '../../types';
import { Search, MessageCircle, CheckCircle, Clock, AlertCircle, Bot } from 'lucide-react';

export const InstallmentsView: React.FC = () => {
  const { installments, clients, payInstallment, user } = useContext(AppContext);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'LATE' | 'PAID'>('ALL');

  const filtered = installments.filter(inst => {
    if (filter === 'ALL') return true;
    if (filter === 'LATE') return inst.status !== InstallmentStatus.PAID && isLate(inst.dueDate);
    if (filter === 'PENDING') return inst.status === InstallmentStatus.PENDING && !isLate(inst.dueDate);
    return inst.status === filter;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const getClient = (id: string) => clients.find(c => c.id === id);

  const handleWhatsapp = (inst: Installment, useAI: boolean = false) => {
    const client = getClient(inst.clientId);
    if (!client) return;

    if (useAI) {
      // Disparo via n8n Webhook
      const payload = {
        type: 'CLIENT_REMINDER',
        clientName: client.name,
        clientPhone: client.phone,
        amount: inst.amount,
        dueDate: inst.dueDate,
        daysLate: isLate(inst.dueDate) ? Math.floor((new Date().getTime() - new Date(inst.dueDate).getTime()) / (1000 * 3600 * 24)) : 0
      };
      
      sendToN8N(payload);
      alert('Solicitação enviada para o Agente IA! A mensagem será enviada em breve.');
    } else {
      // Fallback: Link direto
      const message = `Olá ${client.name}, lembrete da parcela ${inst.number} no valor de ${formatCurrency(inst.amount)} vencendo em ${formatDate(inst.dueDate)}.`;
      const url = `https://wa.me/55${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };

  const handlePay = (id: string) => {
    if (window.confirm('Confirmar recebimento desta parcela?')) {
        payInstallment(id);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Controle de Parcelas</h2>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['ALL', 'PENDING', 'LATE', 'PAID'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filter === f ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'ALL' ? 'Todas' : f === 'PENDING' ? 'A Vencer' : f === 'LATE' ? 'Em Atraso' : 'Pagas'}
          </button>
        ))}
      </div>

      {/* Mobile Card View / Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="p-4">Vencimento</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Parc.</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(inst => {
               const client = getClient(inst.clientId);
               const late = inst.status !== InstallmentStatus.PAID && isLate(inst.dueDate);
               return (
                <tr key={inst.id} className="hover:bg-slate-50">
                    <td className="p-4">{formatDate(inst.dueDate)}</td>
                    <td className="p-4 font-medium">{client?.name}</td>
                    <td className="p-4 text-slate-500">{inst.number}</td>
                    <td className="p-4 font-medium">{formatCurrency(inst.amount)}</td>
                    <td className="p-4">
                        {inst.status === InstallmentStatus.PAID ? (
                             <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle size={14}/> Pago</span>
                        ) : late ? (
                            <span className="flex items-center gap-1 text-red-600 font-bold"><AlertCircle size={14}/> Atrasada</span>
                        ) : (
                             <span className="flex items-center gap-1 text-blue-600 font-bold"><Clock size={14}/> A Vencer</span>
                        )}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                        {/* Botão AI Agent */}
                        <button onClick={() => handleWhatsapp(inst, true)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" title="Cobrar com IA (n8n)">
                            <Bot size={18} />
                        </button>
                        {/* Botão Whats Direto */}
                        <button onClick={() => handleWhatsapp(inst, false)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Abrir WhatsApp Web">
                            <MessageCircle size={18} />
                        </button>
                        
                        {inst.status !== InstallmentStatus.PAID && user?.role === UserRole.ADMIN && (
                             <button onClick={() => handlePay(inst.id)} className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 ml-2">
                                Receber
                             </button>
                        )}
                    </td>
                </tr>
               );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stack */}
      <div className="md:hidden space-y-4">
        {filtered.map(inst => {
            const client = getClient(inst.clientId);
            const late = inst.status !== InstallmentStatus.PAID && isLate(inst.dueDate);
            return (
                <div key={inst.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-xs text-slate-500 font-medium">Vencimento {formatDate(inst.dueDate)}</span>
                            <h4 className="font-bold text-slate-800">{client?.name}</h4>
                            <span className="text-xs text-slate-400">Parcela {inst.number}</span>
                        </div>
                        <div className="text-right">
                             <div className="font-bold text-slate-900">{formatCurrency(inst.amount)}</div>
                             {late && <div className="text-xs text-red-600 font-bold mt-1">Atrasada</div>}
                             {inst.status === InstallmentStatus.PAID && <div className="text-xs text-emerald-600 font-bold mt-1">Paga</div>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                         <button onClick={() => handleWhatsapp(inst, true)} className="py-2 bg-purple-50 text-purple-700 font-semibold rounded-lg text-sm flex items-center justify-center gap-2">
                            <Bot size={16} /> IA Cobrança
                         </button>
                         <button onClick={() => handleWhatsapp(inst, false)} className="py-2 bg-emerald-50 text-emerald-700 font-semibold rounded-lg text-sm flex items-center justify-center gap-2">
                            <MessageCircle size={16} /> WhatsApp
                         </button>
                    </div>
                     {inst.status !== InstallmentStatus.PAID && user?.role === UserRole.ADMIN && (
                         <button onClick={() => handlePay(inst.id)} className="w-full mt-2 py-2 bg-emerald-600 text-white font-semibold rounded-lg text-sm">
                            Baixar Pagamento
                         </button>
                     )}
                </div>
            );
        })}
      </div>
    </div>
  );
};