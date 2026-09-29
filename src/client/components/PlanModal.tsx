import React from 'react';
import { useApp } from '../context/AppContext';

const PlanModal = () => {
  const { planModal, setPlanModal, plan, setPlan } = useApp();
  if (!planModal) return null;

  const select = (p: 'free' | 'pro') => { setPlan(p); setPlanModal(false); };

  return (
    <div className="modal-overlay" onClick={() => setPlanModal(false)}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Planes Loomi</span>
          <button className="close-btn" onClick={() => setPlanModal(false)}><i className="ti ti-x" /></button>
        </div>
        <div className="modal-body">
          <div className="card" style={{ border: `2px solid ${plan === 'free' ? 'var(--primary)' : 'var(--border)'}` }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Free</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', margin: '4px 0 12px' }}>Para empezar</div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div>✓ Hasta 10 recibos/mes</div>
              <div>✓ Clientes frecuentes</div>
              <div>✓ Cobro rápido y QR de cobro</div>
              <div>✓ Sellado FinCore</div>
              <div>✗ Reportes financieros</div>
              <div>✗ Marca personalizada</div>
            </div>
            <button className="btn btn-outline" style={{ marginTop: 14 }} onClick={() => select('free')}>
              Continuar en Free
            </button>
          </div>

          <div className="card" style={{ border: '2px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>Pro</span>
              <span style={{ background: 'var(--accent)', color: 'var(--text)', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10 }}>RECOMENDADO</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)', margin: '6px 0' }}>
              $9.99<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)' }}>/mes</span>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div>✓ Recibos ilimitados</div>
              <div>✓ Clientes ilimitados</div>
              <div>✓ Reportes sellados en FinCore</div>
              <div>✓ Marca personalizada</div>
              <div>✓ WhatsApp automático (próximo)</div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => select('pro')}>
              <i className="ti ti-crown" /> Activar Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanModal;
