export enum UserRole {
  ADMIN = 'ADMIN',
  COLLECTION = 'COLLECTION' // Read-only / Limited
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  status: 'active' | 'blocked';
  notes?: string;
  promissoryNote?: PromissoryNote;
}

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  PAID = 'PAID',
  DEFAULTED = 'DEFAULTED' // Inadimplente
}

export interface Loan {
  id: string;
  clientId: string;
  amount: number; // Valor emprestado
  interestRate: number; // Porcentagem
  totalAmount: number; // Valor total com juros
  startDate: string;
  installmentsCount: number;
  status: LoanStatus;
}

export enum InstallmentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  LATE = 'LATE',
  PARTIAL = 'PARTIAL'
}

export interface Installment {
  id: string;
  loanId: string;
  clientId: string; // Denormalized for easier querying
  number: number;
  dueDate: string;
  amount: number;
  amountPaid: number;
  status: InstallmentStatus;
  paidDate?: string;
}

export interface DashboardStats {
  totalReceivable: number;
  totalReceived: number;
  totalLate: number;
  activeClients: number;
}

export type IndicationType = 'Garantia' | 'Sem Garantia';

export interface PromissoryNote {
  capital: number;
  interestRate: number;
  issueDate: string;
  dueDate: string;
  indication: IndicationType;
  numberHash: string;
  observation?: string;
}