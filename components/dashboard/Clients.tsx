import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { Search, Plus, Phone, Mail, MoreHorizontal, User } from 'lucide-react';
import { Client, UserRole } from '../../types';

export const ClientsView: React.FC = () => {
  const { clients, addClient, user } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({ name: '', cpf: '', phone: '', email: '', status: 'active' });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cpf.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClient.name && newClient.cpf) {
      addClient({
        id: Math.random().toString(36).substr(2, 9),
        ...newClient as Client
      });
      setIsModalOpen(false);
      setNewClient({ name: '', cpf: '', phone: '', email: '', status: 'active' });
    }
  };

  const canEdit = user?.role === UserRole.ADMIN;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Clientes</h2>
        {canEdit && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-emerald-700 transition"
          >
            <Plus size={18} /> Novo Cliente
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou CPF..." 
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-200 transition">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{client.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${client.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {client.status === 'active' ? 'Ativo' : 'Bloqueado'}
                  </span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20} /></button>
            </div>
            
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-slate-400 uppercase w-10">CPF</span>
                {client.cpf}
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400" />
                {client.phone}
              </div>
               <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                {client.email || 'Não informado'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Cadastrar Cliente</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input 
                    required 
                    type="text" 
                    className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                    placeholder="Ex: João da Silva"
                    value={newClient.name} 
                    onChange={e => setNewClient({...newClient, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                <input 
                    required 
                    type="text" 
                    className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors" 
                    placeholder="000.000.000-00"
                    value={newClient.cpf} 
                    onChange={e => setNewClient({...newClient, cpf: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                <input 
                    required 
                    type="text" 
                    className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors" 
                    placeholder="(11) 99999-9999"
                    value={newClient.phone} 
                    onChange={e => setNewClient({...newClient, phone: e.target.value})} 
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email (Opcional)</label>
                <input 
                    type="email" 
                    className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors" 
                    placeholder="email@exemplo.com"
                    value={newClient.email} 
                    onChange={e => setNewClient({...newClient, email: e.target.value})} 
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border rounded-lg hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};