import React, { useState } from 'react';
import { Invoice } from '../../shared/types';

const initial: Invoice = {
  cliente: '', descripcion: '', oficio: '', monto: 0, metodo: '', fecha: '', vencimiento: ''
};

const InvoiceForm = ({ onSubmit }: { onSubmit: (data: Invoice) => void }) => {
  const [form, setForm] = useState<Invoice>(initial);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    setForm(initial);
  };

  return (
    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12,maxWidth:400,margin:'0 auto'}}>
      <input name="cliente" value={form.cliente} onChange={handleChange} placeholder="Cliente" required />
      <input name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" required />
      <input name="oficio" value={form.oficio} onChange={handleChange} placeholder="Oficio" required />
      <input name="monto" type="number" value={form.monto} onChange={handleChange} placeholder="Monto" required />
      <input name="metodo" value={form.metodo} onChange={handleChange} placeholder="Método de pago" required />
      <input name="fecha" type="date" value={form.fecha} onChange={handleChange} required />
      <input name="vencimiento" type="date" value={form.vencimiento} onChange={handleChange} required />
      <textarea name="notas" onChange={handleChange} placeholder="Notas adicionales (opcional)" />
      <button type="submit" style={{background:'var(--accent)',color:'#000',fontWeight:700,padding:10,borderRadius:8}}>Crear Factura</button>
    </form>
  );
};

export default InvoiceForm;
