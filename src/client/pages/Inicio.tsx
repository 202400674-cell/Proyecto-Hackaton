import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import InvoiceDetail from '../components/InvoiceDetail';
import { useApp, InvoiceRecord } from '../context/AppContext';
import { PAYMENT_ICONS, fmtDate, getBadge } from '../utils/helpers';

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const Inicio = () => {
  const { invoices, clients, plan, setPlanModal } = useApp();
  const [detail, setDetail] = useState<InvoiceRecord | null>(null);
  const navigate = useNavigate();

  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  // Filtros del mes actual
  const thisMonthInvoices  = invoices.filter(i => i.date.startsWith(currentYM));
  const thisMonthConfirmed = thisMonthInvoices.filter(i => i.status === 'confirmed');
  const thisMonthPending   = thisMonthInvoices.filter(i => i.status === 'pending');
  const totalThisMonth     = thisMonthConfirmed.reduce((s, i) => s + i.amount, 0);

  const recent = invoices.slice(0, 5);

  return (
    <Layout title="Inicio">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Hero */}
        <div className="card card-hero">
          <div style={{ fontSize: 13, opacity: .75, fontWeight: 500 }}>
            Hola, <b>Carlos</b> 👋
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, margin: '6px 0 2px' }}>
            ${totalThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 13, opacity: .7 }}>
            Total cobrado · {monthLabel} <span style={{ color: 'var(--accent)' }}>◆</span>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon"><i className="ti ti-receipt" /></div>
            <div className="stat-label">Emitidas</div>
            <div className="stat-value">{thisMonthInvoices.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="ti ti-users" /></div>
            <div className="stat-label">Clientes registrados</div>
            <div className="stat-value">{clients.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="ti ti-circle-check" /></div>
            <div className="stat-label">Confirmados</div>
            <div className="stat-value">{thisMonthConfirmed.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="ti ti-coin" /></div>
            <div className="stat-label">Pendientes</div>
            <div className="stat-value">{thisMonthPending.length}</div>
          </div>
        </div>

        {/* Plan limit (only Free) */}
        {plan === 'free' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="section-title">Recibos este mes</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                {thisMonthInvoices.length} / 10
              </span>
            </div>
            <div className="plan-limit-bar" style={{ marginTop: 8 }}>
              <div className="plan-limit-fill" style={{ width: `${Math.min((thisMonthInvoices.length / 10) * 100, 100)}%` }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
              Plan Free ·{' '}
              <span
                style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setPlanModal(true)}
              >
                Upgrade a Pro →
              </span>
            </div>
          </div>
        )}

        {/* Recent */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="section-title">Actividad reciente</div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/historial')}
            >
              Ver todo
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recent.map(inv => {
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
        </div>

        {/* CTA */}
        <button className="btn btn-primary" onClick={() => navigate('/crear')}>
          <i className="ti ti-plus" /> Crear nuevo recibo
        </button>

        <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.6 }}>
          El cliente paga como siempre. El cobrador cobra más rápido.<br />
          Loomi convierte ese pago en evidencia verificable · <span style={{ color: 'var(--accent)', fontWeight: 700 }}>FinCore™</span>
        </div>
      </div>

      {detail && <InvoiceDetail inv={detail} onClose={() => setDetail(null)} />}
    </Layout>
  );
};

export default Inicio;
