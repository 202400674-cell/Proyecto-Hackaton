import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { rand4, rh } from '../utils/helpers';

const METHOD_LABELS: Record<string, string> = {
  efectivo: '💵 Efectivo', transferencia: '🏦 Transferencia', quickpay: '📲 QuickPay',
  deposito: '🧾 Depósito', cheque: '📑 Cheque', wallet: '💳 Wallet', otro: '· Otro',
};

const MONTH_NAMES = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const ReportModal = ({ onClose }: { onClose: () => void }) => {
  const { invoices } = useApp();
  const [period, setPeriod] = useState(3);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - period);
  const filtered = invoices.filter(i => i.status === 'confirmed' && new Date(i.date) >= cutoff);
  const totalAmt = filtered.reduce((s, i) => s + i.amount, 0);

  const byMonth: Record<string, typeof filtered> = {};
  filtered.forEach(inv => {
    const k = inv.date.substring(0, 7);
    byMonth[k] = [...(byMonth[k] ?? []), inv];
  });
  const months = Object.keys(byMonth).sort().reverse();

  const rptId = `RPT-2025-${rand4()}`;
  const rptBlock = Math.floor(48000 + Math.random() * 2000);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => { setDownloading(false); setDownloaded(true); }, 1800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Reporte FinCore</span>
          <button className="close-btn" onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: 8 }}>
            {[3, 6, 12].map(p => (
              <button key={p} className={`period-btn${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
                {p}m
              </button>
            ))}
          </div>

          <div className="report-section">
            <div className="report-section-header">Resumen</div>
            <div className="report-section-body">
              <div className="report-row"><span className="rr-label">Titular</span><span className="rr-val">Carlos Molina</span></div>
              <div className="report-row"><span className="rr-label">Período</span><span className="rr-val">Últimos {period} meses</span></div>
              <div className="report-row"><span className="rr-label">Confirmados</span><span className="rr-val">{filtered.length}</span></div>
              <div className="report-row">
                <span className="rr-label">Total cobrado</span>
                <span className="rr-val" style={{ fontWeight: 900, color: 'var(--primary)' }}>${totalAmt.toFixed(2)}</span>
              </div>
              <div className="report-row">
                <span className="rr-label">Clientes únicos</span>
                <span className="rr-val">{[...new Set(filtered.map(i => i.receptor))].length}</span>
              </div>
            </div>
          </div>

          {months.map(m => {
            const movs = byMonth[m]!;
            const sub = movs.reduce((s, i) => s + i.amount, 0);
            const [yr, mo] = m.split('-');
            return (
              <div key={m} className="report-section">
                <div className="report-section-header">{MONTH_NAMES[parseInt(mo!)]} {yr}</div>
                <div className="report-section-body">
                  {movs.map(inv => (
                    <div key={inv.id}>
                      <div className="report-row">
                        <span className="rr-label" style={{ flex: 1 }}>{inv.concept}</span>
                        <span className="rr-val">${inv.amount.toFixed(2)}</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', paddingBottom: 5, borderBottom: '1px dashed var(--border)', marginBottom: 2 }}>
                        {METHOD_LABELS[inv.method] ?? inv.method}{inv.block ? ` · Bloque #${inv.block}` : ''}
                      </div>
                    </div>
                  ))}
                  <div className="report-row" style={{ marginTop: 4 }}>
                    <span className="rr-label" style={{ fontWeight: 700 }}>Subtotal</span>
                    <span className="rr-val" style={{ fontWeight: 900 }}>${sub.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="fincore-block">
            <div className="fb-title">⬡ FINCORE · REGISTRO DE REPORTE</div>
            <div className="fb-row"><span className="fbl">ID Reporte</span><span className="fbv">{rptId}</span></div>
            <div className="fb-row"><span className="fbl">Bloque</span><span className="fbv">#{rptBlock}</span></div>
            <div className="fb-row"><span className="fbl">Firma</span><span className="fbv">VALID ✓</span></div>
            <div style={{ marginTop: 6, fontSize: 10, color: 'rgba(255,255,255,.5)' }}>Hash:</div>
            <div className="fb-hash">0xRPT·{rh(4)}...{rh(4)}</div>
            <div className="fincore-badge"><div className="dot" />Sellado · inmutable · verificable</div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>QR de verificación del reporte</div>
            <div className="receipt-qr" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>{rptId}</div>
          </div>

          <button
            className={`btn ${downloaded ? 'btn-success' : 'btn-primary'}`}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading
              ? <><i className="ti ti-loader" /> Generando...</>
              : downloaded
                ? <><i className="ti ti-circle-check" /> PDF listo (demo)</>
                : <><i className="ti ti-download" /> Descargar PDF</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

const Perfil = () => {
  const { invoices, clients, plan, setPlanModal } = useApp();
  const [showReport, setShowReport] = useState(false);

  const confirmed = invoices.filter(i => i.status === 'confirmed');
  const total = confirmed.reduce((s, i) => s + i.amount, 0);

  return (
    <Layout title="Perfil">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Profile card */}
        <div className="card" style={{ textAlign: 'center', padding: 28 }}>
          <div className="profile-avatar" style={{ margin: '0 auto' }}>CM</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginTop: 10 }}>Carlos Molina</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'monospace' }}>ID · LMI-USR-7742</div>
          <div style={{ marginTop: 10 }}>
            <span className="tag">
              <i className="ti ti-star" style={{ fontSize: 12 }} />
              Plan {plan === 'pro' ? 'Pro ✦' : 'Free'}
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div>
          <div className="section-title" style={{ marginBottom: 10 }}>Métricas del período</div>
          <div className="metric-grid">
            <div className="metric-item">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{invoices.length}</div>
              <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 3, fontWeight: 600 }}>Emitidas</div>
            </div>
            <div className="metric-item">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>${total.toFixed(0)}</div>
              <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 3, fontWeight: 600 }}>Cobrado</div>
            </div>
            <div className="metric-item">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{clients.length}</div>
              <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 3, fontWeight: 600 }}>Clientes</div>
            </div>
          </div>
        </div>

        {/* Report */}
        <div>
          <div className="section-title" style={{ marginBottom: 10 }}>Reportes financieros</div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--primary)' }}>
                <i className="ti ti-chart-bar" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text)' }}>Generar Reporte</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Sellado y verificable en FinCore</div>
              </div>
            </div>
            {plan === 'pro' ? (
              <button className="btn btn-primary" onClick={() => setShowReport(true)}>
                <i className="ti ti-file-analytics" /> Generar Reporte
              </button>
            ) : (
              <div className="upgrade-card">
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>🔒 Función Pro</h3>
                <p style={{ fontSize: 13, opacity: .8, margin: '6px 0 14px' }}>Los reportes verificables están en el plan Pro.</p>
                <button className="btn btn-accent btn-sm" style={{ width: '100%' }} onClick={() => setPlanModal(true)}>
                  Upgrade a Pro
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>Configuración</div>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0', cursor: 'pointer' }}
            onClick={() => setPlanModal(true)}
          >
            <i className="ti ti-crown" style={{ fontSize: 20, color: 'var(--primary)' }} />
            <span style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600 }}>Upgrade a Pro</span>
            <i className="ti ti-chevron-right" style={{ marginLeft: 'auto', color: 'var(--text3)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
            <i className="ti ti-brand-whatsapp" style={{ fontSize: 20, color: '#25D366' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>WhatsApp automático</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>🔜 Próximamente</div>
            </div>
            <span style={{ fontSize: 10, background: '#E8FDE8', color: '#065F46', fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>PRONTO</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', padding: '8px 0' }}>
          Loomi v2.0 · Powered by FinCore™ · El Salvador<br />
          FinCore respalda la evidencia mediante hash, estado, fecha e ID de registro.
        </div>
      </div>

      {showReport && <ReportModal onClose={() => setShowReport(false)} />}
    </Layout>
  );
};

export default Perfil;
