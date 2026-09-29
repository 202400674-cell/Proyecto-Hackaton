import { useState } from 'react';
import { InvoiceRecord, useApp } from '../context/AppContext';
import { METHOD_LABELS, fmtDate, rh, rand4 } from '../utils/helpers';

const API = 'http://localhost:4000/api';

interface Props {
  inv: InvoiceRecord;
  onClose: () => void;
}

export const ReceiptPreview = ({ inv, isPro }: { inv: InvoiceRecord; isPro: boolean }) => (
  <div className="receipt-preview" style={{ paddingTop: 26 }}>
    <div style={{ textAlign: 'center', marginBottom: 16, paddingTop: 8 }}>
      {isPro ? (
        <>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--primary)' }}>Carlos Molina</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Servicios Creativos</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)' }}>Loomi</div>
          <div style={{ fontSize: 10, color: 'var(--text3)' }}>Tus cobros, verificados.</div>
        </>
      )}
    </div>
    <hr className="receipt-divider" />
    <div style={{ textAlign: 'center', margin: '12px 0' }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)' }}>USD </span>
      <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)' }}>${inv.amount.toFixed(2)}</span>
    </div>
    {inv.quick && (
      <div style={{ textAlign: 'center', margin: '-8px 0 8px' }}>
        <span className="badge badge-quick">⚡ Cobro rápido</span>
      </div>
    )}
    <hr className="receipt-divider" />
    <div className="receipt-row"><span className="rl">Concepto</span><span className="rv">{inv.concept}</span></div>
    <div className="receipt-row"><span className="rl">Método</span><span className="rv">{METHOD_LABELS[inv.method] ?? inv.method}</span></div>
    <div className="receipt-row"><span className="rl">Fecha</span><span className="rv">{fmtDate(inv.date)}</span></div>
    <div className="receipt-row"><span className="rl">Para</span><span className="rv">{inv.receptor}</span></div>
    {inv.phone && <div className="receipt-row"><span className="rl">Tel</span><span className="rv">{inv.phone}</span></div>}
    {inv.note && <div className="receipt-row"><span className="rl">Nota</span><span className="rv" style={{ fontStyle: 'italic' }}>{inv.note}</span></div>}
    <div className="receipt-row">
      <span className="rl">Estado</span>
      <span className="rv">{inv.status === 'confirmed' ? '✓ Confirmado' : inv.status === 'rejected' ? '✗ Rechazado' : '⏳ Pendiente'}</span>
    </div>
    <hr className="receipt-divider" />
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textAlign: 'center', marginBottom: 6 }}>QR de verificación</div>
    <div className="receipt-qr" />
    <div style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: 11, color: 'var(--primary)', fontWeight: 700, marginTop: 6 }}>{inv.id}</div>
    <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>Solo verifica este comprobante.</div>
    <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text3)', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
      {isPro ? 'Verificado con Loomi Pro · FinCore™' : 'Generado con Loomi · loomi.sv'}
    </div>
  </div>
);

const InvoiceDetail = ({ inv, onClose }: Props) => {
  const { plan, setInvoices } = useApp();
  const isPro = plan === 'pro';

  const [confirming, setConfirming] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    const block = Math.floor(40000 + Math.random() * 10000);
    const ts    = Math.floor(Date.now() / 1000);
    const hash  = `0x${rh(4)}·${rh(4)}...${rh(4)}`;
    try {
      await fetch(`${API}/invoices/${inv.id}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ block, hash, ts }),
      });
      setInvoices(prev =>
        prev.map(i => i.id === inv.id ? { ...i, status: 'confirmed', block, hash, ts } : i)
      );
      onClose();
    } catch (e) {
      console.error('Error al confirmar:', e);
    } finally {
      setConfirming(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`${API}/invoices/${inv.id}`, { method: 'DELETE' });
      setInvoices(prev => prev.filter(i => i.id !== inv.id));
      onClose();
    } catch (e) {
      console.error('Error al eliminar:', e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Detalle del recibo</span>
          <button className="close-btn" onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <div className="modal-body">
          <ReceiptPreview inv={inv} isPro={isPro} />

          {/* FinCore block (confirmed only) */}
          {inv.status === 'confirmed' && inv.block && (
            <>
              <div className="section-title" style={{ marginTop: 4 }}>Registro FinCore</div>
              <div className="fincore-block">
                <div className="fb-title">⬡ FINCORE · BLOQUE SELLADO</div>
                <div className="fb-row"><span className="fbl">Bloque</span><span className="fbv">#{inv.block}</span></div>
                <div className="fb-row"><span className="fbl">Timestamp</span><span className="fbv">{inv.ts}</span></div>
                <div className="fb-row"><span className="fbl">Método</span><span className="fbv">{METHOD_LABELS[inv.method] ?? inv.method}</span></div>
                <div className="fb-row"><span className="fbl">Hash</span><span className="fbv">{inv.hash}</span></div>
                <div className="fincore-badge"><div className="dot" />Sellado · inmutable · verificable en FinCore</div>
              </div>
            </>
          )}

          {/* WhatsApp */}
          {inv.phone && (
            <div className="wa-future">
              <i className="ti ti-brand-whatsapp" style={{ fontSize: 20, color: '#25D366', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>Enviar por WhatsApp</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{inv.phone} · 🔜 Próximamente</div>
              </div>
              <button className="btn btn-wa btn-sm" disabled>WhatsApp</button>
            </div>
          )}

          {/* ── Acciones para recibo PENDIENTE ── */}
          {inv.status === 'pending' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              {/* Botón confirmar */}
              <button
                className="btn btn-success"
                onClick={handleConfirm}
                disabled={confirming}
                style={{ width: '100%' }}
              >
                {confirming
                  ? <><i className="ti ti-loader" /> Confirmando...</>
                  : <><i className="ti ti-circle-check" /> Confirmar pago recibido</>
                }
              </button>

              {/* Botón / confirmación de eliminación */}
              {!askDelete ? (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', color: '#DC2626', borderColor: '#FCA5A5' }}
                  onClick={() => setAskDelete(true)}
                >
                  <i className="ti ti-trash" /> Eliminar recibo pendiente
                </button>
              ) : (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#991B1B', marginBottom: 10 }}>
                    <i className="ti ti-alert-triangle" style={{ marginRight: 6 }} />
                    ¿Eliminar este recibo pendiente? Esta acción no se puede deshacer.
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => setAskDelete(false)}
                      disabled={deleting}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ flex: 1, background: '#DC2626', color: '#fff', border: 'none' }}
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? 'Eliminando...' : <><i className="ti ti-trash" /> Sí, eliminar</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Aviso para recibo CONFIRMADO ── */}
          {inv.status === 'confirmed' && (
            <div style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '10px 14px', marginTop: 4,
            }}>
              <i className="ti ti-lock" style={{ fontSize: 16, color: 'var(--text3)', flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
                Para cancelar o corregir un recibo confirmado y sellado en FinCore,
                comunícate con soporte en{' '}
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>soporte@loomi.sv</span>
                {' '}indicando el ID del recibo: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{inv.id}</span>.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
