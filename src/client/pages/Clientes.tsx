import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import InvoiceDetail from '../components/InvoiceDetail';
import { useApp, Client, InvoiceRecord } from '../context/AppContext';
import { initials, fmtDate, getBadge, PAYMENT_ICONS } from '../utils/helpers';

const API = 'http://localhost:4000/api';

// Formatea dígitos a xxxx-xxxx, solo permite números, máx 8 dígitos
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
}

// ── Modal: Nuevo cliente ──────────────────────────────────────────────────────

const NewClientModal = ({ onClose, onSave }: { onClose: () => void; onSave: (c: Client) => void }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', note: '' });
  const [error, setError] = useState('');

  const ch = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const val = k === 'phone' ? formatPhone(e.target.value) : e.target.value;
    setForm(f => ({ ...f, [k]: val }));
  };

  const save = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Hay campos obligatorios vacíos');
      return;
    }
    onSave({ id: 'c' + Date.now(), count: 0, ...form });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Nuevo cliente</span>
          <button className="close-btn" onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <div className="modal-body">
          {error && (
            <div style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              <i className="ti ti-alert-circle" style={{ marginRight: 6 }} />{error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input className="form-input" value={form.name} onChange={ch('name')} placeholder="Nombre completo o negocio" />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono *</label>
            <input className="form-input" inputMode="numeric" value={form.phone} onChange={ch('phone')} placeholder="0000-0000" />
          </div>
          <div className="form-group">
            <label className="form-label">Correo *</label>
            <input className="form-input" type="email" value={form.email} onChange={ch('email')} placeholder="correo@ejemplo.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Nota <span style={{ color: 'var(--text3)' }}>(opcional)</span></label>
            <input className="form-input" value={form.note} onChange={ch('note')} placeholder="Ej: cliente de alquiler..." />
          </div>
          <button className="btn btn-primary" onClick={save}>
            <i className="ti ti-check" /> Guardar cliente
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Modal: Detalle + Edición de cliente ───────────────────────────────────────

const ClientDetail = ({
  client,
  onClose,
  onUpdate,
}: {
  client: Client;
  onClose: () => void;
  onUpdate: (c: Client) => void;
}) => {
  const { invoices } = useApp();
  const [invDetail, setInvDetail] = useState<InvoiceRecord | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: client.name, phone: client.phone, email: client.email, note: client.note });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const invs = invoices.filter(i => i.receptor === client.name);
  const total = invs.filter(i => i.status === 'confirmed').reduce((s, i) => s + i.amount, 0);

  const ch = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const val = k === 'phone' ? formatPhone(e.target.value) : e.target.value;
    setForm(f => ({ ...f, [k]: val }));
  };

  const saveEdit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Hay campos obligatorios vacíos');
      return;
    }
    setSaving(true);
    try {
      await fetch(`${API}/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      onUpdate({ ...client, ...form });
      setEditing(false);
    } catch (e) {
      console.error('Error actualizando cliente:', e);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setForm({ name: client.name, phone: client.phone, email: client.email, note: client.note });
    setError('');
    setEditing(false);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">{editing ? 'Editar cliente' : 'Cliente'}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {!editing && (
                <button
                  className="btn btn-outline btn-sm"
                  style={{ padding: '4px 12px', fontSize: 13 }}
                  onClick={() => setEditing(true)}
                >
                  <i className="ti ti-pencil" /> Editar
                </button>
              )}
              <button className="close-btn" onClick={onClose}><i className="ti ti-x" /></button>
            </div>
          </div>

          <div className="modal-body">

            {/* ── Modo edición ── */}
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {error && (
                  <div style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>
                    <i className="ti ti-alert-circle" style={{ marginRight: 6 }} />{error}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input className="form-input" value={form.name} onChange={ch('name')} placeholder="Nombre completo o negocio" />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono *</label>
                  <input className="form-input" inputMode="numeric" value={form.phone} onChange={ch('phone')} placeholder="0000-0000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo *</label>
                  <input className="form-input" type="email" value={form.email} onChange={ch('email')} placeholder="correo@ejemplo.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nota <span style={{ color: 'var(--text3)' }}>(opcional)</span></label>
                  <input className="form-input" value={form.note} onChange={ch('note')} placeholder="Ej: cliente de alquiler..." />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={cancelEdit} disabled={saving}>
                    Cancelar
                  </button>
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={saveEdit} disabled={saving}>
                    {saving ? <><i className="ti ti-loader" /> Guardando...</> : <><i className="ti ti-check" /> Guardar cambios</>}
                  </button>
                </div>
              </div>
            ) : (
              /* ── Modo vista ── */
              <>
                <div style={{ textAlign: 'center', padding: '4px 0 16px' }}>
                  <div className="client-avatar" style={{ width: 60, height: 60, fontSize: 22, margin: '0 auto' }}>
                    {initials(client.name)}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginTop: 10 }}>{client.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>{client.phone}</div>
                  {client.email && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{client.email}</div>}
                  {client.note && <div style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--text3)', marginTop: 4 }}>{client.note}</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="stat-card">
                    <div className="stat-label">Cobros</div>
                    <div className="stat-value" style={{ fontSize: 22 }}>{invs.length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Total</div>
                    <div className="stat-value" style={{ fontSize: 22 }}>${total.toFixed(0)}</div>
                  </div>
                </div>

                <button className="btn btn-primary" onClick={() => { onClose(); navigate('/crear'); }}>
                  <i className="ti ti-bolt" /> Cobrarle ahora
                </button>

                <div className="wa-future">
                  <i className="ti ti-brand-whatsapp" style={{ fontSize: 20, color: '#25D366', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>Enviar comprobante por WhatsApp</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{client.phone} · 🔜 Próximamente</div>
                  </div>
                  <button className="btn btn-wa btn-sm" disabled><i className="ti ti-send" /></button>
                </div>

                {invs.length > 0 && (
                  <>
                    <div className="section-title">Historial con este cliente</div>
                    {invs.map(inv => {
                      const { cls, label } = getBadge(inv.status);
                      return (
                        <div key={inv.id} className="invoice-item" onClick={() => setInvDetail(inv)}>
                          <div className="invoice-icon"><i className={`ti ${PAYMENT_ICONS[inv.type] ?? 'ti-receipt'}`} /></div>
                          <div className="invoice-info">
                            <div className="invoice-concept">{inv.concept}</div>
                            <div className="invoice-sub">{fmtDate(inv.date)}</div>
                          </div>
                          <div className="invoice-right">
                            <div className="invoice-amount">${inv.amount.toFixed(2)}</div>
                            <span className={`badge ${cls}`}>{label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {invDetail && <InvoiceDetail inv={invDetail} onClose={() => setInvDetail(null)} />}
    </>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────

const Clientes = () => {
  const { clients, setClients } = useApp();
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Client | null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)
  );

  const addClient = async (c: Client) => {
    try {
      await fetch(`${API}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      });
    } catch (e) { console.error('Error saving client:', e); }
    setClients(prev => [c, ...prev]);
    setShowNew(false);
  };

  const updateClient = (updated: Client) => {
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSelected(updated);
  };

  return (
    <Layout title="Clientes">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            Registra clientes frecuentes para agilizar futuros cobros.
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>
            <i className="ti ti-user-plus" /> Nuevo
          </button>
        </div>

        <div className="search-box">
          <i className="ti ti-search" />
          <input
            className="form-input"
            placeholder="Buscar por nombre o teléfono..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text3)' }}>
            <i className="ti ti-user-off" style={{ fontSize: 48, display: 'block', marginBottom: 10 }} />
            Sin resultados
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(c => (
              <div key={c.id} className="client-item" onClick={() => setSelected(c)}>
                <div className="client-avatar">{initials(c.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 1 }}>
                    <i className="ti ti-phone" style={{ fontSize: 11 }} /> {c.phone}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 10, flexShrink: 0 }}>
                  {c.count} cobros
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <ClientDetail
          client={selected}
          onClose={() => setSelected(null)}
          onUpdate={updateClient}
        />
      )}
      {showNew && <NewClientModal onClose={() => setShowNew(false)} onSave={addClient} />}
    </Layout>
  );
};

export default Clientes;
