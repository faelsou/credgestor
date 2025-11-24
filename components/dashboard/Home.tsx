import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../App';
import { TrendingUp, TrendingDown, Users, AlertTriangle, Send, FileText } from 'lucide-react';
import { formatCurrency, isLate, sendToN8N } from '../../utils';
import { InstallmentStatus, LoanStatus, UserRole } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const DashboardHome: React.FC = () => {
  const { clients, installments, loans, user } = useContext(AppContext);
  const [sendingReport, setSendingReport] = useState(false);

  const stats = useMemo(() => {
    const totalReceived = installments
      .filter(i => i.status === InstallmentStatus.PAID)
      .reduce((acc, curr) => acc + curr.amountPaid, 0);

    const totalReceivable = installments
      .filter(i => i.status !== InstallmentStatus.PAID)
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    const lateInstallments = installments.filter(i => i.status !== InstallmentStatus.PAID && isLate(i.dueDate));
    const totalLate = lateInstallments.reduce((acc, curr) => acc + curr.amount, 0);

    const activeLoans = loans.filter(l => l.status === LoanStatus.ACTIVE).length;

    return { totalReceived, totalReceivable, totalLate, activeLoans, lateCount: lateInstallments.length, lateInstallments };
  }, [installments, loans]);

  // Chart Data Preparation (Simple Forecast)
  const chartData = [
    { name: 'Recebido', value: stats.totalReceived, color: '#10b981' }, // Emerald-500
    { name: 'A Vencer', value: stats.totalReceivable - stats.totalLate, color: '#3b82f6' }, // Blue-500
    { name: 'Atrasado', value: stats.totalLate, color: '#ef4444' }, // Red-500
  ];

  const handleSendAdminReport = async () => {
    setSendingReport(true);
    
    // Prepara dados para o n8n
    const payload = {
      type: 'ADMIN_REPORT',
      adminName: user?.name,
      totalLate: stats.totalLate,
      countLate: stats.lateCount,
      details: stats.lateInstallments.map(i => ({
        client: clients.find(c => c.id === i.clientId)?.name,
        amount: i.amount,
        daysLate: Math.floor((new Date().getTime() - new Date(i.dueDate).getTime()) / (1000 * 3600 * 24))
      }))
    };

    await sendToN8N(payload);

    setTimeout(() => {
      alert(`Relatório enviado para o WhatsApp do Admin! (${stats.lateCount} atrasos identificados)`);
      setSendingReport(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
        
        {/* Botão de Relatório para Admin */}
        {user?.role === UserRole.ADMIN && (
          <button 
            onClick={handleSendAdminReport}
            disabled={sendingReport}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-900 transition shadow-lg shadow-slate-200 disabled:opacity-70"
          >
            {sendingReport ? (
              <span className="animate-pulse">Enviando...</span>
            ) : (
              <>
                <FileText size={18} /> Relatório Diário no Whats
              </>
            )}
          </button>
        )}
      </div>
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Recebido" 
          value={formatCurrency(stats.totalReceived)} 
          icon={<TrendingUp className="text-white" />} 
          bg="bg-emerald-500"
        />
        <KPICard 
          title="A Receber" 
          value={formatCurrency(stats.totalReceivable)} 
          icon={<TrendingDown className="text-white" />} 
          bg="bg-blue-500"
        />
        <KPICard 
          title="Em Atraso" 
          value={formatCurrency(stats.totalLate)} 
          subtext={`${stats.lateCount} parcelas`}
          icon={<AlertTriangle className="text-white" />} 
          bg="bg-red-500"
        />
         <KPICard 
          title="Empréstimos Ativos" 
          value={stats.activeLoans.toString()} 
          icon={<Users className="text-emerald-600" />} 
          bg="bg-white border border-slate-200"
          textColor="text-slate-800"
          iconWrapper="bg-emerald-100"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Fluxo Financeiro</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" barSize={30} radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Simple List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Acesso Rápido</h3>
          <div className="space-y-3">
             <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800 flex justify-between items-center">
                <span>Novos Clientes (Mês)</span>
                <span className="font-bold">{clients.length}</span>
             </div>
             <button className="w-full py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition">
                Novo Empréstimo
             </button>
             <button className="w-full py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition">
                Ver Inadimplentes
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon, subtext, bg, textColor = "text-white", iconWrapper = "bg-white/20" }: any) => (
  <div className={`${bg} rounded-2xl p-6 shadow-sm transition hover:shadow-md`}>
    <div className="flex justify-between items-start">
      <div>
        <p className={`text-sm font-medium ${textColor} opacity-90`}>{title}</p>
        <h3 className={`text-2xl font-bold ${textColor} mt-1`}>{value}</h3>
        {subtext && <p className={`text-xs ${textColor} mt-2 opacity-80`}>{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl ${iconWrapper} backdrop-blur-sm`}>
        {icon}
      </div>
    </div>
  </div>
);