import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  note: string;
  count: number;
}

export interface InvoiceRecord {
  id: string;
  concept: string;
  type: string;
  method: string;
  amount: number;
  date: string;
  receptor: string;
  phone: string;
  note: string;
  status: 'confirmed' | 'pending' | 'rejected';
  block?: number;
  ts?: number;
  hash?: string;
  quick: boolean;
}

interface AppCtx {
  invoices: InvoiceRecord[];
  setInvoices: React.Dispatch<React.SetStateAction<InvoiceRecord[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  plan: 'free' | 'pro';
  setPlan: (p: 'free' | 'pro') => void;
  planModal: boolean;
  setPlanModal: (v: boolean) => void;
  loading: boolean;
}

const Ctx = createContext<AppCtx | null>(null);

const API = 'http://localhost:4000/api';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [plan, setPlan] = useState<'free' | 'pro'>('free');
  const [planModal, setPlanModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/invoices`).then(r => r.json()),
      fetch(`${API}/clients`).then(r => r.json()),
    ])
      .then(([invData, cliData]) => {
        setInvoices(invData);
        setClients(cliData);
      })
      .catch(err => console.error('Error cargando datos:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Ctx.Provider value={{ invoices, setInvoices, clients, setClients, plan, setPlan, planModal, setPlanModal, loading }}>
      {children}
    </Ctx.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
