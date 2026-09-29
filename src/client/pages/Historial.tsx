import React, { useState } from 'react';
import Layout from '../components/Layout';
import InvoiceDetail from '../components/InvoiceDetail';
import { useApp, InvoiceRecord } from '../context/AppContext';
import { PAYMENT_ICONS, fmtDate, getBadge } from '../utils/helpers';

const Historial = () => {
  const { invoices } = useApp();
  const [detail, setDetail] = useState<InvoiceRecord | null>(null);
  const [q, setQ] = useState('');

  const filtered = invoices.filter(i =>
    i.concept.toLowerCase().includes(q.toLowerCase()) ||
    i.receptor.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Layout title="Historial">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div className="search-box">
          <i className="ti ti-search" />
          <input
            className="form-input"
            placeholder="Buscar por concepto o cliente..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text3)' }}>
            <i className="ti ti-receipt-off" style={{ fontSize: 48, display: 'block', marginBottom: 10 }} />
            No hay facturas registradas.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(inv => {
              const { cls, label } = getBadge(inv.status);
              return (
                <div key={inv.id} className="invoice-item" onClick={() => setDetail(inv)}>
                  <div className="invoice-icon">
                    <i className={`ti ${PAYMENT_ICONS[inv.type] ?? 'ti-receipt'}`} />
                  </div>
                  <div className="invoice-info">
                    <div className="invoice-concept">
                      {inv.concept}
                      {inv.quick && <span className="badge badge-quick" style={{ fontSize: 9, marginLeft: 6, verticalAlign: 'middle' }}>⚡</span>}
                    </div>
                    <div className="invoice-sub">{inv.receptor} · {fmtDate(inv.date)}</div>
                  </div>
                  <div className="invoice-right">
                    <div className="invoice-amount">${inv.amount.toFixed(2)}</div>
                    <span className={`badge ${cls}`}>{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detail && <InvoiceDetail inv={detail} onClose={() => setDetail(null)} />}
    </Layout>
  );
};

export default Historial;
