import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const isLate = (dueDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  return due < today;
};

// --- N8N INTEGRATION ---
// Substitua pela URL do seu Webhook de produção
const N8N_WEBHOOK_URL = 'https://seu-n8n.com/webhook/cobranca-ia';

export async function sendToN8N(payload: any) {
  try {
    // Em um cenário real, descomente a linha abaixo:
    // const response = await fetch(N8N_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // });
    
    // Simulação para demo
    console.log('[N8N Webhook Disparado]', payload);
    return true;
  } catch (error) {
    console.error('Erro ao conectar com n8n', error);
    return false;
  }
}