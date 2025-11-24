import React, { useState, useEffect, useMemo } from 'react';
import { LandingPage } from './components/LandingPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DashboardHome } from './components/dashboard/Home';
import { ClientsView } from './components/dashboard/Clients';
import { LoansView } from './components/dashboard/Loans';
import { InstallmentsView } from './components/dashboard/Installments';
import { UsersView } from './components/dashboard/Users';
import { User, UserRole, Client, Loan, Installment, LoanStatus, InstallmentStatus } from './types';
import { isLate } from './utils';

// --- MOCK DATA INITIALIZATION ---
const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'João Silva',
    cpf: '123.456.789-00',
    phone: '(11)99999-9999',
    email: 'joao@email.com',
    cep: '01001-000',
    street: 'Praça da Sé',
    neighborhood: 'Sé',
    city: 'São Paulo',
    state: 'SP',
    status: 'active',
    promissoryNote: {
      capital: 1500,
      interestRate: 8,
      issueDate: '2023-09-15',
      dueDate: '2024-09-15',
      indication: 'Garantia',
      observation: 'Pagamento na conta 001'
    }
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    cpf: '987.654.321-11',
    phone: '(11)98888-8888',
    email: 'maria@email.com',
    cep: '20010-000',
    street: 'Praça Quinze de Novembro',
    neighborhood: 'Centro',
    city: 'Rio de Janeiro',
    state: 'RJ',
    status: 'active',
    promissoryNote: {
      capital: 2200,
      interestRate: 10,
      issueDate: '2023-11-01',
      dueDate: '2024-11-01',
      indication: 'Sem Garantia'
    }
  },
  {
    id: '3',
    name: 'Carlos Souza',
    cpf: '456.789.123-22',
    phone: '(11)97777-7777',
    email: 'carlos@email.com',
    cep: '30190-924',
    street: 'Praça Sete de Setembro',
    neighborhood: 'Centro',
    city: 'Belo Horizonte',
    state: 'MG',
    status: 'blocked',
    promissoryNote: {
      capital: 500,
      interestRate: 6,
      issueDate: '2023-10-10',
      dueDate: '2024-01-10',
      indication: 'Garantia'
    }
  },
];

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Administrador Principal', email: 'admin@credgestor.com', role: UserRole.ADMIN },
  { id: 'u2', name: 'Cobrador Externo', email: 'cobrador@credgestor.com', role: UserRole.COLLECTION },
];

const TODAY = new Date().toISOString().split('T')[0];

const MOCK_LOANS: Loan[] = [
  { id: 'l1', clientId: '1', amount: 1000, interestRate: 10, totalAmount: 1100, startDate: '2023-10-01', installmentsCount: 2, status: LoanStatus.ACTIVE },
];

const MOCK_INSTALLMENTS: Installment[] = [
  { id: 'i1', loanId: 'l1', clientId: '1', number: 1, dueDate: '2023-11-01', amount: 550, amountPaid: 550, status: InstallmentStatus.PAID, paidDate: '2023-11-01' },
  { id: 'i2', loanId: 'l1', clientId: '1', number: 2, dueDate: TODAY, amount: 550, amountPaid: 0, status: InstallmentStatus.PENDING },
];

export const AppContext = React.createContext<{
  user: User | null;
  usersList: User[];
  clients: Client[];
  loans: Loan[];
  installments: Installment[];
  login: (email: string) => boolean;
  logout: () => void;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  addLoan: (loan: Loan, generatedInstallments: Installment[]) => void;
  updateLoan: (loan: Loan, generatedInstallments: Installment[]) => void;
  deleteLoan: (id: string) => void;
  payInstallment: (id: string) => void;
  addUser: (newUser: User) => void;
  removeUser: (id: string) => void;
  view: string;
  setView: (v: string) => void;
}>({} as any);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState('home'); // home, clients, loans, installments, users
  
  // App Data State
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [loans, setLoans] = useState<Loan[]>(MOCK_LOANS);
  const [installments, setInstallments] = useState<Installment[]>(MOCK_INSTALLMENTS);
  const [usersList, setUsersList] = useState<User[]>(MOCK_USERS);

  // Check for late installments on load
  useEffect(() => {
    setInstallments(prev => prev.map(inst => {
      if (inst.status === InstallmentStatus.PENDING && isLate(inst.dueDate)) {
        return { ...inst, status: InstallmentStatus.LATE };
      }
      return inst;
    }));
  }, []);

  const login = (email: string) => {
    const foundUser = usersList.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      setView('home');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const addClient = (client: Client) => {
    setClients([...clients, client]);
  };

  const updateClient = (client: Client) => {
    setClients(prev => prev.map(item => item.id === client.id ? client : item));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
    setLoans(prev => prev.filter(loan => loan.clientId !== id));
    setInstallments(prev => prev.filter(inst => inst.clientId !== id));
  };

  const addLoan = (loan: Loan, generatedInstallments: Installment[]) => {
    setLoans([...loans, loan]);
    setInstallments([...installments, ...generatedInstallments]);
  };

  const updateLoan = (loan: Loan, generatedInstallments: Installment[]) => {
    setLoans(prev => prev.map(item => item.id === loan.id ? loan : item));
    setInstallments(prev => prev.filter(inst => inst.loanId !== loan.id).concat(generatedInstallments));
  };

  const deleteLoan = (id: string) => {
    setLoans(prev => prev.filter(loan => loan.id !== id));
    setInstallments(prev => prev.filter(inst => inst.loanId !== id));
  };

  const payInstallment = (id: string) => {
    if (user?.role === UserRole.COLLECTION) {
      alert("Acesso restrito: Cobradores não podem baixar pagamentos, apenas visualizar.");
      return;
    }
    setInstallments(prev => prev.map(inst => 
      inst.id === id ? { ...inst, status: InstallmentStatus.PAID, amountPaid: inst.amount, paidDate: new Date().toISOString() } : inst
    ));
  };

  const addUser = (newUser: User) => {
    setUsersList([...usersList, newUser]);
  };

  const removeUser = (id: string) => {
    if (id === user?.id) {
      alert("Você não pode remover a si mesmo.");
      return;
    }
    setUsersList(usersList.filter(u => u.id !== id));
  };

  const value = useMemo(() => ({
    user,
    usersList,
    clients,
    loans,
    installments,
    login,
    logout,
    addClient,
    updateClient,
    deleteClient,
    addLoan,
    updateLoan,
    deleteLoan,
    payInstallment,
    addUser,
    removeUser,
    view,
    setView
  }), [user, usersList, clients, loans, installments, view]);

  if (!user) {
    return (
      <AppContext.Provider value={value}>
        <LandingPage onLogin={() => setView('home')} />
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider value={value}>
      <DashboardLayout>
        {view === 'home' && <DashboardHome />}
        {view === 'clients' && <ClientsView />}
        {view === 'loans' && <LoansView />}
        {view === 'installments' && <InstallmentsView />}
        {view === 'users' && <UsersView />}
      </DashboardLayout>
    </AppContext.Provider>
  );
};

export default App;