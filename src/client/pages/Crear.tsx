import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { ReceiptPreview } from '../components/InvoiceDetail';
import { useApp, Client, InvoiceRecord } from '../context/AppContext';
import { METHOD_LABELS, initials, rand4, rh } from '../utils/helpers';

type Step = '0' | 'c1' | 'nc' | 'c2' | 'c3' | 'r1' | 'r2' | 'r3' | 'success';
type Mode = 'completo' | 'rapido' | '';

const STEP_TITLES: Record<Step, string> = {
  '0': 'Nuevo Recibo',
  c1: 'Paso 1 · Cliente',
  nc: 'Nuevo cliente',
  c2: 'Paso 2 · Pago',
  c3: 'Paso 3 · Previsualizar',
  r1: '⚡ Cobro rápido',
  r2: 'QR de cobro',
  r3: 'Confirmar pago',
  success: '¡Listo!',
};

const DOT_MAP: Partial<Record<Step, number>> = {
  c1: 1, nc: 1, c2: 2, c3: 3, r1: 1, r2: 2, r3: 3,
};

const StepIndicator = ({ step, mode }: { step: Step; mode: Mode }) => {
  const active = DOT_MAP[step];
  if (!active || !mode) return null;
  return (
    <div className="step-indicator">
      {[1, 2, 3].map(i => (
        <div key={i} className={`step-dot${i < active ? ' done' : i === active ? ' active' : ''}`} />
      ))}
    </div>
  );
};

const Crear = () => {
  const { invoices, setInvoices, clients, setClients, plan } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('0');
  const [mode, setMode] = useState<Mode>('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [rapidClientSearch, setRapidClientSearch] = useState('');

  // Completo form
  const [fConcepto, setFConcepto] = useState('');
  const [fMonto, setFMonto] = useState('');
  const [fMetodo, setFMetodo] = useState('efectivo');
  const [fTipo, setFTipo] = useState('servicio');
  const [fFecha, setFFecha] = useState(new Date().toISOString().split('T')[0]);
  const [fNota, setFNota] = useState('');

  // Rapido form
  const [rMonto, setRMonto] = useState('');
  const [rConcepto, setRConcepto] = useState('');
  const [rMetodo, setRMetodo] = useState('efectivo');
  const [rNombre, setRNombre] = useState('');
  const [rTel, setRTel] = useState('');
  const [rapidSelected, setRapidSelected] = useState<Client | null>(null);

  // New client form
  const [ncNombre, setNcNombre] = useState('');
  const [ncTel, setNcTel] = useState('');
  const [ncEmail, setNcEmail] = useState('');
  const [ncNota, setNcNota] = useState('');

  // Success
  const [successId, setSuccessId] = useState('');
  const [successBlock, setSuccessBlock] = useState(0);
  const [successPhone, setSuccessPhone] = useState('');
  const [successStatus, setSuccessStatus] = useState<'confirmed' | 'pending'>('confirmed');

  // Pending reminder modal
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [reminderDate, setReminderDate] = useState('');

  const reset = () => {
    setStep('0'); setMode(''); setSelectedClient(null);
    setFConcepto(''); setFMonto(''); setFMetodo('efectivo'); setFTipo('servicio');
    setFFecha(new Date().toISOString().split('T')[0]); setFNota('');
    setRMonto(''); setRConcepto(''); setRMetodo('efectivo'); setRNombre(''); setRTel('');
    setRapidSelected(null); setClientSearch(''); setRapidClientSearch('');
  };

  const goStep = (s: Step) => setStep(s);

  const selectMode = (m: 'completo' | 'rapido') => {
    setMode(m);
    if (m === 'completo') goStep(selectedClient ? 'c2' : 'c1');
    else goStep('r1');
  };

  const saveNewClient = async () => {
    if (!ncNombre.trim() || !ncTel.trim()) { alert('Nombre y teléfono son obligatorios.'); return; }
    const c: Client = { id: 'c' + Date.now(), name: ncNombre, phone: ncTel, email: ncEmail, note: ncNota, count: 0 };
    try {
      await fetch('http://localhost:4000/api/clients', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c),
      });
    } catch (e) { console.error('Error guardando cliente:', e); }
    setClients(prev => [c, ...prev]);
    setSelectedClient(c);
    setNcNombre(''); setNcTel(''); setNcEmail(''); setNcNota('');
    goStep('c2');
  };

  const confirmReceipt = async (isQuick: boolean, status: 'confirmed' | 'pending' = 'confirmed') => {
    const id = `LMI-${rand4()}-${rand4()}-${rand4()}`;
    const block = Math.floor(40000 + Math.random() * 10000);
    const hash = `0x${rh(4)}·${rh(4)}...${rh(4)}`;
    let inv: InvoiceRecord;

    if (isQuick) {
      const clientName = rapidSelected?.name ?? rNombre ?? 'Cliente';
      const phone = rapidSelected?.phone ?? rTel ?? '';
      if (phone && !rapidSelected && clientName) {
        const exists = clients.find(c => c.phone === phone);
        if (!exists) {
          const newC = { id: 'c' + Date.now(), name: clientName, phone, email: '', note: '', count: 1 };
          try {
            await fetch('http://localhost:4000/api/clients', {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newC),
            });
          } catch (e) { console.error('Error guardando cliente:', e); }
          setClients(prev => [newC, ...prev]);
        }
      }
      inv = { id, block, ts: Math.floor(Date.now() / 1000), hash, status, quick: true,
        concept: rConcepto, type: 'otro', method: rMetodo,
        amount: parseFloat(rMonto) || 0,
        date: new Date().toISOString().split('T')[0],
        receptor: clientName, phone, note: '' };
      setSuccessPhone(phone);
    } else {
      const clientName = selectedClient?.name ?? 'Sin cliente';
      const phone = selectedClient?.phone ?? '';
      if (selectedClient && status === 'confirmed') {
        try {
          await fetch(`http://localhost:4000/api/clients/${selectedClient.id}/count`, { method: 'PATCH' });
        } catch (e) { console.error('Error actualizando contador:', e); }
        setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, count: c.count + 1 } : c));
      }
      inv = { id, block, ts: Math.floor(Date.now() / 1000), hash, status, quick: false,
        concept: fConcepto, type: fTipo, method: fMetodo,
        amount: parseFloat(fMonto) || 0, date: fFecha,
        receptor: clientName, phone, note: fNota };
      setSuccessPhone(phone);
    }

    try {
      await fetch('http://localhost:4000/api/invoices', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(inv),
      });
    } catch (e) { console.error('Error guardando recibo:', e); }

    setInvoices(prev => [inv, ...prev]);
    setSuccessId(id);
    setSuccessBlock(block);
    setSuccessStatus(status);
    goStep('success');
  };

  const buildPreviewInv = (): InvoiceRecord => ({
    id: 'LMI-PREV-DEMO', concept: fConcepto || '—', type: fTipo, method: fMetodo,
    amount: parseFloat(fMonto) || 0, date: fFecha,
    receptor: selectedClient?.name ?? 'Sin cliente', phone: selectedClient?.phone ?? '',
    note: fNota, status: 'pending', quick: false,
  });

  const buildRapidPreviewInv = (): InvoiceRecord => ({
    id: 'LMI-PREV-DEMO', concept: rConcepto || 'Cobro rápido', type: 'otro', method: rMetodo,
    amount: parseFloat(rMonto) || 0, date: new Date().toISOString().split('T')[0],
    receptor: rapidSelected?.name ?? rNombre ?? 'Cliente', phone: rapidSelected?.phone ?? rTel ?? '',
    note: '', status: 'pending', quick: true,
  });

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.phone.includes(clientSearch)
  );
  const filteredRapid = rapidClientSearch
    ? clients.filter(c => c.name.toLowerCase().includes(rapidClientSearch.toLowerCase()) || c.phone.includes(rapidClientSearch)).slice(0, 3)
    : [];

  const backBtn = (
    <button
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', fontSize: 22, display: 'flex', alignItems: 'center' }}
      onClick={() => step === '0' ? navigate('/') : step === 'success' ? reset() : goStep('0')}
    >
      <i className="ti ti-arrow-left" />
    </button>
  );

  return (
    <Layout title={STEP_TITLES[step]} topbarLeft={backBtn}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <StepIndicator step={step} mode={mode} />

        {/* ── Step 0: Mode selection ── */}
        {step === '0' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>¿Cómo quieres cobrar?</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
              Loomi no procesa el pago. Tú cobras por tu medio habitual; Loomi registra la evidencia.
            </div>
            <div className="mode-card" onClick={() => selectMode('completo')}>
              <div style={{ fontSize: 28, color: 'var(--primary)', marginBottom: 10 }}><i className="ti ti-file-description" /></div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>Comprobante completo</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4, lineHeight: 1.5 }}>
                Para operaciones formales. Incluye cliente, método, categoría, notas y comprobante.
              </div>
            </div>
            <div className="mode-card" onClick={() => selectMode('rapido')}>
              <div style={{ fontSize: 28, color: 'var(--primary)', marginBottom: 10 }}><i className="ti ti-bolt" /></div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>Cobro rápido</div>
              <span style={{ display: 'inline-block', background: 'var(--accent)', color: 'var(--text)', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10, marginTop: 6 }}>⚡ En segundos</span>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6, lineHeight: 1.5 }}>
                Solo monto, concepto y método de pago. Cliente opcional.
              </div>
            </div>
          </div>
        )}

        {/* ── Step C1: Client selection ── */}
        {step === 'c1' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>¿A quién le cobras?</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Busca un cliente frecuente o continúa sin uno.</div>
            <div className="search-box">
              <i className="ti ti-search" />
              <input className="form-input" placeholder="Buscar por nombre o teléfono..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredClients.slice(0, 5).map(c => (
                <div key={c.id} className="client-item" onClick={() => { setSelectedClient(c); goStep('c2'); }}>
                  <div className="client-avatar" style={{ width: 38, height: 38, fontSize: 14 }}>{initials(c.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{c.phone}</div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 10 }}>{c.count}×</span>
                </div>
              ))}
              {filteredClients.length === 0 && <div style={{ textAlign: 'center', padding: 16, color: 'var(--text3)', fontSize: 13 }}>No encontrado</div>}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { setSelectedClient(null); goStep('c2'); }}>
                <i className="ti ti-user-off" /> Sin cliente
              </button>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => goStep('nc')}>
                <i className="ti ti-user-plus" /> Nuevo cliente
              </button>
            </div>
          </div>
        )}

        {/* ── Step NC: New client ── */}
        {step === 'nc' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Nombre del cliente *</label>
              <input className="form-input" value={ncNombre} onChange={e => setNcNombre(e.target.value)} placeholder="Nombre completo o negocio" />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono *</label>
              <input className="form-input" type="tel" value={ncTel} onChange={e => setNcTel(e.target.value)} placeholder="+503 0000-0000" />
            </div>
            <div className="form-group">
              <label className="form-label">Correo <span style={{ color: 'var(--text3)' }}>(opcional)</span></label>
              <input className="form-input" type="email" value={ncEmail} onChange={e => setNcEmail(e.target.value)} placeholder="correo@ejemplo.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Nota <span style={{ color: 'var(--text3)' }}>(opcional)</span></label>
              <input className="form-input" value={ncNota} onChange={e => setNcNota(e.target.value)} placeholder="Ej: cliente de alquiler..." />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button className="btn btn-ghost btn-sm" style={{ width: 'auto' }} onClick={() => goStep('c1')}><i className="ti ti-arrow-left" /></button>
              <button className="btn btn-primary" onClick={saveNewClient}><i className="ti ti-check" /> Guardar y continuar</button>
            </div>
          </div>
        )}

        {/* ── Step C2: Payment data ── */}
        {step === 'c2' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Datos del pago</div>
            {selectedClient && (
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="ti ti-user-check" style={{ color: 'var(--primary)', fontSize: 18 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{selectedClient.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>{selectedClient.phone}</div>
                </div>
                <button onClick={() => setSelectedClient(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 16 }}><i className="ti ti-x" /></button>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Concepto *</label>
              <input className="form-input" value={fConcepto} onChange={e => setFConcepto(e.target.value)} placeholder="Ej: Diseño de logo para tienda" />
            </div>
            <div className="form-group">
              <label className="form-label">Monto (USD) *</label>
              <input className="form-input" type="number" value={fMonto} onChange={e => setFMonto(e.target.value)} placeholder="0.00" min="0" step="0.01" />
            </div>
            <div className="form-group">
              <label className="form-label">Método de pago</label>
              <select className="form-select" value={fMetodo} onChange={e => setFMetodo(e.target.value)}>
                <option value="efectivo">💵 Efectivo</option>
                <option value="transferencia">🏦 Transferencia bancaria</option>
                <option value="quickpay">📲 QuickPay</option>
                <option value="deposito">🧾 Depósito bancario</option>
                <option value="cheque">📑 Cheque</option>
                <option value="wallet">💳 Wallet / Billetera digital</option>
                <option value="otro">· Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de pago</label>
              <select className="form-select" value={fTipo} onChange={e => setFTipo(e.target.value)}>
                <option value="servicio">Servicio profesional</option>
                <option value="alquiler">Alquiler</option>
                <option value="producto">Venta de producto</option>
                <option value="consultoria">Consultoría</option>
                <option value="diseño">Diseño / Creatividad</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input className="form-input" type="date" value={fFecha} onChange={e => setFFecha(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Notas <span style={{ color: 'var(--text3)' }}>(opcional)</span></label>
              <textarea className="form-textarea" value={fNota} onChange={e => setFNota(e.target.value)} placeholder="Condiciones, acuerdos o detalles..." />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" style={{ width: 'auto' }} onClick={() => goStep('c1')}><i className="ti ti-arrow-left" /></button>
              <button className="btn btn-primary" onClick={() => { if (!fConcepto || !fMonto) { alert('Completa concepto y monto.'); return; } goStep('c3'); }}>
                <i className="ti ti-eye" /> Previsualizar
              </button>
            </div>
          </div>
        )}

        {/* ── Step C3: Preview ── */}
        {step === 'c3' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Vista previa del recibo</div>
            <ReceiptPreview inv={buildPreviewInv()} isPro={plan === 'pro'} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" style={{ width: 'auto' }} onClick={() => goStep('c2')}>
                <i className="ti ti-arrow-left" />
              </button>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => {
                setReminderDate('');
                setShowPendingModal(true);
              }}>
                <i className="ti ti-clock" /> Guardar pendiente
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => confirmReceipt(false, 'confirmed')}>
                <i className="ti ti-shield-check" /> Confirmar y sellar
              </button>
            </div>
          </div>
        )}

        {/* ── Step R1: Quick form ── */}
        {step === 'r1' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>Registrá un cobro en segundos.</div>
            <div className="form-group">
              <label className="form-label">Monto (USD) *</label>
              <input className="form-input" type="number" value={rMonto} onChange={e => setRMonto(e.target.value)} placeholder="0.00" min="0" step="0.01" />
            </div>
            <div className="form-group">
              <label className="form-label">Concepto breve *</label>
              <input className="form-input" value={rConcepto} onChange={e => setRConcepto(e.target.value)} placeholder="Ej: Corte de pelo, alquiler mayo..." />
            </div>
            <div className="form-group">
              <label className="form-label">Método de pago</label>
              <select className="form-select" value={rMetodo} onChange={e => setRMetodo(e.target.value)}>
                <option value="efectivo">💵 Efectivo</option>
                <option value="transferencia">🏦 Transferencia</option>
                <option value="quickpay">📲 QuickPay</option>
                <option value="deposito">🧾 Depósito</option>
                <option value="wallet">💳 Wallet</option>
                <option value="otro">· Otro</option>
              </select>
            </div>

            <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 8 }}>Cliente (opcional)</div>
              <div className="search-box" style={{ marginBottom: 8 }}>
                <i className="ti ti-search" />
                <input className="form-input" value={rapidClientSearch} onChange={e => setRapidClientSearch(e.target.value)} placeholder="Buscar cliente guardado..." />
              </div>
              {filteredRapid.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                  {filteredRapid.map(c => (
                    <div key={c.id} className="client-item" style={{ padding: '8px 12px' }} onClick={() => { setRapidSelected(c); setRapidClientSearch(''); }}>
                      <div className="client-avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{initials(c.name)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)' }}>{c.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {rapidSelected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, background: 'var(--surface)', border: '1px solid var(--primary)', borderRadius: 8, padding: '8px 12px' }}>
                  <i className="ti ti-user-check" style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{rapidSelected.name}</span>
                  <button onClick={() => setRapidSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 14 }}><i className="ti ti-x" /></button>
                </div>
              )}
              {!rapidSelected && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" value={rNombre} onChange={e => setRNombre(e.target.value)} placeholder="Nombre (nuevo)" style={{ fontSize: 13, padding: '10px 12px' }} />
                  <input className="form-input" type="tel" value={rTel} onChange={e => setRTel(e.target.value)} placeholder="Teléfono" style={{ fontSize: 13, padding: '10px 12px' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" style={{ width: 'auto' }} onClick={() => goStep('0')}><i className="ti ti-arrow-left" /></button>
              <button className="btn btn-primary" onClick={() => { if (!rMonto) { alert('Ingresá el monto primero.'); return; } goStep('r2'); }}>
                <i className="ti ti-qrcode" /> Ver QR de cobro
              </button>
            </div>
          </div>
        )}

        {/* ── Step R2: QR cobro ── */}
        {step === 'r2' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
              Muéstrale este QR a tu cliente para que pague desde su banco, wallet o medio habitual.
            </div>
            <div className="qr-cobro-box">
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 4 }}>QR de cobro</div>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                <span className="method-pill"><i className="ti ti-qrcode" style={{ fontSize: 14 }} /> {METHOD_LABELS[rMetodo] ?? rMetodo}</span>
              </div>
              <div className="qr-big" />
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)', marginTop: 10 }}>${parseFloat(rMonto || '0').toFixed(2)}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{rConcepto}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 8, fontStyle: 'italic' }}>
                QR de {METHOD_LABELS[rMetodo] ?? rMetodo} del cobrador · simulado para demo
              </div>
            </div>
            <div className="disclaimer-box">
              <i className="ti ti-info-circle" style={{ fontSize: 18, flexShrink: 0, color: '#92400E' }} />
              <div>Loomi no procesa el pago. El cliente paga desde su banco, wallet o medio tradicional. Loomi registra la evidencia cuando el cobrador lo confirma.</div>
            </div>
            <button className="btn btn-success" onClick={() => goStep('r3')}>
              <i className="ti ti-circle-check" /> Pago recibido — Generar comprobante
            </button>
            <button className="btn btn-ghost btn-sm" style={{ width: 'auto', alignSelf: 'center' }} onClick={() => goStep('r1')}>
              <i className="ti ti-arrow-left" /> Volver
            </button>
          </div>
        )}

        {/* ── Step R3: Quick preview ── */}
        {step === 'r3' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Comprobante generado</div>
            <ReceiptPreview inv={buildRapidPreviewInv()} isPro={plan === 'pro'} />
            <button className="btn btn-primary" onClick={() => confirmReceipt(true)}>
              <i className="ti ti-shield-check" /> Sellar en FinCore
            </button>
          </div>
        )}

        {/* ── Step Success ── */}
        {step === 'success' && (
          <div className="success-screen">
            {successStatus === 'confirmed' ? (
              <>
                <div className="success-icon"><i className="ti ti-circle-check" /></div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>¡Comprobante sellado!</div>
                <div style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 280 }}>
                  FinCore registró hash, estado, fecha e ID de evidencia.
                </div>
              </>
            ) : (
              <>
                <div className="success-icon" style={{ background: 'rgba(234,179,8,.15)', color: '#92400E' }}>
                  <i className="ti ti-clock" />
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>Recibo guardado como pendiente</div>
                <div style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 300, textAlign: 'center' }}>
                  El recibo fue registrado. Recuerda confirmar el pago cuando el cliente te lo acredite.
                </div>
                {reminderDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FEF9C3', border: '1px solid #FDE047', borderRadius: 12, padding: '12px 16px', width: '100%', maxWidth: 340 }}>
                    <i className="ti ti-bell" style={{ fontSize: 20, color: '#92400E', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>Recordatorio programado</div>
                      <div style={{ fontSize: 13, color: '#78350F' }}>
                        {new Date(reminderDate + 'T12:00:00').toLocaleDateString('es-SV', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="verification-box">
              <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>QR de verificación</div>
              <div className="receipt-qr" style={{ width: 90, height: 90, margin: '10px auto 6px' }} />
              <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600, marginTop: 4 }}>ID de verificación</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace', marginTop: 4 }}>{successId}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>Este QR verifica el comprobante. No expone otros datos del emisor.</div>
            </div>
            <span className="fincore-tag"><i className="ti ti-cube" style={{ fontSize: 14 }} /> Sellado · Bloque #{successBlock}</span>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Inmutable · verificable · registro permanente</div>
            {successPhone && (
              <div className="wa-future" style={{ width: '100%' }}>
                <i className="ti ti-brand-whatsapp" style={{ fontSize: 22, color: '#25D366', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Enviar comprobante</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{successPhone}</div>
                </div>
                <button className="btn btn-wa btn-sm" disabled><i className="ti ti-brand-whatsapp" /> WhatsApp</button>
              </div>
            )}
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>🔜 Próximamente: enviar comprobante por WhatsApp automáticamente</div>
            <button className="btn btn-primary" onClick={() => navigate('/')}><i className="ti ti-home" /> Ir al inicio</button>
            <button className="btn btn-outline" onClick={() => navigate('/historial')}><i className="ti ti-list" /> Ver historial</button>
          </div>
        )}
      </div>

      {/* ── Modal: recordatorio de pago pendiente ── */}
      {showPendingModal && (
        <div className="modal-overlay" onClick={() => setShowPendingModal(false)}>
          <div className="modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title"><i className="ti ti-clock" style={{ marginRight: 6 }} />Guardar como pendiente</span>
              <button className="close-btn" onClick={() => setShowPendingModal(false)}><i className="ti ti-x" /></button>
            </div>
            <div className="modal-body">

              {/* Explicación */}
              <div style={{ display: 'flex', gap: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                <i className="ti ti-info-circle" style={{ fontSize: 18, color: 'var(--primary)', flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                  Este recibo quedará registrado como <b style={{ color: 'var(--text)' }}>pendiente</b> en tu historial.
                  El cobro aún no se refleja en tu total del mes; se sumará cuando lo confirmes.
                </div>
              </div>

              {/* Fecha de recordatorio */}
              <div className="form-group" style={{ marginTop: 4 }}>
                <label className="form-label">
                  Fecha de recordatorio <span style={{ color: 'var(--text3)' }}>(opcional)</span>
                </label>
                <input
                  className="form-input"
                  type="date"
                  value={reminderDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setReminderDate(e.target.value)}
                />
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6, lineHeight: 1.5 }}>
                  <i className="ti ti-bell" style={{ marginRight: 4 }} />
                  Elige la fecha en la que quieres que te recuerde contactar a{' '}
                  <b>{selectedClient?.name ?? 'el cliente'}</b> para confirmar si el pago fue realizado.
                  Útil si acordaste un plazo de pago o quieres hacer seguimiento puntual.
                </div>
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => setShowPendingModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  onClick={() => { setShowPendingModal(false); confirmReceipt(false, 'pending'); }}
                >
                  <i className="ti ti-clock" /> Guardar pendiente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Crear;
