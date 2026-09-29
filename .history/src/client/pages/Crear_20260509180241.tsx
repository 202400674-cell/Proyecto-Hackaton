import React from 'react';
import Layout from '../components/Layout';
import InvoiceForm from '../components/InvoiceForm';

const Crear = () => {
  const handleSubmit = async (data: any) => {
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    alert('Factura creada correctamente');
  };
  return (
    <Layout>
      <div style={{padding:'2rem 1rem'}}>
        <h1 style={{fontSize:'2rem',fontWeight:700}}>Crear Factura</h1>
        <InvoiceForm onSubmit={handleSubmit} />
      </div>
    </Layout>
  );
};

export default Crear;
