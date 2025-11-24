import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { Search, Plus, Phone, Mail, User, FileText, Pencil, Trash2, MapPin, Loader2 } from 'lucide-react';
import { Client, IndicationType, PromissoryNote, UserRole } from '../../types';
import { formatCurrency, formatDate } from '../../utils';

export const ClientsView: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient, user } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [cepError, setCepError] = useState('');
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const defaultNote: PromissoryNote = {
    capital: 0,
    interestRate: 0,
    issueDate: today,
    dueDate: today,
    indication: 'Sem Garantia'
  };
  const [newClient, setNewClient] = useState<Partial<Client> & { promissoryNote: PromissoryNote }>(
    {
      name: '',
      cpf: '',
      phone: '',
      email: '',
      cep: '',
      street: '',
      neighborhood: '',
      city: '',
      state: '',
      status: 'active',
      promissoryNote: defaultNote
    }
  );

  const formatOnlyDigits = (value: string, maxLength: number) => value.replace(/\D/g, '').slice(0, maxLength);

  const formatCPF = (value: string) => {
    const digits = formatOnlyDigits(value, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    const digits = formatOnlyDigits(value, 11);
    return digits
      .replace(/(\d{2})(\d)/, '($1)$2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const formatCep = (value: string) => {
    const digits = formatOnlyDigits(value, 8);
    return digits.replace(/(\d{5})(\d)/, '$1-$2');
  };

  const fetchAddressByCep = async (cepValue: string) => {
    const digits = cepValue.replace(/\D/g, '');
    if (digits.length !== 8) return;

    setIsFetchingCep(true);
    setCepError('');
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await response.json();

      if (data?.erro) {
        setCepError('CEP não encontrado.');
        return;
      }

      setNewClient(prev => ({
        ...prev,
        cep: formatCep(digits),
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      }));
    } catch (error) {
      setCepError('Erro ao buscar CEP.');
    } finally {
      setIsFetchingCep(false);
    }
  };

  const resetForm = () => {
    setNewClient({
      name: '',
      cpf: '',
      phone: '',
      email: '',
      cep: '',
      street: '',
      neighborhood: '',
      city: '',
      state: '',
      status: 'active',
      promissoryNote: { ...defaultNote }
    });
    setEditingClientId(null);
    setCepError('');
  };

  const handlePromissoryChange = (field: keyof PromissoryNote, value: string | number | IndicationType) => {
    setNewClient(prev => ({ ...prev, promissoryNote: { ...prev.promissoryNote, [field]: value } }));
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cpf.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClient.name && newClient.cpf && newClient.promissoryNote) {
      const clientToSave: Client = {
        id: editingClientId || Math.random().toString(36).substr(2, 9),
        name: newClient.name,
        cpf: newClient.cpf,
        phone: newClient.phone || '',
        email: newClient.email || '',
        cep: newClient.cep || '',
        street: newClient.street || '',
        neighborhood: newClient.neighborhood || '',
        city: newClient.city || '',
        state: newClient.state || '',
        status: newClient.status || 'active',
        promissoryNote: {
          ...newClient.promissoryNote,
          capital: Number(newClient.promissoryNote.capital),
          interestRate: Number(newClient.promissoryNote.interestRate)
        }
      };

      if (editingClientId) {
        updateClient(clientToSave);
      } else {
        addClient(clientToSave);
        generatePromissoryNotePDF(clientToSave);
      }

      setIsModalOpen(false);
      resetForm();
    }
  };

  const generatePromissoryNotePDF = (client: Client) => {
    if (!client.promissoryNote) return;

    const { promissoryNote } = client;
    const printable = window.open('', '_blank', 'width=700,height=900');

    if (!printable) {
      alert('Não foi possível abrir o gerador de PDF. Verifique o bloqueio de pop-ups.');
      return;
    }

    printable.document.write(`
      <html>
        <head>
          <title>Nota Promissória</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
            h1 { text-align: center; margin-bottom: 24px; }
            .section { margin-bottom: 12px; }
            .label { font-weight: bold; text-transform: uppercase; font-size: 12px; color: #334155; }
            .value { font-size: 14px; }
            .signature { margin-top: 48px; border-top: 1px solid #94a3b8; padding-top: 12px; }
          </style>
        </head>
        <body>
          <h1>Nota Promissória</h1>
          <div class="section"><span class="label">Emitente:</span> <span class="value">${client.name}</span></div>
          <div class="section"><span class="label">CPF:</span> <span class="value">${client.cpf}</span></div>
          <div class="section"><span class="label">Contato:</span> <span class="value">${client.phone} / ${client.email || 'sem email'}</span></div>
          <div class="section"><span class="label">Capital:</span> <span class="value">${formatCurrency(promissoryNote.capital)}</span></div>
          <div class="section"><span class="label">Juros:</span> <span class="value">${promissoryNote.interestRate}%</span></div>
          <div class="section"><span class="label">Emissão:</span> <span class="value">${formatDate(promissoryNote.issueDate)}</span></div>
          <div class="section"><span class="label">Vencimento:</span> <span class="value">${formatDate(promissoryNote.dueDate)}</span></div>
          <div class="section"><span class="label">Indicação:</span> <span class="value">${promissoryNote.indication}</span></div>
          ${promissoryNote.observation ? `<div class="section"><span class="label">Observação:</span> <span class="value">${promissoryNote.observation}</span></div>` : ''}
          <div class="signature">
            <p>Assinatura Digital: _____________________________________</p>
            <p style="font-size: 12px; color: #334155;">Confirmação para assinatura eletrônica.</p>
          </div>
        </body>
      </html>
    `);
    printable.document.close();
    printable.focus();
    printable.print();
  };

  const canEdit = user?.role === UserRole.ADMIN;

  const handleEditClient = (client: Client) => {
    setEditingClientId(client.id);
    setNewClient({
      ...client,
      promissoryNote: client.promissoryNote ? { ...client.promissoryNote } : { ...defaultNote }
    });
    setIsModalOpen(true);
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('Deseja realmente excluir este cliente e seus registros?')) {
      deleteClient(clientId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Clientes</h2>
        {canEdit && (
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
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
              {canEdit && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClient(client)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    aria-label="Editar cliente"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                    aria-label="Excluir cliente"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
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
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-slate-400 mt-0.5" />
                <div>
                  <div className="font-medium text-slate-700">{client.street} - {client.neighborhood}</div>
                  <div className="text-xs text-slate-500">{client.city}/{client.state} - CEP {client.cep}</div>
                </div>
              </div>
              {client.promissoryNote && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1 mt-3">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Nota promissória</div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Capital</span>
                    <span className="font-semibold">{formatCurrency(client.promissoryNote.capital)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Juros</span>
                    <span className="font-semibold">{client.promissoryNote.interestRate}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Vencimento</span>
                    <span className="font-semibold">{formatDate(client.promissoryNote.dueDate)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Indicação</span>
                    <span className="font-semibold">{client.promissoryNote.indication}</span>
                  </div>
                  <button
                    onClick={() => generatePromissoryNotePDF(client)}
                    className="w-full mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-100 transition"
                  >
                    <FileText size={14} /> Gerar PDF para assinatura
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{editingClientId ? 'Editar Cliente' : 'Cadastrar Cliente'}</h3>
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
                    onChange={e => setNewClient({...newClient, cpf: formatCPF(e.target.value)})}
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
                    onChange={e => setNewClient({...newClient, phone: formatPhone(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CEP</label>
                <div className="flex gap-2">
                  <input
                    required
                    type="text"
                    className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                    placeholder="00000-000"
                    value={newClient.cep}
                    onChange={e => {
                      const formatted = formatCep(e.target.value);
                      setNewClient({ ...newClient, cep: formatted });
                      if (formatted.replace(/\D/g, '').length === 8) {
                        fetchAddressByCep(formatted);
                      }
                    }}
                  />
                  {isFetchingCep && <Loader2 className="animate-spin text-emerald-600" />}
                </div>
                {cepError && <p className="text-sm text-red-600 mt-1">{cepError}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                  <input
                    required
                    type="text"
                    className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                    placeholder="Rua e número"
                    value={newClient.street}
                    onChange={e => setNewClient({ ...newClient, street: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
                  <input
                    required
                    type="text"
                    className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                    placeholder="Bairro"
                    value={newClient.neighborhood}
                    onChange={e => setNewClient({ ...newClient, neighborhood: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                  <input
                    required
                    type="text"
                    className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                    placeholder="Cidade"
                    value={newClient.city}
                    onChange={e => setNewClient({ ...newClient, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <input
                    required
                    maxLength={2}
                    className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                    placeholder="UF"
                    value={newClient.state}
                    onChange={e => setNewClient({ ...newClient, state: e.target.value.toUpperCase() })}
                  />
                </div>
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
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <p className="text-sm font-semibold text-slate-800">Dados da Nota Promissória</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Capital (R$)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                      placeholder="Valor principal"
                      value={newClient.promissoryNote.capital}
                      onChange={e => handlePromissoryChange('capital', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Juros (%)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                      placeholder="Ex: 8"
                      value={newClient.promissoryNote.interestRate}
                      onChange={e => handlePromissoryChange('interestRate', parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Emissão</label>
                    <input
                      required
                      type="date"
                      className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                      value={newClient.promissoryNote.issueDate}
                      onChange={e => handlePromissoryChange('issueDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vencimento</label>
                    <input
                      required
                      type="date"
                      className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                      value={newClient.promissoryNote.dueDate}
                      onChange={e => handlePromissoryChange('dueDate', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Indicação</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                    value={newClient.promissoryNote.indication}
                    onChange={e => handlePromissoryChange('indication', e.target.value as IndicationType)}
                  >
                    <option value="Garantia">Garantia</option>
                    <option value="Sem Garantia">Sem Garantia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                  <textarea
                    className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors"
                    placeholder="Instruções adicionais para a assinatura digital"
                    value={newClient.promissoryNote.observation || ''}
                    onChange={e => handlePromissoryChange('observation', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="flex-1 py-2 border rounded-lg hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};